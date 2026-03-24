import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth, AuthProvider } from '../../context/AuthContext';

// Mock the api module
vi.mock('../../lib/api', () => ({
  auth: {
    login: vi.fn(),
    registerInit: vi.fn(),
    registerVerify: vi.fn(),
    logout: vi.fn(),
  },
  teacher: {
    getMe: vi.fn(),
  },
  setAccessToken: vi.fn(),
  clearAccessToken: vi.fn(),
  getAccessToken: vi.fn().mockReturnValue(null),
}));

describe('AuthContext', () => {
  it('useAuth throws when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be inside AuthProvider');
  });

  it('provides user as null initially when no token', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    // Wait for loading to finish
    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
  });

  it('provides login function', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    expect(typeof result.current.login).toBe('function');
  });

  it('provides logout function', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    expect(typeof result.current.logout).toBe('function');
  });

  it('provides registerInit and registerVerify functions', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    expect(typeof result.current.registerInit).toBe('function');
    expect(typeof result.current.registerVerify).toBe('function');
  });
});
