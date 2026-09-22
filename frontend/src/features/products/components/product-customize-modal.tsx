'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { X, Plus, Minus, Check, AlertCircle, ShoppingBag } from 'lucide-react';
import type { Product, OptionGroup, Option } from '@/types/product';
import type { CartItemOption } from '@/types/cart';
import { useCartStore } from '@/store/cart-store';
import { formatCurrency } from '@/lib/utils';
import { adminProductsApi } from '@/lib/api/admin';
import { useQuery } from '@tanstack/react-query';

interface ProductCustomizeModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ProductCustomizeModal({
  product,
  isOpen,
  onClose,
  onSuccess,
}: ProductCustomizeModalProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch product details with option groups if optionGroups was not included in product
  const { data: fullProduct, isLoading: isFetchingDetails } = useQuery({
    queryKey: ['product-details-with-options', product?.id],
    queryFn: () => (product?.id ? adminProductsApi.getById(product.id) : null),
    enabled: isOpen && !!product?.id && product.optionGroups === undefined,
    staleTime: 60 * 1000,
  });

  const activeProduct = fullProduct || product;
  const optionGroups: OptionGroup[] = useMemo(() => {
    return activeProduct?.optionGroups || [];
  }, [activeProduct]);

  // Selected options state: key is groupId, value is array of selected Option objects
  const [selectedOptionsByGroup, setSelectedOptionsByGroup] = useState<Record<string, Option[]>>({});

  // Initialize selections when modal opens or activeProduct changes
  useEffect(() => {
    if (!isOpen || !activeProduct) {
      setQuantity(1);
      setNote('');
      setSelectedOptionsByGroup({});
      setErrorMsg(null);
      return;
    }

    const initialSelections: Record<string, Option[]> = {};

    optionGroups.forEach((group) => {
      const availableOptions = (group.options || []).filter((opt) => opt.isAvailable !== false);
      const isSingle = group.selectionType === 'SINGLE' || group.maxSelection === 1;

      // If group is required and single-choice, pre-select the first available option
      if (group.isRequired && isSingle && availableOptions.length > 0) {
        initialSelections[group.id] = [availableOptions[0]];
      } else {
        initialSelections[group.id] = [];
      }
    });

    setSelectedOptionsByGroup(initialSelections);
    setQuantity(1);
    setNote('');
    setErrorMsg(null);
  }, [isOpen, activeProduct, optionGroups]);

  if (!isOpen || !activeProduct) return null;

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
      // Remove option
      setSelectedOptionsByGroup((prev) => ({
        ...prev,
        [group.id]: current.filter((opt) => opt.id !== option.id),
      }));
    } else {
      // Add option if not exceeding maxSelection
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

  // Calculate pricing
  const optionsExtraPerItem = Object.values(selectedOptionsByGroup)
    .flat()
    .reduce((sum, opt) => sum + (opt.priceModifier ?? opt.additionalPrice ?? 0), 0);

  const resolvedBasePrice = Number(activeProduct.basePrice ?? (activeProduct as any).price ?? 0);
  const unitPrice = resolvedBasePrice + optionsExtraPerItem;
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

  const handleAddToCart = () => {
    const validationError = validateSelections();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    // Build CartItemOption array
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

    addItem(activeProduct, cartItemOptions, quantity, note.trim() || undefined);
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative border-b border-gray-100 p-4 sm:p-5">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-start gap-4 pr-8">
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 border border-gray-100">
              <Image
                src={
                  activeProduct.imageUrl ||
                  'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=400&q=80'
                }
                alt={activeProduct.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-gray-900 line-clamp-1">{activeProduct.name}</h2>
              {activeProduct.description && (
                <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{activeProduct.description}</p>
              )}
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-base font-bold text-orange-600">
                  {formatCurrency(unitPrice)}
                </span>
                {optionsExtraPerItem > 0 && (
                  <span className="text-xs text-gray-400">
                    (Gốc: {formatCurrency(resolvedBasePrice)})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Body (Option Groups List) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isFetchingDetails ? (
            <div className="py-12 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-orange-600 border-t-transparent"></div>
              <p className="mt-2 text-xs text-gray-500">Đang tải tùy chọn món ăn...</p>
            </div>
          ) : optionGroups.length === 0 ? (
            <div className="py-6 text-center text-gray-500 text-sm">
              Món ăn này không có nhóm tùy chọn riêng. Bạn có thể chọn số lượng và thêm vào giỏ hàng ngay.
            </div>
          ) : (
            optionGroups.map((group) => {
              const isSingle = group.selectionType === 'SINGLE' || group.maxSelection === 1;
              const selectedList = selectedOptionsByGroup[group.id] || [];
              const availableOptions = (group.options || []).filter((opt) => opt.isAvailable !== false);

              return (
                <div key={group.id} className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  {/* Group Header */}
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm">{group.name}</h3>
                        {group.isRequired ? (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                            Bắt buộc
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-200/80 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                            Không bắt buộc
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {isSingle
                          ? 'Vui lòng chọn 1 lựa chọn'
                          : group.maxSelection
                          ? `Chọn tối đa ${group.maxSelection} lựa chọn`
                          : 'Có thể chọn nhiều tùy chọn'}
                      </p>
                    </div>

                    {selectedList.length > 0 && (
                      <span className="text-xs font-semibold text-orange-600">
                        Đã chọn {selectedList.length}
                      </span>
                    )}
                  </div>

                  {/* Options List */}
                  {availableOptions.length === 0 ? (
                    <p className="text-xs italic text-gray-400">Không có tùy chọn khả dụng</p>
                  ) : (
                    <div className="space-y-2">
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
                            className={`flex cursor-pointer items-center justify-between rounded-lg p-2.5 transition-all ${
                              isSelected
                                ? 'bg-orange-50 border border-orange-300 text-orange-950 font-medium'
                                : 'bg-white border border-gray-200/70 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Custom Radio / Checkbox Indicator */}
                              <div
                                className={`flex h-4 w-4 items-center justify-center transition-colors ${
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
                              <span className="text-sm">{opt.name}</span>
                            </div>

                            <span
                              className={`text-xs font-semibold ${
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
            })
          )}

          {/* Special Instruction / Note */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Ghi chú thêm cho món ăn (tùy chọn)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Ít đá, không lấy muỗng nhựa..."
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            {/* Quantity Stepper */}
            <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50/80 p-1">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                disabled={quantity <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                aria-label="Giảm số lượng"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-9 text-center text-sm font-bold text-gray-800">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((prev) => prev + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm hover:bg-gray-100 transition-colors"
                aria-label="Tăng số lượng"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Submit Button with Total */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-orange-700 transition-all active:scale-[0.98]"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Thêm vào giỏ • {formatCurrency(totalPrice)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
