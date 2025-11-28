import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/custom/Header';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryDialog } from '@/components/admin-categories/CategoryDialog';
import { DeleteCategoryDialog } from '@/components/admin-categories/DeleteCategoryDialog';
import { Search } from '@/components/custom/Search';
import { createCategoryAction } from '@/admin/actions/categories/add-category';
import { updateCategoryAction } from '@/admin/actions/categories/update-category';
import { deleteCategoryAction } from '@/admin/actions/categories/delete-category';
import { useSearchParams } from 'react-router';
import { getImageUrl } from '@/helpers/get-image-url';

interface Category {
   _id: string;
   name: string;
   image?: string;
   user_uid: string;
   createdAt: string;
}

export const AdminCategoriesPage = () => {
   const [dialogOpen, setDialogOpen] = useState(false);
   const [editingCategory, setEditingCategory] = useState<Category | null>(null);
   const { toast } = useToast();
   const [searchParams] = useSearchParams();

   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
   const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
   const [isDeleting, setIsDeleting] = useState(false);

   const [initialCategoryName, setInitialCategoryName] = useState('');

   const { data, isLoading, isError, error, refetch } = useCategories();

   console.log(data);

   const currentQuery = searchParams.get('query') || '';

   const handleAddCategory = async (formData: FormData) => {
      try {
         const result = await createCategoryAction(formData);

         if (result.success) {
            toast({
               title: 'Categoría agregada',
               description: 'La categoría ha sido agregada exitosamente.',
            });
            setDialogOpen(false);
            await refetch();
         } else {
            toast({
               title: 'Error',
               description: result.error || 'No se pudo agregar la categoría.',
               variant: 'destructive',
            });
         }
      } catch (error: unknown) {
         toast({
            title: 'Error',
            description: 'No se pudo agregar la categoría.',
            variant: 'destructive',
         });
         console.log(error);
      }
   };

   const handleEditCategory = async (formData: FormData) => {
      if (!editingCategory) return;

      try {
         const result = await updateCategoryAction(editingCategory._id, formData);

         if (result.success) {
            toast({
               title: 'Categoría actualizada',
               description: 'La categoría ha sido actualizada exitosamente.',
            });
            setEditingCategory(null);
            setDialogOpen(false);
            await refetch();
         } else {
            toast({
               title: 'Error',
               description: result.error || 'No se pudo actualizar la categoría.',
               variant: 'destructive',
            });
         }
      } catch (error: unknown) {
         toast({
            title: 'Error',
            description: 'No se pudo actualizar la categoría.',
            variant: 'destructive',
         });
         console.log(error);
      }
   };

   const confirmDeleteCategory = async () => {
      if (!categoryToDelete) return;

      setIsDeleting(true);
      try {
         const result = await deleteCategoryAction(categoryToDelete._id);

         if (result.success) {
            toast({
               title: 'Categoría eliminada',
               description: 'La categoría ha sido eliminada.',
               variant: 'destructive',
            });
            await refetch();
            setDeleteDialogOpen(false);
            setCategoryToDelete(null);
         } else {
            toast({
               title: 'Error',
               description: result.error || 'No se pudo eliminar la categoría.',
               variant: 'destructive',
            });
         }
      } catch (error) {
         toast({
            title: 'Error',
            description: 'No se pudo eliminar la categoría.',
            variant: 'destructive',
         });
         console.log(error);
      } finally {
         setIsDeleting(false);
      }
   };

   const handleDeleteCategory = (category: Category) => {
      setCategoryToDelete(category);
      setDeleteDialogOpen(true);
   };

   const openEditDialog = (category: Category) => {
      setEditingCategory(category);
      setInitialCategoryName('');
      setDialogOpen(true);
   };

   const openAddDialog = (name: string = '') => {
      setEditingCategory(null);
      setInitialCategoryName(name);
      setDialogOpen(true);
   };

   // Loading state
   if (isLoading) {
      return (
         <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card sticky top-0 z-10 shadow-sm">
               <div className="container mx-auto px-4 py-4">
                  <Skeleton className="h-10 w-64" />
                  <Skeleton className="h-4 w-96 mt-2" />
               </div>
            </header>
            <main className="container mx-auto px-4 py-8">
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                     <Skeleton key={i} className="h-48 rounded-lg" />
                  ))}
               </div>
            </main>
         </div>
      );
   }

   // Error state
   if (isError) {
      return (
         <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
               <h2 className="text-2xl font-bold text-destructive">Error al cargar categorías</h2>
               <p className="text-muted-foreground">{error?.message || 'Intenta nuevamente'}</p>
               <Button onClick={() => window.location.reload()}>Recargar</Button>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-background">
         {/* Header */}
         <header className="border-b border-border bg-card sticky top-0 z-10 shadow-sm">
            <div className="container mx-auto px-4 py-4">
               <div className="flex items-center justify-between flex-wrap gap-4">
                  <Header
                     title="Gestión de Categorías"
                     subtitle="Administra las categorías de tus productos"
                  />
                  {currentQuery === '' && (
                     <Button onClick={() => openAddDialog()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Categoría
                     </Button>
                  )}
               </div>
            </div>
         </header>

         <Search categories={[]} />

         {/* Categories Grid */}
         <main className="container mx-auto px-4 py-8">
            {data?.categories.length === 0 ? (
               <div className="text-center py-12">
                  {currentQuery ? (
                     <>
                        <p className="text-muted-foreground text-lg mb-4">
                           No se encontraron resultados para "{currentQuery}"
                        </p>
                        <Button onClick={() => openAddDialog(currentQuery)}>
                           <Plus className="w-4 h-4 mr-2" />
                           Crear categoría "{currentQuery}"
                        </Button>
                     </>
                  ) : (
                     <>
                        <p className="text-muted-foreground text-lg">No tienes categorías registradas</p>
                        <Button onClick={() => openAddDialog()} className="mt-4">
                           <Plus className="w-4 h-4 mr-2" />
                           Crear tu primera categoría
                        </Button>
                     </>
                  )}
               </div>
            ) : (
               <>
                  <div className="mb-6">
                     <span className="text-sm text-muted-foreground">
                        Mostrando {data?.count} categoría{data?.count !== 1 ? 's' : ''}
                     </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                     {data?.categories.map((category) => (
                        <Card key={category._id} className="hover:shadow-lg transition-shadow overflow-hidden p-0 gap-0">
                           <div className="aspect-video w-full relative overflow-hidden bg-secondary/20">
                              {category.image ? (
                                 <img
                                    src={getImageUrl(category.image)}
                                    alt={category.name}
                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                    onError={(e) => {
                                       (e.target as HTMLImageElement).style.display = 'none';
                                       (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                    }}
                                 />
                              ) : null}
                              <div className={`w-full h-full flex items-center justify-center bg-secondary/20 ${category.image ? 'hidden' : ''}`}>
                                 <span className="text-4xl">📦</span>
                              </div>
                           </div>
                           <CardHeader className="p-4 pb-2">
                              <CardTitle className="text-lg">{category.name}</CardTitle>
                           </CardHeader>
                           <CardContent className="p-4 pt-0 pb-2">
                              <p className="text-sm text-muted-foreground">
                                 Creada: {new Date(category.createdAt).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                 })}
                              </p>
                           </CardContent>
                           <CardFooter className="flex gap-2 p-4 pt-0">
                              <Button
                                 variant="outline"
                                 size="sm"
                                 className="flex-1 cursor-pointer"
                                 onClick={() => openEditDialog(category)}
                              >
                                 <Edit className="w-4 h-4 mr-1" />
                                 Editar
                              </Button>
                              <Button
                                 variant="destructive"
                                 size="sm"
                                 className="flex-1 cursor-pointer"
                                 onClick={() => handleDeleteCategory(category)}
                              >
                                 <Trash2 className="w-4 h-4 mr-1" />
                                 Eliminar
                              </Button>
                           </CardFooter>
                        </Card>
                     ))}
                  </div>
               </>
            )}
         </main>

         {/* Category Dialog */}
         <CategoryDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onSave={editingCategory ? handleEditCategory : handleAddCategory}
            editCategory={editingCategory}
            initialName={initialCategoryName}
         />

         <DeleteCategoryDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={confirmDeleteCategory}
            categoryName={categoryToDelete?.name}
            isDeleting={isDeleting}
         />
      </div>
   );
};
