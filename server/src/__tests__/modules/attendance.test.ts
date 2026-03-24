import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp, generateTestToken } from '../helpers';
import attendanceRouter from '../../modules/attendance/attendance.router';

import prisma from '../../config/db';
const mockPrisma = prisma as any;

describe('Attendance API Routes', () => {
  const app = createTestApp('/api/courses/:courseId/attendance', attendanceRouter);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/courses/:courseId/attendance', () => {
    it('returns 401 without auth token', async () => {
      const res = await request(app).get('/api/courses/course-1/attendance');
      expect(res.status).toBe(401);
    });

    it('returns attendance records', async () => {
      const token = generateTestToken();
      mockPrisma.attendanceRecord.findMany.mockResolvedValue([
        { id: 'a1', studentId: 's1', status: 'present', date: new Date(), student: { id: 's1', name: 'John', rollNumber: 'R001' } },
      ]);

      const res = await request(app)
        .get('/api/courses/course-1/attendance')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/courses/:courseId/attendance', () => {
    it('returns 400 when date is missing', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .post('/api/courses/course-1/attendance')
        .set('Authorization', `Bearer ${token}`)
        .send({ records: [] });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('required');
    });

    it('returns 400 when records is missing', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .post('/api/courses/course-1/attendance')
        .set('Authorization', `Bearer ${token}`)
        .send({ date: '2025-01-15' });
      expect(res.status).toBe(400);
    });

    it('submits attendance successfully', async () => {
      const token = generateTestToken();
      mockPrisma.attendanceRecord.upsert.mockResolvedValue({ id: 'a1', status: 'present' });

      const res = await request(app)
        .post('/api/courses/course-1/attendance')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: '2025-01-15',
          records: [{ studentId: 's1', status: 'present' }],
        });
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('Attendance recorded');
      expect(res.body.count).toBe(1);
    });
  });

  describe('GET /api/courses/:courseId/attendance/summary', () => {
    it('returns attendance summary', async () => {
      const token = generateTestToken();
      mockPrisma.enrollment.findMany.mockResolvedValue([
        { studentId: 's1', student: { name: 'John', rollNumber: 'R001' } },
      ]);
      mockPrisma.attendanceRecord.findMany.mockResolvedValue([
        { status: 'present' },
        { status: 'present' },
        { status: 'absent' },
      ]);

      const res = await request(app)
        .get('/api/courses/course-1/attendance/summary')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty('percentage');
      expect(res.body[0]).toHaveProperty('present');
      expect(res.body[0]).toHaveProperty('absent');
    });
  });
});
