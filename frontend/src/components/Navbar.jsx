import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_LINKS = {
  patient: [
    { to: '/dashboard',    label: 'Home'            },
    { to: '/search',       label: 'Find Doctors'    },
    { to: '/appointments', label: 'My Appointments' },
    { to: '/reports',      label: 'Medical Reports' }
  ],
  doctor: [
    { to: '/doctor',       label: 'Dashboard'       },
    { to: '/appointments', label: 'Appointments'    },
  ],
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const location  = useLocation()
  const navigate  = useNavigate()
  const links     = NAV_LINKS[user?.role] || NAV_LINKS.patient
  const isActive  = (p) => location.pathname === p

  return (
    <nav className="sticky top-0 z-50 bg-navy-700 shadow-navy h-16 flex items-center">
      <div className="max-w-7xl mx-auto px-6 w-full flex items-center gap-4">
        {/* Brand */}
        <Link to={user?.role === 'doctor' ? '/doctor' : '/dashboard'}
          className="flex items-center gap-2 font-display font-black text-xl text-white flex-shrink-0">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <rect x="11" y="3" width="2" height="18"/><rect x="3" y="11" width="18" height="2"/>
            </svg>
          </div>
          MEDI<span className="text-teal-400">GO</span>
        </Link>

        {/* Links */}
        {user && (
          <div className="flex items-center gap-0.5 ml-6 flex-1">
            {links.map(l => (
              <Link key={l.to} to={l.to}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive(l.to)
                    ? 'text-white bg-white/12'
                    : 'text-white/60 hover:text-white hover:bg-white/8'
                }`}>
                {l.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3 ml-auto">
          {user ? (
            <>
              <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-full pl-1 pr-4 py-1">
                <div className="w-7 h-7 rounded-full bg-teal-500 text-white font-display font-black flex items-center justify-center text-xs">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="text-white text-xs font-bold leading-none">{user.name}</div>
                  <div className="text-teal-400 text-[10px] font-semibold capitalize">{user.role}</div>
                </div>
              </div>
              <button onClick={() => { logout(); navigate('/login') }}
                className="text-white/50 hover:text-white text-xs font-semibold transition-colors px-2 py-1.5">
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-teal btn-sm">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  )
}
