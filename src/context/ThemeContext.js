import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Load saved theme from localStorage, default to dark
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  const isDark = theme === 'dark';

  // Save to localStorage whenever theme changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
    // Apply CSS variables to root element
    const root = document.documentElement;
    if (isDark) {
      root.style.setProperty('--bg',      '#070a0f');
      root.style.setProperty('--surf',    '#0c1018');
      root.style.setProperty('--s2',      '#111827');
      root.style.setProperty('--s3',      '#1a2334');
      root.style.setProperty('--border',  'rgba(255,255,255,0.07)');
      root.style.setProperty('--border2', 'rgba(255,255,255,0.13)');
      root.style.setProperty('--text',    '#f1f5f9');
      root.style.setProperty('--muted',   '#64748b');
      root.style.setProperty('--subtle',  '#94a3b8');
      document.body.style.background = '#070a0f';
      document.body.style.color = '#f1f5f9';
    } else {
      // Light mode
      root.style.setProperty('--bg',      '#f8fafc');
      root.style.setProperty('--surf',    '#ffffff');
      root.style.setProperty('--s2',      '#f1f5f9');
      root.style.setProperty('--s3',      '#e2e8f0');
      root.style.setProperty('--border',  'rgba(0,0,0,0.08)');
      root.style.setProperty('--border2', 'rgba(0,0,0,0.15)');
      root.style.setProperty('--text',    '#0f172a');
      root.style.setProperty('--muted',   '#94a3b8');
      root.style.setProperty('--subtle',  '#475569');
      document.body.style.background = '#f8fafc';
      document.body.style.color = '#0f172a';
    }
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);