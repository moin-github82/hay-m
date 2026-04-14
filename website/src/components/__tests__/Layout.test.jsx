/**
 * Tests for website src/components/Layout.jsx
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Layout from '../Layout';

// ── Mocks ─────────────────────────────────────────────────────────────────
const mockLogout   = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const MOCK_USER = { fullName: 'Alice Smith', email: 'alice@test.com' };

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: MOCK_USER, logout: mockLogout }),
}));

// Render Layout inside a MemoryRouter so NavLink works
const renderLayout = (initialPath = '/dashboard') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<div>Home</div>} />
          <Route path="dashboard"    element={<div>Dashboard Page</div>} />
          <Route path="wallet"       element={<div>Wallet Page</div>} />
          <Route path="goals"        element={<div>Goals Page</div>} />
          <Route path="savings"      element={<div>Savings Page</div>} />
          <Route path="portfolio"    element={<div>Portfolio Page</div>} />
          <Route path="transactions" element={<div>Transactions Page</div>} />
          <Route path="contact"      element={<div>Contact Page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
  // jsdom defaults window.innerWidth to 1024, which triggers the tablet-collapse
  // branch (≤ 1024 && > 767) in Layout's resize useEffect → sidebarOpen = false.
  // Force a desktop width so the sidebar stays expanded and text labels render.
  Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true, configurable: true });
});

// ── Sidebar rendering ─────────────────────────────────────────────────────
describe('Layout — sidebar', () => {
  it('renders the HAY-M logo', () => {
    renderLayout();
    expect(screen.getAllByText('HAY-M').length).toBeGreaterThan(0);
  });

  it('renders the Dashboard nav link', () => {
    renderLayout();
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
  });

  it('renders the Wallet nav link', () => {
    renderLayout();
    expect(screen.getByRole('link', { name: /wallet/i })).toBeInTheDocument();
  });

  it('renders the Goals nav link', () => {
    renderLayout();
    // Allow "Savings Goals" or "Goals"
    const links = screen.getAllByRole('link');
    const goalsLink = links.find(l => l.textContent.match(/goals/i));
    expect(goalsLink).toBeTruthy();
  });

  it('renders the Portfolio nav link', () => {
    renderLayout();
    expect(screen.getByRole('link', { name: /portfolio/i })).toBeInTheDocument();
  });

  it('renders the Transactions nav link', () => {
    renderLayout();
    expect(screen.getByRole('link', { name: /transactions/i })).toBeInTheDocument();
  });

  it('renders the Contact Us nav link', () => {
    renderLayout();
    expect(screen.getByRole('link', { name: /contact us/i })).toBeInTheDocument();
  });
});

// ── User info ─────────────────────────────────────────────────────────────
describe('Layout — user info', () => {
  it('renders the logged-in user full name', () => {
    renderLayout();
    // Name appears in sidebar and/or header
    expect(screen.getAllByText('Alice Smith').length).toBeGreaterThan(0);
  });

  it('renders the logged-in user email', () => {
    renderLayout();
    expect(screen.getAllByText('alice@test.com').length).toBeGreaterThan(0);
  });

  it('renders the user initials avatar', () => {
    renderLayout();
    // "Alice Smith" → initials "AS"
    expect(screen.getAllByText('AS').length).toBeGreaterThan(0);
  });
});

// ── Sign Out ──────────────────────────────────────────────────────────────
describe('Layout — sign out', () => {
  it('renders the Sign Out button', () => {
    renderLayout();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('calls logout() and navigates to / when Sign Out is clicked', async () => {
    renderLayout();
    fireEvent.click(screen.getByText('Sign Out'));
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});

// ── Outlet / page content ─────────────────────────────────────────────────
describe('Layout — page content', () => {
  it('renders the child route content via Outlet', () => {
    renderLayout('/dashboard');
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });
});

// ── Sidebar toggle ────────────────────────────────────────────────────────
describe('Layout — sidebar toggle (desktop)', () => {
  it('renders the collapse toggle button', () => {
    renderLayout();
    // The toggle button renders ◀ or ▶ or ☰
    const toggleBtn = screen.queryByText('◀') || screen.queryByText('▶') || screen.queryByText('☰');
    expect(toggleBtn).not.toBeNull();
  });
});

// ── Notification bell ─────────────────────────────────────────────────────
describe('Layout — notification bell', () => {
  it('renders the notification bell button', () => {
    renderLayout();
    expect(screen.getByText('🔔')).toBeInTheDocument();
  });
});
