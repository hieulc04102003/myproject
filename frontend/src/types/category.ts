export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
  createdAt: string;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}
