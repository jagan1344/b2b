import { Request, Response } from 'express';
import * as authService from './auth.service';

export async function registerInit(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }
    const result = await authService.initiateRegistration(name, email, password);
    res.json(result);
  } catch (err: any) {
    if (err.message === 'EMAIL_EXISTS') {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }
    res.status(500).json({ error: err.message });
  }
}

export async function registerVerify(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res.status(400).json({ error: 'Email and OTP are required.' });
      return;
    }
    const result = await authService.verifyRegistration(email, otp);
    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.json({ accessToken: result.accessToken, teacher: result.teacher });
  } catch (err: any) {
    if (err.message === 'INVALID_OTP') {
      res.status(400).json({ error: 'Invalid or expired OTP.' });
      return;
    }
    res.status(500).json({ error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }
    const result = await authService.loginTeacher(email, password);
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken: result.accessToken, teacher: result.teacher });
  } catch (err: any) {
    if (err.message === 'INVALID_CREDENTIALS') {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }
    if (err.message === 'NOT_VERIFIED') {
      res.status(403).json({ error: 'Account not verified. Please complete registration.' });
      return;
    }
    res.status(500).json({ error: err.message });
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      res.status(401).json({ error: 'No refresh token provided.' });
      return;
    }
    const result = await authService.refreshAccessToken(token);
    res.json({ accessToken: result.accessToken });
  } catch (err: any) {
    res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await authService.logoutTeacher(token);
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully.' });
  } catch {
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out.' });
  }
}
