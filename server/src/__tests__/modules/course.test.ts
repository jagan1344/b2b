import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp, generateTestToken, generatePrincipalToken } from '../helpers';
import { authMiddleware, principalOnly } from '../../middleware/auth';
import courseRouter from '../../modules/course/course.router';

import prisma from '../../config/db';
const mockPrisma = prisma as any;

describe('Course API Routes', () => {
  const app = createTestApp('/api/courses', courseRouter);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/courses', () => {
    it('returns 401 without auth token', async () => {
      const res = await request(app).get('/api/courses');
      expect(res.status).toBe(401);
    });

    it('returns courses for authenticated teacher', async () => {
      const token = generateTestToken();
      mockPrisma.course.findMany.mockResolvedValue([
        { id: 'c1', name: 'Math 101', code: 'MTH101', semester: 'Fall', year: 2025 },
      ]);

      const res = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('returns all courses for principal', async () => {
      const token = generatePrincipalToken();
      mockPrisma.course.findMany.mockResolvedValue([
        { id: 'c1', name: 'Math 101', code: 'MTH101' },
        { id: 'c2', name: 'Physics 101', code: 'PHY101' },
      ]);

      const res = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('POST /api/courses', () => {
    it('returns 401 without auth token', async () => {
      const res = await request(app).post('/api/courses');
      expect(res.status).toBe(401);
    });

    it('returns 400 when required fields are missing', async () => {
      const token = generatePrincipalToken();
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Math' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('required');
    });

    it('creates course successfully', async () => {
      const token = generatePrincipalToken();
      const courseData = { name: 'Math 101', code: 'MTH101', semester: 'Fall', year: '2025' };
      mockPrisma.course.create.mockResolvedValue({ id: 'new-id', ...courseData });

      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${token}`)
        .send(courseData);
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Math 101');
    });

    it('returns 409 for duplicate course code', async () => {
      const token = generatePrincipalToken();
      mockPrisma.course.create.mockRejectedValue({ code: 'P2002' });

      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Math 101', code: 'MTH101', semester: 'Fall', year: '2025' });
      expect(res.status).toBe(409);
    });
  });
});
