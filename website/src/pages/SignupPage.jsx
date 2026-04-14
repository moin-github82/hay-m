import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HaymLogo from '../components/HaymLogo';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm]       = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError("Passwords don't match"); return; }
    if (form.password.length < 6)       { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await signup(form.fullName, form.email, form.password);
      // Always clear the flag so brand-new users always see onboarding
      localStorage.removeItem('hasOnboarded');
      navigate('/onboarding');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key:'fullName', label:'Full Name',       type:'text',     placeholder:'John Doe',        autoComplete:'name' },
    { key:'email',    label:'Email address',   type:'email',    placeholder:'you@example.com', autoComplete:'email' },
    { key:'password', label:'Password',         type:'password', placeholder:'Min 6 characters', autoComplete:'new-password' },
    { key:'confirm',  label:'Confirm Password', type:'password', placeholder:'Repeat password',  autoComplete:'new-password' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(145deg,#0A1628,#1C3D6E)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:440 }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center', marginBottom:36, textDecoration:'none' }}>
          <HaymLogo size={42} />
          <span style={{ fontSize:26, fontWeight:900, color:'#fff', letterSpacing:-.5 }}>HAY-M</span>
        </Link>

        <div style={{ background:'rgba(255,255,255,.06)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,.12)', borderRadius:24, padding:40 }}>
          <h1 style={{ fontSize:26, fontWeight:900, color:'#fff', marginBottom:6 }}>Create account</h1>
          <p style={{ color:'rgba(255,255,255,.5)', fontSize:14, marginBottom:32 }}>Start your savings journey with HAY-M</p>

          {error && <div className="alert alert-error" style={{ background:'rgba(239,68,68,.15)', color:'#FCA5A5', border:'1px solid rgba(239,68,68,.3)' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {fields.map(f => (
              <div key={f.key} className="form-group">
                <label className="form-label" style={{ color:'rgba(255,255,255,.7)' }}>{f.label}</label>
                <input
                  type={f.type}
                  className="form-input"
                  placeholder={f.placeholder}
                  autoComplete={f.autoComplete}
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
              style={{ height:52, fontSize:15, fontWeight:700, borderRadius:14, marginTop:8, opacity:loading?.7:1 }}
            >
              {loading ? 'Creating account…' : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:24, color:'rgba(255,255,255,.45)', fontSize:14 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'#00D4A1', fontWeight:600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
