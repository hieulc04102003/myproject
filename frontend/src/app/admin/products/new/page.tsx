'use client';

import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';
import { adminProductsApi, adminCategoriesApi, adminOptionsApi } from '@/lib/api/admin';
import { formatCurrency } from '@/lib/utils';
import type { ProductFormData } from '@/types/admin';

export default function NewProductPage() {
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

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => adminCategoriesApi.getAll(),
  });

  // Fetch option groups (toppings)
  const { data: optionGroups = [], isLoading: optionGroupsLoading } = useQuery({
    queryKey: ['admin', 'option-groups'],
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

  // Auto-generate slug from name
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
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      router.push('/admin/products');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number'
        ? (name === 'stockQuantity' ? parseInt(value, 10) || 0 : parseFloat(value))
        : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="rounded-lg p-2 hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Product</h1>
          <p className="text-gray-600">Add a new product to your catalog</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-lg border bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleNameChange}
                    required
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Slug *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    URL-friendly version (e.g., banh-mi-thit)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Base Price *
                  </label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Số lượng tồn kho *
                  </label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity ?? 0}
                    onChange={handleChange}
                    required
                    min="0"
                    step="1"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category *
                  </label>                  {categoriesLoading ? (
                    <p className="mt-1 text-sm text-gray-500">Loading categories...</p>
                  ) : (
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                      required
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Chọn danh mục</option>
                      {categories
                        .filter(cat => cat.isActive)
                        .map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                  )}
                  {categories.length === 0 && !categoriesLoading && (
                    <p className="mt-1 text-sm text-red-500">
                      Chưa có danh mục nào.{' '}
                      <Link href="/admin/categories/new" className="underline">
                        Tạo danh mục mới
                      </Link>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Option Groups (Topping / Tùy chọn) */}
            <div className="rounded-lg border bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Nhóm Topping & Tùy chọn</h2>
                  <p className="text-sm text-gray-500">
                    Chọn các nhóm tùy chọn (Size, Đường, Đá, Topping...) áp dụng riêng cho món ăn này
                  </p>
                </div>
                <Link
                  href="/admin/options"
                  target="_blank"
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 underline"
                >
                  + Quản lý Topping
                </Link>
              </div>

              {optionGroupsLoading ? (
                <p className="text-sm text-gray-500">Đang tải danh sách nhóm topping...</p>
              ) : optionGroups.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center">
                  <p className="text-sm text-gray-500">Chưa có nhóm tùy chọn nào trong hệ thống.</p>
                  <Link
                    href="/admin/options"
                    className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline"
                  >
                    Tạo nhóm topping mới
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {optionGroups.map((group) => {
                    const isChecked = formData.optionGroupIds?.includes(group.id) ?? false;
                    return (
                      <div
                        key={group.id}
                        onClick={() => handleOptionGroupToggle(group.id)}
                        className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                          isChecked
                            ? 'border-blue-500 bg-blue-50/40'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{group.name}</span>
                              <span
                                className={`rounded px-2 py-0.5 text-xs font-medium ${
                                  group.selectionType === 'SINGLE'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-green-100 text-green-700'
                                }`}
                              >
                                {group.selectionType === 'SINGLE' ? 'Chọn 1 (Radio)' : 'Chọn nhiều (Checkbox)'}
                              </span>
                              {group.isRequired && (
                                <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                                  Bắt buộc
                                </span>
                              )}
                            </div>
                            {group.options && group.options.length > 0 ? (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {group.options.map((opt) => (
                                  <span
                                    key={opt.id}
                                    className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700"
                                  >
                                    {opt.name}
                                    {opt.priceModifier > 0 && (
                                      <span className="ml-1 text-orange-600 font-medium">
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="rounded-lg border bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold">Product Image</h2>
              <div className="space-y-4">
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mx-auto h-48 w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="py-8">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">Upload product image</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-gray-600"
                />
              </div>
            </div>

            {/* Settings */}
            <div className="rounded-lg border bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold">Settings</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={formData.isAvailable ?? false}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Available</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured ?? false}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Product'}
              </button>
              <Link
                href="/admin/products"
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
