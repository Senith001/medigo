import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, Users, Stethoscope, Calendar, Shield, LogOut, Activity } from 'lucide-react'
import './Layout.css'

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/patients', icon: Users, label: 'Patients' },
  { to: '/admin/doctors', icon: Stethoscope, label: 'Doctors' },
  { to: '/admin/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/admin/manage', icon: Shield, label: 'Admin Users' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="layout">
      <aside className="sidebar sidebar-dark">
        <div className="sidebar-logo">
          <Activity size={22} className="logo-icon" />
          <span>MEDIGO</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{user?.fullName?.[0] || 'A'}</div>
            <div className="user-info">
              <div className="user-name">{user?.fullName}</div>
              <div className="user-role">{user?.role === 'superadmin' ? 'Super Admin' : 'Admin'}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}><LogOut size={16} /></button>
        </div>
      </aside>
      <main className="main-content"><Outlet /></main>
    </div>
  )
}
