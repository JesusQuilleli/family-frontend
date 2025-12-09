import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProductBackend } from '@/interfaces/products.response';

export interface CartItem {
   product: ProductBackend;
   quantity: number;
}

interface CartState {
   items: CartItem[];
   isOpen: boolean;

   // Actions
   addItem: (product: ProductBackend) => void;
   removeItem: (productId: string) => void;
   updateQuantity: (productId: string, quantity: number) => void;
   clearCart: () => void;
   toggleCart: () => void;
   setIsOpen: (isOpen: boolean) => void;

   // Computed (helper functions)
   getTotal: () => number;
   getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
   persist(
      (set, get) => ({
         items: [],
         isOpen: false,

         addItem: (product) => {
            const { items } = get();
            const existingItem = items.find((item) => item.product._id === product._id);

            if (existingItem) {
               set({
                  items: items.map((item) =>
                     item.product._id === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                  ),
               });
            } else {
               set({
                  items: [...items, { product, quantity: 1 }],
               });
            }
         },

         removeItem: (productId) => {
            set({
               items: get().items.filter((item) => item.product._id !== productId),
            });
         },

         updateQuantity: (productId, quantity) => {
            if (quantity <= 0) {
               get().removeItem(productId);
               return;
            }

            set({
               items: get().items.map((item) =>
                  item.product._id === productId ? { ...item, quantity } : item
               ),
            });
         },

         clearCart: () => set({ items: [] }),

         toggleCart: () => set({ isOpen: !get().isOpen }),

         setIsOpen: (isOpen) => set({ isOpen }),

         getTotal: () => {
            return get().items.reduce(
               (total, item) => total + item.product.sale_price * item.quantity,
               0
            );
         },

         getItemCount: () => {
            return get().items.reduce((count, item) => count + item.quantity, 0);
         },
      }),
      {
         name: 'shopping-cart', // unique name for localStorage
      }
   )
);
