import api from './api';

export const portfolioService = {
  async getPortfolio()              { return api.get('/portfolio'); },
  async addHolding(data)            { return api.post('/portfolio/holdings', data); },
  async updatePrices(prices)        { return api.patch('/portfolio/prices', { prices }); },
  async removeHolding(holdingId)    { return api.delete(`/portfolio/holdings/${holdingId}`); },
};
