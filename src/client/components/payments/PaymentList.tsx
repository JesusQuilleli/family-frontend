import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2, CheckCircle2, Clock, Image as ImageIcon } from "lucide-react";

import { getPaymentsByOrderAction } from "@/client/actions/payments/get-payments";
import { getImageUrl } from "@/helpers/get-image-url";
import { ImageWithLoader } from "@/components/common/ImageWithLoader";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
   Dialog,
   DialogContent,
   DialogTrigger,
} from "@/components/ui/dialog";

interface PaymentListProps {
   orderId: string;
}

export const PaymentList = ({ orderId }: PaymentListProps) => {
   const { data: payments, isLoading } = useQuery({
      queryKey: ["order-payments", orderId],
      queryFn: () => getPaymentsByOrderAction(orderId),
   });

   if (isLoading) {
      return (
         <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
         </div>
      );
   }

   if (!payments || payments.length === 0) {
      return (
         <div className="text-center py-4 text-muted-foreground text-sm">
            No hay pagos registrados para este pedido.
         </div>
      );
   }

   return (
      <ScrollArea className="h-[300px] pr-4">
         <div className="space-y-3">
            {payments.map((payment) => (
               <div
                  key={payment._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border rounded-lg p-3 bg-card"
               >
                  <div className="flex items-start gap-3">
                     <div className="flex-shrink-0">
                        {payment.image_checking ? (
                           <Dialog>
                              <DialogTrigger asChild>
                                 <div className="relative group cursor-pointer">
                                    <ImageWithLoader
                                       src={getImageUrl(payment.image_checking)}
                                       alt="Comprobante"
                                       className="w-12 h-12 rounded-md object-cover bg-muted border"
                                       fallbackSrc="/not-image.jpg"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                                       <ImageIcon className="w-4 h-4 text-white" />
                                    </div>
                                 </div>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none">
                                 <ImageWithLoader
                                    src={getImageUrl(payment.image_checking)}
                                    alt="Comprobante completo"
                                    className="w-full h-auto rounded-lg"
                                    fallbackSrc="/not-image.jpg"
                                 />
                              </DialogContent>
                           </Dialog>
                        ) : (
                           <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center border">
                              <ImageIcon className="w-5 h-5 text-muted-foreground/50" />
                           </div>
                        )}
                     </div>

                     <div className="grid gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                           <span className="font-semibold text-sm">
                              <PriceDisplay price={payment.amount} className="items-start" />
                           </span>
                           <Badge variant="secondary" className="text-[10px] px-1.5 h-5 capitalize">
                              {payment.payment_method}
                           </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                           {format(new Date(payment.payment_date), "PPP p", {
                              locale: es,
                           })}
                        </span>
                        {payment.reference && (
                           <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-1 rounded w-fit">
                              Ref: {payment.reference}
                           </span>
                        )}
                     </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 mt-1 sm:mt-0">
                     <div className="flex items-center gap-1.5">
                        {payment.verified ? (
                           <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-medium">Verificado</span>
                           </div>
                        ) : (
                           <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                              <Clock className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-medium">Pendiente</span>
                           </div>
                        )}
                     </div>


                  </div>
               </div>
            ))}
         </div>
      </ScrollArea>
   );
};
