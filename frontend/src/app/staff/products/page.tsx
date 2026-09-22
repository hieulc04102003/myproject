'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { adminProductsApi } from '@/lib/api/admin';
import Link from 'next/link';
import type { Product } from '@/types/product';
import { Pagination } from '@/components/ui/pagination';

export default function StaffProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useQuery({
    queryKey: ['staff', 'products', page, pageSize, search],
    queryFn: () => adminProductsApi.getAll({ 
      page, 
      pageSize,
      q: search || undefined,
      sortBy: 'name',
      sortDir: 'asc' 
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: adminProductsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', 'products'] });
    },
  });

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch {
        alert('Không thể xóa sản phẩm này.');
      }
    }
  };

  const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Danh sách sản phẩm</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý kho hàng, giá bán và tình trạng sản phẩm</p>
        </div>
        <Link
          href="/staff/products/new"
          className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 shadow-sm transition-colors"
        >
          <Plus size={18} />
          Thêm sản phẩm
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Tìm kiếm sản phẩm theo tên..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 text-sm focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3.5">Sản phẩm</th>
                <th className="px-6 py-3.5">Giá niêm yết</th>
                <th className="px-6 py-3.5">Tồn kho</th>
                <th className="px-6 py-3.5">Trạng thái</th>
                <th className="px-6 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-400">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs">Đang tải danh sách sản phẩm...</p>
                  </td>
                </tr>
              ) : data?.items?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-400 text-sm">
                    Không tìm thấy sản phẩm nào
                  </td>
                </tr>
              ) : (
                data?.items?.map((product: Product) => (
                  <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs font-bold text-gray-400">
                              HN
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">/{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.basePrice)}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {product.stockQuantity ?? 0} chiếc
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          product.isAvailable ?? true
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${product.isAvailable ?? true ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {(product.isAvailable ?? true) ? 'Đang bán' : 'Tạm ẩn'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/staff/products/${product.id}/edit`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa sản phẩm"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa sản phẩm"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalCount > 0 && (
          <div className="border-t border-gray-100 p-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={data.totalCount}
              pageSize={pageSize}
              onPageChange={(p) => setPage(p)}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setPage(1);
              }}
              pageSizeOptions={[10, 20, 50]}
              itemName="sản phẩm"
            />
          </div>
        )}
      </div>
    </div>
  );
}
