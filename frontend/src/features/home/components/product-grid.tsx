'use client';

/**
 * Product Grid Component - Display products in responsive grid
 */

import { Product } from '@/types/product';
import { ProductCard, ProductCardSkeleton } from './product-card';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onProductCustomize?: (product: Product) => void;
}

export function ProductGrid({ products, isLoading, onProductCustomize }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {[...Array(8)].map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <span className="text-3xl">🔍</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Không tìm thấy sản phẩm
        </h3>
        <p className="text-gray-600">
          Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onCustomize={onProductCustomize}
        />
      ))}
    </div>
  );
}
