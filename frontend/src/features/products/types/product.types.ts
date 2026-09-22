/**
 * Product Feature - TypeScript Types
 * Type-safe definitions cho Product domain
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface UpdateProductDto {
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface ProductListResponse {
  isSuccess: boolean;
  value: Product[];
  error: null | {
    code: string;
    message: string;
  };
}

export interface ProductResponse {
  isSuccess: boolean;
  value: Product | null;
  error: null | {
    code: string;
    message: string;
  };
}
