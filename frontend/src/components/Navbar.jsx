import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (p) => location.pathname === p

  return (
    <nav className="navbar">
      {/* Brand */}
      <Link to="/" className="navbar-brand">
        <div className="brand-cross">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <rect x="11" y="3" width="2" height="18"/><rect x="3" y="11" width="18" height="2"/>
          </svg>
        </div>
        MEDI<span style={{ color: 'var(--teal-400)' }}>GO</span>
      </Link>

      {/* Nav links */}
      {user && (
        <div className="navbar-links">
          <Link to="/"            className={`nav-link ${isActive('/')            ? 'active' : ''}`}>Home</Link>
          <Link to="/search"      className={`nav-link ${isActive('/search')      ? 'active' : ''}`}>Find Doctors</Link>
          <Link to="/appointments"className={`nav-link ${isActive('/appointments') ? 'active' : ''}`}>My Appointments</Link>
        </div>
      )}

      {/* Right */}
      <div className="navbar-right">
        {user ? (
          <>
            <div className="user-chip">
              <div className="user-chip-avatar">{user.name?.[0]?.toUpperCase()}</div>
              <div>
                <div className="user-chip-name">{user.name}</div>
                <div className="user-chip-role">{user.role}</div>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ color: 'rgba(255,255,255,.6)', fontSize: 13 }} onClick={() => { logout(); navigate('/login') }}>
              Sign out
            </button>
          </>
        ) : (
          <Link to="/login" className="btn btn-teal btn-sm">Sign In</Link>
        )}
      </div>
    </nav>
  )
}
