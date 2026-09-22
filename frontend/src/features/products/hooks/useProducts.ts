import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../api/products.api';
import type { CreateProductDto } from '../types/product.types';

/**
 * Custom Hook: useProducts
 * TanStack Query hooks cho Products data fetching và mutations
 * - Automatic caching
 * - Background refetching
 * - Optimistic updates
 */

// Query Keys - centralized để dễ quản lý cache invalidation
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: { onlyActive?: boolean }) => 
    [...productKeys.lists(), { filters }] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

/**
 * Lấy danh sách products
 */
export function useProducts(onlyActive?: boolean) {
  return useQuery({
    queryKey: productKeys.list({ onlyActive }),
    queryFn: () => productsApi.getAll(onlyActive),
    // Stale time: Data được coi là "fresh" trong 5 phút
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Lấy product detail theo ID
 */
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.getById(id),
    // Chỉ fetch khi có ID
    enabled: !!id,
  });
}

/**
 * Tạo product mới
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductDto) => productsApi.create(data),
    // Sau khi tạo thành công, invalidate cache để refetch danh sách
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

/**
 * Xóa product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    // Optimistic update: Xóa khỏi cache ngay lập tức
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
