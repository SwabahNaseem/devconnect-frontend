import React, { useState } from 'react';

// ── All skill categories with their colors ──────────────────
export const SKILL_CATEGORIES = [
  {
    label: 'Frontend',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.12)',
    border: 'rgba(59,130,246,0.35)',
    skills: [
      'React','Vue','Angular','Next.js','TypeScript','JavaScript',
      'HTML/CSS','Figma','UI/UX','Tailwind','Sass'
    ]
  },
  {
    label: 'Backend',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.35)',
    skills: [
      'Node.js','Express','Spring Boot','Django','FastAPI',
      'Flask','Laravel','GraphQL','REST API'
    ]
  },
  {
    label: 'Mobile',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.35)',
    skills: [
      'Flutter','React Native','Swift','Kotlin','Android','iOS','Dart'
    ]
  },
  {
    label: 'Languages',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)',
    border: 'rgba(139,92,246,0.35)',
    skills: [
      'Python','Java','Go','Rust','C++','C#','PHP','Ruby','TypeScript','JavaScript'
    ]
  },
  {
    label: 'Data & AI',
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.12)',
    border: 'rgba(236,72,153,0.35)',
    skills: [
      'Machine Learning','Data Science','TensorFlow','PyTorch',
      'Data Analysis','SQL','NLP'
    ]
  },
  {
    label: 'DevOps',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.12)',
    border: 'rgba(6,182,212,0.35)',
    skills: [
      'Docker','Kubernetes','AWS','GCP','Azure','DevOps','CI/CD','Linux','Terraform'
    ]
  },
  {
    label: 'Database',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.12)',
    border: 'rgba(249,115,22,0.35)',
    skills: [
      'MySQL','PostgreSQL','MongoDB','Redis','Firebase','SQLite','Supabase'
    ]
  },
  {
    label: 'Other',
    color: '#64748b',
    bg: 'rgba(100,116,139,0.12)',
    border: 'rgba(100,116,139,0.35)',
    skills: [
      'Blockchain','AR/VR','Game Dev','Cybersecurity','Photoshop','Illustrator'
    ]
  }
];

// Get color info for any skill name
export function getSkillMeta(skillName) {
  for (const cat of SKILL_CATEGORIES) {
    if (cat.skills.includes(skillName)) return cat;
  }
  // Default gray for custom skills
  return {
    color: '#94a3b8',
    bg: 'rgba(148,163,184,0.1)',
    border: 'rgba(148,163,184,0.3)',
    label: 'Custom'
  };
}

/**
 * SkillChip — a colored chip for a skill.
 * Color is determined by which category the skill belongs to.
 *
 * Props:
 *   skill      — skill name string
 *   onRemove   — if provided shows × and calls this on click
 *   size       — 'sm' | 'md' (default md)
 *   onClick    — optional click handler
 *   selected   — boolean, highlights chip
 */
export default function SkillChip({ skill, onRemove, size='md', onClick, selected }) {
  const [hovered, setHovered] = useState(false);
  const meta = getSkillMeta(skill);

  const active = selected || hovered || !!onRemove;

  // Default (inactive) chip colors
  const defaultBg     = 'rgba(128,128,128,0.08)';
  const defaultBorder = 'rgba(128,128,128,0.2)';
  const defaultColor  = '#94a3b8';

  const bg     = active ? meta.bg     : defaultBg;
  const border = active ? meta.border : defaultBorder;
  const color  = active ? meta.color  : defaultColor;

  const pad   = size === 'sm' ? '2px 8px'  : '4px 11px';
  const fsize = size === 'sm' ? 10 : 11;

  return (
    <span
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:'inline-flex', alignItems:'center', gap:4,
        background:bg, border:`1px solid ${border}`,
        borderRadius:5, padding:pad, fontSize:fsize,
        fontWeight:600, color,
        cursor: onClick||onRemove ? 'pointer' : 'default',
        fontFamily:"'DM Mono',monospace",
        transition:'all .15s ease',
        userSelect:'none',
        whiteSpace:'nowrap',
        transform: hovered && (onClick||onRemove) ? 'translateY(-1px)' : 'none',
        boxShadow: hovered && (onClick||onRemove) && active ? `0 2px 8px ${meta.bg}` : 'none',
      }}>
      {skill}
      {onRemove && (
        <span
          onClick={e => { e.stopPropagation(); onRemove(); }}
          style={{ opacity:.7, fontSize:12, lineHeight:1, marginLeft:1 }}>
          ×
        </span>
      )}
    </span>
  );
}