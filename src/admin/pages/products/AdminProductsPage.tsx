/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/components-global-products/ProductCard';
import { ProductDialog } from '@/components/components-global-products/ProductDialog';
import { ProductDetailDialog } from '@/components/components-global-products/ProductDetailDialog';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProductBackend } from '@/types/products.interfaces';


export const AdminProductsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductBackend | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductBackend | null>(null);
  const { toast } = useToast();

  const { data, isLoading, isError, error } = useProducts();

  // ✅ CORREGIDO: Ahora recibe FormData
  const handleAddProduct = async (formData: FormData) => {
    try {
      // TODO: Implementar createProductAction(formData)
      console.log('Crear producto con FormData', formData);

      toast({
        title: 'Producto agregado',
        description: 'El producto ha sido agregado exitosamente.',
      });
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo agregar el producto.',
        variant: 'destructive',
      });
    }
  };

  // ✅ CORREGIDO: Ahora recibe FormData
  const handleEditProduct = async (formData: FormData) => {
    if (!editingProduct) return;

    try {
      // TODO: Implementar updateProductAction(editingProduct._id, formData)
      console.log('Editar producto con FormData');

      toast({
        title: 'Producto actualizado',
        description: 'El producto ha sido actualizado exitosamente.',
      });
      setEditingProduct(null);
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el producto.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      // TODO: Implementar deleteProductAction(id)
      console.log('Eliminar producto:', id);

      toast({
        title: 'Producto eliminado',
        description: 'El producto ha sido eliminado.',
        variant: 'destructive',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el producto.',
        variant: 'destructive',
      });
    }
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

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    if (data?.totalPages) {
      setCurrentPage((prev) => Math.min(data.totalPages, prev + 1));
    }
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestión de Productos</h1>
              <p className="text-muted-foreground">
                Administra tu inventario de productos
              </p>
            </div>
            <Button onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Producto
            </Button>
          </div>
        </div>
      </header>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data?.products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={{
                    id: product._id,
                    name: product.name,
                    description: product.description,
                    price: product.sale_price,
                    category: product.category_id.name,
                    stock: product.stock,
                    image: product.image,
                  }}
                  onEdit={() => openEditDialog(product)}
                  onDelete={() => handleDeleteProduct(product._id)}
                  onViewDetails={() => handleViewDetails(product)}
                  inCart={false}
                  onAddToCart={() => { }}
                  onRemoveFromCart={() => { }}
                />
              ))}
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>

                <span className="px-4 py-2 text-sm">
                  Página {data.currentPage} de {data.totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === data.totalPages}
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ✅ CORREGIDO: Product Dialog */}
      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={editingProduct ? handleEditProduct : handleAddProduct}
        editProduct={editingProduct} // 👈 Pasa el producto completo
      />

      {/* ✅ CORREGIDO: Product Detail Dialog */}
      <ProductDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        product={selectedProduct} // 👈 Pasa el producto completo
        inCart={false}
        onAddToCart={() => { }}
        onRemoveFromCart={() => { }}
      />
    </div>
  );
};