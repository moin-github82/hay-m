import React, { useState } from 'react';

const PREFS_DEFAULT = [
  { id: 'goal_100',    label: 'Goal reached 100%',                desc: 'When any savings goal is fully funded',          enabled: true  },
  { id: 'goal_50',     label: 'Goal reached 50%',                 desc: 'Halfway milestone for each goal',                enabled: true  },
  { id: 'invest_10',   label: 'Investment up 10%',                desc: 'When portfolio value grows by 10%',              enabled: true  },
  { id: 'invest_25',   label: 'Investment up 25%',                desc: 'Major portfolio growth milestone',               enabled: false },
  { id: 'weekly_sum',  label: 'Weekly spending summary',          desc: 'Every Sunday — your 7-day spend recap',          enabled: true  },
  { id: 'monthly_rep', label: 'Monthly savings report',           desc: 'First of each month — how you did overall',      enabled: true  },
  { id: 'autosave',    label: 'Auto-save executed',               desc: 'Confirmation when auto-save runs',               enabled: true  },
  { id: 'large_tx',   label: 'Large transaction detected (>£50)', desc: 'Alert for any single spend over £50',            enabled: false },
];

const MILESTONE_OPTIONS = ['Savings Goal', 'Portfolio Value', 'Monthly Savings'];

const MOCK_NOTIFS = [
  { id: 1, icon: '🎯', title: 'Holiday fund hit 75%!',              message: "You're three-quarters of the way to your Santorini trip.",     time: '2 hours ago',  unread: true  },
  { id: 2, icon: '📈', title: 'Portfolio up £127 this week',        message: 'Your Vanguard S&P 500 holding drove most of the gain.',         time: '1 day ago',    unread: true  },
  { id: 3, icon: '💰', title: 'Auto-saved £12.40 today',            message: 'Round-ups from 6 transactions were swept to your savings pot.', time: '1 day ago',    unread: false },
  { id: 4, icon: '⚠️', title: 'Large transaction: Amazon £84.99',  message: 'This exceeded your £50 large-spend threshold.',                 time: '2 days ago',   unread: true  },
  { id: 5, icon: '📊', title: 'Weekly spending summary ready',      message: "You spent £184 this week — 12% less than last week. Nice!",    time: '3 days ago',   unread: false },
  { id: 6, icon: '🏆', title: 'Emergency fund goal reached 50%',   message: 'Halfway there! Keep going — £1,250 saved of £2,500 target.',   time: '5 days ago',   unread: false },
  { id: 7, icon: '💹', title: 'Investment up 10% all-time',         message: 'Your portfolio has grown 10% since you started investing.',     time: '1 week ago',   unread: false },
  { id: 8, icon: '📅', title: 'Monthly savings report: March',      message: 'You saved £342 in March — your best month yet!',               time: '2 weeks ago',  unread: false },
];

function Toggle({ enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 46, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', flexShrink: 0,
        background: enabled ? '#00D4A1' : '#E2E8F0',
        position: 'relative', transition: 'background .2s',
        padding: 0,
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3,
        left: enabled ? 23 : 3,
        transition: 'left .2s',
        boxShadow: '0 1px 4px rgba(0,0,0,.2)',
      }} />
    </button>
  );
}

export default function NotificationsPage() {
  const [prefs, setPrefs]             = useState(PREFS_DEFAULT);
  const [saved, setSaved]             = useState(false);
  const [milestoneType, setMilestone] = useState('Savings Goal');
  const [milestoneAmt, setMilestoneAmt] = useState('');
  const [customAlerts, setCustomAlerts] = useState([
    { id: 1, type: 'Savings Goal',   amount: '£1,000' },
    { id: 2, type: 'Portfolio Value', amount: '£5,000' },
  ]);
  const [notifs, setNotifs]           = useState(MOCK_NOTIFS);

  const togglePref = id => {
    setPrefs(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const addAlert = () => {
    if (!milestoneAmt || isNaN(Number(milestoneAmt.replace(/[^0-9.]/g, '')))) return;
    const amt = Number(milestoneAmt.replace(/[^0-9.]/g, ''));
    setCustomAlerts(prev => [...prev, { id: Date.now(), type: milestoneType, amount: `£${amt.toLocaleString('en-GB')}` }]);
    setMilestoneAmt('');
  };

  const removeAlert = id => setCustomAlerts(prev => prev.filter(a => a.id !== id));

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, unread: false })));

  const unreadCount = notifs.filter(n => n.unread).length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0A1628' }}>Notifications & Milestones</h1>
        <p style={{ color: '#64748B', fontSize: 14, marginTop: 2 }}>Control what alerts you receive and set custom milestones</p>
      </div>

      {/* Top two-col layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28, alignItems: 'start' }}>

        {/* Preferences */}
        <div style={{ background: '#fff', borderRadius: 24, padding: 28, border: '1.5px solid #F1F5F9', boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0A1628', marginBottom: 4 }}>Notification Preferences</h2>
          <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 24 }}>Choose which events trigger a notification</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {prefs.map((pref, i) => (
              <div key={pref.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                padding: '14px 0',
                borderBottom: i < prefs.length - 1 ? '1px solid #F5F7FA' : 'none',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#0A1628', marginBottom: 2 }}>{pref.label}</p>
                  <p style={{ fontSize: 12, color: '#94A3B8' }}>{pref.desc}</p>
                </div>
                <Toggle enabled={pref.enabled} onToggle={() => togglePref(pref.id)} />
              </div>
            ))}
          </div>
          <button
            onClick={handleSave}
            style={{
              marginTop: 20, width: '100%', padding: '12px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
              fontWeight: 800, fontSize: 14,
              background: saved ? '#10B981' : '#0A1628',
              color: '#fff', transition: 'background .3s',
            }}
          >
            {saved ? '✓ Preferences Saved!' : 'Save Preferences'}
          </button>
        </div>

        {/* Milestone configurator */}
        <div style={{ background: '#fff', borderRadius: 24, padding: 28, border: '1.5px solid #F1F5F9', boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0A1628', marginBottom: 4 }}>Custom Milestone Alerts</h2>
          <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 24 }}>Get notified when you hit a specific target</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 6 }}>Alert type</label>
              <select
                value={milestoneType}
                onChange={e => setMilestone(e.target.value)}
                className="form-input"
                style={{ margin: 0 }}
              >
                {MILESTONE_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 6 }}>Target amount (£)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontWeight: 700 }}>£</span>
                  <input
                    type="number" min="1" placeholder="0"
                    value={milestoneAmt}
                    onChange={e => setMilestoneAmt(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: 28, margin: 0 }}
                  />
                </div>
                <button
                  onClick={addAlert}
                  style={{ padding: '0 20px', height: 46, borderRadius: 12, border: 'none', background: '#00D4A1', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  Add Alert
                </button>
              </div>
            </div>
          </div>

          <p style={{ fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 12 }}>Active alerts</p>
          {customAlerts.length === 0 ? (
            <p style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', padding: '20px 0' }}>No custom alerts yet</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {customAlerts.map(alert => (
                <div key={alert.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: '#F1F5F9', borderRadius: 20, padding: '6px 12px',
                  fontSize: 13, fontWeight: 600, color: '#0A1628',
                }}>
                  <span>{alert.type}: {alert.amount}</span>
                  <button
                    onClick={() => removeAlert(alert.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 14, padding: 0, lineHeight: 1, fontWeight: 700 }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent notifications */}
      <div style={{ background: '#fff', borderRadius: 24, padding: 28, border: '1.5px solid #F1F5F9', boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0A1628', marginBottom: 2 }}>
              Recent Notifications
              {unreadCount > 0 && (
                <span style={{ marginLeft: 10, background: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20 }}>
                  {unreadCount} new
                </span>
              )}
            </h2>
            <p style={{ fontSize: 13, color: '#94A3B8' }}>Your latest alerts and milestones</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{ padding: '8px 16px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: '#fff', color: '#64748B', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
            >
              Mark all as read
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {notifs.map((n, i) => (
            <div key={n.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 14,
              padding: '14px 0',
              borderBottom: i < notifs.length - 1 ? '1px solid #F5F7FA' : 'none',
              background: n.unread ? 'rgba(0,212,161,.02)' : 'transparent',
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: '#F5F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                {n.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#0A1628', marginBottom: 3 }}>{n.title}</p>
                <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>{n.message}</p>
                <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>{n.time}</p>
              </div>
              {n.unread && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00D4A1', flexShrink: 0, marginTop: 6 }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
