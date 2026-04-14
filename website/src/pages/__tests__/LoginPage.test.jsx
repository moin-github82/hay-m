/**
 * Tests for website src/pages/LoginPage.jsx
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';

// ── Mock router hooks ─────────────────────────────────────────────────────
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// ── Mock AuthContext ──────────────────────────────────────────────────────
const mockLogin = vi.fn();
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

const renderLogin = () =>
  render(<MemoryRouter><LoginPage /></MemoryRouter>);

beforeEach(() => { vi.clearAllMocks(); });

// ── Rendering ─────────────────────────────────────────────────────────────
describe('LoginPage — rendering', () => {
  it('renders the HAY-M logo / brand name', () => {
    renderLogin();
    expect(screen.getByText('HAY-M')).toBeInTheDocument();
  });

  it('renders the page heading "Welcome back"', () => {
    renderLogin();
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
  });

  it('renders an email input field', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });

  it('renders a password input field', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('renders the Sign In submit button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders a link to the signup page', () => {
    renderLogin();
    expect(screen.getByText('Create one free')).toBeInTheDocument();
  });

  it('does NOT show an error alert on initial render', () => {
    renderLogin();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

// ── Form interaction ──────────────────────────────────────────────────────
describe('LoginPage — form interaction', () => {
  it('updates email field as the user types', async () => {
    const user = userEvent.setup();
    renderLogin();
    const emailInput = screen.getByPlaceholderText('you@example.com');
    await user.type(emailInput, 'alice@test.com');
    expect(emailInput.value).toBe('alice@test.com');
  });

  it('updates password field as the user types', async () => {
    const user = userEvent.setup();
    renderLogin();
    const pwInput = screen.getByPlaceholderText('••••••••');
    await user.type(pwInput, 'mysecret');
    expect(pwInput.value).toBe('mysecret');
  });
});

// ── Successful submission ─────────────────────────────────────────────────
describe('LoginPage — successful login', () => {
  it('calls login() with the entered email and password', async () => {
    mockLogin.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText('you@example.com'), 'alice@test.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'secret');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('alice@test.com', 'secret');
    });
  });

  it('navigates to /dashboard after successful login', async () => {
    mockLogin.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText('you@example.com'), 'alice@test.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'secret');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});

// ── Failed submission ─────────────────────────────────────────────────────
describe('LoginPage — failed login', () => {
  it('displays the error message returned by the API', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText('you@example.com'), 'x@x.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrong');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('does NOT navigate to /dashboard on failure', async () => {
    mockLogin.mockRejectedValue(new Error('Unauthorised'));
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText('you@example.com'), 'x@x.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'bad');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => screen.getByText('Unauthorised'));
    expect(mockNavigate).not.toHaveBeenCalledWith('/dashboard');
  });
});

// ── Loading state ─────────────────────────────────────────────────────────
describe('LoginPage — loading state', () => {
  it('disables the submit button while login is in progress', async () => {
    // Never resolve — keep in loading state
    mockLogin.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText('you@example.com'), 'alice@test.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'secret');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });
  });
});
