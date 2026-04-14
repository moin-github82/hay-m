import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HaymLogo from '../components/HaymLogo';

const AI_ADVANTAGES = [
  { icon: '🧠', title: 'Predictive Savings',    desc: 'Analyses your spending patterns to predict the best days and amounts to save — before you even think about it.' },
  { icon: '📊', title: 'Smart Allocation',       desc: 'Automatically rebalances your portfolio across stocks, ETFs, and bonds based on your risk profile and market signals.' },
  { icon: '💡', title: 'Personalised Nudges',    desc: 'Sends you the right reminder at the right moment — like suggesting a round-up when you buy a coffee.' },
  { icon: '🎯', title: 'Goal Optimisation',      desc: 'Calculates the fastest route to each savings goal and adjusts contributions dynamically as your income changes.' },
  { icon: '⚡', title: 'Instant Insights',       desc: 'Real-time AI commentary on your financial health, flagging unusual spend and surfacing hidden saving opportunities.' },
  { icon: '🔮', title: 'Future Projections',     desc: 'See what your savings and investments could look like in 1, 5, and 10 years with AI-powered forecasting models.' },
];

const AI_VS_OTHERS = [
  { feature: 'Personalised saving plan',   haym: true,  others: false },
  { feature: 'AI portfolio rebalancing',   haym: true,  others: false },
  { feature: 'Predictive round-ups',       haym: true,  others: false },
  { feature: 'Behavioural spend analysis', haym: true,  others: false },
  { feature: 'Manual savings only',        haym: false, others: true  },
  { feature: 'One-size-fits-all plans',    haym: false, others: true  },
];

const FEATURES = [
  { icon: '💰', title: 'Micro-Savings',       desc: 'Round up every purchase and save the pennies automatically. Small amounts add up to big results.' },
  { icon: '🎯', title: 'Savings Goals',        desc: 'Set targets for anything — holiday, car, home — and track your progress every step of the way.' },
  { icon: '💳', title: 'Multi-Card Wallet',    desc: 'Link all your cards and bank accounts in one secure place and get a unified view of your finances.' },
  { icon: '🔄', title: 'Real-Time Updates',    desc: "Live balance updates and instant notifications via WebSocket so you're always in the know." },
  { icon: '🔒', title: 'Bank-Grade Security',  desc: 'JWT authentication, bcrypt encryption, and secure data storage keep your money safe 24/7.' },
  { icon: '📱', title: 'Mobile & Web',         desc: 'A seamless experience across the HAY-M mobile app and this web dashboard — always in sync.' },
];

const STEPS = [
  { num: '01', title: 'Sign Up Free',     desc: 'Create your account in under 60 seconds. No credit card required.' },
  { num: '02', title: 'Link Your Cards',  desc: 'Securely connect your existing bank cards to start tracking your spending.' },
  { num: '03', title: 'Watch It Grow',    desc: 'Round-ups and smart investing work in the background while you live your life.' },
];

const STATS = [
  { value: '£2.4M+', label: 'Saved by users'  },
  { value: '50K+',   label: 'Active savers'   },
  { value: '99.9%',  label: 'Uptime'          },
  { value: '4.9★',   label: 'App store rating' },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: (scrolled || menuOpen) ? 'rgba(10,22,40,.97)' : 'transparent',
        backdropFilter: (scrolled || menuOpen) ? 'blur(12px)' : 'none',
        borderBottom: (scrolled || menuOpen) ? '1px solid rgba(255,255,255,.08)' : 'none',
        transition: 'all .3s ease',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <HaymLogo size={36} />
            <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: -.5 }}>HAY-M</span>
          </Link>

          {/* Desktop links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="desktop-nav">
            {['Features','How it works','About'].map(link => (
              <a key={link} href={`#${link.toLowerCase().replace(/ /g,'-')}`}
                style={{ color: 'rgba(255,255,255,.75)', fontSize: 14, fontWeight: 500, transition: 'color .2s' }}
                onMouseEnter={e => e.target.style.color='#00D4A1'}
                onMouseLeave={e => e.target.style.color='rgba(255,255,255,.75)'}
              >{link}</a>
            ))}
            <Link to="/contact"
              style={{ color: 'rgba(255,255,255,.75)', fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'color .2s' }}
              onMouseEnter={e => e.target.style.color='#00D4A1'}
              onMouseLeave={e => e.target.style.color='rgba(255,255,255,.75)'}
            >Contact</Link>
            <Link to="/survey"
              style={{ display:'flex', alignItems:'center', gap:6, color:'#00D4A1', fontSize:14, fontWeight:700, textDecoration:'none', background:'rgba(0,212,161,.1)', border:'1px solid rgba(0,212,161,.3)', padding:'6px 14px', borderRadius:20, transition:'background .2s' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(0,212,161,.2)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(0,212,161,.1)'}
            >📋 Survey</Link>
          </div>

          {/* Desktop auth buttons */}
          <div className="desktop-auth-btns" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/login" className="btn btn-ghost" style={{ color: 'rgba(255,255,255,.8)', fontSize: 14 }}>Log in</Link>
            <Link to="/signup" className="btn btn-primary btn-sm" style={{ borderRadius: 10 }}>Get Started</Link>
          </div>

          {/* Mobile hamburger */}
          <button className="mobile-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, width: 42, height: 42, display: 'none', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 20, color: '#fff' }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div style={{ background: 'rgba(10,22,40,.98)', borderTop: '1px solid rgba(255,255,255,.08)', padding: '16px 5% 24px' }}>
            {[
              { label:'Features',     href:'#features'    },
              { label:'How it works', href:'#how-it-works'},
              { label:'About',        href:'#about'       },
            ].map(link => (
              <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)}
                style={{ display:'block', color:'rgba(255,255,255,.8)', fontSize:16, fontWeight:600, padding:'13px 0', borderBottom:'1px solid rgba(255,255,255,.06)', textDecoration:'none' }}>
                {link.label}
              </a>
            ))}
            <Link to="/contact" onClick={() => setMenuOpen(false)}
              style={{ display:'block', color:'rgba(255,255,255,.8)', fontSize:16, fontWeight:600, padding:'13px 0', borderBottom:'1px solid rgba(255,255,255,.06)', textDecoration:'none' }}>
              Contact
            </Link>
            <Link to="/survey" onClick={() => setMenuOpen(false)}
              style={{ display:'block', color:'#00D4A1', fontSize:16, fontWeight:700, padding:'13px 0', borderBottom:'1px solid rgba(255,255,255,.06)', textDecoration:'none' }}>
              📋 Take the Survey
            </Link>
            <div style={{ display:'flex', gap:12, marginTop:20 }}>
              <Link to="/login" onClick={() => setMenuOpen(false)}
                style={{ flex:1, textAlign:'center', padding:'13px', borderRadius:12, border:'1.5px solid rgba(255,255,255,.2)', color:'#fff', fontWeight:700, fontSize:15, textDecoration:'none' }}>
                Log in
              </Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)}
                className="btn btn-primary"
                style={{ flex:1, borderRadius:12, height:'auto', padding:'13px', fontSize:15 }}>
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #0A1628 0%, #1C3D6E 60%, #064E3B 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '120px 5% 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background circles */}
        {[{ size:600, x:'70%', y:'-10%', op:.04 }, { size:400, x:'-5%', y:'60%', op:.03 }, { size:300, x:'85%', y:'70%', op:.05 }].map((c,i) => (
          <div key={i} style={{ position:'absolute', width:c.size, height:c.size, borderRadius:'50%', background:'#00D4A1', left:c.x, top:c.y, opacity:c.op, pointerEvents:'none' }} />
        ))}

        <div className="hero-grid" style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(0,212,161,.12)', border:'1px solid rgba(0,212,161,.3)', borderRadius:20, padding:'6px 14px', marginBottom:24 }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:'#00D4A1', display:'block' }} />
              <span style={{ color:'#00D4A1', fontSize:13, fontWeight:600 }}>Micro-savings & investment platform</span>
            </div>

            <h1 className="hero-heading" style={{ fontSize: 'clamp(36px,5vw,64px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 24, letterSpacing: -2 }}>
              Save Smart,<br />
              <span style={{ background:'linear-gradient(135deg,#00D4A1,#3B82F6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                Invest Smartly.
              </span>
            </h1>

            <p style={{ fontSize: 18, color: 'rgba(255,255,255,.65)', lineHeight: 1.7, marginBottom: 40, maxWidth: 480 }}>
              HAY-M turns your everyday spending into an automatic savings habit. Round-ups, smart goals, and real investments — all in one place.
            </p>

            <div className="hero-btns" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link to="/signup" className="btn btn-primary btn-lg">Start Saving Free →</Link>
              <Link to="/login"  className="btn" style={{ background:'rgba(255,255,255,.1)', color:'#fff', padding:'14px 28px', borderRadius:16, fontSize:16, fontWeight:600, border:'1px solid rgba(255,255,255,.15)' }}>Log In</Link>
            </div>

            <div className="hero-trust" style={{ display:'flex', gap:32, marginTop:48 }}>
              {['No fees to start','Bank-level security','Cancel anytime'].map(t => (
                <div key={t} style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ color:'#00D4A1', fontSize:16 }}>✓</span>
                  <span style={{ color:'rgba(255,255,255,.6)', fontSize:13, fontWeight:500 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* App mockup */}
          <div className="hero-mockup" style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
            <div style={{
              width: 300, background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.1)',
              borderRadius: 32, padding: 20, backdropFilter:'blur(20px)',
            }}>
              <div style={{ background:'linear-gradient(135deg,#00D4A1,#0096C7)', borderRadius:20, padding:20, marginBottom:16 }}>
                <p style={{ color:'rgba(255,255,255,.7)', fontSize:12, marginBottom:4 }}>Total Balance</p>
                <p style={{ color:'#fff', fontSize:32, fontWeight:900 }}>£24,580.00</p>
                <div style={{ display:'flex', gap:20, marginTop:16 }}>
                  {[['Saved','£4,230'],['Portfolio','£18,400'],['Goals','3 Active']].map(([l,v]) => (
                    <div key={l}>
                      <p style={{ color:'rgba(255,255,255,.6)', fontSize:10 }}>{l}</p>
                      <p style={{ color:'#fff', fontSize:13, fontWeight:700 }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
              {[
                { icon:'☕', name:'Costa Coffee', amt:'-£4.60', save:'+£0.40', color:'#F59E0B' },
                { icon:'🚗', name:'Uber',          amt:'-£8.20', save:'+£0.80', color:'#3B82F6' },
                { icon:'🛒', name:'Tesco',          amt:'-£24.45',save:'+£0.55', color:'#10B981' },
              ].map(tx => (
                <div key={tx.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,.06)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:20 }}>{tx.icon}</span>
                    <div>
                      <p style={{ color:'#fff', fontSize:12, fontWeight:600 }}>{tx.name}</p>
                      <p style={{ color:'rgba(255,255,255,.4)', fontSize:10 }}>{tx.amt}</p>
                    </div>
                  </div>
                  <span style={{ color:tx.color, fontSize:12, fontWeight:700 }}>{tx.save}</span>
                </div>
              ))}
              <div style={{ marginTop:12, background:'rgba(0,212,161,.12)', borderRadius:12, padding:12, textAlign:'center' }}>
                <p style={{ color:'rgba(255,255,255,.6)', fontSize:10 }}>Micro-saved today</p>
                <p style={{ color:'#00D4A1', fontSize:22, fontWeight:900 }}>£1.75</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ background:'#0A1628', padding:'60px 5%' }}>
        <div className="stats-grid" style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:24 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign:'center', padding:'8px 0' }}>
              <p className="stat-value-lg" style={{ fontSize:'clamp(28px,3vw,40px)', fontWeight:900, color:'#00D4A1', marginBottom:4 }}>{s.value}</p>
              <p style={{ color:'rgba(255,255,255,.5)', fontSize:14 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding:'100px 5%', background:'#F5F7FA' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>

          {/* Section header */}
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <p style={{ color:'#00D4A1', fontWeight:700, fontSize:13, letterSpacing:2, textTransform:'uppercase', marginBottom:12 }}>Why HAY-M</p>
            <h2 style={{ fontSize:'clamp(28px,4vw,44px)', fontWeight:900, color:'#0A1628', letterSpacing:-1, marginBottom:16 }}>Everything you need to save more</h2>
            <p style={{ color:'#64748B', fontSize:17, maxWidth:560, margin:'0 auto', lineHeight:1.7 }}>One platform for micro-savings, AI-powered investments, and a multi-card wallet.</p>
          </div>

          {/* ── AI Featured Card ── */}
          <div className="ai-card-padding" style={{
            background:'linear-gradient(135deg,#050E1D,#0A1628,#0D2347)',
            borderRadius:28, padding:'48px 40px', marginBottom:28,
            border:'1.5px solid rgba(0,212,161,.18)',
            boxShadow:'0 24px 60px rgba(0,0,0,.18)',
            position:'relative', overflow:'hidden',
          }}>
            {/* Decorative glows */}
            <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,212,161,.08) 0%,transparent 70%)', top:-120, right:-80, pointerEvents:'none' }} />
            <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(59,130,246,.06) 0%,transparent 70%)', bottom:-80, left:-60, pointerEvents:'none' }} />

            {/* Top row — badge + headline */}
            <div style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-start', justifyContent:'space-between', gap:24, marginBottom:40, position:'relative', zIndex:1 }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                  <div style={{ background:'linear-gradient(135deg,rgba(0,212,161,.2),rgba(0,212,161,.08))', border:'1px solid rgba(0,212,161,.35)', borderRadius:30, padding:'6px 16px', display:'inline-flex', alignItems:'center', gap:6 }}>
                    <span style={{ fontSize:14 }}>✨</span>
                    <span style={{ color:'#00D4A1', fontSize:12, fontWeight:800, letterSpacing:1, textTransform:'uppercase' }}>AI-Powered</span>
                  </div>
                  <div style={{ background:'rgba(168,85,247,.15)', border:'1px solid rgba(168,85,247,.3)', borderRadius:30, padding:'6px 14px' }}>
                    <span style={{ color:'#C084FC', fontSize:12, fontWeight:700 }}>New</span>
                  </div>
                </div>
                <h3 style={{ fontSize:'clamp(24px,3vw,36px)', fontWeight:900, color:'#fff', letterSpacing:-.5, lineHeight:1.2, marginBottom:12 }}>
                  Smarter saving &amp;<br />investing with AI
                </h3>
                <p style={{ color:'rgba(255,255,255,.55)', fontSize:16, maxWidth:480, lineHeight:1.7 }}>
                  HAY-M's AI engine learns your spending habits, optimises your savings schedule, and rebalances your portfolio — all automatically. No financial advisor needed.
                </p>
              </div>

              {/* VS comparison table */}
              <div className="ai-vs-table" style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:18, padding:20, minWidth:280, flexShrink:0 }}>
                <p style={{ color:'rgba(255,255,255,.4)', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:14 }}>HAY-M vs. Traditional Apps</p>
                {AI_VS_OTHERS.map(row => (
                  <div key={row.feature} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
                    <span style={{ color:'rgba(255,255,255,.65)', fontSize:13 }}>{row.feature}</span>
                    <div style={{ display:'flex', gap:16, flexShrink:0 }}>
                      <span style={{ fontSize:15 }}>{row.haym   ? '✅' : '❌'}</span>
                      <span style={{ fontSize:15 }}>{row.others ? '✅' : '❌'}</span>
                    </div>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'flex-end', gap:16, marginTop:10 }}>
                  <span style={{ color:'#00D4A1', fontSize:11, fontWeight:700 }}>HAY-M</span>
                  <span style={{ color:'rgba(255,255,255,.3)', fontSize:11, fontWeight:600 }}>Others</span>
                </div>
              </div>
            </div>

            {/* AI capability cards grid */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16, position:'relative', zIndex:1 }}>
              {AI_ADVANTAGES.map((adv, i) => (
                <div key={adv.title} style={{
                  background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)',
                  borderRadius:16, padding:20, transition:'background .2s, border-color .2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(0,212,161,.07)'; e.currentTarget.style.borderColor='rgba(0,212,161,.25)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,.04)'; e.currentTarget.style.borderColor='rgba(255,255,255,.07)'; }}
                >
                  <div style={{ fontSize:24, marginBottom:10 }}>{adv.icon}</div>
                  <p style={{ fontSize:14, fontWeight:800, color:'#fff', marginBottom:6 }}>{adv.title}</p>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,.45)', lineHeight:1.6 }}>{adv.desc}</p>
                </div>
              ))}
            </div>

            {/* Bottom CTA strip */}
            <div style={{ marginTop:32, paddingTop:24, borderTop:'1px solid rgba(255,255,255,.07)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16, position:'relative', zIndex:1 }}>
              <p style={{ color:'rgba(255,255,255,.4)', fontSize:13 }}>
                Powered by machine learning · Updates daily · No extra cost
              </p>
              <Link to="/signup" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'linear-gradient(135deg,#00D4A1,#00A87F)', color:'#fff', padding:'12px 24px', borderRadius:14, fontWeight:800, fontSize:14, textDecoration:'none', boxShadow:'0 6px 20px rgba(0,212,161,.3)' }}>
                Try AI Savings Free →
              </Link>
            </div>
          </div>

          {/* Regular features grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:24 }}>
            {FEATURES.map(f => (
              <div key={f.title} className="card" style={{ transition:'transform .2s,box-shadow .2s', cursor:'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 40px rgba(0,0,0,.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=''; }}
              >
                <div style={{ width:52, height:52, borderRadius:16, background:'linear-gradient(135deg,#E0FFF8,#B2F5EA)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, marginBottom:16 }}>{f.icon}</div>
                <h3 style={{ fontSize:17, fontWeight:800, color:'#0A1628', marginBottom:8 }}>{f.title}</h3>
                <p style={{ color:'#64748B', fontSize:14, lineHeight:1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" style={{ padding:'100px 5%', background:'#fff' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <p style={{ color:'#00D4A1', fontWeight:700, fontSize:13, letterSpacing:2, textTransform:'uppercase', marginBottom:12 }}>Process</p>
            <h2 style={{ fontSize:'clamp(28px,4vw,44px)', fontWeight:900, color:'#0A1628', letterSpacing:-1 }}>Up and running in minutes</h2>
          </div>
          <div className="steps-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:48, position:'relative' }}>
            {STEPS.map((s, i) => (
              <div key={s.num} style={{ textAlign:'center', position:'relative' }}>
                {i < STEPS.length - 1 && (
                  <div className="steps-connector" style={{ position:'absolute', top:28, left:'60%', right:'-40%', height:2, background:'linear-gradient(90deg,#00D4A1,rgba(0,212,161,.1))', zIndex:0 }} />
                )}
                <div style={{ width:56, height:56, borderRadius:18, background:'linear-gradient(135deg,#00D4A1,#00A87F)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:20, margin:'0 auto 20px', position:'relative', zIndex:1, boxShadow:'0 8px 24px rgba(0,212,161,.3)' }}>{s.num}</div>
                <h3 style={{ fontSize:18, fontWeight:800, color:'#0A1628', marginBottom:8 }}>{s.title}</h3>
                <p style={{ color:'#64748B', fontSize:14, lineHeight:1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Survey banner ── */}
      <section id="survey" style={{ padding:'80px 5%', background:'#fff' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{
            background:'linear-gradient(135deg,#050E1D,#0A1628,#0D2347)',
            borderRadius:28, padding:'48px 40px',
            border:'1.5px solid rgba(0,212,161,.18)',
            boxShadow:'0 24px 60px rgba(0,0,0,.15)',
            position:'relative', overflow:'hidden',
            display:'grid', gridTemplateColumns:'1fr auto', gap:40, alignItems:'center',
          }} className="survey-banner-grid">
            {/* Decorative glow */}
            <div style={{ position:'absolute', width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,212,161,.08) 0%,transparent 70%)', top:-100, right:-60, pointerEvents:'none' }} />

            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(0,212,161,.12)', border:'1px solid rgba(0,212,161,.3)', borderRadius:20, padding:'5px 14px', marginBottom:18 }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:'#00D4A1', display:'block' }} />
                <span style={{ color:'#00D4A1', fontSize:12, fontWeight:700 }}>2 minutes · Shape our roadmap</span>
              </div>
              <h2 style={{ fontSize:'clamp(22px,3vw,34px)', fontWeight:900, color:'#fff', letterSpacing:-.5, marginBottom:12, lineHeight:1.2 }}>
                Got ideas for HAY-M?
              </h2>
              <p style={{ color:'rgba(255,255,255,.55)', fontSize:15, lineHeight:1.7, maxWidth:480 }}>
                Tell us what features you want, what's not working, or what would make you save more — every response is read by our team and directly influences what we build next.
              </p>
              <div style={{ display:'flex', gap:16, marginTop:24, flexWrap:'wrap' }}>
                {['🔒 Private & secure','📨 No spam, ever','⚡ Takes 2 minutes'].map(t => (
                  <span key={t} style={{ color:'rgba(255,255,255,.5)', fontSize:13, display:'flex', alignItems:'center', gap:4 }}>{t}</span>
                ))}
              </div>
            </div>

            <div style={{ position:'relative', zIndex:1, flexShrink:0 }}>
              <Link to="/survey" style={{
                display:'inline-flex', flexDirection:'column', alignItems:'center', gap:10,
                background:'linear-gradient(135deg,#00D4A1,#00A87F)',
                color:'#fff', padding:'20px 36px', borderRadius:20,
                fontWeight:800, fontSize:16, textDecoration:'none',
                boxShadow:'0 8px 32px rgba(0,212,161,.4)',
                transition:'transform .2s, box-shadow .2s',
                whiteSpace:'nowrap',
              }}
                onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 14px 40px rgba(0,212,161,.5)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(0,212,161,.4)'; }}
              >
                <span style={{ fontSize:32 }}>📋</span>
                Take the Survey
                <span style={{ fontSize:12, fontWeight:600, opacity:.8 }}>Free · No sign-up needed</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding:'100px 5%', background:'linear-gradient(135deg,#0A1628,#1C3D6E)', textAlign:'center' }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <h2 style={{ fontSize:'clamp(28px,4vw,44px)', fontWeight:900, color:'#fff', letterSpacing:-1, marginBottom:16 }}>Start your savings journey today</h2>
          <p style={{ color:'rgba(255,255,255,.6)', fontSize:17, marginBottom:40, lineHeight:1.7 }}>Join thousands of savers who are building wealth one round-up at a time.</p>
          <Link to="/signup" className="btn btn-primary btn-lg">Create Free Account →</Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background:'#060E1A', padding:'48px 5% 32px', borderTop:'1px solid rgba(255,255,255,.06)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:40 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <HaymLogo size={32} />
              <span style={{ fontSize:20, fontWeight:900, color:'#fff' }}>HAY-M</span>
            </div>
            <div style={{ display:'flex', gap:24 }}>
              {[['Privacy','/privacy'],['Terms','/terms'],['Contact','/contact'],['Survey','/survey']].map(([l,href]) => (
                <Link key={l} to={href} style={{ color:'rgba(255,255,255,.4)', fontSize:13, fontWeight:500, transition:'color .2s', textDecoration:'none' }}
                  onMouseEnter={e=>e.target.style.color='#00D4A1'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,.4)'}>{l}</Link>
              ))}
            </div>
          </div>
          <p style={{ color:'rgba(255,255,255,.25)', fontSize:12, textAlign:'center' }}>© 2026 HAY-M. All rights reserved. Your savings are protected.</p>
        </div>
      </footer>
    </div>
  );
}
