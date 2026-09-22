'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Edit,
  Trash2,
  Ticket,
  Check,
  X,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Search,
  BadgePercent,
  Clock,
} from 'lucide-react';
import {
  adminCouponsApi,
  type Coupon,
  type CouponFormData,
} from '@/lib/api/admin';
import { Pagination } from '@/components/ui/pagination';

interface CouponsManagementProps {
  role?: 'admin' | 'staff';
}

const emptyForm: CouponFormData = {
  code: '',
  description: '',
  discountType: 'PERCENTAGE',
  discountValue: 10,
  minOrderAmount: 0,
  maxDiscountAmount: null,
  usageLimit: null,
  startDate: '',
  endDate: '',
  isActive: true,
};

// datetime-local input hiển thị theo giờ LOCAL (không phải UTC)
const toDateInput = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Chuyển chuỗi datetime-local (giờ local) sang ISO UTC để gửi lên server,
// server sẽ lưu đúng thời điểm tuyệt đối.
const fromDateInput = (local?: string) => (local ? new Date(local).toISOString() : '');

const formatVnd = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatDiscount = (coupon: Coupon) =>
  coupon.discountType.toLowerCase().includes('percent')
    ? `${coupon.discountValue}%`
    : formatVnd(coupon.discountValue);

export function CouponsManagement({ role = 'admin' }: CouponsManagementProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CouponFormData>(emptyForm);

  const queryKey = [role, 'coupons'];

  const { data, isLoading } = useQuery({
    queryKey: [...queryKey, searchQuery, statusFilter, page, pageSize],
    queryFn: () =>
      adminCouponsApi.getAll({
        search: searchQuery || undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
        page,
        pageSize,
      }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [...queryKey, searchQuery, statusFilter] });
  };

  const handleError = (err: unknown, fallback: string) => {
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
    alert(msg || fallback);
  };

  const createMutation = useMutation({
    mutationFn: (data: CouponFormData) => adminCouponsApi.create(data),
    onSuccess: () => {
      invalidate();
      closeModal();
    },
    onError: (err: unknown) => handleError(err, 'Tạo mã giảm giá thất bại'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CouponFormData }) => adminCouponsApi.update(id, data),
    onSuccess: () => {
      invalidate();
      closeModal();
    },
    onError: (err: unknown) => handleError(err, 'Cập nhật mã giảm giá thất bại'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminCouponsApi.delete(id),
    onSuccess: invalidate,
    onError: (err: unknown) => handleError(err, 'Không thể xóa mã giảm giá này'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => adminCouponsApi.toggleStatus(id),
    onSuccess: invalidate,
    onError: (err: unknown) => handleError(err, 'Đổi trạng thái thất bại'),
  });

  const openCreateModal = () => {
    setEditingCoupon(null);
    const now = new Date();
    const later = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    setFormData({
      ...emptyForm,
      startDate: toDateInput(now.toISOString()),
      endDate: toDateInput(later.toISOString()),
    });
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description ?? '',
      discountType: coupon.discountType.toLowerCase().includes('percent') ? 'PERCENTAGE' : 'FIXED_AMOUNT',
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount ?? 0,
      maxDiscountAmount: coupon.maxDiscountAmount ?? null,
      usageLimit: coupon.usageLimit ?? null,
      startDate: toDateInput(coupon.startDate),
      endDate: toDateInput(coupon.endDate),
      isActive: coupon.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      alert('Vui lòng nhập mã giảm giá');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      alert('Vui lòng chọn ngày bắt đầu và kết thúc');
      return;
    }
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      alert('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    const payload: CouponFormData = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      startDate: fromDateInput(formData.startDate),
      endDate: fromDateInput(formData.endDate),
      minOrderAmount: formData.minOrderAmount && formData.minOrderAmount > 0 ? formData.minOrderAmount : null,
      maxDiscountAmount:
        formData.maxDiscountAmount && formData.maxDiscountAmount > 0 ? formData.maxDiscountAmount : null,
      usageLimit: formData.usageLimit && formData.usageLimit > 0 ? formData.usageLimit : null,
    };

    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (coupon: Coupon) => {
    if (confirm(`Bạn có chắc muốn xóa mã "${coupon.code}"?`)) {
      deleteMutation.mutate(coupon.id);
    }
  };

  const now = Date.now();
  const coupons = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  const isExpired = (c: Coupon) => new Date(c.endDate).getTime() < now;
  const isUpcoming = (c: Coupon) => new Date(c.startDate).getTime() > now;

  const stats = {
    total: totalCount,
    active: coupons.filter((c) => c.isActive && !isExpired(c)).length,
    expired: coupons.filter((c) => isExpired(c)).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Ticket className="w-7 h-7 text-orange-600" />
            <span>Quản lý Mã giảm giá</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tạo và quản lý các mã khuyến mãi (giảm theo % hoặc số tiền cố định) cho đơn hàng
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus size={18} />
          <span>Thêm mã giảm giá</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng số mã</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
            <Ticket size={22} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Đang hoạt động</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <BadgePercent size={22} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Đã hết hạn</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.expired}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <Clock size={22} />
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo mã hoặc mô tả..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-xs"
          />
        </div>
        <div className="flex gap-2">
          {(
            [
              { key: 'all', label: 'Tất cả' },
              { key: 'active', label: 'Đang chạy' },
              { key: 'inactive', label: 'Đã tắt' },
            ] as const
          ).map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setStatusFilter(f.key);
                setPage(1);
              }}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                statusFilter === f.key
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-200 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Đang tải danh sách mã giảm giá...</p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-200 shadow-xs max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-3">
            <Ticket size={28} />
          </div>
          <h3 className="text-base font-bold text-gray-900">
            {searchQuery ? 'Không tìm thấy mã phù hợp' : 'Chưa có mã giảm giá nào'}
          </h3>
          <p className="text-xs text-gray-500 mt-1 mb-5">
            {searchQuery ? 'Hãy thử tìm kiếm với từ khóa khác.' : 'Tạo mã khuyến mãi đầu tiên để thu hút khách hàng.'}
          </p>
          {!searchQuery && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700"
            >
              <Plus size={16} /> Tạo mã mới
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Mã</th>
                  <th className="text-left px-5 py-3 font-semibold">Giảm giá</th>
                  <th className="text-left px-5 py-3 font-semibold">Điều kiện</th>
                  <th className="text-left px-5 py-3 font-semibold">Thời gian</th>
                  <th className="text-left px-5 py-3 font-semibold">Lượt dùng</th>
                  <th className="text-center px-5 py-3 font-semibold">Trạng thái</th>
                  <th className="text-right px-5 py-3 font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-orange-50/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-gray-900 font-mono tracking-wide">{coupon.code}</div>
                      {coupon.description && (
                        <div className="text-xs text-gray-500 mt-0.5 max-w-[200px] truncate">{coupon.description}</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 font-semibold text-xs">
                        <BadgePercent size={13} />
                        {formatDiscount(coupon)}
                      </span>
                      {coupon.maxDiscountAmount ? (
                        <div className="text-xs text-gray-400 mt-1">Tối đa {formatVnd(coupon.maxDiscountAmount)}</div>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-600">
                      {coupon.minOrderAmount ? `Tối thiểu ${formatVnd(coupon.minOrderAmount)}` : 'Không điều kiện'}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-600">
                      {new Date(coupon.startDate).toLocaleDateString('vi-VN')} →{' '}
                      {new Date(coupon.endDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-600">
                      {coupon.usedCount ?? 0}
                      {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ' (không giới hạn)'}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {isExpired(coupon) ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold">
                          <X size={12} /> Hết hạn
                        </span>
                      ) : isUpcoming(coupon) ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                          <Clock size={12} /> Sắp diễn ra
                        </span>
                      ) : coupon.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
                          <Check size={12} /> Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold">
                          <X size={12} /> Đã tắt
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => toggleMutation.mutate(coupon.id)}
                          title={coupon.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          {coupon.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                        <button
                          onClick={() => openEditModal(coupon)}
                          title="Chỉnh sửa"
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Edit size={17} />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon)}
                          title="Xóa"
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between text-xs text-gray-500">
            <span>
              Hiển thị {coupons.length} / {totalCount} mã
            </span>
            <Pagination
              currentPage={page}
              totalPages={Math.max(1, Math.ceil(totalCount / pageSize))}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Ticket size={20} className="text-orange-600" />
                {editingCoupon ? 'Chỉnh sửa mã giảm giá' : 'Thêm mã giảm giá mới'}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mã giảm giá *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="VD: SALE10"
                    disabled={!!editingCoupon}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Loại giảm giá *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    <option value="PERCENTAGE">Giảm theo %</option>
                    <option value="FIXED_AMOUNT">Giảm số tiền cố định</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    {formData.discountType === 'PERCENTAGE' ? 'Phần trăm giảm (%) *' : 'Số tiền giảm (VND) *'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={formData.discountType === 'PERCENTAGE' ? 100 : undefined}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Giảm tối đa (VND)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.maxDiscountAmount ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, maxDiscountAmount: e.target.value ? Number(e.target.value) : null })
                    }
                    placeholder="Bỏ trống = không giới hạn"
                    disabled={formData.discountType !== 'PERCENTAGE'}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mô tả</label>
                <input
                  type="text"
                  value={formData.description ?? ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="VD: Giảm 10% cho đơn hàng đầu tiên"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Giá trị đơn tối thiểu (VND)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minOrderAmount ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, minOrderAmount: e.target.value ? Number(e.target.value) : null })
                    }
                    placeholder="Bỏ trống = không điều kiện"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Giới hạn lượt dùng</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.usageLimit ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimit: e.target.value ? Number(e.target.value) : null })
                    }
                    placeholder="Bỏ trống = không giới hạn"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ngày bắt đầu *</label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ngày kết thúc *</label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 accent-orange-600"
                />
                <span className="text-sm text-gray-700">Kích hoạt mã ngay</span>
              </label>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-60"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  {editingCoupon ? 'Cập nhật' : 'Tạo mã'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
