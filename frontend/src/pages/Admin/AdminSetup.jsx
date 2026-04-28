import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck, Lock, ArrowRight,
  AlertCircle, Loader2,
  Stethoscope, ShieldAlert, Cpu, CheckCircle2
} from 'lucide-react'
import { authAPI } from '../../services/api'
import Button from '../../components/ui/Button'

export default function AdminSetup() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
  const passwordValid = passwordRegex.test(newPassword)
  const passwordsMatch = newPassword === confirmPassword
  const canSubmit = newPassword && confirmPassword && passwordValid && passwordsMatch && !loading

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError(null)

    try {
      await authAPI.setupAdminPassword({ token, newPassword })
      setSuccess(true)
      setTimeout(() => navigate('/admin-login', { state: { toast: 'Account activated successfully! Please log in.' } }), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Error State - Invalid Token
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 font-inter flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[150px] -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-medigo-blue/5 rounded-full blur-[120px] -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-medigo-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform">
                <Stethoscope size={24} />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white italic uppercase">
                Medi<span className="text-medigo-blue">Go</span>
              </span>
            </Link>
          </div>

          {/* Card */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/50">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center">
                <ShieldAlert size={32} className="text-red-500" />
              </div>
            </div>

            <div className="text-center space-y-3 mb-6">
              <h2 className="text-2xl font-black text-white tracking-tight">Access Denied</h2>
              <p className="text-slate-400 text-sm">The invitation link is invalid or has expired.</p>
            </div>

            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-400 text-sm mb-6">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>This activation link is missing or malformed. Please contact your super admin for a new invitation.</span>
            </div>

            <Link
              to="/"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors"
            >
              Return to Home
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">Session Terminated</span>
          </div>
        </motion.div>
      </div>
    )
  }

  // Success State
  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 font-inter flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px] -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-medigo-blue/5 rounded-full blur-[120px] -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-medigo-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform">
                <Stethoscope size={24} />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white italic uppercase">
                Medi<span className="text-medigo-blue">Go</span>
              </span>
            </Link>
          </div>

          {/* Card */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/50">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
            </div>

            <div className="text-center space-y-3 mb-6">
              <h2 className="text-2xl font-black text-white tracking-tight">Account Activated</h2>
              <p className="text-slate-400 text-sm">Your credentials have been secured successfully.</p>
            </div>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex gap-3 text-emerald-400 text-sm mb-6">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
              <span>Your password has been set. Redirecting you to the login page...</span>
            </div>

            <Link
              to="/admin-login"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-medigo-blue hover:bg-medigo-blue-dark text-white font-semibold rounded-xl transition-colors"
            >
              Proceed to Login
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">Redirecting...</span>
          </div>
        </motion.div>
      </div>
    )
  }

  // Main Form
  return (
    <div className="min-h-screen bg-slate-950 font-inter flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-medigo-blue/5 rounded-full blur-[150px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-medigo-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform">
              <Stethoscope size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white italic uppercase">
              Medi<span className="text-medigo-blue">Go</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full mb-4">
              <ShieldAlert size={12} className="text-amber-500" />
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider">Admin Invitation</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">Set Up Your Account</h2>
            <p className="text-slate-400 text-sm">Create a secure password to activate your administrative access.</p>
          </div>

          {/* Error */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-400 text-sm"
              >
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 ml-1">New Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  placeholder="Create a strong password"
                  className="w-full h-12 bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 text-white outline-none focus:border-medigo-blue focus:ring-2 focus:ring-medigo-blue/20 transition-all placeholder:text-slate-600"
                />
              </div>
              {newPassword && !passwordValid && (
                <p className="text-red-400 text-xs ml-1">
                  Must be 8+ chars with uppercase, lowercase, number, and special character.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 ml-1">Confirm Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter your password"
                  className="w-full h-12 bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 text-white outline-none focus:border-medigo-blue focus:ring-2 focus:ring-medigo-blue/20 transition-all placeholder:text-slate-600"
                />
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-red-400 text-xs ml-1">Passwords do not match.</p>
              )}
            </div>

            <Button
              loading={loading}
              disabled={!canSubmit}
              className="w-full h-12 bg-medigo-blue hover:bg-medigo-blue-dark text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Activating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Activate Account
                  <ArrowRight size={18} />
                </span>
              )}
            </Button>
          </form>

          {/* Requirements hint */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-xs text-slate-500 text-center">
              Password must be at least 8 characters with uppercase, lowercase, number, and special character.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center gap-6">
          <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-white transition-colors">
            Return to Home
          </Link>
          <span className="text-slate-700">•</span>
          <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Secure Setup</span>
        </div>
      </motion.div>
    </div>
  )
}
