import React, { useState, useEffect } from 'react';
import api from '../services/api';

// Category → emoji mapping for round-up entries
const CATEGORY_EMOJI = {
  coffee:       '☕',
  petrol:       '⛽',
  grocery:      '🛒',
  groceries:    '🛒',
  food:         '🍔',
  transport:    '🚗',
  shopping:     '🛍️',
  leisure:      '🎬',
  health:       '💪',
  subscription: '📱',
  subscript:    '📱',
  manual:       '✏️',
  bank:         '🏦',
};
const categoryEmoji = (cat) => CATEGORY_EMOJI[cat?.toLowerCase()] || '💰';

function RingProgress({ pct, color = '#00D4A1', size = 120, stroke = 10 }) {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition:'stroke-dasharray .6s ease' }} />
    </svg>
  );
}

function LimitSettingsModal({ tracker, onClose, onSuccess }) {
  const [daily,   setDaily]   = useState(String(tracker.dailyLimit   ?? 5));
  const [monthly, setMonthly] = useState(String(tracker.monthlyLimit ?? 100));
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const d = parseFloat(daily), m = parseFloat(monthly);
    if (!d || d <= 0) { setError('Enter a valid daily limit'); return; }
    if (!m || m <= 0) { setError('Enter a valid monthly limit'); return; }
    setLoading(true);
    try {
      await api.patch('/savings-tracker/limits', { dailyLimit: d, monthlyLimit: m });
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'#fff', borderRadius:24, padding:32, width:'100%', maxWidth:420 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <h2 style={{ fontSize:20, fontWeight:900, color:'#0A1628' }}>Savings Limits</h2>
          <button onClick={onClose} style={{ background:'#F5F7FA', border:'none', width:36, height:36, borderRadius:10, cursor:'pointer', fontSize:18, color:'#64748B' }}>✕</button>
        </div>
        {error && <div className="alert alert-error" style={{ marginBottom:16 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Daily Limit (£)</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#64748B', fontWeight:700 }}>£</span>
              <input type="number" min="0.01" step="0.01" className="form-input" placeholder="5.00"
                value={daily} onChange={e => setDaily(e.target.value)} style={{ paddingLeft:30 }} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Monthly Limit (£)</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#64748B', fontWeight:700 }}>£</span>
              <input type="number" min="0.01" step="0.01" className="form-input" placeholder="100.00"
                value={monthly} onChange={e => setMonthly(e.target.value)} style={{ paddingLeft:30 }} />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ height:50, fontWeight:700, borderRadius:14 }}>
            {loading ? 'Saving…' : 'Save Limits'}
          </button>
        </form>
      </div>
    </div>
  );
}

function ManualSaveModal({ onClose, onSuccess }) {
  const [amount,  setAmount]  = useState('');
  const [note,    setNote]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError('Enter a valid amount'); return; }
    setLoading(true);
    try {
      await api.post('/savings-tracker/manual', { amount: amt, note });
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const QUICK = [0.5, 1, 2, 5, 10];

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'#fff', borderRadius:24, padding:32, width:'100%', maxWidth:420 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <h2 style={{ fontSize:20, fontWeight:900, color:'#0A1628' }}>Manual Micro-Save</h2>
          <button onClick={onClose} style={{ background:'#F5F7FA', border:'none', width:36, height:36, borderRadius:10, cursor:'pointer', fontSize:18, color:'#64748B' }}>✕</button>
        </div>
        {error && <div className="alert alert-error" style={{ marginBottom:16 }}>{error}</div>}
        <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
          {QUICK.map(q => (
            <button key={q} onClick={() => setAmount(String(q))}
              style={{ flex:'1 1 auto', padding:'7px 10px', borderRadius:10,
                background: amount === String(q) ? '#064E3B' : '#F5F7FA',
                color: amount === String(q) ? '#00D4A1' : '#0A1628',
                border:'none', fontWeight:700, fontSize:13, cursor:'pointer' }}>
              £{q}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Amount (£)</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#64748B', fontWeight:700 }}>£</span>
              <input type="number" min="0.01" step="0.01" className="form-input" placeholder="0.00"
                value={amount} onChange={e => setAmount(e.target.value)} style={{ paddingLeft:30 }} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Note (optional)</label>
            <input type="text" className="form-input" placeholder="e.g. Coffee round-up"
              value={note} onChange={e => setNote(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ height:50, fontWeight:700, borderRadius:14, background:'linear-gradient(135deg,#064E3B,#00D4A1)' }}>
            {loading ? 'Saving…' : `Save £${parseFloat(amount||0).toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  );
}

function AddBankAccountModal({ onClose, onSuccess }) {
  const [form, setForm]       = useState({ bankName:'', accountHolder:'', accountNumber:'', sortCode:'', subType:'current' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bankName.trim())       { setError('Enter a bank name'); return; }
    if (!form.accountHolder.trim())  { setError('Enter account holder name'); return; }
    if (!form.accountNumber.trim())  { setError('Enter account number'); return; }
    setLoading(true);
    try {
      await api.post('/cards', {
        bankName:     form.bankName,
        cardHolder:   form.accountHolder,
        cardNumber:   form.accountNumber,
        network:      'Visa',      // not used for bank accounts
        expiryDate:   'N/A',
        accountType:  'bank',
      });
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const SUB_TYPES = ['current', 'savings', 'isa', 'business'];

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'#fff', borderRadius:24, padding:32, width:'100%', maxWidth:440 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <div>
            <h2 style={{ fontSize:20, fontWeight:900, color:'#0A1628' }}>Link Bank Account</h2>
            <p style={{ color:'#64748B', fontSize:13, marginTop:2 }}>Used for automatic round-ups</p>
          </div>
          <button onClick={onClose} style={{ background:'#F5F7FA', border:'none', width:36, height:36, borderRadius:10, cursor:'pointer', fontSize:18, color:'#64748B' }}>✕</button>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom:16, marginTop:12 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ marginTop:20 }}>
          {[
            { key:'bankName',       label:'Bank Name',            placeholder:'e.g. Barclays, HSBC, Lloyds' },
            { key:'accountHolder',  label:'Account Holder Name',  placeholder:'Full name on account' },
            { key:'accountNumber',  label:'Account Number',       placeholder:'8-digit account number' },
            { key:'sortCode',       label:'Sort Code (optional)',  placeholder:'00-00-00' },
          ].map(f => (
            <div key={f.key} className="form-group">
              <label className="form-label">{f.label}</label>
              <input type="text" className="form-input" placeholder={f.placeholder}
                value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                required={f.key !== 'sortCode'} />
            </div>
          ))}

          <div className="form-group">
            <label className="form-label">Account Type</label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {SUB_TYPES.map(t => (
                <button key={t} type="button" onClick={() => setForm(p => ({ ...p, subType: t }))}
                  style={{ padding:'10px 14px', borderRadius:12, border:`2px solid ${form.subType === t ? '#0A1628' : '#E2E8F0'}`,
                    background: form.subType === t ? '#0A162808' : '#fff',
                    fontWeight:700, fontSize:13, color:'#0A1628', cursor:'pointer', textTransform:'capitalize' }}>
                  {t === 'isa' ? 'ISA' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ height:50, fontWeight:700, borderRadius:14, marginTop:8 }}>
            {loading ? 'Linking…' : 'Link Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SavingsTrackerPage() {
  const [tracker,      setTracker]      = useState(null);
  const [entries,      setEntries]      = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showLimits,   setShowLimits]   = useState(false);
  const [showManual,   setShowManual]   = useState(false);
  const [showAddBank,  setShowAddBank]  = useState(false);

  const load = async () => {
    try {
      const [trackerRes, entriesRes, cardsRes] = await Promise.all([
        api.get('/savings-tracker'),
        api.get('/savings-tracker/entries').catch(() => ({ data: [] })),
        api.get('/cards').catch(() => ({ data: [] })),
      ]);
      setTracker(trackerRes.data);
      setEntries(Array.isArray(entriesRes.data) ? entriesRes.data : []);
      const allCards = Array.isArray(cardsRes.data) ? cardsRes.data : [];
      setBankAccounts(allCards.filter(c => c.accountType === 'bank'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const t            = tracker || {};
  const totalSaved   = Number(t.totalSaved   ?? 0);
  const todaySaved   = Number(t.todaySaved   ?? 0);
  const monthSaved   = Number(t.monthSaved   ?? 0);
  const dailyLimit   = Number(t.dailyLimit   ?? 5);
  const monthlyLimit = Number(t.monthlyLimit ?? 100);
  const dailyPct     = dailyLimit   > 0 ? Math.min(Math.round((todaySaved  / dailyLimit)   * 100), 100) : 0;
  const monthlyPct   = monthlyLimit > 0 ? Math.min(Math.round((monthSaved  / monthlyLimit) * 100), 100) : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:900, color:'#0A1628' }}>Micro-Savings</h1>
          <p style={{ color:'#64748B', fontSize:14, marginTop:2 }}>Round-ups and surplus savings tracker</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => setShowLimits(true)}
            style={{ background:'#F5F7FA', border:'1.5px solid #E2E8F0', color:'#0A1628', padding:'0 18px', height:44, borderRadius:14, fontWeight:700, fontSize:13, cursor:'pointer' }}>
            ⚙️ Limits
          </button>
          <button onClick={() => setShowManual(true)} className="btn btn-primary" style={{ height:44, borderRadius:14 }}>
            + Manual Save
          </button>
        </div>
      </div>

      {/* Hero banner */}
      <div style={{ background:'linear-gradient(135deg,#064E3B,#065F46)', borderRadius:24, padding:28, marginBottom:24, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', width:280, height:280, borderRadius:'50%', background:'rgba(0,212,161,.06)', top:-80, right:-60 }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <p style={{ color:'rgba(255,255,255,.55)', fontSize:13, marginBottom:4 }}>Total Micro-Saved</p>
          <p style={{ color:'#00D4A1', fontSize:44, fontWeight:900, letterSpacing:-1, marginBottom:4 }}>
            £{totalSaved.toLocaleString('en-GB', { minimumFractionDigits:2 })}
          </p>
          <p style={{ color:'rgba(255,255,255,.4)', fontSize:13 }}>Every penny saved adds up</p>
        </div>
      </div>

      {/* Daily + Monthly rings */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 }}>
        {[
          { label:'Today',      pct:dailyPct,   saved:todaySaved, limit:dailyLimit,   color:'#00D4A1' },
          { label:'This Month', pct:monthlyPct, saved:monthSaved, limit:monthlyLimit, color:'#3B82F6' },
        ].map(s => (
          <div key={s.label} className="card" style={{ display:'flex', alignItems:'center', gap:24 }}>
            <div style={{ position:'relative', flexShrink:0 }}>
              <RingProgress pct={s.pct} color={s.color} size={110} stroke={10} />
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
                <span style={{ fontSize:18, fontWeight:900, color:s.color }}>{s.pct}%</span>
              </div>
            </div>
            <div>
              <p style={{ fontSize:12, color:'#94A3B8', fontWeight:600, textTransform:'uppercase', letterSpacing:.5, marginBottom:4 }}>{s.label}</p>
              <p style={{ fontSize:22, fontWeight:900, color:'#0A1628', marginBottom:2 }}>£{s.saved.toFixed(2)}</p>
              <p style={{ fontSize:13, color:'#64748B' }}>of £{s.limit.toFixed(0)} limit</p>
              <div className="progress-bar" style={{ marginTop:10, width:140 }}>
                <div className="progress-fill" style={{ width:`${s.pct}%`, background:s.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16, marginBottom:28 }}>
        {[
          { icon:'📅', label:'Daily Limit',   val:`£${dailyLimit.toFixed(2)}`,   color:'#00D4A1' },
          { icon:'📆', label:'Monthly Limit', val:`£${monthlyLimit.toFixed(2)}`, color:'#3B82F6' },
          { icon:'💰', label:'Total Saved',   val:`£${totalSaved.toFixed(2)}`,   color:'#A855F7' },
          { icon:'📊', label:'Entries',       val: entries.length,               color:'#F4A261' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ width:44, height:44, borderRadius:14, background:s.color+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, marginBottom:12 }}>{s.icon}</div>
            <p style={{ fontSize:12, color:'#64748B', fontWeight:500, marginBottom:4 }}>{s.label}</p>
            <p style={{ fontSize:20, fontWeight:900, color:'#0A1628' }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Recent micro-saves entries */}
      <div className="card" style={{ marginBottom:24 }}>
        <h3 className="section-title" style={{ marginBottom:4 }}>Recent Micro-Saves</h3>
        <p className="section-subtitle" style={{ marginBottom:18 }}>Your round-up and manual savings history</p>

        {entries.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px 0' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🌱</div>
            <p style={{ color:'#94A3B8', fontSize:14 }}>No savings entries yet — start by making a manual save!</p>
          </div>
        ) : (
          entries.slice(0, 30).map((entry, i) => (
            <div key={entry._id ?? i} style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 0', borderBottom: i < Math.min(entries.length, 30) - 1 ? '1px solid #F5F7FA' : 'none' }}>
              {/* Category icon */}
              <div style={{ width:44, height:44, borderRadius:13, background:'#D1FAE5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                {entry.type === 'manual' ? '✏️' : categoryEmoji(entry.category)}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                {/* Merchant / title */}
                <p style={{ fontWeight:700, fontSize:14, color:'#0A1628', marginBottom:2 }}>
                  {entry.title || (entry.type === 'manual' ? 'Manual Save' : 'Round-up')}
                </p>
                {/* Description and date */}
                <p style={{ fontSize:12, color:'#94A3B8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {entry.subtitle || entry.category || (entry.type === 'manual' ? 'Manual entry' : 'Round-up')}
                  {' · '}
                  {new Date(entry.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                </p>
              </div>
              <p style={{ fontWeight:800, fontSize:15, color:'#10B981', flexShrink:0 }}>
                +£{Number(entry.amount ?? 0).toFixed(2)}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Linked Bank Accounts */}
      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <div>
            <h3 className="section-title" style={{ marginBottom:4 }}>Linked Bank Accounts</h3>
            <p className="section-subtitle">Accounts used for automatic round-ups</p>
          </div>
          <button onClick={() => setShowAddBank(true)} className="btn btn-primary"
            style={{ height:40, borderRadius:12, fontSize:13, padding:'0 16px' }}>
            + Link Account
          </button>
        </div>

        {bankAccounts.length === 0 ? (
          <div style={{ textAlign:'center', padding:'36px 0' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🏦</div>
            <p style={{ fontWeight:700, color:'#0A1628', marginBottom:6 }}>No bank accounts linked</p>
            <p style={{ color:'#94A3B8', fontSize:13, marginBottom:20 }}>Link a bank account to enable automatic round-ups on your purchases</p>
            <button onClick={() => setShowAddBank(true)} className="btn btn-primary" style={{ borderRadius:14, height:44 }}>
              Link Your First Account
            </button>
          </div>
        ) : (
          bankAccounts.map((acc, i) => (
            <div key={acc._id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 0', borderBottom: i < bankAccounts.length - 1 ? '1px solid #F5F7FA' : 'none' }}>
              <div style={{ width:46, height:46, borderRadius:13, background:'#EFF6FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>🏦</div>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700, fontSize:14, color:'#0A1628', marginBottom:2 }}>{acc.bank}</p>
                <p style={{ fontSize:12, color:'#94A3B8' }}>
                  ••••{acc.last4} · {acc.holder}
                  {acc.isDefault && <span style={{ marginLeft:8, color:'#00D4A1', fontWeight:700, fontSize:11 }}>DEFAULT</span>}
                </p>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ fontWeight:800, fontSize:15, color:'#0A1628' }}>£{Number(acc.balance ?? 0).toFixed(2)}</p>
                <p style={{ fontSize:11, color:'#94A3B8' }}>balance</p>
              </div>
            </div>
          ))
        )}
      </div>

      {showLimits  && <LimitSettingsModal tracker={t} onClose={() => setShowLimits(false)}  onSuccess={() => { setShowLimits(false);  load(); }} />}
      {showManual  && <ManualSaveModal                onClose={() => setShowManual(false)}   onSuccess={() => { setShowManual(false);   load(); }} />}
      {showAddBank && <AddBankAccountModal            onClose={() => setShowAddBank(false)}  onSuccess={() => { setShowAddBank(false);  load(); }} />}
    </div>
  );
}
