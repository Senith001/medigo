import { useState, useEffect } from 'react'
import { patientAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { User, Camera } from 'lucide-react'

export default function PatientProfile() {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    patientAPI.getProfile().then(r => { setProfile(r.data.data); setForm(r.data.data) }).finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await patientAPI.updateProfile(form)
      toast.success('Profile updated!')
    } catch { toast.error('Update failed') } finally { setSaving(false) }
  }

  const handlePicture = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('image', file)
    try {
      const r = await patientAPI.uploadPicture(fd)
      toast.success('Profile picture updated!')
      setProfile(p => ({ ...p, profilePicture: r.data.profilePicture }))
    } catch { toast.error('Upload failed') }
  }

  if (loading) return <div className="loading-page"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header"><h1 className="page-title">My Profile</h1></div>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
        <div className="card" style={{ textAlign: 'center', height: 'fit-content' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'var(--blue-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 700, color: 'var(--blue-700)', overflow: 'hidden' }}>
              {profile?.profilePicture ? <img src={`/${profile.profilePicture}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={40} />}
            </div>
            <label style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Camera size={14} color="white" /><input type="file" accept="image/*" hidden onChange={handlePicture} />
            </label>
          </div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>{profile?.fullName}</div>
          <div style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 4 }}>{profile?.email}</div>
          <div style={{ fontSize: 12, color: 'var(--blue-600)', marginTop: 6, fontWeight: 500 }}>Patient ID: {profile?.userId}</div>
        </div>
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Personal Information</h3>
          <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'Full Name', key: 'fullName', type: 'text' },
              { label: 'Phone', key: 'phone', type: 'tel' },
              { label: 'Date of Birth', key: 'dateOfBirth', type: 'date' },
              { label: 'Blood Group', key: 'bloodGroup', type: 'text', placeholder: 'e.g. A+' },
              { label: 'Emergency Contact Name', key: 'emergencyContactName', type: 'text' },
              { label: 'Emergency Contact Phone', key: 'emergencyContactPhone', type: 'tel' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key} className="form-group">
                <label className="form-label">{label}</label>
                <input className="form-input" type={type} placeholder={placeholder} value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-input" value={form.gender || ''} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Address</label>
              <input className="form-input" type="text" value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
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
