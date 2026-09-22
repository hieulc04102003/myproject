'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  X,
  Eye,
  SlidersHorizontal,
  ArrowLeft,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { adminOrdersApi, type Order } from '@/lib/api/admin';
import { Pagination } from '@/components/ui/pagination';
import { formatCurrency } from '@/lib/utils';
import { getStatusConfig, STATUS_OPTIONS } from './order-status-config';

// ─── Debounce hook ────────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-gray-100">
      <td className="px-5 py-3.5">
        <div className="h-3.5 w-24 rounded bg-gray-200" />
      </td>
      <td className="px-5 py-3.5">
        <div className="space-y-1.5">
          <div className="h-3.5 w-28 rounded bg-gray-200" />
          <div className="h-2.5 w-20 rounded bg-gray-100" />
        </div>
      </td>
      <td className="px-5 py-3.5">
        <div className="h-3 w-20 rounded bg-gray-200" />
      </td>
      <td className="px-5 py-3.5">
        <div className="h-3.5 w-20 rounded bg-gray-200" />
      </td>
      <td className="px-5 py-3.5">
        <div className="h-6 w-28 rounded-xl bg-gray-200" />
      </td>
      <td className="px-5 py-3.5 text-right">
        <div className="ml-auto h-7 w-20 rounded-lg bg-gray-200" />
      </td>
    </tr>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
        <ShoppingCart size={26} />
      </div>
      <p className="text-sm font-semibold text-gray-700">
        {hasFilters ? 'Không tìm thấy đơn hàng' : 'Chưa có đơn hàng nào'}
      </p>
      <p className="mt-1 text-xs text-gray-400">
        {hasFilters
          ? 'Thử thay đổi bộ lọc hoặc khoảng thời gian tìm kiếm.'
          : 'Đơn hàng sẽ xuất hiện tại đây khi khách hàng đặt hàng.'}
      </p>
      {hasFilters && (
        <button
          onClick={onClear}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition-colors"
        >
          <X size={13} />
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
}

// ─── Filter Tag ───────────────────────────────────────────────────────────────
function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 rounded hover:text-orange-900 transition-colors"
        aria-label="Xóa bộ lọc này"
      >
        <X size={11} />
      </button>
    </span>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
export interface OrdersViewProps {
  /** Prefix cho React Query key: 'admin' | 'staff' */
  queryPrefix: string;
  /** Base href cho links: '/admin/orders' | '/staff/orders' */
  baseHref: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function OrdersView({ queryPrefix, baseHref }: OrdersViewProps) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  // userId từ query string — khi navigate từ trang chi tiết user
  const filterUserId = searchParams.get('userId') ?? undefined;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchInput, 400);

  // Reset trang về 1 khi filter đổi
  const resetPage = useCallback(() => setPage(1), []);
  useEffect(resetPage, [debouncedSearch, status, dateFrom, dateTo, resetPage]);

  const { data, isLoading } = useQuery({
    queryKey: [queryPrefix, 'orders', page, pageSize, status, debouncedSearch, dateFrom, dateTo, filterUserId],
    queryFn: () =>
      adminOrdersApi.getAll({
        page,
        pageSize,
        status: status || undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
        userId: filterUserId,
        orderCode: debouncedSearch || undefined,
      }),
  });

  const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 0;
  const hasActiveFilters = !!(status || debouncedSearch || dateFrom || dateTo);

  const clearFilters = () => {
    setStatus('');
    setSearchInput('');
    setDateFrom('');
    setDateTo('');
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setStatusUpdating(orderId);
    try {
      await adminOrdersApi.updateStatus(orderId, newStatus);
      await queryClient.invalidateQueries({ queryKey: [queryPrefix, 'orders'] });
      // Invalidate stat queries too
      await queryClient.invalidateQueries({ queryKey: [queryPrefix, 'orders', 'stat'] });
    } catch (err) {
      const msg = (err as { message?: string })?.message;
      alert(msg || 'Cập nhật trạng thái thất bại. Vui lòng thử lại.');
    } finally {
      setStatusUpdating(null);
    }
  };

  // Stat queries
  const { data: allOrders } = useQuery({
    queryKey: [queryPrefix, 'orders', 'stat', 'all'],
    queryFn: () => adminOrdersApi.getAll({ page: 1, pageSize: 1 }),
    staleTime: 30_000,
  });
  const { data: pendingOrders } = useQuery({
    queryKey: [queryPrefix, 'orders', 'stat', 'pending'],
    queryFn: () => adminOrdersApi.getAll({ page: 1, pageSize: 1, status: 'PENDING' }),
    staleTime: 30_000,
  });
  const { data: completedOrders } = useQuery({
    queryKey: [queryPrefix, 'orders', 'stat', 'completed'],
    queryFn: () => adminOrdersApi.getAll({ page: 1, pageSize: 1, status: 'COMPLETED' }),
    staleTime: 30_000,
  });
  const { data: cancelledOrders } = useQuery({
    queryKey: [queryPrefix, 'orders', 'stat', 'cancelled'],
    queryFn: () => adminOrdersApi.getAll({ page: 1, pageSize: 1, status: 'CANCELLED' }),
    staleTime: 30_000,
  });

  const stats = [
    {
      label: 'Tổng đơn hàng',
      value: allOrders?.totalCount ?? '—',
      icon: ShoppingCart,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      border: 'border-blue-100',
    },
    {
      label: 'Chờ xác nhận',
      value: pendingOrders?.totalCount ?? '—',
      icon: Clock,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      border: 'border-amber-100',
    },
    {
      label: 'Hoàn thành',
      value: completedOrders?.totalCount ?? '—',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      border: 'border-emerald-100',
    },
    {
      label: 'Đã hủy',
      value: cancelledOrders?.totalCount ?? '—',
      icon: XCircle,
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      border: 'border-rose-100',
    },
  ];

  return (
    <div className="space-y-5">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Tiếp nhận, xử lý và cập nhật tiến trình giao nhận hàng hóa
          </p>
        </div>
        {/* Nút quay lại trang user khi đang lọc theo userId */}
        {filterUserId && (
          <Link
            href={`${baseHref.replace('/orders', '/users')}/${filterUserId}`}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={13} />
            Quay lại hồ sơ
          </Link>
        )}
      </div>

      {/* Banner lọc theo user */}
      {filterUserId && (
        <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <User size={15} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-blue-900">Đang xem đơn hàng của một người dùng</p>
            <p className="text-xs text-blue-600 font-mono truncate">ID: {filterUserId}</p>
          </div>
          <Link
            href={baseHref}
            className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
          >
            <X size={11} />
            Xem tất cả
          </Link>
        </div>
      )}

      {/* ── Stats Cards — ẩn khi đang filter theo userId ── */}
      {!filterUserId && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className={`rounded-2xl border ${s.border} bg-white px-4 py-3.5 shadow-xs`}
              >
                <div className="flex items-center gap-3">
                  <div className={`${s.iconBg} ${s.iconColor} rounded-xl p-2.5`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">{s.label}</p>
                    <p className="mt-0.5 text-xl font-bold text-gray-900">{s.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Filter Bar ────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search — tìm theo mã đơn hàng */}
          <div className="relative min-w-0 flex-1" style={{ minWidth: '180px' }}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo mã đơn hàng..."
              className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status filter */}
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-10 appearance-none rounded-xl border border-gray-200 bg-gray-50 pl-3 pr-8 text-sm text-gray-700 focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all cursor-pointer"
              >
                <option value="">Tất cả trạng thái</option>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Date from */}
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              title="Từ ngày"
              className="h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all cursor-pointer"
            />

            {/* Date to */}
            <input
              type="date"
              value={dateTo}
              min={dateFrom}
              onChange={(e) => setDateTo(e.target.value)}
              title="Đến ngày"
              className="h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all cursor-pointer"
            />

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <X size={14} />
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Result count */}
          {!isLoading && data && (
            <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-500">
              <SlidersHorizontal size={13} />
              <span>
                {data.totalCount > 0 ? (
                  <>
                    <strong className="text-gray-700">{data.totalCount}</strong> đơn hàng
                  </>
                ) : (
                  'Không có kết quả'
                )}
              </span>
            </div>
          )}
        </div>

        {/* Active filter tags */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
            <span className="text-xs font-medium text-gray-400">Đang lọc:</span>
            {debouncedSearch && (
              <FilterTag
                label={`Mã đơn: ${debouncedSearch}`}
                onRemove={() => setSearchInput('')}
              />
            )}
            {status && (
              <FilterTag
                label={`Trạng thái: ${STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status}`}
                onRemove={() => setStatus('')}
              />
            )}
            {dateFrom && (
              <FilterTag
                label={`Từ: ${new Date(dateFrom).toLocaleDateString('vi-VN')}`}
                onRemove={() => setDateFrom('')}
              />
            )}
            {dateTo && (
              <FilterTag
                label={`Đến: ${new Date(dateTo).toLocaleDateString('vi-VN')}`}
                onRemove={() => setDateTo('')}
              />
            )}
          </div>
        )}
      </div>

      {/* ── Table ─────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Mã đơn hàng
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Khách hàng
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Ngày đặt
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Tổng tiền
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Trạng thái
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState hasFilters={hasActiveFilters} onClear={clearFilters} />
                  </td>
                </tr>
              ) : (
                data?.items.map((order: Order) => {
                  const cfg = getStatusConfig(order.orderStatus);
                  return (
                    <tr
                      key={order.id}
                      className="group transition-colors hover:bg-orange-50/30"
                    >
                      {/* Order code */}
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs font-semibold text-gray-900">
                          {order.orderCode}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-semibold text-gray-900">{order.customerName}</p>
                        {order.customerPhone && (
                          <p className="text-xs text-gray-400">{order.customerPhone}</p>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </td>

                      {/* Total */}
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </td>

                      {/* Status — inline editable dropdown */}
                      <td className="px-5 py-3.5">
                        <div className="relative inline-flex items-center">
                          <select
                            value={order.orderStatus?.toUpperCase()}
                            disabled={statusUpdating === order.id}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`appearance-none rounded-xl py-1 pl-2.5 pr-7 text-xs font-semibold cursor-pointer transition-opacity focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:cursor-not-allowed disabled:opacity-50 ${cfg.select}`}
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option
                                key={opt.value}
                                value={opt.value}
                                className="bg-white text-gray-900"
                              >
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-1.5 h-3 w-3 opacity-60" />
                          {statusUpdating === order.id && (
                            <span className="ml-2 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`${baseHref}/${order.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-transparent px-3 py-1.5 text-xs font-semibold text-gray-500 transition-all group-hover:border-gray-200 group-hover:bg-white group-hover:text-gray-800 hover:shadow-xs"
                          title="Xem chi tiết đơn hàng"
                        >
                          <Eye size={13} />
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-3">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={data?.totalCount ?? 0}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setPage(1);
              }}
              pageSizeOptions={[10, 20, 50]}
              itemName="đơn hàng"
            />
          </div>
        )}
      </div>
    </div>
  );
}
