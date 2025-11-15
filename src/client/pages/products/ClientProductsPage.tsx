import { useState, useMemo } from 'react';
import type { Product, UserRole } from '@/types/products.interfaces';
import { mockProducts } from '@/data/mockProducts';
import { ProductCard } from '../../../components/components-global-products/ProductCard';
import { ProductDialog } from '../../../components/components-global-products/ProductDialog';
import { CartSheet } from '../../../components/components-global-products/CartSheet';
import { ProductDetailDialog } from '../../../components/components-global-products/ProductDetailDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

import { Plus, Search, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 8;

export const ClientProductsPage = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [userRole, setUserRole] = useState<UserRole>('customer');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [cartItemIds, setCartItemIds] = useState<string[]>([]);
  const [cartSheetOpen, setCartSheetOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ['all', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const cartItems = useMemo(() => {
    return products.filter((p) => cartItemIds.includes(p.id));
  }, [products, cartItemIds]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter]);

  const handleAddProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setProducts([newProduct, ...products]);
    toast({
      title: 'Producto agregado',
      description: `${newProduct.name} ha sido agregado exitosamente.`,
    });
  };

  const handleEditProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    if (!editingProduct) return;
    setProducts(
      products.map((p) =>
        p.id === editingProduct.id ? { ...p, ...productData } : p
      )
    );
    toast({
      title: 'Producto actualizado',
      description: `${productData.name} ha sido actualizado exitosamente.`,
    });
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    const product = products.find((p) => p.id === id);
    setProducts(products.filter((p) => p.id !== id));
    toast({
      title: 'Producto eliminado',
      description: `${product?.name} ha sido eliminado.`,
      variant: 'destructive',
    });
  };

  const handleAddToCart = (product: Product) => {
    setCartItemIds([...cartItemIds, product.id]);
    toast({
      title: 'Agregado al carrito',
      description: `${product.name} ha sido agregado a tu carrito.`,
    });
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItemIds(cartItemIds.filter((cartId) => cartId !== id));
    toast({
      title: 'Eliminado del carrito',
      description: 'Producto eliminado de tu carrito.',
    });
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setDetailDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

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
            <div className="flex items-center gap-3">
              <Select value={userRole} onValueChange={(value) => setUserRole(value as UserRole)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="customer">Cliente</SelectItem>
                </SelectContent>
              </Select>

              {userRole === 'customer' && (
                <Button
                  variant="outline"
                  size="icon"
                  className="relative"
                  onClick={() => setCartSheetOpen(true)}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartItemIds.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                      {cartItemIds.length}
                    </Badge>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Filters and Actions */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'Todas las categorías' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {userRole === 'admin' && (
              <Button onClick={openAddDialog} className="w-full md:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Producto
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <main className="container mx-auto px-4 py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No se encontraron productos</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Mostrando {paginatedProducts.length} de {filteredProducts.length} productos
              </span>
              <span className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  userRole={userRole}
                  onEdit={openEditDialog}
                  onDelete={handleDeleteProduct}
                  onAddToCart={handleAddToCart}
                  onRemoveFromCart={handleRemoveFromCart}
                  onViewDetails={handleViewDetails}
                  inCart={cartItemIds.includes(product.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className={
                          currentPage === 1
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className={
                          currentPage === totalPages
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </main>

      {/* Product Dialog */}
      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={editingProduct ? handleEditProduct : handleAddProduct}
        editProduct={editingProduct}
      />

      {/* Cart Sheet */}
      <CartSheet
        open={cartSheetOpen}
        onOpenChange={setCartSheetOpen}
        cartItems={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onViewDetails={handleViewDetails}
      />

      {/* Product Detail Dialog */}
      <ProductDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        product={selectedProduct}
        userRole={userRole}
        inCart={selectedProduct ? cartItemIds.includes(selectedProduct.id) : false}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
      />
    </div>
  );
};


