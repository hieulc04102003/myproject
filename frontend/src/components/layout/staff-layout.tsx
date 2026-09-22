'use client';

import { StaffSidebar } from './staff-sidebar';
import { StaffHeader } from './staff-header';

interface StaffLayoutProps {
  children: React.ReactNode;
}

export function StaffLayout({ children }: StaffLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <StaffSidebar />
      <div className="lg:pl-64">
        <StaffHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
