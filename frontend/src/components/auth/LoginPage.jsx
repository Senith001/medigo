import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authAPI, adminAPI, doctorAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { Activity, Eye, EyeOff } from 'lucide-react'
import './Auth.css'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [role, setRole] = useState('patient')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let res

      if (role === 'admin') {
        res = await adminAPI.login(form)
      } else if (role === 'doctor') {
        res = await doctorAPI.login(form)
      } else {
        res = await authAPI.login(form)
      }

      const { token, data } = res.data
      login(data, token)
      toast.success(`Welcome back, ${data.fullName}!`)

      if (data.role === 'patient') navigate('/patient/dashboard')
      else if (data.role === 'doctor') navigate('/doctor/dashboard')
      else navigate('/admin/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <Activity size={32} />
          <span>MEDIGO</span>
        </div>
        <div className="auth-hero">
          <h1>Healthcare at your fingertips</h1>
          <p>Book appointments, manage health records, and connect with top doctors — all in one place.</p>
        </div>
        <div className="auth-stats">
          {[['500+', 'Doctors'], ['10K+', 'Patients'], ['99%', 'Satisfaction']].map(([num, label]) => (
            <div key={label} className="auth-stat">
              <span className="stat-num">{num}</span>
              <span className="stat-label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Sign in</h2>
            <p>Welcome back to MEDIGO</p>
          </div>

          <div className="role-tabs">
            {['patient', 'doctor', 'admin'].map(r => (
              <button
                key={r}
                className={`role-tab ${role === r ? 'active' : ''}`}
                onClick={() => setRole(r)}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <input
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <button type="button" className="input-icon-btn" onClick={() => setShowPass(s => !s)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {role === 'patient' && (
              <div className="auth-form-footer">
                <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
              </div>
            )}

            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Sign in'}
            </button>
          </form>

          {role !== 'admin' && (
            <>
              <div className="auth-divider"><span>New to MEDIGO?</span></div>
              {role === 'patient' && (
                <Link to="/register" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                  Create patient account
                </Link>
              )}
              {role === 'doctor' && (
                <Link to="/doctor/register" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                  Register as a doctor
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}