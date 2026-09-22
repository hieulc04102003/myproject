/**
 * Product Types - Type-safe definitions cho domain sản phẩm
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export interface OptionGroup {
  id: string;
  name: string;
  selectionType?: string;
  isRequired?: boolean;
  minSelection?: number;
  maxSelection?: number;
  options: Option[];
}

export interface Option {
  id: string;
  name: string;
  priceModifier?: number;
  additionalPrice?: number;
  isAvailable?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  price?: number;               // Giá bán hiển thị (alias linh hoạt cho basePrice)
  imageUrl?: string | null;
  isAvailable?: boolean | null;
  isFeatured?: boolean | null;
  categoryId?: string;
  categoryName?: string;        // flat field từ backend search/homepage response
  description?: string;
  category?: Category;
  optionGroups?: OptionGroup[];
  averageRating?: number;
  totalReviews?: number;
  stockQuantity?: number;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProductFilters {
  categoryId?: string;
  search?: string;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
}
