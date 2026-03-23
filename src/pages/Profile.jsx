
import React, { useState, useEffect, useCallback, useRef } from 'react';

import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useTheme } from '../context/ThemeContext';

import SkillChip, { SKILL_CATEGORIES } from '../components/SkillChip';


// All skills flattened from categories - used for search
const ALL_SKILLS = SKILL_CATEGORIES.flatMap(c => c.skills);

const AV_COLORS = ['#2563eb','#7c3aed','#059669','#dc2626','#d97706','#0891b2'];
const getColor  = id => AV_COLORS[(id||0) % AV_COLORS.length];

function Avatar({ name, id, size=56 }) {
  const initials = name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()||'?';
  return <div style={{ width:size,height:size,borderRadius:size*0.28,background:getColor(id),display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.34,fontWeight:700,color:'#fff',flexShrink:0,fontFamily:"'DM Mono',monospace" }}>{initials}</div>;
}

function EditModal({ user, onClose, onSave, isDark }) {
  const [form, setForm] = useState({ name:user.name||'',bio:user.bio||'',age:user.age||'',linkedin:user.linkedin||'',github:user.github||'' });
  const [skills,setSkills]               = useState(user.skills||[]);
  const [skillSearch,setSkillSearch]     = useState('');
  const [customSkill,setCustomSkill]     = useState('');
  const [activeCategory,setActiveCategory] = useState('Frontend');
  const [profileImage,setProfileImage]   = useState(null);
  const [loading,setLoading]             = useState(false);
  const [error,setError]                 = useState('');
  const imgRef = useRef(null);

  const toggleSkill = s => setSkills(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s]);
  const addCustom   = () => { const s=customSkill.trim(); if(s&&!skills.includes(s)) setSkills(p=>[...p,s]); setCustomSkill(''); };

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await API.put('/api/users/me',{ ...form, age:form.age?parseInt(form.age):null, skills });
      if (profileImage) {
        const fd = new FormData(); fd.append('file',profileImage);
        await API.post('/api/users/me/image',fd);
      }
      onSave(); onClose();
    } catch(err) { setError(err.response?.data?.error||'Update failed'); }
    finally { setLoading(false); }
  };

  const bg      = isDark ? '#0c1018' : '#ffffff';
  const border  = isDark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.1)';
  const inpBg   = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const inpBord = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
  const textCol = isDark ? '#f1f5f9' : '#0f172a';
  const mutedC  = isDark ? '#64748b'  : '#94a3b8';
  const divider = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const chipBg  = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const chipBord= isDark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.08)';

  const INP = { background:inpBg,border:`1.5px solid ${inpBord}`,borderRadius:6,color:textCol,fontSize:13,fontFamily:"'DM Sans',sans-serif",padding:'10px 13px',width:'100%',outline:'none',transition:'border-color .2s' };
  const LBL = { fontSize:11,fontWeight:700,color:mutedC,textTransform:'uppercase',letterSpacing:1,display:'block',marginBottom:7,fontFamily:"'DM Mono',monospace" };

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
      <div style={{ background:bg,border:`1px solid ${border}`,borderRadius:14,padding:28,width:'100%',maxWidth:540,maxHeight:'92vh',overflowY:'auto',boxShadow:'0 24px 64px rgba(0,0,0,0.3)' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22 }}>
          <h2 style={{ fontSize:18,fontWeight:700,color:textCol }}>Edit Profile</h2>
          <button onClick={onClose} style={{ background:'none',border:'none',color:mutedC,fontSize:22,lineHeight:1,cursor:'pointer' }}>×</button>
        </div>

        {error && <div style={{ background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:7,padding:'10px 14px',color:'#f87171',fontSize:13,marginBottom:16 }}>{error}</div>}

        <form onSubmit={submit} style={{ display:'flex',flexDirection:'column',gap:15 }}>
          <div>
            <label style={LBL}>Profile Photo</label>
            <div style={{ display:'flex',alignItems:'center',gap:14 }}>
              <Avatar name={user.name} id={user.id} size={48}/>
              <div>
                <input type="file" accept="image/*" ref={imgRef} style={{ display:'none' }} onChange={e=>setProfileImage(e.target.files[0])}/>
                <button type="button" onClick={()=>imgRef.current?.click()}
                  style={{ background:chipBg,border:`1px solid ${chipBord}`,borderRadius:6,color:mutedC,fontSize:12,fontWeight:600,padding:'7px 14px',transition:'all .15s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.background=isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.08)'; e.currentTarget.style.color=isDark?'#f1f5f9':'#0f172a'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background=chipBg; e.currentTarget.style.color=mutedC; }}>
                  {profileImage?`✓ ${profileImage.name}`:'Choose Photo'}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
            <div><label style={LBL}>Full Name</label>
              <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Your name" style={INP}
                onFocus={e=>e.target.style.borderColor='#3b82f6'} onBlur={e=>e.target.style.borderColor=inpBord}/></div>
            <div><label style={LBL}>Age</label>
              <input type="number" value={form.age} onChange={e=>setForm(f=>({...f,age:e.target.value}))} placeholder="e.g. 22" style={INP}
                onFocus={e=>e.target.style.borderColor='#3b82f6'} onBlur={e=>e.target.style.borderColor=inpBord}/></div>
          </div>

          <div><label style={LBL}>Bio</label>
            <textarea value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))} rows={3} placeholder="Tell others about yourself…" style={{ ...INP,resize:'vertical' }}
              onFocus={e=>e.target.style.borderColor='#3b82f6'} onBlur={e=>e.target.style.borderColor=inpBord}/></div>

          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
            <div><label style={LBL}>LinkedIn URL</label>
              <input value={form.linkedin} onChange={e=>setForm(f=>({...f,linkedin:e.target.value}))} placeholder="linkedin.com/in/you" style={INP}
                onFocus={e=>e.target.style.borderColor='#3b82f6'} onBlur={e=>e.target.style.borderColor=inpBord}/></div>
            <div><label style={LBL}>GitHub URL</label>
              <input value={form.github} onChange={e=>setForm(f=>({...f,github:e.target.value}))} placeholder="github.com/you" style={INP}
                onFocus={e=>e.target.style.borderColor='#3b82f6'} onBlur={e=>e.target.style.borderColor=inpBord}/></div>
          </div>

          <div>
            <label style={LBL}>Skills</label>

            {/* Selected skills with color + remove */}
            {skills.length>0 && (
              <div style={{ display:'flex',flexWrap:'wrap',gap:6,marginBottom:10,padding:'10px 12px',background:chipBg,border:`1px solid ${chipBord}`,borderRadius:8 }}>
                {skills.map(s=>(
                  <SkillChip key={s} skill={s} onRemove={()=>toggleSkill(s)} selected/>
                ))}
              </div>
            )}

            {/* Search bar */}
            <input value={skillSearch} onChange={e=>setSkillSearch(e.target.value)}
              placeholder="Search skills…"
              style={{ ...INP,marginBottom:8,padding:'7px 10px',fontSize:12 }}
              onFocus={e=>e.target.style.borderColor='#3b82f6'}
              onBlur={e=>e.target.style.borderColor=inpBord}/>

            {skillSearch ? (
              <div style={{ display:'flex',flexWrap:'wrap',gap:6,maxHeight:110,overflowY:'auto',marginBottom:8,background:chipBg,border:`1px solid ${chipBord}`,borderRadius:8,padding:10 }}>
                {ALL_SKILLS.filter(s=>s.toLowerCase().includes(skillSearch.toLowerCase())&&!skills.includes(s)).map(s=>(
                  <SkillChip key={s} skill={s} onClick={()=>{ toggleSkill(s); setSkillSearch(''); }}/>
                ))}
              </div>
            ) : (
              <>
                {/* Category tabs */}
                <div style={{ display:'flex',flexWrap:'wrap',gap:5,marginBottom:8 }}>
                  {SKILL_CATEGORIES.map(cat=>(
                    <button key={cat.label} type="button" onClick={()=>setActiveCategory(cat.label)}
                      style={{ background:activeCategory===cat.label?cat.bg:'transparent', border:`1px solid ${activeCategory===cat.label?cat.border:inpBord}`, borderRadius:5, padding:'3px 10px', fontSize:10, fontWeight:600, color:activeCategory===cat.label?cat.color:mutedC, cursor:'pointer', fontFamily:"'DM Mono',monospace", transition:'all .15s' }}>
                      {cat.label}
                    </button>
                  ))}
                </div>
                {/* Skills for active category — hover shows color */}
                <div style={{ display:'flex',flexWrap:'wrap',gap:6,maxHeight:100,overflowY:'auto',marginBottom:8,background:chipBg,border:`1px solid ${chipBord}`,borderRadius:8,padding:10 }}>
                  {SKILL_CATEGORIES.find(c=>c.label===activeCategory)?.skills
                    .filter(s=>!skills.includes(s))
                    .map(s=>(
                      <SkillChip key={s} skill={s} onClick={()=>toggleSkill(s)}/>
                    ))
                  }
                  {SKILL_CATEGORIES.find(c=>c.label===activeCategory)?.skills.filter(s=>!skills.includes(s)).length===0 && (
                    <p style={{ color:mutedC,fontSize:12,padding:'4px 0' }}>All {activeCategory} skills added!</p>
                  )}
                </div>
              </>
            )}

            {/* Custom skill */}
            <div style={{ display:'flex',gap:8 }}>
              <input value={customSkill} onChange={e=>setCustomSkill(e.target.value)}
                placeholder="Add a custom skill…"
                onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addCustom())}
                style={{ ...INP,flex:1,padding:'7px 10px',fontSize:12 }}
                onFocus={e=>e.target.style.borderColor='#3b82f6'}
                onBlur={e=>e.target.style.borderColor=inpBord}/>
              <button type="button" onClick={addCustom}
                style={{ background:'rgba(37,99,235,0.15)',border:'1px solid rgba(37,99,235,0.35)',borderRadius:6,color:'#3b82f6',fontSize:12,fontWeight:600,padding:'7px 14px',transition:'all .15s' }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(37,99,235,0.28)'}
                onMouseLeave={e=>e.currentTarget.style.background='rgba(37,99,235,0.15)'}>
                Add
              </button>
            </div>
          </div>

          <div style={{ display:'flex',gap:10,paddingTop:12,borderTop:`1px solid ${divider}` }}>
            <button type="submit" disabled={loading}
              style={{ background:'linear-gradient(135deg,#2563eb,#3b82f6)',color:'#fff',border:'none',borderRadius:7,padding:'10px 22px',fontSize:13,fontWeight:600,opacity:loading?.6:1,transition:'opacity .15s, transform .15s' }}
              onMouseEnter={e=>{ if(!loading) e.currentTarget.style.opacity='.85'; }}
              onMouseLeave={e=>{ e.currentTarget.style.opacity=loading?'.6':'1'; }}>
              {loading?'Saving…':'Save Changes'}
            </button>
            <button type="button" onClick={onClose}
              style={{ background:'transparent',border:`1px solid ${border}`,borderRadius:7,color:mutedC,padding:'10px 18px',fontSize:13,fontWeight:600,transition:'all .15s' }}
              onMouseEnter={e=>{ e.currentTarget.style.background=isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)'; e.currentTarget.style.color=isDark?'#f1f5f9':'#0f172a'; }}
              onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color=mutedC; }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Password Change Modal ─────────────────────────────────────
function PasswordModal({ onClose, isDark, INP, LBL, border, textPri, textMut }) {
  const [form, setForm]     = useState({ currentPassword:'', newPassword:'', confirm:'' });
  const [error, setError]   = useState('');
  const [success, setSuccess]= useState('');
  const [loading, setLoading]= useState(false);
  const surf = isDark ? '#0c1018' : '#ffffff';

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) { setError('New passwords do not match'); return; }
    if (form.newPassword.length < 6) { setError('New password must be at least 6 characters'); return; }
    setError(''); setLoading(true);
    try {
      await API.put('/api/users/me/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess('Password changed successfully!');
      setTimeout(onClose, 1500);
    } catch(err) { setError(err.response?.data?.error || 'Failed to change password'); }
    finally { setLoading(false); }
  };

  const inpBord = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
      <div style={{ background:surf,border:`1px solid ${isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'}`,borderRadius:14,padding:28,width:'100%',maxWidth:400,boxShadow:'0 24px 64px rgba(0,0,0,0.3)' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
          <h2 style={{ fontSize:17,fontWeight:700,color:textPri }}>Change Password</h2>
          <button onClick={onClose} style={{ background:'none',border:'none',color:textMut,fontSize:22,cursor:'pointer' }}>×</button>
        </div>
        {error   && <div style={{ background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:7,padding:'10px 14px',color:'#f87171',fontSize:13,marginBottom:14 }}>{error}</div>}
        {success && <div style={{ background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:7,padding:'10px 14px',color:'#34d399',fontSize:13,marginBottom:14 }}>{success}</div>}
        <form onSubmit={submit} style={{ display:'flex',flexDirection:'column',gap:14 }}>
          <div><label style={LBL}>Current Password</label>
            <input type="password" value={form.currentPassword} onChange={e=>setForm(f=>({...f,currentPassword:e.target.value}))} style={INP}
              onFocus={e=>e.target.style.borderColor='#3b82f6'} onBlur={e=>e.target.style.borderColor=inpBord}/></div>
          <div><label style={LBL}>New Password</label>
            <input type="password" value={form.newPassword} onChange={e=>setForm(f=>({...f,newPassword:e.target.value}))} style={INP}
              onFocus={e=>e.target.style.borderColor='#3b82f6'} onBlur={e=>e.target.style.borderColor=inpBord}/></div>
          <div><label style={LBL}>Confirm New Password</label>
            <input type="password" value={form.confirm} onChange={e=>setForm(f=>({...f,confirm:e.target.value}))} style={INP}
              onFocus={e=>e.target.style.borderColor='#3b82f6'} onBlur={e=>e.target.style.borderColor=inpBord}/></div>
          <div style={{ display:'flex',gap:10,paddingTop:8,borderTop:`1px solid ${isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.06)'}` }}>
            <button type="submit" disabled={loading}
              style={{ flex:1,background:'linear-gradient(135deg,#2563eb,#3b82f6)',color:'#fff',border:'none',borderRadius:7,padding:'10px 0',fontSize:13,fontWeight:600,opacity:loading?.6:1 }}>
              {loading?'Saving…':'Change Password'}
            </button>
            <button type="button" onClick={onClose}
              style={{ background:'transparent',border:`1px solid ${border}`,borderRadius:7,color:textMut,padding:'10px 18px',fontSize:13,fontWeight:600,cursor:'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Profile() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [user,     setUser]     = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(false);
  const [pwModal,  setPwModal]  = useState(false);
  const [delModal, setDelModal] = useState(false);
  const myId  = parseInt(localStorage.getItem('userId'));
  const isOwn = parseInt(id) === myId;

 const load = useCallback(() => {
  setLoading(true);
  Promise.all([API.get(`/api/users/${id}`), API.get('/api/projects')])
    .then(([uRes, pRes]) => {
      setUser(uRes.data);
      setProjects(
        pRes.data.filter(
          p =>
            p.members?.some(m => m.id === parseInt(id)) ||
            p.lead?.id === parseInt(id)
        )
      );
    })
    .catch(() => navigate('/'))
    .finally(() => setLoading(false));
}, [id, navigate]); // ✅ dependencies

useEffect(() => {
  load();
}, [load]); // ✅ depends on load id and load

  if (loading) return <div style={{ textAlign:'center',padding:'80px 0',color:'#64748b' }}>Loading profile…</div>;
  if (!user) return null;

  const bg      = isDark ? '#070a0f' : '#f8fafc';
  const surf    = isDark ? '#0c1018' : '#ffffff';
  const border  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const divider = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const textPri = isDark ? '#f1f5f9' : '#0f172a';
  const textSec = isDark ? '#94a3b8' : '#475569';
  const textMut = isDark ? '#64748b'  : '#94a3b8';
  const btnBord = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
  const inpBg   = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const inpBord = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';

  const card = { background:surf, border:`1px solid ${border}`, borderRadius:10, padding:22 };
  const INP  = { background:inpBg,border:`1.5px solid ${inpBord}`,borderRadius:6,color:textPri,fontSize:13,fontFamily:"'DM Sans',sans-serif",padding:'10px 13px',width:'100%',outline:'none',transition:'border-color .2s' };
  const LBL  = { fontSize:11,fontWeight:700,color:textMut,textTransform:'uppercase',letterSpacing:1,display:'block',marginBottom:7,fontFamily:"'DM Mono',monospace" };

  return (
    <div style={{ maxWidth:720,margin:'0 auto',padding:'0 28px 80px',background:bg,minHeight:'100vh' }}>
      {editing  && <EditModal user={user} isDark={isDark} onClose={()=>setEditing(false)} onSave={load}/>}

      {/* ── Password Change Modal ── */}
      {pwModal && <PasswordModal isDark={isDark} INP={INP} LBL={LBL} border={border} textPri={textPri} textMut={textMut}
        onClose={()=>setPwModal(false)}/>}

      {/* ── Delete Account Modal ── */}
      {delModal && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
          <div style={{ background:surf,border:`1px solid rgba(239,68,68,0.3)`,borderRadius:14,padding:28,width:'100%',maxWidth:400,boxShadow:'0 24px 64px rgba(0,0,0,0.4)' }}>
            <div style={{ textAlign:'center',marginBottom:20 }}>
              <div style={{ fontSize:40,marginBottom:12 }}>⚠️</div>
              <h2 style={{ fontSize:18,fontWeight:700,color:'#f87171',marginBottom:8 }}>Delete Account</h2>
              <p style={{ color:textSec,fontSize:13,lineHeight:1.6 }}>
                This will permanently delete your account and all your data. This cannot be undone.
              </p>
            </div>
            <div style={{ display:'flex',gap:10 }}>
              <button onClick={async()=>{
                try {
                  await API.delete('/api/users/me');
                  localStorage.clear();
                  navigate('/login');
                } catch(err) { alert(err.response?.data?.error||'Failed to delete account'); }
              }} style={{ flex:1,background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.35)',borderRadius:7,color:'#f87171',padding:'10px 0',fontSize:13,fontWeight:700,cursor:'pointer',transition:'all .15s' }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.25)'}
                onMouseLeave={e=>e.currentTarget.style.background='rgba(239,68,68,0.15)'}>
                Yes, Delete My Account
              </button>
              <button onClick={()=>setDelModal(false)}
                style={{ flex:1,background:'transparent',border:`1px solid ${border}`,borderRadius:7,color:textMut,padding:'10px 0',fontSize:13,fontWeight:600,cursor:'pointer',transition:'all .15s' }}
                onMouseEnter={e=>e.currentTarget.style.background=inpBg}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'36px 0 22px',flexWrap:'wrap',gap:14 }}>
        <div style={{ display:'flex',alignItems:'center',gap:16 }}>
          {user.profileImageUrl
            ? <img src={user.profileImageUrl} alt="profile" style={{ width:60,height:60,borderRadius:60*0.28,objectFit:'cover' }}/>
            : <Avatar name={user.name} id={user.id} size={60}/>
          }
          <div>
            <h1 style={{ fontSize:21,fontWeight:700,letterSpacing:'-.5px',color:textPri }}>{user.name}</h1>
            <p style={{ color:textMut,fontSize:13,marginTop:3 }}>
              {user.age&&`Age ${user.age} · `}{user.skills?.length||0} skills · {projects.length} project{projects.length!==1?'s':''}
            </p>
          </div>
        </div>
        {isOwn && (
          <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
            <button onClick={()=>setEditing(true)}
              style={{ background:'transparent',border:`1px solid ${btnBord}`,borderRadius:6,color:textSec,fontSize:13,fontWeight:600,padding:'7px 16px',transition:'all .15s' }}
              onMouseEnter={e=>{ e.currentTarget.style.background=inpBg; e.currentTarget.style.color=textPri; }}
              onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color=textSec; }}>
              ✏ Edit
            </button>
            <button onClick={()=>setPwModal(true)}
              style={{ background:'transparent',border:`1px solid ${btnBord}`,borderRadius:6,color:textSec,fontSize:13,fontWeight:600,padding:'7px 16px',transition:'all .15s' }}
              onMouseEnter={e=>{ e.currentTarget.style.background=inpBg; e.currentTarget.style.color=textPri; }}
              onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color=textSec; }}>
              🔑 Password
            </button>
            <button onClick={()=>setDelModal(true)}
              style={{ background:'transparent',border:'1px solid rgba(239,68,68,0.25)',borderRadius:6,color:'#f87171',fontSize:13,fontWeight:600,padding:'7px 16px',transition:'all .15s' }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.08)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              🗑 Delete Account
            </button>
          </div>
        )}
      </div>

      <div style={{ display:'flex',flexDirection:'column',gap:13 }}>
        <div style={card}>
          <p style={{ fontSize:11,fontWeight:700,color:textMut,textTransform:'uppercase',letterSpacing:1,marginBottom:12,fontFamily:"'DM Mono',monospace" }}>About</p>
          <p style={{ color:textSec,lineHeight:1.75,fontSize:14 }}>
            {user.bio||<span style={{ color:textMut,fontStyle:'italic' }}>No bio added yet.</span>}
          </p>
          <div style={{ display:'flex',gap:20,marginTop:14,flexWrap:'wrap' }}>
            {user.email    && <a href={`mailto:${user.email}`}                     style={{ fontSize:13,color:'#3b82f6' }}>✉ {user.email}</a>}
            {user.linkedin && <a href={`https://${user.linkedin}`} target="_blank" rel="noreferrer" style={{ fontSize:13,color:'#3b82f6' }}>in {user.linkedin}</a>}
            {user.github   && <a href={`https://${user.github}`}  target="_blank" rel="noreferrer" style={{ fontSize:13,color:'#3b82f6' }}>🐙 {user.github}</a>}
          </div>
        </div>

        <div style={card}>
          <p style={{ fontSize:11,fontWeight:700,color:textMut,textTransform:'uppercase',letterSpacing:1,marginBottom:12,fontFamily:"'DM Mono',monospace" }}>Skills</p>
          {user.skills?.length===0
            ? <p style={{ color:textMut,fontSize:13 }}>No skills added yet.</p>
            : <div style={{ display:'flex',flexWrap:'wrap',gap:7 }}>
                {user.skills?.map(s=>(
                  <SkillChip key={s} skill={s}/>
                ))}
              </div>
          }
        </div>

        <div style={card}>
          <p style={{ fontSize:11,fontWeight:700,color:textMut,textTransform:'uppercase',letterSpacing:1,marginBottom:12,fontFamily:"'DM Mono',monospace" }}>Projects ({projects.length})</p>
          {projects.length===0
            ? <p style={{ color:textMut,fontSize:13 }}>No projects yet.</p>
            : projects.map(p=>(
              <div key={p.id}
                style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 0',borderBottom:`1px solid ${divider}`,cursor:'pointer' }}
                onClick={()=>navigate(`/projects/${p.id}`)}>
                <div>
                  <div style={{ fontWeight:600,fontSize:13,color:textPri }}>{p.name}</div>
                  <div style={{ color:textMut,fontSize:11,marginTop:2 }}>{p.members?.length} members · {p.createdAt}</div>
                </div>
                {p.lead?.id===parseInt(id) && (
                  <span style={{ background:'rgba(245,158,11,.12)',color:'#fbbf24',border:'1px solid rgba(245,158,11,.3)',borderRadius:4,padding:'2px 8px',fontSize:10,fontWeight:700,fontFamily:"'DM Mono',monospace" }}>LEAD</span>
                )}
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
