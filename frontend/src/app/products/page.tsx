import { ProductList } from '@/features/products/components/ProductList';
import Link from 'next/link';

/**
 * Products Page (Server Component)
 * App Router: /products
 */

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sản phẩm</h1>
            <p className="mt-2 text-sm text-gray-600">
              Quản lý danh sách sản phẩm của bạn
            </p>
          </div>

          <Link
            href="/products/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Thêm sản phẩm
          </Link>
        </div>

        {/* Product List - Client Component với TanStack Query */}
        <ProductList />
      </div>
    </div>
  );
}
