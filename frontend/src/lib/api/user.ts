import { apiClient } from '../api-client';
import { useAuthStore } from '@/store/auth-store';

export interface UserProfile {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isPhoneVerified: boolean;
}

export interface UpdateProfileData {
  fullName: string;
  email?: string;
  phoneNumber?: string;
}

export const userProfileApi = {
  getProfile: async (): Promise<UserProfile> => {
    try {
      return await apiClient.get<UserProfile>('/users/profile');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        console.warn('[userProfileApi] Backend endpoint /users/profile chưa khả dụng (404). Lấy thông tin từ Auth store.');
        const authUser = useAuthStore.getState().user;
        if (authUser) {
          return {
            id: authUser.id,
            fullName: authUser.fullName,
            email: authUser.email,
            phoneNumber: authUser.phoneNumber || '',
            role: authUser.role,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isPhoneVerified: true,
          };
        }
      }
      throw err;
    }
  },

  updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
    try {
      return await apiClient.put<UserProfile>('/users/profile', data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        console.warn('[userProfileApi] Backend endpoint /users/profile chưa khả dụng (404). Cập nhật tạm thời vào Auth store.');
        const authUser = useAuthStore.getState().user;
        const updated: UserProfile = {
          id: authUser?.id || 'local-user',
          fullName: data.fullName,
          email: data.email,
          phoneNumber: data.phoneNumber || authUser?.phoneNumber || '',
          role: authUser?.role || 'CUSTOMER',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPhoneVerified: true,
        };
        if (authUser) {
          useAuthStore.getState().setUser({
            ...authUser,
            fullName: data.fullName,
            email: data.email,
            phoneNumber: data.phoneNumber || authUser.phoneNumber,
          });
        }
        return updated;
      }
      throw err;
    }
  },
};
