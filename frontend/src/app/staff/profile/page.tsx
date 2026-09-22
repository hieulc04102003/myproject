'use client';

import { useAuthStore } from '@/store/auth-store';
import { Mail, Phone, Shield } from 'lucide-react';

export default function StaffProfilePage() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-gray-500 text-sm font-medium">Vui lòng đăng nhập để xem hồ sơ nhân viên</p>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
        <p className="text-sm text-gray-500 mt-1">Thông tin tài khoản và quyền hạn nhân viên trong hệ thống</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <div className="md:col-span-2 rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-600 text-xl font-bold text-white shadow-md">
              {getInitials(user.fullName)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.fullName}</h2>
              <span className="mt-1 inline-block rounded-full bg-orange-50 px-3 py-0.5 text-xs font-semibold text-orange-700 border border-orange-200">
                {user.role}
              </span>
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
              Chi tiết tài khoản
            </h3>
            
            <div className="grid gap-4">
              {user.phoneNumber && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/70 border border-gray-100">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400">Số điện thoại</p>
                    <p className="font-semibold text-sm text-gray-900">{user.phoneNumber}</p>
                  </div>
                </div>
              )}

              {user.email && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/70 border border-gray-100">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400">Email</p>
                    <p className="font-semibold text-sm text-gray-900">{user.email}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/70 border border-gray-100">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                  <Shield size={18} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400">Phân quyền</p>
                  <p className="font-semibold text-sm text-gray-900">{user.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick status */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-900">Trạng thái làm việc</h3>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Tài khoản đang hoạt động bình thường
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Bạn có quyền xem và xử lý đơn hàng, thêm sửa sản phẩm và quản lý danh mục phân loại.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
