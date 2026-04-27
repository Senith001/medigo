import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Lock, ArrowRight,
  AlertCircle, Stethoscope, ShieldCheck, Cpu
} from 'lucide-react'
import { authAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'

export default function DoctorLogin() {
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()

  const handleChange = (e) =>
    setCredentials({ ...credentials, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await authAPI.login(credentials)
      const userData = res.data.data

      if (userData.role !== 'doctor') {
        setError('Access denied. Please use a doctor account.')
        setLoading(false)
        return
      }

      // ✅ Check doctor verification status
      if (userData.isVerified === false) {
        setError('Your account is pending verification. Please wait for admin approval.')
        setLoading(false)
        return
      }

      login(res.data.token, userData)
      navigate('/doctor')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid doctor credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 font-inter flex overflow-hidden">

      {/* ── Left Decoration ── */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.08),transparent_70%)]" />

        <div className="relative z-10 p-24 flex flex-col justify-between">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-medigo-blue rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
              <Stethoscope size={26} />
            </div>
            <span className="text-3xl font-black tracking-tighter text-white italic uppercase">
              Medi<span className="text-medigo-blue">Go</span>
            </span>
          </Link>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-0.5 w-12 bg-medigo-blue rounded-full" />
              <span className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">
                Clinical Portal
              </span>
            </div>
            <h1 className="text-6xl font-black text-white leading-[0.9] tracking-tighter uppercase italic">
              Doctor <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-medigo-blue to-cyan-400">
                Gateway.
              </span>
            </h1>
            <p className="text-lg text-slate-500 font-medium max-w-md leading-relaxed">
              Access your clinical dashboard to manage appointments, conduct telemedicine sessions, and issue digital prescriptions.
            </p>

            {/* Feature list */}
            <div className="space-y-4 pt-4">
              {[
                { icon: ShieldCheck, text: 'SLMC Verified Practitioner Access' },
                { icon: Cpu, text: 'AI-Powered Clinical Dashboard' },
                { icon: Stethoscope, text: 'Digital Prescription & Patient Records' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-medigo-blue/10 rounded-lg flex items-center justify-center">
                    <item.icon size={16} className="text-medigo-blue" />
                  </div>
                  <span className="text-sm font-bold text-slate-400">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-8 text-white/20">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">HIPAA SECURE</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">TLS 1.3</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Login Form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-medigo-blue/5 blur-[120px] rounded-full -z-10" />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-10"
        >
          {/* Header */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-900 border border-slate-800 rounded-full">
              <Stethoscope size={14} className="text-medigo-blue" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Doctor Portal
              </span>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
              Doctor <span className="text-medigo-blue">Sign In</span>
            </h2>
            <p className="text-slate-500 font-medium">
              Access your clinical dashboard and patient management tools.
            </p>
          </div>

          {/* Error */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3 text-red-400 text-sm font-bold"
              >
                <AlertCircle size={20} className="shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                Doctor Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none"
                />
                <input
                  type="email"
                  name="email"
                  required
                  value={credentials.email}
                  onChange={handleChange}
                  placeholder="you@hospital.com"
                  className="w-full h-14 bg-slate-900/50 border border-slate-800 rounded-2xl pl-14 pr-6 text-white outline-none focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/5 transition-all font-bold placeholder:text-slate-700"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none"
                />
                <input
                  type="password"
                  name="password"
                  required
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full h-14 bg-slate-900/50 border border-slate-800 rounded-2xl pl-14 pr-6 text-white outline-none focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/5 transition-all font-bold placeholder:text-slate-700"
                />
              </div>
            </div>

            <Button
              loading={loading}
              className="w-full h-16 text-lg bg-medigo-blue hover:bg-medigo-blue-dark shadow-2xl shadow-blue-500/20 group"
            >
              Sign In to Dashboard
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          {/* Footer links */}
          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link
              to="/login"
              className="text-xs font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors"
            >
              Patient Login
            </Link>
            <Link
              to="/admin-login"
              className="text-xs font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors"
            >
              Admin Portal
            </Link>
            <Link
              to="/"
              className="text-xs font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}