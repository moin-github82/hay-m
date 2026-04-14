/**
 * Tests for src/context/AuthContext.js
 */
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../AuthContext';

// ── Mock authService ──────────────────────────────────────────────────────
jest.mock('../../services/authService', () => ({
  authService: {
    login:         jest.fn(),
    signup:        jest.fn(),
    logout:        jest.fn(),
    getStoredUser: jest.fn(),
    getToken:      jest.fn(),
  },
}));

const { authService } = require('../../services/authService');

const MOCK_USER  = { _id: 'u1', fullName: 'Alice', email: 'alice@test.com' };
const MOCK_TOKEN = 'jwt-abc';

// Wrapper to supply the AuthProvider
const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

beforeEach(() => {
  jest.clearAllMocks();
  // Default: no stored session
  authService.getStoredUser.mockResolvedValue(null);
  authService.getToken.mockResolvedValue(null);
});

// ── Initial state ─────────────────────────────────────────────────────────
describe('AuthContext — initial state', () => {
  it('starts with loading = true then resolves to false', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    // Initially loading
    expect(result.current.loading).toBe(true);
    // After session restore completes
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('starts with user = null when no session is stored', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
  });

  it('starts with token = null when no session is stored', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.token).toBeNull();
  });
});

// ── Session restore ───────────────────────────────────────────────────────
describe('AuthContext — session restore on mount', () => {
  it('restores user and token from AsyncStorage on mount', async () => {
    authService.getStoredUser.mockResolvedValue(MOCK_USER);
    authService.getToken.mockResolvedValue(MOCK_TOKEN);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toEqual(MOCK_USER);
    expect(result.current.token).toBe(MOCK_TOKEN);
  });

  it('does NOT restore when only user is stored (no token)', async () => {
    authService.getStoredUser.mockResolvedValue(MOCK_USER);
    authService.getToken.mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });
});

// ── login() ───────────────────────────────────────────────────────────────
describe('AuthContext — login()', () => {
  it('updates user and token state on successful login', async () => {
    authService.login.mockResolvedValue({ user: MOCK_USER, token: MOCK_TOKEN });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.login('alice@test.com', 'secret');
    });

    expect(result.current.user).toEqual(MOCK_USER);
    expect(result.current.token).toBe(MOCK_TOKEN);
  });

  it('calls authService.login with the correct credentials', async () => {
    authService.login.mockResolvedValue({ user: MOCK_USER, token: MOCK_TOKEN });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.login('alice@test.com', 'mypassword');
    });

    expect(authService.login).toHaveBeenCalledWith('alice@test.com', 'mypassword');
  });

  it('propagates errors thrown by authService.login', async () => {
    authService.login.mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      act(async () => { await result.current.login('x@x.com', 'wrong'); })
    ).rejects.toThrow('Invalid credentials');
  });
});

// ── signup() ──────────────────────────────────────────────────────────────
describe('AuthContext — signup()', () => {
  it('updates user and token state on successful signup', async () => {
    authService.signup.mockResolvedValue({ user: MOCK_USER, token: MOCK_TOKEN });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signup({ fullName: 'Alice', email: 'alice@test.com', password: 'secret' });
    });

    expect(result.current.user).toEqual(MOCK_USER);
    expect(result.current.token).toBe(MOCK_TOKEN);
  });
});

// ── logout() ──────────────────────────────────────────────────────────────
describe('AuthContext — logout()', () => {
  it('clears user and token after logout', async () => {
    // Start logged in
    authService.getStoredUser.mockResolvedValue(MOCK_USER);
    authService.getToken.mockResolvedValue(MOCK_TOKEN);
    authService.logout.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.user).toEqual(MOCK_USER));

    await act(async () => { await result.current.logout(); });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('calls authService.logout', async () => {
    authService.logout.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => { await result.current.logout(); });

    expect(authService.logout).toHaveBeenCalledTimes(1);
  });
});

// ── updateUser() ──────────────────────────────────────────────────────────
describe('AuthContext — updateUser()', () => {
  it('replaces the user with the provided object', async () => {
    authService.getStoredUser.mockResolvedValue(MOCK_USER);
    authService.getToken.mockResolvedValue(MOCK_TOKEN);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.user).toEqual(MOCK_USER));

    // updateUser does a full replace (setUser(updatedUser)), so pass
    // the complete updated object rather than a partial patch.
    const updatedUser = { ...MOCK_USER, fullName: 'Alice Updated' };
    act(() => { result.current.updateUser(updatedUser); });

    expect(result.current.user.fullName).toBe('Alice Updated');
    expect(result.current.user.email).toBe(MOCK_USER.email);
  });
});

// ── useAuth outside provider ───────────────────────────────────────────────
describe('useAuth outside AuthProvider', () => {
  it('throws a descriptive error', () => {
    // Suppress React error boundary noise
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used inside AuthProvider'
    );
    spy.mockRestore();
  });
});
