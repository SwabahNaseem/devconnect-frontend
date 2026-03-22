import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

const INP = {
  background:'rgba(255,255,255,0.04)',
  border:'1.5px solid rgba(255,255,255,0.08)',
  borderRadius:6, color:'#f1f5f9', fontSize:13,
  padding:'10px 13px', width:'100%', transition:'border-color .2s',
};
const LBL = {
  fontSize:11, fontWeight:700, color:'#64748b',
  textTransform:'uppercase', letterSpacing:1,
  display:'block', marginBottom:7, fontFamily:"'DM Mono',monospace",
};

export default function Login() {
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ email:'', password:'' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/api/auth/login', form);
      // BUG FIX 3: Save all user info to localStorage including profile image
      localStorage.setItem('token',            res.data.token);
      localStorage.setItem('userId',           res.data.userId);
      localStorage.setItem('userName',         res.data.name);
      localStorage.setItem('profileImagePath', res.data.profileImagePath || '');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#070a0f',padding:20 }}>
      <div style={{ width:'100%',maxWidth:420 }}>
        <div style={{ textAlign:'center',marginBottom:40 }}>
          <div style={{ width:40,height:40,background:'linear-gradient(135deg,#2563eb,#3b82f6)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,color:'#fff',fontWeight:700,margin:'0 auto 14px',fontFamily:"'DM Mono',monospace" }}>T</div>
          <h1 style={{ fontFamily:"'Instrument Serif',serif",fontStyle:'italic',fontSize:28,fontWeight:400,color:'#f1f5f9',marginBottom:6 }}>Welcome back</h1>
          <p style={{ color:'#64748b',fontSize:14 }}>Sign in to your DevConnect account</p>
        </div>

        <form onSubmit={submit} style={{ background:'#0c1018',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,padding:28,display:'flex',flexDirection:'column',gap:16 }}>
          {error && (
            <div style={{ background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:7,padding:'10px 14px',color:'#f87171',fontSize:13 }}>
              {error}
            </div>
          )}
          <div>
            <label style={LBL}>Email</label>
            <input name="email" type="email" value={form.email} onChange={handle} required placeholder="you@example.com" style={INP}
              onFocus={e=>e.target.style.borderColor='#3b82f6'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.08)'}/>
          </div>
          <div>
            <label style={LBL}>Password</label>
            <input name="password" type="password" value={form.password} onChange={handle} required placeholder="••••••••" style={INP}
              onFocus={e=>e.target.style.borderColor='#3b82f6'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.08)'}/>
          </div>
          <button type="submit" disabled={loading}
            style={{ background:'linear-gradient(135deg,#2563eb,#3b82f6)',color:'#fff',border:'none',borderRadius:7,padding:11,fontSize:14,fontWeight:600,marginTop:4,opacity:loading?.6:1 }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
          <p style={{ textAlign:'center',color:'#64748b',fontSize:13 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'#3b82f6',fontWeight:600 }}>Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
