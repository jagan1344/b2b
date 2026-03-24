import express from 'express';
import cookieParser from 'cookie-parser';
import { errorHandler } from '../middleware/errorHandler';
import { signAccessToken, TokenPayload } from '../utils/jwt';

/**
 * Create a minimal Express app for testing a specific router.
 */
export function createTestApp(path: string, router: express.Router) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(path, router);
  app.use(errorHandler);
  return app;
}

/**
 * Generate a valid JWT access token for test requests.
 */
export function generateTestToken(payload?: Partial<TokenPayload>): string {
  return signAccessToken({
    teacherId: 'test-teacher-id',
    role: 'teacher',
    ...payload,
  });
}

/**
 * Generate a principal JWT token.
 */
export function generatePrincipalToken(): string {
  return generateTestToken({ role: 'principal' });
}
