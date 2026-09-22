'use client';

/**
 * Cart Drawer — Slide-in panel giỏ hàng cao cấp chuẩn chuỗi F&B thực tế
 * Sử dụng React Portal gắn trực tiếp vào document.body với z-[9999] để không bao giờ bị che khuất
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Truck, 
  Ticket, 
  ShieldCheck, 
  Copy,
  Check
} from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const FREESHIP_THRESHOLD = 120000; // Mốc Freeship 120.000đ

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [copiedVoucher, setCopiedVoucher] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const { items, subtotal, totalItems, removeItem, updateQuantity, clearCart } = useCartStore();

  // Đảm bảo chỉ render Portal trên Client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Khóa cuộn màn hình phía sau khi mở giỏ hàng
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setShowClearConfirm(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Lắng nghe phím ESC để đóng giỏ hàng
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const handleCopyVoucher = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedVoucher(true);
    setTimeout(() => setCopiedVoucher(false), 2000);
  };

  const handleClearAll = () => {
    clearCart();
    setShowClearConfirm(false);
  };

  if (!mounted) return null;

  // Tính toán chỉ số Freeship
  const amountNeededForFreeship = Math.max(0, FREESHIP_THRESHOLD - subtotal);
  const freeshipProgress = Math.min(100, Math.round((subtotal / FREESHIP_THRESHOLD) * 100));
  const isFreeshipEligible = subtotal >= FREESHIP_THRESHOLD;

  const drawerContent = (
    <div
      className={`fixed inset-0 z-[9999] transition-visibility duration-300 ${
        open ? 'visible' : 'invisible pointer-events-none'
      }`}
    >
      {/* 1. Backdrop làm mờ kính nhẹ nhàng */}
      <div
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 ease-out ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Slide-in Drawer Panel */}
      <aside
        className={`fixed inset-y-0 right-0 w-full max-w-[440px] bg-white shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Giỏ hàng của bạn"
        aria-modal="true"
      >
        {/* ================= TOP HEADER ================= */}
        <div className="relative border-b border-slate-100 bg-white px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center border border-orange-200/60 shadow-2xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Giỏ Hàng Của Bạn
                </h2>
                {totalItems > 0 && (
                  <span className="bg-orange-100 text-orange-700 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                    {totalItems} món
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Giao hàng nóng giòn trong vòng 20 phút
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {items.length > 0 && (
              <>
                {showClearConfirm ? (
                  <div className="flex items-center gap-1 bg-red-50 p-1 rounded-xl border border-red-200">
                    <button
                      onClick={handleClearAll}
                      className="text-[11px] font-bold text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded-lg transition-colors"
                      title="Xác nhận xóa hết"
                    >
                      Xóa
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="text-[11px] font-semibold text-slate-600 hover:bg-slate-200 px-1.5 py-1 rounded-lg transition-colors"
                      title="Hủy"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Xóa tất cả món trong giỏ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors focus:outline-none"
              aria-label="Đóng giỏ hàng"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ================= FREESHIP PROGRESS BAR ================= */}
        {items.length > 0 && (
          <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 px-5 py-2.5 border-b border-orange-100/80 flex-shrink-0">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <Truck className="w-3.5 h-3.5 text-orange-600" />
                {isFreeshipEligible ? (
                  <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                    <span>🎉 Bạn đã được Miễn Phí Vận Chuyển!</span>
                  </span>
                ) : (
                  <span className="text-slate-700">
                    Mua thêm <strong className="text-orange-600">{formatCurrency(amountNeededForFreeship)}</strong> để nhận <strong className="text-orange-600">FREESHIP</strong>
                  </span>
                )}
              </div>
              <span className="text-[11px] font-bold text-orange-600">
                {freeshipProgress}%
              </span>
            </div>

            {/* Visual Bar */}
            <div className="w-full bg-white/80 rounded-full h-2 overflow-hidden border border-orange-200/50 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isFreeshipEligible 
                    ? 'bg-emerald-500' 
                    : 'bg-gradient-to-r from-orange-500 to-amber-500'
                }`}
                style={{ width: `${freeshipProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* ================= ITEMS LIST ================= */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center px-4">
              <div className="w-20 h-20 rounded-3xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 mb-4 shadow-inner">
                <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                Giỏ hàng của bạn đang trống
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-[240px] leading-relaxed">
                Những ổ bánh mì nóng giòn và thức uống mát lạnh đang đợi bạn thưởng thức!
              </p>
              <Button
                onClick={onClose}
                className="mt-6 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl px-6 h-11 shadow-md shadow-orange-600/20 active:scale-95 transition-all text-xs"
              >
                Khám Phá Thực Đơn Ngay
              </Button>
            </div>
          ) : (
            items.map((item) => {
              const unitPrice = item.product.basePrice ?? (item.product as any).price ?? 0;
              const hasToppings = item.selectedOptions && item.selectedOptions.length > 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs hover:border-orange-200 hover:shadow-xs transition-all flex gap-3 relative group"
                >
                  {/* Thumbnail Image */}
                  <div className="relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                    <Image
                      src={
                        item.product.imageUrl ||
                        'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=200&q=70'
                      }
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  {/* Content Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${item.product.id}`}
                          onClick={onClose}
                          className="font-bold text-slate-900 text-sm hover:text-orange-600 transition-colors line-clamp-1"
                        >
                          {item.product.name}
                        </Link>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-slate-300 hover:text-red-500 p-0.5 transition-colors flex-shrink-0"
                          title="Xóa món này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Options / Topping Tags */}
                      {hasToppings && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.selectedOptions.map((opt, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                            >
                              +{opt.option.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-[11px] text-slate-400 mt-1">
                        Đơn giá: {formatCurrency(unitPrice)}
                      </p>
                    </div>

                    {/* Stepper & Total Row */}
                    <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-100">
                      {/* Quantity Controller */}
                      <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-white text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center justify-center shadow-2xs transition-colors"
                          title={item.quantity === 1 ? 'Xóa khỏi giỏ' : 'Giảm 1'}
                        >
                          {item.quantity === 1 ? (
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          ) : (
                            <Minus className="w-3 h-3 stroke-[2.5]" />
                          )}
                        </button>

                        <span className="w-8 text-center text-xs font-bold text-slate-900">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-white text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center justify-center shadow-2xs transition-colors"
                          title="Thêm 1"
                        >
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <span className="font-extrabold text-sm sm:text-base text-orange-600">
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ================= FOOTER / CHECKOUT ================= */}
        {items.length > 0 && (
          <div className="border-t border-slate-200 bg-white p-5 space-y-3.5 shadow-2xl flex-shrink-0">
            {/* Flash Voucher Banner Tip */}
            <div className="bg-orange-50/70 border border-dashed border-orange-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Ticket className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <span className="text-slate-700 text-[11px] truncate">
                  Mã hôm nay: <strong className="text-orange-600 font-bold">GIAM20K</strong> (đơn từ 100k)
                </span>
              </div>
              <button
                onClick={() => handleCopyVoucher('GIAM20K')}
                className="text-[11px] font-bold text-orange-600 hover:underline flex items-center gap-1 flex-shrink-0 ml-2"
              >
                {copiedVoucher ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Chép mã</span>
                  </>
                )}
              </button>
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính ({totalItems} món)</span>
                <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Phí vận chuyển</span>
                {isFreeshipEligible ? (
                  <span className="font-bold text-emerald-600">Miễn phí</span>
                ) : (
                  <span className="text-slate-500">Tính khi thanh toán</span>
                )}
              </div>
            </div>

            {/* Total Display */}
            <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Tổng thanh toán
                </span>
                <span className="text-[10px] text-slate-400">
                  (Đã bao gồm thuế GTGT nếu có)
                </span>
              </div>
              <span className="text-2xl font-black text-orange-600">
                {formatCurrency(subtotal)}
              </span>
            </div>

            {/* Checkout Action Button */}
            <Link href="/checkout" onClick={onClose} className="block">
              <button
                type="button"
                className="w-full h-[52px] rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold shadow-lg shadow-orange-600/25 active:scale-[0.99] transition-all flex items-center justify-between px-5 text-sm sm:text-base group"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  <span>Tiến Hành Đặt Hàng</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>{formatCurrency(subtotal)}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </Link>

            {/* Secondary Link & Trust Badge */}
            <div className="flex items-center justify-between text-xs pt-1">
              <Link
                href="/cart"
                onClick={onClose}
                className="text-slate-500 hover:text-orange-600 font-semibold transition-colors"
              >
                Xem chi tiết giỏ hàng
              </Link>

              <button
                onClick={onClose}
                className="text-orange-600 hover:text-orange-700 font-bold transition-colors"
              >
                ← Tiếp tục chọn món
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Cam kết bánh nướng mới nóng giòn • Giao siêu tốc 20 phút</span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );

  return createPortal(drawerContent, document.body);
}
