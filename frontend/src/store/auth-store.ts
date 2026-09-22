/**
 * Zustand Store - Auth State Management
 * Persist auth state to localStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email?: string;
  fullName: string;
  phoneNumber?: string;
  role: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      login: (user) =>
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () => {
        // Clear tokens from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
        
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      setLoading: (loading) =>
        set({
          isLoading: loading,
        }),
    }),
    {
      name: 'banh-mi-auth',
      skipHydration: true, // Important for SSR
    }
  )
);

// Mock user for demo purposes
export const mockUser: User = {
  id: '1',
  email: 'demo@banhmisaigon.com',
  fullName: 'Nguyễn Văn A',
  role: 'Admin',
  avatar: undefined,
};