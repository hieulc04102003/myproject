'use client';

import { useParams } from 'next/navigation';
import { OrderDetailView } from '@/features/admin/components/orders/order-detail-view';

export default function StaffOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <OrderDetailView orderId={id} queryPrefix="staff" backHref="/staff/orders" />;
}
