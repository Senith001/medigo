import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { Activity } from 'lucide-react'
import './Auth.css'

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.register(form)
      toast.success('OTP sent to your email!')
      navigate('/verify-otp', { state: { email: form.email } })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand"><Activity size={32} /><span>MEDIGO</span></div>
        <div className="auth-hero">
          <h1>Join MEDIGO today</h1>
          <p>Create your account and get access to the best healthcare professionals.</p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header"><h2>Create account</h2><p>Register as a patient</p></div>
          <form onSubmit={handleSubmit} className="auth-form">
            {[
              { label: 'Full name', key: 'fullName', type: 'text', placeholder: 'John Doe' },
              { label: 'Email address', key: 'email', type: 'email', placeholder: 'you@example.com' },
              { label: 'Phone number', key: 'phone', type: 'tel', placeholder: '07XXXXXXXX' },
              { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key} className="form-group">
                <label className="form-label">{label}</label>
                <input className="form-input" type={type} placeholder={placeholder} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required />
              </div>
            ))}
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create account'}
            </button>
          </form>
          <div className="auth-divider"><span>Already have an account?</span></div>
          <Link to="/login" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}
