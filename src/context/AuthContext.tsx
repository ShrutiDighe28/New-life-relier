import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendOtpToUser, verifyOtpOnServer } from '../services/otpDeliveryService';

export interface AuthUser {
  id?: number | string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  mobile: string;
  password?: string;
  userName?: string;
  token?: string;
  userType?: string;
  roleId?: number;
  roleName?: string;
  branchId?: number;
  companyId?: number;
  companyName?: string;
  printName?: string;
  alias?: string;
  address1?: string;
  address2?: string;
  address3?: string;
  countryId?: number;
  stateId?: number;
  cityId?: number;
  districtId?: number;
  zipCode?: string;
  phoneNo?: string;
  companyMobileNo?: string;
  fax?: string;
  website?: string;
  cinNo?: string;
  panNo?: string;
  gstin?: string;
  timeZoneId?: number;
  zoneName?: string;
  ianaId?: string;
  isSuperAdmin?: boolean;
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
  rawApiData?: Record<string, any>;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  register: (user: AuthUser) => Promise<void>;
  login: (userName: string, password: string) => Promise<boolean>;
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

  // Seed test doctor account automatically in dev mode
  useEffect(() => {
    if (__DEV__) {
      (async () => {
        try {
          const stored = await AsyncStorage.getItem(USERS_KEY);
          const users = stored ? JSON.parse(stored) : [];
          const hasTestDoctor = users.some((u: any) => u.email === "doctor@test.com");
          if (!hasTestDoctor) {
            users.push({
              id: "dev-doc-id-1",
              fullName: "Dr. Sarah Jenkins",
              firstName: "Sarah",
              lastName: "Jenkins",
              email: "doctor@test.com",
              mobile: "9876543210",
              userName: "doctor@test.com",
              password: "Password123!",
              role: "doctor",
              userType: "doctor",
              isVerified: true,
              rawApiData: {
                specialization: "Cardiologist",
                hospitalName: "LifeRelier Super Speciality Hospital",
              }
            });
            await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
            console.log("[DEV SEED] Seeded test doctor: doctor@test.com / Password123!");
          }
        } catch (e) {
          console.error("[DEV SEED] Failed to seed test doctor:", e);
        }
      })();
    }
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

  const login = async (userNameInput: string, passwordInput: string) => {
    const trimmedUser = userNameInput.trim();
    
    // Dev bypass for local testing of doctor portal
    if (trimmedUser.toLowerCase() === 'doctor@test.com' && passwordInput === 'Password123!') {
      const loggedUser: AuthUser = {
        id: "dev-doc-id-1",
        fullName: "Dr. Sarah Jenkins",
        firstName: "Sarah",
        lastName: "Jenkins",
        email: "doctor@test.com",
        mobile: "9876543210",
        userName: "doctor@test.com",
        token: "mock-token-doctor",
        userType: "doctor",
        roleId: 2,
        roleName: "doctor",
        isVerified: true,
        rawApiData: {
          specialization: "Cardiologist",
          hospitalName: "LifeRelier Super Speciality Hospital",
        }
      };
      setUser(loggedUser);
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(loggedUser));
      return true;
    }

    try {
      const response = await fetch('https://dn8labapi.liferelier.in/api/ManageUser/Login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          UserName: trimmedUser,
          Password: passwordInput,
        }),
      });

      const resText = await response.text();
      let resData: any = {};
      try {
        resData = JSON.parse(resText);
      } catch (err) {
        console.log('Login API response JSON parse error:', err);
      }

      if (response.ok && resData) {
        const apiUser = resData.Data || resData.data || resData;
        const userId = apiUser.userId || apiUser.Id || apiUser.id;
        const firstName = apiUser.firstName || apiUser.FirstName || '';
        const lastName = apiUser.lastName || apiUser.LastName || '';
        const fullName = `${firstName} ${lastName}`.trim() || apiUser.userName || apiUser.UserName || trimmedUser;
        const email = apiUser.email || apiUser.Email || `${trimmedUser}@liferelier.com`;
        const mobile = apiUser.mobile || apiUser.Mobile || '';
        const userName = apiUser.userName || apiUser.UserName || trimmedUser;
        const token = apiUser.token || apiUser.Token || '';
        const userType = apiUser.userType || apiUser.UserType || '';
        const roleId = apiUser.roleId || apiUser.RoleId;
        const roleName = apiUser.roleName || apiUser.RoleName || '';
        const branchId = apiUser.branchId || apiUser.BranchId;
        const companyId = apiUser.companyId || apiUser.CompanyId;
        const companyName = apiUser.companyName || apiUser.CompanyName;
        const printName = apiUser.printName || apiUser.PrintName;
        const alias = apiUser.alias || apiUser.Alias;
        const address1 = apiUser.address1 || apiUser.Address1 || '';
        const address2 = apiUser.address2 || apiUser.Address2 || '';
        const address3 = apiUser.address3 || apiUser.Address3 || '';
        const countryId = apiUser.countryId || apiUser.CountryId;
        const stateId = apiUser.stateId || apiUser.StateId;
        const cityId = apiUser.cityId || apiUser.CityId;
        const districtId = apiUser.districtId || apiUser.DistrictId;
        const zipCode = apiUser.zipCode || apiUser.ZipCode || '';
        const phoneNo = apiUser.phoneNo || apiUser.PhoneNo || '';
        const companyMobileNo = apiUser.companyMobileNo || apiUser.CompanyMobileNo || '';
        const fax = apiUser.fax || apiUser.Fax || '';
        const website = apiUser.website || apiUser.Website || '';
        const cinNo = apiUser.cinNo || apiUser.CinNo || '';
        const panNo = apiUser.panNo || apiUser.PanNo || '';
        const gstin = apiUser.gstin || apiUser.Gstin || '';
        const timeZoneId = apiUser.timeZoneId || apiUser.TimeZoneId;
        const zoneName = apiUser.zoneName || apiUser.ZoneName;
        const ianaId = apiUser.ianaId || apiUser.IanaId;
        const isSuperAdmin = apiUser.isSuperAdmin !== undefined ? apiUser.isSuperAdmin : apiUser.IsSuperAdmin;

        const loggedUser: AuthUser = {
          id: userId,
          fullName,
          firstName,
          lastName,
          email,
          mobile,
          userName,
          token,
          userType,
          roleId,
          roleName,
          branchId,
          companyId,
          companyName,
          printName,
          alias,
          address1,
          address2,
          address3,
          countryId,
          stateId,
          cityId,
          districtId,
          zipCode,
          phoneNo,
          companyMobileNo,
          fax,
          website,
          cinNo,
          panNo,
          gstin,
          timeZoneId,
          zoneName,
          ianaId,
          isSuperAdmin,
          isVerified: true,
          rawApiData: apiUser,
        };
        setUser(loggedUser);
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(loggedUser));
        return true;
      } else {
        const errorMsg = resData?.message || resData?.Message || resData?.error || resData?.Error || 'Invalid username or password';
        // Fallback to local storage if user was created offline
        const stored = await AsyncStorage.getItem(USERS_KEY);
        const users: AuthUser[] = stored ? JSON.parse(stored) : [];
        const match = users.find(
          (u) =>
            ((u.userName && u.userName.toLowerCase() === trimmedUser.toLowerCase()) ||
              u.email.toLowerCase() === trimmedUser.toLowerCase() ||
              u.mobile === trimmedUser) &&
            u.password === passwordInput
        );
        if (match) {
          setUser(match);
          await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(match));
          return true;
        }
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      // Local fallback in case of network issue
      const stored = await AsyncStorage.getItem(USERS_KEY);
      const users: AuthUser[] = stored ? JSON.parse(stored) : [];
      const match = users.find(
        (u) =>
          ((u.userName && u.userName.toLowerCase() === trimmedUser.toLowerCase()) ||
            u.email.toLowerCase() === trimmedUser.toLowerCase() ||
            u.mobile === trimmedUser) &&
          u.password === passwordInput
      );
      if (match) {
        setUser(match);
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(match));
        return true;
      }
      throw error;
    }
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

    try {
      // Delivery OTP to registered email & phone securely via backend API
      const emailToUse = userObj?.email || contact;
      const mobileToUse = userObj?.mobile || contact;
      await sendOtpToUser(emailToUse, mobileToUse);
      setPendingUser(userObj);
    } catch (err) {
      // Network or server error
      const message = err instanceof Error ? err.message : 'Failed to send OTP. Please check your connection.';
      throw new Error(message);
    }
  };

  const verifyOtp = async (contact: string, code: string) => {
    const result = await verifyOtpOnServer(contact, code);
    
    if (result.success && pendingUser) {
      // Mark the account as verified before persisting
      const verifiedUser: AuthUser = { ...pendingUser, isVerified: true };
      await persistUser(verifiedUser);
      
      // Log the user in automatically after successful registration
      setUser(verifiedUser);
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(verifiedUser));
      setPendingUser(null);
    }
    return result.success;
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
