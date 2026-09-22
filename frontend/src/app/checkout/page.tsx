'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  Banknote, 
  ShoppingBag, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Copy, 
  Check, 
  ChevronRight,
  FileText,
  Plus,
  Star
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { orderService } from '@/features/orders/api/order-service';
import { userAddressApi, type UserAddress } from '@/lib/api/address';
import { apiClient } from '@/lib/api-client';
import { AddressModal } from '@/components/address/address-modal';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';

interface CheckoutForm {
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod: 'CASH' | 'BANK_TRANSFER';
  note: string;
}

interface CouponValidationResult {
  isValid: boolean;
  message: string | null;
  couponId: string | null;
  code: string | null;
  discountAmount: number;
  orderTotalAfterDiscount: number;
}

const STORAGE_SHIPPING_KEY = 'customer_shipping_profile';

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { items, subtotal, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAutoFilled, setIsAutoFilled] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // User addresses states
  const [selectedAddressId, setSelectedAddressId] = useState<string>('custom');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [saveToAddressBook, setSaveToAddressBook] = useState(true);

  // Coupon states
  const [couponInput, setCouponInput] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);

  // Fetch saved delivery addresses from user profile
  const { data: savedAddresses = [], isLoading: isLoadingAddresses } = useQuery({
    queryKey: ['user', 'addresses'],
    queryFn: () => userAddressApi.getAll(),
    enabled: !!user,
  });

  const [form, setForm] = useState<CheckoutForm>({
    customerName: '',
    customerPhone: '',
    shippingAddress: '',
    paymentMethod: 'CASH',
    note: '',
  });

  useEffect(() => {
    setMounted(true);
    useCartStore.persist.rehydrate();
    useAuthStore.persist.rehydrate();
  }, []);

  // Auto-fill customer information from user profile & last order history
  useEffect(() => {
    if (!user) return;

    let savedData: Partial<CheckoutForm> = {};
    try {
      const cached = localStorage.getItem(STORAGE_SHIPPING_KEY);
      if (cached) {
        savedData = JSON.parse(cached);
      }
    } catch {
      // ignore JSON parse error
    }

    const defaultName = user.fullName || savedData.customerName || '';
    const defaultPhone = user.phoneNumber || savedData.customerPhone || '';
    const defaultAddress = savedData.shippingAddress || '';

    setForm((f) => ({
      ...f,
      customerName: f.customerName || defaultName,
      customerPhone: f.customerPhone || defaultPhone,
      shippingAddress: f.shippingAddress || defaultAddress,
    }));

    if (defaultName || defaultPhone || defaultAddress) {
      setIsAutoFilled(true);
    }

    // If address is still missing, try fetching from the user's latest previous order
    if (!defaultAddress && user.id) {
      orderService.getMyOrders(1, 1).then((res) => {
        if (res?.items && res.items.length > 0) {
          const lastOrder = res.items[0];
          setForm((f) => ({
            ...f,
            customerName: f.customerName || lastOrder.customerName || '',
            customerPhone: f.customerPhone || lastOrder.customerPhone || '',
            shippingAddress: f.shippingAddress || lastOrder.shippingAddress || '',
          }));
          setIsAutoFilled(true);
        }
      }).catch(() => {
        // silently fallback
      });
    }
  }, [user]);

  // Ưu tiên chọn địa chỉ mặc định từ Sổ địa chỉ đã lưu
  useEffect(() => {
    if (savedAddresses && savedAddresses.length > 0) {
      const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
      if (defaultAddr && selectedAddressId === 'custom' && !form.shippingAddress) {
        setSelectedAddressId(defaultAddr.id);
        setForm((f) => ({
          ...f,
          customerName: defaultAddr.recipientName,
          customerPhone: defaultAddr.phoneNumber,
          shippingAddress: defaultAddr.fullAddress,
        }));
        setIsAutoFilled(true);
      }
    }
  }, [savedAddresses]);

  const handleSelectAddress = (addr: UserAddress) => {
    setSelectedAddressId(addr.id);
    setForm((f) => ({
      ...f,
      customerName: addr.recipientName,
      customerPhone: addr.phoneNumber,
      shippingAddress: addr.fullAddress,
    }));
    setIsAutoFilled(true);
  };

  const handleSelectCustomAddress = () => {
    setSelectedAddressId('custom');
  };

  const handleAddressCreated = (newAddr: UserAddress) => {
    queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
    handleSelectAddress(newAddr);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;

    setIsValidatingCoupon(true);
    setCouponError(null);
    try {
      const result = await apiClient.get<CouponValidationResult>('/coupons/validate', {
        params: { code, orderTotal: subtotal },
      });
      if (result.isValid) {
        setAppliedCoupon(result);
        setCouponInput('');
      } else {
        setAppliedCoupon(null);
        setCouponError(result.message || 'Mã giảm giá không hợp lệ.');
      }
    } catch {
      setCouponError('Không kiểm tra được mã giảm giá. Vui lòng thử lại.');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const discountAmount = appliedCoupon?.isValid ? appliedCoupon.discountAmount : 0;
  const totalAmount = Math.max(0, subtotal - discountAmount);

  // Re-validate mã đang áp dụng khi subtotal thay đổi (đơn tối thiểu có thể không còn đủ)
  useEffect(() => {
    if (!appliedCoupon?.couponId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.get<CouponValidationResult>('/coupons/validate', {
          params: { code: appliedCoupon.code, orderTotal: subtotal },
        });
        if (cancelled) return;
        if (!res.isValid) {
          setAppliedCoupon(null);
          setCouponError(res.message || 'Mã giảm giá không còn áp dụng được cho giỏ hàng hiện tại.');
        }
      } catch {
        // bỏ qua lỗi tạm thời
      }
    })();
    return () => { cancelled = true; };
  }, [subtotal, appliedCoupon?.couponId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated || !user) {
      router.push('/auth/login?redirect=/checkout');
      return;
    }

    if (items.length === 0) {
      setError('Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm.');
      return;
    }

    setIsSubmitting(true);
    try {
      let currentAddressId = selectedAddressId !== 'custom' ? selectedAddressId : undefined;

      // Nếu người dùng nhập địa chỉ mới và chọn lưu vào sổ địa chỉ (DB)
      if (
        isAuthenticated &&
        user &&
        (selectedAddressId === 'custom' || !currentAddressId) &&
        saveToAddressBook &&
        form.shippingAddress.trim()
      ) {
        try {
          const savedAddr = await userAddressApi.create({
            recipientName: form.customerName.trim(),
            phoneNumber: form.customerPhone.trim(),
            streetAddress: form.shippingAddress.trim(),
            city: 'Hồ Chí Minh',
            isDefault: !savedAddresses || savedAddresses.length === 0,
          });
          if (savedAddr?.id) {
            currentAddressId = savedAddr.id;
          }
          queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
        } catch {
          // Bỏ qua nếu lỗi client-side vì backend CreateOrderHandler cũng tự động lưu vào DB
        }
      }

      const order = await orderService.createOrder({
        userId: user.id,
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        shippingAddress: form.shippingAddress.trim(),
        paymentMethod: form.paymentMethod,
        note: form.note.trim() || undefined,
        addressId: currentAddressId,
        couponId: appliedCoupon?.isValid ? appliedCoupon.couponId ?? undefined : undefined,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          optionIds: item.selectedOptions.map((o) => o.option.id),
        })),
      });

      // Save shipping info for future quick checkout
      try {
        localStorage.setItem(
          STORAGE_SHIPPING_KEY,
          JSON.stringify({
            customerName: form.customerName.trim(),
            customerPhone: form.customerPhone.trim(),
            shippingAddress: form.shippingAddress.trim(),
          })
        );
      } catch {
        // ignore
      }

      clearCart();
      setOrderSuccess(order.orderCode);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Đặt hàng thất bại. Vui lòng thử lại hoặc liên hệ cửa hàng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Success Screen (Corporate & Elegant) ---
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-16 max-w-lg text-center">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 p-8 sm:p-10 space-y-6">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100 shadow-sm">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Đặt hàng thành công!
              </h1>
              <p className="text-sm text-slate-500 mt-2">
                Cảm ơn bạn đã tin chọn Bánh Mì Sài Gòn. Đơn hàng của bạn đã được gửi đến nhà bếp.
              </p>
            </div>

            {/* Order Code Box */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between">
              <div className="text-left">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
                  Mã đơn hàng
                </span>
                <span className="text-lg font-bold text-orange-600 font-mono">
                  #{orderSuccess}
                </span>
              </div>
              <button
                onClick={() => handleCopyCode(orderSuccess)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>

            {/* Estimated time */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-600 bg-orange-50/80 text-orange-800 p-3 rounded-xl border border-orange-100">
              <Clock className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <span>Thời gian giao hàng dự kiến: <strong>20 - 30 phút</strong></span>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <Link href="/orders">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium h-11 rounded-xl shadow-sm flex items-center justify-center gap-2">
                  <span>Theo dõi đơn hàng của tôi</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/homepage">
                <Button variant="outline" className="w-full border-slate-200 text-slate-700 font-medium h-11 rounded-xl hover:bg-slate-50">
                  Tiếp tục mua hàng
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Top Stepper Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-orange-600 hover:border-orange-200 transition-colors shadow-2xs"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Thanh toán đơn hàng</h1>
              <p className="text-xs text-slate-500 mt-0.5">Hoàn tất thông tin giao nhận và thanh toán</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span className="text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 1. Giỏ hàng
            </span>
            <span>→</span>
            <span className="text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
              2. Thanh toán
            </span>
            <span>→</span>
            <span>3. Hoàn tất</span>
          </div>
        </div>

        {/* Login warning */}
        {!isAuthenticated && (
          <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span>
                Vui lòng <strong>đăng nhập</strong> để lưu lịch sử đơn hàng và tích lũy ưu đãi.
              </span>
            </div>
            <Link href="/auth/login?redirect=/checkout">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8">
                Đăng nhập
              </Button>
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left — Delivery & Payment Details (2 Cols) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recipient Information Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-4 sm:p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                    <User className="h-4 w-4 text-orange-600" />
                    <span>Thông tin người nhận</span>
                  </h2>

                  {isAutoFilled && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      <Sparkles className="w-3 h-3" />
                      Tự động điền từ tài khoản
                    </span>
                  )}
                </div>

                {/* Saved Addresses Selector */}
                {isAuthenticated && savedAddresses && savedAddresses.length > 0 && (
                  <div className="space-y-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-orange-600" />
                        <span>Chọn địa chỉ đã lưu ({savedAddresses.length})</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsAddressModalOpen(true)}
                        className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Thêm địa chỉ mới
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => handleSelectAddress(addr)}
                            className={`cursor-pointer rounded-xl p-3 border transition-all relative text-left ${
                              isSelected
                                ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20 shadow-xs'
                                : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-bold text-slate-900 text-xs truncate">
                                {addr.recipientName}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.2 rounded-full flex-shrink-0 flex items-center gap-0.5">
                                  <Star className="w-2.5 h-2.5 fill-orange-500 text-orange-500" />
                                  Mặc định
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500">{addr.phoneNumber}</p>
                            <p className="text-xs text-slate-700 mt-1 line-clamp-2 leading-relaxed">
                              {addr.fullAddress}
                            </p>
                          </div>
                        );
                      })}

                      {/* Giao đến địa chỉ khác */}
                      <div
                        onClick={handleSelectCustomAddress}
                        className={`cursor-pointer rounded-xl p-3 border transition-all text-left flex flex-col justify-center items-center gap-0.5 border-dashed ${
                          selectedAddressId === 'custom'
                            ? 'border-orange-500 bg-orange-50/30 ring-2 ring-orange-500/20'
                            : 'border-slate-300 bg-slate-50/40 hover:bg-slate-100/70'
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-700">
                          Giao đến địa chỉ khác
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Tự nhập hoặc chọn mới
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty saved address prompt for logged-in user */}
                {isAuthenticated && (!savedAddresses || savedAddresses.length === 0) && (
                  <div className="p-4 bg-orange-50/70 rounded-2xl border border-orange-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-orange-950">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Bạn chưa lưu địa chỉ nhận hàng nào</p>
                        <p className="text-slate-500 text-[11px] mt-0.5">Thêm địa chỉ vào sổ địa chỉ để hệ thống tự động lưu vào tài khoản.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddressModalOpen(true)}
                      className="font-bold text-orange-600 hover:text-orange-700 bg-white px-3 py-1.5 rounded-xl border border-orange-200 shadow-2xs hover:bg-orange-50 transition-all flex items-center gap-1.5 flex-shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Thêm địa chỉ mới
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Customer Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Họ và tên người nhận *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="customerName"
                        required
                        value={form.customerName}
                        onChange={handleChange}
                        placeholder="Ví dụ: Nguyễn Văn A"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Customer Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Số điện thoại liên hệ *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        name="customerPhone"
                        required
                        value={form.customerPhone}
                        onChange={handleChange}
                        placeholder="Ví dụ: 0901234567"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Địa chỉ nhận hàng chi tiết *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddressModalOpen(true)}
                      className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer hover:underline"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Chọn theo Tỉnh / Huyện / Xã</span>
                    </button>
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <textarea
                      name="shippingAddress"
                      required
                      rows={2}
                      value={form.shippingAddress}
                      onChange={handleChange}
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, thành phố..."
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-slate-900"
                    />
                  </div>

                  {/* Save to address book checkbox */}
                  {isAuthenticated && (selectedAddressId === 'custom' || !selectedAddressId) && (
                    <label className="flex items-center gap-2 cursor-pointer select-none mt-2">
                      <input
                        type="checkbox"
                        checked={saveToAddressBook}
                        onChange={(e) => setSaveToAddressBook(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                      />
                      <span className="text-xs text-slate-700 font-medium">
                        Lưu địa chỉ này vào sổ địa chỉ tài khoản của tôi để sử dụng cho các lần sau
                      </span>
                    </label>
                  )}
                </div>

                {/* Note */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Ghi chú đơn hàng (tuỳ chọn)
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <textarea
                      name="note"
                      rows={2}
                      value={form.note}
                      onChange={handleChange}
                      placeholder="Ví dụ: Bánh không ớt, giao trước 12h, gọi trước khi giao..."
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-4 sm:p-6 space-y-4">
                <h2 className="font-bold text-slate-900 flex items-center gap-2 text-base pb-3 border-b border-slate-100">
                  <CreditCard className="h-4 w-4 text-orange-600" />
                  <span>Phương thức thanh toán</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* COD */}
                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      form.paymentMethod === 'CASH'
                        ? 'border-orange-600 bg-orange-50/50 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CASH"
                      checked={form.paymentMethod === 'CASH'}
                      onChange={handleChange}
                      className="mt-1 text-orange-600 focus:ring-orange-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4 text-emerald-600" />
                        <span className="font-bold text-sm text-slate-900">Tiền mặt (COD)</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Thanh toán trực tiếp cho nhân viên giao hàng khi nhận bánh.
                      </p>
                    </div>
                  </label>

                  {/* Bank Transfer */}
                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      form.paymentMethod === 'BANK_TRANSFER'
                        ? 'border-orange-600 bg-orange-50/50 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="BANK_TRANSFER"
                      checked={form.paymentMethod === 'BANK_TRANSFER'}
                      onChange={handleChange}
                      className="mt-1 text-orange-600 focus:ring-orange-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                        <span className="font-bold text-sm text-slate-900">Chuyển khoản</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Quét mã QR qua ngân hàng / ứng dụng ví điện tử nhanh chóng.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right — Order Summary (1 Col - Sticky) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-4 sm:p-6 sm:sticky sm:top-24 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="font-bold text-slate-900 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-orange-600" />
                    <span>Đơn hàng của bạn</span>
                  </h2>
                  <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                    {items.length} món
                  </span>
                </div>

                {/* Items List */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1 divide-y divide-slate-100">
                  {items.map((item) => (
                    <div key={item.id} className="pt-3 first:pt-0 flex gap-3 items-start">
                      <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                        <Image
                          src={item.product.imageUrl || 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=100&q=60'}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 line-clamp-1">
                          {item.product.name}
                        </p>
                        {item.selectedOptions && item.selectedOptions.length > 0 && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {item.selectedOptions.map((o) => o.option.name).join(', ')}
                          </p>
                        )}
                        {item.note && (
                          <p className="text-[11px] text-amber-700 italic line-clamp-1 mt-0.5">
                            Ghi chú: {item.note}
                          </p>
                        )}
                        <span className="text-xs text-slate-400 font-medium">x{item.quantity}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900 whitespace-nowrap">
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Coupon Code Input */}
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                    <span>Mã giảm giá</span>
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-emerald-800 font-mono truncate">
                            {appliedCoupon.code}
                          </p>
                          <p className="text-[11px] text-emerald-700">
                            Giảm {formatCurrency(appliedCoupon.discountAmount)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex-shrink-0 cursor-pointer"
                      >
                        Bỏ mã
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyCoupon();
                            }
                          }}
                          placeholder="Nhập mã giảm giá..."
                          className="flex-1 min-w-0 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        />
                        <Button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={!couponInput.trim() || isValidatingCoupon}
                          className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 rounded-xl disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                        >
                          {isValidatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Áp dụng'}
                        </Button>
                      </div>
                      {couponError && (
                        <p className="text-[11px] text-rose-600 mt-1.5">{couponError}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Pricing Summary */}
                <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Tạm tính</span>
                    <span className="font-medium text-slate-800">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển</span>
                    <span className="text-emerald-600 font-medium">Miễn phí</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-emerald-700">Giảm giá ({appliedCoupon?.code})</span>
                      <span className="text-emerald-600 font-bold">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                    <span className="font-bold text-slate-900 text-sm">Tổng thanh toán</span>
                    <span className="text-xl font-extrabold text-orange-600">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3.5 leading-relaxed">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting || items.length === 0}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 text-sm font-bold rounded-xl shadow-md shadow-orange-500/20 transition-all disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang xử lý đơn hàng...
                    </span>
                  ) : (
                    `Xác nhận đặt hàng • ${formatCurrency(totalAmount)}`
                  )}
                </Button>

                {/* Security Guarantee */}
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cam kết bánh mì tươi nóng giòn mỗi ngày</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* Vietnam Administrative Address Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSuccess={handleAddressCreated}
        defaultRecipientName={form.customerName || user?.fullName || ''}
        defaultPhoneNumber={form.customerPhone || user?.phoneNumber || ''}
      />
    </div>
  );
}
