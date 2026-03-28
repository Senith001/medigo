import { useState, useEffect } from 'react'
import { doctorAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { Clock, Plus, Trash2 } from 'lucide-react'

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

const defaultSlot = () => ({ day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true })

export default function DoctorAvailability() {
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    doctorAPI.getMyAvailability().then(r => setAvailability(r.data.availability || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const addSlot = () => setAvailability(a => [...a, defaultSlot()])
  const removeSlot = (i) => setAvailability(a => a.filter((_, idx) => idx !== i))
  const updateSlot = (i, key, val) => setAvailability(a => a.map((s, idx) => idx === i ? { ...s, [key]: val } : s))

  const handleSave = async () => {
    setSaving(true)
    try {
      await doctorAPI.updateMyAvailability({ availability })
      toast.success('Availability updated!')
    } catch { toast.error('Save failed') } finally { setSaving(false) }
  }

  if (loading) return <div className="loading-page"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Availability</h1>
        <p className="page-subtitle">Set your weekly schedule</p>
      </div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={16} /> Weekly Schedule</h3>
          <button className="btn btn-secondary btn-sm" onClick={addSlot}><Plus size={14} /> Add Slot</button>
        </div>
        {availability.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>
            <Clock size={40} style={{ margin: '0 auto 12px' }} />
            <p>No availability set</p>
            <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={addSlot}>Add First Slot</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {availability.map((slot, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 120px 120px auto 32px', gap: 10, alignItems: 'center', padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 10, border: '1px solid var(--gray-200)' }}>
                <select className="form-input" style={{ fontSize: 13 }} value={slot.day} onChange={e => updateSlot(i, 'day', e.target.value)}>
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input className="form-input" type="time" style={{ fontSize: 13 }} value={slot.startTime} onChange={e => updateSlot(i, 'startTime', e.target.value)} />
                <input className="form-input" type="time" style={{ fontSize: 13 }} value={slot.endTime} onChange={e => updateSlot(i, 'endTime', e.target.value)} />
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={slot.isAvailable} onChange={e => updateSlot(i, 'isAvailable', e.target.checked)} />
                  Available
                </label>
                <button className="btn btn-danger btn-sm" onClick={() => removeSlot(i)} style={{ padding: '6px 8px' }}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        )}
        {availability.length > 0 && (
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? <span className="spinner" /> : 'Save Availability'}</button>
        )}
      </div>
    </div>
  )
}
