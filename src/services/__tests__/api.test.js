/**
 * Tests for src/services/api.js
 *
 * Strategy: mock axios.create so we can capture the config it receives
 * and intercept the interceptor functions to test them in isolation.
 */

// ── Capture interceptor callbacks before any module loads ──────────────
let requestInterceptorFn;
let responseSuccessFn;
let responseErrorFn;

const mockAxiosInstance = {
  interceptors: {
    request:  { use: jest.fn((fn)       => { requestInterceptorFn  = fn; }) },
    response: { use: jest.fn((ok, err)  => { responseSuccessFn = ok; responseErrorFn = err; }) },
  },
};

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => mockAxiosInstance),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

// Import AFTER mocks are in place
const axios = require('axios').default;
const AsyncStorage = require('@react-native-async-storage/async-storage');

describe('api.js — axios instance configuration', () => {
  beforeAll(() => {
    // Trigger module load which calls axios.create
    require('../api');
  });

  it('creates an axios instance with the correct baseURL', () => {
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: expect.stringContaining('5000/api'),
      })
    );
  });

  it('creates an axios instance with a 10 s timeout', () => {
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({ timeout: 10000 })
    );
  });

  it('creates an axios instance with JSON content-type header', () => {
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('registers a request interceptor', () => {
    expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
  });

  it('registers a response interceptor', () => {
    expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
  });
});

describe('api.js — request interceptor', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('attaches Authorization header when a token exists in AsyncStorage', async () => {
    AsyncStorage.getItem.mockResolvedValue('my-jwt-token');
    const config = { headers: {} };
    const result = await requestInterceptorFn(config);
    expect(result.headers.Authorization).toBe('Bearer my-jwt-token');
  });

  it('does NOT attach Authorization header when no token is stored', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    const config = { headers: {} };
    const result = await requestInterceptorFn(config);
    expect(result.headers.Authorization).toBeUndefined();
  });
});

describe('api.js — response interceptor', () => {
  it('returns response.data on a successful response', () => {
    const response = { data: { user: 'Alice', balance: 100 } };
    expect(responseSuccessFn(response)).toEqual(response.data);
  });

  it('rejects with an Error using the server message on API error', async () => {
    const error = { response: { data: { message: 'Unauthorised' } } };
    await expect(responseErrorFn(error)).rejects.toThrow('Unauthorised');
  });

  it('rejects with the axios error message when no server body', async () => {
    const error = { message: 'Network Error' };
    await expect(responseErrorFn(error)).rejects.toThrow('Network Error');
  });

  it('rejects with a fallback message when no message is available', async () => {
    await expect(responseErrorFn({})).rejects.toThrow('Something went wrong');
  });
});
