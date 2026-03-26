import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { Alert, Spinner } from '../components/ui/index.jsx'
import axios from 'axios'

const CrossIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
    <rect x="11" y="3" width="2" height="18"/><rect x="3" y="11" width="18" height="2"/>
  </svg>
)

// Raw axios — no interceptors, 401 won't auto-redirect
const rawAxios = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } })

function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-center bg-gradient-to-br from-navy via-navy-light to-navy-dark p-14 relative overflow-hidden">
        <div className="absolute w-64 h-64 bg-teal/10 rounded-full -top-20 -right-20"/>
        <div className="absolute w-40 h-40 bg-teal/5 rounded-full bottom-10 -left-10"/>
        <div className="relative">
          <div className="flex items-center gap-3 mb-14">
            <div className="w-10 h-10 bg-teal rounded-xl flex items-center justify-center"><CrossIcon/></div>
            <span className="font-display font-extrabold text-2xl text-white">MEDI<span className="text-teal-light">GO</span></span>
          </div>
          <h1 className="font-display font-black text-4xl text-white mb-4 leading-tight">
            Smart healthcare,<br/><span className="text-teal-light">simplified.</span>
          </h1>
          <p className="text-white/50 text-base leading-relaxed mb-10 max-w-sm">
            Connect with verified doctors, book appointments instantly, and manage your health from anywhere.
          </p>
          <div className="space-y-4">
            {['Search & book verified doctors','Video & in-person consultations','Digital prescriptions & reports','Email & SMS notifications'].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-teal flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span className="text-white/70 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-gray-50 p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center"><CrossIcon/></div>
            <span className="font-display font-extrabold text-xl text-navy">MEDI<span className="text-teal">GO</span></span>
          </div>
          <div className="card p-8">
            <h2 className="font-display font-bold text-2xl text-gray-900 mb-1">{title}</h2>
            <p className="text-sm text-gray-400 mb-7">{subtitle}</p>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Step 1: Try auth-service (patient / doctor)
    try {
      const res = await rawAxios.post('/auth/login', { email, password })
      const { token, data } = res.data
      login(token, data)
      const role = data?.role
      // Use window.location.href to force full reload — fixes timing issue
      // where ProtectedRoute checks user before state is set
      const dest = role === 'doctor' ? '/doctor' : role === 'admin' ? '/admin' : '/patient'
      window.location.href = dest
      return
    } catch {
      // auth-service failed — try admin-service
    }

    // Step 2: Try admin-service
    try {
      const res = await rawAxios.post('/admin/login', { email, password })
      const token     = res.data.token
      const adminData = res.data.admin || res.data.data || {}
      login(token, {
        ...adminData,
        name: adminData.fullName || adminData.name || email.split('@')[0],
        role: adminData.role || 'admin',
      })
      window.location.href = '/admin'
    } catch (adminErr) {
      setError(adminErr.response?.data?.message || 'Invalid email or password.')
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your MEDIGO account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email Address</label>
          <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required/>
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input className="input pr-10" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required/>
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {error && <Alert type="error" message={error}/>}

        <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
          {loading ? <><Spinner size="sm"/> Signing in…</> : 'Sign In →'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-400 mt-5">
        Don't have an account? <Link to="/register" className="text-teal font-bold hover:underline">Register</Link>
      </p>

      <div className="mt-5 p-4 bg-teal-lighter rounded-xl border border-teal/20">
        <p className="text-xs font-bold text-teal uppercase tracking-wider mb-2">🧪 Test Accounts</p>
        <p className="text-sm text-gray-600 mb-1">
          <span className="text-gray-400">Patient: </span>
          <strong>prabashmihiranga@gmail.com</strong> / <strong>Prabaa@123</strong>
        </p>
        <p className="text-sm text-gray-600">
          <span className="text-gray-400">Admin: </span>
          <strong>admin04@medigo.com</strong> / <strong>Admin04@</strong>
        </p>
      </div>
    </AuthLayout>
  )
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep]       = useState(1)
  const [form, setForm]       = useState({ fullName: '', email: '', phone: '', password: '' })
  const [otp, setOtp]         = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await authAPI.register(form)
      setSuccess('OTP sent to your email. Please verify.')
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.')
    } finally { setLoading(false) }
  }

  const handleVerify = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await authAPI.verifyOtp({ email: form.email, otp })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP.')
    } finally { setLoading(false) }
  }

  return (
    <AuthLayout
      title={step === 1 ? 'Create Account' : 'Verify Email'}
      subtitle={step === 1 ? 'Register as a patient on MEDIGO' : `OTP sent to ${form.email}`}
    >
      {step === 1 ? (
        <form onSubmit={handleRegister} className="space-y-4">
          <div><label className="label">Full Name</label><input className="input" placeholder="John Doe" value={form.fullName} onChange={e => setForm({...form,fullName:e.target.value})} required/></div>
          <div><label className="label">Email</label><input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form,email:e.target.value})} required/></div>
          <div><label className="label">Phone</label><input className="input" placeholder="0771234567" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} required/></div>
          <div><label className="label">Password</label><input className="input" type="password" placeholder="Min 8 chars, A-Z, 0-9, special char" value={form.password} onChange={e => setForm({...form,password:e.target.value})} required/></div>
          {error   && <Alert type="error"   message={error}/>}
          {success && <Alert type="success" message={success}/>}
          <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
            {loading ? <><Spinner size="sm"/> Registering…</> : 'Create Account'}
          </button>
          <p className="text-center text-sm text-gray-400">
            Already have an account? <Link to="/login" className="text-teal font-bold hover:underline">Sign In</Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="label">OTP Code</label>
            <input className="input text-center text-2xl tracking-widest" placeholder="123456" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} required/>
          </div>
          {error && <Alert type="error" message={error}/>}
          <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
            {loading ? <><Spinner size="sm"/> Verifying…</> : 'Verify & Continue'}
          </button>
          <button type="button" className="btn-ghost w-full justify-center" onClick={() => setStep(1)}>← Back</button>
        </form>
      )}
    </AuthLayout>
  )
}
