/**
 * User & Auth Types
 */

export interface User {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber: string;
  role: string; // 'Admin' | 'Customer'
  isActive: boolean;
  isPhoneVerified?: boolean;
  avatarUrl?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user?: User;
}
