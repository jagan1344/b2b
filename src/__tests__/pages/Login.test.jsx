import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Login } from '../../pages/Login';

// Mock the AuthContext
const mockLogin = vi.fn();
const mockRegisterInit = vi.fn();
const mockRegisterVerify = vi.fn();

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    registerInit: mockRegisterInit,
    registerVerify: mockRegisterVerify,
    user: null,
    loading: false,
  }),
}));

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

describe('Login page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form by default', () => {
    renderLogin();
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your dashboard')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('renders Sign In button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('switches to register mode', () => {
    renderLogin();
    fireEvent.click(screen.getByText('Register'));
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
  });

  it('switches back to login from register', () => {
    renderLogin();
    fireEvent.click(screen.getByText('Register'));
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Back to login/i));
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  it('renders register form fields', () => {
    renderLogin();
    fireEvent.click(screen.getByText('Register'));
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('renders Send OTP button in register mode', () => {
    renderLogin();
    fireEvent.click(screen.getByText('Register'));
    expect(screen.getByRole('button', { name: /send otp/i })).toBeInTheDocument();
  });

  it('allows typing in email and password fields', () => {
    renderLogin();
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('renders copyright text', () => {
    renderLogin();
    expect(screen.getByText(/SPMS Platform/i)).toBeInTheDocument();
  });

  it('renders SPMS logo', () => {
    renderLogin();
    expect(screen.getByText('SP')).toBeInTheDocument();
  });
});
