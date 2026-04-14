import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ISA_ALLOWANCE = 20000;

function ProgressRing({ pct, color, size = 160 }) {
  const r    = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(pct, 100) / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={12} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={12}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray .6s ease' }} />
    </svg>
  );
}

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div style={{
      position: 'fixed', bottom: 32, right: 32, zIndex: 9999,
      background: '#0A1628', color: '#fff', padding: '14px 24px',
      borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,.3)',
      display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600,
    }}>
      <span style={{ fontSize: 20 }}>🏦</span>
      {message}
    </div>
  );
}

export default function ISAPage() {
  const [totalSaved, setTotalSaved] = useState(0);
  const [loading, setLoading]       = useState(true);
  const [investAmt, setInvestAmt]   = useState(5000);
  const [toast, setToast]           = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/savings-tracker');
        setTotalSaved(Number(res.data?.totalSaved ?? 0));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div className="spinner" />
    </div>
  );

  const usedAmt      = Math.min(totalSaved, ISA_ALLOWANCE);
  const remaining    = ISA_ALLOWANCE - usedAmt;
  const usedPct      = (usedAmt / ISA_ALLOWANCE) * 100;
  const taxSaved     = investAmt * 0.20;
  const fiveYear     = investAmt * Math.pow(1.07, 5);

  const ISA_PRODUCTS = [
    {
      icon: '🏦',
      name: 'Cash ISA',
      rate: '4.5% AER',
      rateLabel: 'Annual Equivalent Rate',
      badge: 'Most Popular',
      badgeColor: '#00D4A1',
      borderColor: '#00D4A1',
      bullets: [
        '✓ FSCS protected up to £85,000',
        '✓ Instant access — withdraw anytime',
        '✓ Zero risk to your capital',
      ],
      bg: 'rgba(0,212,161,.04)',
    },
    {
      icon: '📈',
      name: 'Stocks & Shares ISA',
      rate: '7–12%',
      rateLabel: 'Potential annual return',
      badge: 'Best Returns',
      badgeColor: '#3B82F6',
      borderColor: '#3B82F6',
      bullets: [
        '✓ Long-term wealth growth',
        '✓ Diversified global funds',
        '⚠ Capital at risk — value may fall',
      ],
      bg: 'rgba(59,130,246,.04)',
    },
  ];

  const ISA_RULES = [
    { icon: '📅', title: 'Annual allowance resets in April', desc: 'Each tax year you get a fresh £20,000 allowance. Unused allowance cannot be carried forward.' },
    { icon: '🚫', title: "Can't exceed £20k across all ISAs",  desc: 'Your total subscriptions across all ISA types in a tax year must not exceed £20,000.' },
    { icon: '↩️', title: "Withdrawals don't restore allowance", desc: 'Unlike a LISA or Lifetime ISA, cash ISA withdrawals do not replenish your annual allowance.' },
  ];

  return (
    <div>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0A1628' }}>ISA & Tax-Efficient Accounts</h1>
        <p style={{ color: '#64748B', fontSize: 14, marginTop: 2 }}>Save and invest up to £20,000 per year — completely tax-free</p>
      </div>

      {/* Annual allowance hero */}
      <div style={{ background: 'linear-gradient(135deg,#0A1628 0%,#1C3D6E 100%)', borderRadius: 24, padding: 32, marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(0,212,161,.05)', top: -80, right: -60, pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <ProgressRing pct={usedPct} color="#00D4A1" size={160} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <p style={{ color: '#fff', fontSize: 13, fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>
                {usedPct.toFixed(0)}%<br /><span style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', fontWeight: 500 }}>used</span>
              </p>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>2025/26 ISA Allowance</p>
            <p style={{ color: '#fff', fontSize: 38, fontWeight: 900, letterSpacing: -1.5, marginBottom: 4 }}>£20,000</p>
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginTop: 16 }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 11, marginBottom: 3 }}>Used</p>
                <p style={{ color: '#EF4444', fontSize: 18, fontWeight: 800 }}>£{usedAmt.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 11, marginBottom: 3 }}>Remaining</p>
                <p style={{ color: '#00D4A1', fontSize: 18, fontWeight: 800 }}>£{remaining.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 11, marginBottom: 3 }}>Resets</p>
                <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 18, fontWeight: 800 }}>6 Apr 2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ISA Product cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, marginBottom: 28 }}>
        {ISA_PRODUCTS.map(p => (
          <div key={p.name} style={{
            background: p.bg, borderRadius: 24, padding: 28,
            border: `2px solid ${p.borderColor}40`,
            boxShadow: `0 4px 20px ${p.borderColor}15`,
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: 20, right: 20,
              background: p.badgeColor, color: '#fff',
              fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 20, letterSpacing: .5,
            }}>{p.badge}</div>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: p.borderColor + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16 }}>
              {p.icon}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0A1628', marginBottom: 4 }}>{p.name}</h3>
            <p style={{ fontSize: 28, fontWeight: 900, color: p.borderColor, marginBottom: 2 }}>{p.rate}</p>
            <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 20 }}>{p.rateLabel}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {p.bullets.map(b => (
                <p key={b} style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>{b}</p>
              ))}
            </div>
            <button
              onClick={() => setToast(`${p.name} — Coming Soon! Join the waitlist to be first in line.`)}
              style={{ width: '100%', padding: '12px 0', borderRadius: 14, border: 'none', background: p.borderColor, color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}
            >
              Open Account
            </button>
          </div>
        ))}
      </div>

      {/* Tax savings calculator */}
      <div style={{ background: '#fff', borderRadius: 24, padding: 28, border: '1.5px solid #F1F5F9', boxShadow: '0 2px 12px rgba(0,0,0,.04)', marginBottom: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0A1628', marginBottom: 4 }}>Tax Savings Calculator</h2>
        <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 24 }}>See how much tax you save by investing inside an ISA (20% basic rate taxpayer)</p>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#0A1628' }}>How much do you plan to invest this year?</label>
            <span style={{ fontSize: 20, fontWeight: 900, color: '#00D4A1' }}>£{investAmt.toLocaleString('en-GB')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94A3B8', marginBottom: 6 }}>
            <span>£500</span><span>£20,000</span>
          </div>
          <input
            type="range" min={500} max={20000} step={100} value={investAmt}
            onChange={e => setInvestAmt(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#00D4A1', cursor: 'pointer' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
          {[
            { label: 'Tax saved vs regular account', value: `£${taxSaved.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`, icon: '💷', color: '#00D4A1', desc: 'At 20% basic rate' },
            { label: 'Projected 5-year value', value: `£${Math.round(fiveYear).toLocaleString('en-GB')}`, icon: '📈', color: '#3B82F6', desc: 'At 7% annual return' },
            { label: 'Extra gain vs taxed account', value: `£${Math.round(fiveYear - investAmt).toLocaleString('en-GB')}`, icon: '🎯', color: '#A855F7', desc: 'Tax-free growth benefit' },
          ].map(s => (
            <div key={s.label} style={{ background: s.color + '08', borderRadius: 16, padding: 20, border: `1.5px solid ${s.color}20` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
                <p style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>{s.label}</p>
              </div>
              <p style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</p>
              <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ISA Rules */}
      <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0A1628', marginBottom: 16 }}>ISA Rules to Know</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
        {ISA_RULES.map(r => (
          <div key={r.title} style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1.5px solid #F1F5F9', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
            <span style={{ fontSize: 28 }}>{r.icon}</span>
            <p style={{ fontWeight: 800, fontSize: 14, color: '#0A1628', margin: '12px 0 6px' }}>{r.title}</p>
            <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>{r.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
