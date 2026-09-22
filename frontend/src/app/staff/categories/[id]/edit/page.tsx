'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { adminCategoriesApi } from '@/lib/api/admin';
import type { CategoryFormData } from '@/types/category';
import Link from 'next/link';

export default function StaffEditCategoryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const categoryId = params.id;

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    displayOrder: 0,
    isActive: true,
  });
  const [error, setError] = useState('');

  const { data: category, isLoading } = useQuery({
    queryKey: ['staff', 'categories', categoryId],
    queryFn: () => adminCategoriesApi.getById(categoryId),
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
      adminCategoriesApi.update(categoryId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['staff', 'categories'] });
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      router.push('/staff/categories');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.slug) {
      setError('Vui lòng điền đầy đủ tên danh mục và slug.');
      return;
    }

    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-2">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Đang tải thông tin danh mục...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/staff/categories"
          className="rounded-xl border border-gray-200 bg-white p-2.5 hover:bg-gray-50 text-gray-600 shadow-sm transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Chỉnh sửa danh mục</h1>
          <p className="text-sm text-gray-500">Cập nhật thông tin phân loại sản phẩm</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Tên danh mục <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Đường dẫn tĩnh (Slug) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Thứ tự sắp xếp
              </label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                min="0"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm font-semibold text-gray-700">
                  Kích hoạt hiển thị cho khách hàng
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Mô tả chi tiết
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-6">
            <Link
              href="/staff/categories"
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
