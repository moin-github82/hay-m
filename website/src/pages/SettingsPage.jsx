import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const TABS = [
  { id: 'profile',       label: 'Profile',         icon: '👤' },
  { id: 'security',      label: 'Security',         icon: '🔐' },
  { id: 'notifications', label: 'Notifications',    icon: '🔔' },
  { id: 'plan',          label: 'Plan & Billing',   icon: '💳' },
];

const PREF_DEFS = [
  { id: 'goal_done', label: 'Goal Completed',    desc: 'When a savings goal reaches 100%' },
  { id: 'goal_50',   label: 'Goal at 50%',        desc: 'Halfway milestone notifications' },
  { id: 'invest_10', label: 'Investment +10%',    desc: 'Portfolio grows by 10%' },
  { id: 'invest_25', label: 'Investment +25%',    desc: 'Portfolio grows by 25%' },
  { id: 'weekly',    label: 'Weekly Summary',     desc: 'Weekly digest every Sunday' },
  { id: 'monthly',   label: 'Monthly Report',     desc: 'Monthly summary on the 1st' },
  { id: 'auto_save', label: 'Auto-save Executed', desc: 'When HAY-M auto-saves for you' },
  { id: 'large_tx',  label: 'Large Transaction',  desc: 'Any transaction over £50' },
];

const PLAN_INFO = {
  free: {
    label: 'Free',
    price: '£0/mo',
    color: '#64748B',
    bg:    '#F1F5F9',
    features: ['1 Savings Goal', 'Basic wallet', 'Transaction history', 'HAY-M community'],
  },
  plus: {
    label: 'Plus',
    price: '£4.99/mo',
    color: '#2563EB',
    bg:    '#DBEAFE',
    features: ['Unlimited goals', 'Investment starter', 'ISA account', 'Spending insights', 'Priority support'],
  },
  pro: {
    label: 'Pro',
    price: '£9.99/mo',
    color: '#7C3AED',
    bg:    '#EDE9FE',
    features: ['Everything in Plus', 'AI auto-save limits', 'Push notifications', 'Advanced analytics', 'Dedicated support'],
  },
};

function Toggle({ on, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
        background: on ? '#00D4A1' : '#CBD5E1', position: 'relative', transition: 'background .2s', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: on ? 25 : 3, width: 20, height: 20,
        borderRadius: 10, background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,.2)', transition: 'left .2s',
      }} />
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 7 }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = 'text', placeholder, disabled }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        width: '100%', height: 46, borderRadius: 12, border: '1.5px solid #E2E8F0',
        padding: '0 14px', fontSize: 14, color: disabled ? '#94A3B8' : '#0A1628',
        background: disabled ? '#F8FAFC' : '#fff', outline: 'none', boxSizing: 'border-box',
      }}
    />
  );
}

function SaveBtn({ onClick, loading, label = 'Save Changes' }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        background: 'linear-gradient(135deg,#00D4A1,#00A87F)', border: 'none',
        color: '#0A1628', fontWeight: 800, fontSize: 14, borderRadius: 12,
        padding: '12px 28px', cursor: 'pointer', opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? 'Saving…' : label}
    </button>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab({ user, onUpdate }) {
  const [form, setForm] = useState({ fullName: user?.fullName || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async () => {
    setSaving(true); setMsg('');
    try {
      const res = await api.patch('/auth/me', { fullName: form.fullName.trim(), phone: form.phone.trim() });
      onUpdate(res.data.user);
      setMsg('✅ Profile updated successfully.');
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0A1628', marginBottom: 24 }}>Personal Information</h3>

      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
        <div style={{ width: 72, height: 72, borderRadius: 36, background: 'linear-gradient(135deg,#00D4A1,#0A1628)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: '#fff' }}>{initials}</span>
        </div>
        <div>
          <p style={{ fontWeight: 800, fontSize: 16, color: '#0A1628', marginBottom: 2 }}>{user?.fullName}</p>
          <p style={{ fontSize: 13, color: '#94A3B8' }}>Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : '—'}</p>
        </div>
      </div>

      <Field label="Full Name">
        <Input value={form.fullName} onChange={v => setForm(p => ({ ...p, fullName: v }))} placeholder="Your full name" />
      </Field>
      <Field label="Email Address">
        <Input value={user?.email || ''} onChange={() => {}} disabled />
        <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 5 }}>Email cannot be changed. Contact support if needed.</p>
      </Field>
      <Field label="Phone Number">
        <Input value={form.phone} onChange={v => setForm(p => ({ ...p, phone: v }))} placeholder="+44 7700 900000" type="tel" />
      </Field>

      {msg && <p style={{ fontSize: 13, color: msg.startsWith('✅') ? '#10B981' : '#EF4444', marginBottom: 16 }}>{msg}</p>}
      <SaveBtn onClick={handleSave} loading={saving} />
    </div>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────
function SecurityTab() {
  const [form, setForm] = useState({ current: '', newPw: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async () => {
    if (!form.current || !form.newPw || !form.confirm) { setMsg('❌ All fields are required.'); return; }
    if (form.newPw !== form.confirm) { setMsg('❌ New passwords do not match.'); return; }
    if (form.newPw.length < 8) { setMsg('❌ Password must be at least 8 characters.'); return; }
    setSaving(true); setMsg('');
    try {
      await api.patch('/auth/change-password', { currentPassword: form.current, newPassword: form.newPw });
      setForm({ current: '', newPw: '', confirm: '' });
      setMsg('✅ Password changed successfully.');
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0A1628', marginBottom: 6 }}>Change Password</h3>
      <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>Use a strong password of at least 8 characters.</p>

      <Field label="Current Password">
        <Input value={form.current} onChange={v => setForm(p => ({ ...p, current: v }))} type="password" placeholder="••••••••" />
      </Field>
      <Field label="New Password">
        <Input value={form.newPw} onChange={v => setForm(p => ({ ...p, newPw: v }))} type="password" placeholder="••••••••" />
      </Field>
      <Field label="Confirm New Password">
        <Input value={form.confirm} onChange={v => setForm(p => ({ ...p, confirm: v }))} type="password" placeholder="••••••••" />
      </Field>

      {msg && <p style={{ fontSize: 13, color: msg.startsWith('✅') ? '#10B981' : '#EF4444', marginBottom: 16 }}>{msg}</p>}
      <SaveBtn onClick={handleSave} loading={saving} label="Update Password" />

      {/* Security notice */}
      <div style={{ marginTop: 32, padding: 20, background: '#F0FDF4', borderRadius: 16, border: '1px solid #BBF7D0' }}>
        <p style={{ fontWeight: 800, fontSize: 14, color: '#059669', marginBottom: 8 }}>🔐 Security Tips</p>
        <ul style={{ fontSize: 13, color: '#047857', paddingLeft: 18, lineHeight: 1.8 }}>
          <li>Never share your password with anyone</li>
          <li>Use a unique password not used on other sites</li>
          <li>Consider using a password manager</li>
        </ul>
      </div>
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────
function NotificationsTab({ user }) {
  const [prefs, setPrefs] = useState(
    Object.fromEntries(PREF_DEFS.map(p => [p.id, user?.notificationPrefs?.[p.id] ?? true]))
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async () => {
    setSaving(true); setMsg('');
    try {
      await api.patch('/notifications/preferences', { notificationPrefs: prefs });
      setMsg('✅ Notification preferences saved.');
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0A1628', marginBottom: 6 }}>Alert Preferences</h3>
      <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>Choose which events trigger notifications for you.</p>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F1F5F9', overflow: 'hidden' }}>
        {PREF_DEFS.map((p, i) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: i < PREF_DEFS.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#0A1628', marginBottom: 2 }}>{p.label}</p>
              <p style={{ fontSize: 12, color: '#94A3B8' }}>{p.desc}</p>
            </div>
            <Toggle on={!!prefs[p.id]} onToggle={() => setPrefs(prev => ({ ...prev, [p.id]: !prev[p.id] }))} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        {msg && <p style={{ fontSize: 13, color: msg.startsWith('✅') ? '#10B981' : '#EF4444', marginBottom: 12 }}>{msg}</p>}
        <SaveBtn onClick={handleSave} loading={saving} label="Save Preferences" />
      </div>
    </div>
  );
}

// ─── Plan Tab ─────────────────────────────────────────────────────────────────
function PlanTab({ user }) {
  const plan = user?.plan || 'free';
  const conf = PLAN_INFO[plan];

  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0A1628', marginBottom: 6 }}>Current Plan</h3>
      <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>Manage your subscription and billing.</p>

      <div style={{ background: conf.bg, borderRadius: 20, padding: 24, marginBottom: 24, border: `2px solid ${conf.color}30` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ background: conf.color, color: '#fff', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 800 }}>{conf.label}</span>
            <p style={{ fontSize: 28, fontWeight: 900, color: '#0A1628', marginTop: 12, marginBottom: 4 }}>{conf.price}</p>
            <p style={{ fontSize: 13, color: '#64748B' }}>Your current plan</p>
          </div>
          <span style={{ fontSize: 32 }}>{plan === 'pro' ? '⭐' : plan === 'plus' ? '💎' : '🆓'}</span>
        </div>
        <ul style={{ marginTop: 20, paddingLeft: 0, listStyle: 'none' }}>
          {conf.features.map((f, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 14, color: '#374151' }}>
              <span style={{ color: conf.color, fontWeight: 800 }}>✓</span> {f}
            </li>
          ))}
        </ul>
      </div>

      {plan !== 'pro' && (
        <div style={{ background: 'linear-gradient(135deg,#0A1628,#1C3D6E)', borderRadius: 20, padding: 24, color: '#fff' }}>
          <p style={{ fontWeight: 900, fontSize: 16, marginBottom: 6 }}>
            Upgrade to {plan === 'free' ? 'Plus or Pro' : 'Pro'}
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 16 }}>
            Unlock more features and grow your savings faster.
          </p>
          <button
            onClick={() => alert('Upgrades coming soon! Stay tuned.')}
            style={{ background: '#00D4A1', border: 'none', color: '#0A1628', fontWeight: 800, fontSize: 14, borderRadius: 12, padding: '12px 24px', cursor: 'pointer' }}
          >
            View Upgrade Options
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main SettingsPage ────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 40px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0A1628', marginBottom: 6 }}>Settings</h1>
      <p style={{ fontSize: 14, color: '#64748B', marginBottom: 28 }}>Manage your account, security, and preferences.</p>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Sidebar tabs */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F1F5F9', overflow: 'hidden' }}>
            {TABS.map((tab, i) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '14px 16px', border: 'none', textAlign: 'left', cursor: 'pointer',
                  background: activeTab === tab.id ? '#F0FDF9' : '#fff',
                  borderLeft: activeTab === tab.id ? '3px solid #00D4A1' : '3px solid transparent',
                  borderBottom: i < TABS.length - 1 ? '1px solid #F1F5F9' : 'none',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: 14, color: activeTab === tab.id ? '#00A87F' : '#475569',
                }}
              >
                <span style={{ fontSize: 17 }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content panel */}
        <div style={{ flex: 1, background: '#fff', borderRadius: 20, border: '1px solid #F1F5F9', padding: 28 }}>
          {activeTab === 'profile'       && <ProfileTab       user={user} onUpdate={updateUser} />}
          {activeTab === 'security'      && <SecurityTab />}
          {activeTab === 'notifications' && <NotificationsTab user={user} />}
          {activeTab === 'plan'          && <PlanTab          user={user} />}
        </div>
      </div>
    </div>
  );
}
