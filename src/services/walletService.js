import api from './api';

export const walletService = {
  async getCards()             { return api.get('/wallet'); },
  async addCard(data)          { return api.post('/wallet', data); },
  async setDefault(id)         { return api.patch(`/wallet/${id}/default`); },
  async toggleFreeze(id)       { return api.patch(`/wallet/${id}/freeze`); },
  async topUp(id, amount)      { return api.post(`/wallet/${id}/topup`, { amount }); },
  async deleteCard(id)         { return api.delete(`/wallet/${id}`); },
};
