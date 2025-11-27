// Ruta: src/components/admin-categories/CategoryDialog.tsx

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categorySchema, type CategoryFormData } from '@/schemas/categories.schema';
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
   FormDescription,
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

interface Category {
   _id: string;
   name: string;
}

interface CategoryDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   onSave: (category: FormData) => Promise<void>;
   editCategory?: Category | null;
   initialName?: string;
}

export const CategoryDialog = ({
   open,
   onOpenChange,
   onSave,
   editCategory,
   initialName = '',
}: CategoryDialogProps) => {
   const [isSubmitting, setIsSubmitting] = useState(false);

   const form = useForm<CategoryFormData>({
      resolver: zodResolver(categorySchema),
      defaultValues: {
         name: '',
      },
   });

   // Resetear formulario cuando se abre/cierra o cambia la categoría a editar
   useEffect(() => {
      if (open) {
         if (editCategory) {
            form.reset({
               name: editCategory.name || '',
            });
         } else {
            form.reset({
               name: initialName || '',
            });
         }
      }
   }, [open, editCategory, initialName, form]);

   const onSubmit = async (data: CategoryFormData) => {
      setIsSubmitting(true);

      try {
         // Crear FormData para enviar al backend
         const formData = new FormData();
         formData.append('name', data.name.trim());

         await onSave(formData);
         form.reset();
      } catch (error) {
         console.error('Error al guardar categoría:', error);
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent className="sm:max-w-[425px]">
            <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)}>
                  <DialogHeader>
                     <DialogTitle>
                        {editCategory ? 'Editar Categoría' : 'Agregar Nueva Categoría'}
                     </DialogTitle>
                     <DialogDescription>
                        {editCategory
                           ? 'Modifica el nombre de la categoría'
                           : 'Ingresa el nombre de la nueva categoría'}
                     </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                     <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Nombre de la categoría *</FormLabel>
                              <FormControl>
                                 <Input
                                    placeholder="Ej: Electrónica, Ropa, Alimentos..."
                                    {...field}
                                    autoFocus
                                 />
                              </FormControl>
                              <FormDescription>
                                 El nombre debe ser único y descriptivo
                              </FormDescription>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                  </div>

                  <DialogFooter>
                     <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                     >
                        Cancelar
                     </Button>
                     <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                           <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Guardando...
                           </>
                        ) : (
                           editCategory ? 'Guardar cambios' : 'Agregar categoría'
                        )}
                     </Button>
                  </DialogFooter>
               </form>
            </Form>
         </DialogContent>
      </Dialog>
   );
};