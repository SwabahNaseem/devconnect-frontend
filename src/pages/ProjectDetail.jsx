import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import AIMatchPanel from '../components/AIMatchPanel';
import SkillChip, { SKILL_CATEGORIES } from '../components/SkillChip';
import { useTheme } from '../context/ThemeContext';

const AV_COLORS = ['#2563eb','#7c3aed','#059669','#dc2626','#d97706','#0891b2'];
const getColor  = id => AV_COLORS[(id||0) % AV_COLORS.length];
const ALL_SKILLS = SKILL_CATEGORIES.flatMap(c => c.skills);

function Avatar({ name, id, size=32, imageUrl=null }) {
  const initials = name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()||'?';
  if (imageUrl) return <img src={imageUrl} alt={name} style={{ width:size,height:size,borderRadius:size*0.28,objectFit:'cover',flexShrink:0 }} onError={e=>e.target.style.display='none'}/>;
  return <div style={{ width:size,height:size,borderRadius:size*0.28,background:getColor(id),display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.34,fontWeight:700,color:'#fff',flexShrink:0,fontFamily:"'DM Mono',monospace" }}>{initials}</div>;
}

function Badge({ label, color='green' }) {
  const map = { green:['rgba(16,185,129,.12)','#34d399','rgba(16,185,129,.3)'], blue:['rgba(37,99,235,.12)','#60a5fa','rgba(37,99,235,.3)'], amber:['rgba(245,158,11,.12)','#fbbf24','rgba(245,158,11,.3)'], red:['rgba(239,68,68,.12)','#f87171','rgba(239,68,68,.3)'], gray:['rgba(100,116,139,.12)','#94a3b8','rgba(100,116,139,.3)'] };
  const [bg,col,br] = map[color]||map.green;
  return <span style={{ background:bg,color:col,border:`1px solid ${br}`,borderRadius:4,padding:'2px 8px',fontSize:10,fontWeight:700,letterSpacing:'.5px',textTransform:'uppercase',fontFamily:"'DM Mono',monospace" }}>{label}</span>;
}

// ── Edit Project Modal ──────────────────────────────────────────
function EditProjectModal({ project, onClose, onSave, isDark }) {
  const [form, setForm] = useState({ name:project.name||'', description:project.description||'', maxMembers:project.maxMembers||4 });
  const [skills, setSkills]             = useState(project.skills||[]);
  const [activeCategory, setActiveCategory] = useState('Frontend');
  const [skillSearch, setSkillSearch]   = useState('');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  const toggleSkill = s => setSkills(p => p.includes(s) ? p.filter(x=>x!==s) : [...p,s]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.put(`/api/projects/${project.id}`, { ...form, skills });
      onSave(res.data); onClose();
    } catch(err) { setError(err.response?.data?.error || 'Failed to update'); }
    finally { setLoading(false); }
  };

  const bg = isDark?'#0c1018':'#fff', border = isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)';
  const textCol = isDark?'#f1f5f9':'#0f172a', mutedC = isDark?'#64748b':'#94a3b8';
  const inpBg = isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)', inpBord = isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.1)';
  const divider = isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.06)';
  const INP = { background:inpBg,border:`1.5px solid ${inpBord}`,borderRadius:6,color:textCol,fontSize:13,fontFamily:"'DM Sans',sans-serif",padding:'10px 13px',width:'100%',outline:'none',transition:'border-color .2s' };
  const LBL = { fontSize:11,fontWeight:700,color:mutedC,textTransform:'uppercase',letterSpacing:1,display:'block',marginBottom:7,fontFamily:"'DM Mono',monospace" };

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
      <div style={{ background:bg,border:`1px solid ${border}`,borderRadius:14,padding:28,width:'100%',maxWidth:520,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 24px 64px rgba(0,0,0,0.3)' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
          <h2 style={{ fontSize:17,fontWeight:700,color:textCol }}>Edit Project</h2>
          <button onClick={onClose} style={{ background:'none',border:'none',color:mutedC,fontSize:22,cursor:'pointer' }}>×</button>
        </div>
        {error && <div style={{ background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:7,padding:'10px 14px',color:'#f87171',fontSize:13,marginBottom:14 }}>{error}</div>}
        <form onSubmit={submit} style={{ display:'flex',flexDirection:'column',gap:14 }}>
          <div><label style={LBL}>Project Name</label>
            <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={INP}
              onFocus={e=>e.target.style.borderColor='#3b82f6'} onBlur={e=>e.target.style.borderColor=inpBord}/></div>
          <div><label style={LBL}>Description</label>
            <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={3} style={{ ...INP,resize:'vertical' }}
              onFocus={e=>e.target.style.borderColor='#3b82f6'} onBlur={e=>e.target.style.borderColor=inpBord}/></div>
          <div>
            <label style={LBL}>Team Size</label>
            <div style={{ display:'flex',gap:8,alignItems:'center' }}>
              {[2,3,4,5,6,8,10].map(n=>(
                <button key={n} type="button" onClick={()=>setForm(f=>({...f,maxMembers:n}))}
                  style={{ width:40,height:36,borderRadius:6,border:`1.5px solid ${form.maxMembers===n?'#3b82f6':inpBord}`,background:form.maxMembers===n?'rgba(37,99,235,0.15)':'transparent',color:form.maxMembers===n?'#3b82f6':mutedC,fontSize:13,fontWeight:700,cursor:'pointer',transition:'all .15s',fontFamily:"'DM Mono',monospace" }}>{n}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={LBL}>Skills</label>
            {skills.length>0&&<div style={{ display:'flex',flexWrap:'wrap',gap:6,marginBottom:8 }}>{skills.map(s=><SkillChip key={s} skill={s} onRemove={()=>toggleSkill(s)} selected/>)}</div>}
            <input value={skillSearch} onChange={e=>setSkillSearch(e.target.value)} placeholder="Search skills…" style={{ ...INP,marginBottom:8,padding:'7px 10px',fontSize:12 }}
              onFocus={e=>e.target.style.borderColor='#3b82f6'} onBlur={e=>e.target.style.borderColor=inpBord}/>
            {skillSearch ? (
              <div style={{ display:'flex',flexWrap:'wrap',gap:6,maxHeight:100,overflowY:'auto',padding:10,background:inpBg,border:`1px solid ${inpBord}`,borderRadius:8 }}>
                {ALL_SKILLS.filter(s=>s.toLowerCase().includes(skillSearch.toLowerCase())&&!skills.includes(s)).map(s=><SkillChip key={s} skill={s} onClick={()=>{toggleSkill(s);setSkillSearch('');}}/>)}
              </div>
            ) : (
              <>
                <div style={{ display:'flex',flexWrap:'wrap',gap:5,marginBottom:6 }}>
                  {SKILL_CATEGORIES.map(cat=>(
                    <button key={cat.label} type="button" onClick={()=>setActiveCategory(cat.label)}
                      style={{ background:activeCategory===cat.label?cat.bg:'transparent',border:`1px solid ${activeCategory===cat.label?cat.border:inpBord}`,borderRadius:5,padding:'3px 10px',fontSize:10,fontWeight:600,color:activeCategory===cat.label?cat.color:mutedC,cursor:'pointer',fontFamily:"'DM Mono',monospace",transition:'all .15s' }}>
                      {cat.label}
                    </button>
                  ))}
                </div>
                <div style={{ display:'flex',flexWrap:'wrap',gap:6,maxHeight:90,overflowY:'auto',padding:10,background:inpBg,border:`1px solid ${inpBord}`,borderRadius:8 }}>
                  {SKILL_CATEGORIES.find(c=>c.label===activeCategory)?.skills.filter(s=>!skills.includes(s)).map(s=><SkillChip key={s} skill={s} onClick={()=>toggleSkill(s)}/>)}
                </div>
              </>
            )}
          </div>
          <div style={{ display:'flex',gap:10,paddingTop:12,borderTop:`1px solid ${divider}` }}>
            <button type="submit" disabled={loading}
              style={{ background:'linear-gradient(135deg,#2563eb,#3b82f6)',color:'#fff',border:'none',borderRadius:7,padding:'10px 22px',fontSize:13,fontWeight:600,opacity:loading?.6:1 }}>
              {loading?'Saving…':'Save Changes'}
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

export default function ProjectDetail() {
  const { id }         = useParams();
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const { isDark }     = useTheme();

  const [project,     setProject]     = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [tab,         setTab]         = useState(searchParams.get('tab')||'overview');
  const [messages,    setMessages]    = useState([]);
  const [msgText,     setMsgText]     = useState('');
const [requests, setRequests] = useState([]);
const [files, setFiles] = useState([]);
const [loading, setLoading] = useState(true);
const [toast, setToast] = useState(null);
const [showEdit, setShowEdit] = useState(false);

const fileRef = useRef(null);
const msgEndRef = useRef(null);
const myId = parseInt(localStorage.getItem('userId'));

const notify = (msg, type = 'ok') => {
  setToast({ msg, type });
  setTimeout(() => setToast(null), 3000);
};

// Load project details
useEffect(() => {
  API.get(`/api/projects/${id}`)
    .then(r => {
      setProject(r.data);
      setLoading(false);
    })
    .catch(() => navigate('/'));
}, [id, navigate]); // ✅ include navigate

// Load current user
useEffect(() => {
  const uid = localStorage.getItem('userId');
  if (uid) {
    API.get(`/api/users/${uid}`)
      .then(r => setCurrentUser(r.data))
      .catch(() => {});
  }
}, []); // ✅ runs once on mount

// Load files and requests when project changes
useEffect(() => {
  if (!project) return;

  if (project.member) {
    API.get(`/api/projects/${id}/files`)
      .then(r => setFiles(r.data))
      .catch(() => {});
  }
  if (project.isLead) {
    API.get(`/api/projects/${id}/requests`)
      .then(r => setRequests(r.data))
      .catch(() => {});
  }
}, [project, id]); // ✅ include project and id

// Poll for new messages every 3 seconds
useEffect(() => {
  if (!project?.member) return;

  // Load messages immediately
  API.get(`/api/projects/${id}/messages`)
    .then(r => setMessages(r.data))
    .catch(() => {});

  // Poll every 3 seconds
  const interval = setInterval(() => {
    API.get(`/api/projects/${id}/messages`)
      .then(r => {
        setMessages(prev => {
          if (r.data.length !== prev.length) return r.data;
          return prev;
        });
      })
      .catch(() => {});
  }, 3000);

  return () => clearInterval(interval);
}, [project, id]); // ✅ include project and id

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const sendMsg = async () => {
    if (!msgText.trim()) return;
    const text = msgText;
    setMsgText('');
    try {
      const res = await API.post(`/api/projects/${id}/messages`, { text });
      setMessages(prev => {
        if (prev.some(m => m.id === res.data.id)) return prev;
        return [...prev, res.data];
      });
    } catch (err) {
      notify('Failed to send message', 'err');
      setMsgText(text);
    }
  };

  const uploadFile = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await API.post(`/api/projects/${id}/files`, fd);
      setFiles(prev=>[...prev, res.data]);
      notify(`"${file.name}" uploaded!`);
    } catch { notify('Upload failed','err'); }
    e.target.value = '';
  };

  const deleteFile = async (fileId) => {
    try { await API.delete(`/api/projects/files/${fileId}`); setFiles(prev=>prev.filter(f=>f.id!==fileId)); notify('File deleted.'); }
    catch { notify('Could not delete','err'); }
  };

  const acceptReq = async (reqId) => {
    try {
      await API.post(`/api/projects/requests/${reqId}/accept`);
      setRequests(prev=>prev.filter(r=>r.id!==reqId)); notify('Member added!');
      const res = await API.get(`/api/projects/${id}`); setProject(res.data);
    } catch(err) { notify(err.response?.data?.error||'Failed','err'); }
  };

  const declineReq = async (reqId) => {
    try { await API.post(`/api/projects/requests/${reqId}/decline`); setRequests(prev=>prev.filter(r=>r.id!==reqId)); notify('Declined.'); }
    catch { notify('Failed','err'); }
  };

  const kickMember = async (memberId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await API.delete(`/api/projects/${id}/members/${memberId}`);
      const res = await API.get(`/api/projects/${id}`); setProject(res.data); notify('Member removed.');
    } catch(err) { notify(err.response?.data?.error||'Failed','err'); }
  };

  const requestJoin = async () => {
    try { await API.post(`/api/projects/${id}/request`); notify('Join request sent!'); setProject(p=>({...p,hasRequested:true})); }
    catch(err) { notify(err.response?.data?.error||'Failed','err'); }
  };

  const completeProject = async () => {
    if (!window.confirm('Mark this project as complete? This cannot be undone easily.')) return;
    try {
      const res = await API.put(`/api/projects/${id}/complete`);
      setProject(res.data); notify('Project marked as complete! 🎉');
    } catch(err) { notify(err.response?.data?.error||'Failed','err'); }
  };

  const deleteProject = async () => {
    if (!window.confirm('Delete this project? All data will be lost.')) return;
    try {
      await API.delete(`/api/projects/${id}`);
      notify('Project deleted.'); navigate('/my-projects');
    } catch(err) { notify(err.response?.data?.error||'Failed','err'); }
  };

  const reopenProject = async () => {
    try { const res = await API.put(`/api/projects/${id}/reopen`); setProject(res.data); notify('Project reopened!'); }
    catch(err) { notify(err.response?.data?.error||'Failed','err'); }
  };

  if (loading) return <div style={{ textAlign:'center',padding:'80px 0',color:'#64748b' }}>Loading project…</div>;
  if (!project) return null;

  const isLead   = project.isLead;
  const isMember = project.member;
  const isCompleted = project.status === 'COMPLETED';
  const isActive    = project.status === 'ACTIVE' || !project.status;

  const bg      = isDark?'#070a0f':'#f8fafc';
  const surf    = isDark?'#0c1018':'#ffffff';
  const border  = isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.08)';
  const divider = isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.06)';
  const textPri = isDark?'#f1f5f9':'#0f172a';
  const textSec = isDark?'#94a3b8':'#475569';
  const textMut = isDark?'#64748b':'#94a3b8';
  const inpBg   = isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)';
  const inpBord = isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.1)';
  const msgMyBg = isDark?'rgba(37,99,235,.22)':'rgba(37,99,235,.12)';
  const msgOtBg = isDark?'rgba(255,255,255,.05)':'rgba(0,0,0,.04)';

  const card = { background:surf,border:`1px solid ${border}`,borderRadius:10,padding:22 };
  const inp  = { background:inpBg,border:`1.5px solid ${inpBord}`,borderRadius:6,color:textPri,fontSize:13,fontFamily:"'DM Sans',sans-serif",padding:'10px 13px',width:'100%',outline:'none' };

  const tabs = [
    ['overview','Overview'], ['members','Members'],
    ['files',`Files (${files.length})`], ['chat','Chat'],
    ...(isLead?[['requests',requests.length>0?`Requests (${requests.length})`:'Requests']]:[]),
  ];

  return (
    <div style={{ maxWidth:960,margin:'0 auto',padding:'0 28px 80px',background:bg,minHeight:'100vh' }}>

      {showEdit && <EditProjectModal project={project} isDark={isDark} onClose={()=>setShowEdit(false)} onSave={p=>setProject(p)}/>}

      {toast && (
        <div style={{ position:'fixed',bottom:22,right:22,zIndex:9999,padding:'11px 18px',borderRadius:8,fontSize:13,fontWeight:600,display:'flex',alignItems:'center',gap:9,boxShadow:'0 8px 32px rgba(0,0,0,.4)',background:toast.type==='err'?'rgba(120,25,25,.97)':'rgba(18,78,42,.97)',border:`1px solid ${toast.type==='err'?'#ef4444':'#22c55e'}`,color:'#fff' }}>
          {toast.type==='err'?'⚠':'✓'} {toast.msg}
        </div>
      )}

      {/* Breadcrumb */}
      <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:22,paddingTop:20 }}>
        <button onClick={()=>navigate(-1)} style={{ background:'none',border:'none',color:textMut,fontSize:13,cursor:'pointer',padding:0,transition:'color .15s' }}
          onMouseEnter={e=>e.currentTarget.style.color=textPri} onMouseLeave={e=>e.currentTarget.style.color=textMut}>← Back</button>
        <span style={{ color:textMut }}>/</span>
        <span style={{ fontSize:13,color:textSec }}>{project.name}</span>
      </div>

      {/* Project header */}
      <div style={{ ...card,marginBottom:18 }}>
        {/* Completed banner */}
        {isCompleted && (
          <div style={{ background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.25)',borderRadius:8,padding:'10px 14px',marginBottom:14,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
            <span style={{ color:'#34d399',fontSize:13,fontWeight:600 }}>🎉 This project is marked as complete</span>
            {isLead && (
              <button onClick={reopenProject} style={{ background:'none',border:'1px solid rgba(16,185,129,0.4)',borderRadius:5,color:'#34d399',fontSize:11,fontWeight:600,padding:'3px 10px',cursor:'pointer' }}>
                Reopen
              </button>
            )}
          </div>
        )}

        <div style={{ display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:14,marginBottom:14 }}>
          <div>
            <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:7,flexWrap:'wrap' }}>
              <h1 style={{ fontSize:22,fontWeight:700,letterSpacing:'-.5px',color:textPri }}>{project.name}</h1>
              {isMember   && <Badge label="Member"    color="green"/>}
              {isLead     && <Badge label="Lead"      color="blue"/>}
              {isCompleted&& <Badge label="Completed" color="gray"/>}
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:7,color:textMut,fontSize:12,flexWrap:'wrap' }}>
              <Avatar name={project.lead?.name} id={project.lead?.id} size={20} imageUrl={project.lead?.profileImageUrl}/>
              <span style={{ cursor:'pointer' }} onClick={()=>navigate(`/profile/${project.lead?.id}`)}>
                by <strong style={{ color:textSec }}>{project.lead?.name}</strong>
              </span>
              <span>· {project.createdAt}</span>
              <span style={{ background:'rgba(37,99,235,0.1)',border:'1px solid rgba(37,99,235,0.25)',borderRadius:4,padding:'1px 7px',fontSize:10,fontWeight:700,color:'#3b82f6',fontFamily:"'DM Mono',monospace" }}>
                👥 {project.members?.length}/{project.maxMembers||4}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display:'flex',gap:8,flexWrap:'wrap',alignItems:'flex-start' }}>
            {!isMember && isActive && (
              <button onClick={requestJoin} disabled={project.hasRequested}
                style={{ background:project.hasRequested?'transparent':'linear-gradient(135deg,#2563eb,#3b82f6)',color:'#fff',border:project.hasRequested?`1px solid ${border}`:'none',borderRadius:7,padding:'8px 18px',fontSize:13,fontWeight:600,opacity:project.hasRequested?.6:1,transition:'all .15s' }}>
                {project.hasRequested?'✓ Requested':'Request to Join'}
              </button>
            )}
            {isLead && isActive && (
              <>
                <button onClick={()=>setShowEdit(true)}
                  style={{ background:'transparent',border:`1px solid ${border}`,borderRadius:7,color:textSec,padding:'8px 16px',fontSize:13,fontWeight:600,transition:'all .15s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor='#3b82f6'; e.currentTarget.style.color='#3b82f6'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor=border; e.currentTarget.style.color=textSec; }}>
                  ✏ Edit
                </button>
                <button onClick={completeProject}
                  style={{ background:'transparent',border:'1px solid rgba(16,185,129,0.35)',borderRadius:7,color:'#34d399',padding:'8px 16px',fontSize:13,fontWeight:600,transition:'all .15s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(16,185,129,0.1)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  title={files.length===0?'Upload at least 1 file first':''}>
                  ✓ Complete
                </button>
                <button onClick={deleteProject}
                  style={{ background:'transparent',border:'1px solid rgba(239,68,68,0.3)',borderRadius:7,color:'#f87171',padding:'8px 16px',fontSize:13,fontWeight:600,transition:'all .15s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.1)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  🗑 Delete
                </button>
              </>
            )}
          </div>
        </div>

        <p style={{ color:textSec,lineHeight:1.75,fontSize:14,marginBottom:16 }}>{project.description}</p>
        <div style={{ display:'flex',flexWrap:'wrap',gap:6 }}>
          {project.skills?.map(s=><SkillChip key={s} skill={s}/>)}
        </div>
      </div>

      {!isMember&&currentUser&&<AIMatchPanel currentUser={currentUser} project={project}/>}

      {/* Tabs */}
      <div style={{ display:'flex',borderBottom:`1px solid ${border}`,marginBottom:20 }}>
        {tabs.map(([t,lbl])=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{ background:'none',border:'none',borderBottom:`2px solid ${tab===t?'#3b82f6':'transparent'}`,color:tab===t?textPri:textMut,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,padding:'10px 15px',cursor:'pointer',marginBottom:-1,transition:'color .14s',position:'relative' }}
            onMouseEnter={e=>{ if(tab!==t) e.currentTarget.style.color=textSec; }}
            onMouseLeave={e=>{ if(tab!==t) e.currentTarget.style.color=textMut; }}>
            {lbl}
            {t==='requests'&&requests.length>0&&<span style={{ position:'absolute',top:6,right:4,width:6,height:6,borderRadius:'50%',background:'#ef4444' }}/>}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab==='overview'&&(
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:15 }}>
          <div style={card}>
            <p style={{ fontSize:11,fontWeight:700,color:textMut,textTransform:'uppercase',letterSpacing:1,marginBottom:14,fontFamily:"'DM Mono',monospace" }}>Team ({project.members?.length}/{project.maxMembers||4})</p>
            {project.members?.map(m=>(
              <div key={m.id} style={{ display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:`1px solid ${divider}`,cursor:'pointer' }} onClick={()=>navigate(`/profile/${m.id}`)}>
                <Avatar name={m.name} id={m.id} size={36} imageUrl={m.profileImageUrl}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600,fontSize:13,color:textPri,display:'flex',alignItems:'center',gap:7 }}>{m.name}{m.id===project.lead?.id&&<Badge label="Lead" color="amber"/>}</div>
                  <div style={{ color:textMut,fontSize:11,marginTop:2 }}>{m.skills?.slice(0,2).join(' · ')}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={card}>
            <p style={{ fontSize:11,fontWeight:700,color:textMut,textTransform:'uppercase',letterSpacing:1,marginBottom:14,fontFamily:"'DM Mono',monospace" }}>Recent Files</p>
            {files.length===0&&<p style={{ color:textMut,fontSize:13 }}>No files yet.</p>}
            {files.slice(0,4).map(f=>(
              <div key={f.id} style={{ display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:`1px solid ${divider}` }}>
                <div style={{ width:30,height:30,background:'rgba(37,99,235,.1)',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14 }}>📄</div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:12,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:textPri }}>{f.fileName}</div>
                  <div style={{ fontSize:10,color:textMut }}>{f.uploadedByName} · {f.uploadedAt?.slice(0,10)}</div>
                </div>
              </div>
            ))}
            {isMember&&(<div style={{ marginTop:12 }}>
              <input type="file" ref={fileRef} style={{ display:'none' }} onChange={uploadFile}/>
              <button onClick={()=>fileRef.current?.click()} style={{ background:inpBg,border:`1px solid ${inpBord}`,borderRadius:6,color:textSec,fontSize:12,fontWeight:600,padding:'6px 14px',transition:'all .15s' }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor='#3b82f6'; e.currentTarget.style.color='#3b82f6'; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor=inpBord; e.currentTarget.style.color=textSec; }}>
                ↑ Upload File
              </button>
            </div>)}
          </div>
        </div>
      )}

      {/* ── MEMBERS ── */}
      {tab==='members'&&(
        <div style={card}>
          <p style={{ fontSize:11,fontWeight:700,color:textMut,textTransform:'uppercase',letterSpacing:1,marginBottom:14,fontFamily:"'DM Mono',monospace" }}>All Members ({project.members?.length}/{project.maxMembers||4})</p>
          {project.members?.map(m=>(
            <div key={m.id} style={{ display:'flex',alignItems:'center',gap:14,padding:'13px 0',borderBottom:`1px solid ${divider}` }}>
              <div style={{ cursor:'pointer' }} onClick={()=>navigate(`/profile/${m.id}`)}><Avatar name={m.name} id={m.id} size={42} imageUrl={m.profileImageUrl}/></div>
              <div style={{ flex:1,cursor:'pointer' }} onClick={()=>navigate(`/profile/${m.id}`)}>
                <div style={{ fontWeight:600,fontSize:14,color:textPri,display:'flex',alignItems:'center',gap:8 }}>
                  {m.name}
                  {m.id===project.lead?.id&&<Badge label="Lead" color="amber"/>}
                  {m.id===myId&&m.id!==project.lead?.id&&<Badge label="You" color="blue"/>}
                </div>
                <div style={{ color:textMut,fontSize:12,marginTop:2 }}>{m.skills?.join(' · ')}</div>
              </div>
              <div style={{ display:'flex',gap:8 }}>
                <button onClick={()=>navigate(`/profile/${m.id}`)} style={{ background:'transparent',border:`1px solid ${inpBord}`,borderRadius:6,color:textSec,fontSize:12,fontWeight:600,padding:'5px 12px',transition:'all .15s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor='#3b82f6'; e.currentTarget.style.color='#3b82f6'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor=inpBord; e.currentTarget.style.color=textSec; }}>
                  Profile
                </button>
                {isLead&&m.id!==myId&&(
                  <button onClick={()=>kickMember(m.id)} style={{ background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:6,color:'#f87171',fontSize:12,fontWeight:600,padding:'5px 12px',transition:'all .15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.2)'}
                    onMouseLeave={e=>e.currentTarget.style.background='rgba(239,68,68,0.1)'}>
                    Kick
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── FILES ── */}
      {tab==='files'&&(
        <div style={card}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18 }}>
            <p style={{ fontSize:11,fontWeight:700,color:textMut,textTransform:'uppercase',letterSpacing:1,fontFamily:"'DM Mono',monospace" }}>Files ({files.length})</p>
            {isMember&&(<><input type="file" ref={fileRef} style={{ display:'none' }} onChange={uploadFile}/>
              <button onClick={()=>fileRef.current?.click()} style={{ background:'linear-gradient(135deg,#2563eb,#3b82f6)',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontSize:12,fontWeight:600,transition:'all .15s' }}
                onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                ↑ Upload
              </button></>)}
          </div>
          {files.length===0?(
            <div style={{ border:`1.5px dashed rgba(37,99,235,0.3)`,borderRadius:8,padding:32,textAlign:'center',cursor:isMember?'pointer':'default' }} onClick={()=>isMember&&fileRef.current?.click()}>
              <div style={{ fontSize:26,marginBottom:10 }}>📂</div>
              <p style={{ color:textSec,fontSize:14,fontWeight:500 }}>{isMember?'Upload your first file':'No files yet'}</p>
              {isMember&&<p style={{ color:textMut,fontSize:12,marginTop:4 }}>Click to browse</p>}
            </div>
          ):files.map(f=>(
            <div key={f.id} style={{ display:'flex',alignItems:'center',gap:14,padding:'12px 0',borderBottom:`1px solid ${divider}` }}>
              <div style={{ width:38,height:38,background:'rgba(37,99,235,.08)',border:'1px solid rgba(37,99,235,.2)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>📄</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600,fontSize:13,color:textPri }}>{f.fileName}</div>
                <div style={{ color:textMut,fontSize:11,marginTop:2 }}>{f.uploadedByName} · {f.uploadedAt?.slice(0,10)} · {((f.fileSize||0)/1024).toFixed(1)} KB</div>
              </div>
              <div style={{ display:'flex',gap:8 }}>
                <a href={f.fileUrl} target="_blank" rel="noreferrer"
                  style={{ background:'transparent',border:`1px solid ${inpBord}`,borderRadius:6,color:textSec,fontSize:12,fontWeight:600,padding:'5px 12px',display:'inline-block',transition:'all .15s' }}>
                  Download
                </a>
                {(isLead||f.uploadedById===myId)&&(
                  <button onClick={()=>deleteFile(f.id)} style={{ background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:6,color:'#f87171',fontSize:12,fontWeight:600,padding:'5px 12px',transition:'all .15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.2)'}
                    onMouseLeave={e=>e.currentTarget.style.background='rgba(239,68,68,0.1)'}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CHAT ── */}
      {tab==='chat'&&(
        <div style={{ ...card,display:'flex',flexDirection:'column',height:500 }}>
          {!isMember?(
            <div style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:textMut,fontSize:13 }}>Join the project to access chat.</div>
          ):(
            <>
              {/* Status */}
              <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:12,paddingBottom:12,borderBottom:`1px solid ${border}` }}>
                <div style={{ width:7,height:7,borderRadius:'50%',background:'#10b981' }}/>
                <span style={{ fontSize:11,color:textMut,fontFamily:"'DM Mono',monospace" }}>
                  Live — updates every 3 seconds
                </span>
              </div>

              <div style={{ flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:12,marginBottom:14 }}>
                {messages.length===0&&<p style={{ color:textMut,fontSize:13,textAlign:'center',marginTop:40 }}>No messages yet — say hello! 👋</p>}
                {messages.map((m,i)=>{
                  const isMe = m.senderId===myId;
                  return (
                    <div key={i} style={{ display:'flex',gap:9,flexDirection:isMe?'row-reverse':'row',alignItems:'flex-end' }}>
                      {m.senderProfileImageUrl
                        ? <img src={m.senderProfileImageUrl} alt={m.senderName} style={{ width:28,height:28,borderRadius:8,objectFit:'cover',flexShrink:0 }} onError={e=>e.target.style.display='none'}/>
                        : <Avatar name={m.senderName} id={m.senderId} size={28}/>
                      }
                      <div style={{ maxWidth:'64%' }}>
                        {!isMe&&<div style={{ fontSize:10,fontWeight:700,color:textMut,marginBottom:4,marginLeft:2 }}>{m.senderName}</div>}
                        <div style={{ background:isMe?msgMyBg:msgOtBg,border:`1px solid ${isMe?'rgba(37,99,235,.3)':border}`,borderRadius:isMe?'10px 10px 2px 10px':'10px 10px 10px 2px',padding:'9px 13px',fontSize:13,lineHeight:1.6,color:textPri }}>
                          {m.text}
                        </div>
                        <div style={{ fontSize:10,color:textMut,marginTop:3,textAlign:isMe?'right':'left' }}>
                          {m.sentAt ? new Date(m.sentAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={msgEndRef}/>
              </div>

              <div style={{ display:'flex',gap:9,paddingTop:12,borderTop:`1px solid ${border}` }}>
                <input value={msgText} onChange={e=>setMsgText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&(e.preventDefault(),sendMsg())}
                  placeholder="Write a message… (Enter to send)"
                  style={{ ...inp,flex:1 }}
                  onFocus={e=>e.target.style.borderColor='#3b82f6'} onBlur={e=>e.target.style.borderColor=inpBord}/>
                <button onClick={sendMsg} style={{ background:'linear-gradient(135deg,#2563eb,#3b82f6)',color:'#fff',border:'none',borderRadius:7,padding:'10px 18px',fontSize:13,fontWeight:600,transition:'all .15s' }}
                  onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── REQUESTS ── */}
      {tab==='requests'&&isLead&&(
        <div style={card}>
          <p style={{ fontSize:11,fontWeight:700,color:textMut,textTransform:'uppercase',letterSpacing:1,marginBottom:14,fontFamily:"'DM Mono',monospace" }}>Join Requests ({requests.length})</p>
          {requests.length===0&&<p style={{ color:textMut,fontSize:13 }}>No pending requests.</p>}
          {requests.map(r=>(
            <div key={r.id} style={{ display:'flex',alignItems:'center',gap:14,padding:'13px 0',borderBottom:`1px solid ${divider}` }}>
              <Avatar name={r.userName} id={r.userId} size={40} imageUrl={r.userProfileImageUrl}/>
              <div style={{ flex:1,cursor:'pointer' }} onClick={()=>navigate(`/profile/${r.userId}`)}>
                <div style={{ fontWeight:600,fontSize:14,color:textPri }}>{r.userName}</div>
                <div style={{ color:textMut,fontSize:12,marginTop:2 }}>{r.userSkills?.slice(0,4).join(' · ')}</div>
              </div>
              <div style={{ display:'flex',gap:8 }}>
                <button onClick={()=>acceptReq(r.id)} style={{ background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.28)',borderRadius:6,color:'#34d399',fontSize:12,fontWeight:700,padding:'6px 16px',transition:'all .15s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(16,185,129,0.2)'}
                  onMouseLeave={e=>e.currentTarget.style.background='rgba(16,185,129,0.1)'}>
                  ✓ Accept
                </button>
                <button onClick={()=>declineReq(r.id)} style={{ background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:6,color:'#f87171',fontSize:12,fontWeight:700,padding:'6px 16px',transition:'all .15s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.2)'}
                  onMouseLeave={e=>e.currentTarget.style.background='rgba(239,68,68,0.1)'}>
                  ✗ Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
