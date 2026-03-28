import { useState, useEffect } from 'react'
import { doctorAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { User } from 'lucide-react'

const specialties = ['Cardiology','Dermatology','General Practice','Neurology','Orthopedics','Pediatrics','Psychiatry','Radiology','Surgery','Gynecology','ENT','Ophthalmology','Urology','Oncology']

export default function DoctorProfile() {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    doctorAPI.getMyProfile().then(r => { setProfile(r.data.doctor); setForm(r.data.doctor) }).finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await doctorAPI.updateMyProfile(form)
      toast.success('Profile updated!')
    } catch { toast.error('Update failed') } finally { setSaving(false) }
  }

  if (loading) return <div className="loading-page"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header"><h1 className="page-title">My Profile</h1></div>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24 }}>
        <div className="card" style={{ textAlign: 'center', height: 'fit-content' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#0369a1', margin: '0 auto 14px' }}>
            {profile?.fullName?.[0] || <User />}
          </div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>Dr. {profile?.fullName}</div>
          <div style={{ color: 'var(--blue-600)', fontSize: 13, marginTop: 4 }}>{profile?.specialty}</div>
          <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>{profile?.email}</div>
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 6 }}>
            <span className={`badge ${profile?.isVerified ? 'badge-green' : 'badge-amber'}`}>{profile?.isVerified ? 'Verified' : 'Pending'}</span>
            <span className={`badge ${profile?.isActive ? 'badge-blue' : 'badge-gray'}`}>{profile?.isActive ? 'Active' : 'Inactive'}</span>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Professional Information</h3>
          <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'Full Name', key: 'fullName', type: 'text' },
              { label: 'Phone', key: 'phone', type: 'tel' },
              { label: 'Hospital / Clinic', key: 'hospital', type: 'text' },
              { label: 'SLMC Number', key: 'slmcNumber', type: 'text' },
              { label: 'Experience (years)', key: 'experience', type: 'number' },
              { label: 'Consultation Fee (LKR)', key: 'fee', type: 'number' },
              { label: 'Qualifications', key: 'qualifications', type: 'text', col: 2 },
            ].map(({ label, key, type, col }) => (
              <div key={key} className="form-group" style={{ gridColumn: col === 2 ? '1/-1' : undefined }}>
                <label className="form-label">{label}</label>
                <input className="form-input" type={type} value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Specialty</label>
              <select className="form-input" value={form.specialty || ''} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}>
                {specialties.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Bio</label>
              <textarea className="form-input" rows={3} value={form.bio || ''} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? <span className="spinner" /> : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
