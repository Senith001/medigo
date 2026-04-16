import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function AdminLogin() {
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
      if (res.data.data?.role !== 'admin') {
        setError('Access denied. Admin credentials required.')
        return
      }
      login(res.data.token, res.data.data)
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid admin credentials.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'linear-gradient(#14b8a6 1px, transparent 1px), linear-gradient(to right, #14b8a6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="w-full max-w-md relative animate-fade-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 font-display font-black text-2xl text-white">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <rect x="11" y="3" width="2" height="18"/><rect x="3" y="11" width="18" height="2"/>
              </svg>
            </div>
            MEDI<span className="text-teal-400">GO</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            🛡️ Admin Portal
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
          <h1 className="font-display text-2xl font-black text-white mb-1">Admin Sign In</h1>
          <p className="text-gray-500 text-sm mb-7">Restricted access — authorized personnel only</p>

          {error && (
            <div className="flex gap-2 bg-red-900/30 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-5">
              🚫 {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key:'email',    label:'Admin Email',    type:'email',    ph:'admin@medigo.com' },
              { key:'password', label:'Admin Password', type:'password', ph:'••••••••' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                <input
                  type={f.type} required
                  placeholder={f.ph}
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                />
              </div>
            ))}

            <button type="submit" disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-50">
              {loading ? <><span className="spinner" /> Authenticating…</> : '🔐 Sign In as Admin'}
            </button>
          </form>
        </div>

        <p className="text-center mt-5 text-gray-600 text-xs">
          Patient portal? <Link to="/login" className="text-gray-400 hover:text-white underline transition-colors">Sign in here →</Link>
        </p>
      </div>
    </div>
  )
}