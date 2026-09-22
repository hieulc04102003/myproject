'use client';

import { ToppingsManagement } from '@/features/admin/components/toppings-management';

export default function StaffToppingsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <ToppingsManagement role="staff" />
    </div>
  );
}
