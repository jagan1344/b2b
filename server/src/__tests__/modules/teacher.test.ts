import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp, generateTestToken, generatePrincipalToken } from '../helpers';
import teacherRouter from '../../modules/teacher/teacher.router';

import prisma from '../../config/db';
const mockPrisma = prisma as any;

describe('Teacher API Routes', () => {
  const app = createTestApp('/api/teacher', teacherRouter);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/teacher/me', () => {
    it('returns 401 without auth token', async () => {
      const res = await request(app).get('/api/teacher/me');
      expect(res.status).toBe(401);
    });

    it('returns teacher info', async () => {
      const token = generateTestToken();
      mockPrisma.teacher.findUnique.mockResolvedValue({
        id: 'test-teacher-id',
        name: 'Test Teacher',
        email: 'teacher@test.com',
        role: 'teacher',
        isVerified: true,
        createdAt: new Date(),
      });

      const res = await request(app)
        .get('/api/teacher/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Test Teacher');
      expect(res.body.email).toBe('teacher@test.com');
    });

    it('returns 404 when teacher not found', async () => {
      const token = generateTestToken();
      mockPrisma.teacher.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/teacher/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/teacher/all', () => {
    it('returns 403 for non-principal', async () => {
      const token = generateTestToken({ role: 'teacher' });

      const res = await request(app)
        .get('/api/teacher/all')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
      expect(res.body.error).toContain('principals');
    });

    it('returns all teachers for principal', async () => {
      const token = generatePrincipalToken();
      mockPrisma.teacher.findMany.mockResolvedValue([
        { id: 't1', name: 'Teacher 1', email: 't1@test.com', role: 'teacher' },
        { id: 't2', name: 'Teacher 2', email: 't2@test.com', role: 'teacher' },
      ]);

      const res = await request(app)
        .get('/api/teacher/all')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });
});
