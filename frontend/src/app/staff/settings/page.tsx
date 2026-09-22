'use client';

import { Settings, Bell, Shield, Sliders } from 'lucide-react';
import { useState } from 'react';

export default function StaffSettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Cài đặt tác nghiệp</h1>
        <p className="text-sm text-gray-500 mt-1">Cấu hình giao diện và thông báo tác nghiệp cho nhân viên</p>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Notifications */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-50 p-2.5 text-orange-600">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Thông báo đơn hàng</h2>
              <p className="text-xs text-gray-500">Nhận cảnh báo khi có đơn hàng mới</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-xs font-semibold text-gray-700">Thông báo âm thanh khi có đơn mới</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-xs font-semibold text-gray-700">Email nhắc nhở đơn chờ duyệt quá 30 phút</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-xs font-semibold text-gray-700">Thông báo khi sản phẩm sắp hết hàng (&lt; 5 chiếc)</span>
            </label>
          </div>
        </div>

        {/* Workspace Display */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <Sliders size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Hiển thị tác nghiệp</h2>
              <p className="text-xs text-gray-500">Tùy biến bảng dữ liệu</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-xs font-semibold text-gray-700">Tự động làm mới danh sách đơn mỗi 60 giây</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-xs font-semibold text-gray-700">Hiển thị hình thu nhỏ sản phẩm trong bảng</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 transition-colors shadow-sm"
        >
          {saved ? 'Đã lưu thiết lập!' : 'Lưu thay đổi'}
        </button>
      </div>
    </div>
  );
}
