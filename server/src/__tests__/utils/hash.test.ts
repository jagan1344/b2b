import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '../../utils/hash';

describe('hash utilities', () => {
  it('hashPassword should return a bcrypt hash', async () => {
    const hash = await hashPassword('testPassword123');
    expect(hash).toBeDefined();
    expect(hash).not.toBe('testPassword123');
    // bcrypt hashes start with $2a$ or $2b$
    expect(hash).toMatch(/^\$2[ab]\$/);
  });

  it('comparePassword should return true for matching password', async () => {
    const password = 'securePass!456';
    const hash = await hashPassword(password);
    const result = await comparePassword(password, hash);
    expect(result).toBe(true);
  });

  it('comparePassword should return false for wrong password', async () => {
    const hash = await hashPassword('correctPassword');
    const result = await comparePassword('wrongPassword', hash);
    expect(result).toBe(false);
  });

  it('hashPassword should produce different hashes for same password (salt)', async () => {
    const password = 'samePassword';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    expect(hash1).not.toBe(hash2);
  });
});
