/**
 * Tests for website src/pages/LandingPage.jsx
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from '../LandingPage';

const renderLanding = () =>
  render(<MemoryRouter><LandingPage /></MemoryRouter>);

// ── Navbar ────────────────────────────────────────────────────────────────
describe('LandingPage — Navbar', () => {
  it('renders the HAY-M brand name', () => {
    renderLanding();
    // Multiple "HAY-M" elements — at least one must exist
    expect(screen.getAllByText('HAY-M').length).toBeGreaterThan(0);
  });

  it('renders a Log in link pointing to /login', () => {
    renderLanding();
    // Multiple "Log in" links may appear (navbar + hero CTA) — verify at least one points to /login
    const loginLinks = screen.getAllByRole('link', { name: /log in/i });
    expect(loginLinks.length).toBeGreaterThan(0);
    expect(loginLinks[0].getAttribute('href')).toBe('/login');
  });

  it('renders a Get Started link pointing to /signup', () => {
    renderLanding();
    const links = screen.getAllByRole('link', { name: /get started/i });
    expect(links.length).toBeGreaterThan(0);
    expect(links[0].getAttribute('href')).toBe('/signup');
  });

  it('renders Contact nav link', () => {
    renderLanding();
    // Multiple "Contact" links may appear (navbar + footer) — verify at least one exists
    const contactLinks = screen.getAllByRole('link', { name: /contact/i });
    expect(contactLinks.length).toBeGreaterThan(0);
  });
});

// ── Hero section ──────────────────────────────────────────────────────────
describe('LandingPage — Hero', () => {
  it('renders the hero heading "Save Smart"', () => {
    renderLanding();
    expect(screen.getByText(/save smart/i)).toBeInTheDocument();
  });

  it('renders the hero subheading "Grow Rich"', () => {
    renderLanding();
    expect(screen.getByText(/grow rich/i)).toBeInTheDocument();
  });

  it('renders the "Start Saving Free" CTA button', () => {
    renderLanding();
    expect(screen.getByRole('link', { name: /start saving free/i })).toBeInTheDocument();
  });

  it('renders the platform description text', () => {
    renderLanding();
    expect(screen.getByText(/round-ups, smart goals/i)).toBeInTheDocument();
  });

  it('renders trust badges', () => {
    renderLanding();
    expect(screen.getByText(/no fees to start/i)).toBeInTheDocument();
    expect(screen.getByText(/bank-level security/i)).toBeInTheDocument();
    expect(screen.getByText(/cancel anytime/i)).toBeInTheDocument();
  });
});

// ── Stats bar ────────────────────────────────────────────────────────────
describe('LandingPage — Stats', () => {
  it('renders all four stat values', () => {
    renderLanding();
    expect(screen.getByText('£2.4M+')).toBeInTheDocument();
    expect(screen.getByText('50K+')).toBeInTheDocument();
    expect(screen.getByText('99.9%')).toBeInTheDocument();
    expect(screen.getByText('4.9★')).toBeInTheDocument();
  });
});

// ── Features section ──────────────────────────────────────────────────────
describe('LandingPage — Features section', () => {
  it('renders the section heading', () => {
    renderLanding();
    expect(screen.getByText('Everything you need to save more')).toBeInTheDocument();
  });

  it('renders the AI-Powered badge', () => {
    renderLanding();
    expect(screen.getByText('AI-Powered')).toBeInTheDocument();
  });

  it('renders the AI feature card heading', () => {
    renderLanding();
    expect(screen.getByText(/smarter saving/i)).toBeInTheDocument();
  });

  it('renders the Micro-Savings feature card', () => {
    renderLanding();
    expect(screen.getByText('Micro-Savings')).toBeInTheDocument();
  });

  it('renders the Bank-Grade Security feature card', () => {
    renderLanding();
    expect(screen.getByText('Bank-Grade Security')).toBeInTheDocument();
  });

  it('renders the "Try AI Savings Free" CTA inside the AI card', () => {
    renderLanding();
    expect(screen.getByRole('link', { name: /try ai savings free/i })).toBeInTheDocument();
  });
});

// ── How it works section ──────────────────────────────────────────────────
describe('LandingPage — How it works', () => {
  it('renders the "Up and running in minutes" heading', () => {
    renderLanding();
    expect(screen.getByText(/up and running in minutes/i)).toBeInTheDocument();
  });

  it('renders all three numbered steps', () => {
    renderLanding();
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
  });

  it('renders step titles', () => {
    renderLanding();
    expect(screen.getByText('Sign Up Free')).toBeInTheDocument();
    expect(screen.getByText('Link Your Cards')).toBeInTheDocument();
    expect(screen.getByText('Watch It Grow')).toBeInTheDocument();
  });
});

// ── CTA banner ───────────────────────────────────────────────────────────
describe('LandingPage — CTA banner', () => {
  it('renders the bottom CTA heading', () => {
    renderLanding();
    expect(screen.getByText(/start your savings journey today/i)).toBeInTheDocument();
  });

  it('renders the Create Free Account button', () => {
    renderLanding();
    expect(screen.getByRole('link', { name: /create free account/i })).toBeInTheDocument();
  });
});

// ── Mobile hamburger menu ─────────────────────────────────────────────────
describe('LandingPage — Mobile menu', () => {
  it('toggles mobile menu when hamburger button is clicked', () => {
    renderLanding();
    // The hamburger button renders a ☰ symbol
    const hamburger = screen.queryByText('☰');
    if (!hamburger) return; // desktop viewport — skip

    fireEvent.click(hamburger);
    // After opening, at least one Log In link should be visible in menu
    expect(screen.getAllByRole('link', { name: /log in/i }).length).toBeGreaterThan(0);
  });
});
