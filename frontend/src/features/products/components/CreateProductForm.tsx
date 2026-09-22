'use client';

import { useCreateProduct } from '../hooks/useProducts';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { CreateProductDto } from '../types/product.types';

/**
 * CreateProductForm Component
 * Form tạo product mới với validation và mutation handling
 */

export function CreateProductForm() {
  const router = useRouter();
  const createProduct = useCreateProduct();

  const [formData, setFormData] = useState<CreateProductDto>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Gọi mutation để tạo product
      await createProduct.mutateAsync(formData);

      // Redirect về trang products sau khi tạo thành công
      router.push('/products');
    } catch (error) {
      // Error được handle bởi TanStack Query
      console.error('Failed to create product:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Tên sản phẩm *
        </label>
        <input
          type="text"
          id="name"
          required
          maxLength={200}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Mô tả
        </label>
        <textarea
          id="description"
          rows={4}
          maxLength={1000}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Price and Stock */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Giá *
          </label>
          <input
            type="number"
            id="price"
            required
            min={0}
            step={0.01}
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
            Tồn kho *
          </label>
          <input
            type="number"
            id="stock"
            required
            min={0}
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Error Display */}
      {createProduct.isError && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">
            {createProduct.error instanceof Error
              ? createProduct.error.message
              : 'Không thể tạo sản phẩm'}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={createProduct.isPending}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {createProduct.isPending ? 'Đang tạo...' : 'Tạo sản phẩm'}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
