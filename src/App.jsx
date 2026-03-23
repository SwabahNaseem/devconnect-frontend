import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Home          from './pages/Home';
import MyProjects    from './pages/MyProjects';
import ProjectDetail from './pages/ProjectDetail';
import Profile       from './pages/Profile';
import People        from './pages/People';
import Navbar        from './components/Navbar';
import API           from './api/axios';

// Validates token against backend on every app load
// If token is stale (user deleted, DB changed, etc.) → clears and redirects to login
function PrivateRoute({ children }) {
  const [status, setStatus] = useState('checking'); // checking | ok | invalid

  useEffect(() => {
    const token  = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      setStatus('invalid');
      return;
    }

    // Verify token is still valid by hitting the backend
    API.get(`/api/users/${userId}`)
      .then(() => setStatus('ok'))
      .catch(() => {
        // Token invalid or user not found — clear and redirect
        localStorage.clear();
        setStatus('invalid');
      });
  }, []);

  if (status === 'checking') {
    // Small loading screen while verifying
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#070a0f' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:40, height:40, background:'linear-gradient(135deg,#2563eb,#3b82f6)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:'#fff', fontWeight:700, margin:'0 auto 16px', fontFamily:"'DM Mono',monospace" }}>T</div>
          <p style={{ color:'#64748b', fontSize:13 }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (status === 'invalid') {
    return <Navigate to="/login" replace />;
  }

  return children;
}

const Layout = ({ children }) => (
  <>
    <Navbar />
    <div style={{ paddingTop: 54 }}>{children}</div>
  </>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={
          <PrivateRoute><Layout><Home /></Layout></PrivateRoute>
        } />
        <Route path="/my-projects" element={
          <PrivateRoute><Layout><MyProjects /></Layout></PrivateRoute>
        } />
        <Route path="/projects/:id" element={
          <PrivateRoute><Layout><ProjectDetail /></Layout></PrivateRoute>
        } />
        <Route path="/profile/:id" element={
          <PrivateRoute><Layout><Profile /></Layout></PrivateRoute>
        } />
        <Route path="/people" element={
          <PrivateRoute><Layout><People /></Layout></PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
