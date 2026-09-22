/**
 * Product API Service - Data fetching functions
 */

import { apiClient } from '@/lib/api-client';
import { Product, ProductListResponse, Category, ProductFilters } from '@/types/product';

// Shape backend actually returns
interface BackendPagedResult {
  items: Product[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/** Normalize product object to ensure both basePrice and price are populated */
function normalizeProduct(p: any): Product {
  const resolvedPrice = Number(p.basePrice ?? p.price ?? 0);
  return {
    ...p,
    basePrice: resolvedPrice,
    price: resolvedPrice,
  };
}

/** Map backend PagedResult → frontend ProductListResponse */
function mapPagedResult(res: BackendPagedResult): ProductListResponse {
  return {
    products: (res?.items || []).map(normalizeProduct),
    total: res?.totalCount || 0,
    page: res?.page || 1,
    pageSize: res?.pageSize || 10,
  };
}

export const productService = {
  /**
   * Get all products with optional filters — uses /api/products/search
   */
  getProducts: async (filters?: ProductFilters): Promise<ProductListResponse> => {
    const params = new URLSearchParams();

    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.search) params.append('q', filters.search);
    if (filters?.isFeatured !== undefined) params.append('isFeatured', String(filters.isFeatured));
    if (filters?.minPrice) params.append('minPrice', String(filters.minPrice));
    if (filters?.maxPrice) params.append('maxPrice', String(filters.maxPrice));

    const query = params.toString();
    const res = await apiClient.get<BackendPagedResult>(`/products/search${query ? `?${query}` : ''}`);
    return mapPagedResult(res);
  },

  /**
   * Get single product by ID
   */
  getProductById: async (id: string): Promise<Product> => {
    const res = await apiClient.get<Product>(`/products/${id}`);
    return normalizeProduct(res);
  },

  /**
   * Get featured products for homepage — uses /api/products/homepage
   */
  getFeaturedProducts: async (limit = 8): Promise<Product[]> => {
    const res = await apiClient.get<BackendPagedResult>(`/products/homepage?pageSize=${limit}`);
    return (res?.items || []).map(normalizeProduct);
  },
};

export const categoryService = {
  /**
   * Get all categories
   */
  getCategories: async (): Promise<Category[]> => {
    return apiClient.get<Category[]>('/categories');
  },

  /**
   * Get category by ID
   */
  getCategoryById: async (id: string): Promise<Category> => {
    return apiClient.get<Category>(`/categories/${id}`);
  },
};
