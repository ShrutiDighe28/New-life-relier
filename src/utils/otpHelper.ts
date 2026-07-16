import AsyncStorage from '@react-native-async-storage/async-storage';

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 3;

export const generateOtp = (): string => {
  // simple 6 digit numeric OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOtp = async (contact: string, otp: string): Promise<void> => {
  const payload = {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    attempts: 0,
  };
  await AsyncStorage.setItem(`@otp_${contact}`, JSON.stringify(payload));
};

export const getStoredOtp = async (contact: string): Promise<{ otp: string; expiresAt: number; attempts: number } | null> => {
  const raw = await AsyncStorage.getItem(`@otp_${contact}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const verifyOtp = async (contact: string, entered: string): Promise<boolean> => {
  const record = await getStoredOtp(contact);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    // expired, clear
    await AsyncStorage.removeItem(`@otp_${contact}`);
    return false;
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    // too many attempts, clear
    await AsyncStorage.removeItem(`@otp_${contact}`);
    return false;
  }
  if (record.otp === entered) {
    await AsyncStorage.removeItem(`@otp_${contact}`);
    return true;
  } else {
    // increment attempts
    const updated = { ...record, attempts: record.attempts + 1 };
    await AsyncStorage.setItem(`@otp_${contact}`, JSON.stringify(updated));
    return false;
  }
};

export const clearOtp = async (contact: string): Promise<void> => {
  await AsyncStorage.removeItem(`@otp_${contact}`);
};

export const resendOtp = async (contact: string): Promise<string> => {
  const newOtp = generateOtp();
  await storeOtp(contact, newOtp);
  // In production, send via email/SMS. Here we just return it for mock.
  console.log(`Resent OTP to ${contact}: ${newOtp}`);
  return newOtp;
};
