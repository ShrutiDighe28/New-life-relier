import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { LOGIN_URL, REGISTER_URL, UPDATE_USER_URL } from '../services/apiConfig';
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
  // Doctor-specific profile fields
  specialization?: string;
  medicalCouncilNo?: string;
  experienceYears?: string | number;
  hospitalName?: string;
  consultationFee?: string | number;
  qualification?: string;
  clinicAddress?: string;
  availabilityStatus?: 'online' | 'offline' | 'on_call';
  rating?: number;
  totalConsultations?: number;
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

    try {
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          UserName: trimmedUser,
          Password: passwordInput,
        }),
      });

      const resText = await response.text();
      console.log('[LOGIN] Status:', response.status, '| Body:', resText);

      let resData: any = {};
      try { resData = JSON.parse(resText); } catch (_) {}

      if (response.ok && resData && (resData.userId || resData.userName)) {
        // API returns root-level object — no Data wrapper
        // Real response shape:
        // { userId, firstName, lastName, userName, mobile,
        //   roleId, roleName, branchId, companyName, isSuperAdmin, permissions }
        const firstName   = resData.firstName   || resData.FirstName   || '';
        const lastName    = resData.lastName    || resData.LastName    || '';
        const fullName    = `${firstName} ${lastName}`.trim() || resData.userName || trimmedUser;
        const email       = resData.email       || resData.Email       || `${trimmedUser}@liferelier.com`;
        const mobile      = resData.mobile      || resData.Mobile      || '';
        const token       = resData.token       || resData.Token       || '';
        const roleId      = resData.roleId      ?? resData.RoleId      ?? 0;
        const roleName    = resData.roleName    || resData.RoleName    || '';
        const branchId    = resData.branchId    ?? resData.BranchId;
        const companyId   = resData.companyId   ?? resData.CompanyId;
        const companyName = resData.companyName || resData.CompanyName || '';
        const isSuperAdmin = resData.isSuperAdmin ?? resData.IsSuperAdmin ?? false;

        // Determine userType from roleId / roleName returned by API
        let userType = resData.userType || resData.UserType || '';
        if (!userType) {
          if (roleId === 2 || roleName.toLowerCase().includes('doctor'))        userType = 'doctor';
          else if (roleId === 3 || roleName.toLowerCase().includes('admin'))    userType = 'admin';
          else if (isSuperAdmin)                                                 userType = 'admin';
          else                                                                   userType = 'patient';
        }

        const loggedUser: AuthUser = {
          id:           resData.userId || resData.Id || resData.id,
          fullName,
          firstName,
          lastName,
          email,
          mobile,
          userName:     resData.userName    || resData.UserName    || trimmedUser,
          token,
          userType,
          roleId,
          roleName,
          branchId,
          companyId,
          companyName,
          printName:    resData.printName   || resData.PrintName   || '',
          alias:        resData.alias       || resData.Alias       || '',
          address1:     resData.address1    || resData.Address1    || '',
          address2:     resData.address2    || resData.Address2    || '',
          address3:     resData.address3    || resData.Address3    || '',
          countryId:    resData.countryId   ?? resData.CountryId,
          stateId:      resData.stateId     ?? resData.StateId,
          cityId:       resData.cityId      ?? resData.CityId,
          zipCode:      resData.zipCode     || resData.ZipCode     || '',
          phoneNo:      resData.phoneNo     || resData.PhoneNo     || '',
          companyMobileNo: resData.companyMobileNo || resData.CompanyMobileNo || '',
          fax:          resData.fax         || resData.Fax         || '',
          website:      resData.website     || resData.Website     || '',
          cinNo:        resData.cinNo       || resData.CinNo       || '',
          panNo:        resData.panNo       || resData.PanNo       || '',
          gstin:        resData.gstin       || resData.Gstin       || '',
          timeZoneId:   resData.timeZoneId  ?? resData.TimeZoneId,
          zoneName:     resData.zoneName    || resData.ZoneName    || '',
          ianaId:       resData.ianaId      || resData.IanaId      || '',
          isSuperAdmin,
          isVerified:   true,
          rawApiData:   resData,
        };

        setUser(loggedUser);
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(loggedUser));
        console.log('[LOGIN] Success — userType:', userType, '| user:', fullName);
        return true;

      } else {
        // API returned non-200 or empty/error body
        const errMsg = resData?.message || resData?.Message
          || resData?.error   || resData?.Error
          || resData?.title   || resData?.Title
          || 'Invalid username or password.';
        console.log('[LOGIN] API rejected:', errMsg);

        throw new Error(errMsg);
      }

    } catch (error: any) {
      console.log('[LOGIN] Error:', error?.message);
      
      // If it's a TypeError or network-related error from fetch
      if (error?.message?.toLowerCase().includes('network request failed') || error?.message?.toLowerCase().includes('failed to fetch')) {
        throw new Error("Unable to connect to the server. Please try again later.");
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
      // ── POST to ManageUser/Register API ─────────────────────────
      const nameParts  = (userObj.fullName || '').trim().split(' ');
      const firstName  = userObj.firstName  || nameParts[0]  || '';
      const lastName   = userObj.lastName   || nameParts.slice(1).join(' ') || '';

      const registerPayload = {
        FirstName: firstName,
        LastName:  lastName,
        UserName:  userObj.userName || userObj.email,
        Password:  userObj.password || '',
        Mobile:    userObj.mobile   || '',
        RoleId:    userObj.roleId   ?? 1,
        BranchId:  userObj.branchId ?? 1,
        CompanyId: userObj.companyId ?? 1,
        IsActive:  1,
      };

      console.log('[REGISTER] Sending payload →', registerPayload);

      const regResponse = await fetch(REGISTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(registerPayload),
      });

      const regText = await regResponse.text();
      let regData: any = {};
      try { regData = JSON.parse(regText); } catch (_) {}

      console.log('[REGISTER] API response →', regData);

      if (!regResponse.ok) {
        const errMsg = regData?.message || regData?.Message || regData?.error || regData?.Error
          || 'Registration failed. Please try again.';
        throw new Error(errMsg);
      }

      // ── Send OTP for email/mobile verification ───────────────────
      const emailToUse  = userObj?.email  || contact;
      const mobileToUse = userObj?.mobile || contact;
      await sendOtpToUser(emailToUse, mobileToUse);
      setPendingUser(userObj);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to register. Please check your connection.';
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

    // Merge locally first so UI updates immediately
    const updatedUser = { ...activeUser, ...profileData };
    setUser(updatedUser);
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

    // ── PATCH to ManageUser/UpdateUser API ───────────────────────────────
    try {
      const nameParts = (updatedUser.fullName || '').trim().split(' ');

      const payload = {
        UserId:    Number(updatedUser.id)  || 0,
        FirstName: updatedUser.firstName   || nameParts[0]                 || '',
        LastName:  updatedUser.lastName    || nameParts.slice(1).join(' ') || '',
        UserName:  activeUser.userName     || activeUser.email             || '',  // never change username
        Mobile:    updatedUser.mobile      || '',
        RoleId:    updatedUser.roleId      ?? 1,
        BranchId:  updatedUser.branchId    ?? 1,
        CompanyId: updatedUser.companyId   ?? 1,
        IsActive:  1,
      };

      console.log('[UPDATE_USER] PATCH →', payload);

      const res = await fetch(UPDATE_USER_URL, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch (_) {}

      console.log('[UPDATE_USER] Response →', res.status, data);

      if (!res.ok) {
        const err = data?.message || data?.Message || data?.error || 'Update failed on server.';
        console.warn('[UPDATE_USER] Server error:', err);
      }
    } catch (err) {
      console.warn('[UPDATE_USER] Network error:', err);
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
