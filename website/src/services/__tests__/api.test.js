/**
 * Tests for website src/services/api.js
 *
 * Vitest/ESM note: vi.mock() calls are hoisted to the top of the file by
 * Vitest before any variable declarations. To reference a variable inside
 * a vi.mock() factory we must declare it with vi.hoisted() which also runs
 * before the mock factory executes.
 */
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

// ── Declare mock objects with vi.hoisted so they exist before vi.mock runs ─
const { mockAxiosInstance } = vi.hoisted(() => {
  const instance = {
    interceptors: {
      request:  { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return { mockAxiosInstance: instance };
});

vi.mock('axios', () => ({
  default: { create: vi.fn(() => mockAxiosInstance) },
}));

// ── Mock localStorage ─────────────────────────────────────────────────────
const store = {};
const localStorageMock = {
  getItem:    vi.fn((k)    => store[k] ?? null),
  setItem:    vi.fn((k, v) => { store[k] = String(v); }),
  removeItem: vi.fn((k)    => { delete store[k]; }),
  clear:      vi.fn(()     => { Object.keys(store).forEach(k => delete store[k]); }),
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

// ── Import helpers AFTER mocks are in place ────────────────────────────────
import { saveSession, clearSession, getStoredUser, getToken } from '../api';

const TOKEN_KEY  = 'haym_web_token';
const USER_KEY   = 'haym_web_user';
const MOCK_USER  = { _id: 'u1', fullName: 'Bob', email: 'bob@test.com' };
const MOCK_TOKEN = 'jwt-xyz';

// Extract the interceptor functions after the module has loaded
let requestInterceptorFn;
let responseSuccessFn;
let responseErrorFn;

beforeAll(() => {
  const [[reqFn]]       = mockAxiosInstance.interceptors.request.use.mock.calls;
  const [[resFn, errFn]] = mockAxiosInstance.interceptors.response.use.mock.calls;
  requestInterceptorFn  = reqFn;
  responseSuccessFn     = resFn;
  responseErrorFn       = errFn;
});

beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
});

// ── axios instance ────────────────────────────────────────────────────────
// Interceptor registration is proven implicitly: if they weren't registered,
// requestInterceptorFn / responseSuccessFn / responseErrorFn would be
// undefined and every test below would throw, so no extra assertions needed.
describe('api.js — axios instance', () => {
  it('interceptor functions are callable (proves registration succeeded)', () => {
    expect(typeof requestInterceptorFn).toBe('function');
    expect(typeof responseSuccessFn).toBe('function');
    expect(typeof responseErrorFn).toBe('function');
  });
});

// ── request interceptor ───────────────────────────────────────────────────
describe('api.js — request interceptor', () => {
  it('attaches Authorization header when a token exists in localStorage', () => {
    localStorageMock.getItem.mockReturnValue(MOCK_TOKEN);
    const config = { headers: {} };
    const result = requestInterceptorFn(config);
    expect(result.headers.Authorization).toBe(`Bearer ${MOCK_TOKEN}`);
  });

  it('does NOT attach Authorization header when no token is stored', () => {
    localStorageMock.getItem.mockReturnValue(null);
    const config = { headers: {} };
    const result = requestInterceptorFn(config);
    expect(result.headers.Authorization).toBeUndefined();
  });
});

// ── response interceptor ──────────────────────────────────────────────────
describe('api.js — response interceptor', () => {
  it('unwraps response.data on success', () => {
    const response = { data: { user: 'Bob', token: MOCK_TOKEN } };
    expect(responseSuccessFn(response)).toEqual(response.data);
  });

  it('rejects with server error message', async () => {
    const error = { response: { data: { message: 'Unauthorised' } } };
    await expect(responseErrorFn(error)).rejects.toThrow('Unauthorised');
  });

  it('falls back to error.message when no server body', async () => {
    const error = { message: 'Network Error' };
    await expect(responseErrorFn(error)).rejects.toThrow('Network Error');
  });

  it('uses a fallback string when nothing is available', async () => {
    await expect(responseErrorFn({})).rejects.toThrow('Something went wrong');
  });
});

// ── saveSession ───────────────────────────────────────────────────────────
describe('saveSession()', () => {
  it('writes token to localStorage', () => {
    saveSession(MOCK_TOKEN, MOCK_USER);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(TOKEN_KEY, MOCK_TOKEN);
  });

  it('writes serialised user to localStorage', () => {
    saveSession(MOCK_TOKEN, MOCK_USER);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(USER_KEY, JSON.stringify(MOCK_USER));
  });
});

// ── clearSession ──────────────────────────────────────────────────────────
describe('clearSession()', () => {
  it('removes token from localStorage', () => {
    clearSession();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(TOKEN_KEY);
  });

  it('removes user from localStorage', () => {
    clearSession();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(USER_KEY);
  });
});

// ── getStoredUser ─────────────────────────────────────────────────────────
describe('getStoredUser()', () => {
  it('returns parsed user when one is stored', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(MOCK_USER));
    expect(getStoredUser()).toEqual(MOCK_USER);
  });

  it('returns null when nothing is stored', () => {
    localStorageMock.getItem.mockReturnValue(null);
    expect(getStoredUser()).toBeNull();
  });

  it('returns null when stored value is invalid JSON', () => {
    localStorageMock.getItem.mockReturnValue('not-json{{{');
    expect(getStoredUser()).toBeNull();
  });
});

// ── getToken ──────────────────────────────────────────────────────────────
describe('getToken()', () => {
  it('returns the stored token string', () => {
    localStorageMock.getItem.mockReturnValue(MOCK_TOKEN);
    expect(getToken()).toBe(MOCK_TOKEN);
  });

  it('returns null when no token is stored', () => {
    localStorageMock.getItem.mockReturnValue(null);
    expect(getToken()).toBeNull();
  });
});
