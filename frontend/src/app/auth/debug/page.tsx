'use client';

import { useAuthStore } from '@/store/auth-store';
import { useEffect, useState } from 'react';

export default function DebugPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [tokens, setTokens] = useState<{ access: string | null; refresh: string | null }>({
    access: null,
    refresh: null,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTokens({
        access: localStorage.getItem('accessToken'),
        refresh: localStorage.getItem('refreshToken'),
      });
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Auth Debug Page</h1>

      <div className="space-y-6">
        {/* Auth State */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Auth State</h2>
          <div className="space-y-2">
            <p>
              <strong>Is Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}
            </p>
            <p>
              <strong>User Object:</strong>
            </p>
            <pre className="rounded bg-gray-100 p-4">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>

        {/* Tokens */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Tokens</h2>
          <div className="space-y-2">
            <p>
              <strong>Access Token:</strong>
            </p>
            <pre className="overflow-x-auto rounded bg-gray-100 p-4 text-xs">
              {tokens.access || 'Not found'}
            </pre>
            <p>
              <strong>Refresh Token:</strong>
            </p>
            <pre className="overflow-x-auto rounded bg-gray-100 p-4 text-xs">
              {tokens.refresh || 'Not found'}
            </pre>
          </div>
        </div>

        {/* Role Check */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Role Check</h2>
          {user ? (
            <div className="space-y-2">
              <p>
                <strong>Raw Role:</strong> &quot;{user.role}&quot;
              </p>
              <p>
                <strong>Normalized Role:</strong> &quot;{user.role.toLowerCase()}&quot;
              </p>
              <p>
                <strong>Is Admin:</strong>{' '}
                {user.role.toLowerCase() === 'admin' ? '✅ Yes' : '❌ No'}
              </p>
              <p>
                <strong>Is Customer:</strong>{' '}
                {user.role.toLowerCase() === 'customer' ? '✅ Yes' : '❌ No'}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No user data</p>
          )}
        </div>

        {/* Actions */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Actions</h2>
          <div className="flex gap-4">
            <a
              href="/admin"
              className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
            >
              Go to Admin
            </a>
            <a
              href="/"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Go to Homepage
            </a>
            <a
              href="/auth/login"
              className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
