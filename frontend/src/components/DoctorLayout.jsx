import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, User, Calendar, Clock, FileText, LogOut, Activity } from 'lucide-react'
import './Layout.css'

const navItems = [
  { to: '/doctor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/doctor/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/doctor/prescriptions', icon: FileText, label: 'Prescriptions' },
  { to: '/doctor/availability', icon: Clock, label: 'Availability' },
  { to: '/doctor/profile', icon: User, label: 'Profile' },
]

export default function DoctorLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="layout">
      <aside className="sidebar sidebar-teal">
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
            <div className="user-avatar">{user?.fullName?.[0] || 'D'}</div>
            <div className="user-info">
              <div className="user-name">{user?.fullName}</div>
              <div className="user-role">Doctor</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}><LogOut size={16} /></button>
        </div>
      </aside>
      <main className="main-content"><Outlet /></main>
    </div>
  )
}
