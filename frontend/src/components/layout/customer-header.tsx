'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, User, Search, Menu, X, LogOut, Package, Shield, LayoutDashboard } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';

export function CustomerHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items } = useCartStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navLinks = [
    { href: '/', label: 'Trang chủ' },
    { href: '/products', label: 'Sản phẩm' },
    { href: '/about', label: 'Giới thiệu' },
    { href: '/contact', label: 'Liên hệ' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-primary">🥖</div>
            <span className="text-xl font-bold text-gray-900">Bánh Mì Sài Gòn</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === link.href ? 'text-primary' : 'text-gray-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <button className="rounded-lg p-2 text-gray-600 hover:bg-gray-100">
              <Search size={20} />
            </button>

            {/* Cart */}
            <Link href="/cart" className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100">
              <ShoppingCart size={20} />
              {cartItemsCount > 0 && (
                <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                    {getInitials(user.fullName)}
                  </div>
                  <span className="hidden text-sm font-medium text-gray-900 lg:block">
                    {user.fullName.split(' ').slice(-1)[0]}
                  </span>
                </button>

                {/* Dropdown */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-white shadow-lg">
                    <div className="border-b px-4 py-3">
                      <p className="font-medium text-gray-900">{user.fullName}</p>
                      <p className="text-sm text-gray-500">{user.email || user.phoneNumber}</p>
                    </div>
                    <div className="py-2">
                      {user.role?.toLowerCase() === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex w-full items-center gap-3 px-4 py-2 text-sm font-semibold text-purple-600 hover:bg-purple-50 transition-colors"
                        >
                          <Shield size={16} />
                          Trang quản trị (Admin)
                        </Link>
                      )}
                      {(user.role?.toLowerCase() === 'staff' || user.role?.toLowerCase() === 'admin') && (
                        <Link
                          href="/staff"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex w-full items-center gap-3 px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50 transition-colors"
                        >
                          <LayoutDashboard size={16} />
                          Kênh tác nghiệp (Staff)
                        </Link>
                      )}
                      <Link
                        href="/profile"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User size={16} />
                        Tài khoản
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Package size={16} />
                        Đơn hàng
                      </Link>
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
            ) : (
              <Link
                href="/auth/login"
                className="hidden rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 md:block"
              >
                Đăng nhập
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-t py-4 md:hidden">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === link.href ? 'text-primary' : 'text-gray-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <Link
                  href="/auth/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary/90"
                >
                  Đăng nhập
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
