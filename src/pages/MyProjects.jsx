import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import { useTheme } from '../context/ThemeContext';
import SkillChip from '../components/SkillChip';

const ALL_SKILLS = [
  'React','Vue','Angular','Next.js','TypeScript','JavaScript','HTML/CSS',
  'Node.js','Express','Spring Boot','Django','FastAPI','Flask',
  'Python','Java','Go','Rust','C++','C#','Swift','Kotlin','Dart',
  'Flutter','React Native','MySQL','PostgreSQL','MongoDB','Redis','Firebase',
  'Docker','Kubernetes','AWS','GCP','Azure','DevOps',
  'Machine Learning','Data Science','TensorFlow','PyTorch',
  'GraphQL','Blockchain','AR/VR','UI/UX','Figma',
];

function CreateModal({ onClose, onCreate, isDark }) {
  const [form,        setForm]        = useState({ name:'', description:'', maxMembers:4 });
  const [skills,      setSkills]      = useState([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  const toggleSkill = s => setSkills(p => p.includes(s)?p.filter(x=>x!==s):[...p,s]);
  const addCustom   = () => { const s=customSkill.trim(); if(s&&!skills.includes(s)) setSkills(p=>[...p,s]); setCustomSkill(''); };
  const filtered    = ALL_SKILLS.filter(s=>s.toLowerCase().includes(skillSearch.toLowerCase())&&!skills.includes(s));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Project name is required'); return; }
    setLoading(true);
    try {
      const res = await API.post('/api/projects', { ...form, skills });
      onCreate(res.data); onClose();
    } catch (err) { setError(err.response?.data?.error||'Failed to create project'); }
    finally { setLoading(false); }
  };

  const bg      = isDark ? '#0c1018' : '#ffffff';
  const border  = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const inpBg   = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const inpBord = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
  const textCol = isDark ? '#f1f5f9' : '#0f172a';
  const mutedC  = isDark ? '#64748b' : '#94a3b8';
  const divider = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const chipBg  = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const chipBord= isDark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.08)';
  const pickerBg= isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';

  const INP = { background:inpBg, border:`1.5px solid ${inpBord}`, borderRadius:6, color:textCol, fontSize:13, padding:'10px 13px', width:'100%', transition:'border-color .2s', fontFamily:"'DM Sans',sans-serif" };
  const LBL = { fontSize:11, fontWeight:700, color:mutedC, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:7, fontFamily:"'DM Mono',monospace" };

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
      <div style={{ background:bg, border:`1px solid ${border}`, borderRadius:14, padding:28, width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 64px rgba(0,0,0,0.3)' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22 }}>
          <h2 style={{ fontSize:18,fontWeight:700,color:textCol }}>New Project</h2>
          <button onClick={onClose} style={{ background:'none',border:'none',color:mutedC,fontSize:22,lineHeight:1,cursor:'pointer' }}>×</button>
        </div>

        {error && <div style={{ background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:7,padding:'10px 14px',color:'#f87171',fontSize:13,marginBottom:16 }}>{error}</div>}

        <form onSubmit={submit} style={{ display:'flex',flexDirection:'column',gap:16 }}>
          <div><label style={LBL}>Project Name *</label>
            <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. EcoTrack" style={INP}
              onFocus={e=>e.target.style.borderColor='#3b82f6'} onBlur={e=>e.target.style.borderColor=inpBord}/></div>

          <div><label style={LBL}>Description</label>
            <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={3} placeholder="What are you building?" style={{ ...INP,resize:'vertical' }}
              onFocus={e=>e.target.style.borderColor='#3b82f6'} onBlur={e=>e.target.style.borderColor=inpBord}/></div>

          <div>
            <label style={LBL}>Preferred Skills</label>
            {skills.length>0 && (
              <div style={{ display:'flex',flexWrap:'wrap',gap:6,marginBottom:10 }}>
                {skills.map(s=>(
                  <span key={s} style={{ display:'inline-flex',alignItems:'center',gap:4,background:'rgba(37,99,235,0.14)',border:'1px solid rgba(37,99,235,0.38)',borderRadius:4,padding:'3px 9px',fontSize:11,fontWeight:600,color:'#3b82f6',fontFamily:"'DM Mono',monospace" }}>
                    {s} <span onClick={()=>toggleSkill(s)} style={{ cursor:'pointer',opacity:.7 }}>×</span>
                  </span>
                ))}
              </div>
            )}
            <input value={skillSearch} onChange={e=>setSkillSearch(e.target.value)} placeholder="Search skills…"
              style={{ ...INP,marginBottom:8,padding:'7px 10px',fontSize:12 }}
              onFocus={e=>e.target.style.borderColor='#3b82f6'} onBlur={e=>e.target.style.borderColor=inpBord}/>
            <div style={{ display:'flex',flexWrap:'wrap',gap:6,maxHeight:120,overflowY:'auto',marginBottom:8,background:pickerBg,border:`1px solid ${chipBord}`,borderRadius:8,padding:10 }}>
              {filtered.map(s=>(
                <span key={s} onClick={()=>toggleSkill(s)}
                  style={{ display:'inline-block',background:chipBg,border:`1px solid ${chipBord}`,borderRadius:4,padding:'4px 10px',fontSize:11,fontWeight:600,color:mutedC,cursor:'pointer',fontFamily:"'DM Mono',monospace" }}>
                  + {s}
                </span>
              ))}
            </div>
            <div style={{ display:'flex',gap:8 }}>
              <input value={customSkill} onChange={e=>setCustomSkill(e.target.value)} placeholder="Add custom skill…"
                onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addCustom())}
                style={{ ...INP,flex:1,padding:'7px 10px',fontSize:12 }}
                onFocus={e=>e.target.style.borderColor='#3b82f6'} onBlur={e=>e.target.style.borderColor=inpBord}/>
              <button type="button" onClick={addCustom}
                style={{ background:'rgba(37,99,235,0.15)',border:'1px solid rgba(37,99,235,0.35)',borderRadius:6,color:'#3b82f6',fontSize:12,fontWeight:600,padding:'7px 14px' }}>Add</button>
            </div>
          </div>

          <div style={{ display:'flex',gap:10,paddingTop:12,borderTop:`1px solid ${divider}` }}>
            <button type="submit" disabled={loading}
              style={{ background:'linear-gradient(135deg,#2563eb,#3b82f6)',color:'#fff',border:'none',borderRadius:7,padding:'10px 22px',fontSize:13,fontWeight:600,opacity:loading?.6:1 }}>
              {loading?'Creating…':'Create Project'}
            </button>
            <button type="button" onClick={onClose}
              style={{ background:'transparent',border:`1px solid ${border}`,borderRadius:7,color:mutedC,padding:'10px 18px',fontSize:13,fontWeight:600 }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MyProjects() {
  const navigate                = useNavigate();
  const [searchParams]          = useSearchParams();
  const { isDark }              = useTheme();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showCreate, setShowCreate] = useState(searchParams.get('create')==='true');

  useEffect(() => {
    API.get('/api/projects/mine').then(r=>setProjects(r.data)).finally(()=>setLoading(false));
  }, []);

  const bg      = isDark ? '#070a0f' : '#f8fafc';
  const surf    = isDark ? '#0c1018' : '#ffffff';
  const border  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const hoverBorder = 'rgba(37,99,235,0.45)';
  const textPri = isDark ? '#f1f5f9' : '#0f172a';
  const textSec = isDark ? '#64748b' : '#64748b';
  const textMut = isDark ? '#94a3b8' : '#475569';

  return (
    <div style={{ maxWidth:1100,margin:'0 auto',padding:'0 28px 80px',background:bg,minHeight:'100vh' }}>
      {showCreate && <CreateModal isDark={isDark} onClose={()=>setShowCreate(false)} onCreate={p=>setProjects(prev=>[p,...prev])}/>}

      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-end',padding:'36px 0 22px' }}>
        <div>
          <h2 style={{ fontSize:21,fontWeight:700,letterSpacing:'-.5px',color:textPri }}>My Projects</h2>
          <p style={{ color:textSec,fontSize:13,marginTop:4 }}>Projects you've joined or created.</p>
        </div>
        <button onClick={()=>setShowCreate(true)}
          style={{ background:'linear-gradient(135deg,#2563eb,#3b82f6)',color:'#fff',border:'none',borderRadius:6,padding:'8px 18px',fontSize:13,fontWeight:600 }}>
          + New Project
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign:'center',padding:'60px 0',color:textSec }}>Loading…</div>
      ) : projects.length===0 ? (
        <div style={{ textAlign:'center',padding:'60px 0' }}>
          <div style={{ fontSize:36,marginBottom:12 }}>📂</div>
          <p style={{ color:textSec,fontSize:14,marginBottom:14 }}>You haven't joined any projects yet.</p>
          <button onClick={()=>navigate('/')}
            style={{ background:'linear-gradient(135deg,#2563eb,#3b82f6)',color:'#fff',border:'none',borderRadius:6,padding:'9px 20px',fontSize:13,fontWeight:600 }}>
            Browse Projects
          </button>
        </div>
      ) : (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:15 }}>
          {projects.map(p=>(
            <div key={p.id} onClick={()=>navigate(`/projects/${p.id}`)}
              style={{ background:surf,border:`1px solid ${border}`,borderRadius:10,padding:20,cursor:'pointer',transition:'all .2s' }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor=hoverBorder; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor=border; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
              <div style={{ display:'flex',justifyContent:'space-between',marginBottom:8 }}>
                <h3 style={{ fontWeight:700,fontSize:15,color:textPri }}>{p.name}</h3>
                {p.isLead && <span style={{ fontSize:10,color:'#f59e0b',fontWeight:700,fontFamily:"'DM Mono',monospace" }}>★ LEAD</span>}
              </div>
              <p style={{ color:textSec,fontSize:13,lineHeight:1.6,marginBottom:12,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' }}>
                {p.description}
              </p>
              <div style={{ display:'flex',flexWrap:'wrap',gap:5,marginBottom:12 }}>
                {p.skills?.slice(0,3).map(s=>(
                  <SkillChip key={s} skill={s} size="sm"/>
                ))}
              </div>
              <div style={{ color:textMut,fontSize:11 }}>{p.members?.length} members · {p.createdAt}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
