import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { Activity } from 'lucide-react'
import './Auth.css'

export default function ResetPasswordPage() {
  const [form, setForm] = useState({ otp: '', newPassword: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.resetPassword({ email, ...form })
      toast.success('Password reset successfully!')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand"><Activity size={32} /><span>MEDIGO</span></div>
        <div className="auth-hero"><h1>Set new password</h1><p>Enter the OTP from your email and your new password.</p></div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header"><h2>Reset password</h2><p>For {email}</p></div>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">OTP code</label>
              <input className="form-input" type="text" placeholder="123456" maxLength={6} value={form.otp} onChange={e => setForm(f => ({ ...f, otp: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">New password</label>
              <input className="form-input" type="password" placeholder="••••••••" value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} required />
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Reset password'}
            </button>
          </form>
          <div className="auth-divider" />
          <Link to="/login" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Back to sign in</Link>
        </div>
      </div>
    </div>
  )
}
