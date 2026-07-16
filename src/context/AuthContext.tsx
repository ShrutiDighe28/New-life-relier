import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateOtp, storeOtp, verifyOtp as verifyStoredOtp, clearOtp } from '../utils/otpHelper';
import { sendOtpToUser } from '../services/otpDeliveryService';

export interface AuthUser {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  isVerified?: boolean;   // true only after OTP verification
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
  requestOtp: (contact: string, user: AuthUser) => Promise<void>;
  verifyOtp: (contact: string, code: string) => Promise<boolean>;
  pendingUser: AuthUser | null;
  clearPending: () => void;
  updateProfile: (profileData: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = '@registered_users';
const CURRENT_USER_KEY = '@current_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingUser, setPendingUser] = useState<AuthUser | null>(null);

  // Load current logged‑in user on mount
  useEffect(() => {
    (async () => {
      try {
        const storedUser = await AsyncStorage.getItem(CURRENT_USER_KEY);
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (_) {}
      setIsLoading(false);
    })();
  }, []);

  const persistUser = async (newUser: AuthUser) => {
    const stored = await AsyncStorage.getItem(USERS_KEY);
    const users: AuthUser[] = stored ? JSON.parse(stored) : [];
    users.push(newUser);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const register = async (newUser: AuthUser) => {
    // Send OTP and store pending user
    await requestOtp(newUser.email, newUser);
  };

  const login = async (emailOrMobile: string, password: string) => {
    const stored = await AsyncStorage.getItem(USERS_KEY);
    const users: AuthUser[] = stored ? JSON.parse(stored) : [];
    const match = users.find(
      (u) =>
        (u.email.toLowerCase() === emailOrMobile.toLowerCase() || u.mobile === emailOrMobile) &&
        u.password === password
    );
    if (match) {
      setUser(match);
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(match));
      return true;
    }
    return false;
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
  };

  const requestOtp = async (contact: string, userObj: AuthUser) => {
    // ── Duplicate account guard ─────────────────────────────────────
    const stored = await AsyncStorage.getItem(USERS_KEY);
    const existingUsers: AuthUser[] = stored ? JSON.parse(stored) : [];
    const duplicate = existingUsers.find(
      (u) =>
        u.email.toLowerCase() === (userObj.email || '').toLowerCase() ||
        u.mobile === (userObj.mobile || '')
    );
    if (duplicate) {
      throw new Error(
        'An account with this email or mobile number already exists. Please log in instead.'
      );
    }

    const otp = generateOtp();
    if (userObj && userObj.email) {
      await storeOtp(userObj.email.toLowerCase(), otp);
    }
    if (userObj && userObj.mobile) {
      await storeOtp(userObj.mobile, otp);
    }
    if (contact && (!userObj || (contact !== userObj.email && contact !== userObj.mobile))) {
      await storeOtp(contact, otp);
    }
    
    // Delivery OTP to registered email & phone securely
    await sendOtpToUser(
      userObj?.email || contact,
      userObj?.mobile || contact,
      otp
    );
    
    setPendingUser(userObj);
  };

  const verifyOtp = async (contact: string, code: string) => {
    const valid = await verifyStoredOtp(contact, code);
    if (valid && pendingUser) {
      // Mark the account as verified before persisting
      const verifiedUser: AuthUser = { ...pendingUser, isVerified: true };
      await persistUser(verifiedUser);
      if (verifiedUser.email) {
        await clearOtp(verifiedUser.email.toLowerCase());
      }
      if (verifiedUser.mobile) {
        await clearOtp(verifiedUser.mobile);
      }
      // Log the user in automatically after successful registration
      setUser(verifiedUser);
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(verifiedUser));
      setPendingUser(null);
    }
    return valid;
  };

  const clearPending = () => {
    setPendingUser(null);
  };

  const updateProfile = async (profileData: Partial<AuthUser>) => {
    // If there is no active user session, we can't update anything
    const activeUser = user;
    if (!activeUser) return;

    const updatedUser = { ...activeUser, ...profileData };
    setUser(updatedUser);
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

    // Update inside the users database array
    const stored = await AsyncStorage.getItem(USERS_KEY);
    const users: AuthUser[] = stored ? JSON.parse(stored) : [];
    const index = users.findIndex(
      (u) => u.email.toLowerCase() === activeUser.email.toLowerCase() || u.mobile === activeUser.mobile
    );
    if (index !== -1) {
      users[index] = { ...users[index], ...profileData };
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
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
