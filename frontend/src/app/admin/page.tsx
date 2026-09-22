'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { adminProductsApi, adminUsersApi, adminOrdersApi, type Order } from '@/lib/api/admin';
import type { Product } from '@/types/product';

export default function AdminDashboard() {
  // Fetch data for dashboard stats
  const { data: productsData } = useQuery({
    queryKey: ['admin', 'products', 'stats'],
    queryFn: () => adminProductsApi.getAll({ page: 1, pageSize: 1 }),
  });

  const { data: usersData } = useQuery({
    queryKey: ['admin', 'users', 'stats'],
    queryFn: () => adminUsersApi.getAll({ page: 1, pageSize: 1 }),
  });

  const { data: ordersData } = useQuery({
    queryKey: ['admin', 'orders', 'stats'],
    queryFn: () => adminOrdersApi.getAll({ page: 1, pageSize: 1 }),
  });

  const stats = [
    {
      title: 'Total Products',
      value: productsData?.totalCount || 0,
      icon: Package,
      change: '+12%',
      trend: 'up' as const,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Orders',
      value: ordersData?.totalCount || 0,
      icon: ShoppingCart,
      change: '+8%',
      trend: 'up' as const,
      color: 'bg-green-500',
    },
    {
      title: 'Total Users',
      value: usersData?.totalCount || 0,
      icon: Users,
      change: '+23%',
      trend: 'up' as const,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Revenue',
      value: '$45,231',
      icon: DollarSign,
      change: '-3%',
      trend: 'down' as const,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;

          return (
            <div
              key={stat.title}
              className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className={`${stat.color} rounded-lg p-3 text-white`}>
                  <Icon size={24} />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  <TrendIcon size={16} />
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Orders</h2>
          <div className="space-y-4">
            {ordersData?.items.slice(0, 5).map((order: Order) => (
              <div key={order.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{order.orderCode}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${order.totalAmount}</p>
                  {(() => {
                    const s = order.orderStatus?.toUpperCase();
                    let color = 'bg-gray-100 text-gray-800';
                    let label = order.orderStatus;
                    if (s === 'COMPLETED') {
                      color = 'bg-emerald-100 text-emerald-800';
                      label = 'Hoàn thành';
                    } else if (s === 'PROCESSING') {
                      color = 'bg-blue-100 text-blue-800';
                      label = 'Đang chuẩn bị';
                    } else if (s === 'SHIPPED' || s === 'SHIPPING') {
                      color = 'bg-purple-100 text-purple-800';
                      label = 'Đang giao hàng';
                    } else if (s === 'PENDING') {
                      color = 'bg-amber-100 text-amber-800';
                      label = 'Chờ xác nhận';
                    } else if (s === 'CANCELLED') {
                      color = 'bg-rose-100 text-rose-800';
                      label = 'Đã hủy';
                    }
                    return (
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
                        {label}
                      </span>
                    );
                  })()}
                </div>
              </div>
            )) || (
              <p className="text-center text-gray-500">No orders yet</p>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Top Products</h2>
          <div className="space-y-4">
            {productsData?.items.slice(0, 5).map((product: Product) => (
              <div key={product.id} className="flex items-center gap-4 border-b pb-3 last:border-0">
                <div className="h-12 w-12 rounded-lg bg-gray-200">
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full rounded-lg object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">${product.basePrice}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block rounded-full px-2 py-1 text-xs ${
                      product.isAvailable ?? true
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {(product.isAvailable ?? true) ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            )) || (
              <p className="text-center text-gray-500">No products yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
