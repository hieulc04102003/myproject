'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Package,
  User,
  Phone,
  MapPin,
  CreditCard,
  StickyNote,
  ChevronDown,
  AlertCircle,
  Printer,
  PhoneCall,
  Ban,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { adminOrdersApi, type OrderItem } from '@/lib/api/admin';
import { formatCurrency } from '@/lib/utils';
import { getStatusConfig, STATUS_OPTIONS } from './order-status-config';

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-11 w-11 rounded-xl bg-gray-200" />
        <div className="space-y-2">
          <div className="h-5 w-40 rounded bg-gray-200" />
          <div className="h-3.5 w-28 rounded bg-gray-100" />
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <div className="h-64 rounded-2xl bg-gray-200" />
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="h-40 rounded-2xl bg-gray-200" />
            <div className="h-40 rounded-2xl bg-gray-200" />
          </div>
        </div>
        <div className="space-y-5">
          <div className="h-52 rounded-2xl bg-gray-200" />
          <div className="h-36 rounded-2xl bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  subValue,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  value: React.ReactNode;
  subValue?: string;
}) {
  return (
    <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-gray-50/80 border border-gray-100">
      <div className={`${iconBg} ${iconColor} rounded-xl p-2.5 shrink-0`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <div className="mt-0.5 text-sm font-semibold text-gray-900">{value}</div>
        {subValue && <p className="mt-0.5 text-[11px] text-gray-400">{subValue}</p>}
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
export interface OrderDetailViewProps {
  orderId: string;
  /** Prefix cho React Query key: 'admin' | 'staff' */
  queryPrefix: string;
  /** Link quay lại list: '/admin/orders' | '/staff/orders' */
  backHref: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function OrderDetailView({ orderId, queryPrefix, backHref }: OrderDetailViewProps) {
  const queryClient = useQueryClient();
  const [statusUpdating, setStatusUpdating] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: [queryPrefix, 'orders', orderId],
    queryFn: () => adminOrdersApi.getById(orderId),
  });

  const handleStatusChange = async (newStatus: string) => {
    setStatusUpdating(true);
    try {
      await adminOrdersApi.updateStatus(orderId, newStatus);
      await queryClient.invalidateQueries({ queryKey: [queryPrefix, 'orders'] });
    } catch (err) {
      const msg = (err as { message?: string })?.message;
      alert(msg || 'Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleCancelOrder = () => {
    if (!order) return;
    if (
      confirm(
        `Bạn có chắc muốn hủy đơn hàng #${order.orderCode}?\nToàn bộ số lượng sản phẩm sẽ được hoàn trả vào kho.`
      )
    ) {
      handleStatusChange('CANCELLED');
    }
  };

  if (isLoading) return <DetailSkeleton />;

  if (!order) {
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm my-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Không tìm thấy đơn hàng</h2>
        <p className="text-sm text-gray-500">Đơn hàng này không tồn tại hoặc đã bị xóa.</p>
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={16} />
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const statusCfg = getStatusConfig(order.orderStatus);
  const isCancellable = !['CANCELLED', 'COMPLETED'].includes(order.orderStatus?.toUpperCase());

  const paymentMethodLabel =
    order.paymentMethod === 'CASH'
      ? 'COD (khi nhận hàng)'
      : order.paymentMethod === 'BANK_TRANSFER'
      ? 'Chuyển khoản ngân hàng'
      : order.paymentMethod ?? 'Không xác định';

  const paymentStatusLabel =
    order.paymentStatus === 'PAID'
      ? 'Đã thanh toán'
      : order.paymentStatus === 'FAILED'
      ? 'Thanh toán thất bại'
      : 'Chưa thanh toán';

  const paymentStatusColor =
    order.paymentStatus === 'PAID'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : order.paymentStatus === 'FAILED'
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : 'bg-amber-50 text-amber-700 border-amber-200';

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-600 shadow-xs hover:bg-gray-50 hover:text-gray-900 transition-all"
            title="Quay lại danh sách"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng</h1>
            <p className="mt-0.5 font-mono text-xs text-gray-500">#{order.orderCode}</p>
          </div>
        </div>

        {/* Status Selector */}
        <div className="flex items-center gap-2">
          <span className="hidden text-xs font-semibold text-gray-500 sm:inline">
            Trạng thái:
          </span>
          <div className="relative inline-flex items-center gap-2">
            <select
              value={order.orderStatus?.toUpperCase()}
              disabled={statusUpdating}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`appearance-none rounded-xl py-2 pl-3.5 pr-8 text-xs font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:cursor-not-allowed disabled:opacity-60 ${statusCfg.select}`}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-white text-gray-900">
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 opacity-60" />
            {statusUpdating && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* ── Left 2/3: Products + Customer + Shipping ────── */}
        <div className="space-y-5 lg:col-span-2">
          {/* Products card */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
            <div className="flex items-center gap-2.5 border-b border-gray-100 bg-gray-50/60 px-5 py-3.5">
              <Package size={16} className="text-orange-500" />
              <h2 className="text-sm font-bold text-gray-900">
                Sản phẩm đặt hàng
                <span className="ml-1.5 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-600">
                  {order.items?.length ?? 0}
                </span>
              </h2>
            </div>

            <div className="divide-y divide-gray-50">
              {order.items?.map((item: OrderItem, idx: number) => (
                <div key={idx} className="flex items-start justify-between gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {item.productName ?? 'Sản phẩm'}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                    {item.options && item.options.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.options.map((opt, oi) => (
                          <span
                            key={oi}
                            className="inline-block rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600"
                          >
                            {opt.optionName}
                            {opt.additionalPrice > 0 && ` +${formatCurrency(opt.additionalPrice)}`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="shrink-0 text-sm font-bold text-gray-900">
                    {formatCurrency(item.itemTotalPrice ?? item.unitPrice * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 border-t border-gray-100 bg-gray-50/60 px-5 py-4">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Tạm tính</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Phí vận chuyển</span>
                <span>{formatCurrency(order.shippingFee)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-xs font-semibold text-emerald-700">
                  <span>Giảm giá (Coupon)</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-2.5 text-sm font-bold text-gray-900">
                <span>Tổng thanh toán</span>
                <span className="text-orange-600">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Customer + Shipping grid */}
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Customer info */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
              <h3 className="border-b border-gray-100 pb-3 text-sm font-bold text-gray-900">
                Thông tin khách hàng
              </h3>
              <InfoRow
                icon={User}
                iconBg="bg-blue-100"
                iconColor="text-blue-600"
                label="Họ và tên"
                value={order.customerName}
              />
              <InfoRow
                icon={Phone}
                iconBg="bg-emerald-100"
                iconColor="text-emerald-600"
                label="Số điện thoại"
                value={order.customerPhone || '—'}
                subValue="Liên hệ giao hàng"
              />
            </div>

            {/* Shipping info */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
              <h3 className="border-b border-gray-100 pb-3 text-sm font-bold text-gray-900">
                Địa chỉ giao hàng
              </h3>
              <InfoRow
                icon={MapPin}
                iconBg="bg-purple-100"
                iconColor="text-purple-600"
                label="Địa chỉ"
                value={order.shippingAddress}
                subValue="Giao hàng tiêu chuẩn"
              />
            </div>
          </div>

          {/* Note */}
          {order.note && (
            <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="shrink-0 rounded-xl bg-amber-100 p-2.5 text-amber-600">
                <StickyNote size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-900">Ghi chú từ khách hàng</p>
                <p className="mt-1 text-sm text-amber-800 italic">&ldquo;{order.note}&rdquo;</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Right 1/3: Payment + Actions ────────────────── */}
        <div className="space-y-5">
          {/* Payment */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="flex items-center gap-2 border-b border-gray-100 pb-3 text-sm font-bold text-gray-900">
              <CreditCard size={16} className="text-gray-400" />
              Thanh toán
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Phương thức</span>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-100">
                  {paymentMethodLabel}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Trạng thái</span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${paymentStatusColor}`}
                >
                  {paymentStatusLabel}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="font-semibold text-gray-800">Tổng tiền</span>
                <span className="text-lg font-bold text-orange-600">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline / Status */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="flex items-center gap-2 border-b border-gray-100 pb-3 text-sm font-bold text-gray-900">
              <CheckCircle2 size={16} className="text-gray-400" />
              Trạng thái đơn hàng
            </h3>

            <div className="space-y-2">
              {STATUS_OPTIONS.map((s, idx) => {
                const currentIdx = STATUS_OPTIONS.findIndex(
                  (o) => o.value === order.orderStatus?.toUpperCase()
                );
                const isCurrent = s.value === order.orderStatus?.toUpperCase();
                const isDone = idx < currentIdx;
                const isCancelled = order.orderStatus?.toUpperCase() === 'CANCELLED';

                if (isCancelled && s.value !== 'CANCELLED' && !isDone) return null;

                const cfg = getStatusConfig(s.value);
                return (
                  <div key={s.value} className="flex items-center gap-2.5">
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${
                        isCurrent ? cfg.dot : isDone ? 'bg-emerald-400' : 'bg-gray-200'
                      }`}
                    />
                    <span
                      className={`text-xs ${
                        isCurrent
                          ? 'font-bold text-gray-900'
                          : isDone
                          ? 'font-medium text-gray-500'
                          : 'text-gray-300'
                      }`}
                    >
                      {s.label}
                    </span>
                    {isCurrent && (
                      <span
                        className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.badge}`}
                      >
                        Hiện tại
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="border-b border-gray-100 pb-3 text-sm font-bold text-gray-900">
              Thao tác
            </h3>
            <button
              onClick={() => window.print()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
            >
              <Printer size={15} />
              In hóa đơn
            </button>

            {order.customerPhone && (
              <a
                href={`tel:${order.customerPhone}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <PhoneCall size={15} />
                Gọi khách hàng
              </a>
            )}

            {isCancellable && (
              <button
                disabled={statusUpdating}
                onClick={handleCancelOrder}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50 transition-colors"
              >
                <Ban size={15} />
                Hủy đơn hàng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
