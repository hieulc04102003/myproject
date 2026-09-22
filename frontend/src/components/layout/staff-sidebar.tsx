'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FolderTree,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Layers,
  Ticket
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

const staffMenuItems = [
  {
    title: 'Tổng quan',
    href: '/staff',
    icon: LayoutDashboard,
  },
  {
    title: 'Danh mục',
    href: '/staff/categories',
    icon: FolderTree,
  },
  {
    title: 'Sản phẩm',
    href: '/staff/products',
    icon: Package,
  },
  {
    title: 'Topping & Tùy chọn',
    href: '/staff/toppings',
    icon: Layers,
  },
  {
    title: 'Mã giảm giá',
    href: '/staff/coupons',
    icon: Ticket,
  },
  {
    title: 'Đơn hàng',
    href: '/staff/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Cài đặt',
    href: '/staff/settings',
    icon: Settings,
  },
  {
    title: 'Hồ sơ cá nhân',
    href: '/staff/profile',
    icon: User,
  },
];

export function StaffSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/auth/login';
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md border"
        aria-label="Toggle Menu"
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
          'fixed left-0 top-0 z-40 h-screen w-64 bg-slate-900 text-white transition-transform duration-300',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo & Brand */}
          <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 text-white font-bold shadow-md">
                HN
              </div>
              <div>
                <h1 className="text-base font-bold leading-none text-white">Staff Portal</h1>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-400" />
                  Khu vực tác nghiệp
                </p>
              </div>
            </div>
            <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[10px] font-semibold text-orange-400 border border-orange-500/30">
              Staff
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 px-3 py-5 overflow-y-auto">
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Menu nghiệp vụ
            </div>
            {staffMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = 
                item.href === '/staff' 
                  ? pathname === '/staff'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-orange-600 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <Icon size={19} className={isActive ? 'text-white' : 'text-slate-400'} />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-slate-800 p-4 bg-slate-950/40">
            <div className="flex items-center gap-3 mb-3 px-1">
              <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-orange-400 border border-slate-700">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.fullName || 'Nhân viên'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.phoneNumber || user?.email || 'Staff'}</p>
              </div>
            </div>

            <button
              className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-400 transition-colors bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20"
              onClick={handleLogout}
            >
              <LogOut size={15} />
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
