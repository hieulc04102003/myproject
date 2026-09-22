'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Eye, Search } from 'lucide-react';
import { adminProductsApi } from '@/lib/api/admin';
import { Pagination } from '@/components/ui/pagination';
import Link from 'next/link';

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', page, pageSize, search],
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
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Product
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="rounded-lg border bg-white p-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-lg border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Image</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Price</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Stock</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Featured</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                data?.items.map((product: any) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="h-12 w-12 rounded-lg bg-gray-200">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full rounded-lg object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">${product.basePrice.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          (product.stockQuantity ?? 0) > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.stockQuantity ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          product.isAvailable ?? true
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {(product.isAvailable ?? true) ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          product.isFeatured ?? false
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {(product.isFeatured ?? false) ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/products/${product.id}`}
                          className="rounded p-2 text-gray-600 hover:bg-gray-100"
                          title="View"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="rounded p-2 text-blue-600 hover:bg-blue-50"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="rounded p-2 text-red-600 hover:bg-red-50"
                          title="Delete"
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
        {totalPages > 0 && (
          <div className="border-t px-6 py-3 bg-slate-50/50">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={data?.totalCount || 0}
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
