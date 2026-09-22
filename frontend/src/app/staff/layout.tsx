import { StaffLayout } from '@/components/layout/staff-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireStaff={true}>
      <StaffLayout>{children}</StaffLayout>
    </ProtectedRoute>
  );
}
