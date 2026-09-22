'use client';

import { ToppingsManagement } from '@/features/admin/components/toppings-management';

export default function AdminToppingsPage() {
  return (
    <div className="space-y-6">
      <ToppingsManagement role="admin" />
    </div>
  );
}
