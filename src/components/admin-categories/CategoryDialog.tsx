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
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select';
import { useCategories } from '@/hooks/useCategories';
import { Loader2 } from 'lucide-react';
import { ImageUpload } from '@/components/common/ImageUpload';
import { type Category } from '@/actions/get-categories';



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
   const [selectedImage, setSelectedImage] = useState<File | null>(null);
   const [imageRemoved, setImageRemoved] = useState(false);

   const { data: categoriesData } = useCategories();

   const form = useForm<CategoryFormData>({
      resolver: zodResolver(categorySchema),
      defaultValues: {
         name: '',
         parent_id: null,
      },
   });

   // Resetear formulario cuando se abre/cierra o cambia la categoría a editar
   useEffect(() => {
      if (open) {
         setSelectedImage(null);
         setImageRemoved(false);
         if (editCategory) {
            // Check parent_id type. If object, take _id
            let parentIdValue = null;
            if (editCategory.parent_id) {
               parentIdValue = typeof editCategory.parent_id === 'object'
                  ? (editCategory.parent_id as any)._id
                  : editCategory.parent_id;
            }

            form.reset({
               name: editCategory.name || '',
               parent_id: parentIdValue,
            });
         } else {
            form.reset({
               name: initialName || '',
               parent_id: null,
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

         if (data.parent_id && data.parent_id !== 'null') {
            formData.append('parent_id', data.parent_id);
         }

         if (selectedImage) {
            formData.append('image', selectedImage);
         } else if (imageRemoved) {
            formData.append('delete_image', 'true');
         }

         await onSave(formData);
         form.reset();
         setSelectedImage(null);
         setImageRemoved(false);
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
                           ? 'Modifica el nombre o imagen de la categoría'
                           : 'Ingresa los datos de la nueva categoría'}
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
                                    maxLength={30}
                                 />
                              </FormControl>
                              <FormDescription>
                                 El nombre debe ser único y descriptivo
                              </FormDescription>
                              <FormMessage />
                           </FormItem>
                        )}
                     />

                     <div className="space-y-2">
                        <FormField
                           control={form.control}
                           name="parent_id"
                           render={({ field }) => (
                              <FormItem>
                                 <FormLabel>Categoría Padre (Opcional)</FormLabel>
                                 <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value || undefined}
                                    value={field.value || undefined}
                                 >
                                    <FormControl>
                                       <SelectTrigger>
                                          <SelectValue placeholder="Selecciona una categoría padre" />
                                       </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                       <SelectItem value="null">Ninguna (Categoría Principal)</SelectItem>
                                       {categoriesData?.categories
                                          .filter(c => c._id !== editCategory?._id) // Prevent self-parenting
                                          .map((category) => (
                                             <SelectItem key={category._id} value={category._id}>
                                                {category.name}
                                             </SelectItem>
                                          ))}
                                    </SelectContent>
                                 </Select>
                                 <FormDescription>
                                    Si seleccionas una, esta será una subcategoría.
                                 </FormDescription>
                                 <FormMessage />
                              </FormItem>
                           )}
                        />
                     </div>

                     <div className="space-y-2">
                        <FormLabel>Imagen (Opcional)</FormLabel>
                        <ImageUpload
                           onFileSelect={(file) => {
                              setSelectedImage(file || null);
                              if (!file) setImageRemoved(true);
                              else setImageRemoved(false);
                           }}
                           value={editCategory?.image}
                        />
                     </div>
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