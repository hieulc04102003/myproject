'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Layers, 
  Check, 
  X, 
  AlertCircle, 
  Loader2, 
  ToggleLeft, 
  ToggleRight, 
  UtensilsCrossed, 
  Sparkles, 
  Search 
} from 'lucide-react';
import { adminOptionsApi, type OptionGroup, type OptionItem } from '@/lib/api/admin';
import { Pagination } from '@/components/ui/pagination';

interface ToppingsManagementProps {
  role?: 'admin' | 'staff';
}

export function ToppingsManagement({ role = 'admin' }: ToppingsManagementProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(1);
  };

  // Modals state
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<OptionGroup | null>(null);
  const [groupFormData, setGroupFormData] = useState({
    name: '',
    selectionType: 'MULTIPLE',
    isRequired: false,
    minSelection: 0,
    maxSelection: 0,
  });

  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [targetGroupId, setTargetGroupId] = useState<string | null>(null);
  const [editingOption, setEditingOption] = useState<OptionItem | null>(null);
  const [optionFormData, setOptionFormData] = useState({
    name: '',
    priceModifier: 0,
    isAvailable: true,
  });

  // Query groups
  const { data: groups, isLoading } = useQuery({
    queryKey: ['admin', 'toppings'],
    queryFn: () => adminOptionsApi.getAllGroups(),
  });

  // Group mutations
  const createGroupMutation = useMutation({
    mutationFn: (data: typeof groupFormData) => adminOptionsApi.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'toppings'] });
      closeGroupModal();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg || 'Thêm nhóm topping thất bại');
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof groupFormData }) =>
      adminOptionsApi.updateGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'toppings'] });
      closeGroupModal();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg || 'Cập nhật nhóm topping thất bại');
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id: string) => adminOptionsApi.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'toppings'] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg || 'Không thể xóa nhóm này. Có thể nhóm đang được liên kết với sản phẩm.');
    },
  });

  // Option item mutations
  const createOptionMutation = useMutation({
    mutationFn: ({ groupId, data }: { groupId: string; data: typeof optionFormData }) =>
      adminOptionsApi.createOption(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'toppings'] });
      closeOptionModal();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg || 'Thêm món topping thất bại');
    },
  });

  const updateOptionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof optionFormData }) =>
      adminOptionsApi.updateOption(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'toppings'] });
      closeOptionModal();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg || 'Cập nhật món topping thất bại');
    },
  });

  const deleteOptionMutation = useMutation({
    mutationFn: (id: string) => adminOptionsApi.deleteOption(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'toppings'] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg || 'Không thể xóa món topping này');
    },
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: (id: string) => adminOptionsApi.toggleAvailability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'toppings'] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg || 'Không thể cập nhật trạng thái');
    },
  });

  // Handlers for Group modal
  const openCreateGroupModal = () => {
    setEditingGroup(null);
    setGroupFormData({
      name: '',
      selectionType: 'MULTIPLE',
      isRequired: false,
      minSelection: 0,
      maxSelection: 0,
    });
    setIsGroupModalOpen(true);
  };

  const openEditGroupModal = (group: OptionGroup) => {
    setEditingGroup(group);
    setGroupFormData({
      name: group.name,
      selectionType: group.selectionType || 'MULTIPLE',
      isRequired: group.isRequired || false,
      minSelection: group.minSelection || 0,
      maxSelection: group.maxSelection || 0,
    });
    setIsGroupModalOpen(true);
  };

  const closeGroupModal = () => {
    setIsGroupModalOpen(false);
    setEditingGroup(null);
  };

  const handleGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupFormData.name.trim()) {
      alert('Vui lòng nhập tên nhóm topping');
      return;
    }

    if (editingGroup) {
      updateGroupMutation.mutate({ id: editingGroup.id, data: groupFormData });
    } else {
      createGroupMutation.mutate(groupFormData);
    }
  };

  const handleDeleteGroup = (group: OptionGroup) => {
    if (
      confirm(
        `Bạn có chắc chắn muốn xóa nhóm topping "${group.name}"? Toàn bộ các tùy chọn con bên trong sẽ bị xóa khỏi nhóm.`
      )
    ) {
      deleteGroupMutation.mutate(group.id);
    }
  };

  // Handlers for Option item modal
  const openCreateOptionModal = (groupId: string) => {
    setTargetGroupId(groupId);
    setEditingOption(null);
    setOptionFormData({
      name: '',
      priceModifier: 0,
      isAvailable: true,
    });
    setIsOptionModalOpen(true);
  };

  const openEditOptionModal = (option: OptionItem) => {
    setEditingOption(option);
    setOptionFormData({
      name: option.name,
      priceModifier: option.priceModifier,
      isAvailable: option.isAvailable ?? true,
    });
    setIsOptionModalOpen(true);
  };

  const closeOptionModal = () => {
    setIsOptionModalOpen(false);
    setEditingOption(null);
    setTargetGroupId(null);
  };

  const handleOptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!optionFormData.name.trim()) {
      alert('Vui lòng nhập tên topping');
      return;
    }

    if (editingOption) {
      updateOptionMutation.mutate({ id: editingOption.id, data: optionFormData });
    } else if (targetGroupId) {
      createOptionMutation.mutate({ groupId: targetGroupId, data: optionFormData });
    }
  };

  const handleDeleteOption = (option: OptionItem) => {
    if (confirm(`Bạn có chắc muốn xóa món topping "${option.name}"?`)) {
      deleteOptionMutation.mutate(option.id);
    }
  };

  // Filter groups
  const filteredGroups = groups?.filter((g) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      g.name.toLowerCase().includes(q) ||
      g.options?.some((o) => o.name.toLowerCase().includes(q))
    );
  }) || [];

  const totalPages = Math.ceil(filteredGroups.length / pageSize);
  const paginatedGroups = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredGroups.slice(start, start + pageSize);
  }, [filteredGroups, page, pageSize]);

  // Stats
  const totalGroups = groups?.length || 0;
  const totalOptions = groups?.reduce((acc, g) => acc + (g.options?.length || 0), 0) || 0;
  const availableOptions =
    groups?.reduce(
      (acc, g) => acc + (g.options?.filter((o) => o.isAvailable !== false).length || 0),
      0
    ) || 0;

  const formatVnd = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-7 h-7 text-orange-600" />
            <span>Quản lý Topping & Tùy chọn</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Thiết lập các nhóm tùy chọn (độ cay, sốt) và các món topping thêm kèm giá tiền
          </p>
        </div>

        <button
          onClick={openCreateGroupModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus size={18} />
          <span>Thêm nhóm Topping</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng nhóm Topping</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalGroups}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
            <Layers size={22} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng món Topping</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalOptions}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <UtensilsCrossed size={22} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Đang phục vụ</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {availableOptions} <span className="text-xs text-gray-400 font-normal">/ {totalOptions}</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Sparkles size={22} />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Tìm kiếm nhóm hoặc tên món topping..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full px-2 py-0.5"
          >
            Xóa
          </button>
        )}
      </div>

      {/* Groups & Options List */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-200 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Đang tải danh sách topping...</p>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-200 shadow-xs max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-3">
            <Layers size={28} />
          </div>
          <h3 className="text-base font-bold text-gray-900">
            {searchQuery ? 'Không tìm thấy topping phù hợp' : 'Chưa có nhóm topping nào'}
          </h3>
          <p className="text-xs text-gray-500 mt-1 mb-5">
            {searchQuery
              ? 'Hãy thử tìm kiếm với từ khóa khác.'
              : 'Tạo nhóm tùy chọn đầu tiên (ví dụ: "Topping thêm", "Chọn độ cay") để gán cho sản phẩm.'}
          </p>
          {!searchQuery && (
            <button
              onClick={openCreateGroupModal}
              className="px-4 py-2 bg-orange-600 text-white text-xs font-semibold rounded-xl hover:bg-orange-700"
            >
              Tạo nhóm Topping ngay
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {paginatedGroups.map((group) => {
            const isSingle = group.selectionType === 'SINGLE';
            const isRequired = group.isRequired;

            return (
              <div
                key={group.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden transition-all hover:border-gray-300"
              >
                {/* Group Card Header */}
                <div className="p-5 bg-slate-50/60 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100/70 text-orange-700 flex items-center justify-center font-bold">
                      <Layers size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-bold text-gray-900">{group.name}</h2>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                            isSingle
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}
                        >
                          {isSingle ? 'Chọn 1 tùy chọn' : 'Chọn nhiều tùy chọn'}
                        </span>
                        {isRequired ? (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                            Bắt buộc chọn
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                            Không bắt buộc
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Tối thiểu: {group.minSelection || 0} • Tối đa:{' '}
                        {group.maxSelection && group.maxSelection > 0 ? group.maxSelection : 'Không giới hạn'}
                      </p>
                    </div>
                  </div>

                  {/* Group Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openCreateOptionModal(group.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 text-xs font-semibold border border-orange-200 transition-colors"
                    >
                      <Plus size={14} />
                      <span>Thêm món</span>
                    </button>
                    <button
                      onClick={() => openEditGroupModal(group)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                      title="Sửa thông tin nhóm"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                      title="Xóa nhóm topping"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Options Table */}
                <div className="p-0">
                  {group.options && group.options.length > 0 ? (
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-gray-100 bg-white text-[11px] font-semibold uppercase text-gray-400">
                        <tr>
                          <th className="px-6 py-3">Tên món Topping</th>
                          <th className="px-6 py-3">Giá phụ thu</th>
                          <th className="px-6 py-3">Trạng thái bán</th>
                          <th className="px-6 py-3 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {group.options.map((opt) => {
                          const isAvailable = opt.isAvailable !== false;

                          return (
                            <tr key={opt.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-3.5 font-medium text-gray-900">
                                {opt.name}
                              </td>
                              <td className="px-6 py-3.5 font-semibold text-gray-800">
                                {opt.priceModifier > 0 ? (
                                  <span className="text-orange-600">+{formatVnd(opt.priceModifier)}</span>
                                ) : (
                                  <span className="text-gray-400 font-normal">Miễn phí (0đ)</span>
                                )}
                              </td>
                              <td className="px-6 py-3.5">
                                <button
                                  onClick={() => toggleAvailabilityMutation.mutate(opt.id)}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                                    isAvailable
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                                  }`}
                                  title="Bấm để bật/tắt trạng thái phục vụ"
                                >
                                  {isAvailable ? (
                                    <>
                                      <Check size={12} className="stroke-[3]" />
                                      <span>Còn hàng</span>
                                    </>
                                  ) : (
                                    <>
                                      <X size={12} className="stroke-[3]" />
                                      <span>Tạm hết</span>
                                    </>
                                  )}
                                </button>
                              </td>
                              <td className="px-6 py-3.5 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    onClick={() => openEditOptionModal(opt)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Sửa món topping"
                                  >
                                    <Edit size={15} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteOption(opt)}
                                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Xóa món topping"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-8 text-center text-xs text-gray-400">
                      Nhóm này chưa có món topping nào.{' '}
                      <button
                        onClick={() => openCreateOptionModal(group.id)}
                        className="text-orange-600 font-semibold hover:underline"
                      >
                        Thêm món đầu tiên
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {filteredGroups.length > 0 && (
            <div className="pt-2">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={filteredGroups.length}
                pageSize={pageSize}
                onPageChange={(p) => setPage(p)}
                onPageSizeChange={(s) => {
                  setPageSize(s);
                  setPage(1);
                }}
                pageSizeOptions={[6, 9, 18]}
                itemName="nhóm topping"
              />
            </div>
          )}
        </div>
      )}

      {/* Modal 1: Create / Edit Group */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingGroup ? 'Chỉnh sửa Nhóm Topping' : 'Thêm Nhóm Topping mới'}
              </h3>
              <button onClick={closeGroupModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGroupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tên nhóm topping <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={groupFormData.name}
                  onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                  placeholder="VD: Topping thêm, Chọn độ cay..."
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Kiểu lựa chọn
                </label>
                <select
                  value={groupFormData.selectionType}
                  onChange={(e) => setGroupFormData({ ...groupFormData, selectionType: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="MULTIPLE">Chọn nhiều món (Topping thêm)</option>
                  <option value="SINGLE">Chỉ chọn 1 món (Độ cay, Size...)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={groupFormData.isRequired}
                  onChange={(e) => setGroupFormData({ ...groupFormData, isRequired: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="isRequired" className="text-xs font-medium text-gray-700 cursor-pointer">
                  Bắt buộc khách hàng phải chọn khi đặt món
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Chọn tối thiểu
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={groupFormData.minSelection}
                    onChange={(e) =>
                      setGroupFormData({ ...groupFormData, minSelection: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Chọn tối đa (0 = vô hạn)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={groupFormData.maxSelection}
                    onChange={(e) =>
                      setGroupFormData({ ...groupFormData, maxSelection: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeGroupModal}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createGroupMutation.isPending || updateGroupMutation.isPending}
                  className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-semibold hover:bg-orange-700 disabled:opacity-50"
                >
                  {createGroupMutation.isPending || updateGroupMutation.isPending
                    ? 'Đang lưu...'
                    : editingGroup
                    ? 'Lưu thay đổi'
                    : 'Tạo nhóm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Create / Edit Option Item */}
      {isOptionModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingOption ? 'Chỉnh sửa Món Topping' : 'Thêm Món Topping mới'}
              </h3>
              <button onClick={closeOptionModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleOptionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tên món topping <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={optionFormData.name}
                  onChange={(e) => setOptionFormData({ ...optionFormData, name: e.target.value })}
                  placeholder="VD: Thêm Pate, Trứng ốp la, Không cay..."
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Giá phụ thu (VNĐ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={optionFormData.priceModifier}
                  onChange={(e) =>
                    setOptionFormData({ ...optionFormData, priceModifier: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  required
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Nhập 0 nếu đây là tùy chọn miễn phí (ví dụ: Không cay, Ít đường)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={optionFormData.isAvailable}
                  onChange={(e) => setOptionFormData({ ...optionFormData, isAvailable: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="isAvailable" className="text-xs font-medium text-gray-700 cursor-pointer">
                  Món này đang có sẵn (Còn hàng)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeOptionModal}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createOptionMutation.isPending || updateOptionMutation.isPending}
                  className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-semibold hover:bg-orange-700 disabled:opacity-50"
                >
                  {createOptionMutation.isPending || updateOptionMutation.isPending
                    ? 'Đang lưu...'
                    : editingOption
                    ? 'Lưu thay đổi'
                    : 'Thêm món'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
