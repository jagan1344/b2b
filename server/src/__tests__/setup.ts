import { vi } from 'vitest';

// Mock Prisma client
vi.mock('../config/db', () => {
  const mockPrisma = {
    teacher: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    otpStore: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    refreshToken: {
      findUnique: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    course: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    courseTeacher: {
      create: vi.fn(),
    },
    subject: {
      create: vi.fn(),
    },
    student: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    enrollment: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    attendanceRecord: {
      findMany: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
    mark: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
  return { default: mockPrisma };
});

// Mock mailer
vi.mock('../config/mailer', () => ({
  sendOtpEmail: vi.fn().mockResolvedValue(null),
}));

// Set test env variables
process.env.JWT_ACCESS_SECRET = 'test-access-secret-key-12345';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-12345';
process.env.DATABASE_URL = 'file:./test.db';
process.env.NODE_ENV = 'test';
