const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('⚠️ GMAIL_USER or GMAIL_APP_PASSWORD not configured. Emails will be mocked.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

const transporter = createTransporter();

const sendOtpEmail = async (email, otp) => {
  if (!transporter) {
    console.log(`[Mock Email] To: ${email} | OTP: ${otp}`);
    return;
  }

  const mailOptions = {
    from: `"LifeRelier Healthcare" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Your OTP for LifeRelier Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E2E8F0; border-radius: 10px;">
        <h2 style="color: #2563EB; text-align: center;">LifeRelier Healthcare</h2>
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333;">Your One-Time Password (OTP) for verification is:</p>
        <div style="background-color: #F3F4F6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <strong style="font-size: 28px; letter-spacing: 4px; color: #1F2937;">${otp}</strong>
        </div>
        <p style="font-size: 14px; color: #666;">This OTP is valid for 5 minutes. Do not share it with anyone.</p>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email OTP sent to ${email}`);
  } catch (error) {
    console.error('Error sending email OTP:', error);
    throw error;
  }
};

module.exports = {
  sendOtpEmail,
};
