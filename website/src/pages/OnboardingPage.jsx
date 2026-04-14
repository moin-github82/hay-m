import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HaymLogo from '../components/HaymLogo';

const STEPS = [
  {
    key: 'welcome',
    emoji: '👋',
    gradient: 'linear-gradient(145deg,#0A1628,#1C3D6E)',
    accent: '#00D4A1',
    title: (name) => `Welcome, ${name?.split(' ')[0] || 'there'}!`,
    subtitle: 'You\'ve just joined HAY-M — the smart UK micro-savings and investment app. Let\'s take 30 seconds to show you around.',
    badge: '🇬🇧 FCA Sandbox',
  },
  {
    key: 'save',
    emoji: '🎯',
    gradient: 'linear-gradient(145deg,#0A1628,#2D1B4E)',
    accent: '#F4A261',
    title: () => 'Set Savings Goals',
    subtitle: 'Create goals for anything — a holiday, a house deposit, a new car. HAY-M tracks your progress and auto-saves with round-ups from your daily spending.',
    badge: '💰 Auto round-ups',
  },
  {
    key: 'invest',
    emoji: '📈',
    gradient: 'linear-gradient(145deg,#0A1628,#1A2E4E)',
    accent: '#A855F7',
    title: () => 'Invest From £1',
    subtitle: 'Start investing with beginner-friendly portfolios matched to your risk level. Unlock investing with a Plus or Pro plan.',
    badge: '📊 Beginner-friendly',
  },
  {
    key: 'plan',
    emoji: '💎',
    gradient: 'linear-gradient(145deg,#0A1628,#1C3D6E)',
    accent: '#3B82F6',
    title: () => 'Choose Your Plan',
    subtitle: 'You\'re on the Free plan. Upgrade to Plus or Pro any time to unlock unlimited goals, investments, ISA, and AI auto-save features.',
    badge: '🆓 Free plan active',
    plans: true,
  },
  {
    key: 'ready',
    emoji: '🚀',
    gradient: 'linear-gradient(145deg,#0A1628,#1C3D6E)',
    accent: '#00D4A1',
    title: () => "You're all set!",
    subtitle: 'Your HAY-M account is ready. Head to your dashboard to add your first savings goal or explore your wallet.',
    badge: '✅ Account ready',
  },
];

const PLANS = [
  {
    key: 'free',
    label: 'Free',
    price: '£0/mo',
    color: '#64748B',
    bg: '#F1F5F9',
    features: ['1 Savings goal', 'Basic wallet', 'Transaction history'],
    current: true,
  },
  {
    key: 'plus',
    label: 'Plus',
    price: '£4.99/mo',
    color: '#2563EB',
    bg: '#DBEAFE',
    features: ['Unlimited goals', 'Investments', 'ISA account', 'Insights'],
    current: false,
  },
  {
    key: 'pro',
    label: 'Pro',
    price: '£9.99/mo',
    color: '#7C3AED',
    bg: '#EDE9FE',
    features: ['Everything in Plus', 'AI auto-save', 'Push notifications'],
    current: false,
  },
];

export default function OnboardingPage() {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const [step, setStep] = useState(0);

  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;
  const isFirst = step === 0;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem('hasOnboarded', 'true');
      navigate('/dashboard');
    } else {
      setStep(s => s + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('hasOnboarded', 'true');
    navigate('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: current.gradient, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, transition: 'background 0.5s ease' }}>

      {/* Logo + skip */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <HaymLogo size={36} />
          <span style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>HAY-M</span>
        </div>
        {!isLast && (
          <button onClick={handleSkip} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', borderRadius: 20, padding: '6px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Skip →
          </button>
        )}
      </div>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 520, background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 28, padding: 40, textAlign: 'center' }}>

        {/* Badge */}
        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '5px 16px', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: 28 }}>
          {current.badge}
        </div>

        {/* Emoji */}
        <div style={{ width: 100, height: 100, borderRadius: 50, background: current.accent + '22', border: `2px solid ${current.accent}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', fontSize: 44 }}>
          {current.emoji}
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 14, lineHeight: 1.2 }}>
          {current.title(user?.fullName)}
        </h1>

        {/* Subtitle */}
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.68)', lineHeight: 1.7, marginBottom: current.plans ? 28 : 36 }}>
          {current.subtitle}
        </p>

        {/* Plan cards (step 3) */}
        {current.plans && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 28 }}>
            {PLANS.map(plan => (
              <div key={plan.key} style={{ background: plan.current ? plan.bg : 'rgba(255,255,255,0.06)', borderRadius: 16, padding: '14px 10px', border: `1.5px solid ${plan.current ? plan.color : 'rgba(255,255,255,0.15)'}`, textAlign: 'center' }}>
                <p style={{ fontWeight: 800, fontSize: 13, color: plan.current ? plan.color : '#fff', marginBottom: 4 }}>{plan.label}</p>
                <p style={{ fontWeight: 900, fontSize: 16, color: plan.current ? '#0A1628' : '#fff', marginBottom: 8 }}>{plan.price}</p>
                {plan.features.map((f, i) => (
                  <p key={i} style={{ fontSize: 11, color: plan.current ? '#475569' : 'rgba(255,255,255,0.6)', marginBottom: 3, lineHeight: 1.4 }}>✓ {f}</p>
                ))}
                {plan.current && (
                  <span style={{ display: 'inline-block', marginTop: 8, background: plan.color, color: '#fff', borderRadius: 12, padding: '2px 10px', fontSize: 10, fontWeight: 800 }}>ACTIVE</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Next button */}
        <button
          onClick={handleNext}
          style={{
            width: '100%', height: 52, borderRadius: 16, border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg,${current.accent},${current.accent}bb)`,
            color: '#0A1628', fontSize: 16, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {isLast ? '🚀 Go to Dashboard' : 'Next →'}
        </button>
      </div>

      {/* Step dots */}
      <div style={{ display: 'flex', gap: 8, marginTop: 28 }}>
        {STEPS.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            style={{
              width: i === step ? 24 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer',
              background: i === step ? current.accent : 'rgba(255,255,255,0.3)',
              transition: 'width 0.3s ease, background 0.3s ease', padding: 0,
            }}
          />
        ))}
      </div>

      {/* Step counter */}
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 12 }}>
        Step {step + 1} of {STEPS.length}
      </p>
    </div>
  );
}
