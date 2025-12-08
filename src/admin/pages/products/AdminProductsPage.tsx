/* eslint-disable @typescript-eslint/no-unused-vars */

// Libraries and Types
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import type { ProductBackend } from '@/types/products.interfaces';
// Components
import { ProductCard } from '@/components/admin-products/ProductCard';
import { ProductDialog } from '@/components/admin-products/ProductDialog';
import { ProductDetailDialog } from '@/components/admin-products/ProductDetailDialog';
import { ProductListItem } from '@/components/admin-products/ProductListItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/custom/Header';
import { Button } from '@/components/ui/button';
import { Search } from '@/components/custom/Search';
import { DeleteProductDialog } from '@/components/admin-products/DeleteProductDialog';

//Hooks
import { useToast } from '@/hooks/use-toast';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';

//Icons and Loading
import { Plus } from 'lucide-react';
import { createProductAction } from '@/admin/actions/products/add-new-product';
import { updateProductAction } from '@/admin/actions/products/update-product';
import { deleteProductAction } from '@/admin/actions/products/delete-product';
import { LoadingSpinner } from '@/components/admin-products/LoadingSpinner';
import { CustomPagination } from '@/components/custom/CustomPagination';

export const AdminProductsPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductBackend | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductBackend | null>(null);
  const [searchParams] = useSearchParams();
  const [loadingAddProduct, setLoadingAddProduct] = useState(false);
  const { toast } = useToast();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductBackend | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, isFetching, isError, error, refetchProducts } = useProducts();
  const { data: dataCategories } = useCategories();

  //console.log(data);

  const currentQuery = searchParams.get('query') || '';
  const currentCategory = searchParams.get('categoryId') || '';
  const page = searchParams.get('page') || '1';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, currentQuery, currentCategory]);

  const handleAddProduct = async (formData: FormData) => {
    setDialogOpen(false);
    setLoadingAddProduct(true);
    try {
      // Llamar a la acción del servidor
      const result = await createProductAction(formData);

      if (result.success) {
        toast({
          title: 'Producto agregado',
          description: 'El producto ha sido agregado exitosamente.',
        });
        setDialogOpen(false);
        await refetchProducts();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'No se pudo agregar el producto.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo agregar el producto.',
        variant: 'destructive',
      });
    } finally {
      setLoadingAddProduct(false);
    }
  };

  const handleEditProduct = async (formData: FormData) => {
    if (!editingProduct) return;

    try {
      const result = await updateProductAction(
        editingProduct._id,
        formData
      );

      if (result.success) {
        toast({
          title: 'Producto actualizado',
          description: 'El producto ha sido actualizado exitosamente.',
        });
        setEditingProduct(null);
        setDialogOpen(false);
        await refetchProducts();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'No se pudo actualizar el producto.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el producto.',
        variant: 'destructive',
      });
    }
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteProductAction(productToDelete._id);

      if (result.success) {
        toast({
          title: 'Producto eliminado',
          description: 'El producto ha sido eliminado.',
          variant: 'destructive',
        });
        await refetchProducts();
        setDeleteDialogOpen(false);
        setProductToDelete(null);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'No se pudo eliminar el producto.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el producto.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteProduct = (product: ProductBackend) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleViewDetails = (product: ProductBackend) => {
    setSelectedProduct(product);
    setDetailDialogOpen(true);
  };

  const openEditDialog = (product: ProductBackend) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingProduct(null);
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
              <Skeleton key={i} className="h-80 rounded-lg" />
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
          <h2 className="text-2xl font-bold text-destructive">Error al cargar productos</h2>
          <p className="text-muted-foreground">{error?.message || 'Intenta nuevamente'}</p>
          <Button onClick={() => window.location.reload()}>Recargar</Button>
        </div>
      </div>
    );
  }

  return (
    <>

      {loadingAddProduct && (<LoadingSpinner title='Creando Producto.' />)}

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <Header
                title="Gestión de Productos"
                subtitle="Administra los Productos de tu negocio."
              />
              {(currentQuery || currentCategory === '') && (<Button onClick={openAddDialog}>
                <Plus className="w-4 h-4 mr-2" />
                {loadingAddProduct ? 'Agregando...' : 'Agregar Producto'}
              </Button>)}

            </div>
          </div>
        </header>

        <Search categories={dataCategories?.categories || []} />

        {/* Products Grid */}
        <main className="container mx-auto px-4 py-8">
          {data?.products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No tienes productos registrados</p>
              <Button onClick={openAddDialog} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Crear tu primer producto
              </Button>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="mb-6 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Mostrando {data?.count} de {data?.totalProducts} productos
                </span>
                <span className="text-sm text-muted-foreground">
                  Página {data?.currentPage} de {data?.totalPages}
                </span>
              </div>

              {/* Products Grid */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data?.products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onEdit={() => openEditDialog(product)}
                    onDelete={() => handleDeleteProduct(product)}
                    onViewDetails={() => handleViewDetails(product)}
                    inCart={false}
                    onAddToCart={() => { }}
                    onRemoveFromCart={() => { }}
                  />
                ))}
              </div>

              <div className="block sm:hidden border rounded-md divide-y">
                {data?.products.map((product) => (
                  <ProductListItem
                    key={product._id}
                    product={{
                      _id: product._id,
                      name: product.name,
                      sale_price: product.sale_price,
                      stock: product.stock,
                      category_id: product.category_id,
                      user_uid: product.user_uid,
                      description: product.description,
                      purchase_price: product.purchase_price,
                      image: product.image,
                      __v: product.__v,
                    }}
                    onEdit={() => openEditDialog(product)}
                    onDelete={() => handleDeleteProduct(product)}
                    onViewDetails={() => handleViewDetails(product)}
                  />
                ))}
              </div>

            </>
          )}

          {/* Paginación */}
          {data && data.totalPages > 1 && (
            <CustomPagination
              totalPages={data.totalPages}
              isLoading={isFetching}
            />
          )}

        </main>

        {/* ✅ CORREGIDO: Product Dialog */}
        <ProductDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={editingProduct ? handleEditProduct : handleAddProduct}
          editProduct={editingProduct}
        />

        {/* ✅ CORREGIDO: Product Detail Dialog */}
        <ProductDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          product={selectedProduct}
          inCart={false}
          onAddToCart={() => { }}
          onRemoveFromCart={() => { }}
        />

        <DeleteProductDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDeleteProduct}
          productName={productToDelete?.name}
          isDeleting={isDeleting}
        />
      </div>
    </>
  );
};