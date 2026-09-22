/**
 * React Query Hooks - Products
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { Product, ProductListResponse, Category, ProductFilters } from '@/types/product';
import { productService, categoryService } from '../api/product-service';

export const QUERY_KEYS = {
  products: (filters?: ProductFilters) => ['products', filters],
  product: (id: string) => ['product', id],
  featuredProducts: ['products', 'featured'],
  categories: ['categories'],
  category: (id: string) => ['category', id],
};

/**
 * Hook: Fetch products with filters
 */
export function useProducts(filters?: ProductFilters): UseQueryResult<ProductListResponse> {
  return useQuery({
    queryKey: QUERY_KEYS.products(filters),
    queryFn: () => productService.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook: Fetch featured products
 */
export function useFeaturedProducts(limit = 8): UseQueryResult<Product[]> {
  return useQuery({
    queryKey: QUERY_KEYS.featuredProducts,
    queryFn: () => productService.getFeaturedProducts(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook: Fetch single product
 */
export function useProduct(id: string): UseQueryResult<Product> {
  return useQuery({
    queryKey: QUERY_KEYS.product(id),
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
  });
}

/**
 * Hook: Fetch categories
 */
export function useCategories(): UseQueryResult<Category[]> {
  return useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: () => categoryService.getCategories(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}
