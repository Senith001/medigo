import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const CrossIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white">
    <rect x="11" y="3" width="2" height="18"/><rect x="3" y="11" width="18" height="2"/>
  </svg>
)

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isActive = (p) => location.pathname.startsWith(p)

  const navLinks = {
    patient: [
      { to: '/patient', label: 'Dashboard' },
      { to: '/search', label: 'Find Doctors' },
      { to: '/patient/appointments', label: 'Appointments' },
      { to: '/patient/reports', label: 'My Reports' },
    ],
    doctor: [
      { to: '/doctor', label: 'Dashboard' },
      { to: '/doctor/appointments', label: 'Appointments' },
      { to: '/doctor/prescriptions', label: 'Prescriptions' },
      { to: '/doctor/availability', label: 'Availability' },
    ],
    admin: [
      { to: '/admin', label: 'Dashboard' },
      { to: '/admin/doctors', label: 'Doctors' },
      { to: '/admin/appointments', label: 'Appointments' },
      { to: '/admin/patients', label: 'Patients' },
      { to: '/admin/admins', label: 'Admins' },
    ],
  }

  const links = user ? (navLinks[user.role] || []) : []

  return (
    <nav className="bg-navy sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 bg-teal rounded-lg flex items-center justify-center">
            <CrossIcon />
          </div>
          <span className="font-display font-extrabold text-xl text-white">
            MEDI<span className="text-teal-light">GO</span>
          </span>
        </Link>

        {/* Nav links */}
        {user && (
          <div className="flex items-center gap-1 flex-1">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive(link.to)
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/8'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right */}
        <div className="flex items-center gap-3 ml-auto">
          {user ? (
            <>
              {/* Role badge */}
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                user.role === 'patient' ? 'bg-blue-500/20 text-blue-300' :
                user.role === 'doctor'  ? 'bg-emerald-500/20 text-emerald-300' :
                'bg-orange-500/20 text-orange-300'
              }`}>
                {user.role}
              </span>

              {/* User chip */}
              <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1">
                <div className="w-7 h-7 rounded-full bg-teal flex items-center justify-center text-white text-xs font-extrabold">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-white text-sm font-semibold hidden sm:block">{user.name?.split(' ')[0]}</span>
              </div>

              <button
                onClick={() => { logout(); navigate('/') }}
                className="text-white/50 hover:text-white text-sm font-semibold transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white/70 hover:text-white text-sm font-semibold transition-colors">Sign In</Link>
              <Link to="/register" className="btn-primary btn-sm text-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
