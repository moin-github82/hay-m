import api from './api';

export const savingsTrackerService = {
  getTracker()                        { return api.get('/savings-tracker'); },
  updateLimits(dailyLimit, monthlyLimit) { return api.patch('/savings-tracker/limits', { dailyLimit, monthlyLimit }); },
  addSurplus(amount, note)            { return api.post('/savings-tracker/surplus', { amount, note }); },
  addRoundUp(data)                    { return api.post('/savings-tracker/roundup', data); },
};
