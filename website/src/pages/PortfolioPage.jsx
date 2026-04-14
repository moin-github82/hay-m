import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ASSET_COLORS = ['#00D4A1','#3B82F6','#A855F7','#F4A261','#EF4444','#10B981','#F59E0B','#06B6D4'];

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ segments, size = 180 }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 22;
  const circ = 2 * Math.PI * r;
  let cumulative = 0;
  return (
    <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={30} />
      {segments.map((seg, i) => {
        const dash   = (seg.pct / 100) * circ;
        const offset = circ - cumulative * circ / 100;
        cumulative  += seg.pct;
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.color} strokeWidth={30}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={offset} strokeLinecap="butt"
            style={{ transition:'all .5s ease' }} />
        );
      })}
    </svg>
  );
}

// ─── Mini Trend Bar ───────────────────────────────────────────────────────────
function MiniTrend({ isUp }) {
  const bars = [3,5,4,7,5,8,6,9,7,10];
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:24 }}>
      {bars.map((h, i) => (
        <div key={i} style={{ width:3, borderRadius:2,
          height: h * 2,
          background: i < 6 ? '#E2E8F0' : (isUp ? '#10B981' : '#EF4444'),
          opacity: i < 6 ? 0.5 : 1 }} />
      ))}
    </div>
  );
}

// ─── Add Holding Modal ────────────────────────────────────────────────────────
function AddHoldingModal({ onClose, onSuccess }) {
  const [form, setForm]     = useState({ symbol:'', name:'', shares:'', avgPrice:'', assetType:'stock' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.symbol.trim()) { setError('Enter a ticker symbol'); return; }
    if (!form.shares || parseFloat(form.shares) <= 0) { setError('Enter a valid share count'); return; }
    if (!form.avgPrice || parseFloat(form.avgPrice) <= 0) { setError('Enter a valid price'); return; }
    setLoading(true);
    try {
      await api.post('/portfolio/holdings', {
        symbol: form.symbol.toUpperCase(), name: form.name || form.symbol.toUpperCase(),
        shares: parseFloat(form.shares), avgPrice: parseFloat(form.avgPrice), assetType: form.assetType,
      });
      onSuccess();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'#fff', borderRadius:28, padding:32, width:'100%', maxWidth:440 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <div>
            <h2 style={{ fontSize:20, fontWeight:900, color:'#0A1628' }}>Add Holding</h2>
            <p style={{ color:'#94A3B8', fontSize:13 }}>Track a new investment position</p>
          </div>
          <button onClick={onClose} style={{ background:'#F5F7FA', border:'none', width:36, height:36, borderRadius:10, cursor:'pointer', fontSize:18, color:'#64748B' }}>✕</button>
        </div>
        {error && <div className="alert alert-error" style={{ marginBottom:16 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {[
            { key:'symbol',   label:'Ticker Symbol',    type:'text',   ph:'e.g. AAPL' },
            { key:'name',     label:'Company / Name',   type:'text',   ph:'e.g. Apple Inc.' },
            { key:'shares',   label:'Number of Shares', type:'number', ph:'e.g. 10' },
            { key:'avgPrice', label:'Avg. Buy Price (£)',type:'number', ph:'e.g. 150.00' },
          ].map(f => (
            <div key={f.key} className="form-group">
              <label className="form-label">{f.label}</label>
              <input type={f.type} className="form-input" placeholder={f.ph}
                value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]:e.target.value }))}
                required={f.key !== 'name'} />
            </div>
          ))}
          <div className="form-group">
            <label className="form-label">Asset Type</label>
            <select className="form-input" value={form.assetType} onChange={e => setForm(p => ({ ...p, assetType:e.target.value }))}>
              {['stock','etf','crypto','bond','other'].map(t => (
                <option key={t} value={t} style={{ textTransform:'capitalize' }}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ height:50, fontWeight:700, borderRadius:14 }}>
            {loading ? 'Adding…' : '+ Add to Portfolio'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Holding Row ──────────────────────────────────────────────────────────────
function HoldingRow({ holding, index }) {
  const color   = holding.color || ASSET_COLORS[index % ASSET_COLORS.length];
  const price   = Number(holding.currentPrice ?? holding.avgBuyPrice ?? 0);
  const value   = Number(holding.value ?? (holding.shares * price));
  const cost    = Number(holding.shares ?? 0) * Number(holding.avgBuyPrice ?? 0);
  const gain    = Number(holding.gainLoss   ?? (value - cost));
  const gainPct = Number(holding.gainLossPct ?? (cost > 0 ? (gain / cost) * 100 : 0));
  const isUp    = gain >= 0;

  return (
    <tr style={{ borderBottom:'1px solid #F5F7FA', transition:'background .15s' }}
      onMouseEnter={e => e.currentTarget.style.background='#FAFBFC'}
      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
      <td style={{ padding:'14px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:42, height:42, borderRadius:13, background:color+'1A', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:900, color, flexShrink:0, letterSpacing:-0.5 }}>
            {(holding.ticker||'?').slice(0,4)}
          </div>
          <div>
            <p style={{ fontWeight:800, fontSize:14, color:'#0A1628' }}>{holding.ticker}</p>
            <p style={{ fontSize:11, color:'#94A3B8', maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{holding.name || holding.ticker}</p>
          </div>
        </div>
      </td>
      <td style={{ padding:'14px 12px' }}>
        <span style={{ fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:20, background:color+'18', color, textTransform:'capitalize' }}>
          {holding.type || 'stock'}
        </span>
      </td>
      <td style={{ padding:'14px 12px', fontSize:13, color:'#0A1628', fontWeight:700 }}>
        {Number(holding.shares ?? 0).toLocaleString()}
      </td>
      <td style={{ padding:'14px 12px', fontSize:13, color:'#64748B', fontWeight:600 }}>
        £{Number(holding.avgBuyPrice ?? 0).toFixed(2)}
      </td>
      <td style={{ padding:'14px 12px' }}>
        <p style={{ fontWeight:800, fontSize:14, color:'#0A1628' }}>£{value.toLocaleString('en-GB',{minimumFractionDigits:2})}</p>
        <p style={{ fontSize:11, color:'#94A3B8' }}>@ £{price.toFixed(2)}</p>
      </td>
      <td style={{ padding:'14px 12px' }}>
        <MiniTrend isUp={isUp} />
      </td>
      <td style={{ padding:'14px 12px' }}>
        <div style={{ display:'inline-flex', flexDirection:'column', alignItems:'flex-start',
          padding:'5px 10px', borderRadius:10, background: isUp ? '#D1FAE520' : '#FEE2E220' }}>
          <span style={{ fontWeight:800, fontSize:13, color: isUp ? '#10B981' : '#EF4444' }}>
            {isUp ? '+' : '-'}£{Math.abs(gain).toFixed(2)}
          </span>
          <span style={{ fontSize:11, color: isUp ? '#10B981' : '#EF4444', fontWeight:700 }}>
            {isUp ? '▲' : '▼'} {Math.abs(gainPct).toFixed(1)}%
          </span>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PortfolioPage() {
  const navigate = useNavigate();
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [showAdd,   setShowAdd]   = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const load = async () => {
    try { const res = await api.get('/portfolio'); setData(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const holdings     = data?.holdings || [];
  const portfolioVal = Number(data?.totalValue ?? holdings.reduce((s,h) => s + (h.shares*(h.currentPrice??h.avgBuyPrice)), 0));
  const totalCost    = Number(data?.totalCost  ?? holdings.reduce((s,h) => s + (h.shares*h.avgBuyPrice), 0));
  const totalGain    = portfolioVal - totalCost;
  const gainPct      = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
  const isUp         = totalGain >= 0;

  const byType = {};
  holdings.forEach((h, i) => {
    const type = h.type || 'stock';
    const val  = Number(h.value ?? (h.shares*(h.currentPrice??h.avgBuyPrice)));
    const col  = h.color || ASSET_COLORS[Object.keys(byType).length % ASSET_COLORS.length];
    if (!byType[type]) byType[type] = { value:0, color:col };
    byType[type].value += val;
  });
  const segments = Object.entries(byType).map(([type, d]) => ({
    type, color:d.color,
    pct: portfolioVal > 0 ? Math.round((d.value / portfolioVal) * 100) : 0,
    value: d.value,
  }));

  const filtered = holdings.filter(h => {
    const g = Number(h.gainLoss ?? ((h.currentPrice??h.avgBuyPrice) - h.avgBuyPrice) * h.shares);
    if (activeTab === 'gainers') return g >= 0;
    if (activeTab === 'losers')  return g < 0;
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:900, color:'#0A1628' }}>Portfolio</h1>
          <p style={{ color:'#64748B', fontSize:14, marginTop:2 }}>Your investment positions & performance</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => navigate('/investment')}
            style={{ height:44, padding:'0 18px', borderRadius:14, border:'1.5px solid #E2E8F0', background:'#fff', color:'#0A1628', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
            🤖 AI Invest
          </button>
          <button onClick={() => setShowAdd(true)} className="btn btn-primary"
            style={{ display:'flex', alignItems:'center', gap:8, borderRadius:14, height:44 }}>
            <span style={{ fontSize:18 }}>＋</span> Add Holding
          </button>
        </div>
      </div>

      {/* Hero card */}
      <div style={{ background:'linear-gradient(135deg,#0A1628,#1A3560)', borderRadius:24, padding:28, marginBottom:24, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', width:280, height:280, borderRadius:'50%', background:'rgba(0,212,161,.04)', top:-60, right:-40, pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1, display:'grid', gridTemplateColumns:'1fr auto', gap:24, alignItems:'center' }}>
          <div>
            <p style={{ color:'rgba(255,255,255,.45)', fontSize:12, marginBottom:6, fontWeight:600 }}>Total Portfolio Value</p>
            <p style={{ color:'#fff', fontSize:42, fontWeight:900, letterSpacing:-1, marginBottom:10 }}>
              £{portfolioVal.toLocaleString('en-GB',{minimumFractionDigits:2})}
            </p>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', borderRadius:20,
              background: isUp ? 'rgba(16,185,129,.15)' : 'rgba(239,68,68,.15)' }}>
              <span style={{ fontSize:14, color: isUp ? '#10B981' : '#EF4444' }}>{isUp ? '▲' : '▼'}</span>
              <span style={{ color: isUp ? '#10B981' : '#EF4444', fontWeight:800, fontSize:14 }}>
                {isUp ? '+' : '-'}£{Math.abs(totalGain).toFixed(2)} ({isUp ? '+' : ''}{gainPct.toFixed(2)}%)
              </span>
              <span style={{ color:'rgba(255,255,255,.3)', fontSize:12 }}>all time</span>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[
              { label:'Total Invested', val:`£${totalCost.toLocaleString('en-GB',{minimumFractionDigits:2})}` },
              { label:'Positions',      val: holdings.length },
              { label:'Asset Types',    val: Object.keys(byType).length },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'right' }}>
                <p style={{ color:'rgba(255,255,255,.35)', fontSize:10, fontWeight:700, textTransform:'uppercase' }}>{s.label}</p>
                <p style={{ color:'rgba(255,255,255,.8)', fontWeight:800, fontSize:15 }}>{s.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stat strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:14, marginBottom:24 }}>
        {[
          { icon:'📈', label:'Portfolio Value', val:`£${portfolioVal.toLocaleString('en-GB',{maximumFractionDigits:0})}`, color:'#3B82F6' },
          { icon:'💷', label:'Total Invested',  val:`£${totalCost.toLocaleString('en-GB',{maximumFractionDigits:0})}`,   color:'#64748B' },
          { icon: isUp?'🟢':'🔴', label:'Total Return', val:`${isUp?'+':''}£${Math.abs(totalGain).toFixed(0)}`, color: isUp?'#10B981':'#EF4444' },
          { icon:'📊', label:'Return %',        val:`${isUp?'+':''}${gainPct.toFixed(1)}%`,  color: isUp?'#10B981':'#EF4444' },
          { icon:'🏢', label:'Holdings',        val: holdings.length, color:'#A855F7' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ padding:18 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:s.color+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, marginBottom:10 }}>{s.icon}</div>
            <p style={{ fontSize:11, color:'#94A3B8', fontWeight:600, marginBottom:3 }}>{s.label}</p>
            <p style={{ fontSize:18, fontWeight:900, color: ['Total Return','Return %'].includes(s.label) ? s.color : '#0A1628' }}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="portfolio-grid" style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:24, marginBottom:24 }}>
        {/* Allocation donut */}
        <div className="card" style={{ padding:24 }}>
          <h3 style={{ fontSize:15, fontWeight:800, color:'#0A1628', marginBottom:2 }}>Allocation</h3>
          <p style={{ fontSize:12, color:'#94A3B8', marginBottom:20 }}>By asset type</p>
          {holdings.length === 0 ? (
            <div style={{ textAlign:'center', padding:'30px 0', color:'#94A3B8', fontSize:14 }}>No holdings yet</div>
          ) : (
            <>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:20, position:'relative' }}>
                <DonutChart segments={segments} size={170} />
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
                  <p style={{ fontSize:10, color:'#94A3B8', fontWeight:700, textTransform:'uppercase' }}>TOTAL</p>
                  <p style={{ fontSize:16, fontWeight:900, color:'#0A1628' }}>£{portfolioVal.toLocaleString('en-GB',{maximumFractionDigits:0})}</p>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {segments.map(seg => (
                  <div key={seg.type} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:10, height:10, borderRadius:3, background:seg.color, flexShrink:0 }} />
                      <span style={{ fontSize:13, color:'#0A1628', fontWeight:600, textTransform:'capitalize' }}>{seg.type}</span>
                    </div>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      <span style={{ fontSize:12, color:'#94A3B8' }}>£{seg.value.toLocaleString('en-GB',{maximumFractionDigits:0})}</span>
                      <span style={{ fontSize:13, fontWeight:800, color:seg.color }}>{seg.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Holdings table */}
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'20px 20px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <h3 style={{ fontSize:15, fontWeight:800, color:'#0A1628' }}>Holdings</h3>
              <p style={{ fontSize:12, color:'#94A3B8', marginBottom:16 }}>{holdings.length} position{holdings.length !== 1 ? 's' : ''}</p>
            </div>
            <div style={{ display:'flex', gap:6, marginBottom:16 }}>
              {[['all','All'],['gainers','▲ Gainers'],['losers','▼ Losers']].map(([val, lbl]) => (
                <button key={val} onClick={() => setActiveTab(val)}
                  style={{ padding:'5px 14px', borderRadius:20, border:'none', cursor:'pointer', fontSize:12, fontWeight:700,
                    background: activeTab===val ? '#0A1628' : '#F5F7FA',
                    color: activeTab===val ? '#fff' : '#64748B' }}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>
          {holdings.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 20px' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>📈</div>
              <p style={{ fontWeight:700, color:'#0A1628', marginBottom:6 }}>No holdings yet</p>
              <p style={{ color:'#94A3B8', fontSize:13, marginBottom:20 }}>Add your first investment position to get started</p>
              <button onClick={() => setShowAdd(true)} className="btn btn-primary" style={{ borderRadius:12, height:44 }}>+ Add Holding</button>
            </div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:'2px solid #F1F5F9' }}>
                    {['Asset','Type','Shares','Avg Price','Value','Trend','Gain/Loss'].map((h,i) => (
                      <th key={h} style={{ textAlign:'left', padding:'10px 16px', fontSize:10, fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((h, i) => <HoldingRow key={h._id ?? i} holding={h} index={i} />)}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div style={{ textAlign:'center', padding:'32px 0', color:'#94A3B8', fontSize:14 }}>No {activeTab} at the moment</div>
              )}
            </div>
          )}
        </div>
      </div>

      {showAdd && <AddHoldingModal onClose={() => setShowAdd(false)} onSuccess={() => { setShowAdd(false); load(); }} />}
    </div>
  );
}
