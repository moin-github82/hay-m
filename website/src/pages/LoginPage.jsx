import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HaymLogo from '../components/HaymLogo';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(145deg,#0A1628,#1C3D6E)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:440 }}>
        {/* Logo */}
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center', marginBottom:36, textDecoration:'none' }}>
          <HaymLogo size={42} />
          <span style={{ fontSize:26, fontWeight:900, color:'#fff', letterSpacing:-.5 }}>HAY-M</span>
        </Link>

        <div style={{ background:'rgba(255,255,255,.06)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,.12)', borderRadius:24, padding:40 }}>
          <h1 style={{ fontSize:26, fontWeight:900, color:'#fff', marginBottom:6 }}>Welcome back</h1>
          <p style={{ color:'rgba(255,255,255,.5)', fontSize:14, marginBottom:32 }}>Sign in to your HAY-M account</p>

          {error && <div className="alert alert-error" style={{ background:'rgba(239,68,68,.15)', color:'#FCA5A5', border:'1px solid rgba(239,68,68,.3)' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ color:'rgba(255,255,255,.7)' }}>Email address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                autoComplete="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                style={{ background:'rgba(255,255,255,.08)', border:'1.5px solid rgba(255,255,255,.12)', color:'#fff', borderRadius:12 }}
                required
              />
            </div>
            <div className="form-group">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <label className="form-label" style={{ color:'rgba(255,255,255,.7)', margin:0 }}>Password</label>
                <Link to="/forgot-password" style={{ color:'#00D4A1', fontSize:13, fontWeight:600, textDecoration:'none' }}>Forgot password?</Link>
              </div>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                autoComplete="current-password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                style={{ background:'rgba(255,255,255,.08)', border:'1.5px solid rgba(255,255,255,.12)', color:'#fff', borderRadius:12 }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
              style={{ height:52, fontSize:15, fontWeight:700, borderRadius:14, marginTop:8, opacity: loading ? .7 : 1 }}
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:24, color:'rgba(255,255,255,.45)', fontSize:14 }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color:'#00D4A1', fontWeight:600 }}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
