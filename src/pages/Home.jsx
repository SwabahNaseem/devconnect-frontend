import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import { getMatchScore } from '../api/claude';
import SkillChip, { SKILL_CATEGORIES } from '../components/SkillChip';
import { useTheme } from '../context/ThemeContext';

const AV_COLORS = ['#2563eb','#7c3aed','#059669','#dc2626','#d97706','#0891b2'];
const getColor  = id => AV_COLORS[(id||0) % AV_COLORS.length];

function Avatar({ name, id, size=28 }) {
  const initials = name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()||'?';
  return <div style={{ width:size,height:size,borderRadius:size*0.28,background:getColor(id),display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.36,fontWeight:700,color:'#fff',flexShrink:0,fontFamily:"'DM Mono',monospace" }}>{initials}</div>;
}

function MatchBadge({ score, verdict, loading }) {
  if (loading) return (
    <div style={{ display:'flex',alignItems:'center',gap:5,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:5,padding:'3px 10px' }}>
      <div style={{ width:7,height:7,borderRadius:'50%',background:'#334155',animation:'pulse 1.2s infinite' }}/>
      <span style={{ fontSize:10,color:'#64748b',fontFamily:"'DM Mono',monospace" }}>AI…</span>
    </div>
  );
  if (score === null || score === undefined) return null;
  const color  = score>=80?'#10b981':score>=60?'#f59e0b':score>=40?'#3b82f6':'#64748b';
  const bg     = score>=80?'rgba(16,185,129,0.1)':score>=60?'rgba(245,158,11,0.1)':score>=40?'rgba(37,99,235,0.1)':'rgba(100,116,139,0.1)';
  const border = score>=80?'rgba(16,185,129,0.3)':score>=60?'rgba(245,158,11,0.3)':score>=40?'rgba(37,99,235,0.3)':'rgba(100,116,139,0.2)';
  return (
    <div style={{ display:'flex',alignItems:'center',gap:5,background:bg,border:`1px solid ${border}`,borderRadius:5,padding:'3px 10px' }}>
      <svg width={13} height={13} viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3"/>
        <circle cx="18" cy="18" r="15" fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${score*0.942} 100`} strokeLinecap="round" transform="rotate(-90 18 18)"
          style={{ transition:'stroke-dasharray .5s ease' }}/>
      </svg>
      <span style={{ fontSize:11,fontWeight:700,color,fontFamily:"'DM Mono',monospace" }}>{score}%</span>
    </div>
  );
}

function ProjectCard({ project, currentUser, onJoin, onClick, isDark }) {
  const [hovered, setHovered]           = useState(false);
  const [match, setMatch]               = useState(null);
  const [matchLoading, setMatchLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) { setMatchLoading(false); return; }
    setMatchLoading(true);
    getMatchScore(currentUser, project).then(r=>setMatch(r)).finally(()=>setMatchLoading(false));
  }, [project.id, currentUser?.id]);

  const isMember     = project.member || project.isLead;
  const hasRequested = project.hasRequested;

  const cardBg     = isDark ? '#0c1018' : '#ffffff';
  const cardBorder = hovered ? 'rgba(37,99,235,0.5)' : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)');
  const descColor  = isDark ? '#64748b' : '#64748b';
  const metaColor  = isDark ? '#94a3b8' : '#475569';

  return (
    <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onClick={onClick}
      style={{ background:cardBg,border:`1px solid ${cardBorder}`,borderRadius:10,padding:22,display:'flex',flexDirection:'column',gap:14,cursor:'pointer',position:'relative',overflow:'hidden',transition:'all .22s ease',transform:hovered?'translateY(-2px)':'none',boxShadow:hovered?'0 0 0 1px rgba(37,99,235,.2),0 10px 40px rgba(0,0,0,.2)':'none' }}>

      {/* Hover overlay */}
      {hovered && (
        <div style={{ position:'absolute',inset:0,background:'rgba(7,10,15,0.85)',backdropFilter:'blur(4px)',zIndex:10,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10,borderRadius:10,padding:16 }}>
          {match && !isMember && (
            <div style={{ textAlign:'center',marginBottom:6 }}>
              <div style={{ fontSize:32,fontWeight:700,color:match.score>=80?'#10b981':match.score>=60?'#f59e0b':'#3b82f6',fontFamily:"'DM Mono',monospace",lineHeight:1 }}>{match.score}%</div>
              <div style={{ fontSize:12,color:'#94a3b8',marginTop:2 }}>{match.verdict}</div>
              {match.matchedSkills?.length>0 && <div style={{ fontSize:11,color:'#64748b',marginTop:3 }}>✓ {match.matchedSkills.slice(0,3).join(', ')}</div>}
            </div>
          )}
          <div style={{ display:'flex',gap:8 }}>
            <button onClick={e=>{e.stopPropagation();onClick();}} style={{ background:'linear-gradient(135deg,#2563eb,#3b82f6)',color:'#fff',border:'none',borderRadius:6,padding:'7px 16px',fontSize:12,fontWeight:600 }}>View Project</button>
            {!isMember && <button onClick={e=>{e.stopPropagation();onJoin();}} style={{ background:'transparent',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.2)',borderRadius:6,padding:'7px 16px',fontSize:12,fontWeight:600 }}>{hasRequested?'✓ Requested':'Contribute'}</button>}
            {isMember && <button onClick={e=>{e.stopPropagation();onClick();}} style={{ background:'transparent',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.2)',borderRadius:6,padding:'7px 16px',fontSize:12,fontWeight:600 }}>Open</button>}
          </div>
        </div>
      )}

      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:5 }}>
            <h3 style={{ fontSize:15,fontWeight:700,letterSpacing:'-.3px' }}>{project.name}</h3>
            {isMember && <span style={{ background:'rgba(16,185,129,.12)',color:'#34d399',border:'1px solid rgba(16,185,129,.3)',borderRadius:4,padding:'2px 7px',fontSize:10,fontWeight:700,fontFamily:"'DM Mono',monospace" }}>JOINED</span>}
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:6,color:metaColor,fontSize:12 }}>
            <Avatar name={project.lead?.name} id={project.lead?.id} size={16}/>
            <span>{project.lead?.name}</span>
            <span style={{ color:isDark?'#475569':'#94a3b8' }}>· {project.createdAt}</span>
          </div>
        </div>
        <div style={{ background:'rgba(37,99,235,.08)',border:'1px solid rgba(37,99,235,.2)',borderRadius:5,padding:'2px 8px',fontSize:10,color:'#3b82f6',fontFamily:"'DM Mono',monospace",flexShrink:0,marginLeft:8 }}>
          {project.members?.length||0}/{project.maxMembers||4}
        </div>
      </div>

      <p style={{ color:descColor,fontSize:13,lineHeight:1.65,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' }}>{project.description}</p>

      <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
        {project.skills?.map(s=>(
          <span key={s} style={{ background:'rgba(37,99,235,0.1)',border:'1px solid rgba(37,99,235,0.3)',borderRadius:4,padding:'2px 8px',fontSize:11,fontWeight:600,color:'#3b82f6',fontFamily:"'DM Mono',monospace" }}>{s}</span>
        ))}
      </div>

      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:10,borderTop:`1px solid ${isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)'}` }}>
        <div style={{ display:'flex',alignItems:'center' }}>
          {project.members?.slice(0,5).map((m,i)=>(
            <div key={m.id} style={{ marginLeft:i===0?0:-6 }} title={m.name}><Avatar name={m.name} id={m.id} size={22}/></div>
          ))}
          {project.members?.length>5 && <span style={{ fontSize:11,color:'#64748b',marginLeft:6 }}>+{project.members.length-5}</span>}
        </div>
        {!isMember
          ? <MatchBadge score={match?.score??null} verdict={match?.verdict} loading={matchLoading}/>
          : <span style={{ fontSize:11,color:'#10b981',fontWeight:600,fontFamily:"'DM Mono',monospace" }}>✓ Member</span>
        }
      </div>
    </div>
  );
}

export default function Home() {
  const navigate               = useNavigate();
  const [searchParams]         = useSearchParams();
  const { isDark }             = useTheme();
  const [projects, setProjects]       = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [toast, setToast]             = useState(null);
  const [skillFilter, setSkillFilter]   = useState([]);
  const search = searchParams.get('search') || '';

  const notify = (msg, type='ok') => { setToast({msg,type}); setTimeout(()=>setToast(null),2800); };

  // Load current user from localStorage
useEffect(() => {
  const userId = localStorage.getItem('userId');
  if (userId) {
    API.get(`/api/users/${userId}`)
      .then(r => setCurrentUser(r.data))
      .catch(() => {});
  }
}, []); // ✅ runs once on mount

// Load projects (search or all)
useEffect(() => {
  setLoading(true);
  const url = search
    ? `/api/projects/search?term=${encodeURIComponent(search)}`
    : '/api/projects';

  API.get(url)
    .then(r => setProjects(r.data))
    .catch(() => notify('Failed to load projects', 'err'))
    .finally(() => setLoading(false));
}, [search]); // ✅ depends only on search

  const handleJoin = async (projectId) => {
    try {
      await API.post(`/api/projects/${projectId}/request`);
      notify('Join request sent!');
      setProjects(prev=>prev.map(p=>p.id===projectId?{...p,hasRequested:true}:p));
    } catch (err) { notify(err.response?.data?.error||'Could not send request','err'); }
  };

  const bg      = isDark ? '#070a0f' : '#f8fafc';
  const textPri = isDark ? '#f1f5f9' : '#0f172a';
  const textSec = isDark ? '#64748b' : '#64748b';

  return (
    <div style={{ maxWidth:1100,margin:'0 auto',padding:'0 28px 80px',background:bg,minHeight:'100vh' }}>
      {toast && (
        <div style={{ position:'fixed',bottom:22,right:22,zIndex:9999,padding:'11px 18px',borderRadius:8,fontSize:13,fontWeight:600,display:'flex',alignItems:'center',gap:9,boxShadow:'0 8px 32px rgba(0,0,0,.4)',background:toast.type==='err'?'rgba(120,25,25,.97)':'rgba(18,78,42,.97)',border:`1px solid ${toast.type==='err'?'#ef4444':'#22c55e'}`,color:'#fff' }}>
          {toast.type==='err'?'⚠':'✓'} {toast.msg}
        </div>
      )}

      {/* ── Hero ── */}
      <div style={{ padding:'48px 0 36px',borderBottom:`1px solid ${isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)'}`,marginBottom:32 }}>
        <h1 style={{ fontSize:'clamp(22px,3vw,34px)',fontWeight:700,letterSpacing:'-.5px',color:textPri,marginBottom:8 }}>
          Discover Projects
        </h1>
        <p style={{ color:textSec,fontSize:14,lineHeight:1.6,maxWidth:420 }}>
          Browse open projects and find teams that need your skills.
        </p>
      </div>

      {/* ── Project count + skill filter ── */}
      <div style={{ marginBottom:16 }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10,flexWrap:'wrap',gap:8 }}>
          <p style={{ color:textSec,fontSize:13 }}>
            {projects.length} project{projects.length!==1?'s':''}{search?` for "${search}"`:' available'}
          </p>
          <div style={{ display:'flex',alignItems:'center',gap:6,flexWrap:'wrap' }}>
            <span style={{ fontSize:11,color:textSec,fontFamily:"'DM Mono',monospace" }}>FILTER:</span>
            {['React','Python','Flutter','Node.js','Machine Learning','Docker','Figma'].map(s=>(
              <span key={s} onClick={()=>setSkillFilter(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s])}
                style={{ cursor:'pointer' }}>
                <SkillChip skill={s} size="sm" selected={skillFilter.includes(s)}/>
              </span>
            ))}
            {skillFilter.length>0&&(
              <button onClick={()=>setSkillFilter([])} style={{ background:'none',border:'none',color:'#64748b',fontSize:11,cursor:'pointer',textDecoration:'underline' }}>Clear</button>
            )}
          </div>
        </div>
        {skillFilter.length>0&&(
          <p style={{ color:textSec,fontSize:12 }}>
            Showing projects that require: {skillFilter.join(', ')}
          </p>
        )}
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div style={{ textAlign:'center',padding:'80px 0',color:textSec }}>
          <div style={{ fontSize:13 }}>Loading projects…</div>
        </div>
      ) : projects.length===0 ? (
        <div style={{ textAlign:'center',padding:'80px 0',color:textSec }}>
          <div style={{ fontSize:32,marginBottom:12 }}>🔍</div>
          <p style={{ fontSize:14,fontWeight:500 }}>{search?`No projects match "${search}"`:'No projects yet'}</p>
          <p style={{ fontSize:13,marginTop:6,color:'#475569' }}>
            {search ? 'Try a different search term' : 'Be the first to create one!'}
          </p>
        </div>
      ) : (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:15 }}>
          {(skillFilter.length>0
            ? projects.filter(p=>skillFilter.every(s=>p.skills?.includes(s)))
            : projects
          ).map(p=>(
            <ProjectCard key={p.id} project={p} currentUser={currentUser} isDark={isDark}
              onClick={()=>navigate(`/projects/${p.id}`)}
              onJoin={()=>handleJoin(p.id)}/>
          ))}
          {skillFilter.length>0&&projects.filter(p=>skillFilter.every(s=>p.skills?.includes(s))).length===0&&(
            <div style={{ gridColumn:'1/-1',textAlign:'center',padding:'60px 0',color:textSec }}>
              <p style={{ fontSize:14 }}>No projects match the selected skills</p>
              <button onClick={()=>setSkillFilter([])} style={{ marginTop:10,background:'none',border:'none',color:'#3b82f6',fontSize:13,cursor:'pointer',textDecoration:'underline' }}>Clear filter</button>
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
