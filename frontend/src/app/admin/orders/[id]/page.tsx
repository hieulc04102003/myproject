'use client';

import { useParams } from 'next/navigation';
import { OrderDetailView } from '@/features/admin/components/orders/order-detail-view';

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <OrderDetailView orderId={id} queryPrefix="admin" backHref="/admin/orders" />;
}
