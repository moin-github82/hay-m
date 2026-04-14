/**
 * Tests for src/services/dashboardService.js
 */

jest.mock('../api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const api = require('../api').default;
const { dashboardService } = require('../dashboardService');

const MOCK_DASHBOARD = {
  user:         { fullName: 'Alice' },
  totalBalance: 24580,
  totalSaved:   4230,
  portfolioValue: 18400,
  recentTransactions: [],
  goals: [],
};

beforeEach(() => { jest.clearAllMocks(); });

describe('dashboardService.getDashboard()', () => {
  it('calls GET /dashboard', async () => {
    api.get.mockResolvedValue(MOCK_DASHBOARD);
    await dashboardService.getDashboard();
    expect(api.get).toHaveBeenCalledWith('/dashboard');
  });

  it('returns the full dashboard payload', async () => {
    api.get.mockResolvedValue(MOCK_DASHBOARD);
    const result = await dashboardService.getDashboard();
    expect(result).toEqual(MOCK_DASHBOARD);
  });

  it('propagates network errors to the caller', async () => {
    api.get.mockRejectedValue(new Error('Network Error'));
    await expect(dashboardService.getDashboard()).rejects.toThrow('Network Error');
  });
});
