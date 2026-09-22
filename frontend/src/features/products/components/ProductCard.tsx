'use client';

import type { Product } from '../types/product.types';
import Link from 'next/link';

/**
 * ProductCard Component
 * Hiển thị thông tin tóm tắt của 1 product
 */

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`}>
      <div className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
        {/* Product Image Placeholder */}
        <div className="aspect-square bg-gray-100">
          <div className="flex h-full items-center justify-center text-gray-400">
            <svg
              className="h-16 w-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
            {product.name}
          </h3>
          
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">
            {product.description}
          </p>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xl font-bold text-gray-900">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(product.price ?? (product as any).basePrice ?? 0)}
            </span>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
                Chọn Topping →
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
