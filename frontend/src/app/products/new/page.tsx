import { CreateProductForm } from '@/features/products/components/CreateProductForm';

/**
 * Create Product Page
 * App Router: /products/new
 */

export default function NewProductPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tạo sản phẩm mới</h1>
          <p className="mt-2 text-sm text-gray-600">
            Điền thông tin chi tiết sản phẩm bên dưới
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <CreateProductForm />
        </div>
      </div>
    </div>
  );
}
