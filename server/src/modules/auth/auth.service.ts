import prisma from '../../config/db';
import { hashPassword, comparePassword } from '../../utils/hash';
import { generateOtp } from '../../utils/otp';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { sendOtpEmail } from '../../config/mailer';
import crypto from 'crypto';

export async function initiateRegistration(name: string, email: string, password: string) {
  // Check if teacher already exists
  const existing = await prisma.teacher.findUnique({ where: { email } });
  if (existing) throw new Error('EMAIL_EXISTS');

  const otp = generateOtp();
  const passwordHash = await hashPassword(password);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  // Upsert OTP record (allows re-sending)
  await prisma.otpStore.upsert({
    where: { email },
    update: { otp, name, passwordHash, expiresAt },
    create: { email, otp, name, passwordHash, expiresAt },
  });

  // Send OTP email
  const previewUrl = await sendOtpEmail(email, otp);
  
  return {
    message: 'OTP sent to your email. Valid for 10 minutes.',
    ...(previewUrl ? { previewUrl } : {}),
  };
}

export async function registerDirect(name: string, email: string, password: string) {
  // Check if teacher already exists
  const existing = await prisma.teacher.findUnique({ where: { email } });
  if (existing) throw new Error('EMAIL_EXISTS');

  const passwordHash = await hashPassword(password);

  // Create teacher account directly
  const teacher = await prisma.teacher.create({
    data: {
      name,
      email,
      passwordHash,
      isVerified: true, // Auto-verify
    },
  });

  // Generate tokens
  const payload = { teacherId: teacher.id, role: teacher.role };
  const accessToken = signAccessToken(payload);
  const refreshTokenValue = signRefreshToken(payload);

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      teacherId: teacher.id,
      token: refreshTokenValue,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken,
    refreshToken: refreshTokenValue,
    teacher: { id: teacher.id, name: teacher.name, email: teacher.email, role: teacher.role },
  };
}

export async function verifyRegistration(email: string, otp: string) {
  const record = await prisma.otpStore.findUnique({ where: { email } });
  if (!record || record.otp !== otp || record.expiresAt < new Date()) {
    throw new Error('INVALID_OTP');
  }

  // Create teacher account
  const teacher = await prisma.teacher.create({
    data: {
      name: record.name,
      email: record.email,
      passwordHash: record.passwordHash,
      isVerified: true,
    },
  });

  // Delete OTP record
  await prisma.otpStore.delete({ where: { email } });

  // Generate tokens
  const payload = { teacherId: teacher.id, role: teacher.role };
  const accessToken = signAccessToken(payload);
  const refreshTokenValue = signRefreshToken(payload);

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      teacherId: teacher.id,
      token: refreshTokenValue,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken,
    refreshToken: refreshTokenValue,
    teacher: { id: teacher.id, name: teacher.name, email: teacher.email, role: teacher.role },
  };
}

export async function loginTeacher(email: string, password: string) {
  const teacher = await prisma.teacher.findUnique({ where: { email } });
  if (!teacher) throw new Error('INVALID_CREDENTIALS');
  if (!teacher.isVerified) throw new Error('NOT_VERIFIED');

  const valid = await comparePassword(password, teacher.passwordHash);
  if (!valid) throw new Error('INVALID_CREDENTIALS');

  const payload = { teacherId: teacher.id, role: teacher.role };
  const accessToken = signAccessToken(payload);
  const refreshTokenValue = signRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      teacherId: teacher.id,
      token: refreshTokenValue,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken,
    refreshToken: refreshTokenValue,
    teacher: { id: teacher.id, name: teacher.name, email: teacher.email, role: teacher.role },
  };
}

export async function refreshAccessToken(token: string) {
  const payload = verifyRefreshToken(token);
  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) {
    throw new Error('EXPIRED');
  }
  const accessToken = signAccessToken({ teacherId: payload.teacherId, role: payload.role });
  return { accessToken };
}

export async function logoutTeacher(token: string) {
  await prisma.refreshToken.deleteMany({ where: { token } });
}
