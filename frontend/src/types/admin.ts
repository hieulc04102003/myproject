// Admin types
export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
}

export interface ProductFormData {
  name: string;
  categoryId: string;
  slug: string;
  description?: string;
  basePrice: number;
  isAvailable?: boolean | null;
  isFeatured?: boolean | null;
  stockQuantity?: number;
  optionGroupIds?: string[];
}

export interface OrderStats {
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
}

// Category type for admin
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}
