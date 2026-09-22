'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  User as UserIcon,
  ShoppingBag,
  MapPin,
  Star,
  Home,
} from 'lucide-react';
import Link from 'next/link';
import { adminUsersApi, type UserAddress } from '@/lib/api/admin';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name: string) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─── Address Card ─────────────────────────────────────────────────────────────
function AddressCard({ address }: { address: UserAddress }) {
  return (
    <div
      className={`relative rounded-2xl border p-4 transition-all ${
        address.isDefault
          ? 'border-orange-200 bg-orange-50/50'
          : 'border-gray-100 bg-gray-50/60'
      }`}
    >
      {address.isDefault && (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700 border border-orange-200">
          <Star size={9} className="fill-orange-500 text-orange-500" />
          Mặc định
        </span>
      )}

      <div className="flex items-start gap-3">
        <div className={`mt-0.5 rounded-xl p-2 ${address.isDefault ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-500'}`}>
          <Home size={14} />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-gray-900">{address.recipientName}</p>
            <span className="text-xs text-gray-400">·</span>
            <p className="text-xs font-medium text-gray-600">{address.phoneNumber}</p>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">{address.fullAddress}</p>
          <p className="text-[10px] text-gray-400">
            Thêm ngày {new Date(address.createdAt).toLocaleDateString('vi-VN')}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Address Skeleton ─────────────────────────────────────────────────────────
function AddressSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-2">
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-xl bg-gray-200 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-32 rounded bg-gray-200" />
              <div className="h-3 w-48 rounded bg-gray-100" />
              <div className="h-2.5 w-20 rounded bg-gray-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const { data: user, isLoading } = useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn: () => adminUsersApi.getById(userId),
  });

  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ['admin', 'users', userId, 'addresses'],
    queryFn: () => adminUsersApi.getAddresses(userId),
    enabled: !!userId,
  });

  // ── Loading ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Đang tải thông tin người dùng...</p>
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────
  if (!user) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center max-w-md mx-auto my-12 shadow-sm space-y-4">
        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Không tìm thấy người dùng</h2>
        <p className="text-sm text-gray-500">Người dùng này không tồn tại hoặc đã bị xóa.</p>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={16} />
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const isAdmin = user.role?.toLowerCase() === 'admin';
  const defaultAddress = addresses?.find((a) => a.isDefault);
  const otherAddresses = addresses?.filter((a) => !a.isDefault) ?? [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/users"
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
            title="Quay lại danh sách"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Hồ sơ người dùng</h1>
            <p className="text-sm text-gray-500 mt-0.5">Xem toàn bộ thông tin tài khoản và phân quyền</p>
          </div>
        </div>
        <Link
          href={`/admin/orders?userId=${user.id}`}
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ShoppingBag size={16} />
          Xem đơn hàng
        </Link>
      </div>

      {/* ── Main Grid ──────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left 2 cols ──────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Hero card */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Avatar */}
              <div className="relative shrink-0">
                {user.avatar || user.avatarUrl ? (
                  <img
                    src={user.avatar || user.avatarUrl}
                    alt={user.fullName}
                    className="h-20 w-20 rounded-2xl object-cover border-2 border-orange-100 shadow-md"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shadow-orange-500/20">
                    {getInitials(user.fullName)}
                  </div>
                )}
                <span
                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                    user.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  title={user.isActive ? 'Đang hoạt động' : 'Tạm khóa'}
                />
              </div>

              {/* Name & badges */}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-2xl font-bold text-gray-900">{user.fullName}</h2>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      isAdmin
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {isAdmin ? '🛡️ Admin' : '👤 Customer'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium ${
                      user.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {user.isActive ? 'Tài khoản hoạt động' : 'Tài khoản tạm khóa'}
                  </span>
                  {user.isPhoneVerified !== undefined && (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium ${
                        user.isPhoneVerified
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {user.isPhoneVerified ? (
                        <><CheckCircle2 size={12} className="text-blue-600" /> Đã xác thực SĐT</>
                      ) : (
                        <><AlertCircle size={12} className="text-amber-600" /> Chưa xác thực OTP</>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>


          </div>

          {/* Contact & Security */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Thông tin liên hệ & Bảo mật
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
                <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl shrink-0">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Số điện thoại</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{user.phoneNumber || 'Chưa cung cấp'}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Đăng nhập & nhận OTP</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
                <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl shrink-0">
                  <Mail size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Email</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5 truncate">{user.email || 'Chưa liên kết'}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Nhận thông báo đơn hàng</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
                <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl shrink-0">
                  <Shield size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Phân quyền</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5 capitalize">{user.role}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {isAdmin ? 'Toàn quyền quản trị' : 'Quyền mua hàng'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
                <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl shrink-0">
                  <UserIcon size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Họ và tên</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{user.fullName}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Tên trên đơn hàng</p>
                </div>
              </div>
            </div>
          </div>

          {/* Addresses section */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
                <MapPin size={16} className="text-orange-500" />
                Địa chỉ giao hàng
              </h3>
              {!addressesLoading && addresses && (
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                  {addresses.length} địa chỉ
                </span>
              )}
            </div>

            {addressesLoading ? (
              <AddressSkeleton />
            ) : !addresses || addresses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-300">
                  <MapPin size={22} />
                </div>
                <p className="text-sm font-medium text-gray-500">Chưa có địa chỉ nào</p>
                <p className="mt-1 text-xs text-gray-400">Người dùng chưa lưu địa chỉ giao hàng.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Default address first */}
                {defaultAddress && <AddressCard address={defaultAddress} />}
                {otherAddresses.map((addr) => (
                  <AddressCard key={addr.id} address={addr} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right 1 col ───────────────────────────────────── */}
        <div className="space-y-6">
          {/* Timestamps */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Thời gian & Nhật ký
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-gray-700">
                <div className="p-2 bg-gray-100 text-gray-600 rounded-lg mt-0.5 shrink-0">
                  <Calendar size={15} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Ngày tạo tài khoản
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">
                    {new Date(user.createdAt).toLocaleString('vi-VN', {
                      year: 'numeric', month: '2-digit', day: '2-digit',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-gray-700">
                <div className="p-2 bg-gray-100 text-gray-600 rounded-lg mt-0.5 shrink-0">
                  <Clock size={15} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Cập nhật gần nhất
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">
                    {new Date(user.updatedAt).toLocaleString('vi-VN', {
                      year: 'numeric', month: '2-digit', day: '2-digit',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Address summary card */}
          {!addressesLoading && addresses && addresses.length > 0 && (
            <div className="rounded-3xl border border-orange-100 bg-orange-50/40 p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <MapPin size={14} className="text-orange-500" />
                Địa chỉ mặc định
              </h3>
              {defaultAddress ? (
                <div className="text-xs text-gray-700 space-y-1">
                  <p className="font-semibold">{defaultAddress.recipientName}</p>
                  <p className="text-gray-500">{defaultAddress.phoneNumber}</p>
                  <p className="text-gray-600 leading-relaxed">{defaultAddress.fullAddress}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">Chưa đặt địa chỉ mặc định</p>
              )}
            </div>
          )}

          {/* Quick actions */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Thao tác
            </h3>
            <Link
              href="/admin/users"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={13} />
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
