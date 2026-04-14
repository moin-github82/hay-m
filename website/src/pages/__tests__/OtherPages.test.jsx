/**
 * Smoke tests for the remaining website pages:
 * DashboardPage, WalletPage, GoalsPage, PortfolioPage,
 * SavingsTrackerPage, TransactionsPage, ContactPage
 *
 * Each test simply verifies the page renders without crashing.
 * Data-fetching effects are silenced by mocking the api module.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ── Mock api ──────────────────────────────────────────────────────────────
vi.mock('../../services/api', () => ({
  default: {
    get:    vi.fn(() => Promise.resolve([])),
    post:   vi.fn(() => Promise.resolve({})),
    patch:  vi.fn(() => Promise.resolve({})),
    delete: vi.fn(() => Promise.resolve({})),
  },
  saveSession:    vi.fn(),
  clearSession:   vi.fn(),
  getStoredUser:  vi.fn(() => null),
}));

// ── Mock AuthContext ───────────────────────────────────────────────────────
const MOCK_USER = { _id: 'u1', fullName: 'Test User', email: 'test@test.com' };
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: MOCK_USER, token: 'tok', loading: false }),
}));

// ── Page imports ──────────────────────────────────────────────────────────
import DashboardPage      from '../DashboardPage';
import WalletPage         from '../WalletPage';
import GoalsPage          from '../GoalsPage';
import PortfolioPage      from '../PortfolioPage';
import SavingsTrackerPage from '../SavingsTrackerPage';
import TransactionsPage   from '../TransactionsPage';
import ContactPage        from '../ContactPage';

const wrap = (Component) =>
  render(
    <MemoryRouter>
      <Component />
    </MemoryRouter>
  );

beforeEach(() => vi.clearAllMocks());

// ── DashboardPage ─────────────────────────────────────────────────────────
describe('DashboardPage', () => {
  it('renders without crashing', () => {
    const { container } = wrap(DashboardPage);
    expect(container).toBeTruthy();
  });
});

// ── WalletPage ────────────────────────────────────────────────────────────
describe('WalletPage', () => {
  it('renders without crashing', () => {
    const { container } = wrap(WalletPage);
    expect(container).toBeTruthy();
  });
});

// ── GoalsPage ─────────────────────────────────────────────────────────────
describe('GoalsPage', () => {
  it('renders without crashing', () => {
    const { container } = wrap(GoalsPage);
    expect(container).toBeTruthy();
  });
});

// ── PortfolioPage ─────────────────────────────────────────────────────────
describe('PortfolioPage', () => {
  it('renders without crashing', () => {
    const { container } = wrap(PortfolioPage);
    expect(container).toBeTruthy();
  });
});

// ── SavingsTrackerPage ────────────────────────────────────────────────────
describe('SavingsTrackerPage', () => {
  it('renders without crashing', () => {
    const { container } = wrap(SavingsTrackerPage);
    expect(container).toBeTruthy();
  });
});

// ── TransactionsPage ──────────────────────────────────────────────────────
describe('TransactionsPage', () => {
  it('renders without crashing', () => {
    const { container } = wrap(TransactionsPage);
    expect(container).toBeTruthy();
  });
});

// ── ContactPage ───────────────────────────────────────────────────────────
describe('ContactPage', () => {
  it('renders without crashing', () => {
    const { container } = wrap(ContactPage);
    expect(container).toBeTruthy();
  });

  it('displays contact support options', () => {
    wrap(ContactPage);
    // Contact page always renders static content — look for the heading
    expect(screen.getByRole('heading', { name: /live chat/i })).toBeInTheDocument();
  });
});
