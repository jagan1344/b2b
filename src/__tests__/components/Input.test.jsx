import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../../components/Input';

describe('Input component', () => {
  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<Input label="Name" placeholder="Enter your name" />);
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
  });

  it('fires onChange event', () => {
    const handleChange = vi.fn();
    render(<Input label="Test" onChange={handleChange} />);
    const input = screen.getByLabelText('Test');
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('shows error message', () => {
    render(<Input label="Email" error="Email is required" />);
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('applies error styling when error prop is present', () => {
    render(<Input label="Email" error="Required" />);
    const input = screen.getByLabelText('Email');
    expect(input.className).toContain('border-red-400');
  });

  it('generates ID from label', () => {
    render(<Input label="Full Name" />);
    const input = screen.getByLabelText('Full Name');
    expect(input.id).toBe('full-name');
  });

  it('uses custom id when provided', () => {
    render(<Input label="Email" id="custom-email" />);
    const input = screen.getByLabelText('Email');
    expect(input.id).toBe('custom-email');
  });

  it('renders without label', () => {
    render(<Input placeholder="No label input" />);
    expect(screen.getByPlaceholderText('No label input')).toBeInTheDocument();
  });

  it('passes custom className', () => {
    render(<Input label="Test" className="custom-input" />);
    const input = screen.getByLabelText('Test');
    expect(input.className).toContain('custom-input');
  });
});
