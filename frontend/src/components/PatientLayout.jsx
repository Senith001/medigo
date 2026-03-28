import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, User, Search, Calendar, FileText, CreditCard, LogOut, Activity } from 'lucide-react'
import './Layout.css'

const navItems = [
  { to: '/patient/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/patient/doctors', icon: Search, label: 'Find Doctors' },
  { to: '/patient/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/patient/reports', icon: FileText, label: 'Reports' },
  { to: '/patient/payments', icon: CreditCard, label: 'Payments' },
  { to: '/patient/profile', icon: User, label: 'Profile' },
]

export default function PatientLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Activity size={22} className="logo-icon" />
          <span>MEDIGO</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{user?.fullName?.[0] || 'P'}</div>
            <div className="user-info">
              <div className="user-name">{user?.fullName}</div>
              <div className="user-role">Patient</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}><LogOut size={16} /></button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
