import AsyncStorage from '@react-native-async-storage/async-storage';
import { LOGIN_URL } from '@/services/apiConfig';

/**
 * Perform a login against the backend API.
 * The API is expected to return an object containing the user information and a token.
 * Example response shape (adjust as needed):
 *   { id, fullName, email, mobile, userName, token, role }
 */
export const login = async (userName: string, password: string): Promise<boolean> => {
  try {
    const response = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ UserName: userName, Password: password }),
    });
    if (!response.ok) {
      // Invalid credentials or server error
      return false;
    }
    const data = await response.json();
    // Persist user and token for later use
    await AsyncStorage.setItem('@doctor_user', JSON.stringify(data));
    if (data.token) {
      await AsyncStorage.setItem('@doctor_token', data.token);
    }
    return true;
  } catch (e) {
    console.error('Login error:', e);
    return false;
  }
};

/**
 * Request an OTP for the given contact.
 * Replace with real endpoint when available.
 */
export const requestOtp = async (contact: string, user: any): Promise<void> => {
  // Placeholder – implement API call as needed
  return;
};

/**
 * Verify the OTP code.
 * Replace with real endpoint when available.
 */
export const verifyOtp = async (contact: string, code: string): Promise<boolean> => {
  // Placeholder – implement API call as needed
  return true;
};
