import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api/axios';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';

const AV_COLORS = ['#2563eb','#7c3aed','#059669','#dc2626','#d97706','#0891b2'];

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dotRef    = useRef(null);
  const drawerRef = useRef(null);
  const { isDark, toggleTheme } = useTheme();

  const [dotMenu,     setDotMenu]     = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [user,        setUser]        = useState(null);
  const [search,      setSearch]      = useState('');

  useEffect(() => {
    const id = localStorage.getItem('userId');
    if (id) API.get('/api/users/' + id).then(r => setUser(r.data)).catch(() => {});
  }, [location.pathname]);

  // Close dot menu on outside click
  useEffect(() => {
    const h = (e) => {
      if (dotRef.current && !dotRef.current.contains(e.target)) setDotMenu(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Close mobile drawer on outside click
  useEffect(() => {
    const h = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) setMobileOpen(false);
    };
    if (mobileOpen) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [mobileOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate('/?search=' + encodeURIComponent(search.trim()));
    else navigate('/');
    setMobileOpen(false);
  };

  const logout = () => { localStorage.clear(); navigate('/login'); };

  const userId          = localStorage.getItem('userId');
  const initials        = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const color           = AV_COLORS[(parseInt(userId) || 0) % AV_COLORS.length];
  const isActive        = (path) => location.pathname === path;
  const profileImageUrl = user?.profileImageUrl;

  // Theme tokens
  const navBg      = isDark ? 'rgba(7,10,15,0.95)'       : 'rgba(248,250,252,0.97)';
  const navBorder  = isDark ? 'rgba(255,255,255,0.07)'    : 'rgba(0,0,0,0.08)';
  const textColor  = isDark ? '#f1f5f9'                   : '#0f172a';
  const mutedColor = isDark ? '#64748b'                   : '#94a3b8';
  const dropBg     = isDark ? '#0e1420'                   : '#ffffff';
  const dropBorder = isDark ? 'rgba(255,255,255,0.12)'    : 'rgba(0,0,0,0.1)';
  const menuHover  = isDark ? 'rgba(255,255,255,0.05)'    : 'rgba(0,0,0,0.04)';
  const divider    = isDark ? 'rgba(255,255,255,0.07)'    : 'rgba(0,0,0,0.07)';
  const drawerBg   = isDark ? '#0a0d14'                   : '#ffffff';

  const navLink = (path, label, onClick) => (
    <button key={path} onClick={onClick || (() => navigate(path))}
      style={{
        background: isActive(path) ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)') : 'transparent',
        border: 'none',
        color: isActive(path) ? textColor : mutedColor,
        fontSize: 13, fontWeight: 500, cursor: 'pointer',
        padding: '5px 11px', borderRadius: 5, transition: 'all .14s',
      }}
      onMouseEnter={e => {
        if (!isActive(path)) {
          e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
          e.currentTarget.style.color = textColor;
        }
      }}
      onMouseLeave={e => {
        if (!isActive(path)) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = mutedColor;
        }
      }}>
      {label}
    </button>
  );

  return (
    <>
      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        height: 54, background: navBg, backdropFilter: 'blur(20px)',
        borderBottom: '1px solid ' + navBorder,
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10,
      }}>

        {/* Logo */}
        <div onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0, transition: 'opacity .15s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '.75'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          <div style={{
            width: 22, height: 22, background: 'linear-gradient(135deg,#2563eb,#3b82f6)',
            borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, color: '#fff', fontWeight: 700, fontFamily: "'DM Mono',monospace",
          }}>T</div>
          <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 500, fontSize: 14, color: textColor, letterSpacing: '-.5px' }}>
            DevConnect
          </span>
        </div>

        {/* ── Desktop nav links ── */}
        <div className="dc-desktop-only" style={{ display: 'flex', gap: 2 }}>
          {[['/', 'Home'], ['/my-projects', 'Projects'], ['/people', 'People']].map(([path, label]) =>
            navLink(path, label)
          )}
        </div>

        {/* ── Desktop search ── */}
        <div className="dc-desktop-only" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <form onSubmit={handleSearch} style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
            <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: .38, pointerEvents: 'none' }}
              width={13} height={13} viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke={isDark ? '#fff' : '#000'} strokeWidth="1.8"/>
              <path d="M14 14l4 4" stroke={isDark ? '#fff' : '#000'} strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects or skills…"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                border: '1px solid ' + navBorder, borderRadius: 6, color: textColor,
                fontSize: 13, padding: '6px 12px 6px 30px', width: '100%', outline: 'none',
              }}/>
          </form>
        </div>

        {/* ── Desktop right actions ── */}
        <div className="dc-desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button onClick={() => navigate('/my-projects?create=true')}
            style={{ background: 'linear-gradient(135deg,#2563eb,#3b82f6)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 600, transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '.85'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}>
            + New Project
          </button>

          <NotificationBell />

          {/* Avatar dropdown */}
          <div ref={dotRef} style={{ position: 'relative' }}>
            <div onClick={() => setDotMenu(d => !d)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                padding: '3px 7px', borderRadius: 7, border: '1px solid ' + navBorder,
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
              }}>
              {profileImageUrl
                ? <img src={profileImageUrl} alt="avatar" style={{ width: 26, height: 26, borderRadius: 7, objectFit: 'cover' }} onError={e => e.target.style.display = 'none'}/>
                : <div style={{ width: 26, height: 26, borderRadius: 7, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', fontFamily: "'DM Mono',monospace" }}>{initials}</div>
              }
              <svg width={10} height={10} viewBox="0 0 20 20" fill="none">
                <path d="M5 8l5 5 5-5" stroke={mutedColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {dotMenu && (
              <div style={{
                position: 'absolute', right: 0, top: 42, background: dropBg,
                border: '1px solid ' + dropBorder, borderRadius: 10, padding: 8,
                minWidth: 200, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', zIndex: 300,
              }}>
                <div style={{ padding: '8px 13px 12px', borderBottom: '1px solid ' + divider, marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {profileImageUrl
                      ? <img src={profileImageUrl} alt="avatar" style={{ width: 32, height: 32, borderRadius: 9, objectFit: 'cover' }}/>
                      : <div style={{ width: 32, height: 32, borderRadius: 9, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>{initials}</div>
                    }
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: textColor }}>{user?.name || 'User'}</div>
                      <div style={{ color: mutedColor, fontSize: 11 }}>{user?.email}</div>
                    </div>
                  </div>
                </div>

                {[
                  ['👤', 'My Profile',  () => { navigate('/profile/' + userId); setDotMenu(false); }],
                  ['🗂', 'My Projects', () => { navigate('/my-projects');         setDotMenu(false); }],
                  ['✦',  'New Project', () => { navigate('/my-projects?create=true'); setDotMenu(false); }],
                ].map(([icon, label, fn]) => (
                  <div key={label} onClick={fn}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 13px', borderRadius: 7, cursor: 'pointer', color: isDark ? '#94a3b8' : '#475569', fontSize: 13, fontWeight: 500 }}
                    onMouseEnter={e => e.currentTarget.style.background = menuHover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <span>{icon}</span>{label}
                  </div>
                ))}

                <div style={{ height: 1, background: divider, margin: '6px 0' }}/>

                <div onClick={toggleTheme}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 13px', borderRadius: 7, cursor: 'pointer', color: isDark ? '#94a3b8' : '#475569', fontSize: 13, fontWeight: 500 }}
                  onMouseEnter={e => e.currentTarget.style.background = menuHover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span>{isDark ? '☀️' : '🌙'}</span>
                    <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                  </div>
                  <div style={{ width: 34, height: 18, background: isDark ? '#2563eb' : '#e2e8f0', borderRadius: 99, position: 'relative', transition: 'background .2s' }}>
                    <div style={{ position: 'absolute', top: 2, left: isDark ? 16 : 2, width: 14, height: 14, background: '#fff', borderRadius: '50%', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
                  </div>
                </div>

                <div style={{ height: 1, background: divider, margin: '6px 0' }}/>

                <div onClick={logout}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 13px', borderRadius: 7, cursor: 'pointer', color: '#f87171', fontSize: 13, fontWeight: 500 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span>→</span> Sign Out
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Mobile right: bell + hamburger ── */}
        <div className="dc-mobile-only" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <NotificationBell />
          <button onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
            style={{
              background: 'transparent', border: '1px solid ' + navBorder,
              borderRadius: 7, width: 36, height: 36, cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}>
            {/* Animated hamburger → X */}
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: 'block', width: 16, height: 1.5, background: textColor, borderRadius: 2,
                transition: 'all .22s',
                ...(mobileOpen && i === 0 ? { transform: 'translateY(5.5px) rotate(45deg)' } : {}),
                ...(mobileOpen && i === 1 ? { opacity: 0, transform: 'scaleX(0)' } : {}),
                ...(mobileOpen && i === 2 ? { transform: 'translateY(-5.5px) rotate(-45deg)' } : {}),
              }}/>
            ))}
          </button>
        </div>
      </nav>

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div className="dc-mobile-only"
          style={{ position: 'fixed', inset: 0, zIndex: 198, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <div ref={drawerRef} className="dc-mobile-only"
        style={{
          position: 'fixed', top: 54, left: 0, right: 0, zIndex: 199,
          background: drawerBg, borderBottom: '1px solid ' + navBorder,
          padding: '12px 16px 20px',
          transform: mobileOpen ? 'translateY(0)' : 'translateY(-110%)',
          transition: 'transform .28s cubic-bezier(.4,0,.2,1)',
          boxShadow: mobileOpen ? '0 16px 48px rgba(0,0,0,0.25)' : 'none',
        }}>

        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', marginBottom: 8, borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>
          {profileImageUrl
            ? <img src={profileImageUrl} alt="avatar" style={{ width: 36, height: 36, borderRadius: 9, objectFit: 'cover' }}/>
            : <div style={{ width: 36, height: 36, borderRadius: 9, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials}</div>
          }
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: textColor }}>{user?.name || 'User'}</div>
            <div style={{ color: mutedColor, fontSize: 11 }}>{user?.email}</div>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ position: 'relative', marginBottom: 10 }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: .38, pointerEvents: 'none' }}
            width={13} height={13} viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke={isDark ? '#fff' : '#000'} strokeWidth="1.8"/>
            <path d="M14 14l4 4" stroke={isDark ? '#fff' : '#000'} strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects or skills…"
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              border: '1px solid ' + navBorder, borderRadius: 8, color: textColor,
              fontSize: 14, padding: '9px 12px 9px 32px', width: '100%', outline: 'none', boxSizing: 'border-box',
            }}/>
        </form>

        {/* Nav links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
          {[['/', 'Home', '🏠'], ['/my-projects', 'Projects', '🗂'], ['/people', 'People', '👥']].map(([path, label, icon]) => (
            <div key={path} onClick={() => { navigate(path); setMobileOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                background: isActive(path) ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(37,99,235,0.07)') : 'transparent',
                color: isActive(path) ? textColor : (isDark ? '#94a3b8' : '#475569'),
                fontSize: 14, fontWeight: isActive(path) ? 600 : 500,
                borderLeft: isActive(path) ? '2px solid #3b82f6' : '2px solid transparent',
              }}>
              <span style={{ fontSize: 16 }}>{icon}</span>{label}
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: divider, margin: '6px 0 10px' }}/>

        {/* New Project */}
        <button onClick={() => { navigate('/my-projects?create=true'); setMobileOpen(false); }}
          style={{
            width: '100%', background: 'linear-gradient(135deg,#2563eb,#3b82f6)', color: '#fff',
            border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            marginBottom: 10,
          }}>
          + New Project
        </button>

        {/* Profile shortcut */}
        <div onClick={() => { navigate('/profile/' + userId); setMobileOpen(false); }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', color: isDark ? '#94a3b8' : '#475569', fontSize: 14, fontWeight: 500 }}>
          <span>👤</span> My Profile
        </div>

        <div style={{ height: 1, background: divider, margin: '6px 0' }}/>

        {/* Theme toggle */}
        <div onClick={toggleTheme}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, cursor: 'pointer', color: isDark ? '#94a3b8' : '#475569', fontSize: 14, fontWeight: 500 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>{isDark ? '☀️' : '🌙'}</span>
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
          <div style={{ width: 36, height: 20, background: isDark ? '#2563eb' : '#e2e8f0', borderRadius: 99, position: 'relative', transition: 'background .2s' }}>
            <div style={{ position: 'absolute', top: 3, left: isDark ? 17 : 3, width: 14, height: 14, background: '#fff', borderRadius: '50%', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
          </div>
        </div>

        <div style={{ height: 1, background: divider, margin: '6px 0' }}/>

        {/* Sign out */}
        <div onClick={logout}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', color: '#f87171', fontSize: 14, fontWeight: 500 }}>
          <span>→</span> Sign Out
        </div>
      </div>

      {/* ── Responsive styles ── */}
      <style>{`
        @media (min-width: 641px) {
          .dc-mobile-only { display: none !important; }
        }
        @media (max-width: 640px) {
          .dc-desktop-only { display: none !important; }
        }
      `}</style>
    </>
  );
}
