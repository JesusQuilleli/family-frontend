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

   const form = useForm<PaymentFormValues>({
      resolver: zodResolver(paymentSchema) as any,
      defaultValues: {
         amount: remainingAmount,
         payment_method: "efectivo",
         reference: "",
      },
   });

   useEffect(() => {
      if (tasaBs > 0) {
         const amountInBs = usdToBs(remainingAmount, tasaBs);
         form.setValue("amount", Number(amountInBs.toFixed(2)));
      }
   }, [tasaBs, remainingAmount, form]);



   const onSubmit = async (values: PaymentFormValues) => {
      let amountInUsd = values.amount;

      if (currency === 'VES') {
         amountInUsd = Number((values.amount / tasaBs).toFixed(2));
      }

      if (amountInUsd > remainingAmount + 0.01) { // Small tolerance for rounding
         const maxAmount = currency === 'VES' ? remainingAmount * tasaBs : remainingAmount;
         const currencySymbol = currency === 'VES' ? 'Bs' : '$';

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
