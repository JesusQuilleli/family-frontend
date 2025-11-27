import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import { getProductsAction } from '@/actions/get-products';
import { useCartStore } from '@/store/useCartStore';
import { ProductCard } from '@/components/admin-products/ProductCard';
import { CartSheet } from '@/client/components/cart/CartSheet';
import { ProductDetailDialog } from '@/components/admin-products/ProductDetailDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { Search } from '@/components/custom/Search';
import { CustomPagination } from '@/components/custom/CustomPagination';
import { useCategories } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { ProductBackend } from '@/interfaces/products.response';

export const ClientProductsPage = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Store
  const { addItem, removeItem, items, setIsOpen } = useCartStore();
  const cartItemIds = items.map(item => item.product._id);

  // State for detail dialog
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductBackend | null>(null);

  // URL Params
  const page = Number(searchParams.get('page') || '1');
  const query = searchParams.get('query') || '';
  const categoryId = searchParams.get('categoryId') || '';

  // Queries
  const { data: productsData, isLoading: isLoadingProducts, isFetching } = useQuery({
    queryKey: ['products', page, query, categoryId],
    queryFn: () => getProductsAction({ page, limit: 8, query, categoryId: categoryId === 'all' ? '' : categoryId }),
    placeholderData: (previousData) => previousData,
  });

  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();

  const handleAddToCart = (product: ProductBackend) => {
    addItem(product);
    toast({
      title: 'Agregado al carrito',
      description: `${product.name} ha sido agregado a tu carrito.`,
    });
  };

  const handleRemoveFromCart = (id: string) => {
    removeItem(id);
    toast({
      title: 'Eliminado del carrito',
      description: 'Producto eliminado de tu carrito.',
    });
  };

  const handleViewDetails = (product: ProductBackend) => {
    setSelectedProduct(product);
    setDetailDialogOpen(true);
  };

  // Loading State
  if (isLoadingProducts && !productsData) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        </main>
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
              <h1 className="text-3xl font-bold text-foreground">Nuestros Productos</h1>
              <p className="text-muted-foreground">
                Explora nuestra selección de productos
              </p>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="relative"
              onClick={() => setIsOpen(true)}
            >
              <ShoppingCart className="w-5 h-5" />
              {items.length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                  {items.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <Search
        categories={categoriesData?.categories || []}
        isLoadingCategories={isLoadingCategories}
      />

      {/* Products Grid */}
      <main className="container mx-auto px-4 py-8">
        {productsData?.products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No se encontraron productos</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Mostrando {productsData?.products.length} productos
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {productsData?.products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  userRole="cliente"
                  onAddToCart={() => handleAddToCart(product)}
                  onRemoveFromCart={() => handleRemoveFromCart(product._id)}
                  onViewDetails={() => handleViewDetails(product)}
                  inCart={cartItemIds.includes(product._id)}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8">
              <CustomPagination
                totalPages={productsData?.totalPages || 1}
                isLoading={isFetching}
              />
            </div>
          </>
        )}
      </main>

      {/* Cart Sheet */}
      <CartSheet />

      {/* Product Detail Dialog */}
      <ProductDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        product={selectedProduct}
        userRole="cliente"
        inCart={selectedProduct ? cartItemIds.includes(selectedProduct._id) : false}
        onAddToCart={() => selectedProduct && handleAddToCart(selectedProduct)}
        onRemoveFromCart={() => selectedProduct && handleRemoveFromCart(selectedProduct._id)}
      />
    </div>
  );
};
