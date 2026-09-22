'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Star, 
  Flame, 
  Check, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Clock, 
  ShieldCheck, 
  Truck, 
  AlertCircle,
  Share2,
  ChevronRight,
  Heart
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/features/home/components/product-card';
import { useProduct, useProducts } from '@/features/home/hooks/use-products';
import { useCartStore } from '@/store/cart-store';
import { formatCurrency } from '@/lib/utils';
import type { OptionGroup, Option, Product } from '@/types/product';
import type { CartItemOption } from '@/types/cart';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const addItem = useCartStore((state) => state.addItem);

  // Fetch product details
  const { data: product, isLoading, isError } = useProduct(productId);

  // Fetch related products in the same category
  const { data: relatedData } = useProducts({
    categoryId: product?.categoryId,
  });

  const relatedProducts = useMemo(() => {
    if (!relatedData?.products) return [];
    return relatedData.products.filter((p) => p.id !== productId).slice(0, 4);
  }, [relatedData, productId]);

  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [selectedOptionsByGroup, setSelectedOptionsByGroup] = useState<Record<string, Option[]>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const optionGroups: OptionGroup[] = useMemo(() => {
    return product?.optionGroups || [];
  }, [product]);

  // Initialize selected options when product or optionGroups load
  useEffect(() => {
    if (!product || optionGroups.length === 0) return;

    const initial: Record<string, Option[]> = {};
    optionGroups.forEach((group) => {
      const availableOptions = (group.options || []).filter((opt) => opt.isAvailable !== false);
      const isSingle = group.selectionType === 'SINGLE' || group.maxSelection === 1;

      if (group.isRequired && isSingle && availableOptions.length > 0) {
        initial[group.id] = [availableOptions[0]];
      } else {
        initial[group.id] = [];
      }
    });

    setSelectedOptionsByGroup(initial);
    setQuantity(1);
    setNote('');
    setErrorMsg(null);
    setAddedSuccess(false);
  }, [product, optionGroups]);

  const handleSingleSelect = (group: OptionGroup, option: Option) => {
    setSelectedOptionsByGroup((prev) => ({
      ...prev,
      [group.id]: [option],
    }));
    setErrorMsg(null);
  };

  const handleMultiSelectToggle = (group: OptionGroup, option: Option) => {
    const current = selectedOptionsByGroup[group.id] || [];
    const isSelected = current.some((opt) => opt.id === option.id);
    const max = group.maxSelection || 999;

    if (isSelected) {
      setSelectedOptionsByGroup((prev) => ({
        ...prev,
        [group.id]: current.filter((opt) => opt.id !== option.id),
      }));
    } else {
      if (current.length >= max) {
        setErrorMsg(`Nhóm "${group.name}" chỉ được chọn tối đa ${max} tùy chọn.`);
        return;
      }
      setSelectedOptionsByGroup((prev) => ({
        ...prev,
        [group.id]: [...current, option],
      }));
      setErrorMsg(null);
    }
  };

  // Pricing calculations
  const optionsExtraPerItem = useMemo(() => {
    return Object.values(selectedOptionsByGroup)
      .flat()
      .reduce((sum, opt) => sum + (opt.priceModifier ?? opt.additionalPrice ?? 0), 0);
  }, [selectedOptionsByGroup]);

  const unitPrice = (product?.basePrice ?? 0) + optionsExtraPerItem;
  const totalPrice = unitPrice * quantity;

  // Validation
  const validateSelections = (): string | null => {
    for (const group of optionGroups) {
      const selected = selectedOptionsByGroup[group.id] || [];
      const min = group.minSelection ?? (group.isRequired ? 1 : 0);

      if (group.isRequired && selected.length === 0) {
        return `Vui lòng chọn tùy chọn trong mục "${group.name}".`;
      }
      if (min > 0 && selected.length < min) {
        return `Mục "${group.name}" yêu cầu chọn tối thiểu ${min} tùy chọn.`;
      }
    }
    return null;
  };

  const buildCartItemOptions = (): CartItemOption[] => {
    const cartItemOptions: CartItemOption[] = [];
    optionGroups.forEach((group) => {
      const selected = selectedOptionsByGroup[group.id] || [];
      selected.forEach((opt) => {
        cartItemOptions.push({
          optionGroupId: group.id,
          optionGroupName: group.name,
          option: {
            id: opt.id,
            name: opt.name,
            additionalPrice: opt.priceModifier ?? opt.additionalPrice ?? 0,
            priceModifier: opt.priceModifier ?? opt.additionalPrice ?? 0,
            isAvailable: opt.isAvailable ?? true,
          },
        });
      });
    });
    return cartItemOptions;
  };

  const handleAddToCart = () => {
    if (!product) return;
    const validationError = validateSelections();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    addItem(product, buildCartItemOptions(), quantity, note.trim() || undefined);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3500);
  };

  const handleBuyNow = () => {
    if (!product) return;
    const validationError = validateSelections();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    addItem(product, buildCartItemOptions(), quantity, note.trim() || undefined);
    router.push('/checkout');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-1 max-w-6xl">
          <div className="mb-6 flex gap-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-4" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="lg:col-span-5">
              <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
            <div className="lg:col-span-7 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
              <div className="flex gap-4 pt-4">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 flex-1" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Not Found / Error state
  if (isError || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-16 flex-1 max-w-md text-center">
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Không tìm thấy món ăn</h2>
            <p className="text-sm text-gray-500">
              Món ăn bạn đang tìm kiếm có thể đã tạm ngưng phục vụ hoặc không tồn tại.
            </p>
            <Link
              href="/homepage"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại thực đơn
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const categoryDisplayName = product.category?.name || product.categoryName || 'Món ăn';
  const isProductAvailable = product.isAvailable !== false;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-6 flex-1 max-w-6xl space-y-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
          <Link href="/homepage" className="hover:text-orange-600 transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          <span className="hover:text-orange-600 cursor-pointer">{categoryDisplayName}</span>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          <span className="font-medium text-gray-900 line-clamp-1">{product.name}</span>
        </nav>

        {/* Product Hero Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100/80 p-5 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left Column: Image & Badges & Highlights */}
            <div className="lg:col-span-5 space-y-6">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-100 border border-gray-100 shadow-inner group">
                <Image
                  src={
                    product.imageUrl ||
                    'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=800&q=80'
                  }
                  alt={product.name}
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 1024px) 100vw, 450px"
                />

                {/* Badges */}
                <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                  {product.isFeatured && (
                    <Badge className="bg-red-500 hover:bg-red-600 text-white border-none shadow-md px-3 py-1 text-xs">
                      <Flame className="w-3.5 h-3.5 mr-1" />
                      Món bán chạy
                    </Badge>
                  )}
                  {!isProductAvailable && (
                    <Badge className="bg-gray-800 text-white border-none px-3 py-1 text-xs shadow-md">
                      Tạm ngưng phục vụ
                    </Badge>
                  )}
                </div>

                {product.averageRating && (
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-md flex items-center gap-1.5 border border-gray-100">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-gray-800">
                      {product.averageRating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {/* Service Commitments Box */}
              <div className="grid grid-cols-3 gap-3 rounded-2xl bg-orange-50/50 p-4 border border-orange-100/60 text-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-orange-600 shadow-xs">
                    <Truck className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-800">Giao 30 phút</span>
                  <span className="text-[10px] text-gray-500">Nóng hổi tận nơi</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-orange-600 shadow-xs">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-800">Chuẩn sạch</span>
                  <span className="text-[10px] text-gray-500">Tươi ngon mỗi ngày</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-orange-600 shadow-xs">
                    <Clock className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-800">Đổi trả ngay</span>
                  <span className="text-[10px] text-gray-500">Nếu không hài lòng</span>
                </div>
              </div>
            </div>

            {/* Right Column: Product Info & Customization */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Category & Status */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider uppercase text-orange-600">
                    {categoryDisplayName}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      isProductAvailable
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isProductAvailable ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                    />
                    {isProductAvailable ? 'Đang sẵn sàng' : 'Tạm hết món'}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {product.name}
                </h1>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="font-semibold text-gray-800">
                    {product.averageRating ? product.averageRating.toFixed(1) : '5.0'}
                  </span>
                  <span>•</span>
                  <span>{product.totalReviews ?? 24} đánh giá</span>
                  {product.stockQuantity !== undefined && product.stockQuantity > 0 && (
                    <>
                      <span>•</span>
                      <span>Kho: {product.stockQuantity}</span>
                    </>
                  )}
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 rounded-2xl bg-gray-50/80 p-4 border border-gray-100">
                  <span className="text-2xl sm:text-3xl font-black text-orange-600">
                    {formatCurrency(unitPrice)}
                  </span>
                  {optionsExtraPerItem > 0 && (
                    <span className="text-sm text-gray-400">
                      (Giá gốc: {formatCurrency(product.basePrice)} + Topping:{' '}
                      <span className="text-orange-600 font-semibold">
                        +{formatCurrency(optionsExtraPerItem)}
                      </span>
                      )
                    </span>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <div>
                    <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-1">
                      Mô tả món ăn
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Option Groups (Topping / Customizations) */}
              <div className="border-t border-gray-100 pt-6 space-y-5">
                {errorMsg && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200 animate-shake">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {optionGroups.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-gray-900">
                        Tùy chọn & Topping đi kèm
                      </h3>
                      <span className="text-xs text-gray-400">
                        {optionGroups.length} nhóm tùy chọn
                      </span>
                    </div>

                    <div className="space-y-4">
                      {optionGroups.map((group) => {
                        const isSingle = group.selectionType === 'SINGLE' || group.maxSelection === 1;
                        const selectedList = selectedOptionsByGroup[group.id] || [];
                        const availableOptions = (group.options || []).filter(
                          (opt) => opt.isAvailable !== false
                        );

                        return (
                          <div
                            key={group.id}
                            className="rounded-2xl border border-gray-200/80 bg-gray-50/40 p-4 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-800">
                                  {group.name}
                                </span>
                                {group.isRequired ? (
                                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                                    Bắt buộc
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-gray-200/80 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                                    Tùy chọn
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-gray-500">
                                {isSingle
                                  ? 'Chọn 1'
                                  : group.maxSelection
                                  ? `Tối đa ${group.maxSelection}`
                                  : 'Chọn nhiều'}
                              </span>
                            </div>

                            {availableOptions.length === 0 ? (
                              <p className="text-xs italic text-gray-400">Không có tùy chọn</p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {availableOptions.map((opt) => {
                                  const price = opt.priceModifier ?? opt.additionalPrice ?? 0;
                                  const isSelected = selectedList.some((s) => s.id === opt.id);

                                  return (
                                    <div
                                      key={opt.id}
                                      onClick={() =>
                                        isSingle
                                          ? handleSingleSelect(group, opt)
                                          : handleMultiSelectToggle(group, opt)
                                      }
                                      className={`flex cursor-pointer items-center justify-between rounded-xl p-2.5 transition-all ${
                                        isSelected
                                          ? 'border-orange-400 bg-orange-50/80 text-orange-950 font-medium border shadow-xs'
                                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700 border'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div
                                          className={`flex h-4 w-4 flex-shrink-0 items-center justify-center transition-colors ${
                                            isSingle
                                              ? `rounded-full border ${
                                                  isSelected
                                                    ? 'border-orange-600 bg-orange-600 text-white'
                                                    : 'border-gray-300 bg-white'
                                                }`
                                              : `rounded border ${
                                                  isSelected
                                                    ? 'border-orange-600 bg-orange-600 text-white'
                                                    : 'border-gray-300 bg-white'
                                                }`
                                          }`}
                                        >
                                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                                        </div>
                                        <span className="text-xs sm:text-sm truncate">{opt.name}</span>
                                      </div>

                                      <span
                                        className={`text-xs font-bold flex-shrink-0 ${
                                          price > 0 ? 'text-orange-600' : 'text-gray-400'
                                        }`}
                                      >
                                        {price > 0 ? `+${formatCurrency(price)}` : '0 ₫'}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Special Note Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Ghi chú đặc biệt cho quán (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="VD: Không lấy rau, cho tương ớt riêng, ít đá..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                  />
                </div>

                {/* Success Notification Alert */}
                {addedSuccess && (
                  <div className="flex items-center justify-between rounded-2xl bg-emerald-50 p-4 border border-emerald-200 text-emerald-800 animate-in fade-in">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white">
                        <Check className="h-4 w-4 stroke-[3]" />
                      </div>
                      <span className="text-sm font-semibold">
                        Đã thêm vào giỏ hàng thành công!
                      </span>
                    </div>
                    <Link
                      href="/cart"
                      className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
                    >
                      Xem giỏ hàng
                    </Link>
                  </div>
                )}

                {/* Quantity & Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  {/* Quantity Stepper */}
                  <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-gray-50/80 p-1.5 h-12">
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      disabled={quantity <= 1 || !isProductAvailable}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-700 shadow-xs hover:bg-gray-100 disabled:opacity-40 transition-colors"
                      aria-label="Giảm"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center text-base font-extrabold text-gray-800">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => prev + 1)}
                      disabled={!isProductAvailable}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-700 shadow-xs hover:bg-gray-100 disabled:opacity-40 transition-colors"
                      aria-label="Tăng"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!isProductAvailable}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-orange-600 bg-orange-50 px-5 py-3 text-sm font-bold text-orange-700 hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] h-12"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Thêm vào giỏ • {formatCurrency(totalPrice)}</span>
                  </button>

                  {/* Buy Now Button */}
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={!isProductAvailable}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] h-12 sm:min-w-[140px]"
                  >
                    <span>Mua ngay</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Món ngon tương tự
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Khám phá thêm các món khác cùng danh mục {categoryDisplayName}
                </p>
              </div>
              <Link
                href="/homepage"
                className="text-xs sm:text-sm font-semibold text-orange-600 hover:text-orange-700 hover:underline"
              >
                Xem tất cả
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
