/**
 * Tests for src/services/portfolioService.js
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('../api', () => ({
  __esModule: true,
  default: {
    get:    jest.fn(),
    post:   jest.fn(),
    patch:  jest.fn(),
    delete: jest.fn(),
  },
}));

import api from '../api';
import { portfolioService } from '../portfolioService';

beforeEach(() => jest.clearAllMocks());

describe('portfolioService.getPortfolio()', () => {
  it('calls GET /portfolio and returns data', async () => {
    const holdings = [{ symbol: 'BTC', qty: 0.5 }];
    api.get.mockResolvedValue(holdings);
    const result = await portfolioService.getPortfolio();
    expect(api.get).toHaveBeenCalledWith('/portfolio');
    expect(result).toEqual(holdings);
  });

  it('propagates errors', async () => {
    api.get.mockRejectedValue(new Error('Server error'));
    await expect(portfolioService.getPortfolio()).rejects.toThrow('Server error');
  });
});

describe('portfolioService.addHolding()', () => {
  it('calls POST /portfolio/holdings with data', async () => {
    const holding = { symbol: 'ETH', qty: 2, price: 3000 };
    api.post.mockResolvedValue({ ...holding, _id: 'h1' });
    const result = await portfolioService.addHolding(holding);
    expect(api.post).toHaveBeenCalledWith('/portfolio/holdings', holding);
    expect(result._id).toBe('h1');
  });
});

describe('portfolioService.updatePrices()', () => {
  it('calls PATCH /portfolio/prices with prices array', async () => {
    const prices = [{ symbol: 'BTC', price: 60000 }];
    api.patch.mockResolvedValue({ updated: true });
    await portfolioService.updatePrices(prices);
    expect(api.patch).toHaveBeenCalledWith('/portfolio/prices', { prices });
  });
});

describe('portfolioService.removeHolding()', () => {
  it('calls DELETE /portfolio/holdings/:id', async () => {
    api.delete.mockResolvedValue({ deleted: true });
    await portfolioService.removeHolding('h42');
    expect(api.delete).toHaveBeenCalledWith('/portfolio/holdings/h42');
  });
});
