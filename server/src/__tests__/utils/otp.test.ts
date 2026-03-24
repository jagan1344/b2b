import { describe, it, expect } from 'vitest';
import { generateOtp } from '../../utils/otp';

describe('OTP utility', () => {
  it('generateOtp returns a 6-digit string', () => {
    const otp = generateOtp();
    expect(otp).toBeDefined();
    expect(typeof otp).toBe('string');
    expect(otp).toHaveLength(6);
    expect(otp).toMatch(/^\d{6}$/);
  });

  it('generateOtp returns values within valid range', () => {
    // Run multiple times to test range
    for (let i = 0; i < 20; i++) {
      const otp = generateOtp();
      const num = parseInt(otp, 10);
      expect(num).toBeGreaterThanOrEqual(100000);
      expect(num).toBeLessThanOrEqual(999999);
    }
  });

  it('generateOtp produces different values (randomness)', () => {
    const otps = new Set<string>();
    for (let i = 0; i < 10; i++) {
      otps.add(generateOtp());
    }
    // With 10 attempts, we should get at least 2 different values
    expect(otps.size).toBeGreaterThan(1);
  });
});
