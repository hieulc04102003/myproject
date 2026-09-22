'use client';

import React, { useState } from 'react';
import { 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Star, 
  Phone, 
  User, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAddressApi, type UserAddress } from '@/lib/api/address';
import { AddressModal } from './address-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AddressManagerProps {
  defaultRecipientName?: string;
  defaultPhoneNumber?: string;
}

export function AddressManager({
  defaultRecipientName = '',
  defaultPhoneNumber = '',
}: AddressManagerProps) {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  // Fetch addresses
  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['user', 'addresses'],
    queryFn: () => userAddressApi.getAll(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => userAddressApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
      setSuccessMessage('Xóa địa chỉ thành công!');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setErrorMessage(msg || 'Lỗi khi xóa địa chỉ.');
      setTimeout(() => setErrorMessage(null), 3000);
    },
    onSettled: () => setDeletingId(null),
  });

  // Set default mutation
  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => userAddressApi.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
      setSuccessMessage('Đã thiết lập địa chỉ mặc định!');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setErrorMessage(msg || 'Lỗi khi thiết lập mặc định.');
      setTimeout(() => setErrorMessage(null), 3000);
    },
    onSettled: () => setSettingDefaultId(null),
  });

  const handleOpenCreate = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (addr: UserAddress) => {
    setEditingAddress(addr);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      setDeletingId(id);
      deleteMutation.mutate(id);
    }
  };

  const handleSetDefault = (id: string) => {
    setSettingDefaultId(id);
    setDefaultMutation.mutate(id);
  };

  const handleSaveSuccess = (saved: UserAddress) => {
    queryClient.invalidateQueries({ queryKey: ['user', 'addresses'] });
    setSuccessMessage(editingAddress ? 'Cập nhật địa chỉ thành công!' : 'Thêm địa chỉ mới thành công!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="space-y-5">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-orange-600" />
            <span>Sổ địa chỉ nhận hàng</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Quản lý danh sách các địa chỉ giao hàng để đặt món nhanh chóng hơn
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-xs font-semibold px-4 py-2.5 flex items-center gap-2 shadow-xs self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm địa chỉ mới</span>
        </Button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-semibold text-red-800 animate-in fade-in">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Addresses List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 bg-white rounded-3xl border border-gray-100">
          <Loader2 className="h-7 w-7 text-orange-600 animate-spin" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200 p-8">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-3">
            <MapPin className="h-7 w-7" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm">Chưa có địa chỉ giao hàng nào</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Thêm địa chỉ nhà riêng hoặc văn phòng để hệ thống tự động điền khi bạn đặt bánh mì nóng hổi.
          </p>
          <Button
            onClick={handleOpenCreate}
            className="mt-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold px-4 py-2"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Thêm địa chỉ ngay
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`relative rounded-3xl p-5 border transition-all flex flex-col justify-between bg-white ${
                addr.isDefault
                  ? 'border-orange-300 ring-2 ring-orange-500/10 shadow-sm'
                  : 'border-gray-200/80 hover:border-gray-300 shadow-xs'
              }`}
            >
              <div>
                {/* Header card: Name & Badge */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-gray-400" />
                      {addr.recipientName}
                    </span>
                    {addr.isDefault && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                        <Star className="h-3 w-3 fill-orange-500 text-orange-500" />
                        Mặc định
                      </span>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  <span className="font-medium">{addr.phoneNumber}</span>
                </div>

                {/* Full Address */}
                <div className="flex items-start gap-2 text-xs text-gray-700">
                  <MapPin className="h-3.5 w-3.5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{addr.fullAddress}</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 text-xs">
                {!addr.isDefault ? (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    disabled={settingDefaultId === addr.id}
                    className="text-gray-500 hover:text-orange-600 font-medium transition-colors flex items-center gap-1"
                  >
                    {settingDefaultId === addr.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-600" />
                    ) : (
                      <Star className="h-3.5 w-3.5" />
                    )}
                    <span>Đặt làm mặc định</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Địa chỉ ưu tiên
                  </span>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleOpenEdit(addr)}
                    className="text-gray-600 hover:text-orange-600 font-medium transition-colors flex items-center gap-1"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Sửa</span>
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    disabled={deletingId === addr.id}
                    className="text-red-500 hover:text-red-700 font-medium transition-colors flex items-center gap-1"
                  >
                    {deletingId === addr.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Modal (Create / Edit) */}
      <AddressModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSaveSuccess}
        initialAddress={editingAddress}
        defaultRecipientName={defaultRecipientName}
        defaultPhoneNumber={defaultPhoneNumber}
      />
    </div>
  );
}
