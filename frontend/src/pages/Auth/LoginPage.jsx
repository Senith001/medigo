import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await authAPI.login(form)
      login(res.data.token, res.data.data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="absolute w-96 h-96 rounded-full bg-teal-500/10 -top-20 -right-10 pointer-events-none" />
      <div className="absolute w-64 h-64 rounded-full bg-teal-400/5 bottom-10 left-10 pointer-events-none" />

      <div className="w-full max-w-md animate-fade-up relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-display font-black text-2xl text-white">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <rect x="11" y="3" width="2" height="18"/><rect x="3" y="11" width="18" height="2"/>
              </svg>
            </div>
            MEDI<span className="text-teal-400">GO</span>
          </Link>
          <p className="text-white/50 text-sm mt-2">Patient Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-8 shadow-2xl">
          <h1 className="font-display text-2xl font-black text-white mb-1">Welcome back</h1>
          <p className="text-white/50 text-sm mb-7">Sign in to your MEDIGO account</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-5">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-wide mb-1.5">Email</label>
              <input
                type="email" required
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-wide mb-1.5">Password</label>
              <input
                type="password" required
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all"
              />
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn btn-teal py-3 justify-center text-sm font-bold mt-2 disabled:opacity-50">
              {loading ? <><span className="spinner" /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-white/40">Don't have an account? </span>
            <Link to="/register" className="text-teal-400 font-bold hover:text-teal-300 transition-colors">
              Create one →
            </Link>
          </div>
        </div>

        {/* Admin link */}
        <p className="text-center mt-5 text-white/30 text-xs">
          Admin? <Link to="/admin-login" className="text-white/50 hover:text-white underline transition-colors">Admin portal →</Link>
        </p>
      </div>
    </div>
  )
}