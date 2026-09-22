'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  LogOut,
  Menu,
  X,
  FolderTree,
  Layers,
  Ticket
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

const menuItems = [
  {
    title: 'Tổng quan',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Danh mục món',
    href: '/admin/categories',
    icon: FolderTree,
  },
  {
    title: 'Món ăn & Thực đơn',
    href: '/admin/products',
    icon: Package,
  },
  {
    title: 'Topping & Tùy chọn',
    href: '/admin/toppings',
    icon: Layers,
  },
  {
    title: 'Mã giảm giá',
    href: '/admin/coupons',
    icon: Ticket,
  },
  {
    title: 'Quản lý đơn hàng',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Quản lý người dùng',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Cài đặt hệ thống',
    href: '/admin/settings',
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/auth/login';
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 bg-gray-900 text-white transition-transform duration-300',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b border-gray-800 px-4">
            <h1 className="text-lg font-bold tracking-wide text-orange-400">🥖 Quản Trị Hệ Thống</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <Icon size={20} />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-gray-800 p-3">
            <button
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-gray-800 hover:text-red-300"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
