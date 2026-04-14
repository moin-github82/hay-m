import React, { useState, useEffect } from 'react';
import api from '../services/api';

const CATEGORIES = [
  { key: 'food',          label: 'Food & Drink',   color: '#00D4A1', keywords: ['cafe','coffee','restaurant','food','eat','lunch','dinner','breakfast','greggs','pret','costa','mcdonalds','kfc','subway','tesco','sainsbury','waitrose','aldi','lidl','asda','morrisons','grocery','groceries'] },
  { key: 'transport',     label: 'Transport',       color: '#3B82F6', keywords: ['uber','taxi','bus','train','tube','rail','tfl','oyster','parking','petrol','fuel','car','bike','transport','travel'] },
  { key: 'shopping',      label: 'Shopping',        color: '#A855F7', keywords: ['amazon','ebay','asos','primark','h&m','zara','next','shop','store','retail','clothes','clothing','fashion','shoes'] },
  { key: 'bills',         label: 'Bills',           color: '#F59E0B', keywords: ['bill','rent','mortgage','council','tax','electricity','gas','water','broadband','internet','phone','mobile','insurance','utility'] },
  { key: 'entertainment', label: 'Entertainment',   color: '#10B981', keywords: ['netflix','spotify','disney','prime','youtube','cinema','theatre','concert','game','gaming','steam','playstation','xbox','apple music','entertainment'] },
  { key: 'health',        label: 'Health',          color: '#EF4444', keywords: ['pharmacy','boots','gym','fitness','doctor','dentist','hospital','nhs','health','medical','medicine','vitamin','supplement'] },
  { key: 'other',         label: 'Other',           color: '#64748B', keywords: [] },
];

function bucketTx(tx) {
  const text = ((tx.title || '') + ' ' + (tx.subtitle || '')).toLowerCase();
  for (const cat of CATEGORIES.slice(0, -1)) {
    if (cat.keywords.some(k => text.includes(k))) return cat.key;
  }
  return 'other';
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
      <span style={{ fontSize: 20 }}>✅</span>
      {message}
    </div>
  );
}

export default function InsightsPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [savePct, setSavePct] = useState(20);
  const [toast, setToast]     = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data);
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

  const txs = Array.isArray(data?.recentTransactions) ? data.recentTransactions : [];
  const debits = txs.filter(t => t.type !== 'credit');

  // Category totals
  const catTotals = {};
  CATEGORIES.forEach(c => { catTotals[c.key] = { amount: 0, count: 0 }; });
  debits.forEach(tx => {
    const cat = bucketTx(tx);
    catTotals[cat].amount += Number(tx.amount || 0);
    catTotals[cat].count  += 1;
  });
  const totalSpent = debits.reduce((s, t) => s + Number(t.amount || 0), 0);
  const maxCatAmount = Math.max(...CATEGORIES.map(c => catTotals[c.key].amount), 1);

  // Hero stats
  const biggestCat   = CATEGORIES.reduce((a, b) => catTotals[a.key].amount >= catTotals[b.key].amount ? a : b);
  const avgDaily     = totalSpent > 0 ? totalSpent / 30 : 0;
  const autoPot      = Number(data?.balance ?? 0) * 0.05;
  const estIncome    = 2500;
  const suggestedAmt = estIncome * (savePct / 100);

  const heroStats = [
    { icon: '💸', label: 'Total Spent This Month', value: `£${totalSpent.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`, color: '#EF4444' },
    { icon: '🏆', label: 'Biggest Category',        value: biggestCat.label,                                                         color: biggestCat.color },
    { icon: '📊', label: 'Avg Daily Spend',         value: `£${avgDaily.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`,    color: '#F59E0B' },
    { icon: '🐖', label: 'Auto-Save Pot',            value: `£${autoPot.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`,    color: '#00D4A1' },
  ];

  const recentInsights = [
    { icon: '📡', title: 'Subscription creep detected', desc: '3 new recurring charges appeared this month — review to cancel unwanted ones.', border: '#EF4444' },
    { icon: '⚡', title: 'Round-up efficiency up 12%',  desc: 'Your round-up savings are growing faster. Great habit!',                         border: '#10B981' },
    { icon: '📅', title: 'Best savings week: 14–20 Jan', desc: 'You saved £47.20 in a single week — your personal best this year.',             border: '#3B82F6' },
    { icon: '☕', title: 'Coffee budget 40% over',       desc: 'You spent £34 on coffee this month vs a £24 budget. Cut back to hit your goal.', border: '#F59E0B' },
    { icon: '🛒', title: 'Grocery spending down 8%',    desc: 'Smart swap to Aldi & Lidl is paying off — you saved £14 vs last month.',         border: '#00D4A1' },
  ];

  return (
    <div>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0A1628' }}>Spending Insights</h1>
        <p style={{ color: '#64748B', fontSize: 14, marginTop: 2 }}>Understand your money & automate your savings</p>
      </div>

      {/* Hero stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
        {heroStats.map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 20, padding: 20, border: '1.5px solid #F1F5F9', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
            <div style={{ width: 42, height: 42, borderRadius: 13, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 12 }}>{s.icon}</div>
            <p style={{ fontSize: 12, color: '#64748B', fontWeight: 500, marginBottom: 4 }}>{s.label}</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: '#0A1628' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Middle section: bar chart + auto-save */}
      <div style={{ display: 'grid', gridTemplateColumns: '60fr 40fr', gap: 20, marginBottom: 28, alignItems: 'start' }}>

        {/* Category bar chart */}
        <div style={{ background: '#fff', borderRadius: 24, padding: 28, border: '1.5px solid #F1F5F9', boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0A1628', marginBottom: 4 }}>Spending by Category</h2>
          <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 24 }}>Based on your recent transactions</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {CATEGORIES.map(cat => {
              const { amount, count } = catTotals[cat.key];
              const pct = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
              const barWidth = maxCatAmount > 0 ? (amount / maxCatAmount) * 100 : 0;
              return (
                <div key={cat.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0A1628' }}>{cat.label}</span>
                      <span style={{ fontSize: 11, color: '#94A3B8' }}>{count} item{count !== 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#0A1628' }}>£{amount.toFixed(2)}</span>
                      <span style={{ fontSize: 11, color: '#94A3B8', minWidth: 32, textAlign: 'right' }}>{pct.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div style={{ height: 10, borderRadius: 5, background: '#F1F5F9', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 5, width: `${barWidth}%`, background: cat.color, transition: 'width .6s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Auto-Save suggestion card */}
        <div style={{ background: 'linear-gradient(135deg,#0A1628 0%,#1C3D6E 100%)', borderRadius: 24, padding: 28, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(0,212,161,.06)', top: -60, right: -60, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 28 }}>🤖</span>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Auto-Save Suggestion</h3>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>Based on your spending habits</p>
              </div>
            </div>

            <div style={{ background: 'rgba(0,212,161,.12)', borderRadius: 16, padding: 20, marginBottom: 20 }}>
              <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Suggested Monthly Save</p>
              <p style={{ color: '#00D4A1', fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>
                £{suggestedAmt.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </p>
              <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 12, marginTop: 4 }}>{savePct}% of estimated income</p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>5%</span>
                <span style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>{savePct}%</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>30%</span>
              </div>
              <input
                type="range" min={5} max={30} step={1} value={savePct}
                onChange={e => setSavePct(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#00D4A1', cursor: 'pointer' }}
              />
            </div>

            <button
              onClick={() => setToast('Auto-Save enabled! £' + suggestedAmt.toFixed(2) + '/month will be saved automatically.')}
              style={{ width: '100%', padding: '12px 0', borderRadius: 14, border: 'none', background: '#00D4A1', color: '#0A1628', fontWeight: 800, fontSize: 14, cursor: 'pointer', marginBottom: 20 }}
            >
              Enable Auto-Save →
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                '💡 You spent 18% less on food vs last month',
                '⚡ Tuesday is your highest spend day',
                '🎯 On track for your holiday goal',
              ].map(chip => (
                <div key={chip} style={{ background: 'rgba(255,255,255,.07)', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: 'rgba(255,255,255,.75)', fontWeight: 500 }}>
                  {chip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Insights feed */}
      <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0A1628', marginBottom: 16 }}>Recent Insights</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
        {recentInsights.map(ins => (
          <div key={ins.title} style={{
            background: '#fff', borderRadius: 20, padding: 20,
            border: '1.5px solid #F1F5F9', boxShadow: '0 2px 8px rgba(0,0,0,.04)',
            borderLeft: `4px solid ${ins.border}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{ins.icon}</span>
              <div>
                <p style={{ fontWeight: 800, fontSize: 14, color: '#0A1628', marginBottom: 4 }}>{ins.title}</p>
                <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>{ins.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
