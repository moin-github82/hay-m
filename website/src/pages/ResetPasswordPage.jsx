import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import HaymLogo from '../components/HaymLogo';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tokenFromUrl = searchParams.get('token') || '';

  const [form,    setForm]    = useState({ token: tokenFromUrl, password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError("Passwords don't match"); return; }
    if (form.password.length < 8)      { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token: form.token, newPassword: form.password });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(145deg,#0A1628,#1C3D6E)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:440 }}>

        <Link to="/" style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center', marginBottom:36, textDecoration:'none' }}>
          <HaymLogo size={42} />
          <span style={{ fontSize:26, fontWeight:900, color:'#fff', letterSpacing:-.5 }}>HAY-M</span>
        </Link>

        <div style={{ background:'rgba(255,255,255,.06)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,.12)', borderRadius:24, padding:40 }}>

          {!done ? (
            <>
              <div style={{ textAlign:'center', marginBottom:28 }}>
                <div style={{ width:64, height:64, borderRadius:32, background:'rgba(0,212,161,.15)', border:'2px solid rgba(0,212,161,.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, margin:'0 auto 16px' }}>
                  🔒
                </div>
                <h1 style={{ fontSize:24, fontWeight:900, color:'#fff', marginBottom:8 }}>Set new password</h1>
                <p style={{ color:'rgba(255,255,255,.5)', fontSize:14 }}>Enter your reset token and choose a new password.</p>
              </div>

              {error && (
                <div style={{ background:'rgba(239,68,68,.15)', color:'#FCA5A5', border:'1px solid rgba(239,68,68,.3)', borderRadius:12, padding:'12px 16px', marginBottom:20, fontSize:14 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {!tokenFromUrl && (
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:'block', color:'rgba(255,255,255,.7)', fontSize:13, fontWeight:600, marginBottom:8 }}>Reset Token</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Paste your reset token"
                      value={form.token}
                      onChange={e => setForm(p => ({ ...p, token: e.target.value }))}
                      style={{ background:'rgba(255,255,255,.08)', border:'1.5px solid rgba(255,255,255,.12)', color:'#fff', borderRadius:12, fontFamily:'monospace', fontSize:13 }}
                      required
                    />
                  </div>
                )}

                {[
                  { key:'password', label:'New Password',     placeholder:'Min 8 characters' },
                  { key:'confirm',  label:'Confirm Password', placeholder:'Repeat password' },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom:16 }}>
                    <label style={{ display:'block', color:'rgba(255,255,255,.7)', fontSize:13, fontWeight:600, marginBottom:8 }}>{f.label}</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder={f.placeholder}
                      value={form[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ background:'rgba(255,255,255,.08)', border:'1.5px solid rgba(255,255,255,.12)', color:'#fff', borderRadius:12 }}
                      required
                    />
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full"
                  style={{ height:52, fontSize:15, fontWeight:700, borderRadius:14, marginTop:8, opacity: loading ? .7 : 1 }}
                >
                  {loading ? 'Resetting…' : 'Reset Password →'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign:'center' }}>
              <div style={{ width:64, height:64, borderRadius:32, background:'rgba(16,185,129,.15)', border:'2px solid rgba(16,185,129,.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, margin:'0 auto 20px' }}>
                ✅
              </div>
              <h1 style={{ fontSize:24, fontWeight:900, color:'#fff', marginBottom:8 }}>Password reset!</h1>
              <p style={{ color:'rgba(255,255,255,.5)', fontSize:14, marginBottom:28 }}>
                Your password has been updated successfully. You can now log in with your new password.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="btn btn-primary w-full"
                style={{ height:52, fontSize:15, fontWeight:700, borderRadius:14 }}
              >
                Go to Login →
              </button>
            </div>
          )}

          <p style={{ textAlign:'center', marginTop:24, color:'rgba(255,255,255,.45)', fontSize:14 }}>
            <Link to="/forgot-password" style={{ color:'#00D4A1', fontWeight:600 }}>Request a new link</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
