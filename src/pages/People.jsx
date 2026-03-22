import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import SkillChip from '../components/SkillChip';
import { useTheme } from '../context/ThemeContext';

const AV_COLORS = ['#2563eb','#7c3aed','#059669','#dc2626','#d97706','#0891b2'];
const getColor  = id => AV_COLORS[(id||0) % AV_COLORS.length];

function Avatar({ name, id, size=44, imageUrl }) {
  const initials = name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()||'?';
  if (imageUrl) return <img src={imageUrl} alt={name} style={{ width:size,height:size,borderRadius:size*0.25,objectFit:'cover',flexShrink:0 }}/>;
  return <div style={{ width:size,height:size,borderRadius:size*0.25,background:getColor(id),display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.34,fontWeight:700,color:'#fff',flexShrink:0,fontFamily:"'DM Mono',monospace" }}>{initials}</div>;
}

export default function People() {
  const navigate   = useNavigate();
  const { isDark } = useTheme();
  const [users,    setUsers]   = useState([]);
  const [search,   setSearch]  = useState('');
  const [loading,  setLoading] = useState(false);
  const myId = parseInt(localStorage.getItem('userId'));

  useEffect(() => {
    // Load all users on mount
    API.get('/api/users/search?name=').then(r => setUsers(r.data)).catch(()=>{});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      API.get(`/api/users/search?name=${encodeURIComponent(search)}`)
        .then(r => setUsers(r.data))
        .catch(()=>{})
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const bg     = isDark ? '#070a0f' : '#f8fafc';
  const surf   = isDark ? '#0c1018' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const textPri= isDark ? '#f1f5f9' : '#0f172a';
  const textSec= isDark ? '#94a3b8' : '#475569';
  const textMut= isDark ? '#64748b'  : '#94a3b8';
  const inpBg  = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const inpBord= isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';

  return (
    <div style={{ maxWidth:900,margin:'0 auto',padding:'0 28px 80px',background:bg,minHeight:'100vh' }}>
      <div style={{ padding:'48px 0 28px',borderBottom:`1px solid ${isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)'}`,marginBottom:28 }}>
        <h1 style={{ fontSize:'clamp(20px,3vw,30px)',fontWeight:700,letterSpacing:'-.5px',color:textPri,marginBottom:8 }}>
          Discover People
        </h1>
        <p style={{ color:textSec,fontSize:14 }}>Find developers to collaborate with.</p>
      </div>

      {/* Search */}
      <div style={{ position:'relative',marginBottom:24,maxWidth:400 }}>
        <svg style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',opacity:.4,pointerEvents:'none' }} width={14} height={14} viewBox="0 0 20 20" fill="none">
          <circle cx="9" cy="9" r="6" stroke={isDark?'#fff':'#000'} strokeWidth="1.8"/>
          <path d="M14 14l4 4" stroke={isDark?'#fff':'#000'} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name…"
          style={{ background:inpBg,border:`1.5px solid ${inpBord}`,borderRadius:8,color:textPri,fontSize:13,padding:'9px 13px 9px 34px',width:'100%',outline:'none',transition:'border-color .2s',fontFamily:"'DM Sans',sans-serif" }}
          onFocus={e=>e.target.style.borderColor='#3b82f6'} onBlur={e=>e.target.style.borderColor=inpBord}/>
      </div>

      <p style={{ color:textMut,fontSize:13,marginBottom:16 }}>
        {loading ? 'Searching…' : `${users.filter(u=>u.id!==myId).length} developer${users.length!==1?'s':''} found`}
      </p>

      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14 }}>
        {users.filter(u=>u.id!==myId).map(u=>(
          <div key={u.id} onClick={()=>navigate(`/profile/${u.id}`)}
            style={{ background:surf,border:`1px solid ${border}`,borderRadius:10,padding:20,cursor:'pointer',transition:'all .2s' }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(37,99,235,0.45)'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor=border; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
            <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:12 }}>
              <Avatar name={u.name} id={u.id} size={44} imageUrl={u.profileImageUrl}/>
              <div>
                <div style={{ fontWeight:700,fontSize:14,color:textPri }}>{u.name}</div>
                <div style={{ fontSize:11,color:textMut,marginTop:2 }}>
                  {u.skills?.length||0} skill{u.skills?.length!==1?'s':''}
                </div>
              </div>
            </div>
            {u.bio && (
              <p style={{ color:textSec,fontSize:12,lineHeight:1.6,marginBottom:12,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' }}>
                {u.bio}
              </p>
            )}
            <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
              {u.skills?.slice(0,4).map(s=><SkillChip key={s} skill={s} size="sm"/>)}
              {u.skills?.length>4&&<span style={{ fontSize:10,color:textMut,alignSelf:'center' }}>+{u.skills.length-4}</span>}
            </div>
          </div>
        ))}
        {!loading && users.filter(u=>u.id!==myId).length===0 && (
          <div style={{ gridColumn:'1/-1',textAlign:'center',padding:'60px 0',color:textMut }}>
            <div style={{ fontSize:36,marginBottom:12 }}>👥</div>
            <p style={{ fontSize:14 }}>No developers found{search ? ` for "${search}"` : ''}</p>
          </div>
        )}
      </div>
    </div>
  );
}
