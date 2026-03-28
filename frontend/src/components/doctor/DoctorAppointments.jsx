import { useState, useEffect } from 'react'
import { doctorAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { Calendar, CheckCircle, Video } from 'lucide-react'

const statusBadge = (s) => {
  const m = { pending:'badge-amber', confirmed:'badge-blue', completed:'badge-green', cancelled:'badge-red', 'no-show':'badge-gray' }
  return <span className={`badge ${m[s]||'badge-gray'}`}>{s}</span>
}

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [meetingLink, setMeetingLink] = useState({})

  const load = () => {
    doctorAPI.getMyAppointments().then(r => {
      let appts = r.data.appointments || []
      if (filter) appts = appts.filter(a => a.status === filter)
      setAppointments(appts)
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])

  const handleStatus = async (id, status) => {
    try {
      await doctorAPI.updateAppointmentStatus(id, { status, meetingLink: meetingLink[id] || undefined })
      toast.success(`Appointment ${status}`)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Appointments</h1>
        <p className="page-subtitle">Manage patient appointments</p>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(s)}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>
      <div className="card">
        {loading ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          : appointments.length === 0 ? <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-400)' }}><Calendar size={40} style={{ margin: '0 auto 12px' }} /><p>No appointments</p></div>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {appointments.map(a => (
                <div key={a._id} style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: 12, border: '1px solid var(--gray-200)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--blue-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--blue-700)', flexShrink: 0 }}>{a.patientName?.[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{a.patientName}</div>
                      <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{a.patientEmail}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600 }}>{format(new Date(a.appointmentDate), 'dd MMM yyyy')} · {a.timeSlot}</div>
                      <div style={{ marginTop: 4, display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {statusBadge(a.status)}
                        <span className="badge badge-gray">{a.type}</span>
                      </div>
                    </div>
                  </div>
                  {a.reason && <div style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 12, padding: '8px 12px', background: 'white', borderRadius: 8 }}>Reason: {a.reason}</div>}
                  {a.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {a.type === 'telemedicine' && (
                        <input className="form-input" placeholder="Meeting link (optional)" style={{ flex: 1, fontSize: 13 }}
                          value={meetingLink[a._id] || ''} onChange={e => setMeetingLink(m => ({ ...m, [a._id]: e.target.value }))} />
                      )}
                      <button className="btn btn-success btn-sm" onClick={() => handleStatus(a._id, 'confirmed')}><CheckCircle size={14} /> Confirm</button>
                    </div>
                  )}
                  {a.status === 'confirmed' && a.type === 'telemedicine' && a.meetingLink && (
                    <a href={a.meetingLink} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm"><Video size={14} /> Join Meeting</a>
                  )}
                  {a.status === 'confirmed' && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button className="btn btn-success btn-sm" onClick={() => handleStatus(a._id, 'completed')}>Mark Completed</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleStatus(a._id, 'no-show')}>No Show</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}
