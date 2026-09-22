'use client';

import Link from 'next/link';
import { RegisterForm } from '@/features/auth/components/register-form';
import { Home } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-white to-yellow-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Back to Home Button */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-orange-600"
        >
          <Home size={18} />
          Quay về trang chủ
        </Link>

        <div className="space-y-6">
          {/* Logo & Title */}
          <div className="text-center">
            <Link href="/" className="group inline-block">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-4xl shadow-lg transition-transform group-hover:scale-110">
                🥖
              </div>
            </Link>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Đăng ký tài khoản
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Tạo tài khoản tại{' '}
              <span className="font-semibold text-orange-600">Bánh Mì Sài Gòn</span>
            </p>
          </div>

          {/* Register Form Card */}
          <div className="rounded-2xl border border-gray-200 bg-white px-8 py-8 shadow-xl">
            <RegisterForm />
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <Link
              href="/auth/login"
              className="font-semibold text-orange-600 hover:text-orange-700 hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
