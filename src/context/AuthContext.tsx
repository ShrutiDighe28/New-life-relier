import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/authApi';
import { setAuthToken, clearAuthToken } from '../services/apiClient';

export interface AuthUser {
  fullName: string;
  email: string;
  mobile?: string;     // Optional — not always available (e.g. email-only login)
  password?: string;   // Optional — NEVER store raw passwords in AsyncStorage
  isVerified?: boolean;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  allergies?: string;
  medicalHistory?: string;
  age?: string;
  height?: string;
  weight?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  register: (user: AuthUser) => Promise<void>;
  login: (emailOrMobile: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  requestOtp: (contact: string, user?: AuthUser) => Promise<void>;
  verifyOtp: (contact: string, code: string) => Promise<boolean>;
  pendingUser: AuthUser | null;
  clearPending: () => void;
  updateProfile: (profileData: Partial<AuthUser>) => Promise<void>;
  resetUser: AuthUser | null;
  requestPasswordResetOtp: (contact: string) => Promise<void>;
  verifyPasswordResetOtp: (contact: string, code: string) => Promise<boolean>;
  resetPassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = '@current_user';

// Fallback Mock Logic configuration for Prototype mode
const USE_MOCK_API = true;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingUser, setPendingUser] = useState<AuthUser | null>(null);
  const [resetUser, setResetUser] = useState<AuthUser | null>(null);

  // Load current logged‑in user on mount
  useEffect(() => {
    (async () => {
      try {
        const storedUser = await AsyncStorage.getItem(CURRENT_USER_KEY);
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to load user', e);
      }
      setIsLoading(false);
    })();
  }, []);

  const persistActiveUser = async (userData: AuthUser, token?: string) => {
    setUser(userData);
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
    if (token) {
      await setAuthToken(token);
    }
  };

  const register = async (newUser: AuthUser) => {
    try {
      if (!USE_MOCK_API) {
        // In a real flow, you might register first, then send OTP, or send OTP first
        await authApi.register(newUser);
      }
      await requestOtp(newUser.email || newUser.mobile || '', newUser);
    } catch (error) {
      throw error;
    }
  };

  const login = async (emailOrMobile: string, password: string) => {
    try {
      if (USE_MOCK_API) {
        // Fallback for prototype without backend
        const mockUser: AuthUser = { fullName: 'Test User', email: emailOrMobile };
        await persistActiveUser(mockUser, 'mock_token_123');
        return true;
      }

      const response = await authApi.login(emailOrMobile, password);
      if (response.token) {
        await persistActiveUser(response.user || ({ email: emailOrMobile } as AuthUser), response.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      if (!USE_MOCK_API) await authApi.logout();
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
      await clearAuthToken();
    }
  };

  const requestOtp = async (contact: string, userObj?: AuthUser) => {
    try {
      if (!USE_MOCK_API) {
        await authApi.sendOtp(contact);
      }
      if (userObj) setPendingUser(userObj);
    } catch (error) {
      throw error;
    }
  };

  const verifyOtp = async (contact: string, code: string) => {
    try {
      if (USE_MOCK_API) {
        // Mock verification (accepts any code for prototype)
        if (pendingUser) {
          await persistActiveUser({ ...pendingUser, isVerified: true }, 'mock_token_123');
          setPendingUser(null);
        }
        return true;
      }

      const response = await authApi.verifyOtp(contact, code);
      if (response.token) {
        await persistActiveUser(response.user || pendingUser || ({ email: contact } as AuthUser), response.token);
        setPendingUser(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Verify OTP failed', error);
      return false;
    }
  };

  const clearPending = () => {
    setPendingUser(null);
  };

  const updateProfile = async (profileData: Partial<AuthUser>) => {
    const activeUser = user;
    if (!activeUser) return;
    
    // Will implement patientApi call here later
    const updatedUser = { ...activeUser, ...profileData };
    setUser(updatedUser);
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  };

  const requestPasswordResetOtp = async (contact: string) => {
    try {
      if (!USE_MOCK_API) {
        await authApi.forgotPassword(contact);
      }
      setResetUser({ email: contact } as AuthUser);
    } catch (error) {
      throw error;
    }
  };

  const verifyPasswordResetOtp = async (contact: string, code: string) => {
    try {
      if (USE_MOCK_API) return true;
      const response = await authApi.verifyOtp(contact, code);
      return !!response.token;
    } catch (error) {
      return false;
    }
  };

  const resetPassword = async (newPassword: string) => {
    try {
      if (resetUser && !USE_MOCK_API) {
        await authApi.resetPassword(resetUser.email || '', 'mock_code', newPassword);
      }
      setResetUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        register,
        login,
        logout,
        requestOtp,
        verifyOtp,
        pendingUser,
        clearPending,
        updateProfile,
        resetUser,
        requestPasswordResetOtp,
        verifyPasswordResetOtp,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
