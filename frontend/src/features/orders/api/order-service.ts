/**
 * Order API Service
 */

import { apiClient } from '@/lib/api-client';
import { Order, CreateOrderPayload } from '@/types/order';

export interface PagedOrders {
  items: Order[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export const orderService = {
  /**
   * POST /api/orders — tạo đơn hàng mới (yêu cầu đăng nhập)
   */
  createOrder: async (payload: CreateOrderPayload): Promise<Order> => {
    return apiClient.post<Order>('/orders', payload);
  },

  /**
   * GET /api/orders — lấy danh sách đơn hàng của user hiện tại
   */
  getMyOrders: async (page = 1, pageSize = 20): Promise<PagedOrders> => {
    return apiClient.get<PagedOrders>(`/orders?page=${page}&pageSize=${pageSize}`);
  },

  /**
   * GET /api/orders/:id — chi tiết đơn hàng
   */
  getOrderById: async (id: string): Promise<Order> => {
    return apiClient.get<Order>(`/orders/${id}`);
  },

  /**
   * POST /api/orders/:id/cancel — hủy đơn hàng
   */
  cancelOrder: async (id: string): Promise<Order> => {
    return apiClient.post<Order>(`/orders/${id}/cancel`);
  },
};
