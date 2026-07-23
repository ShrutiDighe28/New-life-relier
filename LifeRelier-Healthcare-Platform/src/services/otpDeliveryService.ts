import { API_BASE_URL } from "./apiConfig";

/**
 * Service to handle OTP delivery via the backend API.
 */

export const sendOtpToUser = async (
  email: string,
  mobile: string
): Promise<boolean> => {
  try {
    // Mocking the OTP send for frontend development
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log(`[Mock] OTP sent to: ${email || mobile}`);
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
        // Mocking the OTP verify for frontend development
        await new Promise((resolve) => setTimeout(resolve, 800));
        console.log(`[Mock] Verified OTP ${otp} for: ${contact}`);
        return { success: true };
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
        // Mocking the OTP resend for frontend development
        await new Promise((resolve) => setTimeout(resolve, 800));
        console.log(`[Mock] Resent OTP to: ${email || mobile}`);
        return { success: true };
    } catch (error) {
        console.error("Error resending OTP:", error);
        return { success: false, error: "Network error during resend." };
    }
};
