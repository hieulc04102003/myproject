'use client';

import { Bell, Search, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export function StaffHeader() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-6">
      <div className="flex flex-1 items-center gap-4">
        <form className="flex-1 max-w-md" onSubmit={(e) => e.preventDefault()}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Tìm kiếm sản phẩm, mã đơn hàng..."
              className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/70 pl-10 pr-4 text-sm focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </form>
      </div>

      <div className="flex items-center gap-3">
        <button 
          className="relative rounded-xl p-2.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          title="Thông báo"
        >
          <Bell size={19} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500" />
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 rounded-xl p-1.5 pr-2.5 hover:bg-gray-100 transition-colors"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-sm font-semibold text-white shadow-sm">
              {user?.fullName ? getInitials(user.fullName) : 'NV'}
            </div>
            <div className="hidden text-left text-sm lg:block">
              <div className="font-semibold text-gray-900 leading-tight">
                {user?.fullName || 'Nhân viên'}
              </div>
              <div className="text-xs text-orange-600 font-medium">
                {user?.role || 'Staff'}
              </div>
            </div>
            <ChevronDown
              size={15}
              className={`text-gray-400 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-100 bg-white shadow-xl py-1 z-50">
              <div className="border-b px-4 py-3">
                <p className="font-semibold text-gray-900 text-sm">{user?.fullName || 'Nhân viên'}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{user?.phoneNumber || user?.email || ''}</p>
              </div>
              
              <div className="py-1">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    router.push('/staff/profile');
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User size={16} className="text-gray-400" />
                  Hồ sơ cá nhân
                </button>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    router.push('/staff/settings');
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings size={16} className="text-gray-400" />
                  Cài đặt
                </button>
              </div>

              <div className="border-t py-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
