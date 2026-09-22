'use client';

import { CouponsManagement } from '@/features/admin/components/coupons-management';

export default function AdminCouponsPage() {
  return (
    <div className="space-y-6">
      <CouponsManagement role="admin" />
    </div>
  );
}
