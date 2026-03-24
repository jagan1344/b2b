import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers';
import authRouter from '../../modules/auth/auth.router';

// Access the mocked prisma
import prisma from '../../config/db';
const mockPrisma = prisma as any;

describe('Auth API Routes', () => {
  const app = createTestApp('/api/auth', authRouter);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register/init', () => {
    it('returns 400 when name is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register/init')
        .send({ email: 'test@example.com', password: 'pass123' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('required');
    });

    it('returns 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register/init')
        .send({ name: 'Test', password: 'pass123' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register/init')
        .send({ name: 'Test', email: 'test@example.com' });
      expect(res.status).toBe(400);
    });

    it('returns 409 when email already exists', async () => {
      mockPrisma.teacher.findUnique.mockResolvedValue({ id: 'existing', email: 'test@example.com' });

      const res = await request(app)
        .post('/api/auth/register/init')
        .send({ name: 'Test', email: 'test@example.com', password: 'password123' });
      expect(res.status).toBe(409);
      expect(res.body.error).toContain('already exists');
    });

    it('returns success when registration is initiated', async () => {
      mockPrisma.teacher.findUnique.mockResolvedValue(null);
      mockPrisma.otpStore.upsert.mockResolvedValue({});

      const res = await request(app)
        .post('/api/auth/register/init')
        .send({ name: 'Test Teacher', email: 'new@example.com', password: 'password123' });
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('OTP sent');
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'pass123' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('required');
    });

    it('returns 400 when password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });
      expect(res.status).toBe(400);
    });

    it('returns 401 when credentials are invalid', async () => {
      mockPrisma.teacher.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@example.com', password: 'password123' });
      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Invalid');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('returns success and clears cookie', async () => {
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({});

      const res = await request(app)
        .post('/api/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('Logged out');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('returns 401 when no refresh token cookie', async () => {
      const res = await request(app)
        .post('/api/auth/refresh');
      expect(res.status).toBe(401);
      expect(res.body.error).toContain('refresh token');
    });
  });

  describe('POST /api/auth/register/verify', () => {
    it('returns 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register/verify')
        .send({ otp: '123456' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('required');
    });

    it('returns 400 when OTP is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register/verify')
        .send({ email: 'test@example.com' });
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid OTP', async () => {
      mockPrisma.otpStore.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/register/verify')
        .send({ email: 'test@example.com', otp: '999999' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid');
    });
  });
});
