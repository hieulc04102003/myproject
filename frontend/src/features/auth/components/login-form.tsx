'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Lock, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth-store';
import { authService, persistAuth } from '../api/auth-service';

export function LoginForm() {
  const router = useRouter();
  const loginStore = useAuthStore((s) => s.login);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [unverifiedPhone, setUnverifiedPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setUnverifiedPhone(null);
    setLoading(true);

    const cleanPhone = phoneNumber.trim();

    try {
      const res = await authService.login({ phoneNumber: cleanPhone, password });
      const user = persistAuth(res);

      if (user) {
        if (!user.phoneNumber && cleanPhone) {
          user.phoneNumber = cleanPhone;
        }
        loginStore(user);
        await new Promise((resolve) => setTimeout(resolve, 200));

        const userRole = user.role?.toLowerCase();
        if (userRole === 'admin') {
          router.push('/admin');
          setTimeout(() => {
            if (window.location.pathname !== '/admin') {
              window.location.href = '/admin';
            }
          }, 500);
        } else if (userRole === 'staff') {
          router.push('/staff');
          setTimeout(() => {
            if (window.location.pathname !== '/staff') {
              window.location.href = '/staff';
            }
          }, 500);
        } else {
          router.push('/');
        }
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      const resData = (err as { response?: { data?: { message?: string } | string } })?.response?.data;
      const msg = (typeof resData === 'object' ? resData?.message : resData) || 'Đăng nhập thất bại. Vui lòng kiểm tra lại số điện thoại hoặc mật khẩu.';

      // Nếu tài khoản chưa xác thực OTP -> khóa đăng nhập và hiện nút chuyển sang trang xác thực OTP
      if (msg.includes('REQUIRE_OTP') || msg.includes('chưa được xác thực')) {
        let phoneToVerify = cleanPhone;
        const match = msg.match(/REQUIRE_OTP:([0-9+]+)/);
        if (match && match[1]) {
          phoneToVerify = match[1];
        }
        setUnverifiedPhone(phoneToVerify);
        setError('Tài khoản của bạn chưa được xác thực số điện thoại. Bạn không thể đăng nhập cho đến khi xác thực OTP thành công.');
        setTimeout(() => {
          router.push(`/auth/verify-otp?phone=${encodeURIComponent(phoneToVerify)}`);
        }, 2000);
        return;
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {unverifiedPhone && (
        <div className="rounded-2xl bg-amber-50 border border-amber-300 p-4 text-sm text-amber-900 shadow-sm space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950">Chưa xác thực số điện thoại!</p>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Tài khoản của bạn chưa được kích hoạt mã OTP. Hệ thống đã gửi mã xác thực tới SĐT <strong>{unverifiedPhone}</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push(`/auth/verify-otp?phone=${encodeURIComponent(unverifiedPhone)}`)}
            className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
          >
            👉 Bấm vào đây để nhập mã OTP ngay
          </button>
        </div>
      )}

      {error && !unverifiedPhone && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="phoneNumber" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Số điện thoại
        </label>
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="Ví dụ: 0901234567"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            autoComplete="tel"
            className="h-11 pl-10 bg-gray-50 border-gray-200 rounded-xl focus:bg-white text-sm"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Mật khẩu
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
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
            Đang đăng nhập...
          </span>
        ) : (
          'Đăng nhập'
        )}
      </Button>
    </form>
  );
}
