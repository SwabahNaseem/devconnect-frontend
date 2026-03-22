import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import AIMatchPanel from '../components/AIMatchPanel';
import SkillChip from '../components/SkillChip';
import { useTheme } from '../context/ThemeContext';

const AV_COLORS = ['#2563eb','#7c3aed','#059669','#dc2626','#d97706','#0891b2'];
const getColor  = id => AV_COLORS[(id||0) % AV_COLORS.length];

function Avatar({ name, id, size=32, imageUrl=null }) {
  const initials = name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()||'?';
  if (imageUrl) {
    return <img src={imageUrl} alt={name} style={{ width:size,height:size,borderRadius:size*0.28,objectFit:'cover',flexShrink:0 }} onError={e=>e.target.style.display='none'}/>;
  }
  return <div style={{ width:size,height:size,borderRadius:size*0.28,background:getColor(id),display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.34,fontWeight:700,color:'#fff',flexShrink:0,fontFamily:"'DM Mono',monospace" }}>{initials}</div>;
}

function Badge({ label, color='green' }) {
  const map = {
    green:['rgba(16,185,129,.12)','#34d399','rgba(16,185,129,.3)'],
    blue: ['rgba(37,99,235,.12)','#60a5fa','rgba(37,99,235,.3)'],
    amber:['rgba(245,158,11,.12)','#fbbf24','rgba(245,158,11,.3)'],
    red:  ['rgba(239,68,68,.12)','#f87171','rgba(239,68,68,.3)'],
  };
  const [bg,col,br] = map[color]||map.green;
  return <span style={{ background:bg,color:col,border:`1px solid ${br}`,borderRadius:4,padding:'2px 8px',fontSize:10,fontWeight:700,letterSpacing:'.5px',textTransform:'uppercase',fontFamily:"'DM Mono',monospace" }}>{label}</span>;
}

export default function ProjectDetail() {
  const { id }          = useParams();
  const navigate        = useNavigate();
  const [searchParams]  = useSearchParams();
  const { isDark }      = useTheme();

  const [project,     setProject]     = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  // BUG FIX 1: Read ?tab=requests from URL so clicking notification opens Requests tab directly
  const [tab,         setTab]         = useState(searchParams.get('tab') || 'overview');
  const [messages,    setMessages]    = useState([]);
  const [msgText,     setMsgText]     = useState('');
  const [requests,    setRequests]    = useState([]);
  const [files,       setFiles]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [toast,       setToast]       = useState(null);

  const fileRef   = useRef(null);
  const msgEndRef = useRef(null);
  const myId = parseInt(localStorage.getItem('userId'));

  const notify = (msg, type='ok') => { setToast({msg,type}); setTimeout(()=>setToast(null),2800); };

  useEffect(() => {
    API.get(`/api/projects/${id}`).then(r=>{ setProject(r.data); setLoading(false); }).catch(()=>navigate('/'));
  }, [id]);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) API.get(`/api/users/${userId}`).then(r=>setCurrentUser(r.data)).catch(()=>{});
  }, []);

  useEffect(() => {
    if (!project) return;
    if (project.member) {
      API.get(`/api/projects/${id}/messages`).then(r=>setMessages(r.data)).catch(()=>{});
      API.get(`/api/projects/${id}/files`).then(r=>setFiles(r.data)).catch(()=>{});
    }
    if (project.isLead) {
      API.get(`/api/projects/${id}/requests`).then(r=>setRequests(r.data)).catch(()=>{});
    }
  }, [project?.id]);

  useEffect(()=>{ msgEndRef.current?.scrollIntoView({behavior:'smooth'}); },[messages]);

  const sendMsg = async () => {
    if (!msgText.trim()) return;
    try {
      const res = await API.post(`/api/projects/${id}/messages`,{text:msgText});
      setMessages(prev=>[...prev,res.data]); setMsgText('');
    } catch { notify('Failed to send','err'); }
  };

  const uploadFile = async (e) => {
    const file = e.target.files[0]; if(!file) return;
    const fd = new FormData(); fd.append('file',file);
    try {
      const res = await API.post(`/api/projects/${id}/files`,fd);
      setFiles(prev=>[...prev,res.data]); notify(`"${file.name}" uploaded!`);
    } catch { notify('Upload failed','err'); }
    e.target.value='';
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

  if (loading) return <div style={{ textAlign:'center',padding:'80px 0',color:'#64748b' }}>Loading project…</div>;
  if (!project) return null;

  const isLead   = project.isLead;
  const isMember = project.member;

  // ── Theme-aware tokens ──
  const bg      = isDark ? '#070a0f' : '#f8fafc';
  const surf    = isDark ? '#0c1018' : '#ffffff';
  const border  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const divider = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const textPri = isDark ? '#f1f5f9' : '#0f172a';
  const textSec = isDark ? '#94a3b8' : '#475569';
  const textMut = isDark ? '#64748b'  : '#94a3b8';
  const inpBg   = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const inpBord = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
  const msgMyBg = isDark ? 'rgba(37,99,235,.22)' : 'rgba(37,99,235,.12)';
  const msgOtBg = isDark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.04)';
  const tabActiveBord = '#3b82f6';
  const tabBord = 'transparent';

  const card = { background:surf,border:`1px solid ${border}`,borderRadius:10,padding:22 };
  const inp  = { background:inpBg,border:`1.5px solid ${inpBord}`,borderRadius:6,color:textPri,fontSize:13,fontFamily:"'DM Sans',sans-serif",padding:'10px 13px',width:'100%',outline:'none' };

  const tabs = [
    ['overview','Overview'],
    ['members','Members'],
    ['files',`Files (${files.length})`],
    ['chat','Chat'],
    // BUG FIX 2: Always show Requests tab for lead — not conditional on count
    // This way lead can always check inbox even when empty
    ...(isLead ? [['requests', requests.length > 0 ? `Requests (${requests.length})` : 'Requests']] : []),
  ];

  return (
    <div style={{ maxWidth:960,margin:'0 auto',padding:'0 28px 80px',background:bg,minHeight:'100vh' }}>
      {toast && (
        <div style={{ position:'fixed',bottom:22,right:22,zIndex:9999,padding:'11px 18px',borderRadius:8,fontSize:13,fontWeight:600,display:'flex',alignItems:'center',gap:9,boxShadow:'0 8px 32px rgba(0,0,0,.4)',background:toast.type==='err'?'rgba(120,25,25,.97)':'rgba(18,78,42,.97)',border:`1px solid ${toast.type==='err'?'#ef4444':'#22c55e'}`,color:'#fff' }}>
          {toast.type==='err'?'⚠':'✓'} {toast.msg}
        </div>
      )}

      <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:22,paddingTop:20 }}>
        <button onClick={()=>navigate(-1)} style={{ background:'none',border:'none',color:textMut,fontSize:13,cursor:'pointer',padding:0 }}>← Back</button>
        <span style={{ color:textMut }}>/</span>
        <span style={{ fontSize:13,color:textSec }}>{project.name}</span>
      </div>

      {/* Header */}
      <div style={{ ...card,marginBottom:18 }}>
        <div style={{ display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:14,marginBottom:14 }}>
          <div>
            <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:7 }}>
              <h1 style={{ fontSize:22,fontWeight:700,letterSpacing:'-.5px',color:textPri }}>{project.name}</h1>
              {isMember&&<Badge label="Member" color="green"/>}
              {isLead  &&<Badge label="Lead"   color="blue"/>}
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:7,color:textMut,fontSize:12,cursor:'pointer' }} onClick={()=>navigate(`/profile/${project.lead?.id}`)}>
              <Avatar name={project.lead?.name} id={project.lead?.id} size={20} imageUrl={project.lead?.profileImageUrl}/>
              <span>by <strong style={{ color:textSec }}>{project.lead?.name}</strong></span>
              <span>· {project.createdAt}</span>
              <span style={{ marginLeft:4,background:'rgba(37,99,235,0.1)',border:'1px solid rgba(37,99,235,0.25)',borderRadius:4,padding:'1px 7px',fontSize:10,fontWeight:700,color:'#3b82f6',fontFamily:"'DM Mono',monospace" }}>👥 {project.members?.length}/{project.maxMembers||4}</span>
            </div>
          </div>
          {!isMember && (
            <button onClick={requestJoin} disabled={project.hasRequested}
              style={{ background:project.hasRequested?'rgba(255,255,255,0.05)':'linear-gradient(135deg,#2563eb,#3b82f6)',color:'#fff',border:'none',borderRadius:7,padding:'9px 20px',fontSize:13,fontWeight:600,opacity:project.hasRequested?.6:1 }}>
              {project.hasRequested?'✓ Requested':'Request to Contribute'}
            </button>
          )}
        </div>
        <p style={{ color:textSec,lineHeight:1.75,fontSize:14,marginBottom:16 }}>{project.description}</p>
        <div style={{ display:'flex',flexWrap:'wrap',gap:6 }}>
          {project.skills?.map(s=>(
            <SkillChip key={s} skill={s}/>
          ))}
        </div>
      </div>

      {!isMember&&currentUser&&<AIMatchPanel currentUser={currentUser} project={project}/>}

      {/* Tabs */}
      <div style={{ display:'flex',borderBottom:`1px solid ${border}`,marginBottom:20 }}>
        {tabs.map(([t,lbl])=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{ background:'none',border:'none',borderBottom:`2px solid ${tab===t?tabActiveBord:tabBord}`,color:tab===t?textPri:textMut,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,padding:'10px 15px',cursor:'pointer',marginBottom:-1,transition:'color .14s',position:'relative' }}>
            {lbl}
            {t==='requests'&&requests.length>0&&<span style={{ position:'absolute',top:6,right:4,width:6,height:6,borderRadius:'50%',background:'#ef4444' }}/>}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab==='overview'&&(
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:15 }}>
          <div style={card}>
            <p style={{ fontSize:11,fontWeight:700,color:textMut,textTransform:'uppercase',letterSpacing:1,marginBottom:14,fontFamily:"'DM Mono',monospace" }}>Team</p>
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
            {files.length===0&&<p style={{ color:textMut,fontSize:13 }}>No files uploaded yet.</p>}
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
              <button onClick={()=>fileRef.current?.click()} style={{ background:inpBg,border:`1px solid ${inpBord}`,borderRadius:6,color:textSec,fontSize:12,fontWeight:600,padding:'6px 14px' }}>↑ Upload File</button>
            </div>)}
          </div>
        </div>
      )}

      {/* Members */}
      {tab==='members'&&(
        <div style={card}>
          <p style={{ fontSize:11,fontWeight:700,color:textMut,textTransform:'uppercase',letterSpacing:1,marginBottom:14,fontFamily:"'DM Mono',monospace" }}>All Members ({project.members?.length})</p>
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
                <button onClick={()=>navigate(`/profile/${m.id}`)} style={{ background:'transparent',border:`1px solid ${inpBord}`,borderRadius:6,color:textSec,fontSize:12,fontWeight:600,padding:'5px 12px' }}>Profile</button>
                {isLead&&m.id!==myId&&<button onClick={()=>kickMember(m.id)} style={{ background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:6,color:'#f87171',fontSize:12,fontWeight:600,padding:'5px 12px' }}>Kick</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Files */}
      {tab==='files'&&(
        <div style={card}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18 }}>
            <p style={{ fontSize:11,fontWeight:700,color:textMut,textTransform:'uppercase',letterSpacing:1,fontFamily:"'DM Mono',monospace" }}>Files ({files.length})</p>
            {isMember&&(<><input type="file" ref={fileRef} style={{ display:'none' }} onChange={uploadFile}/>
              <button onClick={()=>fileRef.current?.click()} style={{ background:'linear-gradient(135deg,#2563eb,#3b82f6)',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontSize:12,fontWeight:600 }}>↑ Upload</button></>)}
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
                <a href={f.fileUrl} target="_blank" rel="noreferrer" style={{ background:'transparent',border:`1px solid ${inpBord}`,borderRadius:6,color:textSec,fontSize:12,fontWeight:600,padding:'5px 12px',display:'inline-block' }}>Download</a>
                {(isLead||f.uploadedById===myId)&&<button onClick={()=>deleteFile(f.id)} style={{ background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:6,color:'#f87171',fontSize:12,fontWeight:600,padding:'5px 12px' }}>Delete</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chat */}
      {tab==='chat'&&(
        <div style={{ ...card,display:'flex',flexDirection:'column',height:480 }}>
          {!isMember?(
            <div style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:textMut,fontSize:13 }}>Join the project to access the group chat.</div>
          ):(
            <>
              <div style={{ flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:12,marginBottom:14 }}>
                {messages.length===0&&<p style={{ color:textMut,fontSize:13,textAlign:'center',marginTop:40 }}>No messages yet — say hello! 👋</p>}
                {messages.map((m,i)=>{
                  const isMe=m.senderId===myId;
                  return(
                    <div key={i} style={{ display:'flex',gap:9,flexDirection:isMe?'row-reverse':'row',alignItems:'flex-end' }}>
                      {/* Show profile image if available, otherwise initials avatar */}
                      {m.senderProfileImageUrl
                        ? <img src={m.senderProfileImageUrl} alt={m.senderName}
                            style={{ width:26,height:26,borderRadius:8,objectFit:'cover',flexShrink:0 }}
                            onError={e=>{ e.target.style.display='none'; }}/>
                        : <Avatar name={m.senderName} id={m.senderId} size={26}/>
                      }
                      <div style={{ maxWidth:'62%' }}>
                        {!isMe&&<div style={{ fontSize:10,fontWeight:700,color:textMut,marginBottom:4,marginLeft:2 }}>{m.senderName}</div>}
                        <div style={{ background:isMe?msgMyBg:msgOtBg,border:`1px solid ${isMe?'rgba(37,99,235,.3)':border}`,borderRadius:isMe?'9px 9px 2px 9px':'9px 9px 9px 2px',padding:'9px 13px',fontSize:13,lineHeight:1.6,color:textPri }}>
                          {m.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={msgEndRef}/>
              </div>
              <div style={{ display:'flex',gap:9,paddingTop:12,borderTop:`1px solid ${border}` }}>
                <input value={msgText} onChange={e=>setMsgText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMsg()} placeholder="Write a message…"
                  style={{ ...inp,flex:1 }} onFocus={e=>e.target.style.borderColor='#3b82f6'} onBlur={e=>e.target.style.borderColor=inpBord}/>
                <button onClick={sendMsg} style={{ background:'linear-gradient(135deg,#2563eb,#3b82f6)',color:'#fff',border:'none',borderRadius:7,padding:'10px 18px',fontSize:13,fontWeight:600 }}>Send</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Requests */}
      {tab==='requests'&&isLead&&(
        <div style={card}>
          <p style={{ fontSize:11,fontWeight:700,color:textMut,textTransform:'uppercase',letterSpacing:1,marginBottom:14,fontFamily:"'DM Mono',monospace" }}>Join Requests ({requests.length})</p>
          {requests.length===0&&<p style={{ color:textMut,fontSize:13 }}>No pending requests right now.</p>}
          {requests.map(r=>(
            <div key={r.id} style={{ display:'flex',alignItems:'center',gap:14,padding:'13px 0',borderBottom:`1px solid ${divider}` }}>
              <Avatar name={r.userName} id={r.userId} size={40} imageUrl={r.userProfileImageUrl}/>
              <div style={{ flex:1,cursor:'pointer' }} onClick={()=>navigate(`/profile/${r.userId}`)}>
                <div style={{ fontWeight:600,fontSize:14,color:textPri }}>{r.userName}</div>
                <div style={{ color:textMut,fontSize:12,marginTop:2 }}>{r.userSkills?.join(' · ')}</div>
              </div>
              <div style={{ display:'flex',gap:8 }}>
                <button onClick={()=>acceptReq(r.id)} style={{ background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.28)',borderRadius:6,color:'#34d399',fontSize:12,fontWeight:700,padding:'5px 14px' }}>Accept</button>
                <button onClick={()=>declineReq(r.id)} style={{ background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:6,color:'#f87171',fontSize:12,fontWeight:700,padding:'5px 14px' }}>Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
