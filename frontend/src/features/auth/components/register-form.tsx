'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { User, Phone, Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '../api/auth-service';

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanPhone = form.phoneNumber.trim();
    if (cleanPhone.length < 9) {
      setError('Vui lòng nhập số điện thoại hợp lệ (từ 9-11 chữ số).');
      return;
    }

    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.register({
        fullName: form.fullName.trim(),
        phoneNumber: cleanPhone,
        password: form.password,
      });

      setSuccessMsg(res.message || 'Đăng ký tài khoản thành công! Đang chuyển đến trang xác thực OTP...');
      setTimeout(() => {
        router.push(`/auth/verify-otp?phone=${encodeURIComponent(cleanPhone)}`);
      }, 1000);
    } catch (err: unknown) {
      const resData = (err as { response?: { data?: { message?: string } | string } })?.response?.data;
      const msg = (typeof resData === 'object' ? resData?.message : resData) || 'Đăng ký thất bại. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span className="leading-relaxed">{successMsg}</span>
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-1.5">
        <label htmlFor="fullName" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Họ và tên *
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="fullName"
            placeholder="Ví dụ: Nguyễn Văn A"
            value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            required
            className="h-11 pl-10 bg-gray-50 border-gray-200 rounded-xl focus:bg-white text-sm"
          />
        </div>
      </div>

      {/* Phone Number */}
      <div className="space-y-1.5">
        <label htmlFor="phoneNumber" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Số điện thoại nhận OTP *
        </label>
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="Ví dụ: 0901234567"
            value={form.phoneNumber}
            onChange={(e) => update('phoneNumber', e.target.value)}
            required
            autoComplete="tel"
            className="h-11 pl-10 bg-gray-50 border-gray-200 rounded-xl focus:bg-white text-sm"
          />
        </div>
        <p className="text-[11px] text-gray-500">Mã OTP sẽ được gửi về số điện thoại này qua eSMS.</p>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Mật khẩu (tối thiểu 6 ký tự) *
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            required
            autoComplete="new-password"
            className="h-11 pl-10 bg-gray-50 border-gray-200 rounded-xl focus:bg-white text-sm"
          />
        </div>
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Xác nhận mật khẩu *
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={(e) => update('confirmPassword', e.target.value)}
            required
            autoComplete="new-password"
            className="h-11 pl-10 bg-gray-50 border-gray-200 rounded-xl focus:bg-white text-sm"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-11 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-xl shadow-md transition-all disabled:opacity-60"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Đang đăng ký & gửi OTP...
          </span>
        ) : (
          'Đăng ký tài khoản'
        )}
      </Button>
    </form>
  );
}
