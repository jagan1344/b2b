import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader } from '../../components/Card';

describe('Card component', () => {
  it('renders children content', () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('applies className prop', () => {
    const { container } = render(<Card className="custom-card">Content</Card>);
    const card = container.firstChild;
    expect(card.className).toContain('custom-card');
  });

  it('applies glass-panel class', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild;
    expect(card.className).toContain('glass-panel');
  });

  it('applies inline style', () => {
    const { container } = render(<Card style={{ backgroundColor: 'red' }}>Content</Card>);
    const card = container.firstChild;
    expect(card.style.backgroundColor).toBe('red');
  });
});

describe('CardHeader component', () => {
  it('renders title', () => {
    render(<CardHeader title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders action element', () => {
    render(<CardHeader title="Title" action={<button>Action</button>} />);
    expect(screen.getByRole('button')).toHaveTextContent('Action');
  });

  it('does not render action when not provided', () => {
    const { container } = render(<CardHeader title="Title Only" />);
    // Should only contain the title heading
    const children = container.firstChild.children;
    expect(children.length).toBe(1);
  });
});
