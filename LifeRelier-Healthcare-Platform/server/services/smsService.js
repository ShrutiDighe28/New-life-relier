const twilio = require('twilio');

let client = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  } catch (error) {
    console.warn('⚠️ Twilio initialization failed:', error.message);
  }
} else {
  console.warn('⚠️ Twilio credentials not configured. SMS will be mocked.');
}

const sendOtpSms = async (mobile, otp) => {
  if (!client || !process.env.TWILIO_PHONE_NUMBER) {
    console.log(`[Mock SMS] To: +91${mobile} | OTP: ${otp}`);
    return;
  }

  try {
    await client.messages.create({
      body: `Your LifeRelier verification code is: ${otp}. Valid for 5 minutes. Do not share.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${mobile}` // Assuming Indian numbers for now
    });
    console.log(`SMS OTP sent to +91${mobile}`);
  } catch (error) {
    console.error('Error sending SMS OTP:', error);
    throw error;
  }
};

module.exports = {
  sendOtpSms,
};
