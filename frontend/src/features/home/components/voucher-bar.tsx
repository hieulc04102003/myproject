'use client';

import { useEffect, useState } from 'react';
import { Ticket, Copy, Check, Sparkles, Flame, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

interface ActiveCoupon {
  id: number;
  code: string;
  description: string | null;
  discountType: string; // "Percentage" | "FixedAmount"
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  endDate: string;
}

const formatVnd = (v: number) => new Intl.NumberFormat('vi-VN').format(v) + 'đ';

interface Voucher {
  code: string;
  title: string;
  description: string;
  condition: string;
  expiry: string;
}

function mapCoupon(c: ActiveCoupon): Voucher {
  const isPercent = (c.discountType ?? '').toLowerCase().includes('percent');
  const title = isPercent
    ? `Giảm ${c.discountValue}%`
    : `Giảm ${formatVnd(c.discountValue)}`;
  const description =
    c.description ||
    (isPercent && c.maxDiscountAmount
      ? `Giảm tối đa ${formatVnd(c.maxDiscountAmount)}`
      : 'Áp dụng cho tất cả đơn hàng');
  const condition = c.minOrderAmount
    ? `Đơn từ ${formatVnd(c.minOrderAmount)}`
    : 'Không giới hạn';
  const daysLeft = Math.ceil(
    (new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const expiry =
    daysLeft <= 0 ? 'Hết hạn hôm nay' : daysLeft <= 1 ? 'Hôm nay' : `Còn ${daysLeft} ngày`;
  return { code: c.code, title, description, condition, expiry };
}

const fallbackVouchers: Voucher[] = [
  {
    code: 'GIAM20K',
    title: 'Giảm 20.000đ',
    description: 'Áp dụng cho đơn hàng từ 100.000đ',
    condition: 'Đơn từ 100k',
    expiry: 'Hôm nay',
  },
  {
    code: 'FREESHIP',
    title: 'Miễn Phí Vận Chuyển',
    description: 'Freeship tối đa 25.000đ cho đơn từ 120.000đ',
    condition: 'Bán kính 5km',
    expiry: 'Còn 8 lượt',
  },
];

export function VoucherBar() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [showFallback, setShowFallback] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiClient.get<ActiveCoupon[]>('/coupons/active');
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          setVouchers(data.slice(0, 8).map(mapCoupon));
          setShowFallback(false);
        } else {
          // API hoạt động nhưng không có mã nào đang chạy
          setVouchers([]);
          setShowFallback(false);
        }
      } catch {
        if (!cancelled) setShowFallback(true); // chỉ fallback khi lỗi mạng/API
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <section className="py-6 bg-slate-50 border-b border-slate-200/80">
      <div className="container mx-auto px-4">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center">
              <Ticket className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Ưu Đãi Độc Quyền Hôm Nay</span>
                <span className="text-[11px] font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                  Flash Voucher
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Nhấp sao chép mã voucher và dán vào bước thanh toán
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5 text-orange-600" />
              <span>Tự động áp dụng voucher tốt nhất khi đặt món</span>
            </div>
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-full transition-colors"
            >
              Xem danh sách sản phẩm
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Voucher Cards Grid */}
        {showFallback ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {fallbackVouchers.map((v) => (
              <div key={v.code} className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 to-amber-500" />
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-extrabold text-orange-600 text-sm">{v.title}</span>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{v.expiry}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 line-clamp-1">{v.description}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Điều kiện: {v.condition}</p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200">
                  <div className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-800 tracking-wider inline-block">
                    {v.code}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : vouchers.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-200 text-sm text-slate-500">
            Hiện chưa có mã giảm giá nào đang diễn ra. Vui lòng quay lại sau!
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {vouchers.map((v) => {
            const isCopied = copiedCode === v.code;
            return (
              <div
                key={v.code}
                className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs hover:border-orange-300 hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
              >
                {/* Sawtooth edge decoration on left */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 to-amber-500" />

                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-extrabold text-orange-600 text-sm">
                      {v.title}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      {v.expiry}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                    {v.description}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Điều kiện: {v.condition}
                  </p>
                </div>

                {/* Voucher Code Box & Copy Button */}
                <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200 flex items-center justify-between">
                  <div className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-800 tracking-wider">
                    {v.code}
                  </div>

                  <button
                    onClick={() => handleCopy(v.code)}
                    className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                      isCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Lưu mã</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </section>
  );
}
