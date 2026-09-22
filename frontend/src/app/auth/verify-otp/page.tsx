'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Home, ShieldCheck, ArrowLeft, Loader2, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService, persistAuth } from '@/features/auth/api/auth-service';
import { useAuthStore } from '@/store/auth-store';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get('phone') || '';
  const loginStore = useAuthStore((s) => s.login);

  const [phoneNumber, setPhoneNumber] = useState(phoneParam);
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (phoneParam) {
      setPhoneNumber(phoneParam);
    }
  }, [phoneParam]);

  // Countdown timer 60s
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanPhone = phoneNumber.trim();
    const cleanOtp = otpCode.trim();

    if (!cleanPhone) {
      setError('Vui lòng cung cấp số điện thoại cần xác thực.');
      return;
    }

    if (cleanOtp.length < 6) {
      setError('Vui lòng nhập đủ 6 chữ số mã OTP.');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await authService.verifyOtp({
        phoneNumber: cleanPhone,
        otpCode: cleanOtp,
      });

      const user = persistAuth(res);
      if (user) {
        loginStore(user);
        setSuccessMsg('Xác thực tài khoản thành công! Đang chuyển hướng...');
        setTimeout(() => {
          const userRole = user.role?.toLowerCase();
          if (userRole === 'admin') {
            router.push('/admin');
          } else if (userRole === 'staff') {
            router.push('/staff');
          } else {
            router.push('/');
          }
        }, 800);
      }
    } catch (err: unknown) {
      const resData = (err as { response?: { data?: { message?: string } | string } })?.response?.data;
      const msg = (typeof resData === 'object' ? resData?.message : resData) || 'Mã OTP không chính xác hoặc đã hết hạn. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || isResending) return;
    setError(null);
    setSuccessMsg(null);

    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone) {
      setError('Vui lòng nhập số điện thoại để gửi lại mã.');
      return;
    }

    setIsResending(true);
    try {
      const res = await authService.resendOtp(cleanPhone);
      setSuccessMsg(res.message || 'Mã OTP mới đã được gửi thành công.');
      setCountdown(res.retryAfterSeconds || 60);
    } catch (err: unknown) {
      const resData = (err as { response?: { data?: { message?: string } | string } })?.response?.data;
      const msg = (typeof resData === 'object' ? resData?.message : resData) || 'Chưa thể gửi lại mã. Vui lòng đợi hết thời gian chờ.';
      setError(msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Back link */}
      <Link
        href="/auth/login"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-orange-600"
      >
        <ArrowLeft size={18} />
        Quay lại đăng nhập
      </Link>

      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 mb-4 shadow-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Xác thực số điện thoại
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Nhập mã OTP 6 chữ số được gửi tới số{' '}
            <strong className="text-orange-600">{phoneNumber || 'điện thoại của bạn'}</strong>
          </p>
        </div>

        {/* Card Form */}
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl space-y-5">
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

          <form onSubmit={handleVerify} className="space-y-4">
            {/* Phone (read-only if pre-filled, or editable) */}
            {!phoneParam && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Số điện thoại
                </label>
                <Input
                  type="tel"
                  placeholder="0901234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="h-11 bg-gray-50 border-gray-200 rounded-xl"
                />
              </div>
            )}

            {/* OTP Input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider text-center">
                Mã xác thực OTP (6 chữ số)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="------"
                autoFocus
                required
                className="w-full h-14 text-center text-3xl font-mono tracking-[0.5em] bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-orange-500 focus:outline-none transition-all font-bold text-gray-900"
              />
              <p className="text-[11px] text-gray-500 text-center">
                Mã có hiệu lực trong vòng 5 phút
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isVerifying || otpCode.length < 6}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-60"
            >
              {isVerifying ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang xác thực...
                </span>
              ) : (
                'Xác nhận kích hoạt'
              )}
            </Button>
          </form>

          {/* Resend OTP with 60s cooldown */}
          <div className="pt-3 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500 mb-2">Chưa nhận được mã OTP?</p>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={countdown > 0 || isResending}
              className={`inline-flex items-center gap-1.5 text-xs font-bold transition-colors ${
                countdown > 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-orange-600 hover:text-orange-700 hover:underline'
              }`}
            >
              {isResending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang gửi lại...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>
                    {countdown > 0 ? `Gửi lại mã sau ${countdown}s` : 'Gửi lại mã OTP'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-white to-yellow-50 px-4 py-12 sm:px-6 lg:px-8">
      <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-orange-600" />}>
        <VerifyOtpContent />
      </Suspense>
    </div>
  );
}
