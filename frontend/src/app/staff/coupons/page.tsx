'use client';

import { CouponsManagement } from '@/features/admin/components/coupons-management';

export default function StaffCouponsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <CouponsManagement role="staff" />
    </div>
  );
}
