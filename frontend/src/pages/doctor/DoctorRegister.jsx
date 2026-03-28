import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { doctorAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { Activity } from 'lucide-react'
import '../auth/Auth.css'

const specialties = ['Cardiology','Dermatology','General Practice','Neurology','Orthopedics','Pediatrics','Psychiatry','Radiology','Surgery','Gynecology','ENT','Ophthalmology','Urology','Oncology']

export default function DoctorRegister() {
  const [form, setForm] = useState({ fullName:'', email:'', password:'', phone:'', specialty:'', qualifications:'', hospital:'', experience:0, fee:0, slmcNumber:'', bio:'' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await doctorAPI.register(form)
      toast.success('Registration submitted! Admin will verify your account.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand"><Activity size={32} /><span>MEDIGO</span></div>
        <div className="auth-hero">
          <h1>Join as a Doctor</h1>
          <p>Register your profile and start accepting patients after admin verification.</p>
        </div>
      </div>
      <div className="auth-right" style={{ alignItems: 'flex-start', overflowY: 'auto', padding: '40px' }}>
        <div className="auth-card" style={{ maxWidth: 560, marginTop: 20 }}>
          <div className="auth-card-header"><h2>Doctor Registration</h2><p>Fill in your professional details</p></div>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { label: 'Full Name', key: 'fullName', type: 'text', col: 2 },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'Password', key: 'password', type: 'password' },
              { label: 'Phone', key: 'phone', type: 'tel' },
              { label: 'SLMC Number', key: 'slmcNumber', type: 'text' },
              { label: 'Hospital / Clinic', key: 'hospital', type: 'text', col: 2 },
              { label: 'Qualifications', key: 'qualifications', type: 'text', col: 2 },
              { label: 'Experience (years)', key: 'experience', type: 'number' },
              { label: 'Consultation Fee (LKR)', key: 'fee', type: 'number' },
            ].map(({ label, key, type, col }) => (
              <div key={key} className="form-group" style={{ gridColumn: col === 2 ? '1/-1' : undefined }}>
                <label className="form-label">{label}</label>
                <input className="form-input" type={type} value={form[key]} onChange={e => set(key, e.target.value)} required={['fullName','email','password','phone','slmcNumber'].includes(key)} />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Specialty</label>
              <select className="form-input" value={form.specialty} onChange={e => set('specialty', e.target.value)} required>
                <option value="">Select specialty</option>
                {specialties.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Bio</label>
              <textarea className="form-input" rows={3} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Brief professional bio..." style={{ resize: 'vertical' }} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                {loading ? <span className="spinner" /> : 'Submit Registration'}
              </button>
            </div>
          </form>
          <div className="auth-divider"><span>Already have an account?</span></div>
          <Link to="/login" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}
