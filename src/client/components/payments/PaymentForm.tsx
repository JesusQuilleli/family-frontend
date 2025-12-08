import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { createPaymentAction } from "@/client/actions/payments/create-payment";
import { useProfile } from "@/hooks/useProfile";
import { usdToBs } from "@/helpers/converts.prices.bs";
import { ImageUpload } from "@/components/common/ImageUpload";

const PAYMENT_METHODS = ["efectivo", "transferencia"] as const;

const paymentSchema = z.object({
   amount: z.coerce
      .number()
      .min(1, "El monto debe ser mayor a 0"),
   payment_method: z.enum(PAYMENT_METHODS),
   reference: z.string().optional(),
   image: z.any().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
   orderId: string;
   remainingAmount: number;
   onSuccess?: () => void;
}

export const PaymentForm = ({ orderId, remainingAmount, onSuccess }: PaymentFormProps) => {
   const [isLoading, setIsLoading] = useState(false);
   const [currency] = useState<'VES'>('VES');
   const queryClient = useQueryClient();

   const { user } = useProfile();
   const tasaBs = user?.exchangeRates?.tasaBs || 0;
   const tasaCopToBs = user?.exchangeRates?.tasaCopToBs || 0;
   const clientCurrency = user?.exchangeRates?.clientCurrency || 'VES';

   const form = useForm<PaymentFormValues>({
      resolver: zodResolver(paymentSchema) as any,
      defaultValues: {
         amount: remainingAmount,
         payment_method: "efectivo",
         reference: "",
      },
   });

   useEffect(() => {
      if (clientCurrency === 'COP' && tasaCopToBs > 0) {
         // remainingAmount comes in COP (because backend sends it based on order currency which is likely calculated/stored)
         // ACTUALLY: we need to be careful. The Order typically stores values in USD or Base. 
         // Let's assume remainingAmount passed to this component is in the currency of the Order.
         // If Order was created when configured in COP, amounts might be in USD internally but displayed in COP?
         // Checking OrderDetailsDialog: PriceDisplay is used for 'total' and 'remaining'.
         // PriceDisplay takes 'price' which is usually USD.
         // So remainingAmount is likely in USD.

         // WAIT: If remainingAmount is in USD.
         // If clientCurrency is COP.
         // We want to calculate Bs.
         // Path A: USD -> COP -> Bs. (USD * TasaPesos) / TasaCopToBs.
         // Path B: USD -> Bs. (USD * TasaBs).

         // The requirement is: "el debe 35.000 COP debe cancelar en total 2.916,67"
         // This implies: PriceInCop / TasaCopToBs.

         // We need to know 'remainingAmount' in COP first.
         const tasaPesos = user?.exchangeRates?.tasaPesos || 0;
         const amountInCop = remainingAmount * tasaPesos;
         const amountInBs = amountInCop / tasaCopToBs;

         form.setValue("amount", Number(amountInBs.toFixed(2)));
      } else if (tasaBs > 0) {
         const amountInBs = usdToBs(remainingAmount, tasaBs);
         form.setValue("amount", Number(amountInBs.toFixed(2)));
      }
   }, [tasaBs, tasaCopToBs, clientCurrency, remainingAmount, form, user?.exchangeRates?.tasaPesos]);

   const onSubmit = async (values: PaymentFormValues) => {
      let amountInUsd = values.amount;

      // Conversion logic to save in USD (Backend expects USD likely)
      if (clientCurrency === 'COP' && tasaCopToBs > 0) {
         // Input is in Bs. We need to convert back to USD to store/validate against remainingAmount (USD).
         // Bs * TasaCopToBs = COP.
         // COP / TasaPesos = USD.
         const tasaPesos = user?.exchangeRates?.tasaPesos || 1;
         const amountInCop = values.amount * tasaCopToBs;
         amountInUsd = amountInCop / tasaPesos;
      } else if (tasaBs > 0) {
         amountInUsd = Number((values.amount / tasaBs).toFixed(6));
      }

      if (amountInUsd > remainingAmount + 0.01) { // Small tolerance for rounding
         let maxAmount = 0;
         let currencySymbol = 'Bs';

         if (clientCurrency === 'COP' && tasaCopToBs > 0) {
            const tasaPesos = user?.exchangeRates?.tasaPesos || 0;
            const maxCop = remainingAmount * tasaPesos;
            maxAmount = maxCop / tasaCopToBs;
         } else {
            maxAmount = remainingAmount * tasaBs;
         }

         form.setError("amount", {
            type: "manual",
            message: `El monto no puede exceder el restante (${maxAmount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencySymbol})`,
         });
         return;
      }

      if (!values.image) {
         toast.error("Debes subir una imagen del comprobante");
         return;
      }

      try {
         setIsLoading(true);
         const formData = new FormData();
         formData.append("amount", amountInUsd.toString());
         formData.append("payment_method", values.payment_method);
         if (values.reference) formData.append("reference", values.reference);
         formData.append("receipt", values.image);

         await createPaymentAction(orderId, formData);
         toast.success("Pago registrado exitosamente");
         queryClient.invalidateQueries({ queryKey: ["client-orders"] });
         queryClient.invalidateQueries({ queryKey: ["order-payments", orderId] });
         form.reset();
         onSuccess?.();
      } catch (error) {
         toast.error("Error al registrar el pago");
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Monto a pagar (Bs)</FormLabel>
                        <FormControl>
                           <Input
                              type="number"
                              placeholder="0.00"
                              {...field}
                              step="0.01"
                           />
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />

               <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Método de pago</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                           <FormControl>
                              <SelectTrigger>
                                 <SelectValue placeholder="Selecciona un método" />
                              </SelectTrigger>
                           </FormControl>
                           <SelectContent>
                              {PAYMENT_METHODS.map((method) => (
                                 <SelectItem key={method} value={method}>
                                    {method.charAt(0).toUpperCase() + method.slice(1)}
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                        <FormMessage />
                     </FormItem>
                  )}
               />
            </div>

            <FormField
               control={form.control}
               name="reference"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>Referencia (Opcional)</FormLabel>
                     <FormControl>
                        <Input placeholder="Ej: #123456" {...field} />
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
            />

            <div className="space-y-2">
               <ImageUpload
                  label="Comprobante de pago"
                  onFileSelect={(file) => {
                     form.setValue("image", file);
                  }}
               />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
               {isLoading ? (
                  <>
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     Registrando...
                  </>
               ) : (
                  "Registrar Pago"
               )}
            </Button>
         </form>
      </Form>
   );
};
