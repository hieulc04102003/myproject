'use client';

import { OrdersView } from '@/features/admin/components/orders/orders-view';

export default function StaffOrdersPage() {
  return <OrdersView queryPrefix="staff" baseHref="/staff/orders" />;
}
