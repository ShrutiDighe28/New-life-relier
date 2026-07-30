import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/services/apiConfig';
import { login as doctorLogin, requestOtp as doctorRequestOtp, verifyOtp as doctorVerifyOtp } from '@/services/doctorAuthService';

export interface DoctorUser {
  id?: number | string;
  fullName: string;
  email: string;
  mobile: string;
  userName: string;
  token?: string;
  role: string; // "doctor"
}

interface DoctorAuthContextType {
  doctor: DoctorUser | null;
  isLoading: boolean;
  login: (userName: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  requestOtp: (contact: string, user: DoctorUser) => Promise<void>;
  verifyOtp: (contact: string, code: string) => Promise<boolean>;
  pendingDoctor: DoctorUser | null;
  clearPending: () => void;
}

const DoctorAuthContext = createContext<DoctorAuthContextType | undefined>(undefined);

const DOCTOR_USER_KEY = '@doctor_user';
const DOCTOR_PENDING_KEY = '@doctor_pending';
const DOCTOR_TOKEN_KEY = '@doctor_token';

export const DoctorAuthProvider = ({ children }: { children: ReactNode }) => {
  const [doctor, setDoctor] = useState<DoctorUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingDoctor, setPendingDoctor] = useState<DoctorUser | null>(null);

  // Load persisted doctor on mount
  // Load persisted doctor on mount and verify API connectivity
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(DOCTOR_USER_KEY);
        if (stored) {
          // Quick check that the backend is reachable
          const resp = await fetch(`${API_BASE_URL}`, { method: 'HEAD' });
          if (resp.ok) {
            setDoctor(JSON.parse(stored));
          } else {
            // Backend not reachable – clear stale credentials
            await AsyncStorage.removeItem(DOCTOR_USER_KEY);
            await AsyncStorage.removeItem(DOCTOR_TOKEN_KEY);
          }
        }
      } catch (_) {
        // Network error – clear any stored credentials
        await AsyncStorage.removeItem(DOCTOR_USER_KEY);
        await AsyncStorage.removeItem(DOCTOR_TOKEN_KEY);
      }
      setIsLoading(false);
    })();
  }, []);

  const login = async (userNameInput: string, passwordInput: string): Promise<boolean> => {
    // Re‑use patient login but enforce doctor role
    const success = await doctorLogin(userNameInput, passwordInput);
    if (success) {
      const stored = await AsyncStorage.getItem(DOCTOR_USER_KEY);
      if (stored) {
        const doc = JSON.parse(stored) as DoctorUser;
        if (doc.userName === userNameInput && doc.role === 'doctor') {
          setDoctor(doc);
          await AsyncStorage.setItem(DOCTOR_TOKEN_KEY, doc.token ?? '');
          return true;
        }
      }
    }
    // On failed login, ensure no stale credentials remain
    await AsyncStorage.removeItem(DOCTOR_USER_KEY);
    await AsyncStorage.removeItem(DOCTOR_TOKEN_KEY);
    throw new Error('Invalid doctor credentials');
  };

  const logout = async () => {
    setDoctor(null);
    await AsyncStorage.removeItem(DOCTOR_USER_KEY);
    await AsyncStorage.removeItem(DOCTOR_TOKEN_KEY);
  };

  const requestOtp = async (contact: string, userObj: DoctorUser) => {
    if (__DEV__) {
      setPendingDoctor(userObj);
      await AsyncStorage.setItem(DOCTOR_PENDING_KEY, JSON.stringify(userObj));
      return;
    }
    await doctorRequestOtp(contact, userObj as any);
    setPendingDoctor(userObj);
    await AsyncStorage.setItem(DOCTOR_PENDING_KEY, JSON.stringify(userObj));
  };

  const verifyOtp = async (contact: string, code: string): Promise<boolean> => {
    const result = await doctorVerifyOtp(contact, code);
    if (result && pendingDoctor) {
      const verifiedDoctor = { ...pendingDoctor, token: 'verified-token' };
      setDoctor(verifiedDoctor);
      await AsyncStorage.setItem(DOCTOR_USER_KEY, JSON.stringify(verifiedDoctor));
      await AsyncStorage.setItem(DOCTOR_TOKEN_KEY, verifiedDoctor.token ?? '');
      setPendingDoctor(null);
      await AsyncStorage.removeItem(DOCTOR_PENDING_KEY);
    }
    return !!result;
  };

  const clearPending = async () => {
    setPendingDoctor(null);
    await AsyncStorage.removeItem(DOCTOR_PENDING_KEY);
  };

  return (
    <DoctorAuthContext.Provider
      value={{ doctor, isLoading, login, logout, requestOtp, verifyOtp, pendingDoctor, clearPending }}
    >
      {children}
    </DoctorAuthContext.Provider>
  );
};

export const useDoctorAuth = () => {
  const ctx = useContext(DoctorAuthContext);
  if (!ctx) throw new Error('useDoctorAuth must be used within DoctorAuthProvider');
  return ctx;
};
