'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireStaff?: boolean;
  requireAuth?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireStaff = false,
  requireAuth = true 
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for hydration
  useEffect(() => {
    // Force rehydrate on mount
    useAuthStore.persist.rehydrate();
    
    // Wait a bit for hydration to complete
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only run checks after hydration
    if (!isHydrated) return;
    
    // Skip during SSR
    if (typeof window === 'undefined') return;

    // Check if authentication is required
    if (requireAuth && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Check if admin role is required
    if (requireAdmin && isAuthenticated) {
      if (!user) {
        router.push('/auth/login');
        return;
      }
      
      const userRole = user.role?.toLowerCase();
      
      if (userRole !== 'admin') {
        router.push('/');
        return;
      }
    }

    // Check if staff role (or admin) is required
    if (requireStaff && isAuthenticated) {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const userRole = user.role?.toLowerCase();
      const isStaffOrAdmin = userRole === 'staff' || userRole === 'admin';

      if (!isStaffOrAdmin) {
        router.push('/');
        return;
      }
    }
  }, [isHydrated, isAuthenticated, user, requireAuth, requireAdmin, requireStaff, router]);

  // Show loading while hydrating
  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication after hydration
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Check admin role after hydration
  if (requireAdmin && user) {
    const userRole = user.role?.toLowerCase();
    
    if (userRole !== 'admin') {
      return null;
    }
  }

  // Check staff role after hydration
  if (requireStaff && user) {
    const userRole = user.role?.toLowerCase();
    const isStaffOrAdmin = userRole === 'staff' || userRole === 'admin';

    if (!isStaffOrAdmin) {
      return null;
    }
  }

  return <>{children}</>;
}
