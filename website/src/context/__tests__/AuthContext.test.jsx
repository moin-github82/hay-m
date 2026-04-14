/**
 * Tests for website src/context/AuthContext.jsx
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

// ── Mock the api module and session helpers ───────────────────────────────
vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
  },
  saveSession:    vi.fn(),
  clearSession:   vi.fn(),
  getStoredUser:  vi.fn(),
}));

import api, { saveSession, clearSession, getStoredUser } from '../../services/api';

const MOCK_USER  = { _id: 'u1', fullName: 'Alice', email: 'alice@test.com' };
const MOCK_TOKEN = 'jwt-abc';

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

beforeEach(() => {
  vi.clearAllMocks();
  getStoredUser.mockReturnValue(null);
});

// ── Initial state ─────────────────────────────────────────────────────────
describe('AuthContext — initial state', () => {
  it('resolves loading to false after mount', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('user is null when no session is stored', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
  });

  it('restores user from localStorage if a session exists', async () => {
    getStoredUser.mockReturnValue(MOCK_USER);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toEqual(MOCK_USER);
  });
});

// ── login() ───────────────────────────────────────────────────────────────
describe('AuthContext — login()', () => {
  it('calls POST /auth/login with email and password', async () => {
    api.post.mockResolvedValue({ token: MOCK_TOKEN, user: MOCK_USER });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.login('alice@test.com', 'secret');
    });

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'alice@test.com',
      password: 'secret',
    });
  });

  it('saves session and sets user state on success', async () => {
    api.post.mockResolvedValue({ token: MOCK_TOKEN, user: MOCK_USER });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => { await result.current.login('alice@test.com', 'secret'); });

    expect(saveSession).toHaveBeenCalledWith(MOCK_TOKEN, MOCK_USER);
    expect(result.current.user).toEqual(MOCK_USER);
  });

  it('propagates errors from the API', async () => {
    api.post.mockRejectedValue(new Error('Invalid credentials'));
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      act(async () => { await result.current.login('x@x.com', 'bad'); })
    ).rejects.toThrow('Invalid credentials');
  });
});

// ── signup() ──────────────────────────────────────────────────────────────
describe('AuthContext — signup()', () => {
  it('calls POST /auth/signup with name, email, password', async () => {
    api.post.mockResolvedValue({ token: MOCK_TOKEN, user: MOCK_USER });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signup('Alice', 'alice@test.com', 'secret');
    });

    expect(api.post).toHaveBeenCalledWith('/auth/signup', {
      fullName: 'Alice',
      email: 'alice@test.com',
      password: 'secret',
    });
  });

  it('sets user state after successful signup', async () => {
    api.post.mockResolvedValue({ token: MOCK_TOKEN, user: MOCK_USER });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signup('Alice', 'alice@test.com', 'secret');
    });

    expect(result.current.user).toEqual(MOCK_USER);
  });
});

// ── logout() ──────────────────────────────────────────────────────────────
describe('AuthContext — logout()', () => {
  it('clears session and sets user to null', async () => {
    getStoredUser.mockReturnValue(MOCK_USER);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.user).toEqual(MOCK_USER));

    act(() => { result.current.logout(); });

    expect(clearSession).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
  });
});

// ── updateUser() ──────────────────────────────────────────────────────────
describe('AuthContext — updateUser()', () => {
  it('merges partial updates into user state', async () => {
    getStoredUser.mockReturnValue(MOCK_USER);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.user).toEqual(MOCK_USER));

    act(() => { result.current.updateUser({ fullName: 'Alice Smith' }); });

    expect(result.current.user.fullName).toBe('Alice Smith');
    expect(result.current.user.email).toBe(MOCK_USER.email);
  });
});
