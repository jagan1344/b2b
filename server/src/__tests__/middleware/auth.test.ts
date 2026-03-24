import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { authMiddleware, principalOnly } from '../../middleware/auth';
import { signAccessToken } from '../../utils/jwt';

function createMockReqResNext() {
  const req = {
    headers: {},
    teacher: undefined,
  } as unknown as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

describe('authMiddleware', () => {
  it('returns 401 when no Authorization header', () => {
    const { req, res, next } = createMockReqResNext();
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Access token required.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when Authorization header does not start with Bearer', () => {
    const { req, res, next } = createMockReqResNext();
    req.headers.authorization = 'Basic some-token';
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token is invalid', () => {
    const { req, res, next } = createMockReqResNext();
    req.headers.authorization = 'Bearer invalid-token';
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired access token.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next and sets req.teacher on valid token', () => {
    const { req, res, next } = createMockReqResNext();
    const token = signAccessToken({ teacherId: 'test-id', role: 'teacher' });
    req.headers.authorization = `Bearer ${token}`;
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.teacher).toBeDefined();
    expect(req.teacher!.teacherId).toBe('test-id');
    expect(req.teacher!.role).toBe('teacher');
  });
});

describe('principalOnly', () => {
  it('returns 403 when req.teacher is not set', () => {
    const { req, res, next } = createMockReqResNext();
    principalOnly(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Only principals can perform this action.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when role is not principal', () => {
    const { req, res, next } = createMockReqResNext();
    (req as any).teacher = { teacherId: 'test', role: 'teacher' };
    principalOnly(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when role is principal', () => {
    const { req, res, next } = createMockReqResNext();
    (req as any).teacher = { teacherId: 'test', role: 'principal' };
    principalOnly(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
