import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PLAN_FEATURES = {
  plus: {
    name: 'Plus',
    price: '£3/mo',
    color: '#00D4A1',
    subtext: 'Everything you need to grow your savings smarter.',
    features: [
      'Unlimited savings goals',
      'Investment starter access',
      'ISA account access',
      'Spending insights & analytics',
      'Push notifications & alerts',
    ],
  },
  pro: {
    name: 'Pro',
    price: '£7/mo',
    color: '#A855F7',
    subtext: 'The complete HAY-M experience with AI-powered tools.',
    features: [
      'Everything in Plus',
      'AI auto-save suggestions',
      'Priority customer support',
      'Advanced analytics dashboard',
      'Custom savings milestones',
    ],
  },
};

function PlanCard({ planKey }) {
  const plan = PLAN_FEATURES[planKey];
  if (!plan) return null;
  const isPro = planKey === 'pro';

  return (
    <div
      style={{
        flex: 1,
        minWidth: 220,
        background: isPro
          ? 'linear-gradient(135deg,rgba(168,85,247,.15),rgba(124,58,237,.1))'
          : 'rgba(0,212,161,.08)',
        border: `1.5px solid ${isPro ? 'rgba(168,85,247,.4)' : 'rgba(0,212,161,.3)'}`,
        borderRadius: 20,
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {isPro && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          background: 'linear-gradient(135deg,#A855F7,#7C3AED)',
          color: '#fff', fontSize: 9, fontWeight: 800, letterSpacing: 1,
          textTransform: 'uppercase', padding: '3px 8px', borderRadius: 6,
        }}>
          Best Value
        </div>
      )}

      <div>
        <p style={{ color: plan.color, fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
          {plan.name}
        </p>
        <p style={{ color: '#fff', fontSize: 30, fontWeight: 900, letterSpacing: -1 }}>
          {plan.price}
        </p>
        <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 13, marginTop: 4 }}>
          {plan.subtext}
        </p>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {plan.features.map((feat, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ color: plan.color, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
            <span style={{ color: 'rgba(255,255,255,.75)', fontSize: 14 }}>{feat}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => alert('Upgrade flow coming soon!')}
        style={{
          marginTop: 'auto',
          padding: '13px 0',
          borderRadius: 14,
          border: 'none',
          cursor: 'pointer',
          fontWeight: 800,
          fontSize: 15,
          background: isPro
            ? 'linear-gradient(135deg,#A855F7,#7C3AED)'
            : '#00D4A1',
          color: isPro ? '#fff' : '#0A1628',
          transition: 'opacity .15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
      >
        Upgrade to {plan.name}
      </button>
    </div>
  );
}

export default function UpgradePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const required = searchParams.get('required') || 'plus';
  const isPlusRequired = required === 'plus';
  const planLabel = isPlusRequired ? 'Plus' : 'Pro';

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628' }}>
      <div style={{
        maxWidth: 600,
        margin: '0 auto',
        padding: '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>

        {/* Back button */}
        <div style={{ width: '100%', marginBottom: 32 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'rgba(255,255,255,.06)',
              border: '1px solid rgba(255,255,255,.1)',
              color: 'rgba(255,255,255,.6)',
              padding: '8px 16px',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.color = 'rgba(255,255,255,.6)'; }}
          >
            ← Back
          </button>
        </div>

        {/* Lock icon */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(0,212,161,.15)',
          border: '2px solid rgba(0,212,161,.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, marginBottom: 24,
        }}>
          🔒
        </div>

        {/* Headline */}
        <h1 style={{
          color: '#fff', fontSize: 30, fontWeight: 900,
          textAlign: 'center', marginBottom: 12, letterSpacing: -0.5,
        }}>
          Unlock {planLabel}
        </h1>

        {/* Subtext */}
        <p style={{
          color: 'rgba(255,255,255,.5)', fontSize: 15,
          textAlign: 'center', marginBottom: 36, maxWidth: 420, lineHeight: 1.6,
        }}>
          {isPlusRequired
            ? 'This feature requires a Plus or Pro plan. Choose a plan below to get full access to insights, investments, ISA, portfolio, and more.'
            : 'This feature is exclusive to the Pro plan. Upgrade to unlock AI auto-save, priority support, advanced analytics, and custom milestones.'}
        </p>

        {/* Plan cards */}
        <div style={{
          display: 'flex',
          gap: 16,
          width: '100%',
          marginBottom: 32,
          flexWrap: 'wrap',
        }}>
          {isPlusRequired ? (
            <>
              <PlanCard planKey="plus" />
              <PlanCard planKey="pro" />
            </>
          ) : (
            <PlanCard planKey="pro" />
          )}
        </div>

        {/* Footer note */}
        <p style={{ color: 'rgba(255,255,255,.25)', fontSize: 12, textAlign: 'center' }}>
          Already on the right plan? Try logging out and back in.
        </p>
      </div>
    </div>
  );
}
