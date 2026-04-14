import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import HaymLogo from '../components/HaymLogo';

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');
  const [devToken, setDevToken] = useState(''); // visible in dev/sandbox mode

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSent(true);
      if (res.data?.devToken) setDevToken(res.data.devToken);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
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

          {!sent ? (
            <>
              <div style={{ textAlign:'center', marginBottom:28 }}>
                <div style={{ width:64, height:64, borderRadius:32, background:'rgba(0,212,161,.15)', border:'2px solid rgba(0,212,161,.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, margin:'0 auto 16px' }}>
                  🔑
                </div>
                <h1 style={{ fontSize:24, fontWeight:900, color:'#fff', marginBottom:8 }}>Forgot password?</h1>
                <p style={{ color:'rgba(255,255,255,.5)', fontSize:14, lineHeight:1.6 }}>
                  Enter your email and we'll send you a link to reset your password.
                </p>
              </div>

              {error && (
                <div style={{ background:'rgba(239,68,68,.15)', color:'#FCA5A5', border:'1px solid rgba(239,68,68,.3)', borderRadius:12, padding:'12px 16px', marginBottom:20, fontSize:14 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom:20 }}>
                  <label style={{ display:'block', color:'rgba(255,255,255,.7)', fontSize:13, fontWeight:600, marginBottom:8 }}>Email address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ background:'rgba(255,255,255,.08)', border:'1.5px solid rgba(255,255,255,.12)', color:'#fff', borderRadius:12 }}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full"
                  style={{ height:52, fontSize:15, fontWeight:700, borderRadius:14, opacity: loading ? .7 : 1 }}
                >
                  {loading ? 'Sending…' : 'Send Reset Link →'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div style={{ textAlign:'center', marginBottom:28 }}>
                <div style={{ width:64, height:64, borderRadius:32, background:'rgba(16,185,129,.15)', border:'2px solid rgba(16,185,129,.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, margin:'0 auto 16px' }}>
                  ✉️
                </div>
                <h1 style={{ fontSize:24, fontWeight:900, color:'#fff', marginBottom:8 }}>Check your inbox</h1>
                <p style={{ color:'rgba(255,255,255,.5)', fontSize:14, lineHeight:1.6 }}>
                  If <strong style={{ color:'#fff' }}>{email}</strong> is registered with HAY-M, you'll receive a reset link shortly.
                </p>
              </div>

              {/* Sandbox dev token — visible only in non-production */}
              {devToken && (
                <div style={{ background:'rgba(251,191,36,.1)', border:'1px solid rgba(251,191,36,.3)', borderRadius:14, padding:16, marginBottom:20 }}>
                  <p style={{ color:'#FCD34D', fontSize:12, fontWeight:700, marginBottom:8 }}>🧪 Sandbox Mode — Reset Token</p>
                  <p style={{ color:'rgba(255,255,255,.6)', fontSize:11, marginBottom:10 }}>In production this would be emailed. Copy the token below to reset your password:</p>
                  <div style={{ background:'rgba(0,0,0,.3)', borderRadius:8, padding:'10px 12px', display:'flex', alignItems:'center', gap:10 }}>
                    <code style={{ color:'#00D4A1', fontSize:12, flex:1, wordBreak:'break-all' }}>{devToken}</code>
                    <button
                      onClick={() => navigator.clipboard.writeText(devToken)}
                      style={{ background:'rgba(0,212,161,.2)', border:'none', color:'#00D4A1', borderRadius:6, padding:'4px 10px', fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}
                    >
                      Copy
                    </button>
                  </div>
                  <Link
                    to={`/reset-password?token=${devToken}`}
                    style={{ display:'block', marginTop:12, textAlign:'center', background:'rgba(0,212,161,.15)', color:'#00D4A1', borderRadius:10, padding:'10px', fontSize:13, fontWeight:700, textDecoration:'none' }}
                  >
                    → Reset Password Now
                  </Link>
                </div>
              )}

              <button
                onClick={() => { setSent(false); setDevToken(''); }}
                style={{ width:'100%', height:44, borderRadius:12, background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.12)', color:'rgba(255,255,255,.6)', fontWeight:600, fontSize:14, cursor:'pointer' }}
              >
                Try a different email
              </button>
            </>
          )}

          <p style={{ textAlign:'center', marginTop:24, color:'rgba(255,255,255,.45)', fontSize:14 }}>
            Remembered it?{' '}
            <Link to="/login" style={{ color:'#00D4A1', fontWeight:600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
