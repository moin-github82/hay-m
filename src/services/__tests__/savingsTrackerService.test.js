/**
 * Tests for src/services/savingsTrackerService.js
 */

jest.mock('../api', () => ({
  __esModule: true,
  default: {
    get:   jest.fn(),
    post:  jest.fn(),
    patch: jest.fn(),
  },
}));

const api = require('../api').default;
const { savingsTrackerService } = require('../savingsTrackerService');

const MOCK_TRACKER = {
  totalSaved: 142.50,
  todaySaved:   3.20,
  monthSaved:  28.00,
  dailyLimit:   5.00,
  monthlyLimit: 100.00,
};

beforeEach(() => { jest.clearAllMocks(); });

describe('savingsTrackerService.getTracker()', () => {
  it('calls GET /savings-tracker', async () => {
    api.get.mockResolvedValue(MOCK_TRACKER);
    await savingsTrackerService.getTracker();
    expect(api.get).toHaveBeenCalledWith('/savings-tracker');
  });

  it('returns the tracker data', async () => {
    api.get.mockResolvedValue(MOCK_TRACKER);
    expect(await savingsTrackerService.getTracker()).toEqual(MOCK_TRACKER);
  });
});

describe('savingsTrackerService.updateLimits()', () => {
  it('calls PATCH /savings-tracker/limits with daily and monthly limits', async () => {
    api.patch.mockResolvedValue({ ...MOCK_TRACKER, dailyLimit: 10, monthlyLimit: 200 });
    await savingsTrackerService.updateLimits(10, 200);
    expect(api.patch).toHaveBeenCalledWith('/savings-tracker/limits', {
      dailyLimit: 10,
      monthlyLimit: 200,
    });
  });
});

describe('savingsTrackerService.addSurplus()', () => {
  it('calls POST /savings-tracker/surplus with amount and note', async () => {
    api.post.mockResolvedValue({ saved: 5 });
    await savingsTrackerService.addSurplus(5, 'Coffee change');
    expect(api.post).toHaveBeenCalledWith('/savings-tracker/surplus', {
      amount: 5,
      note: 'Coffee change',
    });
  });

  it('works without a note', async () => {
    api.post.mockResolvedValue({ saved: 2 });
    await savingsTrackerService.addSurplus(2, undefined);
    expect(api.post).toHaveBeenCalledWith('/savings-tracker/surplus', {
      amount: 2,
      note: undefined,
    });
  });
});

describe('savingsTrackerService.addRoundUp()', () => {
  it('calls POST /savings-tracker/roundup with the provided data', async () => {
    const roundUpData = { transactionId: 'tx1', amount: 0.60 };
    api.post.mockResolvedValue({ saved: 0.60 });
    await savingsTrackerService.addRoundUp(roundUpData);
    expect(api.post).toHaveBeenCalledWith('/savings-tracker/roundup', roundUpData);
  });

  it('propagates API errors', async () => {
    api.post.mockRejectedValue(new Error('Daily limit reached'));
    await expect(savingsTrackerService.addRoundUp({})).rejects.toThrow('Daily limit reached');
  });
});
