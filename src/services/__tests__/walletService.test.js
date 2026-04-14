/**
 * Tests for src/services/walletService.js
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
const { walletService } = require('../walletService');

const CARD_ID   = 'card-xyz';
const MOCK_CARD = { _id: CARD_ID, bankName: 'Barclays', balance: 500, isDefault: true };

beforeEach(() => { jest.clearAllMocks(); });

describe('walletService.getCards()', () => {
  it('calls GET /wallet', async () => {
    api.get.mockResolvedValue([MOCK_CARD]);
    await walletService.getCards();
    expect(api.get).toHaveBeenCalledWith('/wallet');
  });

  it('returns the list of cards', async () => {
    api.get.mockResolvedValue([MOCK_CARD]);
    expect(await walletService.getCards()).toEqual([MOCK_CARD]);
  });
});

describe('walletService.addCard()', () => {
  it('calls POST /wallet with card data', async () => {
    const cardData = { cardNumber: '4111111111111111', bankName: 'HSBC', cardType: 'debit' };
    api.post.mockResolvedValue(MOCK_CARD);
    await walletService.addCard(cardData);
    expect(api.post).toHaveBeenCalledWith('/wallet', cardData);
  });
});

describe('walletService.setDefault()', () => {
  it('calls PATCH /wallet/:id/default', async () => {
    api.patch.mockResolvedValue({ ...MOCK_CARD, isDefault: true });
    await walletService.setDefault(CARD_ID);
    expect(api.patch).toHaveBeenCalledWith(`/wallet/${CARD_ID}/default`);
  });
});

describe('walletService.toggleFreeze()', () => {
  it('calls PATCH /wallet/:id/freeze', async () => {
    api.patch.mockResolvedValue({ ...MOCK_CARD, frozen: true });
    await walletService.toggleFreeze(CARD_ID);
    expect(api.patch).toHaveBeenCalledWith(`/wallet/${CARD_ID}/freeze`);
  });
});

describe('walletService.topUp()', () => {
  it('calls POST /wallet/:id/topup with the amount', async () => {
    api.post.mockResolvedValue({ ...MOCK_CARD, balance: 750 });
    await walletService.topUp(CARD_ID, 250);
    expect(api.post).toHaveBeenCalledWith(`/wallet/${CARD_ID}/topup`, { amount: 250 });
  });

  it('propagates errors when top-up fails', async () => {
    api.post.mockRejectedValue(new Error('Card not found'));
    await expect(walletService.topUp('bad-id', 100)).rejects.toThrow('Card not found');
  });
});

describe('walletService.deleteCard()', () => {
  it('calls DELETE /wallet/:id', async () => {
    api.delete.mockResolvedValue({ success: true });
    await walletService.deleteCard(CARD_ID);
    expect(api.delete).toHaveBeenCalledWith(`/wallet/${CARD_ID}`);
  });
});
