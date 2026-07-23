import { API_BASE_URL } from "./apiConfig";

/**
 * Service to handle OTP delivery via the backend API.
 */

const safeJsonResponse = async (response: Response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Server error (${response.status}): ${text.trim().slice(0, 120) || response.statusText}`
    );
  }
};

let devFallbackOtps: Record<string, string> = {};

export const sendOtpToUser = async (
  email: string,
  mobile: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, mobile }),
    });

    const data = await safeJsonResponse(response);

    if (!response.ok) {
      throw new Error(data.error || `Failed to send OTP (${response.status})`);
    }
    return true;
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    // If backend connection fails (e.g. server not running or network issue)
    const isNetworkError =
      error.message?.includes("fetch failed") ||
      error.message?.includes("ConnectException") ||
      error.message?.includes("Network request failed") ||
      error instanceof TypeError;

    if (isNetworkError) {
      if (__DEV__) {
        console.warn(`[DEV FALLBACK] Backend server at ${API_BASE_URL} unreachable. Dev mode fallback active (OTP: 123456).`);
        if (email) devFallbackOtps[email.toLowerCase()] = "123456";
        if (mobile) devFallbackOtps[mobile] = "123456";
        return true;
      }
      throw new Error(`Unable to connect to backend server at ${API_BASE_URL}. Please ensure the server is running ('npm run server').`);
    }
    throw error;
  }
};

export const verifyOtpOnServer = async (
  contact: string,
  otp: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact, otp }),
    });

    const data = await safeJsonResponse(response);
    if (!response.ok) {
      return { success: false, error: data.error || `Verification failed (${response.status})` };
    }
    return data;
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    const normalized = contact.toLowerCase();
    if (__DEV__ && (devFallbackOtps[normalized] === otp || otp === "123456")) {
      console.warn(`[DEV FALLBACK] Verifying OTP offline in dev mode.`);
      return { success: true };
    }
    return { success: false, error: error.message || "Network error during verification." };
  }
};

export const resendOtpOnServer = async (
  email: string,
  mobile: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, mobile }),
    });

    const data = await safeJsonResponse(response);
    if (!response.ok) {
      return { success: false, error: data.error || `Resend failed (${response.status})` };
    }
    return data;
  } catch (error: any) {
    console.error("Error resending OTP:", error);
    return { success: false, error: error.message || "Network error during resend." };
  }
};
