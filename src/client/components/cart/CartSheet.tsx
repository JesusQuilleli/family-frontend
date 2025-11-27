import {
   Sheet,
   SheetContent,
   SheetHeader,
   SheetTitle,
   SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, ShoppingCart, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { formatCurrency } from "@/helpers/format-currency";
import { useState } from "react";
import { createOrder } from "@/client/actions/orders/create-order";
import { useToast } from "@/hooks/use-toast";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import { getImageUrl } from "@/helpers/get-image-url";

export const CartSheet = () => {
   const [isLoading, setIsLoading] = useState(false);
   const { toast } = useToast();
   const {
      items,
      isOpen,
      setIsOpen,
      removeItem,
      updateQuantity,
      getTotal,
      clearCart
   } = useCartStore();

   const handleCreateOrder = async () => {
      if (items.length === 0) return;

      setIsLoading(true);
      try {
         const payload = {
            products: items.map(item => ({
               product_uid: item.product._id,
               stock: item.quantity,
               sale_price: item.product.sale_price
            })),
            total: getTotal()
         };

         const response = await createOrder(payload);

         if (response.ok) {
            clearCart();
            setIsOpen(false);
            toast({
               title: "¡Pedido realizado!",
               description: response.msg || "Tu pedido ha sido creado exitosamente.",
               variant: "default",
            });
         } else {
            toast({
               title: "Error al crear pedido",
               description: response.msg || "Hubo un problema al procesar tu pedido.",
               variant: "destructive",
            });
         }
      } catch (error) {
         console.error(error);
         toast({
            title: "Error",
            description: "Ocurrió un error inesperado. Inténtalo de nuevo.",
            variant: "destructive",
         });
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
         <SheetContent className="w-full sm:max-w-md flex flex-col p-0 gap-0 border-l-2">
            <SheetHeader className="px-6 py-4 border-b bg-muted/10">
               <SheetTitle className="flex items-center gap-2 text-xl font-bold text-primary">
                  <ShoppingCart className="w-5 h-5" />
                  Tu Carrito
               </SheetTitle>
               <SheetDescription className="text-sm text-muted-foreground">
                  Revisa los productos que has agregado antes de finalizar tu compra.
               </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-hidden relative">
               {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-6 p-8 text-center">
                     <div className="bg-muted/30 p-6 rounded-full">
                        <ShoppingCart className="w-12 h-12 opacity-20" />
                     </div>
                     <div className="space-y-2">
                        <h3 className="font-semibold text-lg text-foreground">Tu carrito está vacío</h3>
                        <p className="text-sm max-w-[200px] mx-auto">Parece que aún no has agregado ningún producto.</p>
                     </div>
                     <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        className="mt-4"
                     >
                        Seguir comprando
                     </Button>
                  </div>
               ) : (
                  <ScrollArea className="h-full">
                     <div className="p-6 space-y-4">
                        {items.map((item) => (
                           <div
                              key={item.product._id}
                              className="flex gap-4 p-3 rounded-xl border bg-card hover:shadow-sm transition-shadow duration-200"
                           >
                              <div className="h-24 w-24 rounded-lg border overflow-hidden bg-muted shrink-0 relative group">
                                 {item.product.image ? (
                                    <img
                                       src={getImageUrl(item.product.image)}
                                       alt={item.product.name}
                                       className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                       onError={(e) => { e.currentTarget.src = '/not-image.jpg'; }}
                                    />
                                 ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-secondary">
                                       <ShoppingCart className="h-8 w-8 text-muted-foreground opacity-50" />
                                    </div>
                                 )}
                              </div>
                              <div className="flex-1 flex flex-col justify-between py-1">
                                 <div className="space-y-1">
                                    <h4 className="font-semibold line-clamp-1 text-foreground">{item.product.name}</h4>
                                    <PriceDisplay price={item.product.sale_price} className="text-sm font-medium text-primary" />
                                 </div>

                                 <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                                       <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 hover:bg-background rounded-md"
                                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                          disabled={item.quantity <= 1}
                                       >
                                          <Minus className="h-3 w-3" />
                                       </Button>
                                       <span className="w-8 text-center text-sm font-medium tabular-nums">
                                          {item.quantity}
                                       </span>
                                       <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 hover:bg-background rounded-md"
                                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                          disabled={item.quantity >= item.product.stock}
                                       >
                                          <Plus className="h-3 w-3" />
                                       </Button>
                                    </div>

                                    <Button
                                       variant="ghost"
                                       size="icon"
                                       className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                                       onClick={() => removeItem(item.product._id)}
                                    >
                                       <Trash2 className="h-4 w-4" />
                                    </Button>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </ScrollArea>
               )}
            </div>

            {items.length > 0 && (
               <div className="p-6 bg-muted/5 border-t mt-auto">
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                           <span>Subtotal</span>
                           <span>{formatCurrency(getTotal())}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between font-bold text-lg">
                           <span>Total</span>
                           <PriceDisplay price={getTotal()} className="items-end" />
                        </div>
                     </div>
                     <Button
                        className="w-full group"
                        size="lg"
                        onClick={handleCreateOrder}
                        disabled={isLoading}
                     >
                        {isLoading ? (
                           <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Procesando...
                           </>
                        ) : (
                           <>
                              Proceder a realizar el pedido
                              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                           </>
                        )}
                     </Button>
                  </div>
               </div>
            )}
         </SheetContent>
      </Sheet>
   );
};
