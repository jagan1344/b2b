import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp, generateTestToken } from '../helpers';
import studentRouter from '../../modules/student/student.router';

import prisma from '../../config/db';
const mockPrisma = prisma as any;

describe('Student API Routes', () => {
  const app = createTestApp('/api/courses/:courseId/students', studentRouter);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/courses/:courseId/students', () => {
    it('returns 401 without auth token', async () => {
      const res = await request(app).get('/api/courses/course-1/students');
      expect(res.status).toBe(401);
    });

    it('returns students list for authenticated teacher', async () => {
      const token = generateTestToken();
      mockPrisma.enrollment.findMany.mockResolvedValue([
        {
          id: 'e1',
          student: { id: 's1', name: 'John Doe', rollNumber: 'R001', email: 'john@test.com' },
          enrolledAt: new Date().toISOString(),
        },
      ]);

      const res = await request(app)
        .get('/api/courses/course-1/students')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/courses/:courseId/students', () => {
    it('returns 400 when name is missing', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .post('/api/courses/course-1/students')
        .set('Authorization', `Bearer ${token}`)
        .send({ rollNumber: 'R001' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('required');
    });

    it('returns 400 when rollNumber is missing', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .post('/api/courses/course-1/students')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'John' });
      expect(res.status).toBe(400);
    });

    it('creates and enrolls student successfully', async () => {
      const token = generateTestToken();
      const student = { id: 's1', name: 'Jane Doe', rollNumber: 'R002' };
      mockPrisma.student.findUnique.mockResolvedValue(null);
      mockPrisma.student.create.mockResolvedValue(student);
      mockPrisma.enrollment.findUnique.mockResolvedValue(null);
      mockPrisma.enrollment.create.mockResolvedValue({ id: 'e1' });

      const res = await request(app)
        .post('/api/courses/course-1/students')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Jane Doe', rollNumber: 'R002' });
      expect(res.status).toBe(201);
      expect(res.body.student).toBeDefined();
      expect(res.body.enrolled).toBe(true);
    });

    it('returns 409 when student is already enrolled', async () => {
      const token = generateTestToken();
      const student = { id: 's1', name: 'Jane Doe', rollNumber: 'R002' };
      mockPrisma.student.findUnique.mockResolvedValue(student);
      mockPrisma.enrollment.findUnique.mockResolvedValue({ id: 'e1' });

      const res = await request(app)
        .post('/api/courses/course-1/students')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Jane Doe', rollNumber: 'R002' });
      expect(res.status).toBe(409);
      expect(res.body.error).toContain('already enrolled');
    });
  });
});
