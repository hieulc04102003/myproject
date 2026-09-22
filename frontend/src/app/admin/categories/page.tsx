'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, FolderTree } from 'lucide-react';
import { adminCategoriesApi } from '@/lib/api/admin';
import { Pagination } from '@/components/ui/pagination';
import type { Category, CategoryFormData } from '@/types/category';
import Link from 'next/link';

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => adminCategoriesApi.getAll(),
  });

  const totalPages = Math.ceil((categories?.length || 0) / pageSize);

  const paginatedCategories = useMemo(() => {
    if (!categories) return [];
    const start = (page - 1) * pageSize;
    return categories.slice(start, start + pageSize);
  }, [categories, page, pageSize]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminCategoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
  });

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa danh mục "${name}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        alert('Không thể xóa danh mục này. Có thể đang có sản phẩm liên kết.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">Quản lý danh mục sản phẩm</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-white hover:from-orange-600 hover:to-red-600"
        >
          <Plus size={20} />
          Thêm danh mục
        </Link>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            Đang tải...
          </div>
        ) : categories?.length === 0 ? (
          <div className="col-span-full rounded-lg border-2 border-dashed border-gray-300 py-12 text-center">
            <FolderTree size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Chưa có danh mục nào</p>
            <Link
              href="/admin/categories/new"
              className="mt-4 inline-flex items-center gap-2 text-orange-600 hover:text-orange-700"
            >
              <Plus size={20} />
              Tạo danh mục đầu tiên
            </Link>
          </div>
        ) : (
          paginatedCategories.map((category) => (
            <div
              key={category.id}
              className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500">/{category.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                      category.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {category.description && (
                <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                  {category.description}
                </p>
              )}

              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-sm text-gray-500">
                  Thứ tự: {category.displayOrder || 0}
                </span>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/categories/${category.id}/edit`}
                    className="rounded p-2 text-blue-600 hover:bg-blue-50"
                    title="Chỉnh sửa"
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(category.id, category.name)}
                    className="rounded p-2 text-red-600 hover:bg-red-50"
                    title="Xóa"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={categories?.length || 0}
            pageSize={pageSize}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(1);
            }}
            pageSizeOptions={[6, 9, 18]}
            itemName="danh mục"
          />
        </div>
      )}
    </div>
  );
}
