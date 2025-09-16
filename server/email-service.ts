import nodemailer from 'nodemailer';

// Hardcoded Gmail SMTP configuration as requested
const GMAIL_USER = 'services.gohan@gmail.com';
const GMAIL_APP_PASSWORD = 'tjjr ppgw usyg ohrz';

// Create transporter with hardcoded Gmail SMTP settings
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD
  }
});

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP email
export async function sendOTPEmail(to: string, otp: string): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"DEXX-TER Security" <${GMAIL_USER}>`,
      to: to,
      subject: 'DEXX-TER Admin Login - OTP Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">DEXX-TER</h1>
            <p style="color: #e0e6ff; margin: 10px 0 0 0; font-size: 16px;">Professional License Management System</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0; text-align: center;">Admin Login Verification</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              A login attempt was made to your DEXX-TER admin account. Please use the following One-Time Password (OTP) to complete your login:
            </p>
            
            <div style="background: #f8f9ff; border: 2px dashed #667eea; padding: 20px; margin: 25px 0; text-align: center; border-radius: 8px;">
              <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${otp}
              </div>
              <p style="margin: 10px 0 0 0; color: #888; font-size: 14px;">This OTP expires in 1 minute</p>
            </div>
            
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>⚠️ Security Notice:</strong> If you did not request this login, please ignore this email and contact support immediately.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 12px; margin: 0;">
                This is an automated message from DEXX-TER Security System<br>
                Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    return false;
  }
}

// Test email configuration
export async function testEmailConfiguration(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration error:', error);
    return false;
  }
}