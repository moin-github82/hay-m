import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HaymLogo from './HaymLogo';

const NAV_ITEMS = [
  { to:'/dashboard',    icon:'🏠', label:'Dashboard',     minPlan:'free'  },
  { to:'/wallet',       icon:'💳', label:'Wallet',         minPlan:'free'  },
  { to:'/insights',     icon:'🔍', label:'Insights',       minPlan:'plus'  },
  { to:'/investment',   icon:'💹', label:'Invest',         minPlan:'plus', highlight: true },
  { to:'/goals',        icon:'🎯', label:'Goals',          minPlan:'free'  },
  { to:'/isa',          icon:'🏦', label:'ISA',            minPlan:'plus'  },
  { to:'/savings',      icon:'💰', label:'Savings',        minPlan:'free'  },
  { to:'/portfolio',    icon:'📈', label:'Portfolio',      minPlan:'plus'  },
  { to:'/notifications',icon:'🔔', label:'Alerts',         minPlan:'plus'  },
  { to:'/transactions', icon:'📋', label:'Transactions',   minPlan:'free'  },
  { to:'/settings',    icon:'⚙️', label:'Settings',       minPlan:'free'  },
  { to:'/fees',         icon:'💷', label:'Fees',           minPlan:'free'  },
  { to:'/contact',      icon:'📬', label:'Contact Us',     minPlan:'free'  },
];

const PLAN_RANK = { free: 0, plus: 1, pro: 2 };
const hasAccess = (userPlan, minPlan) => (PLAN_RANK[userPlan] ?? 0) >= (PLAN_RANK[minPlan] ?? 0);

// Bottom nav shows only the 5 most important tabs
const BOTTOM_NAV_ITEMS = [
  { to:'/dashboard',  icon:'🏠', label:'Home',      minPlan:'free' },
  { to:'/wallet',     icon:'💳', label:'Wallet',    minPlan:'free' },
  { to:'/investment', icon:'💹', label:'Invest',    minPlan:'plus' },
  { to:'/goals',      icon:'🎯', label:'Goals',     minPlan:'free' },
  { to:'/portfolio',  icon:'📈', label:'Portfolio', minPlan:'plus' },
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 767);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 767);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const isMobile  = useIsMobile();

  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-collapse sidebar on tablet
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024 && window.innerWidth > 767) setSidebarOpen(false);
      else if (window.innerWidth > 1024) setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const currentPage = NAV_ITEMS.find(n => n.to === location.pathname)?.label || 'Dashboard';

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'#F5F7FA' }}>

      {/* ── Mobile overlay backdrop ── */}
      {isMobile && (
        <div
          className={`sidebar-overlay ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={isMobile ? `sidebar-slideover ${mobileMenuOpen ? 'open' : ''}` : 'sidebar-desktop'}
        style={{
          width: isMobile ? 260 : (sidebarOpen ? 260 : 72),
          background: '#0A1628',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          transition: 'width .25s ease, transform .25s ease',
          overflow: 'hidden',
          borderRight: '1px solid rgba(255,255,255,.06)',
          zIndex: 160,
        }}
      >
        {/* Logo */}
        <div style={{ padding:'20px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,.06)', minHeight:72 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <HaymLogo size={38} />
            {(sidebarOpen || isMobile) && <span style={{ fontSize:20, fontWeight:900, color:'#fff', letterSpacing:-.5, whiteSpace:'nowrap' }}>HAY-M</span>}
          </div>
          {isMobile && (
            <button onClick={() => setMobileMenuOpen(false)}
              style={{ background:'rgba(255,255,255,.08)', border:'none', color:'rgba(255,255,255,.6)', width:32, height:32, borderRadius:8, cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>
              ✕
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'16px 10px', overflowY:'auto' }}>
          {(sidebarOpen || isMobile) && (
            <p style={{ color:'rgba(255,255,255,.25)', fontSize:10, fontWeight:700, letterSpacing:2, textTransform:'uppercase', paddingLeft:10, marginBottom:8 }}>Menu</p>
          )}
          {NAV_ITEMS.map(item => {
            const locked = !hasAccess(user?.plan, item.minPlan);
            if (locked) {
              return (
                <div key={item.to}
                  onClick={() => navigate('/upgrade?required=' + item.minPlan)}
                  style={{
                    display:'flex', alignItems:'center', gap:12,
                    padding:'11px 12px', borderRadius:12, marginBottom:4,
                    color:'rgba(255,255,255,.3)', background:'transparent',
                    fontWeight:500, fontSize:14, cursor:'pointer',
                    whiteSpace:'nowrap', overflow:'hidden',
                    border:'1px solid transparent', transition:'all .15s',
                    opacity: 0.6,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(0,212,161,.05)'; e.currentTarget.style.borderColor='rgba(0,212,161,.15)'; e.currentTarget.style.color='rgba(255,255,255,.5)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='rgba(255,255,255,.3)'; }}
                >
                  <span style={{ fontSize:20, flexShrink:0 }}>{item.icon}</span>
                  {(sidebarOpen || isMobile) && <span style={{ flex:1 }}>{item.label}</span>}
                  {(sidebarOpen || isMobile) && (
                    <span style={{ fontSize:11, background:'rgba(255,255,255,.06)', padding:'2px 6px', borderRadius:5, color:'rgba(255,255,255,.3)', flexShrink:0 }}>🔒</span>
                  )}
                </div>
              );
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 12px',
                  borderRadius: 12,
                  marginBottom: 4,
                  textDecoration: 'none',
                  color: isActive ? '#00D4A1' : item.highlight ? '#A5F3D0' : 'rgba(255,255,255,.55)',
                  background: isActive ? 'rgba(0,212,161,.1)' : item.highlight ? 'rgba(0,212,161,.06)' : 'transparent',
                  fontWeight: isActive ? 700 : item.highlight ? 600 : 500,
                  fontSize: 14,
                  transition: 'all .15s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  border: item.highlight && !isActive ? '1px solid rgba(0,212,161,.15)' : '1px solid transparent',
                })}
              >
                <span style={{ fontSize:20, flexShrink:0 }}>{item.icon}</span>
                {(sidebarOpen || isMobile) && (
                  <span style={{ flex:1 }}>{item.label}</span>
                )}
                {(sidebarOpen || isMobile) && item.highlight && (
                  <span style={{ fontSize:9, fontWeight:800, padding:'2px 6px', borderRadius:6, background:'rgba(0,212,161,.2)', color:'#00D4A1', letterSpacing:.5 }}>NEW</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div style={{ padding:'12px 10px', borderTop:'1px solid rgba(255,255,255,.06)' }}>
          {(sidebarOpen || isMobile) && (
            <div
              onClick={() => navigate('/settings')}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:12, background:'rgba(255,255,255,.05)', marginBottom:8, cursor:'pointer', transition:'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(0,212,161,.08)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,.05)'}
              title="Go to Settings"
            >
              <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#00D4A1,#00A87F)', display:'flex', alignItems:'center', justifyContent:'center', color:'#0A1628', fontWeight:900, fontSize:12, flexShrink:0 }}>{initials}</div>
              <div style={{ overflow:'hidden', flex:1 }}>
                <p style={{ color:'#fff', fontSize:13, fontWeight:700, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.fullName}</p>
                <span style={{
                  fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase',
                  padding: '2px 8px', borderRadius: 6, display: 'inline-block', marginBottom: 2,
                  background: user?.plan === 'pro' ? 'linear-gradient(135deg,#A855F7,#7C3AED)'
                            : user?.plan === 'plus' ? 'rgba(0,212,161,.2)'
                            : 'rgba(255,255,255,.1)',
                  color: user?.plan === 'pro' ? '#fff'
                       : user?.plan === 'plus' ? '#00D4A1'
                       : 'rgba(255,255,255,.4)',
                  border: user?.plan === 'pro' ? 'none'
                        : user?.plan === 'plus' ? '1px solid rgba(0,212,161,.3)'
                        : '1px solid rgba(255,255,255,.1)',
                }}>
                  {user?.plan || 'free'}
                </span>
                <p style={{ color:'rgba(255,255,255,.4)', fontSize:11, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.email}</p>
              </div>
              <span style={{ fontSize:14, color:'rgba(255,255,255,.25)', flexShrink:0 }}>⚙️</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              display:'flex', alignItems:'center', gap:10,
              width:'100%', padding:'9px 12px', borderRadius:12,
              background:'transparent', border:'none', color:'rgba(255,255,255,.4)',
              fontSize:14, fontWeight:500, cursor:'pointer', transition:'all .15s',
              whiteSpace:'nowrap', overflow:'hidden',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,.12)'; e.currentTarget.style.color='#EF4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,.4)'; }}
          >
            <span style={{ fontSize:18, flexShrink:0 }}>🚪</span>
            {(sidebarOpen || isMobile) && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>

        {/* Top Bar */}
        <header className="top-header" style={{
          height:64,
          background:'#fff',
          borderBottom:'1px solid #E2E8F0',
          display:'flex',
          alignItems:'center',
          justifyContent:'space-between',
          padding:'0 24px',
          flexShrink:0,
          gap:12,
        }}>
          {/* Left: hamburger / toggle */}
          {isMobile ? (
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#64748B', padding:'4px 6px', borderRadius:8, flexShrink:0 }}
            >
              ☰
            </button>
          ) : (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'#64748B', padding:'4px 8px', borderRadius:8, transition:'background .15s', flexShrink:0 }}
              onMouseEnter={e => e.currentTarget.style.background='#F5F7FA'}
              onMouseLeave={e => e.currentTarget.style.background='none'}
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          )}

          {/* Center: page title on mobile */}
          {isMobile && (
            <p style={{ fontSize:16, fontWeight:800, color:'#0A1628', flex:1, textAlign:'center' }}>{currentPage}</p>
          )}

          {/* Right: actions */}
          <div style={{ display:'flex', alignItems:'center', gap:isMobile ? 8 : 16 }}>
            {/* Notifications bell */}
            <div style={{ position:'relative' }}>
              <button
                onClick={() => navigate('/notifications')}
                style={{ background:'#F5F7FA', border:'1.5px solid #E2E8F0', borderRadius:12, width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:18, transition:'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background='#E8FDF7'}
                onMouseLeave={e => e.currentTarget.style.background='#F5F7FA'}
                title="Notifications"
              >🔔</button>
              <span style={{ position:'absolute', top:6, right:6, width:8, height:8, background:'#EF4444', borderRadius:'50%', border:'2px solid #fff', pointerEvents:'none' }} />
            </div>

            {/* Avatar → Settings */}
            {!isMobile && (
              <div
                onClick={() => navigate('/settings')}
                style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', padding:'6px 10px', borderRadius:12, transition:'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background='#F5F7FA'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}
                title="Account Settings"
              >
                <div style={{ width:38, height:38, borderRadius:11, background:'linear-gradient(135deg,#00D4A1,#00A87F)', display:'flex', alignItems:'center', justifyContent:'center', color:'#0A1628', fontWeight:900, fontSize:13, flexShrink:0 }}>{initials}</div>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:'#0A1628' }}>{user?.fullName}</p>
                  <p style={{ fontSize:11, color:'#94A3B8' }}>{user?.email}</p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="main-content" style={{ flex:1, overflowY:'auto', padding: isMobile ? 16 : 28, paddingBottom: isMobile ? 80 : 28 }}>
          <Outlet />
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      {isMobile && (
        <nav className="bottom-nav">
          {BOTTOM_NAV_ITEMS.filter(item => hasAccess(user?.plan, item.minPlan ?? 'free')).map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
          {/* More button → opens slide-over */}
          <button className="bottom-nav-item" onClick={() => setMobileMenuOpen(true)}>
            <span className="nav-icon">☰</span>
            <span>More</span>
          </button>
        </nav>
      )}
    </div>
  );
}
