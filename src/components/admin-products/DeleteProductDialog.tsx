import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteProductDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   onConfirm: () => void;
   productName?: string;
   isDeleting?: boolean;
}

export const DeleteProductDialog = ({
   open,
   onOpenChange,
   onConfirm,
   productName,
   isDeleting = false,
}: DeleteProductDialogProps) => {
   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
               <DialogTitle className="flex items-center gap-2 text-destructive">
                  <Trash2 className="w-5 h-5" />
                  Confirmar eliminación
               </DialogTitle>
               <DialogDescription className="pt-2">
                  ¿Estás seguro de que deseas eliminar el producto{" "}
                  {productName && <span className="font-semibold text-foreground">"{productName}"</span>}?
                  <br />
                  <span className="block mt-2 text-xs">
                     Esta acción no se puede deshacer.
                  </span>
               </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
               <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isDeleting}
                  className="cursor-pointer"
               >
                  Cancelar
               </Button>
               <Button
                  variant="destructive"
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="cursor-pointer"
               >
                  {isDeleting ? "Eliminando..." : "Eliminar"}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
};
