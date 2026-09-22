/**
 * Order Types
 */

export interface OrderItemOption {
  optionId: string;
  optionName: string;
  optionPrice: number;
}

export interface OrderItem {
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  itemTotalPrice?: number;
  options?: OrderItemOption[];
}

export interface Order {
  id: string;
  orderCode: string;
  userId: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  note?: string;
  createdAt: string;
  items: OrderItem[];
}

export interface CreateOrderItemPayload {
  productId: string;
  quantity: number;
  optionIds?: string[];
}

export interface CreateOrderPayload {
  userId: string;
  items: CreateOrderItemPayload[];
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod?: string;
  note?: string;
  addressId?: string;
  couponId?: string;
}
