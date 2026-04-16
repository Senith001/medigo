import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../../services/api'

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName:'', email:'', password:'', phone:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await authAPI.register(form)
      navigate('/verify-otp', { state: { email: form.email } })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  const fields = [
    { key:'fullName', label:'Full Name',     type:'text',     placeholder:'Dr. Jane Smith' },
    { key:'email',    label:'Email Address', type:'email',    placeholder:'you@example.com' },
    { key:'phone',    label:'Phone Number',  type:'tel',      placeholder:'+94 77 123 4567' },
    { key:'password', label:'Password',      type:'password', placeholder:'Min. 8 characters' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 flex items-center justify-center p-4">
      <div className="absolute w-96 h-96 rounded-full bg-teal-500/10 -top-10 -right-10 pointer-events-none" />
      <div className="absolute w-64 h-64 rounded-full bg-teal-400/5 bottom-0 -left-10 pointer-events-none" />

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
          <p className="text-white/50 text-sm mt-2">Create Your Patient Account</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-8 shadow-2xl">
          <h1 className="font-display text-2xl font-black text-white mb-1">Get Started</h1>
          <p className="text-white/50 text-sm mb-7">Join MEDIGO — it's completely free</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-5">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(f => (
              <div key={f.key}>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-wide mb-1.5">{f.label}</label>
                <input
                  type={f.type} required
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all"
                />
              </div>
            ))}

            <p className="text-white/30 text-xs mt-1 leading-relaxed">
              By registering, you agree to our <a href="#" className="underline text-white/50">Terms</a> and <a href="#" className="underline text-white/50">Privacy Policy</a>.
            </p>

            <button type="submit" disabled={loading}
              className="w-full btn btn-teal py-3 justify-center text-sm font-bold mt-2 disabled:opacity-50">
              {loading ? <><span className="spinner" /> Creating account…</> : 'Create Account →'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-white/40">Already have an account? </span>
            <Link to="/login" className="text-teal-400 font-bold hover:text-teal-300 transition-colors">Sign in →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}