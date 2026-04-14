/**
 * Tests for src/services/authService.js
 */

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem:      jest.fn(),
  setItem:      jest.fn(),
  multiRemove:  jest.fn(),
}));

jest.mock('../api', () => ({
  __esModule: true,
  default: {
    get:    jest.fn(),
    post:   jest.fn(),
    patch:  jest.fn(),
    delete: jest.fn(),
  },
}));

const AsyncStorage  = require('@react-native-async-storage/async-storage');
const api           = require('../api').default;
const { authService } = require('../authService');

const TOKEN_KEY = 'haym_token';
const USER_KEY  = 'haym_user';

const MOCK_USER  = { _id: 'u1', fullName: 'Alice', email: 'alice@test.com' };
const MOCK_TOKEN = 'jwt-abc123';

beforeEach(() => { jest.clearAllMocks(); });

// ── signup ──────────────────────────────────────────────────────────────
describe('authService.signup()', () => {
  it('calls POST /auth/signup with the provided data', async () => {
    api.post.mockResolvedValue({ user: MOCK_USER, token: MOCK_TOKEN });
    await authService.signup({ fullName: 'Alice', email: 'alice@test.com', password: 'secret' });
    expect(api.post).toHaveBeenCalledWith('/auth/signup', {
      fullName: 'Alice', email: 'alice@test.com', password: 'secret',
    });
  });

  it('stores the token in AsyncStorage after signup', async () => {
    api.post.mockResolvedValue({ user: MOCK_USER, token: MOCK_TOKEN });
    await authService.signup({ fullName: 'Alice', email: 'alice@test.com', password: 'secret' });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(TOKEN_KEY, MOCK_TOKEN);
  });

  it('stores the serialised user in AsyncStorage after signup', async () => {
    api.post.mockResolvedValue({ user: MOCK_USER, token: MOCK_TOKEN });
    await authService.signup({ fullName: 'Alice', email: 'alice@test.com', password: 'secret' });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(USER_KEY, JSON.stringify(MOCK_USER));
  });

  it('returns the response data from the API', async () => {
    api.post.mockResolvedValue({ user: MOCK_USER, token: MOCK_TOKEN });
    const result = await authService.signup({ fullName: 'Alice', email: 'a@t.com', password: 'p' });
    expect(result).toEqual({ user: MOCK_USER, token: MOCK_TOKEN });
  });

  it('propagates API errors to the caller', async () => {
    api.post.mockRejectedValue(new Error('Email already taken'));
    await expect(authService.signup({})).rejects.toThrow('Email already taken');
  });
});

// ── login ───────────────────────────────────────────────────────────────
describe('authService.login()', () => {
  it('calls POST /auth/login with email and password', async () => {
    api.post.mockResolvedValue({ user: MOCK_USER, token: MOCK_TOKEN });
    await authService.login('alice@test.com', 'secret');
    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'alice@test.com', password: 'secret',
    });
  });

  it('persists token and user to AsyncStorage on success', async () => {
    api.post.mockResolvedValue({ user: MOCK_USER, token: MOCK_TOKEN });
    await authService.login('alice@test.com', 'secret');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(TOKEN_KEY, MOCK_TOKEN);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(USER_KEY, JSON.stringify(MOCK_USER));
  });

  it('propagates 401 errors to the caller', async () => {
    api.post.mockRejectedValue(new Error('Invalid credentials'));
    await expect(authService.login('x@x.com', 'wrong')).rejects.toThrow('Invalid credentials');
  });
});

// ── logout ──────────────────────────────────────────────────────────────
describe('authService.logout()', () => {
  it('removes both token and user keys from AsyncStorage', async () => {
    AsyncStorage.multiRemove.mockResolvedValue(undefined);
    await authService.logout();
    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([TOKEN_KEY, USER_KEY]);
  });
});

// ── getStoredUser ────────────────────────────────────────────────────────
describe('authService.getStoredUser()', () => {
  it('returns the parsed user object when one is stored', async () => {
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(MOCK_USER));
    const result = await authService.getStoredUser();
    expect(result).toEqual(MOCK_USER);
  });

  it('returns null when no user is stored', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    const result = await authService.getStoredUser();
    expect(result).toBeNull();
  });
});

// ── getToken ─────────────────────────────────────────────────────────────
describe('authService.getToken()', () => {
  it('returns the stored token string', async () => {
    AsyncStorage.getItem.mockResolvedValue(MOCK_TOKEN);
    const result = await authService.getToken();
    expect(result).toBe(MOCK_TOKEN);
  });

  it('returns null when no token is stored', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    expect(await authService.getToken()).toBeNull();
  });
});

// ── isLoggedIn ────────────────────────────────────────────────────────────
describe('authService.isLoggedIn()', () => {
  it('returns true when a token exists', async () => {
    AsyncStorage.getItem.mockResolvedValue(MOCK_TOKEN);
    expect(await authService.isLoggedIn()).toBe(true);
  });

  it('returns false when no token exists', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    expect(await authService.isLoggedIn()).toBe(false);
  });
});
