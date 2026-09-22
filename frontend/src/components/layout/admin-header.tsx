'use client';

import { Bell, Search, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export function AdminHeader() {
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

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Debug log
  useEffect(() => {
    console.log('AdminHeader - User:', user);
  }, [user]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-6">
      <div className="flex flex-1 items-center gap-4">
        <form className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Tìm kiếm thông tin..."
              className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </form>
      </div>

      <div className="flex items-center gap-4">
        <button 
          title="Thông báo"
          className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <Bell size={20} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-sm font-semibold text-white">
              {user ? getInitials(user.fullName) : 'U'}
            </div>
            <div className="hidden text-left text-sm lg:block">
              <div className="font-medium text-gray-900">
                {user?.fullName || 'Người dùng'}
              </div>
              <div className="text-xs text-gray-500">
                {user?.role === 'ADMIN' ? 'Quản trị viên' : user?.role === 'STAFF' ? 'Nhân viên' : (user?.role || 'Khách hàng')}
              </div>
            </div>
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-white shadow-lg">
              <div className="border-b px-4 py-3">
                <p className="font-medium text-gray-900">{user?.fullName || 'Người dùng'}</p>
                <p className="text-sm text-gray-500">{user?.email || user?.phoneNumber || ''}</p>
              </div>
              
              <div className="py-2">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    router.push('/admin/profile');
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User size={16} />
                  Hồ sơ cá nhân
                </button>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    router.push('/admin/settings');
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings size={16} />
                  Cài đặt
                </button>
              </div>

              <div className="border-t py-2">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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
