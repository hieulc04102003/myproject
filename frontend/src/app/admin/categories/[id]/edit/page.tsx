'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { adminCategoriesApi } from '@/lib/api/admin';
import type { CategoryFormData } from '@/types/category';
import Link from 'next/link';

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    displayOrder: 0,
    isActive: true,
  });
  const [error, setError] = useState('');

  const { data: category, isLoading } = useQuery({
    queryKey: ['admin', 'categories', params.id],
    queryFn: () => adminCategoriesApi.getById(params.id),
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        displayOrder: category.displayOrder || 0,
        isActive: category.isActive ?? true,
      });
    }
  }, [category]);

  const updateMutation = useMutation({
    mutationFn: (data: CategoryFormData) =>
      adminCategoriesApi.update(params.id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      router.push('/admin/categories');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.slug) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Không tìm thấy danh mục</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/categories"
          className="rounded-lg p-2 hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa danh mục</h1>
          <p className="text-gray-600">{category.name}</p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Tên danh mục <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                URL thân thiện (chỉ chữ thường, số và dấu gạch ngang)
              </p>
            </div>

            {/* Display Order */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Thứ tự hiển thị
              </label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                min="0"
              />
            </div>

            {/* Is Active */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Kích hoạt danh mục
                </span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="Mô tả về danh mục..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 border-t pt-6">
            <Link
              href="/admin/categories"
              className="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-50"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-6 py-2 text-white hover:from-orange-600 hover:to-red-600 disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
