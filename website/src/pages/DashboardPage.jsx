import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function StatCard({ icon, label, value, sub, color = '#00D4A1', link }) {
  return (
    <Link to={link || '#'} style={{ textDecoration:'none' }}>
      <div className="stat-card" style={{ transition:'transform .2s,box-shadow .2s', cursor:'pointer' }}
        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=''; }}
      >
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
          <div style={{ width:44, height:44, borderRadius:14, background:color+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{icon}</div>
          {sub && <span className="badge badge-success" style={{ fontSize:10 }}>{sub}</span>}
        </div>
        <p style={{ fontSize:12, color:'#64748B', fontWeight:500, marginBottom:4 }}>{label}</p>
        <p style={{ fontSize:24, fontWeight:900, color:'#0A1628' }}>{value}</p>
      </div>
    </Link>
  );
}

function TxRow({ tx }) {
  const isCredit = tx.type === 'credit';
  return (
    <div style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 0', borderBottom:'1px solid #F5F7FA' }}>
      <div style={{ width:42, height:42, borderRadius:13, background: isCredit ? '#D1FAE5' : '#FEE2E2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
        {isCredit ? '📥' : '📤'}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontWeight:700, fontSize:14, color:'#0A1628', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{tx.title}</p>
        <p style={{ fontSize:12, color:'#94A3B8' }}>{tx.subtitle} · {new Date(tx.createdAt).toLocaleDateString('en-GB',{ day:'numeric',month:'short' })}</p>
      </div>
      <p style={{ fontWeight:800, fontSize:15, color: isCredit ? '#10B981' : '#0A1628', flexShrink:0 }}>
        {isCredit ? '+' : '-'}£{Number(tx.amount).toFixed(2)}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, trackerRes] = await Promise.all([
          api.get('/dashboard'),
          api.get('/savings-tracker'),
        ]);
        setData({ ...dashRes.data, tracker: trackerRes.data });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const d = data || {};
  const goals = d.savingsGoals || [];
  const transactions = d.recentTransactions || [];
  const tracker = d.tracker || {};

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:26, fontWeight:900, color:'#0A1628' }}>{greeting}, {user?.fullName?.split(' ')[0]} 👋</h1>
        <p style={{ color:'#64748B', fontSize:14, marginTop:2 }}>Here's your financial overview for today.</p>
      </div>

      {/* Balance hero */}
      <div style={{ background:'linear-gradient(135deg,#0A1628,#1C3D6E)', borderRadius:24, padding:28, marginBottom:24, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', background:'rgba(0,212,161,.06)', top:-80, right:-60 }} />
        <div style={{ position:'absolute', width:200, height:200, borderRadius:'50%', background:'rgba(59,130,246,.05)', bottom:-60, right:100 }} />
        <div style={{ position:'relative', zIndex:1, display:'grid', gridTemplateColumns:'1fr auto', gap:24, alignItems:'center' }}>
          <div>
            <p style={{ color:'rgba(255,255,255,.55)', fontSize:13, marginBottom:4 }}>Total Balance</p>
            <p style={{ color:'#fff', fontSize:40, fontWeight:900, letterSpacing:-1 }}>
              £{Number(d.totalBalance ?? 0).toLocaleString('en-GB', { minimumFractionDigits:2 })}
            </p>
            <p style={{ color:'rgba(255,255,255,.4)', fontSize:13, marginTop:4 }}>{d.cards?.length ?? 0} cards linked</p>
          </div>
          <div style={{ display:'flex', gap:32 }}>
            {[
              { label:'Monthly In',  value:`£${Number(d.monthlyIncome ?? 0).toFixed(0)}`,  color:'#10B981', icon:'↑' },
              { label:'Monthly Out', value:`£${Number(d.monthlyExpense ?? 0).toFixed(0)}`, color:'#F4A261', icon:'↓' },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'center' }}>
                <div style={{ width:40, height:40, borderRadius:12, background:'rgba(255,255,255,.08)', display:'flex', alignItems:'center', justifyContent:'center', color:s.color, fontWeight:900, fontSize:18, margin:'0 auto 6px' }}>{s.icon}</div>
                <p style={{ color:'rgba(255,255,255,.45)', fontSize:11 }}>{s.label}</p>
                <p style={{ color:'#fff', fontWeight:800, fontSize:16 }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, marginBottom:28 }}>
        <StatCard icon="💰" label="Micro-Savings" value={`£${Number(tracker.totalSaved ?? 0).toFixed(2)}`}  color="#00D4A1" link="/savings" />
        <StatCard icon="📈" label="Portfolio Value" value={`£${Number(d.portfolioValue ?? 0).toLocaleString('en-GB')}`} color="#3B82F6" link="/portfolio" />
        <StatCard icon="🎯" label="Active Goals" value={goals.length}  color="#A855F7" link="/goals" />
        <StatCard icon="📋" label="Transactions" value={transactions.length} sub="This month" color="#F4A261" link="/transactions" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:24 }}>
        {/* Recent transactions */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
            <div>
              <h3 className="section-title">Recent Activity</h3>
              <p className="section-subtitle">Your latest transactions</p>
            </div>
            <Link to="/transactions" style={{ fontSize:13, fontWeight:600, color:'#00D4A1', textDecoration:'none' }}>View all →</Link>
          </div>
          {transactions.length === 0
            ? <p style={{ color:'#94A3B8', textAlign:'center', padding:'32px 0', fontSize:14 }}>No transactions yet</p>
            : transactions.slice(0,8).map(tx => <TxRow key={tx._id} tx={tx} />)
          }
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {/* Goals progress */}
          <div className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <h3 className="section-title">Savings Goals</h3>
              <Link to="/goals" style={{ fontSize:13, fontWeight:600, color:'#00D4A1', textDecoration:'none' }}>Manage →</Link>
            </div>
            {goals.length === 0
              ? <p style={{ color:'#94A3B8', fontSize:14, textAlign:'center', padding:'16px 0' }}>No goals yet</p>
              : goals.map(g => {
                  const pct = g.target > 0 ? Math.min(Math.round((g.current / g.target) * 100), 100) : 0;
                  return (
                    <div key={g._id} style={{ marginBottom:14 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                        <span style={{ fontSize:13, fontWeight:700, color:'#0A1628' }}>{g.name}</span>
                        <span style={{ fontSize:12, fontWeight:700, color: g.color || '#00D4A1' }}>{pct}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width:`${pct}%`, background: g.color || '#00D4A1' }} />
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', marginTop:3 }}>
                        <span style={{ fontSize:11, color:'#94A3B8' }}>£{Number(g.current).toLocaleString('en-GB')}</span>
                        <span style={{ fontSize:11, color:'#94A3B8' }}>£{Number(g.target).toLocaleString('en-GB')}</span>
                      </div>
                    </div>
                  );
                })
            }
          </div>

          {/* Micro-savings summary */}
          <div style={{ background:'linear-gradient(135deg,#064E3B,#065F46)', borderRadius:20, padding:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
              <div>
                <p style={{ color:'rgba(255,255,255,.6)', fontSize:12, marginBottom:4 }}>Total Micro-Saved</p>
                <p style={{ color:'#00D4A1', fontSize:28, fontWeight:900 }}>£{Number(tracker.totalSaved ?? 0).toFixed(2)}</p>
              </div>
              <Link to="/savings" style={{ background:'rgba(0,212,161,.15)', color:'#00D4A1', padding:'6px 12px', borderRadius:20, fontSize:12, fontWeight:600, textDecoration:'none' }}>View →</Link>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[
                { l:'Today',      v:`£${Number(tracker.todaySaved ?? 0).toFixed(2)}`,   max:`/ £${Number(tracker.dailyLimit ?? 5).toFixed(0)}` },
                { l:'This Month', v:`£${Number(tracker.monthSaved ?? 0).toFixed(2)}`,   max:`/ £${Number(tracker.monthlyLimit ?? 100).toFixed(0)}` },
              ].map(s => (
                <div key={s.l} style={{ background:'rgba(255,255,255,.07)', borderRadius:12, padding:'10px 12px' }}>
                  <p style={{ color:'rgba(255,255,255,.5)', fontSize:11, marginBottom:3 }}>{s.l}</p>
                  <p style={{ color:'#fff', fontWeight:800, fontSize:15 }}>{s.v} <span style={{ color:'rgba(255,255,255,.35)', fontSize:11, fontWeight:400 }}>{s.max}</span></p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
