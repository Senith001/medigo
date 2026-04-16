import { useState, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function VerifyOTPPage() {
  const { state } = useLocation()
  const email = state?.email || ''
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const refs = useRef([])
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleChange = (i, val) => {
    if (!/^[0-9]?$/.test(val)) return
    const next = [...otp]; next[i] = val; setOtp(next)
    if (val && i < 5) refs.current[i + 1]?.focus()
  }

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) { setError('Enter the 6-digit code.'); return }
    setError(''); setLoading(true)
    try {
      const res = await authAPI.verifyOtp({ email, otp: code })
      login(res.data.token, res.data.data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Try again.')
      setOtp(['','','','','',''])
      refs.current[0]?.focus()
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 flex items-center justify-center p-4">
      <div className="absolute w-80 h-80 rounded-full bg-teal-500/10 top-0 right-0 pointer-events-none" />

      <div className="w-full max-w-md animate-fade-up relative">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-display font-black text-2xl text-white">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <rect x="11" y="3" width="2" height="18"/><rect x="3" y="11" width="18" height="2"/>
              </svg>
            </div>
            MEDI<span className="text-teal-400">GO</span>
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-8 shadow-2xl text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-3xl mx-auto mb-5">
            ✉️
          </div>
          <h1 className="font-display text-2xl font-black text-white mb-2">Verify Your Email</h1>
          <p className="text-white/40 text-sm mb-2 leading-relaxed">
            We sent a 6-digit code to
          </p>
          <p className="text-teal-400 font-bold text-sm mb-7">{email}</p>

          {error && (
            <div className="bg-red-500/20 border border-red-400/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-5">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* OTP boxes */}
            <div className="flex justify-center gap-2.5 mb-7">
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={el => (refs.current[i] = el)}
                  maxLength={1}
                  value={d}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKey(i, e)}
                  className="w-12 h-14 text-center text-2xl font-black text-white bg-white/10 border border-white/20 rounded-xl outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all"
                />
              ))}
            </div>

            <button type="submit" disabled={loading || otp.join('').length < 6}
              className="w-full btn btn-teal py-3 justify-center font-bold disabled:opacity-50">
              {loading ? <><span className="spinner" /> Verifying…</> : 'Verify & Continue →'}
            </button>
          </form>

          <p className="text-white/30 text-xs mt-6">
            Didn't receive it? <Link to="/register" className="text-teal-400 hover:underline">Try again</Link>
          </p>
        </div>
      </div>
    </div>
  )
}