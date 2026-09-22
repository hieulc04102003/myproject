import { AdminLayout } from '@/components/layout/admin-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}
