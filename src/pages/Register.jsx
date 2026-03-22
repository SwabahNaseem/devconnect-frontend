import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

// ── Skill categories with colors ──────────────────────────────
const SKILL_CATEGORIES = [
  {
    label: 'Frontend',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.12)',
    border: 'rgba(59,130,246,0.35)',
    skills: ['React','Vue','Angular','Next.js','TypeScript','JavaScript','HTML/CSS','Figma','UI/UX'],
  },
  {
    label: 'Backend',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.35)',
    skills: ['Node.js','Express','Spring Boot','Django','FastAPI','Flask','Laravel','GraphQL','REST API'],
  },
  {
    label: 'Mobile',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.35)',
    skills: ['Flutter','React Native','Swift','Kotlin','Android','iOS','Dart'],
  },
  {
    label: 'Languages',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)',
    border: 'rgba(139,92,246,0.35)',
    skills: ['Python','Java','Go','Rust','C++','C#','PHP','Ruby'],
  },
  {
    label: 'Data & AI',
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.12)',
    border: 'rgba(236,72,153,0.35)',
    skills: ['Machine Learning','Data Science','TensorFlow','PyTorch','Data Analysis','SQL'],
  },
  {
    label: 'DevOps & Cloud',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.12)',
    border: 'rgba(6,182,212,0.35)',
    skills: ['Docker','Kubernetes','AWS','GCP','Azure','DevOps','CI/CD','Linux'],
  },
  {
    label: 'Database',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.12)',
    border: 'rgba(249,115,22,0.35)',
    skills: ['MySQL','PostgreSQL','MongoDB','Redis','Firebase','SQLite'],
  },
  {
    label: 'Other',
    color: '#64748b',
    bg: 'rgba(100,116,139,0.12)',
    border: 'rgba(100,116,139,0.35)',
    skills: ['Blockchain','AR/VR','Game Dev','Cybersecurity','Figma','Photoshop'],
  },
];

// Get color info for a skill
function getSkillColor(skillName) {
  for (const cat of SKILL_CATEGORIES) {
    if (cat.skills.includes(skillName)) return cat;
  }
  return { color:'#64748b', bg:'rgba(100,116,139,0.12)', border:'rgba(100,116,139,0.35)', label:'Other' };
}

// Single skill chip with category color
function SkillChip({ skill, selected, onClick, size='md' }) {
  const [hovered, setHovered] = useState(false);
  const cat = getSkillColor(skill);
  const pad = size==='sm' ? '3px 9px' : '5px 12px';
  const fsize = size==='sm' ? 11 : 12;

  const bg     = selected || hovered ? cat.bg     : 'rgba(255,255,255,0.04)';
  const border = selected || hovered ? cat.border : 'rgba(255,255,255,0.1)';
  const color  = selected || hovered ? cat.color  : '#64748b';

  return (
    <span
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display:'inline-flex',alignItems:'center',gap:4,background:bg,border:`1px solid ${border}`,borderRadius:5,padding:pad,fontSize:fsize,fontWeight:600,color,cursor:'pointer',fontFamily:"'DM Mono',monospace",transition:'all .15s',userSelect:'none' }}>
      {selected && <span style={{ fontSize:10 }}>✓</span>}
      {skill}
    </span>
  );
}

// Step indicator
function Steps({ current }) {
  const steps = ['Account','Skills','Links','Done'];
  return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:0,marginBottom:32 }}>
      {steps.map((label, i) => {
        const num   = i + 1;
        const done  = num < current;
        const active = num === current;
        return (
          <React.Fragment key={i}>
            <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:4 }}>
              <div style={{
                width:32, height:32, borderRadius:'50%',
                background: done ? '#2563eb' : active ? 'linear-gradient(135deg,#2563eb,#3b82f6)' : 'rgba(255,255,255,0.06)',
                border: active ? 'none' : done ? 'none' : '1px solid rgba(255,255,255,0.12)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:12, fontWeight:700, color: done||active ? '#fff' : '#475569',
                fontFamily:"'DM Mono',monospace", transition:'all .2s',
              }}>
                {done ? '✓' : num}
              </div>
              <span style={{ fontSize:10,fontWeight:600,color:active?'#3b82f6':done?'#64748b':'#334155',fontFamily:"'DM Mono',monospace",letterSpacing:.5,textTransform:'uppercase' }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width:40,height:1,background:done?'#2563eb':'rgba(255,255,255,0.08)',margin:'0 4px',marginBottom:20,transition:'background .3s' }}/>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1 data
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  // Step 2 data
  const [skills, setSkills]           = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [activeCategory, setActiveCategory] = useState('Frontend');
  // Step 3 data
  const [links, setLinks] = useState({ linkedin:'', github:'', bio:'' });

  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handle      = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const toggleSkill = s => setSkills(p => p.includes(s) ? p.filter(x=>x!==s) : [...p, s]);
  const addCustom   = () => {
    const s = customSkill.trim();
    if (s && !skills.includes(s)) setSkills(p => [...p, s]);
    setCustomSkill('');
  };

  // Step 1 → 2
  const goStep2 = (e) => {
    e.preventDefault();
    if (!form.name.trim())     { setError('Name is required'); return; }
    if (!form.email.trim())    { setError('Email is required'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setStep(2);
  };

  // Step 2 → 3 (skills optional)
  const goStep3 = () => { setStep(3); };

  // Step 3 → submit
  const submit = async () => {
    setError(''); setLoading(true);
    try {
      const res = await API.post('/api/auth/register', form);
      localStorage.setItem('token',    res.data.token);
      localStorage.setItem('userId',   res.data.userId);
      localStorage.setItem('userName', res.data.name);

      // Update profile with skills + links
      const updates = {};
      if (skills.length > 0)       updates.skills   = skills;
      if (links.linkedin.trim())   updates.linkedin = links.linkedin;
      if (links.github.trim())     updates.github   = links.github;
      if (links.bio.trim())        updates.bio      = links.bio;

      if (Object.keys(updates).length > 0) {
        await API.put('/api/users/me', updates);
      }

      setStep(4);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      setStep(1);
    } finally { setLoading(false); }
  };

  const INP = {
    background:'rgba(255,255,255,0.04)', border:'1.5px solid rgba(255,255,255,0.08)',
    borderRadius:6, color:'#f1f5f9', fontSize:13, padding:'10px 13px',
    width:'100%', transition:'border-color .2s', fontFamily:"'DM Sans',sans-serif",
  };
  const LBL = {
    fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase',
    letterSpacing:1, display:'block', marginBottom:7, fontFamily:"'DM Mono',monospace",
  };
  const focusInp  = e => e.target.style.borderColor = '#3b82f6';
  const blurInp   = e => e.target.style.borderColor = 'rgba(255,255,255,0.08)';

  const currentCategory = SKILL_CATEGORIES.find(c => c.label === activeCategory);

  return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#070a0f',padding:20 }}>
      <div style={{ width:'100%',maxWidth:520 }}>

        {/* Logo */}
        <div style={{ textAlign:'center',marginBottom:32 }}>
          <div style={{ width:40,height:40,background:'linear-gradient(135deg,#2563eb,#3b82f6)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,color:'#fff',fontWeight:700,margin:'0 auto 14px',fontFamily:"'DM Mono',monospace" }}>T</div>
          <h1 style={{ fontFamily:"'Instrument Serif',serif",fontStyle:'italic',fontSize:26,fontWeight:400,color:'#f1f5f9',marginBottom:4 }}>Join DevConnect</h1>
          <p style={{ color:'#64748b',fontSize:13 }}>Find your team. Build something great.</p>
        </div>

        <Steps current={step} />

        <div style={{ background:'#0c1018',border:'1px solid rgba(255,255,255,0.07)',borderRadius:14,padding:28 }}>

          {/* ── STEP 1: Account ── */}
          {step === 1 && (
            <form onSubmit={goStep2} style={{ display:'flex',flexDirection:'column',gap:16 }}>
              <div>
                <h2 style={{ fontSize:17,fontWeight:700,color:'#f1f5f9',marginBottom:4 }}>Create your account</h2>
                <p style={{ color:'#64748b',fontSize:13 }}>Start with the basics.</p>
              </div>

              {error && <div style={{ background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:7,padding:'10px 14px',color:'#f87171',fontSize:13 }}>{error}</div>}

              <div>
                <label style={LBL}>Full Name</label>
                <input name="name" value={form.name} onChange={handle} placeholder="Alex Rivera" style={INP} onFocus={focusInp} onBlur={blurInp}/>
              </div>
              <div>
                <label style={LBL}>Email</label>
                <input name="email" type="email" value={form.email} onChange={handle} placeholder="you@example.com" style={INP} onFocus={focusInp} onBlur={blurInp}/>
              </div>
              <div>
                <label style={LBL}>Password</label>
                <input name="password" type="password" value={form.password} onChange={handle} placeholder="Min. 6 characters" style={INP} onFocus={focusInp} onBlur={blurInp}/>
              </div>

              <button type="submit"
                style={{ background:'linear-gradient(135deg,#2563eb,#3b82f6)',color:'#fff',border:'none',borderRadius:7,padding:'11px',fontSize:14,fontWeight:600,marginTop:4 }}>
                Continue →
              </button>
              <p style={{ textAlign:'center',color:'#64748b',fontSize:13 }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color:'#3b82f6',fontWeight:600 }}>Sign in</Link>
              </p>
            </form>
          )}

          {/* ── STEP 2: Skills ── */}
          {step === 2 && (
            <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
              <div>
                <h2 style={{ fontSize:17,fontWeight:700,color:'#f1f5f9',marginBottom:4 }}>What are your skills?</h2>
                <p style={{ color:'#64748b',fontSize:13 }}>Select all that apply. This helps AI match you to projects.</p>
              </div>

              {/* Selected skills preview */}
              {skills.length > 0 && (
                <div style={{ display:'flex',flexWrap:'wrap',gap:6,padding:'10px 12px',background:'rgba(255,255,255,0.03)',borderRadius:8,border:'1px solid rgba(255,255,255,0.07)' }}>
                  {skills.map(s => {
                    const cat = getSkillColor(s);
                    return (
                      <span key={s} onClick={() => toggleSkill(s)}
                        style={{ display:'inline-flex',alignItems:'center',gap:4,background:cat.bg,border:`1px solid ${cat.border}`,borderRadius:5,padding:'3px 9px',fontSize:11,fontWeight:600,color:cat.color,cursor:'pointer',fontFamily:"'DM Mono',monospace" }}>
                        {s} <span style={{ opacity:.7 }}>×</span>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Category tabs */}
              <div style={{ display:'flex',flexWrap:'wrap',gap:6 }}>
                {SKILL_CATEGORIES.map(cat => (
                  <button key={cat.label} onClick={() => setActiveCategory(cat.label)}
                    style={{ background: activeCategory===cat.label ? cat.bg : 'rgba(255,255,255,0.04)', border:`1px solid ${activeCategory===cat.label ? cat.border : 'rgba(255,255,255,0.08)'}`, borderRadius:5, padding:'4px 12px', fontSize:11, fontWeight:600, color: activeCategory===cat.label ? cat.color : '#64748b', cursor:'pointer', fontFamily:"'DM Mono',monospace", transition:'all .15s' }}>
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Skills grid for active category */}
              <div style={{ display:'flex',flexWrap:'wrap',gap:7,minHeight:80 }}>
                {currentCategory?.skills.map(s => (
                  <SkillChip key={s} skill={s} selected={skills.includes(s)} onClick={() => toggleSkill(s)}/>
                ))}
              </div>

              {/* Add custom skill */}
              <div style={{ display:'flex',gap:8,paddingTop:8,borderTop:'1px solid rgba(255,255,255,0.07)' }}>
                <input value={customSkill} onChange={e=>setCustomSkill(e.target.value)}
                  placeholder="Add a custom skill…"
                  onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addCustom())}
                  style={{ ...INP,flex:1,padding:'8px 12px' }} onFocus={focusInp} onBlur={blurInp}/>
                <button onClick={addCustom}
                  style={{ background:'rgba(37,99,235,0.15)',border:'1px solid rgba(37,99,235,0.35)',borderRadius:6,color:'#3b82f6',fontSize:12,fontWeight:600,padding:'8px 14px' }}>
                  Add
                </button>
              </div>

              <div style={{ display:'flex',gap:10,marginTop:4 }}>
                <button onClick={() => setStep(1)}
                  style={{ background:'transparent',border:'1px solid rgba(255,255,255,0.12)',borderRadius:7,color:'#64748b',padding:'10px 18px',fontSize:13,fontWeight:600 }}>
                  ← Back
                </button>
                <button onClick={goStep3}
                  style={{ flex:1,background:'linear-gradient(135deg,#2563eb,#3b82f6)',color:'#fff',border:'none',borderRadius:7,padding:'11px',fontSize:14,fontWeight:600 }}>
                  {skills.length > 0 ? `Continue with ${skills.length} skill${skills.length>1?'s':''} →` : 'Skip for now →'}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Links (optional) ── */}
          {step === 3 && (
            <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
              <div>
                <h2 style={{ fontSize:17,fontWeight:700,color:'#f1f5f9',marginBottom:4 }}>Add your links</h2>
                <p style={{ color:'#64748b',fontSize:13 }}>All optional — you can add these later in your profile.</p>
              </div>

              {error && <div style={{ background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:7,padding:'10px 14px',color:'#f87171',fontSize:13 }}>{error}</div>}

              <div>
                <label style={LBL}>Bio <span style={{ color:'#334155',fontWeight:400,textTransform:'none',letterSpacing:0 }}>— optional</span></label>
                <textarea value={links.bio} onChange={e=>setLinks(l=>({...l,bio:e.target.value}))}
                  rows={3} placeholder="Tell others what you build and what you're looking for…"
                  style={{ ...INP,resize:'vertical' }} onFocus={focusInp} onBlur={blurInp}/>
              </div>

              <div>
                <label style={LBL}>LinkedIn URL <span style={{ color:'#334155',fontWeight:400,textTransform:'none',letterSpacing:0 }}>— optional</span></label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:13,color:'#475569' }}>in</span>
                  <input value={links.linkedin} onChange={e=>setLinks(l=>({...l,linkedin:e.target.value}))}
                    placeholder="linkedin.com/in/yourname"
                    style={{ ...INP,paddingLeft:32 }} onFocus={focusInp} onBlur={blurInp}/>
                </div>
              </div>

              <div>
                <label style={LBL}>GitHub URL <span style={{ color:'#334155',fontWeight:400,textTransform:'none',letterSpacing:0 }}>— optional</span></label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:14 }}>🐙</span>
                  <input value={links.github} onChange={e=>setLinks(l=>({...l,github:e.target.value}))}
                    placeholder="github.com/yourname"
                    style={{ ...INP,paddingLeft:32 }} onFocus={focusInp} onBlur={blurInp}/>
                </div>
              </div>

              <div style={{ display:'flex',gap:10,marginTop:4 }}>
                <button onClick={()=>setStep(2)}
                  style={{ background:'transparent',border:'1px solid rgba(255,255,255,0.12)',borderRadius:7,color:'#64748b',padding:'10px 18px',fontSize:13,fontWeight:600 }}>
                  ← Back
                </button>
                <button onClick={submit} disabled={loading}
                  style={{ flex:1,background:'linear-gradient(135deg,#2563eb,#3b82f6)',color:'#fff',border:'none',borderRadius:7,padding:'11px',fontSize:14,fontWeight:600,opacity:loading?.6:1 }}>
                  {loading ? 'Creating account…' : 'Create Account →'}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Done ── */}
          {step === 4 && (
            <div style={{ textAlign:'center',padding:'20px 0' }}>
              <div style={{ fontSize:56,marginBottom:16 }}>🎉</div>
              <h2 style={{ fontSize:20,fontWeight:700,color:'#f1f5f9',marginBottom:8 }}>You're all set!</h2>
              <p style={{ color:'#64748b',fontSize:14,lineHeight:1.6,marginBottom:20 }}>
                Welcome to DevConnect, <strong style={{ color:'#f1f5f9' }}>{form.name}</strong>.<br/>
                Taking you to the home page…
              </p>
              <div style={{ display:'flex',flexWrap:'wrap',gap:6,justifyContent:'center',marginBottom:20 }}>
                {skills.slice(0,6).map(s => {
                  const cat = getSkillColor(s);
                  return <span key={s} style={{ background:cat.bg,border:`1px solid ${cat.border}`,borderRadius:5,padding:'4px 12px',fontSize:12,fontWeight:600,color:cat.color,fontFamily:"'DM Mono',monospace" }}>{s}</span>;
                })}
              </div>
              {/* Loading dots */}
              <div style={{ display:'flex',justifyContent:'center',gap:6 }}>
                {[0,1,2].map(i=>(
                  <div key={i} style={{ width:6,height:6,borderRadius:'50%',background:'#2563eb',animation:`pulse 1.2s ${i*0.2}s infinite` }}/>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.8)}}`}</style>
    </div>
  );
}
