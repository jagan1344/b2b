import nodemailer from 'nodemailer';
import { env } from './env';

let transporter: nodemailer.Transporter;

export async function getMailer(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  // If no SMTP credentials provided, create Ethereal test account
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    const testAccount = await nodemailer.createTestAccount();
    console.log('📧 Ethereal test account created:');
    console.log(`   Email: ${testAccount.user}`);
    console.log(`   Pass:  ${testAccount.pass}`);
    console.log(`   View emails at: https://ethereal.email/login`);
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  return transporter;
}

export async function sendOtpEmail(to: string, otp: string): Promise<string | null> {
  const mailer = await getMailer();
  const info = await mailer.sendMail({
    from: '"SPMS Platform" <noreply@spms.edu>',
    to,
    subject: 'Your SPMS Verification Code',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="background: linear-gradient(135deg, #4f46e5, #ec4899); width: 48px; height: 48px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
            <span style="color: white; font-weight: bold; font-size: 18px;">SP</span>
          </div>
        </div>
        <h2 style="text-align: center; color: #1e293b; margin-bottom: 8px;">Verify Your Email</h2>
        <p style="text-align: center; color: #64748b; font-size: 14px;">Use this code to complete your SPMS registration:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4f46e5; background: #eef2ff; padding: 16px 32px; border-radius: 12px; display: inline-block;">${otp}</span>
        </div>
        <p style="text-align: center; color: #94a3b8; font-size: 12px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });

  // Return Ethereal preview URL for dev testing
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`📧 OTP email preview: ${previewUrl}`);
  }
  return previewUrl ? String(previewUrl) : null;
}
