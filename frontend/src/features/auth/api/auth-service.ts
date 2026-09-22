/**
 * Auth Service - Gọi API đăng nhập / đăng ký / xác thực OTP
 */

import { apiClient } from '@/lib/api-client';

export interface AuthResponse {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  token: string;
  refreshToken: string;
}

export interface LoginPayload {
  phoneNumber: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  phoneNumber: string;
  password: string;
  email?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  phoneNumber: string;
  retryAfterSeconds: number;
}

export interface VerifyOtpPayload {
  phoneNumber: string;
  otpCode: string;
}

export interface ResendOtpResponse {
  success: boolean;
  message: string;
  retryAfterSeconds: number;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', payload);
  },

  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    return apiClient.post<RegisterResponse>('/auth/register', payload);
  },

  async verifyOtp(payload: VerifyOtpPayload): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/verify-otp', payload);
  },

  async resendOtp(phoneNumber: string): Promise<ResendOtpResponse> {
    return apiClient.post<ResendOtpResponse>('/auth/resend-otp', { phoneNumber });
  },
};

/** Lưu token + cập nhật auth store sau khi đăng nhập/xác thực OTP thành công */
export function persistAuth(res: AuthResponse) {
  if (typeof window === 'undefined') return;

  localStorage.setItem('accessToken', res.token);
  localStorage.setItem('refreshToken', res.refreshToken);

  // Return user object for auth store
  const phone = (res as { phoneNumber?: string }).phoneNumber || 
    (/^[0-9+]{9,15}$/.test(res.email?.trim() || '') ? res.email.trim() : '');

  return {
    id: res.userId,
    fullName: res.fullName,
    email: res.email,
    phoneNumber: phone,
    role: res.role,
  };
}
