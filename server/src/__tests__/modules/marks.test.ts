import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp, generateTestToken } from '../helpers';
import marksRouter from '../../modules/marks/marks.router';

import prisma from '../../config/db';
const mockPrisma = prisma as any;

describe('Marks API Routes', () => {
  const app = createTestApp('/api/courses/:courseId/marks', marksRouter);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/courses/:courseId/marks', () => {
    it('returns 401 without auth token', async () => {
      const res = await request(app).get('/api/courses/course-1/marks');
      expect(res.status).toBe(401);
    });

    it('returns marks list', async () => {
      const token = generateTestToken();
      mockPrisma.mark.findMany.mockResolvedValue([
        {
          id: 'm1', studentId: 's1', subjectId: 'sub1', score: 85, maxScore: 100,
          examType: 'midterm',
          student: { id: 's1', name: 'John', rollNumber: 'R001' },
          subject: { id: 'sub1', name: 'Calculus' },
        },
      ]);

      const res = await request(app)
        .get('/api/courses/course-1/marks')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/courses/:courseId/marks', () => {
    it('returns 400 when required fields are missing', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .post('/api/courses/course-1/marks')
        .set('Authorization', `Bearer ${token}`)
        .send({ studentId: 's1' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('required');
    });

    it('creates mark successfully', async () => {
      const token = generateTestToken();
      const markData = {
        studentId: 's1', subjectId: 'sub1', examType: 'midterm',
        score: 85, maxScore: 100,
      };
      mockPrisma.mark.create.mockResolvedValue({ id: 'm1', ...markData });

      const res = await request(app)
        .post('/api/courses/course-1/marks')
        .set('Authorization', `Bearer ${token}`)
        .send(markData);
      expect(res.status).toBe(201);
      expect(res.body.score).toBe(85);
    });

    it('returns 409 for duplicate mark', async () => {
      const token = generateTestToken();
      mockPrisma.mark.create.mockRejectedValue({ code: 'P2002' });

      const res = await request(app)
        .post('/api/courses/course-1/marks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          studentId: 's1', subjectId: 'sub1', examType: 'midterm',
          score: 85, maxScore: 100,
        });
      expect(res.status).toBe(409);
    });
  });
});
