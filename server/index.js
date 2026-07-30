require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const https = require('https');
const otpStore = require('./store/otpStore');
const emailService = require('./services/emailService');
const smsService = require('./services/smsService');

// Allow self-signed certificates for outbound requests in development.
// Remove this line before deploying to production.
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const app = express();
const PORT = process.env.PORT || 8082;

// Middleware
app.use(cors());
app.use(express.json());

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

const resendLimiter = rateLimit({
  windowMs: 30 * 1000, // 30 seconds
  max: 1, // Limit each IP to 1 request per windowMs
  message: { error: 'Please wait 30 seconds before requesting another OTP.' }
});

app.use('/api/', apiLimiter);

// Helper: Generate random 6-digit OTP
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Routes
app.post('/api/auth/send-otp', async (req, res) => {
  const { email, mobile } = req.body;

  if (!email && !mobile) {
    return res.status(400).json({ error: 'Email or mobile is required.' });
  }

  try {
    const otp = generateOtp();
    
    // Store OTP against both email and mobile if provided
    if (email) otpStore.set(email.toLowerCase(), otp);
    if (mobile) otpStore.set(mobile, otp);

    const emailPromise = email ? emailService.sendOtpEmail(email.toLowerCase(), otp) : Promise.resolve();
    const smsPromise = mobile ? smsService.sendOtpSms(mobile, otp) : Promise.resolve();

    await Promise.all([emailPromise, smsPromise]);

    const isMocked = !process.env.GMAIL_USER && !process.env.TWILIO_ACCOUNT_SID;
    const message = isMocked 
      ? `OTP generated for testing: ${otp}`
      : 'OTP sent successfully.';

    res.json({ success: true, message, otp: isMocked ? otp : undefined });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP.' });
  }
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { contact, otp } = req.body;

  if (!contact || !otp) {
    return res.status(400).json({ error: 'Contact and OTP are required.' });
  }

  const normalizedContact = contact.toLowerCase();
  const result = otpStore.verify(normalizedContact, otp);

  if (result.success) {
    res.json({ success: true, message: 'OTP verified successfully.' });
  } else {
    res.status(400).json({ success: false, error: result.error });
  }
});

app.post('/api/auth/resend-otp', resendLimiter, async (req, res) => {
  const { email, mobile } = req.body;

  if (!email && !mobile) {
    return res.status(400).json({ error: 'Email or mobile is required.' });
  }

  try {
    const otp = generateOtp();
    
    if (email) otpStore.set(email.toLowerCase(), otp);
    if (mobile) otpStore.set(mobile, otp);

    const emailPromise = email ? emailService.sendOtpEmail(email.toLowerCase(), otp) : Promise.resolve();
    const smsPromise = mobile ? smsService.sendOtpSms(mobile, otp) : Promise.resolve();

    await Promise.all([emailPromise, smsPromise]);

    res.json({ success: true, message: 'OTP resent successfully.' });
  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({ error: 'Failed to resend OTP.' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
