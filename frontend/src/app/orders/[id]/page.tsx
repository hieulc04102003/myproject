'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  Banknote,
  XCircle, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  Truck, 
  Printer, 
  Copy, 
  Check, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { orderService } from '@/features/orders/api/order-service';
import { useOrderStatusHub } from '@/lib/order-status-hub';
import { useAuthStore } from '@/store/auth-store';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Đặt hàng thành công', icon: Clock, desc: 'Chờ cửa hàng tiếp nhận' },
  { key: 'CONFIRMED', label: 'Đã xác nhận', icon: CheckCircle2, desc: 'Cửa hàng đã tiếp nhận đơn' },
  { key: 'PREPARING', label: 'Đang chuẩn bị', icon: ChefHat, desc: 'Bếp đang làm bánh nóng hổi' },
  { key: 'SHIPPING', label: 'Đang giao hàng', icon: Truck, desc: 'Shipper đang trên đường giao' },
  { key: 'COMPLETED', label: 'Hoàn thành', icon: CheckCircle2, desc: 'Đã giao tới bạn' },
];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Chờ xác nhận', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'text-cyan-700', bg: 'bg-cyan-50 border-cyan-200' },
  PREPARING: { label: 'Đang chuẩn bị', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  PROCESSING: { label: 'Đang chuẩn bị', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  SHIPPING: { label: 'Đang giao hàng', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  SHIPPED: { label: 'Đang giao hàng', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  COMPLETED: { label: 'Hoàn thành', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  CANCELLED: { label: 'Đã huỷ', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
};

function getStepIndex(status: string): number {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return 0;
    case 'CONFIRMED':
      return 1;
    case 'PROCESSING':
    case 'PREPARING':
      return 2;
    case 'SHIPPING':
    case 'SHIPPED':
      return 3;
    case 'COMPLETED':
      return 4;
    default:
      return -1;
  }
}

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const queryClient = useQueryClient();
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrderById(id),
    enabled: !!id,
  });

  const { isAuthenticated } = useAuthStore();
  // Real-time: cập nhật trạng thái ngay khi staff/admin thay đổi, không cần refresh
  useOrderStatusHub((payload) => {
    if (!payload?.orderCode || (order?.orderCode && payload.orderCode === order.orderCode)) {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    }
  }, isAuthenticated && !!id);

  const cancelMutation = useMutation({
    mutationFn: () => orderService.cancelOrder(id),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(['order', id], updatedOrder);
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setCancelError(msg || 'Hủy đơn hàng thất bại. Vui lòng thử lại.');
    },
  });

  const handleCancelOrder = () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này? Toàn bộ sản phẩm sẽ được hoàn trả lại kho.')) {
      setCancelError(null);
      cancelMutation.mutate();
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const statusConfig = order ? (STATUS_MAP[order.orderStatus] ?? { label: order.orderStatus, color: 'text-slate-700', bg: 'bg-slate-100 border-slate-200' }) : null;
  const isCancelled = order?.orderStatus === 'CANCELLED';
  const currentStep = order ? getStepIndex(order.orderStatus) : -1;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="print:hidden">
        <Header />
      </div>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Navigation & Header Actions */}
        <div className="flex items-center justify-between gap-4 mb-6 print:hidden">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách đơn hàng</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="text-xs h-9 text-slate-600 hover:text-slate-900 border-slate-200 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In hóa đơn</span>
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-orange-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Đang tải chi tiết đơn hàng...</p>
          </div>
        )}

        {isError && (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">Không thể tải đơn hàng</h3>
            <p className="text-sm text-slate-500 mb-6">Đơn hàng không tồn tại hoặc đã xảy ra lỗi kết nối.</p>
            <Link href="/orders">
              <Button variant="outline" size="sm">
                Về danh sách đơn hàng
              </Button>
            </Link>
          </div>
        )}

        {order && (
          <div className="space-y-6">
            {/* Cancel Error Alert */}
            {cancelError && (
              <div className="rounded-xl bg-rose-50 p-4 border border-rose-200 text-sm text-rose-700 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{cancelError}</span>
                </div>
                <button onClick={() => setCancelError(null)} className="text-rose-500 hover:text-rose-700 font-bold ml-4">
                  ✕
                </button>
              </div>
            )}

            {/* Top Order Overview Banner */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                    Đơn hàng
                  </span>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    #{order.orderCode}
                  </h1>
                  <button
                    onClick={() => handleCopy(order.orderCode)}
                    title="Sao chép mã đơn"
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Đặt lúc:{' '}
                    {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {statusConfig && (
                  <div className={`px-4 py-2 rounded-xl border text-sm font-semibold flex items-center gap-2 ${statusConfig.bg} ${statusConfig.color}`}>
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${order.orderStatus === 'COMPLETED' ? 'bg-emerald-400' : order.orderStatus === 'CANCELLED' ? 'bg-rose-400' : 'bg-amber-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${order.orderStatus === 'COMPLETED' ? 'bg-emerald-500' : order.orderStatus === 'CANCELLED' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                    </span>
                    <span>{statusConfig.label}</span>
                  </div>
                )}

                {order.orderStatus === 'PENDING' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelOrder}
                    disabled={cancelMutation.isPending}
                    className="border-rose-300 text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-xs font-medium h-10 px-4 print:hidden"
                  >
                    {cancelMutation.isPending ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Đang hủy...
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-1.5 h-3.5 w-3.5" />
                        Hủy đơn hàng
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Stepper Tracking / Cancelled Alert */}
            {isCancelled ? (
              <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-6 flex items-start gap-4">
                <div className="p-3 bg-rose-100 text-rose-600 rounded-xl flex-shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-rose-900">Đơn hàng này đã bị huỷ</h3>
                  <p className="text-sm text-rose-700 mt-1">
                    Đơn hàng đã được ghi nhận hủy thành công. Toàn bộ các sản phẩm đã được tự động hoàn trả lại số lượng tồn kho của hệ thống.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">
                  Tiến độ đơn hàng
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
                  {STATUS_STEPS.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isDone = currentStep >= idx;
                    const isCurrent = currentStep === idx;

                    return (
                      <div key={step.key} className="flex sm:flex-col items-center sm:text-center gap-3 relative z-10">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 ${
                            isDone
                              ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20'
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}
                        >
                          <StepIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                            {step.label}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Grid Layout: Left Details, Right Customer & Payment */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column (2 Cols): Products List */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Package className="w-5 h-5 text-orange-600" />
                      <span>Danh sách món ăn ({order.items?.length || 0})</span>
                    </h2>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="py-4 first:pt-0 last:pb-0 flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 text-sm">
                              {item.productName || 'Bánh mì Sài Gòn'}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                              x{item.quantity}
                            </span>
                          </div>
                          {item.options && item.options.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {item.options.map((opt, oIdx) => (
                                <span
                                  key={oIdx}
                                  className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-100"
                                >
                                  +{opt.optionName} ({formatCurrency(opt.optionPrice)})
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-slate-400 mt-1">
                            Đơn giá: {formatCurrency(item.unitPrice)}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-900">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.note && (
                    <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50/60 -mx-6 -mb-6 p-6 rounded-b-2xl">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Ghi chú từ khách hàng
                      </p>
                      <p className="text-sm text-slate-700 italic">&ldquo;{order.note}&rdquo;</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column (1 Col): Delivery, Payment, Totals */}
              <div className="space-y-6">
                {/* Customer & Shipping */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-orange-600" />
                    <span>Thông tin nhận hàng</span>
                  </h3>

                  <div className="space-y-3 text-sm text-slate-700">
                    <div>
                      <span className="text-xs text-slate-400 block mb-0.5">Người nhận</span>
                      <p className="font-semibold text-slate-900">{order.customerName}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block mb-0.5">Số điện thoại</span>
                      <p className="font-medium text-slate-800 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{order.customerPhone}</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block mb-0.5">Địa chỉ giao hàng</span>
                      <p className="text-slate-700 text-xs leading-relaxed flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span>{order.shippingAddress}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Method & Total */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-orange-600" />
                    <span>Thanh toán</span>
                  </h3>

                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                    {order.paymentMethod === 'BANK_TRANSFER' ? (
                      <CreditCard className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Banknote className="w-4 h-4 text-emerald-600" />
                    )}
                    <span className="font-medium">
                      {order.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản ngân hàng' : 'Tiền mặt khi nhận hàng (COD)'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span>Tạm tính</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phí vận chuyển</span>
                      <span>{order.shippingFee > 0 ? formatCurrency(order.shippingFee) : 'Miễn phí'}</span>
                    </div>
                    {order.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Giảm giá</span>
                        <span>-{formatCurrency(order.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-baseline pt-2.5 border-t border-slate-200 text-sm">
                      <span className="font-bold text-slate-900">Tổng cộng</span>
                      <span className="text-lg font-bold text-orange-600">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
