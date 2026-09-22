'use client';

/**
 * Header Component - Main navigation with cart and user menu
 */

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, Menu as MenuIcon, LogIn, UserPlus, ShoppingBag, LogOut, Shield, Store, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { formatCurrency } from '@/lib/utils';
import { SearchBar } from '@/features/home/components/search-bar';
import { CartDrawer } from '@/features/cart/components/cart-drawer';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onCartClick?: () => void;
}

export function Header({ onSearch, onCartClick }: HeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const totalItems = useCartStore((state) => state.totalItems);
  const subtotal = useCartStore((state) => state.subtotal);
  const { user, isAuthenticated, logout } = useAuthStore();

  // Hydration fix for Zustand
  useEffect(() => {
    setMounted(true);
    useCartStore.persist.rehydrate();
    useAuthStore.persist.rehydrate();
  }, []);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const handleCartClick = () => {
    if (onCartClick) {
      onCartClick();
    } else {
      setCartOpen(true);
    }
  };

  return (
    <>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        {/* Top Bar - Announcement */}
        <div className="bg-orange-600 text-white text-center py-2 px-4 text-sm">
          <p className="container mx-auto">
            🔥 <strong>Ưu đãi hôm nay:</strong> Giảm 20.000đ cho đơn hàng từ 100.000đ - Mã: <strong>GIAM20K</strong>
          </p>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo & Brand */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">BM</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-lg text-gray-900">Bánh Mì Sài Gòn</h1>
                <p className="text-xs text-gray-600">Nóng giòn - Ngon tuyệt</p>
              </div>
            </Link>

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:block flex-1 max-w-xl">
              {onSearch && <SearchBar onSearch={onSearch} />}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Cart Button */}
              <button
                type="button"
                onClick={handleCartClick}
                className="relative flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2 rounded-2xl bg-orange-50 hover:bg-orange-100/90 text-orange-700 border border-orange-200/80 transition-all active:scale-95 shadow-2xs text-xs sm:text-sm cursor-pointer"
                title="Xem giỏ hàng"
              >
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0" />
                {mounted && totalItems > 0 ? (
                  <>
                    <span className="font-extrabold text-orange-600 text-xs sm:text-sm">
                      {formatCurrency(subtotal)}
                    </span>
                    <span className="absolute -top-1.5 -right-1.5 h-5 min-w-[20px] px-1 rounded-full bg-red-600 text-white font-black text-[11px] flex items-center justify-center shadow-md">
                      {totalItems}
                    </span>
                  </>
                ) : (
                  <span className="hidden sm:inline font-semibold text-slate-700 text-xs sm:text-sm">
                    Giỏ hàng
                  </span>
                )}
              </button>

              {/* User Menu */}
              {mounted && isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-full hover:bg-orange-50 border border-transparent hover:border-orange-200 transition-all text-left focus:outline-none"
                    title="Tài khoản cá nhân"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0">
                      {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                    </div>
                    <div className="hidden sm:block text-left leading-tight pr-1">
                      <p className="font-semibold text-xs text-gray-800 line-clamp-1 max-w-[130px]">
                        {user?.fullName || 'Khách hàng'}
                      </p>
                      <p className="text-[10px] text-gray-500">Tài khoản</p>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400 hidden sm:block" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                      {/* User Header Info */}
                      <div className="px-4 py-2.5 border-b border-gray-100">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {user?.fullName || 'Khách hàng'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="h-4 w-4 text-orange-500" />
                          <span>Hồ sơ cá nhân</span>
                        </Link>

                        <Link
                          href="/orders"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <ShoppingBag className="h-4 w-4 text-gray-500" />
                          <span>Đơn hàng của tôi</span>
                        </Link>

                        {user?.role?.toLowerCase() === 'admin' && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-purple-700 font-medium hover:bg-purple-50 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Shield className="h-4 w-4 text-purple-600" />
                            <span>Trang quản trị (Admin)</span>
                          </Link>
                        )}

                        {(user?.role?.toLowerCase() === 'staff' || user?.role?.toLowerCase() === 'admin') && (
                          <Link
                            href="/staff"
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-orange-700 font-medium hover:bg-orange-50 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Store className="h-4 w-4 text-orange-600" />
                            <span>Kênh tác nghiệp (Staff)</span>
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-gray-100 pt-1 mt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                        >
                          <LogOut className="h-4 w-4 text-red-500" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/auth/login">
                      <LogIn className="h-4 w-4 mr-2" />
                      Đăng nhập
                    </Link>
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700"
                    asChild
                  >
                    <Link href="/auth/register">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Đăng ký
                    </Link>
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button -> điều hướng nhanh tới thực đơn */}
              <Link
                href="/homepage#products"
                className="md:hidden inline-flex"
                aria-label="Xem thực đơn"
              >
                <Button variant="ghost" size="icon">
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-4">
            {onSearch && <SearchBar onSearch={onSearch} />}
          </div>
        </div>
      </header>
    </>
  );
}
