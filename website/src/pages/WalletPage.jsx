import React, { useState, useEffect } from 'react';
import api from '../services/api';

const CARD_GRADIENTS = [
  'linear-gradient(135deg,#0A1628,#1C3D6E)',
  'linear-gradient(135deg,#064E3B,#065F46)',
  'linear-gradient(135deg,#4C1D95,#6D28D9)',
  'linear-gradient(135deg,#7C2D12,#B45309)',
  'linear-gradient(135deg,#1E3A5F,#2563EB)',
];

function CardVisual({ card, index, isDefault, onSetDefault }) {
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  return (
    <div style={{
      background: gradient, borderRadius: 20, padding: 24, position: 'relative',
      overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
      width: 300, height: 175,
      boxShadow: isDefault ? '0 8px 32px rgba(0,212,161,.25)' : '0 4px 16px rgba(0,0,0,.12)',
      border: isDefault ? '2px solid #00D4A1' : '2px solid transparent',
      transition: 'all .2s',
    }}>
      <div style={{ position:'absolute', width:220, height:220, borderRadius:'50%', background:'rgba(255,255,255,.04)', top:-60, right:-60 }} />
      <div style={{ position:'absolute', width:140, height:140, borderRadius:'50%', background:'rgba(255,255,255,.03)', bottom:-40, left:-20 }} />
      <div style={{ position:'relative', zIndex:1, height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <p style={{ color:'rgba(255,255,255,.5)', fontSize:11, marginBottom:2 }}>
              {card.type || 'CARD'}
            </p>
            <p style={{ color:'#fff', fontWeight:800, fontSize:16 }}>{card.bank || 'Bank'}</p>
          </div>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            {isDefault && <span style={{ background:'rgba(0,212,161,.2)', color:'#00D4A1', fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:20 }}>DEFAULT</span>}
            <div style={{ width:36, height:24, background:'rgba(255,165,0,.8)', borderRadius:5, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:18, height:18, borderRadius:'50%', background:'rgba(255,100,0,.9)' }} />
              <div style={{ width:18, height:18, borderRadius:'50%', background:'rgba(255,200,0,.9)', marginLeft:-8 }} />
            </div>
          </div>
        </div>
        <div>
          <p style={{ color:'rgba(255,255,255,.7)', fontSize:13, fontFamily:'monospace', letterSpacing:2, marginBottom:8 }}>
            **** **** **** {card.last4 || '****'}
          </p>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
            <div>
              <p style={{ color:'rgba(255,255,255,.45)', fontSize:10 }}>BALANCE</p>
              <p style={{ color:'#fff', fontWeight:900, fontSize:22 }}>
                £{Number(card.balance ?? 0).toLocaleString('en-GB', { minimumFractionDigits:2 })}
              </p>
            </div>
            {!isDefault && (
              <button onClick={e => { e.stopPropagation(); onSetDefault(card._id); }}
                style={{ background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)', color:'rgba(255,255,255,.7)', fontSize:11, padding:'5px 12px', borderRadius:20, cursor:'pointer' }}>
                Set Default
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TopUpModal({ card, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const QUICK = [10, 25, 50, 100, 250, 500];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError('Enter a valid amount'); return; }
    setLoading(true);
    try {
      await api.post(`/cards/${card._id}/topup`, { amount: amt });
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
          <div>
            <h2 style={{ fontSize:20, fontWeight:900, color:'#0A1628' }}>Top Up Card</h2>
            <p style={{ color:'#64748B', fontSize:13 }}>{card.bank} — ••••{card.last4}</p>
          </div>
          <button onClick={onClose} style={{ background:'#F5F7FA', border:'none', width:36, height:36, borderRadius:10, cursor:'pointer', fontSize:18, color:'#64748B' }}>✕</button>
        </div>
        {error && <div className="alert alert-error" style={{ marginBottom:16 }}>{error}</div>}
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
          {QUICK.map(q => (
            <button key={q} onClick={() => setAmount(String(q))}
              style={{ flex:'1 1 auto', minWidth:70, padding:'8px 12px', borderRadius:12,
                background: amount === String(q) ? '#0A1628' : '#F5F7FA',
                color: amount === String(q) ? '#fff' : '#0A1628',
                border:'none', fontWeight:700, fontSize:14, cursor:'pointer' }}>
              £{q}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Custom Amount</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#64748B', fontWeight:700 }}>£</span>
              <input type="number" min="1" step="0.01" className="form-input" placeholder="0.00"
                value={amount} onChange={e => setAmount(e.target.value)} style={{ paddingLeft:30 }} />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ height:50, fontWeight:700, borderRadius:14 }}>
            {loading ? 'Processing…' : `Top Up £${parseFloat(amount||0).toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  );
}

function AddCardModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ cardNumber:'', cardHolder:'', bankName:'', network:'Visa', expiryDate:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/cards', { ...form, accountType: 'card' });
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'#fff', borderRadius:24, padding:32, width:'100%', maxWidth:440 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <h2 style={{ fontSize:20, fontWeight:900, color:'#0A1628' }}>Add New Card</h2>
          <button onClick={onClose} style={{ background:'#F5F7FA', border:'none', width:36, height:36, borderRadius:10, cursor:'pointer', fontSize:18, color:'#64748B' }}>✕</button>
        </div>
        {error && <div className="alert alert-error" style={{ marginBottom:16 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {[
            { key:'cardNumber',  label:'Card Number',     placeholder:'1234 5678 9012 3456', autoComplete:'cc-number' },
            { key:'cardHolder',  label:'Cardholder Name', placeholder:'Name on card',        autoComplete:'cc-name' },
            { key:'bankName',    label:'Bank / Issuer',   placeholder:'e.g. Barclays',       autoComplete:'organization' },
            { key:'expiryDate',  label:'Expiry Date',     placeholder:'MM/YY',               autoComplete:'cc-exp' },
          ].map(f => (
            <div key={f.key} className="form-group">
              <label className="form-label">{f.label}</label>
              <input type="text" className="form-input" placeholder={f.placeholder}
                autoComplete={f.autoComplete} value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required />
            </div>
          ))}
          <div className="form-group">
            <label className="form-label">Card Network</label>
            <select className="form-input" value={form.network} onChange={e => setForm(p => ({ ...p, network: e.target.value }))}>
              {['Visa','Mastercard','Amex','Discover'].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ height:50, fontWeight:700, borderRadius:14, marginTop:8 }}>
            {loading ? 'Adding…' : 'Add Card'}
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
    if (!form.bankName.trim())      { setError('Enter a bank name'); return; }
    if (!form.accountHolder.trim()) { setError('Enter account holder name'); return; }
    if (!form.accountNumber.trim()) { setError('Enter account number'); return; }
    setLoading(true);
    try {
      await api.post('/cards', {
        bankName:    form.bankName,
        cardHolder:  form.accountHolder,
        cardNumber:  form.accountNumber,
        network:     'Visa',
        expiryDate:  'N/A',
        accountType: 'bank',
      });
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'#fff', borderRadius:24, padding:32, width:'100%', maxWidth:440 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <div>
            <h2 style={{ fontSize:20, fontWeight:900, color:'#0A1628' }}>Link Bank Account</h2>
            <p style={{ color:'#64748B', fontSize:13, marginTop:2 }}>Connect your bank for automatic round-ups</p>
          </div>
          <button onClick={onClose} style={{ background:'#F5F7FA', border:'none', width:36, height:36, borderRadius:10, cursor:'pointer', fontSize:18, color:'#64748B' }}>✕</button>
        </div>
        {error && <div className="alert alert-error" style={{ marginBottom:16, marginTop:12 }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ marginTop:20 }}>
          {[
            { key:'bankName',      label:'Bank Name',           placeholder:'e.g. Barclays, HSBC, Lloyds', required:true  },
            { key:'accountHolder', label:'Account Holder Name', placeholder:'Full name on account',         required:true  },
            { key:'accountNumber', label:'Account Number',      placeholder:'8-digit account number',       required:true  },
            { key:'sortCode',      label:'Sort Code (optional)',placeholder:'00-00-00',                      required:false },
          ].map(f => (
            <div key={f.key} className="form-group">
              <label className="form-label">{f.label}</label>
              <input type="text" className="form-input" placeholder={f.placeholder}
                value={form[f.key]} required={f.required}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
          <div className="form-group">
            <label className="form-label">Account Type</label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {['current','savings','isa','business'].map(t => (
                <button key={t} type="button" onClick={() => setForm(p => ({ ...p, subType: t }))}
                  style={{ padding:'10px 14px', borderRadius:12,
                    border:`2px solid ${form.subType === t ? '#0A1628' : '#E2E8F0'}`,
                    background: form.subType === t ? '#0A162808' : '#fff',
                    fontWeight:700, fontSize:13, color:'#0A1628', cursor:'pointer' }}>
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

export default function WalletPage() {
  const [allItems,    setAllItems]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [topUpCard,   setTopUpCard]   = useState(null);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/cards');
      setAllItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSetDefault = async (cardId) => {
    try { await api.patch(`/cards/${cardId}/default`); load(); }
    catch (err) { console.error(err); }
  };

  const paymentCards  = allItems.filter(c => c.accountType !== 'bank');
  const bankAccounts  = allItems.filter(c => c.accountType === 'bank');
  const totalBalance  = allItems.reduce((s, c) => s + Number(c.balance ?? 0), 0);
  const defaultCard   = paymentCards.find(c => c.isDefault) ?? paymentCards[0];

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:900, color:'#0A1628' }}>Wallet</h1>
          <p style={{ color:'#64748B', fontSize:14, marginTop:2 }}>Manage your linked cards and bank accounts</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => setShowAddBank(true)}
            style={{ background:'#F5F7FA', border:'1.5px solid #E2E8F0', color:'#0A1628', padding:'0 18px', height:44, borderRadius:14, fontWeight:700, fontSize:13, cursor:'pointer' }}>
            🏦 Link Account
          </button>
          <button onClick={() => setShowAddCard(true)} className="btn btn-primary" style={{ height:44, borderRadius:14, display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:18 }}>＋</span> Add Card
          </button>
        </div>
      </div>

      {/* Total balance banner */}
      <div style={{ background:'linear-gradient(135deg,#0A1628,#1C3D6E)', borderRadius:24, padding:28, marginBottom:28, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', background:'rgba(0,212,161,.05)', top:-100, right:-80 }} />
        <div style={{ position:'relative', zIndex:1, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
          <div>
            <p style={{ color:'rgba(255,255,255,.5)', fontSize:13, marginBottom:4 }}>Total Balance</p>
            <p style={{ color:'#fff', fontSize:40, fontWeight:900, letterSpacing:-1 }}>
              £{totalBalance.toLocaleString('en-GB', { minimumFractionDigits:2 })}
            </p>
            <p style={{ color:'rgba(255,255,255,.4)', fontSize:13, marginTop:4 }}>
              {paymentCards.length} card{paymentCards.length !== 1 ? 's' : ''} · {bankAccounts.length} bank account{bankAccounts.length !== 1 ? 's' : ''}
            </p>
          </div>
          {defaultCard && (
            <button onClick={() => setTopUpCard(defaultCard)}
              style={{ background:'rgba(0,212,161,.15)', border:'1.5px solid rgba(0,212,161,.3)', color:'#00D4A1', padding:'12px 24px', borderRadius:16, fontSize:14, fontWeight:700, cursor:'pointer' }}>
              💳 Top Up Default Card
            </button>
          )}
        </div>
      </div>

      {/* ── Payment Cards ───────────────────────────────────── */}
      <div style={{ marginBottom:32 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h2 style={{ fontSize:18, fontWeight:900, color:'#0A1628' }}>💳 Payment Cards</h2>
          <button onClick={() => setShowAddCard(true)} className="btn btn-primary"
            style={{ height:38, borderRadius:12, fontSize:13, padding:'0 16px' }}>
            + Add Card
          </button>
        </div>

        {paymentCards.length === 0 ? (
          <div className="card" style={{ textAlign:'center', padding:'48px 0' }}>
            <div style={{ fontSize:44, marginBottom:12 }}>💳</div>
            <p style={{ fontSize:16, fontWeight:700, color:'#0A1628', marginBottom:6 }}>No cards linked yet</p>
            <p style={{ color:'#64748B', fontSize:14, marginBottom:20 }}>Add a debit or credit card to manage your wallet</p>
            <button onClick={() => setShowAddCard(true)} className="btn btn-primary" style={{ borderRadius:14, height:44 }}>Add Your First Card</button>
          </div>
        ) : (
          <>
            {/* Cards horizontal scroll */}
            <div style={{ display:'flex', gap:16, overflowX:'auto', paddingBottom:8, marginBottom:24 }}>
              {paymentCards.map((card, i) => (
                <div key={card._id} onClick={() => setTopUpCard(card)}>
                  <CardVisual card={card} index={i} isDefault={card.isDefault} onSetDefault={handleSetDefault} />
                </div>
              ))}
            </div>

            {/* Cards table */}
            <div className="card">
              <h3 className="section-title" style={{ marginBottom:16 }}>All Cards</h3>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom:'2px solid #F1F5F9' }}>
                      {['Bank / Issuer','Network','Last 4','Holder','Balance','Status',''].map(h => (
                        <th key={h} style={{ textAlign:'left', padding:'10px 12px', fontSize:12, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:.5 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paymentCards.map((card, i) => (
                      <tr key={card._id} style={{ borderBottom:'1px solid #F5F7FA' }}
                        onMouseEnter={e => e.currentTarget.style.background='#FAFBFC'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <td style={{ padding:'14px 12px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:36, height:36, borderRadius:10, background:['#0A162818','#064E3B18','#4C1D9518'][i%3], display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>💳</div>
                            <span style={{ fontWeight:700, fontSize:14, color:'#0A1628' }}>{card.bank || '—'}</span>
                          </div>
                        </td>
                        <td style={{ padding:'14px 12px' }}>
                          <span className="badge badge-success">{card.type || '—'}</span>
                        </td>
                        <td style={{ padding:'14px 12px', fontFamily:'monospace', color:'#64748B', fontSize:13 }}>
                          ••••{card.last4 || '????'}
                        </td>
                        <td style={{ padding:'14px 12px', color:'#64748B', fontSize:13 }}>{card.holder || '—'}</td>
                        <td style={{ padding:'14px 12px', fontWeight:800, fontSize:15, color:'#0A1628' }}>
                          £{Number(card.balance ?? 0).toLocaleString('en-GB', { minimumFractionDigits:2 })}
                        </td>
                        <td style={{ padding:'14px 12px' }}>
                          {card.isDefault
                            ? <span className="badge badge-success">Default</span>
                            : <span className="badge" style={{ background:'#F1F5F9', color:'#64748B' }}>Linked</span>}
                        </td>
                        <td style={{ padding:'14px 12px' }}>
                          <div style={{ display:'flex', gap:8 }}>
                            <button onClick={() => setTopUpCard(card)}
                              style={{ background:'#F0FDF4', color:'#10B981', border:'none', padding:'6px 14px', borderRadius:10, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                              Top Up
                            </button>
                            {!card.isDefault && (
                              <button onClick={() => handleSetDefault(card._id)}
                                style={{ background:'#F5F7FA', color:'#64748B', border:'none', padding:'6px 14px', borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                                Set Default
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Bank Accounts ───────────────────────────────────── */}
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h2 style={{ fontSize:18, fontWeight:900, color:'#0A1628' }}>🏦 Bank Accounts</h2>
          <button onClick={() => setShowAddBank(true)} className="btn btn-primary"
            style={{ height:38, borderRadius:12, fontSize:13, padding:'0 16px' }}>
            + Link Account
          </button>
        </div>

        {bankAccounts.length === 0 ? (
          <div className="card" style={{ textAlign:'center', padding:'48px 0' }}>
            <div style={{ fontSize:44, marginBottom:12 }}>🏦</div>
            <p style={{ fontSize:16, fontWeight:700, color:'#0A1628', marginBottom:6 }}>No bank accounts linked</p>
            <p style={{ color:'#64748B', fontSize:14, marginBottom:20 }}>Link a bank account to enable automatic round-ups on your transactions</p>
            <button onClick={() => setShowAddBank(true)} className="btn btn-primary" style={{ borderRadius:14, height:44 }}>
              Link Your First Account
            </button>
          </div>
        ) : (
          <div className="card">
            {bankAccounts.map((acc, i) => (
              <div key={acc._id} style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 0', borderBottom: i < bankAccounts.length - 1 ? '1px solid #F5F7FA' : 'none' }}>
                <div style={{ width:48, height:48, borderRadius:14, background:'#EFF6FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>🏦</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:700, fontSize:15, color:'#0A1628', marginBottom:3 }}>{acc.bank}</p>
                  <p style={{ fontSize:13, color:'#64748B' }}>
                    ••••{acc.last4}
                    {acc.holder ? ` · ${acc.holder}` : ''}
                    {acc.isDefault && <span style={{ marginLeft:8, color:'#00D4A1', fontWeight:700, fontSize:11 }}>DEFAULT</span>}
                  </p>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <p style={{ fontWeight:900, fontSize:18, color:'#0A1628' }}>
                    £{Number(acc.balance ?? 0).toLocaleString('en-GB', { minimumFractionDigits:2 })}
                  </p>
                  <p style={{ fontSize:11, color:'#94A3B8', marginTop:2 }}>balance</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {topUpCard   && <TopUpModal card={topUpCard}  onClose={() => setTopUpCard(null)}   onSuccess={() => { setTopUpCard(null);   load(); }} />}
      {showAddCard && <AddCardModal                 onClose={() => setShowAddCard(false)} onSuccess={() => { setShowAddCard(false); load(); }} />}
      {showAddBank && <AddBankAccountModal          onClose={() => setShowAddBank(false)} onSuccess={() => { setShowAddBank(false); load(); }} />}
    </div>
  );
}
