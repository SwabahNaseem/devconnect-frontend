import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Home          from './pages/Home';
import MyProjects    from './pages/MyProjects';
import ProjectDetail from './pages/ProjectDetail';
import Profile       from './pages/Profile';
import People        from './pages/People';
import Navbar        from './components/Navbar';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

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
        <Route path="/" element={<PrivateRoute><Layout><Home /></Layout></PrivateRoute>} />
        <Route path="/my-projects" element={<PrivateRoute><Layout><MyProjects /></Layout></PrivateRoute>} />
        <Route path="/projects/:id" element={<PrivateRoute><Layout><ProjectDetail /></Layout></PrivateRoute>} />
        <Route path="/profile/:id" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
        <Route path="/people" element={<PrivateRoute><Layout><People /></Layout></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
