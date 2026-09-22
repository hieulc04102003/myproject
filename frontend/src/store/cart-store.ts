/**
 * Zustand Store - Cart State Management
 * Persist cart data to localStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartState, CartItem, CartItemOption } from '@/types/cart';
import { Product } from '@/types/product';
import { generateCartItemId, calculateItemPrice } from '@/lib/utils';

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      subtotal: 0,

      addItem: (product: Product, selectedOptions: CartItemOption[], quantity = 1, note?: string) => {
        const cartItemId = generateCartItemId(product.id, selectedOptions);
        const totalPrice = calculateItemPrice(product.basePrice, selectedOptions, quantity);

        set((state) => {
          // Check if item already exists
          const existingItemIndex = state.items.findIndex((item) => item.id === cartItemId);

          if (existingItemIndex > -1) {
            // Update quantity if item exists
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity += quantity;
            if (note) {
              updatedItems[existingItemIndex].note = note;
            }
            updatedItems[existingItemIndex].totalPrice = calculateItemPrice(
              product.basePrice,
              selectedOptions,
              updatedItems[existingItemIndex].quantity
            );

            return {
              items: updatedItems,
              totalItems: state.totalItems + quantity,
              subtotal: state.subtotal + totalPrice,
            };
          } else {
            // Add new item
            const newItem: CartItem = {
              id: cartItemId,
              product,
              quantity,
              selectedOptions,
              totalPrice,
              note,
            };

            return {
              items: [...state.items, newItem],
              totalItems: state.totalItems + quantity,
              subtotal: state.subtotal + totalPrice,
            };
          }
        });
      },

      removeItem: (itemId: string) => {
        set((state) => {
          const item = state.items.find((i) => i.id === itemId);
          if (!item) return state;

          return {
            items: state.items.filter((i) => i.id !== itemId),
            totalItems: state.totalItems - item.quantity,
            subtotal: state.subtotal - item.totalPrice,
          };
        });
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set((state) => {
          const itemIndex = state.items.findIndex((i) => i.id === itemId);
          if (itemIndex === -1) return state;

          const item = state.items[itemIndex];
          const oldQuantity = item.quantity;
          const newTotalPrice = calculateItemPrice(
            item.product.basePrice,
            item.selectedOptions,
            quantity
          );

          const updatedItems = [...state.items];
          updatedItems[itemIndex] = {
            ...item,
            quantity,
            totalPrice: newTotalPrice,
          };

          return {
            items: updatedItems,
            totalItems: state.totalItems - oldQuantity + quantity,
            subtotal: state.subtotal - item.totalPrice + newTotalPrice,
          };
        });
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          subtotal: 0,
        });
      },

      getItemCount: () => {
        return get().totalItems;
      },

      getSubtotal: () => {
        return get().subtotal;
      },
    }),
    {
      name: 'banh-mi-cart',
      skipHydration: true, // Important for SSR
    }
  )
);
