'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, FolderTree } from 'lucide-react';
import { adminCategoriesApi } from '@/lib/api/admin';
import { Pagination } from '@/components/ui/pagination';
import type { Category } from '@/types/category';
import Link from 'next/link';

export default function StaffCategoriesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['staff', 'categories'],
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
      queryClient.invalidateQueries({ queryKey: ['staff', 'categories'] });
    },
  });

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa danh mục "${name}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch {
        alert('Không thể xóa danh mục này. Có thể đang có sản phẩm liên kết.');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Danh mục sản phẩm</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý các phân loại sản phẩm trong hệ thống</p>
        </div>
        <Link
          href="/staff/categories/new"
          className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 shadow-sm transition-colors"
        >
          <Plus size={18} />
          Thêm danh mục
        </Link>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full py-16 text-center text-gray-400">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm">Đang tải danh mục...</p>
          </div>
        ) : categories?.length === 0 ? (
          <div className="col-span-full rounded-3xl border-2 border-dashed border-gray-200 py-16 text-center bg-white">
            <FolderTree size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-600 font-medium">Chưa có danh mục nào</p>
            <Link
              href="/staff/categories/new"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700 transition-colors"
            >
              <Plus size={16} />
              Tạo danh mục đầu tiên
            </Link>
          </div>
        ) : (
          paginatedCategories?.map((category: Category) => (
            <div
              key={category.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 pr-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">/{category.slug}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      category.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}
                  >
                    {category.isActive ? 'Hoạt động' : 'Tạm ẩn'}
                  </span>
                </div>

                {category.description && (
                  <p className="mb-4 text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {category.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
                <span className="text-xs text-gray-500 font-medium">
                  Thứ tự hiển thị: {category.displayOrder || 0}
                </span>
                <div className="flex gap-1.5">
                  <Link
                    href={`/staff/categories/${category.id}/edit`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(category.id, category.name)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Xóa danh mục"
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
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
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
