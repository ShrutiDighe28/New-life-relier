// Simple in-memory store for OTPs. 
// For a multi-server production environment, use Redis instead.

const otpStore = new Map();
const EXPIRY_SECONDS = parseInt(process.env.OTP_EXPIRY_SECONDS || '300', 10);
const MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '3', 10);

const set = (contact, otp) => {
  const expiresAt = Date.now() + (EXPIRY_SECONDS * 1000);
  otpStore.set(contact, {
    otp,
    expiresAt,
    attempts: 0
  });
};

const verify = (contact, enteredOtp) => {
  const record = otpStore.get(contact);
  
  if (!record) {
    return { success: false, error: 'OTP not found or expired.' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(contact);
    return { success: false, error: 'OTP has expired.' };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(contact);
    return { success: false, error: 'Maximum attempts reached. Please request a new OTP.' };
  }

  if (record.otp === enteredOtp) {
    otpStore.delete(contact);
    return { success: true };
  } else {
    record.attempts += 1;
    return { success: false, error: `Invalid OTP. ${MAX_ATTEMPTS - record.attempts} attempts remaining.` };
  }
};

const clear = (contact) => {
  otpStore.delete(contact);
};

// Periodic cleanup of expired OTPs
setInterval(() => {
  const now = Date.now();
  for (const [contact, record] of otpStore.entries()) {
    if (now > record.expiresAt) {
      otpStore.delete(contact);
    }
  }
}, 60 * 1000); // Run every minute

module.exports = {
  set,
  verify,
  clear
};
