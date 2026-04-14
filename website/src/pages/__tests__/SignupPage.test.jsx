/**
 * Tests for website src/pages/SignupPage.jsx
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SignupPage from '../SignupPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockSignup = vi.fn();
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ signup: mockSignup }),
}));

const renderSignup = () =>
  render(<MemoryRouter><SignupPage /></MemoryRouter>);

// Helper: fill the form with valid data
async function fillForm(user, overrides = {}) {
  const defaults = {
    fullName: 'Alice Smith',
    email:    'alice@test.com',
    password: 'secret123',
    confirm:  'secret123',
  };
  const data = { ...defaults, ...overrides };

  await user.type(screen.getByPlaceholderText('John Doe'),          data.fullName);
  await user.type(screen.getByPlaceholderText('you@example.com'),   data.email);
  await user.type(screen.getByPlaceholderText('Min 6 characters'),  data.password);
  await user.type(screen.getByPlaceholderText('Repeat password'),   data.confirm);
}

beforeEach(() => { vi.clearAllMocks(); });

// ── Rendering ─────────────────────────────────────────────────────────────
describe('SignupPage — rendering', () => {
  it('renders the page heading "Create account"', () => {
    renderSignup();
    expect(screen.getByText('Create account')).toBeInTheDocument();
  });

  it('renders all four input fields', () => {
    renderSignup();
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Min 6 characters')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Repeat password')).toBeInTheDocument();
  });

  it('renders the Create Account submit button', () => {
    renderSignup();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('renders a link to the login page', () => {
    renderSignup();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });
});

// ── Client-side validation ────────────────────────────────────────────────
describe('SignupPage — validation', () => {
  it('shows an error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderSignup();
    await fillForm(user, { confirm: 'different' });
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
    });
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('shows an error when password is shorter than 6 characters', async () => {
    const user = userEvent.setup();
    renderSignup();
    await fillForm(user, { password: 'abc', confirm: 'abc' });
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });
    expect(mockSignup).not.toHaveBeenCalled();
  });
});

// ── Successful submission ─────────────────────────────────────────────────
describe('SignupPage — successful signup', () => {
  it('calls signup() with fullName, email, and password', async () => {
    mockSignup.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderSignup();
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith('Alice Smith', 'alice@test.com', 'secret123');
    });
  });

  it('navigates to /dashboard on success', async () => {
    mockSignup.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderSignup();
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});

// ── Failed submission ─────────────────────────────────────────────────────
describe('SignupPage — API error', () => {
  it('displays the error message from the API', async () => {
    mockSignup.mockRejectedValue(new Error('Email already taken'));
    const user = userEvent.setup();
    renderSignup();
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Email already taken')).toBeInTheDocument();
    });
  });

  it('does NOT navigate on failure', async () => {
    mockSignup.mockRejectedValue(new Error('Server error'));
    const user = userEvent.setup();
    renderSignup();
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => screen.getByText('Server error'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

// ── Loading state ─────────────────────────────────────────────────────────
describe('SignupPage — loading state', () => {
  it('shows "Creating account…" and disables button during submission', async () => {
    mockSignup.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    renderSignup();
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
    });
  });
});
