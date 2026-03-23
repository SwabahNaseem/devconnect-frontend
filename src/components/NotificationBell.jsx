import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useTheme } from '../context/ThemeContext';

function playSound() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
  } catch(e) {}
}

export default function NotificationBell() {
  const navigate   = useNavigate();
  const { isDark } = useTheme();
  const bellRef    = useRef(null);
  const prevCount  = useRef(0);

  const [open,    setOpen]    = useState(false);
  const [notifs,  setNotifs]  = useState([]);
  const [count,   setCount]   = useState(0);
  const [loading, setLoading] = useState(false);

  // Poll count every 15 seconds
  useEffect(() => {
    fetchCount();
    const iv = setInterval(fetchCount, 15000);
    return () => clearInterval(iv);
  }, []);

  // Close on outside click
  useEffect(() => {
    const h = e => { if (bellRef.current && !bellRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const fetchCount = async () => {
    try {
      const res = await API.get('/api/notifications/count');
      const n = res.data.count;
      if (n > prevCount.current && prevCount.current >= 0) playSound();
      prevCount.current = n;
      setCount(n);
    } catch(e) {}
  };

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/notifications');
      setNotifs(res.data);
    } catch(e) {}
    finally { setLoading(false); }
  };

  const handleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) fetchNotifs();
  };

  const markAllRead = async () => {
    try {
      await API.put('/api/notifications/read-all');
      setCount(0);
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch(e) {}
  };

  const deleteNotif = async (e, id) => {
    e.stopPropagation();
    try {
      await API.delete(`/api/notifications/${id}`);
      setNotifs(prev => prev.filter(n => n.id !== id));
      setCount(c => Math.max(0, c - 1));
    } catch(e) {}
  };

  const markRead = async (notif) => {
    if (!notif.isRead) {
      try {
        await API.put(`/api/notifications/${notif.id}/read`);
        setNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
        setCount(c => Math.max(0, c - 1));
      } catch(e) {}
    }
  };

  // Accept join request — accepts + deletes notification from backend
  const acceptRequest = async (e, notif) => {
    e.stopPropagation();
    try {
      const reqsRes = await API.get(`/api/projects/${notif.projectId}/requests`);
      const req = reqsRes.data.find(r => r.userId === notif.actorId);
      if (!req) { alert('Request already handled'); return; }
      await API.post(`/api/projects/requests/${req.id}/accept`);
      await API.delete(`/api/notifications/${notif.id}`);
      setNotifs(prev => prev.filter(n => n.id !== notif.id));
      setCount(c => Math.max(0, c - 1));
    } catch(err) {
      alert(err.response?.data?.error || 'Could not accept');
    }
  };

  // Decline join request — declines + deletes notification from backend
  const declineRequest = async (e, notif) => {
    e.stopPropagation();
    try {
      const reqsRes = await API.get(`/api/projects/${notif.projectId}/requests`);
      const req = reqsRes.data.find(r => r.userId === notif.actorId);
      if (!req) { alert('Request already handled'); return; }
      await API.post(`/api/projects/requests/${req.id}/decline`);
      await API.delete(`/api/notifications/${notif.id}`);
      setNotifs(prev => prev.filter(n => n.id !== notif.id));
      setCount(c => Math.max(0, c - 1));
    } catch(err) {
      alert(err.response?.data?.error || 'Could not decline');
    }
  };

  const handleNotifClick = async (notif) => {
    await markRead(notif);
    if (notif.projectId) {
      navigate(notif.type === 'JOIN_REQUEST'
        ? `/projects/${notif.projectId}?tab=requests`
        : `/projects/${notif.projectId}`);
    }
    setOpen(false);
  };

  const timeAgo = (dt) => {
    if (!dt) return '';
    const diff = Date.now() - new Date(dt).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const getIcon = (type) => {
    if (type === 'JOIN_REQUEST')     return '👋';
    if (type === 'MESSAGE')          return '💬';
    if (type === 'REQUEST_ACCEPTED') return '✅';
    return '🔔';
  };

  // Theme
  const dropBg    = isDark ? '#0e1420' : '#ffffff';
  const dropBord  = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
  const divider   = isDark ? 'rgba(255,255,255,0.07)'  : 'rgba(0,0,0,0.06)';
  const textPri   = isDark ? '#f1f5f9' : '#0f172a';
  const textMuted = isDark ? '#64748b' : '#94a3b8';
  const unreadBg  = isDark ? 'rgba(37,99,235,0.07)' : 'rgba(37,99,235,0.04)';
  const hoverBg   = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const navBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const btnBg     = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';

  return (
    <div ref={bellRef} style={{ position:'relative' }}>

      {/* Bell button */}
      <button onClick={handleOpen}
        style={{ position:'relative',background:btnBg,border:`1px solid ${navBorder}`,borderRadius:8,width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:textMuted,transition:'all .15s' }}
        onMouseEnter={e=>{ e.currentTarget.style.background=isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.06)'; e.currentTarget.style.color=textPri; }}
        onMouseLeave={e=>{ e.currentTarget.style.background=btnBg; e.currentTarget.style.color=textMuted; }}>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {count > 0 && (
          <span style={{ position:'absolute',top:-4,right:-4,background:'#ef4444',color:'#fff',borderRadius:99,minWidth:16,height:16,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,padding:'0 3px',fontFamily:"'DM Mono',monospace",border:`2px solid ${isDark?'#070a0f':'#f8fafc'}` }}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{ position:'absolute',right:0,top:46,width:360,background:dropBg,border:`1px solid ${dropBord}`,borderRadius:12,boxShadow:'0 20px 60px rgba(0,0,0,0.25)',zIndex:300,overflow:'hidden' }}>

          {/* Header */}
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',borderBottom:`1px solid ${divider}` }}>
            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
              <span style={{ fontWeight:700,fontSize:14,color:textPri }}>Notifications</span>
              {count > 0 && <span style={{ background:'rgba(37,99,235,0.15)',color:'#3b82f6',borderRadius:99,padding:'1px 8px',fontSize:11,fontWeight:700,fontFamily:"'DM Mono',monospace" }}>{count} new</span>}
            </div>
            {count > 0 && (
              <button onClick={markAllRead}
                style={{ background:'none',border:'none',color:'#3b82f6',fontSize:12,fontWeight:600,cursor:'pointer',transition:'opacity .15s' }}
                onMouseEnter={e=>e.currentTarget.style.opacity='.7'}
                onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight:420,overflowY:'auto' }}>
            {loading && <div style={{ padding:'32px 0',textAlign:'center',color:textMuted,fontSize:13 }}>Loading…</div>}

            {!loading && notifs.length === 0 && (
              <div style={{ padding:'44px 16px',textAlign:'center' }}>
                <div style={{ fontSize:36,marginBottom:10 }}>🔔</div>
                <p style={{ color:textMuted,fontSize:13,fontWeight:500 }}>You're all caught up</p>
              </div>
            )}

            {!loading && notifs.map(n => (
              <div key={n.id} style={{ borderBottom:`1px solid ${divider}`,background:!n.isRead?unreadBg:'transparent' }}>

                {/* Notification row */}
                <div onClick={()=>handleNotifClick(n)}
                  style={{ display:'flex',alignItems:'flex-start',gap:12,padding:'12px 16px 8px',cursor:'pointer',position:'relative',transition:'background .15s' }}
                  onMouseEnter={e=>e.currentTarget.style.background=hoverBg}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>

                  <div style={{ width:36,height:36,borderRadius:10,background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0,marginTop:1 }}>
                    {getIcon(n.type)}
                  </div>

                  <div style={{ flex:1,minWidth:0 }}>
                    <p style={{ fontSize:13,color:textPri,lineHeight:1.5,margin:0,fontWeight:n.isRead?400:600 }}>{n.message}</p>
                    <div style={{ display:'flex',alignItems:'center',gap:8,marginTop:3 }}>
                      {n.projectName && <span style={{ fontSize:11,color:'#3b82f6',fontWeight:600 }}>{n.projectName}</span>}
                      <span style={{ fontSize:11,color:textMuted }}>{timeAgo(n.createdAt)}</span>
                    </div>
                  </div>

                  <div style={{ display:'flex',alignItems:'center',gap:6,flexShrink:0 }}>
                    {!n.isRead && <div style={{ width:7,height:7,borderRadius:'50%',background:'#3b82f6' }}/>}
                    <button onClick={e=>deleteNotif(e,n.id)}
                      style={{ background:'none',border:'none',color:textMuted,fontSize:16,cursor:'pointer',lineHeight:1,padding:'0 2px',opacity:.5,transition:'opacity .15s' }}
                      onMouseEnter={e=>e.currentTarget.style.opacity='1'}
                      onMouseLeave={e=>e.currentTarget.style.opacity='.5'}>×</button>
                  </div>
                </div>

                {/* Accept / Decline — only for join requests */}
                {n.type === 'JOIN_REQUEST' && (
                  <div style={{ display:'flex',gap:8,padding:'0 16px 12px 64px' }}>
                    <button onClick={e=>acceptRequest(e,n)}
                      style={{ flex:1,background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:6,color:'#34d399',fontSize:12,fontWeight:700,padding:'6px 0',cursor:'pointer',transition:'all .15s',fontFamily:"'DM Sans',sans-serif" }}
                      onMouseEnter={e=>{ e.currentTarget.style.background='rgba(16,185,129,0.22)'; e.currentTarget.style.transform='translateY(-1px)'; }}
                      onMouseLeave={e=>{ e.currentTarget.style.background='rgba(16,185,129,0.12)'; e.currentTarget.style.transform='none'; }}>
                      ✓ Accept
                    </button>
                    <button onClick={e=>declineRequest(e,n)}
                      style={{ flex:1,background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:6,color:'#f87171',fontSize:12,fontWeight:700,padding:'6px 0',cursor:'pointer',transition:'all .15s',fontFamily:"'DM Sans',sans-serif" }}
                      onMouseEnter={e=>{ e.currentTarget.style.background='rgba(239,68,68,0.18)'; e.currentTarget.style.transform='translateY(-1px)'; }}
                      onMouseLeave={e=>{ e.currentTarget.style.background='rgba(239,68,68,0.08)'; e.currentTarget.style.transform='none'; }}>
                      ✗ Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
