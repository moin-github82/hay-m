import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const GOAL_COLORS = ['#00D4A1','#3B82F6','#A855F7','#F4A261','#EF4444','#10B981','#F59E0B'];
const EMOJIS = ['🏠','🚗','✈️','🎓','💍','💻','🏖️','🏋️','📱','🎯','💰','🌱'];

// ─── Circular Progress Ring ───────────────────────────────────────────────────
function ProgressRing({ pct, color, size = 80 }) {
  const r    = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform:'rotate(-90deg)', flexShrink:0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={8} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        style={{ transition:'stroke-dasharray .6s ease' }} />
    </svg>
  );
}

// ─── Goal Card ────────────────────────────────────────────────────────────────
function GoalCard({ goal, onAddFunds, onSelect, onDelete, onEdit }) {
  const pct       = goal.target > 0 ? Math.min(Math.round((goal.current / goal.target) * 100), 100) : 0;
  const color     = goal.color || '#00D4A1';
  const remaining = Math.max(0, (goal.target || 0) - (goal.current || 0));

  return (
    <div style={{ background:'#fff', borderRadius:24, border:'1.5px solid #F1F5F9',
      boxShadow:'0 2px 12px rgba(0,0,0,.05)', transition:'transform .2s, box-shadow .2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 10px 28px rgba(0,0,0,.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,.05)'; }}>

      {/* Colour accent top strip */}
      <div style={{ height:4, borderRadius:'24px 24px 0 0', background:`linear-gradient(90deg,${color},${color}88)` }} />

      <div style={{ padding:22 }}>
        {/* Top row */}
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18 }}>
          <div style={{ position:'relative', flexShrink:0 }}>
            <ProgressRing pct={pct} color={color} size={76} />
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
              <span style={{ fontSize:18 }}>{goal.emoji || '🎯'}</span>
            </div>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontWeight:900, fontSize:15, color:'#0A1628', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{goal.name}</p>
            <p style={{ fontSize:12, color:'#94A3B8', marginBottom:6 }}>
              {goal.isCompleted ? '✅ Goal achieved!' : `£${Number(remaining).toLocaleString('en-GB',{minimumFractionDigits:2})} to go`}
            </p>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ flex:1, height:5, borderRadius:3, background:'#F1F5F9', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:3, transition:'width .5s' }} />
              </div>
              <span style={{ fontSize:12, fontWeight:800, color, flexShrink:0 }}>{pct}%</span>
            </div>
            {(goal.autoSave > 0 && goal.autoSaveFrequency && goal.autoSaveFrequency !== 'none') && (
              <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:6 }}>
                <span style={{ fontSize:11 }}>🔄</span>
                <span style={{ fontSize:11, color:'#94A3B8', fontWeight:600 }}>
                  £{goal.autoSave} / {goal.autoSaveFrequency}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Amounts */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
          <div style={{ background:'#F5F7FA', borderRadius:12, padding:'10px 14px' }}>
            <p style={{ fontSize:10, color:'#94A3B8', fontWeight:700, textTransform:'uppercase', marginBottom:3 }}>Saved</p>
            <p style={{ fontSize:15, fontWeight:900, color:'#0A1628' }}>£{Number(goal.current??0).toLocaleString('en-GB',{minimumFractionDigits:2})}</p>
          </div>
          <div style={{ background:'#F5F7FA', borderRadius:12, padding:'10px 14px' }}>
            <p style={{ fontSize:10, color:'#94A3B8', fontWeight:700, textTransform:'uppercase', marginBottom:3 }}>Target</p>
            <p style={{ fontSize:15, fontWeight:900, color:'#0A1628' }}>£{Number(goal.target??0).toLocaleString('en-GB',{minimumFractionDigits:2})}</p>
          </div>
        </div>

        {goal.isCompleted ? (
          <div>
            <div style={{ textAlign:'center', padding:'10px', borderRadius:14, background:'#D1FAE5', color:'#059669', fontWeight:800, fontSize:14, marginBottom:10 }}>
              🎉 Goal Achieved!
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={e => { e.stopPropagation(); onEdit(goal); }}
                style={{ flex:1, padding:'10px', borderRadius:14, background:'#F1F5F9', border:'none', color:'#475569', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                ✏️ Edit
              </button>
              <button onClick={e => { e.stopPropagation(); onDelete(goal._id); }}
                style={{ width:44, height:40, borderRadius:14, border:'1.5px solid #FEE2E2', background:'#FEF2F2', color:'#EF4444', fontWeight:700, fontSize:16, cursor:'pointer' }}>
                🗑
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={e => { e.stopPropagation(); onAddFunds(goal); }}
              style={{ flex:1, padding:'10px', borderRadius:14, background:color, border:'none', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer' }}>
              + Add Funds
            </button>
            <button onClick={e => { e.stopPropagation(); onEdit(goal); }}
              style={{ width:44, height:40, borderRadius:14, border:'1.5px solid #E2E8F0', background:'#F8FAFC', color:'#475569', fontWeight:700, fontSize:16, cursor:'pointer' }}>
              ✏️
            </button>
            <button onClick={e => { e.stopPropagation(); onDelete(goal._id); }}
              style={{ width:44, height:40, borderRadius:14, border:'1.5px solid #FEE2E2', background:'#FEF2F2', color:'#EF4444', fontWeight:700, fontSize:16, cursor:'pointer' }}>
              🗑
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Add Funds Modal ──────────────────────────────────────────────────────────
function AddFundsModal({ goal, onClose, onSuccess }) {
  const [amount,     setAmount]     = useState('');
  const [source,     setSource]     = useState('balance');
  const [walletBal,  setWalletBal]  = useState(0);
  const [microBal,   setMicroBal]   = useState(0);
  const [loading,    setLoading]    = useState(false);
  const [loadingBal, setLoadingBal] = useState(true);
  const [error,      setError]      = useState('');
  const color = goal.color || '#00D4A1';

  useEffect(() => {
    const fetchBals = async () => {
      try {
        const [cardsRes, trackerRes] = await Promise.all([
          api.get('/cards'),
          api.get('/savings-tracker'),
        ]);
        const cards = Array.isArray(cardsRes.data) ? cardsRes.data : [];
        const def   = cards.find(c => c.isDefault) ?? cards[0];
        setWalletBal(Number(def?.balance) || 0);
        setMicroBal(Number(trackerRes.data?.totalSaved) || 0);
      } catch {} finally { setLoadingBal(false); }
    };
    fetchBals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError('Enter a valid amount'); return; }
    const avail = source === 'balance' ? walletBal : microBal;
    if (amt > avail) { setError(`Insufficient ${source === 'balance' ? 'card' : 'micro-savings'} balance`); return; }
    const goalId = String(goal?._id ?? goal?.id ?? '');
    if (!goalId || goalId === 'undefined') { setError('Invalid goal'); return; }
    setLoading(true);
    try { await api.post(`/goals/${goalId}/add-funds`, { amount:amt, source }); onSuccess(); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'#fff', borderRadius:28, padding:32, width:'100%', maxWidth:440 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div>
            <h2 style={{ fontSize:20, fontWeight:900, color:'#0A1628' }}>Add Funds</h2>
            <p style={{ color:'#94A3B8', fontSize:13 }}>→ {goal.emoji} {goal.name}</p>
          </div>
          <button onClick={onClose} style={{ background:'#F5F7FA', border:'none', width:36, height:36, borderRadius:10, cursor:'pointer', fontSize:18, color:'#64748B' }}>✕</button>
        </div>
        {error && <div className="alert alert-error" style={{ marginBottom:16 }}>{error}</div>}

        <p style={{ fontSize:13, fontWeight:700, color:'#0A1628', marginBottom:10 }}>Source</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
          {[
            { val:'balance',     label:'Default Card',  bal:`£${walletBal.toFixed(2)}`,  icon:'💳' },
            { val:'microsavings',label:'Micro-Savings', bal:`£${microBal.toFixed(2)}`,   icon:'💰' },
          ].map(s => (
            <button key={s.val} onClick={() => setSource(s.val)}
              style={{ padding:'14px', borderRadius:16, border:`2px solid ${source===s.val ? color : '#E2E8F0'}`,
                background: source===s.val ? color+'08' : '#fff', cursor:'pointer', textAlign:'left' }}>
              <span style={{ fontSize:22 }}>{s.icon}</span>
              <p style={{ fontWeight:700, fontSize:13, color:'#0A1628', margin:'4px 0 2px' }}>{s.label}</p>
              <p style={{ fontSize:12, color: loadingBal ? '#94A3B8' : '#10B981', fontWeight:700 }}>
                {loadingBal ? '…' : s.bal}
              </p>
            </button>
          ))}
        </div>

        <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
          {[5,10,25,50,100].map(q => (
            <button key={q} onClick={() => setAmount(String(q))}
              style={{ flex:'1 1 auto', padding:'7px 4px', borderRadius:10, border:'none', cursor:'pointer', fontSize:13, fontWeight:700,
                background: amount===String(q) ? '#0A1628' : '#F5F7FA',
                color: amount===String(q) ? '#fff' : '#0A1628' }}>
              £{q}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Amount</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#64748B', fontWeight:700 }}>£</span>
              <input type="number" min="0.01" step="0.01" className="form-input" placeholder="0.00"
                value={amount} onChange={e => setAmount(e.target.value)} style={{ paddingLeft:30 }} />
            </div>
          </div>
          <button type="submit" disabled={loading || loadingBal} className="btn btn-primary w-full" style={{ height:50, fontWeight:700, borderRadius:14 }}>
            {loading ? 'Adding…' : `Add £${parseFloat(amount||0).toFixed(2)} to Goal`}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Create Goal Modal ────────────────────────────────────────────────────────
function CreateGoalModal({ onClose, onSuccess }) {
  const [form,    setForm]    = useState({ name:'', target:'', emoji:'🎯', color:'#00D4A1', deadline:'', autoSave:'', autoSaveFrequency:'monthly' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Enter a goal name'); return; }
    if (!form.target || parseFloat(form.target) <= 0) { setError('Enter a valid target amount'); return; }
    setLoading(true);
    try {
      await api.post('/goals', {
        name: form.name,
        target: parseFloat(form.target),
        emoji: form.emoji,
        color: form.color,
        deadline: form.deadline || undefined,
        autoSave: parseFloat(form.autoSave) || 0,
        autoSaveFrequency: parseFloat(form.autoSave) > 0 ? form.autoSaveFrequency : 'none',
      });
      onSuccess();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'#fff', borderRadius:28, padding:32, width:'100%', maxWidth:460, maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <h2 style={{ fontSize:20, fontWeight:900, color:'#0A1628' }}>New Savings Goal</h2>
          <button onClick={onClose} style={{ background:'#F5F7FA', border:'none', width:36, height:36, borderRadius:10, cursor:'pointer', fontSize:18, color:'#64748B' }}>✕</button>
        </div>
        {error && <div className="alert alert-error" style={{ marginBottom:16 }}>{error}</div>}

        <p style={{ fontSize:13, fontWeight:700, color:'#0A1628', marginBottom:10 }}>Pick an icon</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
          {EMOJIS.map(em => (
            <button key={em} onClick={() => setForm(p => ({ ...p, emoji:em }))}
              style={{ width:42, height:42, borderRadius:12, border:`2px solid ${form.emoji===em ? '#0A1628' : '#E2E8F0'}`,
                background: form.emoji===em ? '#0A162810' : '#fff', fontSize:20, cursor:'pointer' }}>
              {em}
            </button>
          ))}
        </div>

        <p style={{ fontSize:13, fontWeight:700, color:'#0A1628', marginBottom:10 }}>Colour</p>
        <div style={{ display:'flex', gap:10, marginBottom:20 }}>
          {GOAL_COLORS.map(c => (
            <button key={c} onClick={() => setForm(p => ({ ...p, color:c }))}
              style={{ width:32, height:32, borderRadius:'50%', background:c, border:`3px solid ${form.color===c ? '#0A1628' : 'transparent'}`, cursor:'pointer' }} />
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Goal Name</label>
            <input type="text" className="form-input" placeholder="e.g. Holiday Fund"
              value={form.name} onChange={e => setForm(p => ({ ...p, name:e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Target Amount (£)</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#64748B', fontWeight:700 }}>£</span>
              <input type="number" min="1" step="0.01" className="form-input" placeholder="1,000.00"
                value={form.target} onChange={e => setForm(p => ({ ...p, target:e.target.value }))} style={{ paddingLeft:30 }} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Target Date <span style={{color:'#94A3B8',fontWeight:400}}>(optional)</span></label>
            <input type="date" className="form-input"
              value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
              min={new Date().toISOString().split('T')[0]} />
          </div>

          <div className="form-group">
            <label className="form-label">Auto-save Amount <span style={{color:'#94A3B8',fontWeight:400}}>(optional)</span></label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#64748B', fontWeight:700 }}>£</span>
              <input type="number" min="0" step="0.01" className="form-input" placeholder="0.00"
                value={form.autoSave} onChange={e => setForm(p => ({ ...p, autoSave: e.target.value }))} style={{ paddingLeft:30 }} />
            </div>
          </div>

          {parseFloat(form.autoSave) > 0 && (
            <div className="form-group">
              <label className="form-label">Frequency</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                {['daily','weekly','monthly','none'].map(f => (
                  <button key={f} type="button" onClick={() => setForm(p => ({ ...p, autoSaveFrequency: f }))}
                    style={{ padding:'9px 4px', borderRadius:10, border:`1.5px solid ${form.autoSaveFrequency===f ? '#0A1628' : '#E2E8F0'}`,
                      background: form.autoSaveFrequency===f ? '#0A1628' : '#fff',
                      color: form.autoSaveFrequency===f ? '#fff' : '#64748B',
                      fontWeight:700, fontSize:12, cursor:'pointer', textTransform:'capitalize' }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          <div style={{ background:'#F5F7FA', borderRadius:16, padding:16, marginBottom:16, display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ position:'relative', flexShrink:0 }}>
              <ProgressRing pct={0} color={form.color||'#00D4A1'} size={60} />
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontSize:20 }}>{form.emoji}</span>
              </div>
            </div>
            <div>
              <p style={{ fontWeight:800, fontSize:15, color:'#0A1628' }}>{form.name||'My Goal'}</p>
              <p style={{ fontSize:13, color:'#94A3B8' }}>Target: £{parseFloat(form.target||0).toLocaleString('en-GB')}</p>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ height:50, fontWeight:700, borderRadius:14 }}>
            {loading ? 'Creating…' : '🎯 Create Goal'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Edit Goal Modal ──────────────────────────────────────────────────────────
function EditGoalModal({ goal, onClose, onSuccess }) {
  const goalId = String(goal?._id ?? goal?.id ?? '');
  const [form, setForm] = useState({
    name:              goal.name || '',
    target:            String(goal.target || ''),
    emoji:             goal.emoji || '🎯',
    color:             goal.color || '#00D4A1',
    deadline:          goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
    autoSave:          String(goal.autoSave > 0 ? goal.autoSave : ''),
    autoSaveFrequency: goal.autoSaveFrequency || 'monthly',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Enter a goal name'); return; }
    if (!form.target || parseFloat(form.target) <= 0) { setError('Enter a valid target amount'); return; }
    setLoading(true);
    try {
      await api.patch(`/goals/${goalId}`, {
        name:              form.name,
        target:            parseFloat(form.target),
        emoji:             form.emoji,
        color:             form.color,
        deadline:          form.deadline || undefined,
        autoSave:          parseFloat(form.autoSave) || 0,
        autoSaveFrequency: parseFloat(form.autoSave) > 0 ? form.autoSaveFrequency : 'none',
      });
      onSuccess();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'#fff', borderRadius:28, padding:32, width:'100%', maxWidth:460, maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <h2 style={{ fontSize:20, fontWeight:900, color:'#0A1628' }}>Edit Goal</h2>
          <button onClick={onClose} style={{ background:'#F5F7FA', border:'none', width:36, height:36, borderRadius:10, cursor:'pointer', fontSize:18, color:'#64748B' }}>✕</button>
        </div>
        {error && <div className="alert alert-error" style={{ marginBottom:16 }}>{error}</div>}

        <p style={{ fontSize:13, fontWeight:700, color:'#0A1628', marginBottom:10 }}>Pick an icon</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
          {EMOJIS.map(em => (
            <button key={em} onClick={() => setForm(p => ({ ...p, emoji:em }))}
              style={{ width:42, height:42, borderRadius:12, border:`2px solid ${form.emoji===em ? '#0A1628' : '#E2E8F0'}`,
                background: form.emoji===em ? '#0A162810' : '#fff', fontSize:20, cursor:'pointer' }}>
              {em}
            </button>
          ))}
        </div>

        <p style={{ fontSize:13, fontWeight:700, color:'#0A1628', marginBottom:10 }}>Colour</p>
        <div style={{ display:'flex', gap:10, marginBottom:20 }}>
          {GOAL_COLORS.map(c => (
            <button key={c} onClick={() => setForm(p => ({ ...p, color:c }))}
              style={{ width:32, height:32, borderRadius:'50%', background:c, border:`3px solid ${form.color===c ? '#0A1628' : 'transparent'}`, cursor:'pointer' }} />
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Goal Name</label>
            <input type="text" className="form-input" placeholder="e.g. Holiday Fund"
              value={form.name} onChange={e => setForm(p => ({ ...p, name:e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Target Amount (£)</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#64748B', fontWeight:700 }}>£</span>
              <input type="number" min="1" step="0.01" className="form-input" placeholder="1,000.00"
                value={form.target} onChange={e => setForm(p => ({ ...p, target:e.target.value }))} style={{ paddingLeft:30 }} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Target Date <span style={{color:'#94A3B8',fontWeight:400}}>(optional)</span></label>
            <input type="date" className="form-input"
              value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
              min={new Date().toISOString().split('T')[0]} />
          </div>

          <div className="form-group">
            <label className="form-label">Auto-save Amount <span style={{color:'#94A3B8',fontWeight:400}}>(optional)</span></label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#64748B', fontWeight:700 }}>£</span>
              <input type="number" min="0" step="0.01" className="form-input" placeholder="0.00"
                value={form.autoSave} onChange={e => setForm(p => ({ ...p, autoSave: e.target.value }))} style={{ paddingLeft:30 }} />
            </div>
          </div>

          {parseFloat(form.autoSave) > 0 && (
            <div className="form-group">
              <label className="form-label">Frequency</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                {['daily','weekly','monthly','none'].map(f => (
                  <button key={f} type="button" onClick={() => setForm(p => ({ ...p, autoSaveFrequency: f }))}
                    style={{ padding:'9px 4px', borderRadius:10, border:`1.5px solid ${form.autoSaveFrequency===f ? '#0A1628' : '#E2E8F0'}`,
                      background: form.autoSaveFrequency===f ? '#0A1628' : '#fff',
                      color: form.autoSaveFrequency===f ? '#fff' : '#64748B',
                      fontWeight:700, fontSize:12, cursor:'pointer', textTransform:'capitalize' }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          <div style={{ background:'#F5F7FA', borderRadius:16, padding:16, marginBottom:16, display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ position:'relative', flexShrink:0 }}>
              <ProgressRing pct={0} color={form.color||'#00D4A1'} size={60} />
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontSize:20 }}>{form.emoji}</span>
              </div>
            </div>
            <div>
              <p style={{ fontWeight:800, fontSize:15, color:'#0A1628' }}>{form.name||'My Goal'}</p>
              <p style={{ fontSize:13, color:'#94A3B8' }}>Target: £{parseFloat(form.target||0).toLocaleString('en-GB')}</p>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ height:50, fontWeight:700, borderRadius:14 }}>
            {loading ? 'Saving…' : '✏️ Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Goal Detail Modal ────────────────────────────────────────────────────────
function GoalDetailModal({ goal, onClose, onAddFunds, onEdit, onDelete }) {
  const pct   = goal.target > 0 ? Math.min(Math.round((goal.current / goal.target) * 100), 100) : 0;
  const color = goal.color || '#00D4A1';

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'#fff', borderRadius:28, padding:32, width:'100%', maxWidth:420 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ position:'relative', flexShrink:0 }}>
              <ProgressRing pct={pct} color={color} size={70} />
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontSize:24 }}>{goal.emoji||'🎯'}</span>
              </div>
            </div>
            <div>
              <h2 style={{ fontSize:20, fontWeight:900, color:'#0A1628' }}>{goal.name}</h2>
              <span style={{ fontSize:13, fontWeight:800, color }}>{pct}% complete</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'#F5F7FA', border:'none', width:36, height:36, borderRadius:10, cursor:'pointer', fontSize:18, color:'#64748B', flexShrink:0 }}>✕</button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:24 }}>
          {[
            { label:'Saved',     val:`£${Number(goal.current??0).toLocaleString('en-GB',{minimumFractionDigits:2})}` },
            { label:'Target',    val:`£${Number(goal.target??0).toLocaleString('en-GB',{minimumFractionDigits:2})}` },
            { label:'Remaining', val:`£${Math.max(0,Number(goal.target??0)-Number(goal.current??0)).toLocaleString('en-GB',{minimumFractionDigits:2})}` },
          ].map(s => (
            <div key={s.label} style={{ background:'#F5F7FA', borderRadius:14, padding:'14px 12px', textAlign:'center' }}>
              <p style={{ fontSize:10, color:'#94A3B8', fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>{s.label}</p>
              <p style={{ fontWeight:900, fontSize:14, color:'#0A1628' }}>{s.val}</p>
            </div>
          ))}
        </div>

        <div style={{ marginBottom:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ fontSize:14, fontWeight:700, color:'#0A1628' }}>Progress</span>
            <span style={{ fontSize:14, fontWeight:900, color }}>{pct}%</span>
          </div>
          <div style={{ height:10, borderRadius:5, background:'#F1F5F9', overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:5, transition:'width .5s' }} />
          </div>
        </div>

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onEdit}
            style={{ flex:1, height:50, borderRadius:14, border:'1.5px solid #E2E8F0', background:'#fff', color:'#0A1628', fontWeight:700, fontSize:13, cursor:'pointer' }}>
            ✏️ Edit
          </button>
          {!goal.isCompleted && (
            <button onClick={() => { onClose(); onAddFunds(goal); }} className="btn btn-primary"
              style={{ flex:2, height:50, fontWeight:700, borderRadius:14 }}>
              + Add Funds
            </button>
          )}
          <button onClick={onDelete}
            style={{ flex:1, height:50, borderRadius:14, border:'1.5px solid #FEE2E2', background:'#FEE2E2', color:'#EF4444', fontWeight:700, fontSize:13, cursor:'pointer' }}>
            🗑 Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GoalsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isFreePlan = user?.plan === 'free' || !user?.plan;
  const [goals,        setGoals]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [addFundsGoal, setAddFundsGoal] = useState(null);
  const [detailGoal,   setDetailGoal]   = useState(null);
  const [showCreate,   setShowCreate]   = useState(false);
  const [filter,       setFilter]       = useState('all');
  const [editGoal,     setEditGoal]     = useState(null);

  const load = async () => {
    try { const res = await api.get('/goals'); setGoals(Array.isArray(res.data) ? res.data : []); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleDelete = (id) => {
    if (!window.confirm('Delete this goal? This cannot be undone.')) return;
    api.delete(`/goals/${id}`)
      .then(() => setGoals(prev => prev.filter(g => g._id !== id)))
      .catch(err => alert('Failed to delete: ' + err.message));
  };

  const filtered   = goals.filter(g => filter === 'active' ? !g.isCompleted : filter === 'completed' ? g.isCompleted : true);
  const totalSaved  = goals.reduce((s,g) => s + Number(g.current??0), 0);
  const totalTarget = goals.reduce((s,g) => s + Number(g.target??0), 0);
  const completed   = goals.filter(g => g.isCompleted).length;
  const overallPct  = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:900, color:'#0A1628' }}>Savings Goals</h1>
          <p style={{ color:'#64748B', fontSize:14, marginTop:2 }}>Track your financial milestones</p>
        </div>
        <div style={{ display:'flex', gap:10, flexDirection:'column', alignItems:'flex-end' }}>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => navigate('/investment')}
              style={{ height:44, padding:'0 18px', borderRadius:14, border:'1.5px solid #E2E8F0', background:'#fff', color:'#0A1628', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
              🤖 AI Invest
            </button>
            {isFreePlan && goals.length >= 1 ? (
              <button
                onClick={() => navigate('/upgrade?required=plus')}
                style={{ display:'flex', alignItems:'center', gap:8, borderRadius:14, height:44, padding:'0 20px', background:'#94A3B8', border:'none', color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer' }}
              >
                <span style={{ fontSize:16 }}>🔒</span> New Goal
              </button>
            ) : (
              <button onClick={() => setShowCreate(true)} className="btn btn-primary"
                style={{ display:'flex', alignItems:'center', gap:8, borderRadius:14, height:44 }}>
                <span style={{ fontSize:18 }}>＋</span> New Goal
              </button>
            )}
          </div>
          {isFreePlan && goals.length >= 1 && (
            <p style={{ fontSize:12, color:'#94A3B8', textAlign:'right', maxWidth:260 }}>
              Free plan: 1 goal included. <span
                style={{ color:'#00D4A1', cursor:'pointer', fontWeight:700 }}
                onClick={() => navigate('/upgrade?required=plus')}
              >Upgrade to Plus</span> for unlimited goals.
            </p>
          )}
        </div>
      </div>

      {/* Hero progress card */}
      <div style={{ background:'linear-gradient(135deg,#0A1628,#1C3D6E)', borderRadius:24, padding:28, marginBottom:24, display:'flex', alignItems:'center', gap:28, flexWrap:'wrap', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', width:200, height:200, borderRadius:'50%', background:'rgba(0,212,161,.05)', top:-60, right:20, pointerEvents:'none' }} />
        <div style={{ position:'relative', flexShrink:0 }}>
          <ProgressRing pct={overallPct} color="#00D4A1" size={110} />
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
            <p style={{ color:'#fff', fontSize:22, fontWeight:900 }}>{overallPct}%</p>
            <p style={{ color:'rgba(255,255,255,.4)', fontSize:10, fontWeight:700 }}>OVERALL</p>
          </div>
        </div>
        <div style={{ flex:1, position:'relative', zIndex:1 }}>
          <p style={{ color:'rgba(255,255,255,.45)', fontSize:12, marginBottom:6 }}>Total across all goals</p>
          <p style={{ color:'#fff', fontSize:32, fontWeight:900, letterSpacing:-0.5, marginBottom:4 }}>
            £{totalSaved.toLocaleString('en-GB',{minimumFractionDigits:2})}
          </p>
          <p style={{ color:'rgba(255,255,255,.4)', fontSize:13 }}>
            of £{totalTarget.toLocaleString('en-GB',{minimumFractionDigits:2})} target
          </p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, position:'relative', zIndex:1 }}>
          {[
            { label:'Total Goals',  val: goals.length,  icon:'🎯' },
            { label:'Completed',    val: completed,     icon:'✅' },
          ].map(s => (
            <div key={s.label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:22, marginBottom:4 }}>{s.icon}</div>
              <p style={{ color:'#fff', fontSize:22, fontWeight:900 }}>{s.val}</p>
              <p style={{ color:'rgba(255,255,255,.4)', fontSize:11 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:14, marginBottom:24 }}>
        {[
          { icon:'🎯', label:'Total Goals',   val: goals.length,  color:'#A855F7' },
          { icon:'✅', label:'Completed',     val: completed,     color:'#10B981' },
          { icon:'💰', label:'Total Saved',   val:`£${totalSaved.toLocaleString('en-GB',{maximumFractionDigits:0})}`,   color:'#00D4A1' },
          { icon:'🏆', label:'Total Target',  val:`£${totalTarget.toLocaleString('en-GB',{maximumFractionDigits:0})}`,  color:'#F4A261' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ padding:18 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:s.color+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, marginBottom:10 }}>{s.icon}</div>
            <p style={{ fontSize:11, color:'#64748B', fontWeight:600, marginBottom:3 }}>{s.label}</p>
            <p style={{ fontSize:18, fontWeight:900, color:'#0A1628' }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:24 }}>
        {[
          ['all',       `All (${goals.length})`],
          ['active',    `Active (${goals.filter(g=>!g.isCompleted).length})`],
          ['completed', `Completed (${completed})`],
        ].map(([val, lbl]) => (
          <button key={val} onClick={() => setFilter(val)}
            style={{ padding:'8px 20px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:700, fontSize:13,
              background: filter===val ? '#0A1628' : '#F5F7FA',
              color: filter===val ? '#fff' : '#64748B' }}>
            {lbl}
          </button>
        ))}
      </div>

      {/* Goals grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0' }}>
          <div style={{ fontSize:52, marginBottom:16 }}>🎯</div>
          <p style={{ fontSize:20, fontWeight:800, color:'#0A1628', marginBottom:8 }}>
            {filter === 'completed' ? 'No completed goals yet' : 'No goals yet'}
          </p>
          <p style={{ color:'#64748B', fontSize:14, marginBottom:24 }}>Set a savings goal to start your financial journey</p>
          {filter !== 'completed' && (
            <button onClick={() => setShowCreate(true)} className="btn btn-primary" style={{ borderRadius:14, height:48, padding:'0 28px' }}>
              Create Your First Goal
            </button>
          )}
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:20 }}>
          {filtered.map(g => (
            <GoalCard key={g._id} goal={g}
              onAddFunds={setAddFundsGoal}
              onSelect={setDetailGoal}
              onDelete={handleDelete}
              onEdit={() => setEditGoal(g)}
            />
          ))}
        </div>
      )}

      {showCreate   && <CreateGoalModal onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); load(); }} />}
      {addFundsGoal && <AddFundsModal  goal={addFundsGoal} onClose={() => setAddFundsGoal(null)} onSuccess={() => { setAddFundsGoal(null); load(); }} />}
      {detailGoal   && (
        <GoalDetailModal
          goal={detailGoal}
          onClose={() => setDetailGoal(null)}
          onAddFunds={setAddFundsGoal}
          onEdit={() => { setDetailGoal(null); setEditGoal(detailGoal); }}
          onDelete={() => { handleDelete(detailGoal._id); setDetailGoal(null); }}
        />
      )}
      {editGoal && <EditGoalModal goal={editGoal} onClose={() => setEditGoal(null)} onSuccess={() => { setEditGoal(null); load(); }} />}
    </div>
  );
}
