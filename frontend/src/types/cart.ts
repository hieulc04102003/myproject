/**
 * Cart Types - Type-safe definitions cho giỏ hàng
 */

import { Option, Product } from './product';

export interface CartItemOption {
  optionGroupId: string;
  optionGroupName: string;
  option: Option;
}

export interface CartItem {
  id: string; // Unique ID cho cart item (productId + selected options hash)
  product: Product;
  quantity: number;
  selectedOptions: CartItemOption[];
  totalPrice: number; // basePrice + sum(option prices) * quantity
  note?: string;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  // Actions
  addItem: (product: Product, selectedOptions: CartItemOption[], quantity?: number, note?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}
