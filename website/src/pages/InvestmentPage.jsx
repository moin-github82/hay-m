import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// ─── Static AI data ──────────────────────────────────────────────────────────
const AI_PROFILES = {
  conservative: {
    label: 'Conservative',
    icon: '🛡️',
    desc: 'Capital preservation — low risk, steady returns',
    allocation: [
      { label: 'Savings',  pct: 40, color: '#00D4A1' },
      { label: 'ETFs',     pct: 35, color: '#3B82F6' },
      { label: 'Stocks',   pct: 20, color: '#A855F7' },
      { label: 'Crypto',   pct: 5,  color: '#F97316' },
    ],
    picks: [
      { ticker:'VOO',  name:'Vanguard S&P 500', action:'BUY',   conf:92, risk:'Low',    ret:'+8.2% avg', note:'Low-cost broad market ETF, ideal for long-term stability' },
      { ticker:'BND',  name:'Vanguard Bond ETF',action:'BUY',   conf:88, risk:'Low',    ret:'+3.8% avg', note:'Fixed income to balance equity exposure' },
      { ticker:'MSFT', name:'Microsoft Corp.',  action:'HOLD',  conf:79, risk:'Medium', ret:'+22% YTD',  note:'Strong cloud fundamentals, steady AI pipeline' },
    ],
  },
  balanced: {
    label: 'Balanced',
    icon: '⚖️',
    desc: 'Growth with protection — moderate risk, solid returns',
    allocation: [
      { label: 'Stocks',  pct: 40, color: '#A855F7' },
      { label: 'ETFs',    pct: 30, color: '#3B82F6' },
      { label: 'Savings', pct: 20, color: '#00D4A1' },
      { label: 'Crypto',  pct: 10, color: '#F97316' },
    ],
    picks: [
      { ticker:'AAPL', name:'Apple Inc.',       action:'BUY',   conf:94, risk:'Medium', ret:'+15% YTD', note:'Services growth + AI pipeline; strong buy at current levels' },
      { ticker:'VOO',  name:'Vanguard S&P 500', action:'BUY',   conf:91, risk:'Low',    ret:'+12% YTD', note:'Core holding for any balanced portfolio' },
      { ticker:'ETH',  name:'Ethereum',         action:'WATCH', conf:68, risk:'High',   ret:'+56% YTD', note:'Post-merge fundamentals strong; macro headwinds remain' },
    ],
  },
  aggressive: {
    label: 'Aggressive',
    icon: '🚀',
    desc: 'Maximum growth — higher risk, higher reward potential',
    allocation: [
      { label: 'Stocks', pct: 50, color: '#A855F7' },
      { label: 'Crypto', pct: 25, color: '#F97316' },
      { label: 'ETFs',   pct: 20, color: '#3B82F6' },
      { label: 'Savings',pct: 5,  color: '#00D4A1' },
    ],
    picks: [
      { ticker:'NVDA', name:'NVIDIA Corp.',  action:'BUY',   conf:96, risk:'Medium', ret:'+82% YTD', note:'AI infrastructure leader; data centre growth accelerating fast' },
      { ticker:'BTC',  name:'Bitcoin',       action:'BUY',   conf:74, risk:'High',   ret:'+63% YTD', note:'Halving cycle historically bullish; institutional demand rising' },
      { ticker:'TSLA', name:'Tesla Inc.',    action:'WATCH', conf:61, risk:'High',   ret:'-12% YTD', note:'FSD progress promising but margin pressure and competition ongoing' },
    ],
  },
};

const ACTION_STYLES = {
  BUY:   { bg:'#D1FAE5', color:'#059669', label:'BUY' },
  HOLD:  { bg:'#DBEAFE', color:'#2563EB', label:'HOLD' },
  WATCH: { bg:'#FEF3C7', color:'#D97706', label:'WATCH' },
};

const RISK_COLORS = { Low:'#10B981', Medium:'#F59E0B', High:'#EF4444' };

// ─── Quick Invest Modal ───────────────────────────────────────────────────────
function QuickInvestModal({ portfolioVal, goalsTotal, savingsTotal, onClose }) {
  const [amount, setAmount]   = useState('');
  const [dest,   setDest]     = useState('portfolio');
  const [done,   setDone]     = useState(false);

  const DESTS = [
    { val:'portfolio', label:'Portfolio',   icon:'📈', bal:`£${portfolioVal.toFixed(2)}` },
    { val:'goals',     label:'Goals',       icon:'🎯', bal:`£${goalsTotal.toFixed(2)}`   },
    { val:'savings',   label:'Savings Pot', icon:'💰', bal:`£${savingsTotal.toFixed(2)}`  },
  ];

  const handleInvest = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    setDone(true);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'#fff', borderRadius:28, padding:32, width:'100%', maxWidth:440 }}>
        {done ? (
          <div style={{ textAlign:'center', padding:'12px 0' }}>
            <div style={{ fontSize:56, marginBottom:16 }}>✅</div>
            <h3 style={{ fontSize:22, fontWeight:900, color:'#0A1628', marginBottom:8 }}>Investment Queued!</h3>
            <p style={{ color:'#64748B', fontSize:14, marginBottom:24 }}>
              £{parseFloat(amount).toFixed(2)} will be added to your {DESTS.find(d=>d.val===dest)?.label}.
            </p>
            <button onClick={onClose} className="btn btn-primary w-full" style={{ height:50, fontWeight:700, borderRadius:14 }}>Done</button>
          </div>
        ) : (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <div>
                <h2 style={{ fontSize:20, fontWeight:900, color:'#0A1628' }}>Quick Invest</h2>
                <p style={{ color:'#94A3B8', fontSize:13 }}>Choose where to put your money</p>
              </div>
              <button onClick={onClose} style={{ background:'#F5F7FA', border:'none', width:36, height:36, borderRadius:10, cursor:'pointer', fontSize:18, color:'#64748B' }}>✕</button>
            </div>

            <p style={{ fontSize:13, fontWeight:700, color:'#0A1628', marginBottom:10 }}>Destination</p>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
              {DESTS.map(d => (
                <button key={d.val} onClick={() => setDest(d.val)}
                  style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderRadius:14,
                    border:`2px solid ${dest===d.val ? '#0A1628' : '#E2E8F0'}`,
                    background: dest===d.val ? '#0A162808' : '#fff', cursor:'pointer' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:22 }}>{d.icon}</span>
                    <span style={{ fontWeight:700, fontSize:14, color:'#0A1628' }}>{d.label}</span>
                  </div>
                  <span style={{ fontSize:13, color:'#10B981', fontWeight:700 }}>{d.bal}</span>
                </button>
              ))}
            </div>

            {/* Quick amounts */}
            <div style={{ display:'flex', gap:8, marginBottom:16 }}>
              {[10, 25, 50, 100, 250].map(q => (
                <button key={q} onClick={() => setAmount(String(q))}
                  style={{ flex:1, padding:'7px 0', borderRadius:10, border:'none', cursor:'pointer', fontSize:13, fontWeight:700,
                    background: amount===String(q) ? '#0A1628' : '#F5F7FA',
                    color: amount===String(q) ? '#fff' : '#0A1628' }}>
                  £{q}
                </button>
              ))}
            </div>

            <form onSubmit={handleInvest}>
              <div className="form-group">
                <label className="form-label">Amount</label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#64748B', fontWeight:700, fontSize:16 }}>£</span>
                  <input type="number" min="0.01" step="0.01" className="form-input" placeholder="0.00"
                    value={amount} onChange={e => setAmount(e.target.value)} style={{ paddingLeft:32 }} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-full" style={{ height:50, fontWeight:700, borderRadius:14 }}>
                Invest £{parseFloat(amount||0).toFixed(2)} Now
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Channel Card ─────────────────────────────────────────────────────────────
function ChannelCard({ icon, title, value, subtitle, badge, color, onInvest, onNavigate }) {
  return (
    <div style={{ background:'#fff', borderRadius:24, padding:24, border:'1.5px solid #F1F5F9',
      boxShadow:'0 2px 12px rgba(0,0,0,.05)', display:'flex', flexDirection:'column', gap:0 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
        <div style={{ width:52, height:52, borderRadius:16, background:color+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>{icon}</div>
        <span style={{ fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, background:badge.bg, color:badge.color }}>{badge.label}</span>
      </div>
      <p style={{ fontSize:13, color:'#94A3B8', fontWeight:600, marginBottom:4 }}>{title}</p>
      <p style={{ fontSize:26, fontWeight:900, color:'#0A1628', letterSpacing:-0.5, marginBottom:4 }}>{value}</p>
      <p style={{ fontSize:12, color:'#64748B', marginBottom:20 }}>{subtitle}</p>
      <div style={{ display:'flex', gap:8, marginTop:'auto' }}>
        <button onClick={onInvest}
          style={{ flex:1, height:40, borderRadius:12, border:'none', background:color, color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer' }}>
          Invest
        </button>
        <button onClick={onNavigate}
          style={{ height:40, padding:'0 14px', borderRadius:12, border:`1.5px solid ${color}30`, background:color+'10', color, fontWeight:700, fontSize:13, cursor:'pointer' }}>
          View →
        </button>
      </div>
    </div>
  );
}

// ─── AI Pick Card ─────────────────────────────────────────────────────────────
function AIPickCard({ pick }) {
  const action = ACTION_STYLES[pick.action] || ACTION_STYLES.WATCH;
  const riskColor = RISK_COLORS[pick.risk] || '#64748B';
  return (
    <div style={{ background:'#fff', borderRadius:20, padding:20, border:'1.5px solid #F1F5F9', boxShadow:'0 2px 8px rgba(0,0,0,.04)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
            <p style={{ fontWeight:900, fontSize:18, color:'#0A1628' }}>{pick.ticker}</p>
            <span style={{ fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:20, background:action.bg, color:action.color }}>
              {action.label}
            </span>
          </div>
          <p style={{ fontSize:12, color:'#94A3B8' }}>{pick.name}</p>
        </div>
        <div style={{ textAlign:'right' }}>
          <p style={{ fontSize:13, fontWeight:900, color:'#0A1628' }}>{pick.ret}</p>
          <p style={{ fontSize:11, color:riskColor, fontWeight:700 }}>{pick.risk} Risk</p>
        </div>
      </div>
      <p style={{ fontSize:12, color:'#64748B', lineHeight:1.6, marginBottom:14 }}>{pick.note}</p>
      {/* Confidence bar */}
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
          <span style={{ fontSize:11, color:'#94A3B8', fontWeight:600 }}>AI Confidence</span>
          <span style={{ fontSize:12, fontWeight:800, color:'#0A1628' }}>{pick.conf}%</span>
        </div>
        <div style={{ height:6, borderRadius:3, background:'#F1F5F9', overflow:'hidden' }}>
          <div style={{ height:'100%', borderRadius:3, width:`${pick.conf}%`,
            background: pick.conf >= 85 ? '#10B981' : pick.conf >= 70 ? '#F59E0B' : '#EF4444',
            transition:'width .6s ease' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Allocation Bar ───────────────────────────────────────────────────────────
function AllocationBar({ allocation }) {
  return (
    <div>
      <div style={{ display:'flex', height:14, borderRadius:7, overflow:'hidden', marginBottom:14 }}>
        {allocation.map((seg, i) => (
          <div key={i} style={{ width:`${seg.pct}%`, background:seg.color, transition:'width .5s ease' }} />
        ))}
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'8px 20px' }}>
        {allocation.map((seg, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:seg.color }} />
            <span style={{ fontSize:12, color:'#64748B', fontWeight:600 }}>{seg.label}</span>
            <span style={{ fontSize:12, fontWeight:800, color:'#0A1628' }}>{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Beginner Starter ────────────────────────────────────────────────────────
const STARTER_OPTIONS = [
  {
    key: 'low',
    icon: '🛡️',
    color: '#10B981',
    title: 'Low Risk — Steady Growth',
    product: 'Cash ISA + UK Gilts',
    returns: '4–5% /yr',
    min: '£10',
    ideal: 'Short-term goals, first-time investors',
  },
  {
    key: 'medium',
    icon: '⚖️',
    color: '#3B82F6',
    title: 'Medium Risk — Balanced',
    product: 'Global ETF Mix (60/40)',
    returns: '6–9% /yr',
    min: '£25',
    ideal: '3–7 year horizon, growing wealth',
  },
  {
    key: 'high',
    icon: '🚀',
    color: '#A855F7',
    title: 'High Risk — Growth',
    product: 'Tech & Emerging Markets',
    returns: '10–15% /yr',
    min: '£50',
    ideal: '7+ year horizon, experienced savers',
  },
];

function BeginnerStarter() {
  const [selected, setSelected] = useState(null);
  const [started,  setStarted]  = useState(null);

  return (
    <div style={{ background:'linear-gradient(135deg,#EFF6FF,#F0FDF9)', borderRadius:24, padding:28, marginBottom:24, border:'1.5px solid #DBEAFE' }}>
      <div style={{ marginBottom:20 }}>
        <h3 style={{ fontSize:18, fontWeight:900, color:'#0A1628', marginBottom:4 }}>New to investing? Start here.</h3>
        <p style={{ fontSize:14, color:'#64748B' }}>Pick a risk level and we'll handle the rest — no expertise needed.</p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16, marginBottom:selected ? 16 : 0 }}>
        {STARTER_OPTIONS.map(opt => {
          const isSelected = selected === opt.key;
          return (
            <div key={opt.key}
              onClick={() => { setSelected(opt.key); setStarted(null); }}
              style={{
                background:'#fff', borderRadius:20, padding:20, cursor:'pointer',
                border: isSelected ? `2px solid ${opt.color}` : '1.5px solid #E2E8F0',
                boxShadow: isSelected ? `0 4px 20px ${opt.color}25` : '0 2px 8px rgba(0,0,0,.04)',
                transition:'all .2s', position:'relative',
              }}
            >
              {isSelected && (
                <div style={{ position:'absolute', top:12, right:12, width:22, height:22, borderRadius:'50%', background:opt.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'#fff', fontWeight:900 }}>✓</div>
              )}
              <div style={{ width:48, height:48, borderRadius:14, background:opt.color+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, marginBottom:12 }}>
                {opt.icon}
              </div>
              <p style={{ fontWeight:900, fontSize:14, color:'#0A1628', marginBottom:4 }}>{opt.title}</p>
              <p style={{ fontSize:13, color:opt.color, fontWeight:700, marginBottom:10 }}>{opt.product}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontSize:12, color:'#94A3B8' }}>Expected return</span>
                  <span style={{ fontSize:12, fontWeight:700, color:'#0A1628' }}>{opt.returns}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontSize:12, color:'#94A3B8' }}>Min start</span>
                  <span style={{ fontSize:12, fontWeight:700, color:'#0A1628' }}>{opt.min}</span>
                </div>
              </div>
              <div style={{ marginTop:10, padding:'8px 12px', background:opt.color+'10', borderRadius:10 }}>
                <p style={{ fontSize:11, color:opt.color, fontWeight:600 }}>Ideal for: {opt.ideal}</p>
              </div>
            </div>
          );
        })}
      </div>
      {selected && (
        <div style={{ marginTop:4 }}>
          {started === selected ? (
            <div style={{ background:'rgba(0,212,161,.12)', border:'1.5px solid rgba(0,212,161,.3)', borderRadius:14, padding:'14px 20px', display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:20 }}>🎉</span>
              <p style={{ fontSize:14, color:'#0A1628', fontWeight:600 }}>This feature is coming soon — join the waitlist!</p>
            </div>
          ) : (
            <button
              onClick={() => setStarted(selected)}
              style={{ padding:'12px 32px', borderRadius:14, border:'none', background:'#0A1628', color:'#fff', fontWeight:800, fontSize:14, cursor:'pointer' }}
            >
              Get Started with {STARTER_OPTIONS.find(o => o.key === selected)?.title.split(' — ')[0]} Risk →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function InvestmentPage() {
  const navigate = useNavigate();

  const [mode,            setMode]            = useState('manual');
  const [riskProfile,     setRiskProfile]     = useState('balanced');
  const [autoInvest,      setAutoInvest]      = useState(false);
  const [autoAmount,      setAutoAmount]      = useState('50');
  const [autoFreq,        setAutoFreq]        = useState('weekly');
  const [showQuickInvest, setShowQuickInvest] = useState(false);
  const [quickDest,       setQuickDest]       = useState('portfolio');

  const [portfolioVal, setPortfolioVal] = useState(0);
  const [portfolioGain,setPortfolioGain]= useState(0);
  const [goalsTotal,   setGoalsTotal]   = useState(0);
  const [goalsCount,   setGoalsCount]   = useState(0);
  const [savingsTotal, setSavingsTotal] = useState(0);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [portRes, goalsRes, savRes] = await Promise.allSettled([
          api.get('/portfolio'),
          api.get('/goals'),
          api.get('/savings-tracker'),
        ]);
        if (portRes.status === 'fulfilled') {
          const d = portRes.value.data;
          setPortfolioVal(Number(d?.totalValue ?? 0));
          setPortfolioGain(Number(d?.totalValue ?? 0) - Number(d?.totalCost ?? 0));
        }
        if (goalsRes.status === 'fulfilled') {
          const gs = Array.isArray(goalsRes.value.data) ? goalsRes.value.data : [];
          setGoalsTotal(gs.reduce((s,g) => s + Number(g.current ?? 0), 0));
          setGoalsCount(gs.length);
        }
        if (savRes.status === 'fulfilled') {
          setSavingsTotal(Number(savRes.value.data?.totalSaved ?? 0));
        }
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const totalInvested = portfolioVal + goalsTotal + savingsTotal;
  const profile = AI_PROFILES[riskProfile];
  const gainPct = portfolioVal > 0 ? ((portfolioGain / (portfolioVal - portfolioGain)) * 100) : 0;

  const openQuickInvest = (dest) => { setQuickDest(dest); setShowQuickInvest(true); };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:900, color:'#0A1628' }}>Investments</h1>
          <p style={{ color:'#64748B', fontSize:14, marginTop:2 }}>Manage and grow your wealth</p>
        </div>
        <button onClick={() => openQuickInvest('portfolio')} className="btn btn-primary"
          style={{ display:'flex', alignItems:'center', gap:8, borderRadius:14, height:44 }}>
          <span style={{ fontSize:18 }}>＋</span> Invest Now
        </button>
      </div>

      {/* ── Hero ── */}
      <div style={{ background:'linear-gradient(135deg,#0A1628 0%,#1C3D6E 60%,#0F2744 100%)', borderRadius:24, padding:28, marginBottom:24, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'rgba(0,212,161,.04)', top:-120, right:-100, pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:200, height:200, borderRadius:'50%', background:'rgba(59,130,246,.06)', bottom:-60, left:40, pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:24, marginBottom:28 }}>
            {[
              { label:'Total Invested', val:`£${totalInvested.toLocaleString('en-GB',{minimumFractionDigits:2})}`, sub:'across all channels', color:'#fff' },
              { label:'Portfolio Returns', val:`${portfolioGain >= 0 ? '+' : ''}£${Math.abs(portfolioGain).toFixed(2)}`, sub:`${gainPct >= 0 ? '+' : ''}${gainPct.toFixed(1)}% all time`, color: portfolioGain >= 0 ? '#00D4A1' : '#EF4444' },
              { label:'AI Score', val:'8.4 / 10', sub:'Portfolio health', color:'#F59E0B' },
              { label:'Active Channels', val:'3', sub:'Portfolio · Goals · Savings', color:'rgba(255,255,255,.7)' },
            ].map(s => (
              <div key={s.label}>
                <p style={{ color:'rgba(255,255,255,.4)', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:.8, marginBottom:6 }}>{s.label}</p>
                <p style={{ color:s.color, fontSize:22, fontWeight:900, letterSpacing:-0.5, marginBottom:2 }}>{s.val}</p>
                <p style={{ color:'rgba(255,255,255,.3)', fontSize:11 }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Mode Toggle */}
          <div style={{ display:'inline-flex', background:'rgba(255,255,255,.08)', borderRadius:14, padding:4, gap:4 }}>
            {[['manual','🎮','Manual'],['ai','🤖','AI Powered']].map(([val, icon, lbl]) => (
              <button key={val} onClick={() => setMode(val)}
                style={{ padding:'9px 22px', borderRadius:11, border:'none', cursor:'pointer', fontWeight:700, fontSize:13, display:'flex', alignItems:'center', gap:7, transition:'all .2s',
                  background: mode===val ? '#fff' : 'transparent',
                  color: mode===val ? '#0A1628' : 'rgba(255,255,255,.6)' }}>
                <span>{icon}</span>{lbl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MANUAL MODE ── */}
      {mode === 'manual' && (
        <>
          {/* ── Beginner Starter Section ── */}
          <BeginnerStarter />

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:20, marginBottom:24 }}>
            <ChannelCard
              icon="📈" title="Portfolio" color="#3B82F6"
              value={`£${portfolioVal.toLocaleString('en-GB',{minimumFractionDigits:2})}`}
              subtitle={`${portfolioGain >= 0 ? '+' : ''}£${Math.abs(portfolioGain).toFixed(2)} total gain/loss`}
              badge={{ label:'Stocks · ETFs · Crypto', bg:'#DBEAFE', color:'#2563EB' }}
              onInvest={() => openQuickInvest('portfolio')}
              onNavigate={() => navigate('/portfolio')}
            />
            <ChannelCard
              icon="🎯" title="Savings Goals" color="#A855F7"
              value={`£${goalsTotal.toLocaleString('en-GB',{minimumFractionDigits:2})}`}
              subtitle={`${goalsCount} active goal${goalsCount !== 1 ? 's' : ''} in progress`}
              badge={{ label:'Goal-based savings', bg:'#EDE9FE', color:'#7C3AED' }}
              onInvest={() => openQuickInvest('goals')}
              onNavigate={() => navigate('/goals')}
            />
            <ChannelCard
              icon="💰" title="Savings Pot" color="#00D4A1"
              value={`£${savingsTotal.toLocaleString('en-GB',{minimumFractionDigits:2})}`}
              subtitle="Accumulated via round-ups & top-ups"
              badge={{ label:'Micro-savings', bg:'#D1FAE5', color:'#059669' }}
              onInvest={() => openQuickInvest('savings')}
              onNavigate={() => navigate('/savings')}
            />
          </div>

          {/* Quick Invest inline */}
          <div style={{ background:'#fff', borderRadius:20, padding:24, border:'1.5px solid #F1F5F9', boxShadow:'0 2px 12px rgba(0,0,0,.04)', marginBottom:24 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:'#0A162812', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>⚡</div>
              <div>
                <p style={{ fontWeight:800, fontSize:15, color:'#0A1628' }}>Quick Invest</p>
                <p style={{ fontSize:12, color:'#94A3B8' }}>Instantly put money to work</p>
              </div>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:12, alignItems:'flex-end' }}>
              <div style={{ flex:'1 1 120px' }}>
                <p style={{ fontSize:12, fontWeight:700, color:'#64748B', marginBottom:6 }}>Amount</p>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#64748B', fontWeight:700 }}>£</span>
                  <input type="number" className="form-input" placeholder="0.00"
                    style={{ paddingLeft:28, margin:0 }} id="qi-amount" />
                </div>
              </div>
              <div style={{ flex:'1 1 160px' }}>
                <p style={{ fontSize:12, fontWeight:700, color:'#64748B', marginBottom:6 }}>Destination</p>
                <select className="form-input" style={{ margin:0 }} id="qi-dest">
                  <option value="portfolio">📈 Portfolio</option>
                  <option value="goals">🎯 Goals</option>
                  <option value="savings">💰 Savings Pot</option>
                </select>
              </div>
              <button className="btn btn-primary" style={{ height:46, padding:'0 28px', borderRadius:14, fontWeight:700, whiteSpace:'nowrap' }}
                onClick={() => setShowQuickInvest(true)}>
                Invest Now →
              </button>
            </div>
          </div>

          {/* Investment tips */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16 }}>
            {[
              { icon:'💡', title:'Diversify your holdings', desc:'Spread risk across stocks, ETFs, and savings to protect your wealth in volatile markets.', color:'#F59E0B' },
              { icon:'📅', title:'Invest regularly', desc:'Even £25/week compounded over 10 years grows to £18,000+. Consistency beats timing.', color:'#3B82F6' },
              { icon:'🎯', title:'Goal-linked investing', desc:'Tie investments to specific goals so every pound has a purpose and a deadline.', color:'#00D4A1' },
            ].map(tip => (
              <div key={tip.title} style={{ background:tip.color+'08', borderRadius:16, padding:20, border:`1.5px solid ${tip.color}20` }}>
                <span style={{ fontSize:24 }}>{tip.icon}</span>
                <p style={{ fontWeight:800, fontSize:14, color:'#0A1628', margin:'10px 0 6px' }}>{tip.title}</p>
                <p style={{ fontSize:13, color:'#64748B', lineHeight:1.6 }}>{tip.desc}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── AI MODE ── */}
      {mode === 'ai' && (
        <>
          {/* AI Banner */}
          <div style={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', borderRadius:20, padding:24, marginBottom:24, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <span style={{ fontSize:28 }}>🤖</span>
                <h3 style={{ fontSize:18, fontWeight:900, color:'#fff' }}>HAY-M AI Advisor</h3>
                <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:'rgba(255,255,255,.2)', color:'#fff', fontWeight:700 }}>BETA</span>
              </div>
              <p style={{ color:'rgba(255,255,255,.7)', fontSize:13, lineHeight:1.6 }}>
                AI analysis based on your portfolio, spending patterns, and market conditions.<br/>
                <span style={{ fontSize:11, opacity:.6 }}>Not regulated financial advice. Always do your own research.</span>
              </p>
            </div>
            <div style={{ background:'rgba(255,255,255,.12)', borderRadius:16, padding:'12px 20px', textAlign:'center' }}>
              <p style={{ color:'rgba(255,255,255,.6)', fontSize:11, marginBottom:4 }}>Portfolio Health</p>
              <p style={{ color:'#fff', fontSize:28, fontWeight:900 }}>8.4<span style={{ fontSize:14, fontWeight:600 }}>/10</span></p>
            </div>
          </div>

          {/* Risk Profile */}
          <div style={{ background:'#fff', borderRadius:20, padding:24, border:'1.5px solid #F1F5F9', marginBottom:20 }}>
            <p style={{ fontWeight:800, fontSize:15, color:'#0A1628', marginBottom:4 }}>Risk Profile</p>
            <p style={{ fontSize:13, color:'#94A3B8', marginBottom:16 }}>Select your investment style — recommendations update automatically</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
              {Object.entries(AI_PROFILES).map(([key, p]) => (
                <button key={key} onClick={() => setRiskProfile(key)}
                  style={{ padding:'16px 12px', borderRadius:16, border:`2px solid ${riskProfile===key ? '#4F46E5' : '#E2E8F0'}`,
                    background: riskProfile===key ? '#4F46E508' : '#fff', cursor:'pointer', textAlign:'center', transition:'all .2s' }}>
                  <div style={{ fontSize:24, marginBottom:6 }}>{p.icon}</div>
                  <p style={{ fontWeight:800, fontSize:13, color: riskProfile===key ? '#4F46E5' : '#0A1628' }}>{p.label}</p>
                  <p style={{ fontSize:11, color:'#94A3B8', lineHeight:1.4, marginTop:3 }}>{p.desc}</p>
                </button>
              ))}
            </div>
            <p style={{ fontWeight:700, fontSize:13, color:'#0A1628', marginBottom:12 }}>Recommended Allocation</p>
            <AllocationBar allocation={profile.allocation} />
          </div>

          {/* AI Picks */}
          <div style={{ marginBottom:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div>
                <h3 style={{ fontSize:16, fontWeight:800, color:'#0A1628' }}>AI Picks — {profile.label}</h3>
                <p style={{ fontSize:13, color:'#94A3B8' }}>Based on current market conditions and your profile</p>
              </div>
              <span style={{ fontSize:11, padding:'4px 12px', borderRadius:20, background:'#EDE9FE', color:'#7C3AED', fontWeight:700 }}>Updated today</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:16 }}>
              {profile.picks.map((pick, i) => <AIPickCard key={i} pick={pick} />)}
            </div>
          </div>

          {/* Auto-Invest */}
          <div style={{ background:'#fff', borderRadius:20, padding:24, border:'1.5px solid #F1F5F9', marginBottom:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: autoInvest ? 20 : 0 }}>
              <div>
                <p style={{ fontWeight:800, fontSize:15, color:'#0A1628' }}>Auto-Invest</p>
                <p style={{ fontSize:13, color:'#94A3B8' }}>Automatically invest on a schedule</p>
              </div>
              {/* Toggle */}
              <div onClick={() => setAutoInvest(v => !v)}
                style={{ width:52, height:28, borderRadius:14, background: autoInvest ? '#00D4A1' : '#E2E8F0', position:'relative', cursor:'pointer', transition:'background .2s', flexShrink:0 }}>
                <div style={{ position:'absolute', width:22, height:22, borderRadius:'50%', background:'#fff', top:3,
                  left: autoInvest ? 27 : 3, transition:'left .2s', boxShadow:'0 1px 4px rgba(0,0,0,.2)' }} />
              </div>
            </div>
            {autoInvest && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, paddingTop:4 }}>
                <div>
                  <p style={{ fontSize:12, fontWeight:700, color:'#64748B', marginBottom:6 }}>Amount</p>
                  <div style={{ position:'relative' }}>
                    <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#64748B', fontWeight:700, fontSize:13 }}>£</span>
                    <input type="number" className="form-input" value={autoAmount}
                      onChange={e => setAutoAmount(e.target.value)} style={{ paddingLeft:24, margin:0 }} />
                  </div>
                </div>
                <div>
                  <p style={{ fontSize:12, fontWeight:700, color:'#64748B', marginBottom:6 }}>Frequency</p>
                  <select className="form-input" value={autoFreq} onChange={e => setAutoFreq(e.target.value)} style={{ margin:0 }}>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="fortnightly">Fortnightly</option>
                  </select>
                </div>
                <div>
                  <p style={{ fontSize:12, fontWeight:700, color:'#64748B', marginBottom:6 }}>Into</p>
                  <select className="form-input" style={{ margin:0 }}>
                    <option>AI Balanced Split</option>
                    <option>Portfolio Only</option>
                    <option>Goals Only</option>
                    <option>Savings Only</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* AI Insights */}
          <div style={{ background:'#fff', borderRadius:20, padding:24, border:'1.5px solid #F1F5F9' }}>
            <h3 style={{ fontSize:15, fontWeight:800, color:'#0A1628', marginBottom:16 }}>AI Insights</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[
                { icon:'💡', color:'#F59E0B', bg:'#FEF3C7', text:`Your portfolio is up £${Math.abs(portfolioGain).toFixed(2)} — consider rebalancing into ETFs to lock in some gains.` },
                { icon:'📊', color:'#3B82F6', bg:'#DBEAFE', text:`Based on your spending patterns, you could invest an extra £${(savingsTotal * 0.3).toFixed(0)}/month without impacting your daily budget.` },
                { icon:'⚡', color:'#10B981', bg:'#D1FAE5', text:`S&P 500 ETFs are outperforming the FTSE 100 by 3.2% this quarter. Your ${riskProfile} profile suggests increasing VOO allocation.` },
              ].map((insight, i) => (
                <div key={i} style={{ display:'flex', gap:12, padding:'14px 16px', borderRadius:14, background:insight.bg, border:`1px solid ${insight.color}20` }}>
                  <span style={{ fontSize:20, flexShrink:0 }}>{insight.icon}</span>
                  <p style={{ fontSize:13, color:'#0A1628', lineHeight:1.6 }}>{insight.text}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {showQuickInvest && (
        <QuickInvestModal
          portfolioVal={portfolioVal} goalsTotal={goalsTotal} savingsTotal={savingsTotal}
          onClose={() => setShowQuickInvest(false)}
        />
      )}
    </div>
  );
}
