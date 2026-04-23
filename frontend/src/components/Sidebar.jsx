
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import {
  Home, Search, Calendar, FileText,
  User, LogOut, CreditCard, Video,
  CalendarDays, Stethoscope, CreditCard as PayIcon,
  Users, LayoutDashboard, ShieldCheck, Pill
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Sidebar = ({ isPatient, isDoctor, isAdmin }) => {
  const location = useLocation()
  const { user, logout } = useAuth()
  const isActive = (path) => location.pathname === path ||
    (path !== '/admin' && location.pathname.startsWith(path))

  const patientLinks = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'Find Doctors', icon: Search, path: '/search' },
    { name: 'My Appointments', icon: Calendar, path: '/appointments' },
    { name: 'Telemedicine', icon: Video, path: '/telemedicine' },
    { name: 'Medical Reports', icon: FileText, path: '/reports' },
    { name: 'Prescriptions', icon: Pill, path: '/prescriptions' },
    { name: 'Payments', icon: CreditCard, path: '/payments' },
    { name: 'Profile', icon: User, path: '/profile' },
  ]

  const doctorLinks = [
    { name: 'Medical Hub', icon: Home, path: '/doctor/dashboard' },
    { name: 'Clinical Sessions', icon: CalendarDays, path: '/doctor/availability' },
    { name: 'Consultations', icon: Calendar, path: '/doctor/dashboard' },
    { name: 'Telemedicine', icon: Video, path: '/telemedicine' },
    { name: 'Prescriptions', icon: Pill, path: '/doctor/prescriptions' },
    { name: 'Patient Files', icon: FileText, path: '/doctor/records' },
    { name: 'Settings', icon: User, path: '/doctor/profile' },
  ]

  const adminLinks = [
    { name: 'Control Panel', icon: Home, path: '/admin' },
    { name: 'Doctors', icon: Stethoscope, path: '/admin/doctors' },
    { name: 'Patients', icon: User, path: '/admin/patients' },
    // ✅ Payment Approvals link
    { name: 'Payment Approvals', icon: CreditCard, path: '/admin/payments' },
    { name: 'Admins', icon: ShieldCheck, path: '/admin/admins' },
    { name: 'Profile', icon: User, path: '/admin/profile' },
  ]

  const links = isPatient ? patientLinks : isDoctor ? doctorLinks : adminLinks

  return (
    <div className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 min-h-screen sticky top-0 font-inter">
      {/* Header */}
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-gradient-to-tr from-medigo-blue to-medigo-teal rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Stethoscope size={18} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-medigo-navy">
            Medi<span className="text-medigo-blue">Go</span>
          </span>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 space-y-1">
        {links.map(link => (
          <Link
            key={link.name}
            to={link.path}
            className={`flex items-center justify-between group px-4 py-3 rounded-2xl text-[14px] font-bold transition-all duration-200 ${isActive(link.path)
              ? 'bg-blue-50 text-medigo-blue shadow-sm'
              : 'text-slate-500 hover:bg-slate-50 hover:text-medigo-navy'
              }`}
          >
            <div className="flex items-center gap-3">
              <link.icon
                size={18}
                className={`transition-colors ${isActive(link.path)
                  ? 'text-medigo-blue'
                  : 'text-slate-400 group-hover:text-medigo-navy'
                  }`}
              />
              {link.name}
            </div>
            {isActive(link.path) && (
              <motion.div
                layoutId="activeInd"
                className="w-1.5 h-1.5 rounded-full bg-medigo-blue"
              />
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 mt-auto">
        <div className="bg-slate-50 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-black text-medigo-blue text-xs shadow-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[13px] font-bold text-medigo-navy truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user?.role}</p>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all duration-200"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  )
}

export default Sidebar