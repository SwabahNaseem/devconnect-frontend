import React, { useEffect, useState } from 'react';
import { getMatchScore } from '../api/claude';

export default function AIMatchPanel({ currentUser, project }) {
  const [match,    setMatch]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (!currentUser || !project) return;
    setLoading(true);
    getMatchScore(currentUser, project)
      .then(r => setMatch(r))
      .finally(() => setLoading(false));
  }, [currentUser?.id, project?.id]);

  const scoreColor  = !match ? '#64748b' : match.score>=80 ? '#10b981' : match.score>=60 ? '#f59e0b' : match.score>=40 ? '#3b82f6' : '#64748b';
  const scoreBg     = !match ? 'rgba(100,116,139,0.08)' : match.score>=80 ? 'rgba(16,185,129,0.08)' : match.score>=60 ? 'rgba(245,158,11,0.08)' : match.score>=40 ? 'rgba(37,99,235,0.08)' : 'rgba(100,116,139,0.08)';
  const scoreBorder = !match ? 'rgba(100,116,139,0.2)'  : match.score>=80 ? 'rgba(16,185,129,0.25)' : match.score>=60 ? 'rgba(245,158,11,0.25)' : match.score>=40 ? 'rgba(37,99,235,0.25)' : 'rgba(100,116,139,0.2)';

  return (
    <div style={{ background:'#0c1018',border:`1px solid ${scoreBorder}`,borderRadius:10,overflow:'hidden',marginBottom:18 }}>

      {/* ── Header (always visible) ── */}
      <div onClick={() => setExpanded(e => !e)}
        style={{ display:'flex',alignItems:'center',gap:14,padding:'16px 20px',cursor:'pointer',background:scoreBg }}>

        {/* Circular score */}
        <div style={{ position:'relative',width:54,height:54,flexShrink:0 }}>
          <svg width={54} height={54} viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3"/>
            {!loading && match && (
              <circle cx="18" cy="18" r="14" fill="none" stroke={scoreColor} strokeWidth="3"
                strokeDasharray={`${match.score * 0.88} 100`} strokeLinecap="round"
                transform="rotate(-90 18 18)"
                style={{ transition:'stroke-dasharray .6s ease' }}/>
            )}
          </svg>
          <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center' }}>
            {loading
              ? <div style={{ width:6,height:6,borderRadius:'50%',background:'#334155',animation:'pulse 1.2s infinite' }}/>
              : <span style={{ fontSize:12,fontWeight:700,color:scoreColor,fontFamily:"'DM Mono',monospace" }}>{match?.score}</span>
            }
          </div>
        </div>

        <div style={{ flex:1 }}>
          <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:3 }}>
            <span style={{ fontSize:11,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:1,fontFamily:"'DM Mono',monospace" }}>
              AI Match Analysis
            </span>
            <span style={{ fontSize:9,background:'rgba(37,99,235,0.15)',color:'#3b82f6',border:'1px solid rgba(37,99,235,0.3)',borderRadius:3,padding:'1px 6px',fontWeight:700,fontFamily:"'DM Mono',monospace" }}>
              CLAUDE AI
            </span>
          </div>
          {loading
            ? <p style={{ color:'#64748b',fontSize:13 }}>Analyzing your profile against this project…</p>
            : <p style={{ color:scoreColor,fontSize:14,fontWeight:600 }}>{match?.verdict}</p>
          }
        </div>

        <svg style={{ transform:expanded?'rotate(180deg)':'none',transition:'transform .2s',flexShrink:0 }}
          width={16} height={16} viewBox="0 0 20 20" fill="none">
          <path d="M5 8l5 5 5-5" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* ── Expanded details ── */}
      {expanded && !loading && match && (
        <div style={{ padding:'0 20px 20px',borderTop:`1px solid ${scoreBorder}` }}>

          {/* Summary */}
          <p style={{ color:'#94a3b8',fontSize:13,lineHeight:1.75,margin:'16px 0 14px' }}>{match.summary}</p>

          {/* Skills grid */}
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14 }}>
            {/* Matched */}
            <div style={{ background:'rgba(16,185,129,0.06)',border:'1px solid rgba(16,185,129,0.15)',borderRadius:8,padding:12 }}>
              <p style={{ fontSize:10,fontWeight:700,color:'#10b981',textTransform:'uppercase',letterSpacing:1,marginBottom:8,fontFamily:"'DM Mono',monospace" }}>
                ✓ You Have
              </p>
              {match.matchedSkills?.length === 0
                ? <p style={{ color:'#64748b',fontSize:12 }}>No matching skills yet</p>
                : <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
                    {match.matchedSkills.map(s => (
                      <span key={s} style={{ background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.25)',borderRadius:4,padding:'2px 8px',fontSize:11,fontWeight:600,color:'#34d399',fontFamily:"'DM Mono',monospace" }}>
                        {s}
                      </span>
                    ))}
                  </div>
              }
            </div>

            {/* Missing */}
            <div style={{ background:'rgba(239,68,68,0.05)',border:'1px solid rgba(239,68,68,0.12)',borderRadius:8,padding:12 }}>
              <p style={{ fontSize:10,fontWeight:700,color:'#f87171',textTransform:'uppercase',letterSpacing:1,marginBottom:8,fontFamily:"'DM Mono',monospace" }}>
                ✗ You Need
              </p>
              {match.missingSkills?.length === 0
                ? <p style={{ color:'#64748b',fontSize:12 }}>No missing skills 🎉</p>
                : <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
                    {match.missingSkills.map(s => (
                      <span key={s} style={{ background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:4,padding:'2px 8px',fontSize:11,fontWeight:600,color:'#f87171',fontFamily:"'DM Mono',monospace" }}>
                        {s}
                      </span>
                    ))}
                  </div>
              }
            </div>
          </div>

          {/* Score bar */}
          <div style={{ marginBottom:14 }}>
            <div style={{ display:'flex',justifyContent:'space-between',marginBottom:5 }}>
              <span style={{ fontSize:11,color:'#64748b',fontFamily:"'DM Mono',monospace" }}>Match Strength</span>
              <span style={{ fontSize:11,fontWeight:700,color:scoreColor,fontFamily:"'DM Mono',monospace" }}>{match.score}%</span>
            </div>
            <div style={{ height:5,background:'rgba(255,255,255,0.06)',borderRadius:99,overflow:'hidden' }}>
              <div style={{ height:'100%',width:`${match.score}%`,background:`linear-gradient(90deg,${scoreColor}88,${scoreColor})`,borderRadius:99,transition:'width .6s ease' }}/>
            </div>
          </div>

          {/* Recommendation */}
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',background:'rgba(255,255,255,0.03)',borderRadius:7,border:'1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <span style={{ fontSize:10,color:'#64748b',textTransform:'uppercase',letterSpacing:1,fontFamily:"'DM Mono',monospace" }}>
                AI Recommendation
              </span>
              <p style={{ fontSize:13,fontWeight:600,color:'#f1f5f9',marginTop:2 }}>{match.recommendation}</p>
            </div>
            <span style={{ fontSize:22 }}>
              {match.score>=80?'🚀':match.score>=60?'👍':match.score>=40?'🤔':'📚'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
