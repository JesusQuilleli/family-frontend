import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ProductBackend } from '@/interfaces/products.response';
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
import { Checkbox } from '@/components/ui/checkbox';
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
import { ScrollArea } from '@/components/ui/scroll-area';

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
      categories: [],
    },
  });

  // Resetear formulario cuando se abre/cierra o cambia el producto a editar
  useEffect(() => {
    if (open) {
      setImageRemoved(false);
      if (editProduct) {
        // Lógica para poblar categories: first try array, then legacy single ID
        let initialCategories: string[] = [];

        if (editProduct.categories && editProduct.categories.length > 0) {
          initialCategories = editProduct.categories.map(c => {
            if (typeof c === 'string') return c;
            return (c as any)._id || String(c);
          });
        } else if (editProduct.category_id) {
          initialCategories = [typeof editProduct.category_id === 'object' ? (editProduct.category_id as any)._id : editProduct.category_id];
        }

        form.reset({
          name: editProduct.name || '',
          description: editProduct.description || '',
          purchase_price: editProduct.purchase_price?.toString() || '0',
          sale_price: editProduct.sale_price?.toString() || '0',
          stock: editProduct.stock?.toString() || '0',
          category_id: '', // Deprecated field empty
          categories: initialCategories,
        });
      } else {
        form.reset({
          name: '',
          description: '',
          purchase_price: '0',
          sale_price: '0',
          stock: '0',
          category_id: '',
          categories: [],
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

      // Enviar array de categorías. FormData repite key para arrays o JSON stringify.
      // Backend espera categories como array. Si usamos multer o body-parser standard,
      // enviar multiple keys 'categories[]' o 'categories' suele funcionar.
      // Pero products-service espera el objeto req.body.categories DIRECTAMENTE si es JSON.
      // Al ser FormData con archivo, multer parsea fields.
      // Si enviamos multiple 'categories', multer/express lo convierte a array si hay varios, o string si hay uno.
      // Lo mejor es enviar cada uno.
      data.categories.forEach(catId => {
        formData.append('categories', catId);
      });

      // Agregar legacy category_id (el primero) para compatibilidad si fuera necesario, 
      // pero el backend ya maneja 'categories'.
      if (data.categories.length > 0) {
        formData.append('category_id', data.categories[0]);
      }

      // Agregar imagen si existe
      if (data.image && data.image.length > 0) {
        formData.append('image', data.image[0]);
      } else if (imageRemoved) {
        // console.log('Appending delete_image flag');
        formData.append('delete_image', 'true');
      }

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

              {/* Categorías (Multi-select) */}
              <FormField
                control={form.control}
                name="categories"
                render={() => (
                  <FormItem>
                    <FormLabel>Categorías *</FormLabel>
                    {loadingCategories ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Cargando categorías...</span>
                      </div>
                    ) : (
                      <div className="border rounded-md p-4">
                        <ScrollArea className="h-[200px] w-full pr-4">
                          <div className="space-y-4">
                            {(() => {
                              // Group categories manually
                              const parents = categoriesData?.categories.filter(c => !c.parent_id) || [];
                              const children = categoriesData?.categories.filter(c => c.parent_id) || [];

                              // Provide a 'Sin Categoría' bucket if needed for older data? No, new data structure.
                              // Just iterate parents first.
                              return (
                                <>
                                  {/* Root Categories */}
                                  {parents.map(parent => {
                                    const myChildren = children.filter(c => {
                                      if (typeof c.parent_id === 'object' && c.parent_id) return c.parent_id._id === parent._id;
                                      return c.parent_id === parent._id;
                                    });

                                    return (
                                      <div key={parent._id} className="space-y-2">
                                        <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                                          {/* Parent Checkbox - Auto Selects All Children? Optional feature. For now just category itself. */}
                                          <FormField
                                            control={form.control}
                                            name="categories"
                                            render={({ field }) => (
                                              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                                <FormControl>
                                                  <Checkbox
                                                    checked={field.value?.includes(parent._id)}
                                                    onCheckedChange={(checked) => {
                                                      return checked
                                                        ? field.onChange([...field.value, parent._id])
                                                        : field.onChange(field.value?.filter(v => v !== parent._id))
                                                    }}
                                                  />
                                                </FormControl>
                                                <FormLabel className="text-sm font-semibold cursor-pointer">
                                                  {parent.name}
                                                </FormLabel>
                                              </FormItem>
                                            )}
                                          />
                                        </h4>

                                        {/* Children */}
                                        <div className="ml-6 grid grid-cols-1 gap-1 border-l-2 pl-2 border-border">
                                          {myChildren.map(child => (
                                            <FormField
                                              key={child._id}
                                              control={form.control}
                                              name="categories"
                                              render={({ field }) => (
                                                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                                  <FormControl>
                                                    <Checkbox
                                                      checked={field.value?.includes(child._id)}
                                                      onCheckedChange={(checked) => {
                                                        return checked
                                                          ? field.onChange([...field.value, child._id])
                                                          : field.onChange(field.value?.filter(v => v !== child._id))
                                                      }}
                                                    />
                                                  </FormControl>
                                                  <FormLabel className="text-sm font-normal cursor-pointer">
                                                    {child.name}
                                                  </FormLabel>
                                                </FormItem>
                                              )}
                                            />
                                          ))}
                                          {myChildren.length === 0 && (
                                            <p className="text-xs text-muted-foreground italic">Sin subcategorías</p>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}

                                  {/* Orphaned Children (Should ideally not happen if logic is strict, but safe fallback) */}
                                  {children.filter(c => {
                                    const parentId = typeof c.parent_id === 'object' && c.parent_id ? c.parent_id._id : c.parent_id;
                                    return !parents.find(p => p._id === parentId);
                                  }).length > 0 && (
                                      <div className="space-y-2 mt-4">
                                        <h4 className="font-semibold text-sm text-destructive">Sin Padre Asignado / Otros</h4>
                                        <div className="ml-6 grid grid-cols-1 gap-1">
                                          {children.filter(c => {
                                            const parentId = typeof c.parent_id === 'object' && c.parent_id ? c.parent_id._id : c.parent_id;
                                            return !parents.find(p => p._id === parentId);
                                          }).map(child => (
                                            <FormField
                                              key={child._id}
                                              control={form.control}
                                              name="categories"
                                              render={({ field }) => (
                                                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                                  <FormControl>
                                                    <Checkbox
                                                      checked={field.value?.includes(child._id)}
                                                      onCheckedChange={(checked) => {
                                                        return checked
                                                          ? field.onChange([...field.value, child._id])
                                                          : field.onChange(field.value?.filter(v => v !== child._id))
                                                      }}
                                                    />
                                                  </FormControl>
                                                  <FormLabel className="text-sm font-normal">
                                                    {child.name}
                                                  </FormLabel>
                                                </FormItem>
                                              )}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                </>
                              );
                            })()}
                          </div>
                        </ScrollArea>
                      </div>
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