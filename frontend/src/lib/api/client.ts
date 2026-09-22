import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

/**
 * API Client Configuration với Axios
 * - Base URL configuration
 * - Request/Response Interceptors
 * - JWT Token handling
 * - Error handling
 */

// Type-safe API Error Response
export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  detail?: string;
}

// Base API URL từ environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Tạo Axios instance với config mặc định
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// ============================================================================
// REQUEST INTERCEPTOR: Tự động attach JWT token vào mỗi request
// ============================================================================
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Lấy token từ localStorage (hoặc cookie trong production)
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('accessToken') 
      : null;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================================
// RESPONSE INTERCEPTOR: Handle errors và refresh token
// ============================================================================
apiClient.interceptors.response.use(
  (response) => {
    // Response thành công, trả về data
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - Token hết hạn
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Gọi refresh token endpoint (implement khi có auth)
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          // TODO: Implement refresh token logic
          // const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          // localStorage.setItem('accessToken', response.data.accessToken);
          // return apiClient(originalRequest);
        }

        // Nếu không có refresh token, redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      } catch (refreshError) {
        // Refresh token thất bại, logout user
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Chuẩn hóa error response
    const apiError: ApiErrorResponse = {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || 'An unexpected error occurred',
      detail: error.response?.data?.detail || error.message,
    };

    return Promise.reject(apiError);
  }
);

export default apiClient;
