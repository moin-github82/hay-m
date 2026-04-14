/**
 * Tests for src/services/transactionService.js
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('../api', () => ({
  __esModule: true,
  default: {
    get:  jest.fn(),
    post: jest.fn(),
  },
}));

import api from '../api';
import { transactionService } from '../transactionService';

beforeEach(() => jest.clearAllMocks());

describe('transactionService.getTransactions()', () => {
  it('calls GET /transactions with no params by default', async () => {
    const txList = [{ _id: 't1', amount: 50 }];
    api.get.mockResolvedValue(txList);
    const result = await transactionService.getTransactions();
    expect(api.get).toHaveBeenCalledWith('/transactions', { params: {} });
    expect(result).toEqual(txList);
  });

  it('passes params to GET /transactions', async () => {
    api.get.mockResolvedValue([]);
    await transactionService.getTransactions({ page: 2, limit: 10 });
    expect(api.get).toHaveBeenCalledWith('/transactions', { params: { page: 2, limit: 10 } });
  });

  it('propagates errors', async () => {
    api.get.mockRejectedValue(new Error('Fetch failed'));
    await expect(transactionService.getTransactions()).rejects.toThrow('Fetch failed');
  });
});

describe('transactionService.sendMoney()', () => {
  it('calls POST /transactions/send with data', async () => {
    const data = { recipientEmail: 'bob@test.com', amount: 25, note: 'Lunch' };
    api.post.mockResolvedValue({ _id: 't99', ...data });
    const result = await transactionService.sendMoney(data);
    expect(api.post).toHaveBeenCalledWith('/transactions/send', data);
    expect(result._id).toBe('t99');
  });

  it('propagates errors', async () => {
    api.post.mockRejectedValue(new Error('Transfer failed'));
    await expect(transactionService.sendMoney({})).rejects.toThrow('Transfer failed');
  });
});
