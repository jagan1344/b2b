import { describe, it, expect, vi } from 'vitest';

/**
 * Object-Oriented Testing (OOT) requires testing artifacts as objects with state and behavior.
 * Here we demonstrate OOT by testing an AuthService class (conceptualized for this test).
 */

class AuthService {
  private baseDelay: number = 0;
  private maxRetries: number = 3;
  private attemptCount: Map<string, number> = new Map();

  constructor(config?: { baseDelay: number; maxRetries: number }) {
    if (config) {
      this.baseDelay = config.baseDelay;
      this.maxRetries = config.maxRetries;
    }
  }

  public getAttempts(email: string): number {
    return this.attemptCount.get(email) || 0;
  }

  public recordAttempt(email: string): boolean {
    const current = this.getAttempts(email);
    if (current >= this.maxRetries) {
      return false; // Account locked in OO state
    }
    this.attemptCount.set(email, current + 1);
    return true;
  }

  public resetAttempts(email: string): void {
    this.attemptCount.delete(email);
  }

  public isLocked(email: string): boolean {
    return this.getAttempts(email) >= this.maxRetries;
  }
}

describe('Object-Oriented Testing — AuthService', () => {
  it('should maintain state of login attempts per email', () => {
    const service = new AuthService({ baseDelay: 0, maxRetries: 2 });
    const email = 'test@spms.edu';

    expect(service.getAttempts(email)).toBe(0);

    service.recordAttempt(email);
    expect(service.getAttempts(email)).toBe(1);
    expect(service.isLocked(email)).toBe(false);

    service.recordAttempt(email);
    expect(service.getAttempts(email)).toBe(2);
    expect(service.isLocked(email)).toBe(true);
  });

  it('should prevent attempts when max retries exceeded (Encapsulated Policy)', () => {
    const service = new AuthService({ baseDelay: 0, maxRetries: 1 });
    const email = 'lockout@spms.edu';

    expect(service.recordAttempt(email)).toBe(true);
    expect(service.recordAttempt(email)).toBe(false); // OO behavior: policy enforcement
    expect(service.isLocked(email)).toBe(true);
  });

  it('should reset internal state correctly', () => {
    const service = new AuthService({ baseDelay: 0, maxRetries: 3 });
    const email = 'reset@spms.edu';

    service.recordAttempt(email);
    service.recordAttempt(email);
    expect(service.getAttempts(email)).toBe(2);

    service.resetAttempts(email);
    expect(service.getAttempts(email)).toBe(0);
    expect(service.isLocked(email)).toBe(false);
  });

  it('should isolate state between different email objects', () => {
    const service = new AuthService();
    const email1 = 'user1@spms.edu';
    const email2 = 'user2@spms.edu';

    service.recordAttempt(email1);
    expect(service.getAttempts(email1)).toBe(1);
    expect(service.getAttempts(email2)).toBe(0);
  });
});
