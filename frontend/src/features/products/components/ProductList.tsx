'use client';

import { useState, useMemo } from 'react';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from './ProductCard';
import { ProductListSkeleton } from './ProductListSkeleton';
import { Pagination } from '@/components/ui/pagination';

/**
 * ProductList Component
 * Hiển thị danh sách products với loading state, error handling và phân trang
 */

interface ProductListProps {
  onlyActive?: boolean;
}

export function ProductList({ onlyActive = false }: ProductListProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // TanStack Query hook - tự động handle loading, error, data states
  const { data: products, isLoading, isError, error } = useProducts(onlyActive);

  const totalPages = Math.ceil((products?.length || 0) / pageSize);

  const paginatedProducts = useMemo(() => {
    if (!products) return [];
    const start = (page - 1) * pageSize;
    return products.slice(start, start + pageSize);
  }, [products, page, pageSize]);

  // Loading state
  if (isLoading) {
    return <ProductListSkeleton />;
  }

  // Error state
  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h3 className="text-lg font-semibold text-red-900">
          Không thể tải danh sách sản phẩm
        </h3>
        <p className="mt-2 text-sm text-red-700">
          {error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định'}
        </p>
      </div>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
        <p className="text-gray-600">Không có sản phẩm nào</p>
      </div>
    );
  }

  // Success state - hiển thị danh sách products
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pt-6 border-t border-gray-200">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={products.length}
            pageSize={pageSize}
            onPageChange={(p) => {
              setPage(p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(1);
            }}
            pageSizeOptions={[8, 12, 24, 48]}
            itemName="sản phẩm"
          />
        </div>
      )}
    </div>
  );
}
