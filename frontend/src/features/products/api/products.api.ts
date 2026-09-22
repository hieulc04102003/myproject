import apiClient from '@/lib/api/client';
import type { 
  Product, 
  CreateProductDto, 
  UpdateProductDto 
} from '../types/product.types';

/**
 * Products API Service
 * Encapsulate tất cả HTTP calls liên quan đến Products
 * Type-safe với TypeScript
 */

const PRODUCTS_ENDPOINT = '/products';

export const productsApi = {
  /**
   * GET /api/products
   * Lấy danh sách tất cả products
   */
  getAll: async (onlyActive?: boolean): Promise<Product[]> => {
    const params = onlyActive !== undefined ? { onlyActive } : {};
    const response = await apiClient.get<Product[]>(PRODUCTS_ENDPOINT, { params });
    return response.data;
  },

  /**
   * GET /api/products/:id
   * Lấy product theo ID
   */
  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`${PRODUCTS_ENDPOINT}/${id}`);
    return response.data;
  },

  /**
   * POST /api/products
   * Tạo product mới
   */
  create: async (data: CreateProductDto): Promise<Product> => {
    const response = await apiClient.post<Product>(PRODUCTS_ENDPOINT, data);
    return response.data;
  },

  /**
   * PUT /api/products/:id
   * Cập nhật product
   */
  update: async (id: string, data: UpdateProductDto): Promise<Product> => {
    const response = await apiClient.put<Product>(`${PRODUCTS_ENDPOINT}/${id}`, data);
    return response.data;
  },

  /**
   * DELETE /api/products/:id
   * Xóa product
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${PRODUCTS_ENDPOINT}/${id}`);
  },
};
