import React from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  const navItemStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    margin: '4px 16px',
    borderRadius: '12px',
    backgroundColor: isActive ? '#1a1a1a' : 'transparent',
    color: isActive ? '#ffffff' : '#64748b',
    fontWeight: '600',
    fontSize: '0.95rem',
    textDecoration: 'none',
    transition: 'all 0.2s ease'
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#e2e8f0', backgroundImage: 'linear-gradient(to right, #e2e8f0, #f1f5f9)' }}>
      {/* Sidebar */}
      <div style={{ 
        width: '260px', 
        backgroundColor: '#ffffff', 
        display: 'flex', 
        flexDirection: 'column', 
        borderRight: '1px solid #e2e8f0',
        borderRadius: '0 24px 24px 0',
        boxShadow: '4px 0 10px rgba(0,0,0,0.02)',
        margin: '16px 0 16px 16px'
      }}>
        {/* Brand */}
        <div style={{ padding: '30px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '6px', backgroundColor: '#1a1a1a', borderRadius: '8px', color: 'white' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>♡</span>
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1a1a1a' }}>MediGo</span>
        </div>

        {/* Links */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <NavLink to="/admin" end style={navItemStyle}>
            <span style={{ marginRight: '16px', fontSize: '1.2rem' }}>⊞</span> Dashboard
          </NavLink>
          {user?.role === 'superadmin' && (
            <NavLink to="/admin/admins" style={navItemStyle}>
              <span style={{ marginRight: '16px', fontSize: '1.2rem' }}>🛡️</span> Admins
            </NavLink>
          )}
          <NavLink to="/admin/patients" style={navItemStyle}>
            <span style={{ marginRight: '16px', fontSize: '1.2rem' }}>👥</span> Patients
          </NavLink>
          <NavLink to="/admin/doctors" style={navItemStyle}>
            <span style={{ marginRight: '16px', fontSize: '1.2rem' }}>👨‍⚕️</span> Doctors
          </NavLink>
          <div style={{ padding: '12px 20px', margin: '4px 16px', color: '#64748b', fontWeight: '600', fontSize: '0.95rem', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ marginRight: '16px', fontSize: '1.2rem' }}>📅</span> Appointment
          </div>
          <div style={{ padding: '12px 20px', margin: '4px 16px', color: '#64748b', fontWeight: '600', fontSize: '0.95rem', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ marginRight: '16px', fontSize: '1.2rem' }}>⏱</span> Schedule
          </div>
          <div style={{ padding: '12px 20px', margin: '4px 16px', color: '#64748b', fontWeight: '600', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '16px', fontSize: '1.2rem' }}>💬</span> Chats
            </div>
            <div style={{ backgroundColor: '#1a1a1a', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>2</div>
          </div>
          <div style={{ padding: '12px 20px', margin: '4px 16px', color: '#64748b', fontWeight: '600', fontSize: '0.95rem', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ marginRight: '16px', fontSize: '1.2rem' }}>📄</span> Documents
          </div>
          <div style={{ padding: '12px 20px', margin: '4px 16px', color: '#64748b', fontWeight: '600', fontSize: '0.95rem', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ marginRight: '16px', fontSize: '1.2rem' }}>⚙</span> Setting
          </div>
        </nav>

        {/* Logout */}
        <div style={{ padding: '20px' }}>
          <button onClick={handleLogout} style={{ 
            width: '100%', 
            padding: '12px', 
            borderRadius: '12px', 
            backgroundColor: '#f1f5f9', 
            color: '#1a1a1a', 
            border: 'none', 
            fontWeight: '600', 
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}>
            <span style={{ marginRight: '10px' }}>↪</span> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '16px' }}>
        {/* Header Bar */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px',
          padding: '10px 20px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}>
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', padding: '8px 16px', width: '300px' }}>
            <span style={{ color: '#94a3b8', marginRight: '10px' }}>🔍</span>
            <input type="text" placeholder="Search..." style={{ border: 'none', backgroundColor: 'transparent', outline: 'none', width: '100%', color: '#1e293b' }} />
          </div>

          {/* Right Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f8fafc', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', cursor: 'pointer', color: '#64748b' }}>
              🔔
            </button>
            <button style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f8fafc', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', cursor: 'pointer', color: '#64748b' }}>
              ⚙
            </button>
            <Link 
              to="/admin/profile"
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#1a1a1a', padding: '6px 16px 6px 6px', borderRadius: '99px', color: 'white', cursor: 'pointer', transition: 'all 0.2s ease' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', lineHeight: 1.2 }}>{user?.name || "Admin"}</span>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                  {user?.role === 'superadmin' ? 'System Super Admin' : 'System Admin'}
                </span>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
