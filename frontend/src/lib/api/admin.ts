import { apiClient } from '../api-client';
import type { Product } from '@/types/product';
import type { User } from '@/types/user';
import type { ProductFormData } from '@/types/admin';
import type { Category, CategoryFormData } from '@/types/category';

// Coupons API
export interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  discountType: string; // 'percent' | 'fixed'
  discountValue: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  usedCount?: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface CouponFormData {
  code: string;
  description?: string | null;
  discountType: string;
  discountValue: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export const adminCouponsApi = {
  getAll: async (params?: {
    search?: string;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<PagedResult<Coupon>> => {
    return await apiClient.get('/coupons', { params });
  },

  getById: async (id: string): Promise<Coupon> => {
    return await apiClient.get(`/coupons/${id}`);
  },

  create: async (data: CouponFormData): Promise<Coupon> => {
    return await apiClient.post('/coupons', data);
  },

  update: async (id: string, data: CouponFormData): Promise<Coupon> => {
    return await apiClient.put(`/coupons/${id}`, { id, ...data });
  },

  toggleStatus: async (id: string): Promise<Coupon> => {
    return await apiClient.patch(`/coupons/${id}/toggle`);
  },

  delete: async (id: string): Promise<void> => {
    return await apiClient.delete(`/coupons/${id}`);
  },
};

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// Products API
export const adminProductsApi = {
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDir?: string;
    q?: string;
    isAvailable?: boolean;
  }): Promise<PagedResult<Product>> => {
    return await apiClient.get('/products/search', { params });
  },

  getById: async (id: string): Promise<Product> => {
    return await apiClient.get(`/products/${id}`);
  },

  create: async (data: ProductFormData): Promise<Product> => {
    return await apiClient.post('/products', data);
  },

  update: async (id: string, data: ProductFormData): Promise<Product> => {
    return await apiClient.put(`/products/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return await apiClient.delete(`/products/${id}`);
  },

  uploadImage: async (id: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    return await apiClient.post(`/products/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Users API
export interface UserAddress {
  id: string;
  userId: string;
  recipientName: string;
  phoneNumber: string;
  streetAddress: string;
  ward?: string;
  district?: string;
  city: string;
  isDefault: boolean;
  fullAddress: string;
  createdAt: string;
}

export const adminUsersApi = {
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    role?: string;
    search?: string;
    isActive?: boolean;
  }): Promise<PagedResult<User>> => {
    return await apiClient.get('/admin/users', { params });
  },

  getById: async (id: string): Promise<User> => {
    return await apiClient.get(`/admin/users/${id}`);
  },

  getAddresses: async (userId: string): Promise<UserAddress[]> => {
    return await apiClient.get(`/admin/users/${userId}/addresses`);
  },
};

// Orders API
export interface Order {
  id: string;
  orderCode: string;
  userId: string;
  customerName: string;
  customerPhone?: string;
  shippingAddress: string;
  note?: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  itemTotalPrice: number;
  options?: OrderItemOption[];
}

export interface OrderItemOption {
  optionId: string;
  optionName: string;
  additionalPrice: number;
}

export const adminOrdersApi = {
  getAll: async (params?: {
    userId?: string;
    page?: number;
    pageSize?: number;
    status?: string;
    from?: string;
    to?: string;
    orderCode?: string;
  }): Promise<PagedResult<Order>> => {
    return await apiClient.get('/orders', { params });
  },

  getById: async (id: string): Promise<Order> => {
    return await apiClient.get(`/orders/${id}`);
  },

  updateStatus: async (id: string, status: string): Promise<Order> => {
    return await apiClient.patch(`/orders/${id}/status`, { status });
  },
};

// Categories API
export const adminCategoriesApi = {
  getAll: async (): Promise<Category[]> => {
    return await apiClient.get('/categories');
  },

  getById: async (id: string): Promise<Category> => {
    return await apiClient.get(`/categories/${id}`);
  },

  create: async (data: CategoryFormData): Promise<Category> => {
    return await apiClient.post('/categories', data);
  },

  update: async (id: string, data: CategoryFormData): Promise<Category> => {
    return await apiClient.put(`/categories/${id}`, { id, ...data });
  },

  delete: async (id: string): Promise<void> => {
    return await apiClient.delete(`/categories/${id}`);
  },
};

// Options / Toppings API
export interface OptionItem {
  id: string;
  name: string;
  priceModifier: number;
  isAvailable: boolean;
}

export interface OptionGroup {
  id: string;
  name: string;
  selectionType: string;
  isRequired: boolean;
  minSelection: number;
  maxSelection: number;
  options: OptionItem[];
}

export const adminOptionsApi = {
  getAllGroups: async (): Promise<OptionGroup[]> => {
    return await apiClient.get('/options/groups');
  },

  getGroupById: async (id: string): Promise<OptionGroup> => {
    return await apiClient.get(`/options/groups/${id}`);
  },

  createGroup: async (data: {
    name: string;
    selectionType: string;
    isRequired?: boolean;
    minSelection?: number;
    maxSelection?: number;
  }): Promise<OptionGroup> => {
    return await apiClient.post('/options/groups', data);
  },

  updateGroup: async (
    id: string,
    data: {
      name: string;
      selectionType: string;
      isRequired?: boolean;
      minSelection?: number;
      maxSelection?: number;
    }
  ): Promise<OptionGroup> => {
    return await apiClient.put(`/options/groups/${id}`, { id, ...data });
  },

  deleteGroup: async (id: string): Promise<void> => {
    return await apiClient.delete(`/options/groups/${id}`);
  },

  createOption: async (
    groupId: string,
    data: {
      name: string;
      priceModifier: number;
      isAvailable?: boolean;
      displayOrder?: number;
    }
  ): Promise<OptionItem> => {
    return await apiClient.post(`/options/groups/${groupId}/items`, { optionGroupId: groupId, ...data });
  },

  updateOption: async (
    id: string,
    data: {
      name: string;
      priceModifier: number;
      isAvailable?: boolean;
      displayOrder?: number;
    }
  ): Promise<OptionItem> => {
    return await apiClient.put(`/options/items/${id}`, { id, ...data });
  },

  deleteOption: async (id: string): Promise<void> => {
    return await apiClient.delete(`/options/items/${id}`);
  },

  toggleAvailability: async (id: string): Promise<OptionItem> => {
    return await apiClient.patch(`/options/items/${id}/toggle`);
  },
};

