import { API_BASE_URL } from "./apiConfig";

/**
 * Service to handle OTP delivery via the backend API.
 */

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
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send OTP");
    }
    return true;
  } catch (error) {
    console.error("Error sending OTP:", error);
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

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return { success: false, error: "Network error during verification." };
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

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error resending OTP:", error);
        return { success: false, error: "Network error during resend." };
    }
};
