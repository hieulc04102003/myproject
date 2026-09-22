'use client';

import { OrdersView } from '@/features/admin/components/orders/orders-view';

export default function AdminOrdersPage() {
  return <OrdersView queryPrefix="admin" baseHref="/admin/orders" />;
}
