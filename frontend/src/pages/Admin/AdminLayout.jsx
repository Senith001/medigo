import React from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard, Users, Stethoscope,
  CreditCard, ShieldCheck, LogOut,
  Bell, Search, Settings, User
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin-login')
  }

  const navLinks = [
    { to: '/admin', end: true, icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/doctors', icon: Stethoscope, label: 'Doctors' },
    { to: '/admin/patients', icon: Users, label: 'Patients' },
    // ✅ Payment Approvals link add
    { to: '/admin/payments', icon: CreditCard, label: 'Payment Approvals' },
    { to: '/admin/profile', icon: User, label: 'Profile' },
  ]

  // ✅ superadmin only
  const superAdminLinks = [
    { to: '/admin/admins', icon: ShieldCheck, label: 'Admins' },
  ]

  return (
    <div className="flex min-h-screen bg-slate-100 font-inter">

      {/* ── Sidebar ── */}
      <div className="w-[220px] shrink-0 bg-white border-r border-slate-100 flex flex-col sticky top-0 h-screen">
        {/* Brand */}
        <div className="p-6 border-b border-slate-50">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-medigo-blue rounded-lg flex items-center justify-center text-white font-black text-xs shadow">
              M
            </div>
            <span className="text-lg font-black tracking-tighter text-medigo-navy">
              Medi<span className="text-medigo-blue">Go</span>
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${isActive
                  ? 'bg-medigo-navy text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-medigo-navy'
                }`
              }
            >
              <link.icon size={17} />
              {link.label}
            </NavLink>
          ))}

          {/* Superadmin only */}
          {user?.role === 'superadmin' && (
            <>
              <div className="pt-4 pb-1 px-4">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  Super Admin
                </p>
              </div>
              {superAdminLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${isActive
                      ? 'bg-medigo-navy text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-medigo-navy'
                    }`
                  }
                >
                  <link.icon size={17} />
                  {link.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-50 space-y-3">
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-medigo-blue text-white flex items-center justify-center text-xs font-black shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-medigo-navy truncate leading-none">
                {user?.name}
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                {user?.role === 'superadmin' ? 'Super Admin' : 'Admin'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-100 sticky top-0 z-30 flex items-center justify-between px-6">
          <div className="flex items-center gap-3 flex-1 max-w-sm">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-transparent outline-none text-sm font-medium text-medigo-navy placeholder:text-slate-300"
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-medigo-blue transition-colors">
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <Link
              to="/admin/profile"
              className="flex items-center gap-2 bg-medigo-navy text-white px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-medigo-blue flex items-center justify-center text-[10px] font-black">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-black leading-none">{user?.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {user?.role === 'superadmin' ? 'System Super Admin' : 'System Admin'}
                </p>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}