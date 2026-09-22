'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  Package, 
  Search, 
  Clock, 
  ChefHat, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  CreditCard, 
  Banknote, 
  Copy, 
  Check, 
  ShoppingBag,
  RotateCcw,
  Loader2,
  Calendar,
  ChevronRight,
  User
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useOrderStatusHub } from '@/lib/order-status-hub';
import { orderService } from '@/features/orders/api/order-service';
import { formatCurrency } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';

interface StatusConfig {
  label: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  PENDING: {
    label: 'Chờ xác nhận',
    color: 'text-amber-700',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    borderColor: 'border-l-amber-500',
    icon: Clock,
  },
  PROCESSING: {
    label: 'Đang chuẩn bị',
    color: 'text-blue-700',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    borderColor: 'border-l-blue-500',
    icon: ChefHat,
  },
  SHIPPING: {
    label: 'Đang giao hàng',
    color: 'text-purple-700',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    borderColor: 'border-l-purple-500',
    icon: Truck,
  },
  SHIPPED: {
    label: 'Đang giao hàng',
    color: 'text-purple-700',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    borderColor: 'border-l-purple-500',
    icon: Truck,
  },
  COMPLETED: {
    label: 'Hoàn thành',
    color: 'text-emerald-700',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    borderColor: 'border-l-emerald-500',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Đã huỷ',
    color: 'text-rose-700',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    borderColor: 'border-l-rose-500',
    icon: XCircle,
  },
};

const TAB_OPTIONS = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ xác nhận' },
  { key: 'PROCESSING', label: 'Đang chuẩn bị' },
  { key: 'SHIPPING', label: 'Đang giao hàng' },
  { key: 'COMPLETED', label: 'Hoàn thành' },
  { key: 'CANCELLED', label: 'Đã huỷ' },
];

export default function CustomerOrdersPage() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelFeedback, setCancelFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(1);
  };

  useEffect(() => {
    useAuthStore.persist.rehydrate();
  }, []);

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => orderService.getMyOrders(1, 100),
    enabled: isAuthenticated,
  });

  // Real-time: khi staff/admin đổi trạng thái, tự động refetch không cần F5
  useOrderStatusHub((payload) => {
    queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    queryClient.invalidateQueries({ queryKey: ['order'] });
    // tuỳ chọn: gợi ý nhỏ (console) - có thể thay bằng toast
    if (payload?.orderCode) {
      console.info(`[Realtime] Đơn ${payload.orderCode}: ${payload.previousStatus} → ${payload.newStatus}`);
    }
  }, isAuthenticated);

  const cancelMutation = useMutation({
    mutationFn: (orderId: string) => orderService.cancelOrder(orderId),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.setQueryData(['order', updatedOrder.id], updatedOrder);
      setCancellingOrderId(null);
      setCancelFeedback({
        type: 'success',
        message: `Hủy đơn hàng #${updatedOrder.orderCode} thành công. Kho đã được hoàn trả.`,
      });
      setTimeout(() => setCancelFeedback(null), 5000);
    },
    onError: (err: unknown) => {
      setCancellingOrderId(null);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setCancelFeedback({
        type: 'error',
        message: msg || 'Hủy đơn hàng thất bại. Vui lòng thử lại.',
      });
      setTimeout(() => setCancelFeedback(null), 5000);
    },
  });

  const handleCancelOrder = (orderId: string, orderCode: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${orderCode}? Toàn bộ sản phẩm sẽ được hoàn trả lại kho.`)) {
      setCancellingOrderId(orderId);
      cancelMutation.mutate(orderId);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const allOrders = useMemo(() => ordersData?.items || [], [ordersData?.items]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: allOrders.length };
    TAB_OPTIONS.forEach((t) => {
      if (t.key !== 'ALL') {
        if (t.key === 'SHIPPING') {
          counts[t.key] = allOrders.filter(
            (o) => o.orderStatus === 'SHIPPING' || o.orderStatus === 'SHIPPED'
          ).length;
        } else {
          counts[t.key] = allOrders.filter((o) => o.orderStatus === t.key).length;
        }
      }
    });
    return counts;
  }, [allOrders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      const matchTab =
        activeTab === 'ALL' ||
        order.orderStatus === activeTab ||
        (activeTab === 'SHIPPING' && (order.orderStatus === 'SHIPPING' || order.orderStatus === 'SHIPPED'));
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        order.orderCode.toLowerCase().includes(q) ||
        order.items?.some((i) => (i.productName || '').toLowerCase().includes(q));
      return matchTab && matchQuery;
    });
  }, [allOrders, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, page, pageSize]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Đăng nhập để xem đơn hàng</h2>
            <p className="text-slate-500 text-sm mb-6">
              Bạn cần đăng nhập tài khoản để theo dõi lịch sử mua sắm và tiến độ giao hàng.
            </p>
            <Link href="/auth/login?redirect=/orders">
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5">
                Đăng nhập ngay
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Đơn hàng của tôi
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Theo dõi tình trạng đơn hàng và lịch sử đặt món của bạn
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/profile">
              <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                <User className="w-4 h-4 text-orange-600" />
                <span>Hồ sơ cá nhân</span>
              </Button>
            </Link>
            <Link href="/homepage">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Đặt món mới
              </Button>
            </Link>
          </div>
        </div>

        {/* Feedback notification */}
        {cancelFeedback && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-center justify-between transition-all ${
              cancelFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              {cancelFeedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
              <span>{cancelFeedback.message}</span>
            </div>
            <button
              onClick={() => setCancelFeedback(null)}
              className="text-slate-400 hover:text-slate-600 text-sm font-semibold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Status Tabs Bar */}
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-200/80 mb-6 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {TAB_OPTIONS.map((tab) => {
              const count = tabCounts[tab.key] || 0;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn hàng hoặc tên món ăn..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full px-2 py-0.5"
            >
              Xóa
            </button>
          )}
        </div>

        {/* Orders Content */}
        {isLoading ? (
          <div className="bg-white rounded-2xl p-16 shadow-sm border border-slate-200 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-orange-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Đang tải danh sách đơn hàng...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 shadow-sm border border-slate-200 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              {searchQuery ? 'Không tìm thấy đơn hàng phù hợp' : 'Chưa có đơn hàng nào'}
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              {searchQuery
                ? 'Thử tìm với từ khóa khác hoặc xóa bộ lọc tìm kiếm.'
                : 'Bạn chưa có đơn hàng nào trong mục này. Hãy thưởng thức những chiếc bánh mì nóng hổi ngay!'}
            </p>
            {searchQuery ? (
              <Button
                variant="outline"
                onClick={() => handleSearchChange('')}
                className="text-sm"
              >
                Xóa tìm kiếm
              </Button>
            ) : (
              <Link href="/homepage">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm">
                  Khám phá thực đơn
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedOrders.map((order) => {
              const statusCfg = STATUS_CONFIG[order.orderStatus] ?? {
                label: order.orderStatus,
                color: 'text-slate-700',
                badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
                borderColor: 'border-l-slate-400',
                icon: Package,
              };
              const StatusIcon = statusCfg.icon;
              const isPending = order.orderStatus === 'PENDING';
              const isCancelling = cancellingOrderId === order.id;

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl shadow-sm border border-slate-200/90 border-l-4 ${statusCfg.borderColor} hover:shadow-md transition-all overflow-hidden`}
                >
                  {/* Card Header */}
                  <div className="p-5 pb-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/40">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-700 shadow-2xs">
                        <Package className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-base">
                            #{order.orderCode}
                          </span>
                          <button
                            onClick={() => handleCopy(order.orderCode)}
                            title="Sao chép mã đơn"
                            className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200/60 transition-colors"
                          >
                            {copiedCode === order.orderCode ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${statusCfg.badgeBg}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{statusCfg.label}</span>
                    </div>
                  </div>

                  {/* Card Items List Preview */}
                  <div className="p-5 py-4 space-y-3">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm py-1.5 first:pt-0 border-b border-slate-100 last:border-0"
                      >
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">
                              {item.productName || 'Bánh mì Sài Gòn'}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                              x{item.quantity}
                            </span>
                          </div>
                          {item.options && item.options.length > 0 && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              Topping: {item.options.map((o) => o.optionName).join(', ')}
                            </p>
                          )}
                        </div>
                        <span className="font-medium text-slate-800 whitespace-nowrap">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    ))}

                    {order.note && (
                      <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg italic">
                        Ghi chú: {order.note}
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        {order.paymentMethod === 'BANK_TRANSFER' ? (
                          <CreditCard className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Banknote className="w-4 h-4 text-emerald-600" />
                        )}
                        <span>
                          {order.paymentMethod === 'BANK_TRANSFER'
                            ? 'Chuyển khoản ngân hàng'
                            : 'Tiền mặt khi nhận hàng (COD)'}
                        </span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <div>
                        Tổng tiền:{' '}
                        <span className="text-base font-bold text-orange-600">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {isPending && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isCancelling}
                          onClick={() => handleCancelOrder(order.id, order.orderCode)}
                          className="border-rose-300 text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-xs h-9 font-medium"
                        >
                          {isCancelling ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                              Đang hủy...
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 mr-1" />
                              Hủy đơn
                            </>
                          )}
                        </Button>
                      )}

                      <Link href={`/orders/${order.id}`}>
                        <Button
                          size="sm"
                          className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-9 font-medium shadow-xs flex items-center gap-1"
                        >
                          <span>Xem chi tiết</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 mt-6">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={filteredOrders.length}
                  pageSize={pageSize}
                  onPageChange={(p) => {
                    setPage(p);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onPageSizeChange={(s) => {
                    setPageSize(s);
                    setPage(1);
                  }}
                  pageSizeOptions={[5, 10, 20]}
                  itemName="đơn hàng"
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
