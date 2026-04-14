import api from './api';

export const goalService = {
  async getGoals()                { return api.get('/goals'); },
  async createGoal(data)          { return api.post('/goals', data); },
  async updateGoal(id, data)      { return api.patch(`/goals/${id}`, data); },
  async deleteGoal(id)            { return api.delete(`/goals/${id}`); },
  async addFunds(id, amount, source) { return api.post(`/goals/${id}/funds`, { amount, source }); },
};
