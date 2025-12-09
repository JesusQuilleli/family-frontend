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
import { formatCurrencyPesos } from "@/helpers/format-currency";

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
      // Calculate initial amount in Bs
      if (clientCurrency === 'COP' && tasaCopToBs > 0) {
         // Cross conversion: USD -> COP -> Bs
         const tasaPesos = user?.exchangeRates?.tasaPesos || 0;
         const amountInCop = remainingAmount * tasaPesos;
         const amountInBs = amountInCop / tasaCopToBs;
         form.setValue("amount", Number(amountInBs.toFixed(2)));
      } else if (tasaBs > 0) {
         // Direct conversion: USD -> Bs
         const amountInBs = usdToBs(remainingAmount, tasaBs);
         form.setValue("amount", Number(amountInBs.toFixed(2)));
      }
   }, [tasaBs, tasaCopToBs, clientCurrency, remainingAmount, form, user?.exchangeRates?.tasaPesos]);

   const onSubmit = async (values: PaymentFormValues) => {
      let amountInUsd = values.amount;
      const amount = Number(values.amount); // Input in Bs

      // Conversion logic to save in USD based on input Bs
      if (clientCurrency === 'COP' && tasaCopToBs > 0) {
         // Bs -> COP -> USD
         const tasaPesos = user?.exchangeRates?.tasaPesos || 1;
         const amountInCop = amount * tasaCopToBs;
         amountInUsd = amountInCop / tasaPesos;
      } else if (tasaBs > 0) {
         // Bs -> USD
         amountInUsd = Number((amount / tasaBs).toFixed(6));
      }

      const tolerance = 0.01; // Tighter tolerance (1 cent USD)

      // Strict validation for COP to avoid "rounding" allowances visible to user
      if (clientCurrency === 'COP' && tasaCopToBs > 0) {
         const tasaPesos = user?.exchangeRates?.tasaPesos || 0;
         const maxCop = remainingAmount * tasaPesos;
         const currentCop = amount * tasaCopToBs;

         if (currentCop > maxCop + 10) { // Tolerance of 10 COP (very small)
            form.setError("amount", {
               type: "manual",
               message: `El monto no puede exceder el restante (${formatCurrencyPesos(maxCop)} COP)`,
            });
            return;
         }
      } else if (amountInUsd > remainingAmount + tolerance) {
         let maxAmount = 0;
         let currencySymbol = 'Bs';

         maxAmount = remainingAmount * tasaBs;

         form.setError("amount", {
            type: "manual",
            message: `El monto no puede exceder el restante (${maxAmount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencySymbol})`,
         });
         return;
      }

      if (values.payment_method !== 'efectivo' && !values.image) {
         toast.error("Debes subir una imagen del comprobante");
         return;
      }

      try {
         setIsLoading(true);
         const formData = new FormData();

         formData.append("amount", amountInUsd.toString());
         formData.append("payment_method", values.payment_method);
         formData.append("original_amount", values.amount.toString());

         // Always 'VES' because input is in Bs, unless backend needs to know it was derived from COP logic?
         // Original code sent 'COP' if clientCurrency was COP.
         // But "original_amount" is now sending values in Bs.
         // If we send 'COP', backend might think original_amount is in COP?
         // Let's check logic:
         // If we input 2916 Bs. Submit with original_currency 'COP'. 
         // Backend might treat 2916 as COP? That would be wrong.
         // So if input is Bs, original_currency should be VES/Bs.

         const originalCurrency = 'VES';
         // Wait, if the user sees COP ref, maybe backend wants to track COP?
         // But the actual input is Bs. Let's stick to VES to be safe with the amount value.
         // Actually, let's keep it VES since the user is "registering in bolivares".

         formData.append("original_currency", originalCurrency);

         if (values.reference) formData.append("reference", values.reference);
         if (values.image) formData.append("receipt", values.image);

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

   // Calculate reference amount in COP if applicable
   const amount = form.watch("amount");
   const showCopReference = clientCurrency === 'COP' && tasaCopToBs > 0;
   const copReferenceAmount = showCopReference ? (Number(amount || 0) * tasaCopToBs) : 0;

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
                           <div className="flex flex-col gap-1">
                              <Input
                                 type="number"
                                 placeholder="0.00"
                                 {...field}
                                 step="0.01"
                              />
                              {showCopReference && (
                                 <div className="text-xs text-muted-foreground font-medium text-orange-600">
                                    Equivale a: {formatCurrencyPesos(copReferenceAmount)} COP
                                 </div>
                              )}
                           </div>
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
                  label={form.watch("payment_method") === "efectivo" ? "Comprobante (Opcional)" : "Comprobante de pago"}
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
