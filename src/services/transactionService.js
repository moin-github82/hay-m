import api from './api';

export const transactionService = {
  async getTransactions(params = {}) {
    return api.get('/transactions', { params });
  },

  async sendMoney(data) {
    // data: { recipientEmail, amount, note, cardId? }
    return api.post('/transactions/send', data);
  },
};
