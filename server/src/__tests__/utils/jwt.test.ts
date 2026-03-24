import { describe, it, expect } from 'vitest';
import { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';

describe('JWT utilities', () => {
  const payload = { teacherId: 'teacher-123', role: 'teacher' };

  it('signAccessToken + verifyAccessToken roundtrip', () => {
    const token = signAccessToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = verifyAccessToken(token);
    expect(decoded.teacherId).toBe(payload.teacherId);
    expect(decoded.role).toBe(payload.role);
  });

  it('signRefreshToken + verifyRefreshToken roundtrip', () => {
    const token = signRefreshToken(payload);
    expect(token).toBeDefined();

    const decoded = verifyRefreshToken(token) as any;
    expect(decoded.teacherId).toBe(payload.teacherId);
    expect(decoded.role).toBe(payload.role);
    
    // OOT Requirement: Verify state/policy of the token
    expect(decoded.exp).toBeDefined();
    if (decoded.exp && decoded.iat) {
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    }
  });

  it('verifyAccessToken throws on invalid token', () => {
    expect(() => verifyAccessToken('invalid-token-string')).toThrow();
  });

  it('verifyAccessToken throws when using refresh secret token', () => {
    const refreshToken = signRefreshToken(payload);
    // Access token verification should fail for refresh tokens (different secret)
    expect(() => verifyAccessToken(refreshToken)).toThrow();
  });

  it('verifyRefreshToken throws on invalid token', () => {
    expect(() => verifyRefreshToken('garbage-token')).toThrow();
  });

  it('tokens contain expected fields and valid expiration', () => {
    const token = signAccessToken(payload);
    const decoded = verifyAccessToken(token) as any;
    expect(decoded).toHaveProperty('teacherId');
    expect(decoded).toHaveProperty('role');
    
    // Explicitly verify the time logic to "Kill" survivors
    expect(decoded.iat).toBeDefined();
    expect(decoded.exp).toBeDefined();
    if (decoded.exp && decoded.iat) {
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    }
  });
});
