'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Edit3, 
  ShoppingBag, 
  Clock, 
  ChevronRight, 
  ArrowLeft,
  X,
  Save,
  AlertCircle,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useAuthStore } from '@/store/auth-store';
import { userProfileApi, type UserProfile } from '@/lib/api/user';
import { AddressManager } from '@/components/address/address-manager';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function CustomerProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: authUser, setUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'info' | 'addresses'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
  });

  // Query latest user profile from backend
  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => userProfileApi.getProfile(),
    enabled: !!authUser,
    staleTime: 60 * 1000,
  });

  const currentUser = profile || (authUser as unknown as UserProfile);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        fullName: currentUser.fullName || '',
        email: currentUser.email || '',
        phoneNumber: currentUser.phoneNumber || '',
      });
    }
  }, [currentUser]);

  // Mutation to update profile
  const updateMutation = useMutation({
    mutationFn: (data: { fullName: string; email?: string; phoneNumber?: string }) =>
      userProfileApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      // Sync into React Query cache
      queryClient.setQueryData(['user', 'profile'], updatedUser);
      // Sync into Zustand global auth store (updating Header & all components)
      if (authUser) {
        setUser({
          ...authUser,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          phoneNumber: updatedUser.phoneNumber,
        });
      }
      setIsEditing(false);
      setSuccessMessage('Cập nhật thông tin hồ sơ thành công!');
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setErrorMessage(msg || 'Cập nhật hồ sơ thất bại. Vui lòng thử lại.');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      setErrorMessage('Họ và tên phải có tối thiểu 2 ký tự.');
      return;
    }

    setErrorMessage(null);
    await updateMutation.mutateAsync({
      fullName: formData.fullName.trim(),
      email: formData.email.trim() || undefined,
      phoneNumber: formData.phoneNumber.trim() || undefined,
    });
  };

  const handleCancelEdit = () => {
    if (currentUser) {
      setFormData({
        fullName: currentUser.fullName || '',
        email: currentUser.email || '',
        phoneNumber: currentUser.phoneNumber || '',
      });
    }
    setIsEditing(false);
    setErrorMessage(null);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'KH';
    return name
      .trim()
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Mới tham gia';
    try {
      const d = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(d);
    } catch {
      return dateString;
    }
  };

  // State: Not logged in
  if (!authUser && !isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-20 flex-1 max-w-md text-center">
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              <User className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Vui lòng đăng nhập</h2>
            <p className="text-sm text-gray-500">
              Đăng nhập để xem và cập nhật thông tin hồ sơ của bạn.
            </p>
            <div className="pt-2">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center w-full rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-orange-700 transition-colors"
              >
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
          <Link href="/homepage" className="hover:text-orange-600 transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          <span className="font-medium text-gray-900">Hồ sơ cá nhân</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Hồ sơ tài khoản
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý thông tin cá nhân và sổ địa chỉ giao nhận của bạn
            </p>
          </div>

          {activeTab === 'info' && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-xs hover:bg-gray-50 hover:border-orange-300 hover:text-orange-600 transition-all self-start sm:self-auto"
            >
              <Edit3 className="h-4 w-4" />
              <span>Chỉnh sửa thông tin</span>
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200/80 pb-3">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'info'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Thông tin cá nhân</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'addresses'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80'
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>Sổ địa chỉ nhận hàng</span>
          </button>
        </div>

        {activeTab === 'addresses' ? (
          <AddressManager
            defaultRecipientName={currentUser?.fullName}
            defaultPhoneNumber={currentUser?.phoneNumber}
          />
        ) : (
          <>
            {/* Alerts */}
            {successMessage && (
              <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 border border-emerald-200 text-emerald-800 animate-in fade-in">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                <span className="text-sm font-medium">{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 border border-red-200 text-red-800 animate-in fade-in">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                <span className="text-sm font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Profile Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Cover / Header banner */}
          <div className="h-28 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 relative" />

          <div className="px-6 sm:px-8 pb-8 pt-0 relative">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-6">
              <div className="flex items-end gap-4">
                <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl bg-white p-1.5 shadow-md border-2 border-white">
                  <div className="flex h-full w-full items-center justify-center rounded-xl bg-orange-600 text-2xl font-black text-white shadow-inner">
                    {getInitials(currentUser?.fullName)}
                  </div>
                </div>

                <div className="space-y-1 mb-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {currentUser?.fullName || 'Khách hàng'}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700 border border-orange-200">
                      Khách hàng thân thiết
                    </span>
                    {currentUser?.isPhoneVerified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="h-3 w-3" />
                        Đã xác minh số điện thoại
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Content: View or Edit Mode */}
            {isEditing ? (
              /* --- EDIT MODE --- */
              <form onSubmit={handleSubmit} className="border-t border-gray-100 pt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900">
                    Chỉnh sửa thông tin cá nhân
                  </h3>
                  <span className="text-xs text-gray-400">
                    Vui lòng điền đúng thông tin để nhận hàng thuận tiện
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Họ và tên *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Nhập họ và tên đầy đủ"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 py-2.5 text-sm focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Số điện thoại *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Phone className="h-4 w-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        placeholder="0912345678"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 py-2.5 text-sm focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Địa chỉ Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="example@gmail.com"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 py-2.5 text-sm focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={updateMutation.isPending}
                    className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-orange-700 disabled:opacity-50 transition-all active:scale-[0.98]"
                  >
                    <Save className="h-4 w-4" />
                    <span>{updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* --- VIEW MODE --- */
              <div className="border-t border-gray-100 pt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="flex items-center gap-3.5 rounded-2xl bg-gray-50/80 p-4 border border-gray-100">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Họ và tên</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">
                        {currentUser?.fullName || 'Chưa cập nhật'}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-3.5 rounded-2xl bg-gray-50/80 p-4 border border-gray-100">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Số điện thoại</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">
                        {currentUser?.phoneNumber || 'Chưa cập nhật'}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-3.5 rounded-2xl bg-gray-50/80 p-4 border border-gray-100">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Địa chỉ Email</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">
                        {currentUser?.email || 'Chưa thiết lập'}
                      </p>
                    </div>
                  </div>

                  {/* Created At */}
                  <div className="flex items-center gap-3.5 rounded-2xl bg-gray-50/80 p-4 border border-gray-100">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Ngày tham gia</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">
                        {formatDate(currentUser?.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        </>
        )}

        {/* Quick Access Services */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <Link
            href="/orders"
            className="group flex items-center justify-between rounded-3xl bg-white p-5 border border-gray-100 shadow-xs hover:border-orange-200 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                  Đơn hàng của tôi
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Lịch sử & tình trạng giao hàng
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 group-hover:text-orange-600 transition-all" />
          </Link>

          <Link
            href="/cart"
            className="group flex items-center justify-between rounded-3xl bg-white p-5 border border-gray-100 shadow-xs hover:border-orange-200 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 group-hover:scale-105 transition-transform">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                  Giỏ hàng hiện tại
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Các món đang chuẩn bị đặt
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 group-hover:text-orange-600 transition-all" />
          </Link>

          <Link
            href="/homepage"
            className="group flex items-center justify-between rounded-3xl bg-white p-5 border border-gray-100 shadow-xs hover:border-orange-200 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600 group-hover:scale-105 transition-transform">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                  Khám phá thực đơn
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Đặt thêm các món ngon nóng hổi
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 group-hover:text-orange-600 transition-all" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
