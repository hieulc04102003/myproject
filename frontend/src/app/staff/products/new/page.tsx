'use client';

import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';
import { adminProductsApi, adminCategoriesApi, adminOptionsApi } from '@/lib/api/admin';
import { formatCurrency } from '@/lib/utils';
import type { ProductFormData } from '@/types/admin';

export default function StaffNewProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    categoryId: '',
    slug: '',
    description: '',
    basePrice: 0,
    isAvailable: true,
    isFeatured: false,
    stockQuantity: 0,
    optionGroupIds: [],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['staff', 'categories'],
    queryFn: () => adminCategoriesApi.getAll(),
  });

  const { data: optionGroups = [], isLoading: optionGroupsLoading } = useQuery({
    queryKey: ['staff', 'option-groups'],
    queryFn: () => adminOptionsApi.getAllGroups(),
  });

  const handleOptionGroupToggle = (groupId: string) => {
    setFormData((prev) => {
      const current = prev.optionGroupIds || [];
      const updated = current.includes(groupId)
        ? current.filter((id) => id !== groupId)
        : [...current, groupId];
      return { ...prev, optionGroupIds: updated };
    });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''),
    }));
  };

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const product = await adminProductsApi.create(data);
      if (imageFile) {
        await adminProductsApi.uploadImage(product.id, imageFile);
      }
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', 'products'] });
      router.push('/staff/products');
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/staff/products"
          className="rounded-xl border border-gray-200 bg-white p-2.5 hover:bg-gray-50 text-gray-600 shadow-sm transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Thêm sản phẩm mới</h1>
          <p className="text-sm text-gray-500">Tạo mới thông tin sản phẩm và nhập kho</p>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Hình ảnh sản phẩm</label>
            <div className="flex items-center gap-6">
              <div className="relative h-32 w-32 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <Upload size={32} className="text-gray-400" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors inline-block"
                >
                  Chọn ảnh từ máy
                </label>
                <p className="mt-1.5 text-xs text-gray-400">Định dạng JPG, PNG hoặc WEBP (Tối đa 5MB)</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Tên sản phẩm <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={handleNameChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="VD: Bánh mì thịt nướng"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Đường dẫn (Slug) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="banh-mi-thit-nuong"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Danh mục <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Giá bán niêm yết (VNĐ) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="1000"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="35000"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Số lượng trong kho
              </label>
              <input
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="100"
              />
            </div>

            <div className="flex items-center gap-6 pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isAvailable ?? false}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm font-semibold text-gray-700">Đang bán</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured ?? false}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm font-semibold text-gray-700">Sản phẩm nổi bật</span>
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Mô tả sản phẩm</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="Thông tin chi tiết về sản phẩm..."
            />
          </div>

          {/* Option Groups (Topping / Tùy chọn) */}
          <div className="rounded-xl border border-gray-200 bg-gray-50/30 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Nhóm Topping & Tùy chọn</h3>
                <p className="text-xs text-gray-500">
                  Chọn các nhóm tùy chọn (Size, Topping, Độ ngọt, Đá,...) áp dụng riêng cho món này
                </p>
              </div>
              <Link
                href="/staff/options"
                target="_blank"
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 underline"
              >
                + Quản lý Topping
              </Link>
            </div>

            {optionGroupsLoading ? (
              <p className="text-xs text-gray-500">Đang tải danh sách nhóm topping...</p>
            ) : optionGroups.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center">
                <p className="text-xs text-gray-500">Chưa có nhóm tùy chọn nào.</p>
                <Link
                  href="/staff/options"
                  className="mt-1.5 inline-block text-xs font-semibold text-orange-600 hover:underline"
                >
                  Tạo nhóm topping mới
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {optionGroups.map((group) => {
                  const isChecked = formData.optionGroupIds?.includes(group.id) ?? false;
                  return (
                    <div
                      key={group.id}
                      onClick={() => handleOptionGroupToggle(group.id)}
                      className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                        isChecked
                          ? 'border-orange-500 bg-orange-50/50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">{group.name}</span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                group.selectionType === 'SINGLE'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {group.selectionType === 'SINGLE' ? 'Chọn 1' : 'Chọn nhiều'}
                            </span>
                            {group.isRequired && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                                Bắt buộc
                              </span>
                            )}
                          </div>
                          {group.options && group.options.length > 0 ? (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {group.options.map((opt) => (
                                <span
                                  key={opt.id}
                                  className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                                >
                                  {opt.name}
                                  {opt.priceModifier > 0 && (
                                    <span className="ml-1 font-medium text-orange-600">
                                      +{formatCurrency(opt.priceModifier)}
                                    </span>
                                  )}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-1 text-xs text-gray-400 italic">Chưa có mục lựa chọn con nào</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-6">
            <Link
              href="/staff/products"
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {createMutation.isPending ? 'Đang tạo...' : 'Tạo sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
