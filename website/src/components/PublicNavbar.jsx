import React from 'react';
import { Link } from 'react-router-dom';
import HaymLogo from './HaymLogo';
import { useAuth } from '../context/AuthContext';

/**
 * Shared navbar for public (standalone) pages — Contact, Fees, Privacy, Terms, Survey.
 * Shows a "Go to Dashboard" button when the user is already logged in,
 * and Login / Sign-up buttons when they are not.
 */
export default function PublicNavbar() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(' ')[0] || 'Dashboard';

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(10,22,40,.97)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,.07)',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '0 24px',
        height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to={user ? '/dashboard' : '/'} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <HaymLogo size={36} />
          <span style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: -0.5 }}>HAY-M</span>
        </Link>

        {/* Auth-aware right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            /* ── Logged in: show avatar + dashboard link ── */
            <>
              <span style={{ color: 'rgba(255,255,255,.55)', fontSize: 14 }}>
                Hi, <strong style={{ color: '#fff' }}>{firstName}</strong>
              </span>
              <Link
                to="/dashboard"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'linear-gradient(135deg,#00D4A1,#00A87F)',
                  color: '#fff', textDecoration: 'none',
                  fontSize: 14, fontWeight: 700,
                  padding: '8px 18px', borderRadius: 12,
                  boxShadow: '0 4px 14px rgba(0,212,161,.3)',
                }}
              >
                ← Dashboard
              </Link>
            </>
          ) : (
            /* ── Logged out: show login + sign-up ── */
            <>
              <Link
                to="/login"
                style={{
                  color: 'rgba(255,255,255,.7)', textDecoration: 'none',
                  fontSize: 14, fontWeight: 600, padding: '8px 16px',
                }}
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="btn btn-primary"
                style={{ borderRadius: 12, height: 40, padding: '0 20px', display: 'flex', alignItems: 'center', fontSize: 14 }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
