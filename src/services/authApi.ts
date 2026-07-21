import { post, get } from './apiClient';
import { AuthUser } from '../context/AuthContext';

export interface AuthResponse {
  message?: string;
  token?: string;
  user?: AuthUser;
}

export const authApi = {
  register: async (userData: AuthUser): Promise<AuthResponse> => {
    return post<AuthResponse>('/auth/register', userData, { requireAuth: false });
  },

  login: async (emailOrMobile: string, password: string): Promise<AuthResponse> => {
    return post<AuthResponse>('/auth/login', { emailOrMobile, password }, { requireAuth: false });
  },

  sendOtp: async (contact: string): Promise<AuthResponse> => {
    return post<AuthResponse>('/auth/send-otp', { contact }, { requireAuth: false });
  },

  verifyOtp: async (contact: string, otp: string): Promise<AuthResponse> => {
    return post<AuthResponse>('/auth/verify-otp', { contact, otp }, { requireAuth: false });
  },

  forgotPassword: async (contact: string): Promise<AuthResponse> => {
    return post<AuthResponse>('/auth/forgot-password', { contact }, { requireAuth: false });
  },

  resetPassword: async (contact: string, otp: string, newPassword: string): Promise<AuthResponse> => {
    return post<AuthResponse>('/auth/reset-password', { contact, otp, newPassword }, { requireAuth: false });
  },

  refreshToken: async (): Promise<AuthResponse> => {
    return post<AuthResponse>('/auth/refresh-token');
  },

  logout: async (): Promise<AuthResponse> => {
    return post<AuthResponse>('/auth/logout');
  }
};
