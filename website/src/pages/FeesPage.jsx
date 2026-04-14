import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HaymLogo from '../components/HaymLogo';
import PublicNavbar from '../components/PublicNavbar';

const TIERS = [
  {
    name: 'Free',
    price: '£0',
    period: '/month',
    desc: 'Get started with the basics',
    color: '#64748B',
    popular: false,
    features: [
      { label: 'Basic savings tracking', included: true },
      { label: '1 savings goal', included: true },
      { label: 'Spending overview', included: true },
      { label: 'Unlimited goals', included: false },
      { label: 'Investment access', included: false },
      { label: 'ISA wrapper', included: false },
      { label: 'Spending insights', included: false },
      { label: 'AI auto-save', included: false },
      { label: 'Priority support', included: false },
      { label: 'Advanced analytics', included: false },
    ],
  },
  {
    name: 'Plus',
    price: '£3',
    period: '/month',
    desc: 'For growing savers',
    color: '#00D4A1',
    popular: true,
    features: [
      { label: 'Basic savings tracking', included: true },
      { label: 'Unlimited goals', included: true },
      { label: 'Spending overview', included: true },
      { label: 'Unlimited goals', included: true },
      { label: 'Investment starter', included: true },
      { label: 'ISA wrapper', included: true },
      { label: 'Spending insights', included: true },
      { label: 'AI auto-save', included: false },
      { label: 'Priority support', included: false },
      { label: 'Advanced analytics', included: false },
    ],
  },
  {
    name: 'Pro',
    price: '£7',
    period: '/month',
    desc: 'For serious investors',
    color: '#3B82F6',
    popular: false,
    features: [
      { label: 'Basic savings tracking', included: true },
      { label: 'Unlimited goals', included: true },
      { label: 'Spending overview', included: true },
      { label: 'Unlimited goals', included: true },
      { label: 'Investment starter', included: true },
      { label: 'ISA wrapper', included: true },
      { label: 'Spending insights', included: true },
      { label: 'AI auto-save', included: true },
      { label: 'Priority support', included: true },
      { label: 'Advanced analytics', included: true },
    ],
  },
];

const FEE_ROWS = [
  { service: 'Account creation',                fee: 'Free',       when: 'Never',          notes: 'Always free' },
  { service: 'Monthly subscription (Free)',      fee: '£0.00',      when: 'N/A',            notes: '—' },
  { service: 'Monthly subscription (Plus)',      fee: '£3.00',      when: '1st of month',   notes: 'Cancel anytime' },
  { service: 'Monthly subscription (Pro)',       fee: '£7.00',      when: '1st of month',   notes: 'Cancel anytime' },
  { service: 'Investment management',            fee: '0.25% /yr',  when: 'Quarterly',      notes: 'On invested amount' },
  { service: 'Fund provider fees',               fee: '0.10–0.22% /yr', when: 'Quarterly', notes: 'Varies by fund' },
  { service: 'ISA wrapper',                      fee: 'Free',       when: 'Never',          notes: 'Included in Plus/Pro' },
  { service: 'Withdrawals',                      fee: 'Free',       when: 'Never',          notes: 'Same-day processing' },
  { service: 'Card top-up',                      fee: 'Free',       when: 'Per transaction', notes: '—' },
  { service: 'FX / foreign transactions',        fee: '0%',         when: 'Per transaction', notes: 'We absorb the fee' },
];

const FAQS = [
  { q: 'Do you charge to open an ISA?', a: 'No. Opening a Cash ISA or Stocks & Shares ISA through HAY-M is completely free. The ISA wrapper is included with Plus and Pro plans at no additional cost.' },
  { q: 'What happens if I cancel?', a: "If you cancel your Plus or Pro subscription, you immediately revert to the Free plan. Your savings, goals, and portfolio remain safe and fully accessible. You won't be charged again." },
  { q: 'Are there hidden fees?', a: 'Absolutely not. The table above lists every fee we charge. We make our money from subscriptions, not from your returns or hidden charges. What you see is what you pay.' },
  { q: 'How does the 0.25% investment management fee work?', a: 'The 0.25% per annum fee applies only to assets managed within your HAY-M portfolio. It is charged quarterly (0.0625% per quarter) directly on the invested value — never on profits alone.' },
  { q: 'Is my money FSCS protected?', a: 'Cash held in your HAY-M wallet and Cash ISA is FSCS protected up to £85,000 per person via our regulated banking partner. Investments in Stocks & Shares ISAs carry market risk and are not FSCS protected against investment losses.' },
];

function AccordionItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #E2E8F0', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 700, color: '#0A1628' }}>{faq.q}</span>
        <span style={{ fontSize: 20, color: '#64748B', transition: 'transform .2s', transform: open ? 'rotate(45deg)' : 'none', flexShrink: 0, marginLeft: 12 }}>+</span>
      </button>
      {open && (
        <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, paddingBottom: 18 }}>{faq.a}</p>
      )}
    </div>
  );
}

export default function FeesPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F5F7FA' }}>

      <PublicNavbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#0A1628,#1C3D6E)', padding: '80px 24px 68px', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(0,212,161,.15)', border: '1.5px solid rgba(0,212,161,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 24px' }}>💷</div>
          <h1 style={{ fontSize: 48, fontWeight: 900, color: '#fff', letterSpacing: -1.5, marginBottom: 16 }}>No surprises. Ever.</h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,.65)', lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
            We believe in complete transparency. Every fee listed, explained, and justified. No hidden charges, no small print traps.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>

        {/* Pricing tiers */}
        <div style={{ padding: '60px 0 40px' }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0A1628', textAlign: 'center', marginBottom: 8 }}>Simple, honest pricing</h2>
          <p style={{ fontSize: 15, color: '#64748B', textAlign: 'center', marginBottom: 40 }}>No lock-in. Cancel or change plan any time.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
            {TIERS.map(tier => (
              <div key={tier.name} style={{
                background: '#fff', borderRadius: 24, padding: 28, position: 'relative',
                border: tier.popular ? `2px solid ${tier.color}` : '1.5px solid #E2E8F0',
                boxShadow: tier.popular ? `0 8px 32px ${tier.color}25` : '0 2px 12px rgba(0,0,0,.04)',
              }}>
                {tier.popular && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: tier.color, color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 16px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                    Most Popular
                  </div>
                )}
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0A1628', marginBottom: 4 }}>{tier.name}</h3>
                <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 16 }}>{tier.desc}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                  <span style={{ fontSize: 38, fontWeight: 900, color: tier.color }}>{tier.price}</span>
                  <span style={{ fontSize: 14, color: '#94A3B8' }}>{tier.period}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {tier.features.map(f => (
                    <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, color: f.included ? '#10B981' : '#CBD5E1', fontWeight: 700, flexShrink: 0 }}>{f.included ? '✓' : '✗'}</span>
                      <span style={{ fontSize: 13, color: f.included ? '#374151' : '#94A3B8' }}>{f.label}</span>
                    </div>
                  ))}
                </div>
                <Link to="/signup" className="btn" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', height: 46, borderRadius: 14,
                  textDecoration: 'none', fontWeight: 800, fontSize: 14,
                  background: tier.popular ? tier.color : '#F5F7FA',
                  color: tier.popular ? '#fff' : '#0A1628',
                  border: tier.popular ? 'none' : '1.5px solid #E2E8F0',
                }}>
                  {tier.name === 'Free' ? 'Get Started Free' : `Start ${tier.name} Plan`}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Fee breakdown table */}
        <div style={{ padding: '20px 0 60px' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0A1628', marginBottom: 8 }}>Complete fee breakdown</h2>
          <p style={{ fontSize: 14, color: '#64748B', marginBottom: 28 }}>Every charge, every service — fully itemised.</p>
          <div style={{ background: '#fff', borderRadius: 24, border: '1.5px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
                <thead>
                  <tr style={{ background: '#0A1628' }}>
                    {['Service', 'Fee', 'When charged', 'Notes'].map(h => (
                      <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.6)', letterSpacing: .5, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEE_ROWS.map((row, i) => (
                    <tr key={row.service} style={{ background: i % 2 === 0 ? '#fff' : '#F8FAFC' }}>
                      <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: '#0A1628' }}>{row.service}</td>
                      <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 800, color: row.fee === 'Free' || row.fee === '£0.00' || row.fee === '0%' ? '#10B981' : '#0A1628' }}>{row.fee}</td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748B' }}>{row.when}</td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#94A3B8' }}>{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ accordion */}
        <div style={{ padding: '0 0 80px' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0A1628', marginBottom: 8 }}>Frequently asked questions</h2>
          <p style={{ fontSize: 14, color: '#64748B', marginBottom: 32 }}>Straight answers to common questions about our fees.</p>
          <div style={{ background: '#fff', borderRadius: 24, padding: '8px 32px', border: '1.5px solid #E2E8F0', boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
            {FAQS.map(faq => (
              <AccordionItem key={faq.q} faq={faq} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#0A1628', padding: '28px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
          <span style={{ color: 'rgba(255,255,255,.35)', fontSize: 13 }}>© 2026 HAY-M Ltd. All rights reserved.</span>
          <Link to="/privacy" style={{ color: 'rgba(255,255,255,.4)', fontSize: 13, textDecoration: 'none' }}>Privacy Policy</Link>
          <Link to="/terms"   style={{ color: 'rgba(255,255,255,.4)', fontSize: 13, textDecoration: 'none' }}>Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
