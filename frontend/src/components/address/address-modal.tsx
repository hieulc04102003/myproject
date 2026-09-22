'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  User, 
  Phone, 
  Building2, 
  Loader2, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { 
  vietnamAddressApi, 
  userAddressApi, 
  type Province, 
  type District, 
  type Ward, 
  type UserAddress, 
  type CreateAddressInput 
} from '@/lib/api/address';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { userProfileApi } from '@/lib/api/user';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (address: UserAddress) => void;
  initialAddress?: UserAddress | null;
  defaultRecipientName?: string;
  defaultPhoneNumber?: string;
}

export function AddressModal({
  isOpen,
  onClose,
  onSuccess,
  initialAddress,
  defaultRecipientName = '',
  defaultPhoneNumber = '',
}: AddressModalProps) {
  // Form fields
  const [recipientName, setRecipientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // Administrative regions
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // Selected names/codes
  const [selectedProvinceName, setSelectedProvinceName] = useState('');
  const [selectedDistrictName, setSelectedDistrictName] = useState('');
  const [selectedWardName, setSelectedWardName] = useState('');

  // Loading & error states
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Load data and auto-fill recipient phone & name when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoadingProvinces(true);
    setErrorMessage(null);

    // Xác định Họ tên và Số điện thoại tự động từ tài khoản
    const authUser = useAuthStore.getState().user;
    let autoPhone = defaultPhoneNumber || authUser?.phoneNumber || '';
    let autoName = defaultRecipientName || authUser?.fullName || '';

    // Kiểm tra localStorage nếu có thông tin đặt hàng trước đó
    if (!autoPhone && typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('customer_shipping_profile');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.customerPhone) autoPhone = parsed.customerPhone;
          if (!autoName && parsed.customerName) autoName = parsed.customerName;
        }
      } catch {
        // ignore
      }
    }

    // Nếu email trong auth store là chuỗi số điện thoại
    if (!autoPhone && authUser?.email && /^[0-9+]{9,15}$/.test(authUser.email.trim())) {
      autoPhone = authUser.email.trim();
    }

    // Điền form NGAY LẬP TỨC (không chờ mạng)
    if (initialAddress) {
      setRecipientName(initialAddress.recipientName || autoName);
      setPhoneNumber(initialAddress.phoneNumber || autoPhone);
      setStreetAddress(initialAddress.streetAddress || '');
      setIsDefault(initialAddress.isDefault ?? false);
    } else {
      setRecipientName(autoName);
      setPhoneNumber(autoPhone);
      setStreetAddress('');
      setSelectedProvinceName('');
      setSelectedDistrictName('');
      setSelectedWardName('');
      setIsDefault(false);
    }

    // Nếu chưa có số điện thoại và user đã đăng nhập, tự động fetch hồ sơ để điền
    if (!autoPhone && authUser) {
      userProfileApi.getProfile().then((p) => {
        if (!isMounted) return;
        if (p?.phoneNumber) {
          setPhoneNumber((cur) => cur || p.phoneNumber);
        }
        if (p?.fullName) {
          setRecipientName((cur) => cur || p.fullName);
        }
      }).catch(() => {});
    }

    // Tải danh mục 63 tỉnh thành Việt Nam
    vietnamAddressApi.getProvinces()
      .then((data) => {
        if (!isMounted) return;
        setProvinces(data);

        // Khôi phục Tỉnh/Huyện/Xã nếu đang chỉnh sửa địa chỉ cũ
        if (initialAddress) {
          const prov = data.find((p) => p.name.toLowerCase() === initialAddress.city.toLowerCase());
          if (prov) {
            setSelectedProvinceName(prov.name);
            setIsLoadingDistricts(true);
            vietnamAddressApi.getDistricts(prov.code).then((distList) => {
              if (!isMounted) return;
              setDistricts(distList);
              setIsLoadingDistricts(false);

              if (initialAddress.district) {
                const dist = distList.find(
                  (d) => d.name.toLowerCase() === initialAddress.district?.toLowerCase()
                );
                if (dist) {
                  setSelectedDistrictName(dist.name);
                  setIsLoadingWards(true);
                  vietnamAddressApi.getWards(dist.code).then((wardList) => {
                    if (!isMounted) return;
                    setWards(wardList);
                    setIsLoadingWards(false);
                    if (initialAddress.ward) {
                      setSelectedWardName(initialAddress.ward);
                    }
                  });
                }
              }
            });
          } else {
            setSelectedProvinceName(initialAddress.city || '');
            setSelectedDistrictName(initialAddress.district || '');
            setSelectedWardName(initialAddress.ward || '');
          }
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setErrorMessage('Không tải được danh mục tỉnh thành. Vui lòng thử lại.');
      })
      .finally(() => {
        if (isMounted) setIsLoadingProvinces(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, initialAddress, defaultRecipientName, defaultPhoneNumber]);

  // Handle Province change
  const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provName = e.target.value;
    setSelectedProvinceName(provName);
    setSelectedDistrictName('');
    setSelectedWardName('');
    setDistricts([]);
    setWards([]);

    if (!provName) return;

    const prov = provinces.find((p) => p.name === provName);
    if (prov) {
      setIsLoadingDistricts(true);
      try {
        const data = await vietnamAddressApi.getDistricts(prov.code);
        setDistricts(data);
      } catch (err) {
        console.error('Error loading districts:', err);
      } finally {
        setIsLoadingDistricts(false);
      }
    }
  };

  // Handle District change
  const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const distName = e.target.value;
    setSelectedDistrictName(distName);
    setSelectedWardName('');
    setWards([]);

    if (!distName) return;

    const dist = districts.find((d) => d.name === distName);
    if (dist) {
      setIsLoadingWards(true);
      try {
        const data = await vietnamAddressApi.getWards(dist.code);
        setWards(data);
      } catch (err) {
        console.error('Error loading wards:', err);
      } finally {
        setIsLoadingWards(false);
      }
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!recipientName.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên người nhận.');
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.trim().length < 9) {
      setErrorMessage('Vui lòng nhập số điện thoại người nhận hợp lệ.');
      return;
    }
    if (!selectedProvinceName) {
      setErrorMessage('Vui lòng chọn Tỉnh / Thành phố.');
      return;
    }
    if (!streetAddress.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ chi tiết (số nhà, tên đường).');
      return;
    }

    const payload: CreateAddressInput = {
      recipientName: recipientName.trim(),
      phoneNumber: phoneNumber.trim(),
      city: selectedProvinceName,
      district: selectedDistrictName || undefined,
      ward: selectedWardName || undefined,
      streetAddress: streetAddress.trim(),
      isDefault: isDefault,
    };

    setIsSaving(true);
    try {
      let saved: UserAddress;
      if (initialAddress) {
        saved = await userAddressApi.update(initialAddress.id, payload);
      } else {
        saved = await userAddressApi.create(payload);
      }
      onSuccess(saved);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setErrorMessage(msg || 'Lỗi khi lưu địa chỉ. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50/50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {initialAddress ? 'Cập nhật địa chỉ nhận hàng' : 'Thêm địa chỉ nhận hàng mới'}
              </h2>
              <p className="text-xs text-gray-500">
                Sử dụng dữ liệu hành chính mới nhất tại Việt Nam
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Recipient & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Họ và tên người nhận <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  required
                  placeholder="Ví dụ: 0901234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Administrative Selectors (Tỉnh/Thành -> Quận/Huyện -> Phường/Xã) */}
          <div className="space-y-3.5 pt-1">
            {/* Province Select */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tỉnh / Thành phố <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={selectedProvinceName}
                  onChange={handleProvinceChange}
                  disabled={isLoadingProvinces}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 disabled:opacity-60"
                >
                  <option value="">-- Chọn Tỉnh / Thành phố --</option>
                  {provinces.map((prov) => (
                    <option key={prov.code} value={prov.name}>
                      {prov.name}
                    </option>
                  ))}
                </select>
                {isLoadingProvinces && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-orange-500" />
                )}
              </div>
            </div>

            {/* District & Ward Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* District Select */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Quận / Huyện / Thị xã
                </label>
                <div className="relative">
                  <select
                    value={selectedDistrictName}
                    onChange={handleDistrictChange}
                    disabled={!selectedProvinceName || isLoadingDistricts}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 disabled:opacity-50"
                  >
                    <option value="">-- Chọn Quận / Huyện --</option>
                    {districts.map((dist) => (
                      <option key={dist.code} value={dist.name}>
                        {dist.name}
                      </option>
                    ))}
                  </select>
                  {isLoadingDistricts && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-orange-500" />
                  )}
                </div>
              </div>

              {/* Ward Select */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Phường / Xã / Thị trấn
                </label>
                <div className="relative">
                  <select
                    value={selectedWardName}
                    onChange={(e) => setSelectedWardName(e.target.value)}
                    disabled={!selectedDistrictName || isLoadingWards}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 disabled:opacity-50"
                  >
                    <option value="">-- Chọn Phường / Xã --</option>
                    {wards.map((w) => (
                      <option key={w.code} value={w.name}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                  {isLoadingWards && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-orange-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Detailed Street Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Địa chỉ chi tiết (Số nhà, tên ngõ, tên đường) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <textarea
                  required
                  rows={2}
                  placeholder="Ví dụ: 123/4B Nguyễn Thị Minh Khai, Tòa nhà Landmark..."
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Set Default Checkbox */}
          <div className="pt-2 border-t border-gray-100">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-gray-300"
              />
              <span className="text-xs font-medium text-gray-700">
                Đặt làm địa chỉ nhận hàng mặc định
              </span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border-gray-200 text-gray-700 text-xs font-semibold px-4 py-2"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold px-5 py-2 flex items-center gap-2 shadow-sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>{initialAddress ? 'Cập nhật địa chỉ' : 'Lưu địa chỉ'}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
