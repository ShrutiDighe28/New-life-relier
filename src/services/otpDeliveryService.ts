import { Alert, Platform } from "react-native";

/**
 * Sends an OTP to the user's registered email and mobile number.
 *
 * PRODUCTION: POSTs to a backend API gateway. API keys (Twilio/SendGrid)
 * never live in the client bundle.
 *
 * DEVELOPMENT (__DEV__): A confirmation Alert confirms dispatch — the OTP
 * is NOT shown in any UI element or terminal stdout. Developers can
 * inspect it via console.warn in the Metro/Expo debugger only.
 */
export const sendOtpToUser = async (
  email: string,
  mobile: string,
  otp: string
): Promise<boolean> => {
  if (!__DEV__) {
    // ── PRODUCTION PATH ────────────────────────────────────────────
    try {
      const response = await fetch("https://api.liferelier.com/v1/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mobile, otp }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // ── DEVELOPMENT PATH ───────────────────────────────────────────────
  // OTP is only visible in the Metro/Expo debugger console, never in UI.
  // eslint-disable-next-line no-console
  console.warn(
    `[LifeRelier DEV] OTP dispatched → ${otp} | Email: ${email} | Mobile: ${mobile}`
  );

  const confirmationMessage =
    `OTP sent successfully!\n\n` +
    `📧 Email: ${email}\n` +
    `📱 Mobile: +91 ${mobile}\n\n` +
    `Please check your email inbox or SMS for the 6-digit verification code.\n\n` +
    `(Development mode: see the Metro/Expo console for the code.)`;

  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      window.alert(`LifeRelier — OTP Sent\n\n${confirmationMessage}`);
    }
  } else {
    Alert.alert(
      "OTP Sent",
      confirmationMessage,
      [{ text: "Got it" }],
      { cancelable: true }
    );
  }

  return true;
};

