import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { Activity } from 'lucide-react'
import './Auth.css'

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authAPI.verifyOtp({ email, otp })
      login(res.data.data, res.data.token)
      toast.success('Email verified! Welcome to MEDIGO.')
      navigate('/patient/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand"><Activity size={32} /><span>MEDIGO</span></div>
        <div className="auth-hero"><h1>Verify your email</h1><p>We sent a 6-digit code to your email address.</p></div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header"><h2>Enter OTP</h2><p>Sent to {email}</p></div>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">6-digit OTP</label>
              <input className="form-input" type="text" placeholder="123456" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} required style={{ fontSize: '22px', letterSpacing: '8px', textAlign: 'center' }} />
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Verify Email'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
