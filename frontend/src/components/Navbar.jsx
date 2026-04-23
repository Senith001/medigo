import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, User as UserIcon, Settings, ChevronDown, Menu, X, Shield } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const isActive = (p) => location.pathname === p

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Find Doctors', path: '/search' },
    { name: 'Appointments', path: '/appointments' },
    { name: 'Medical Reports', path: '/reports' },
    { name: 'Prescriptions', path: '/prescriptions' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 font-inter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-gradient-to-tr from-medigo-blue to-medigo-teal rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Shield size={18} className="text-white fill-white/20" />
              </div>
              <span className="text-xl font-black tracking-tighter text-medigo-navy">
                Medi<span className="text-medigo-blue">Go</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:ml-10 md:flex md:space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    isActive(link.path)
                      ? 'bg-blue-50 text-medigo-blue'
                      : 'text-slate-500 hover:text-medigo-blue hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex md:items-center md:gap-4">
            {user ? (
              <div className="relative group">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full bg-slate-50 border border-slate-100 hover:border-medigo-blue transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-medigo-blue to-medigo-teal text-white flex items-center justify-center text-xs font-black shadow-sm">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-[13px] font-bold text-medigo-navy leading-none">{user.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{user.role}</p>
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-premium py-2 z-50 overflow-hidden"
                    >
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-medigo-blue transition-colors">
                        <UserIcon size={16} /> My Account
                      </Link>
                      <Link to="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-medigo-blue transition-colors">
                        <Settings size={16} /> Settings
                      </Link>
                      <div className="h-px bg-slate-100 my-1 mx-2" />
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} /> Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-medigo-blue px-4 py-2 transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="bg-medigo-blue text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-premium hover:shadow-premium-hover hover:-translate-y-0.5 transition-all">
                  Join Medigo
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-bold transition-all ${
                    isActive(link.path)
                      ? 'bg-blue-50 text-medigo-blue'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {!user && (
                <div className="pt-4 grid grid-cols-2 gap-3">
                  <Link to="/login" className="flex items-center justify-center h-12 rounded-xl text-sm font-bold border border-slate-200 text-slate-600">
                    Sign In
                  </Link>
                  <Link to="/register" className="flex items-center justify-center h-12 rounded-xl text-sm font-bold bg-medigo-blue text-white shadow-lg">
                    Join Free
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
