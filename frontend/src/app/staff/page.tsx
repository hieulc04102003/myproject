'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Package, 
  ShoppingCart, 
  Clock, 
  Truck, 
  Plus, 
  ArrowRight, 
  Eye,
  Layers
} from 'lucide-react';
import { adminProductsApi, adminOrdersApi, type Order } from '@/lib/api/admin';
import type { Product } from '@/types/product';
import Link from 'next/link';
import { useState } from 'react';

export default function StaffDashboard() {
  const queryClient = useQueryClient();
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Fetch operational data (No users data, No financial revenue reports)
  const { data: productsData } = useQuery({
    queryKey: ['staff', 'products', 'stats'],
    queryFn: () => adminProductsApi.getAll({ page: 1, pageSize: 5 }),
  });

  const { data: allOrdersData } = useQuery({
    queryKey: ['staff', 'orders', 'all'],
    queryFn: () => adminOrdersApi.getAll({ page: 1, pageSize: 50 }),
  });

  // Calculate operational stats for staff
  const totalProducts = productsData?.totalCount || 0;
  const totalOrders = allOrdersData?.totalCount || 0;
  const pendingOrders = allOrdersData?.items?.filter(
    (o: Order) => o.orderStatus?.toUpperCase() === 'PENDING'
  ).length || 0;
  const shippingOrders = allOrdersData?.items?.filter(
    (o: Order) => o.orderStatus?.toUpperCase() === 'SHIPPED' || o.orderStatus?.toUpperCase() === 'PROCESSING'
  ).length || 0;

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      adminOrdersApi.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', 'orders'] });
    },
  });

  const handleQuickStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      await updateStatusMutation.mutateAsync({ orderId, status: newStatus });
    } catch {
      alert('Không thể cập nhật trạng thái đơn hàng.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const operationalStats = [
    {
      title: 'Tổng sản phẩm',
      value: totalProducts,
      subtitle: 'Sản phẩm đang quản lý',
      icon: Package,
      color: 'bg-blue-600',
      lightBg: 'bg-blue-50',
      textColor: 'text-blue-700',
      href: '/staff/products',
    },
    {
      title: 'Tổng đơn hàng',
      value: totalOrders,
      subtitle: 'Tất cả đơn trong hệ thống',
      icon: ShoppingCart,
      color: 'bg-emerald-600',
      lightBg: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      href: '/staff/orders',
    },
    {
      title: 'Đơn chờ xử lý',
      value: pendingOrders,
      subtitle: 'Cần xác nhận và đóng gói',
      icon: Clock,
      color: 'bg-amber-500',
      lightBg: 'bg-amber-50',
      textColor: 'text-amber-700',
      href: '/staff/orders',
    },
    {
      title: 'Đang vận chuyển',
      value: shippingOrders,
      subtitle: 'Đang giao đến khách hàng',
      icon: Truck,
      color: 'bg-indigo-600',
      lightBg: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      href: '/staff/orders',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'PROCESSING':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'SHIPPED':
      case 'SHIPPING':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'Chờ xác nhận';
      case 'PROCESSING': return 'Đang chuẩn bị';
      case 'SHIPPED':
      case 'SHIPPING': return 'Đang giao hàng';
      case 'COMPLETED': return 'Hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tổng quan tác nghiệp</h1>
          <p className="text-sm text-gray-500 mt-1">
            Không gian làm việc dành riêng cho nhân viên vận hành & xử lý đơn hàng
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/staff/products/new"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Thêm sản phẩm
          </Link>
          <Link
            href="/staff/categories/new"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Thêm danh mục
          </Link>
          <Link
            href="/staff/toppings"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Layers size={16} />
            Topping & Tùy chọn
          </Link>
        </div>
      </div>

      {/* Operational Stats Grid (No Users & No Revenue) */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {operationalStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Link
              key={stat.title}
              href={stat.href}
              className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-gray-300"
            >
              <div className="flex items-center justify-between">
                <div className={`${stat.color} rounded-xl p-3 text-white shadow-sm`}>
                  <Icon size={22} />
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${stat.lightBg} ${stat.textColor}`}>
                  Tác nghiệp
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-500">{stat.title}</p>
                <p className="mt-1 text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="mt-1 text-[11px] text-gray-400">{stat.subtitle}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Activity Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders Table (2 Cols) */}
        <div className="lg:col-span-2 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Đơn hàng mới nhất cần xử lý</h2>
              <p className="text-xs text-gray-500">Cập nhật trạng thái duyệt hoặc giao hàng</p>
            </div>
            <Link
              href="/staff/orders"
              className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700"
            >
              Xem tất cả đơn
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase font-semibold">
                  <th className="pb-3">Mã đơn</th>
                  <th className="pb-3">Khách hàng</th>
                  <th className="pb-3">Thời gian</th>
                  <th className="pb-3">Trạng thái</th>
                  <th className="pb-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {allOrdersData?.items?.slice(0, 6).map((order: Order) => (
                  <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 font-mono text-xs font-semibold text-gray-900">
                      {order.orderCode}
                    </td>
                    <td className="py-3.5 text-xs text-gray-800 font-medium">
                      {order.customerName}
                    </td>
                    <td className="py-3.5 text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3.5">
                      <select
                        value={order.orderStatus?.toUpperCase()}
                        disabled={updatingOrderId === order.id}
                        onChange={(e) => handleQuickStatusChange(order.id, e.target.value)}
                        className={`text-xs font-medium rounded-lg px-2.5 py-1 border-0 focus:ring-2 focus:ring-orange-500 cursor-pointer ${getStatusBadge(
                          order.orderStatus
                        )}`}
                      >
                        <option value="PENDING">Chờ xác nhận</option>
                        <option value="PROCESSING">Đang chuẩn bị</option>
                        <option value="SHIPPED">Đang giao hàng</option>
                        <option value="COMPLETED">Hoàn thành</option>
                        <option value="CANCELLED">Đã hủy</option>
                      </select>
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        href={`/staff/orders/${order.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Xem chi tiết đơn"
                      >
                        <Eye size={14} />
                        <span>Chi tiết</span>
                      </Link>
                    </td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-gray-400">
                      Chưa có đơn hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory / Top Products (1 Col) */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Sản phẩm nổi bật</h2>
              <p className="text-xs text-gray-500">Kiểm tra nhanh danh mục kho hàng</p>
            </div>
            <Link
              href="/staff/products"
              className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700"
            >
              Tất cả
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-3.5">
            {productsData?.items?.slice(0, 5).map((product: Product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
              >
                <div className="h-12 w-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs font-bold">
                      HN
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.basePrice)}
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      product.isAvailable ?? true
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {(product.isAvailable ?? true) ? 'Còn hàng' : 'Hết hàng'}
                  </span>
                </div>
              </div>
            )) || (
              <p className="py-6 text-center text-xs text-gray-400">Chưa có sản phẩm nào</p>
            )}
          </div>

          <div className="pt-2 border-t border-gray-100">
            <Link
              href="/staff/products/new"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-gray-300 text-xs font-medium text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors"
            >
              <Plus size={14} />
              Thêm sản phẩm mới vào kho
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
