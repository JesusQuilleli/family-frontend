import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ProductBackend } from '@/types/products.interfaces';
import { productSchema, type ProductFormData } from '@/schemas/product.schema';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCategories } from '@/hooks/useCategories';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ImageUpload } from '@/components/common/ImageUpload';

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (product: FormData) => Promise<void>;
  editProduct?: Partial<ProductBackend> | null;
}

export const ProductDialog = ({
  open,
  onOpenChange,
  onSave,
  editProduct,
}: ProductDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: categoriesData, isLoading: loadingCategories } = useCategories();
  const [imageRemoved, setImageRemoved] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      purchase_price: '0',
      sale_price: '0',
      stock: '0',
      category_id: '',
    },
  });

  // Resetear formulario cuando se abre/cierra o cambia el producto a editar
  useEffect(() => {
    if (open) {
      setImageRemoved(false);
      if (editProduct) {
        const categoryId = typeof editProduct.category_id === 'object'
          ? editProduct.category_id?._id || ''
          : editProduct.category_id || '';

        form.reset({
          name: editProduct.name || '',
          description: editProduct.description || '',
          purchase_price: editProduct.purchase_price?.toString() || '0',
          sale_price: editProduct.sale_price?.toString() || '0',
          stock: editProduct.stock?.toString() || '0',
          category_id: categoryId,
        });
      } else {
        form.reset({
          name: '',
          description: '',
          purchase_price: '0',
          sale_price: '0',
          stock: '0',
          category_id: '',
        });
      }
    }
  }, [open, editProduct, form]);

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);

    try {
      // Crear FormData para enviar al backend
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('purchase_price', data.purchase_price.toString());
      formData.append('sale_price', data.sale_price.toString());
      formData.append('stock', data.stock.toString());
      formData.append('category_id', data.category_id);

      // Agregar imagen si existe
      if (data.image && data.image.length > 0) {
        formData.append('image', data.image[0]);
      } else if (imageRemoved) {
        // console.log('Appending delete_image flag');
        formData.append('delete_image', 'true');
      }

      // Log FormData contents
      // for (let [key, value] of formData.entries()) {
      //   console.log(`${key}: ${value}`);
      // }

      await onSave(formData);
      form.reset();
      setImageRemoved(false);
    } catch (error) {
      console.error('Error al guardar producto:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calcular ganancia en tiempo real
  const watchPurchasePrice = form.watch('purchase_price');
  const watchSalePrice = form.watch('sale_price');

  const profit = Number(watchSalePrice) - Number(watchPurchasePrice);
  const profitPercentage = Number(watchPurchasePrice) > 0
    ? (profit / Number(watchPurchasePrice)) * 100
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                {editProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
              </DialogTitle>
              <DialogDescription>
                {editProduct
                  ? 'Modifica los detalles del producto'
                  : 'Completa la información del nuevo producto'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Nombre */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del producto *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Laptop Dell Inspiron"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Descripción */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe las características del producto..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Categoría */}
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría *</FormLabel>
                    {loadingCategories ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Cargando categorías...</span>
                      </div>
                    ) : (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoriesData?.categories.map((category) => (
                            <SelectItem key={category._id} value={category._id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Precios y Stock */}
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="purchase_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio Compra ($) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sale_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio Venta ($) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Ganancia estimada */}
              {watchPurchasePrice && watchSalePrice && profit >= 0 && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Ganancia estimada:{' '}
                    <span className="text-green-600 font-semibold">
                      ${profit.toFixed(2)}
                    </span>
                    {' '}({profitPercentage.toFixed(0)}%)
                  </p>
                </div>
              )}

              {/* Imagen */}
              <FormField
                control={form.control}
                name="image"
                render={({ field: { onChange } }) => (
                  <FormItem>
                    <FormControl>
                      <ImageUpload
                        value={editProduct?.image}
                        onFileSelect={(file) => {
                          // Si hay archivo, lo asignamos al array que espera zod/backend
                          if (file) {
                            onChange([file]);
                            setImageRemoved(false);
                          } else {
                            onChange(undefined);
                            setImageRemoved(true);
                          }
                        }}
                      />
                    </FormControl>
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
                  editProduct ? 'Guardar cambios' : 'Agregar producto'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};