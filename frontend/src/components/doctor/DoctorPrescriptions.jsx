import { useState, useEffect } from 'react'
import { prescriptionAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { FileText, Plus, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

const emptyMed = () => ({ name: '', dosage: '', frequency: '', duration: '', notes: '' })

export default function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ appointmentId:'', patientId:'', patientName:'', patientEmail:'', diagnosis:'', instructions:'', followUpDate:'', medicines:[emptyMed()] })

  const load = () => prescriptionAPI.getMy().then(r => setPrescriptions(r.data.prescriptions || [])).catch(() => {}).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setMed = (i, k, v) => setForm(f => ({ ...f, medicines: f.medicines.map((m, idx) => idx === i ? { ...m, [k]: v } : m) }))
  const addMed = () => setForm(f => ({ ...f, medicines: [...f.medicines, emptyMed()] }))
  const removeMed = (i) => setForm(f => ({ ...f, medicines: f.medicines.filter((_, idx) => idx !== i) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await prescriptionAPI.create(form)
      toast.success('Prescription issued!')
      setShowForm(false)
      setForm({ appointmentId:'', patientId:'', patientName:'', patientEmail:'', diagnosis:'', instructions:'', followUpDate:'', medicines:[emptyMed()] })
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') } finally { setSaving(false) }
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div><h1 className="page-title">Prescriptions</h1><p className="page-subtitle">Issue and manage patient prescriptions</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={16} /> New Prescription</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Issue New Prescription</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              {[
                { label: 'Appointment ID', key: 'appointmentId' },
                { label: 'Patient ID', key: 'patientId' },
                { label: 'Patient Name', key: 'patientName' },
                { label: 'Patient Email', key: 'patientEmail', type: 'email' },
              ].map(({ label, key, type = 'text' }) => (
                <div key={key} className="form-group">
                  <label className="form-label">{label}</label>
                  <input className="form-input" type={type} value={form[key]} onChange={e => setField(key, e.target.value)} required />
                </div>
              ))}
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Diagnosis</label>
                <textarea className="form-input" rows={2} value={form.diagnosis} onChange={e => setField('diagnosis', e.target.value)} required style={{ resize: 'vertical' }} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label className="form-label" style={{ margin: 0 }}>Medicines</label>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addMed}><Plus size={13} /> Add Medicine</button>
              </div>
              {form.medicines.map((med, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 32px', gap: 8, marginBottom: 8 }}>
                  {[
                    { placeholder: 'Medicine name', key: 'name' },
                    { placeholder: 'Dosage (500mg)', key: 'dosage' },
                    { placeholder: 'Frequency', key: 'frequency' },
                    { placeholder: 'Duration (7 days)', key: 'duration' },
                  ].map(({ placeholder, key }) => (
                    <input key={key} className="form-input" placeholder={placeholder} style={{ fontSize: 13 }} value={med[key]} onChange={e => setMed(i, key, e.target.value)} required />
                  ))}
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => removeMed(i)} style={{ padding: '6px 8px' }}><Trash2 size={13} /></button>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Instructions</label>
                <textarea className="form-input" rows={2} value={form.instructions} onChange={e => setField('instructions', e.target.value)} style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Follow-up Date</label>
                <input className="form-input" type="date" value={form.followUpDate} onChange={e => setField('followUpDate', e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? <span className="spinner" /> : 'Issue Prescription'}</button>
              <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Issued Prescriptions</h3>
        {loading ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          : prescriptions.length === 0 ? <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-400)' }}><FileText size={40} style={{ margin: '0 auto 12px' }} /><p>No prescriptions issued</p></div>
          : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Patient</th><th>Diagnosis</th><th>Medicines</th><th>Follow-up</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {prescriptions.map(p => (
                    <tr key={p._id}>
                      <td><div style={{ fontWeight: 500 }}>{p.patientName}</div><div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{p.patientEmail}</div></td>
                      <td style={{ maxWidth: 200 }}>{p.diagnosis}</td>
                      <td>{p.medicines?.length || 0} medicine{p.medicines?.length !== 1 ? 's' : ''}</td>
                      <td>{p.followUpDate ? format(new Date(p.followUpDate), 'dd MMM yyyy') : '—'}</td>
                      <td><span className={`badge ${p.status === 'active' ? 'badge-green' : p.status === 'expired' ? 'badge-gray' : 'badge-red'}`}>{p.status}</span></td>
                      <td style={{ fontSize: 13 }}>{format(new Date(p.createdAt), 'dd MMM yyyy')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  )
}
