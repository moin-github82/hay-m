/**
 * Tests for src/services/goalService.js
 */

jest.mock('../api', () => ({
  __esModule: true,
  default: {
    get:    jest.fn(),
    post:   jest.fn(),
    patch:  jest.fn(),
    delete: jest.fn(),
  },
}));

const api = require('../api').default;
const { goalService } = require('../goalService');

const GOAL_ID   = 'goal-abc';
const MOCK_GOAL = { _id: GOAL_ID, name: 'Holiday Fund', target: 1000, current: 250 };

beforeEach(() => { jest.clearAllMocks(); });

describe('goalService.getGoals()', () => {
  it('calls GET /goals', async () => {
    api.get.mockResolvedValue([MOCK_GOAL]);
    await goalService.getGoals();
    expect(api.get).toHaveBeenCalledWith('/goals');
  });

  it('returns the list of goals from the API', async () => {
    api.get.mockResolvedValue([MOCK_GOAL]);
    const result = await goalService.getGoals();
    expect(result).toEqual([MOCK_GOAL]);
  });
});

describe('goalService.createGoal()', () => {
  it('calls POST /goals with the goal payload', async () => {
    const payload = { name: 'Car Fund', target: 5000 };
    api.post.mockResolvedValue(MOCK_GOAL);
    await goalService.createGoal(payload);
    expect(api.post).toHaveBeenCalledWith('/goals', payload);
  });

  it('returns the created goal', async () => {
    api.post.mockResolvedValue(MOCK_GOAL);
    const result = await goalService.createGoal({ name: 'Car Fund', target: 5000 });
    expect(result).toEqual(MOCK_GOAL);
  });
});

describe('goalService.updateGoal()', () => {
  it('calls PATCH /goals/:id with updated data', async () => {
    const updates = { name: 'Renamed Fund' };
    api.patch.mockResolvedValue({ ...MOCK_GOAL, ...updates });
    await goalService.updateGoal(GOAL_ID, updates);
    expect(api.patch).toHaveBeenCalledWith(`/goals/${GOAL_ID}`, updates);
  });
});

describe('goalService.deleteGoal()', () => {
  it('calls DELETE /goals/:id', async () => {
    api.delete.mockResolvedValue({ success: true });
    await goalService.deleteGoal(GOAL_ID);
    expect(api.delete).toHaveBeenCalledWith(`/goals/${GOAL_ID}`);
  });
});

describe('goalService.addFunds()', () => {
  it('calls POST /goals/:id/funds with amount and source', async () => {
    api.post.mockResolvedValue({ goal: MOCK_GOAL, depositedAmount: 50 });
    await goalService.addFunds(GOAL_ID, 50, 'balance');
    expect(api.post).toHaveBeenCalledWith(`/goals/${GOAL_ID}/funds`, {
      amount: 50,
      source: 'balance',
    });
  });

  it('supports microsavings as the fund source', async () => {
    api.post.mockResolvedValue({ goal: MOCK_GOAL, depositedAmount: 25 });
    await goalService.addFunds(GOAL_ID, 25, 'microsavings');
    expect(api.post).toHaveBeenCalledWith(`/goals/${GOAL_ID}/funds`, {
      amount: 25,
      source: 'microsavings',
    });
  });

  it('propagates errors from the API', async () => {
    api.post.mockRejectedValue(new Error('Insufficient balance'));
    await expect(goalService.addFunds(GOAL_ID, 9999, 'balance')).rejects.toThrow('Insufficient balance');
  });
});
