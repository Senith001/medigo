import { useState, useEffect } from 'react'
import { appointmentAPI } from '../../services/api'
import { Calendar } from 'lucide-react'
import { format } from 'date-fns'

const statusBadge = (s) => {
  const m = { pending:'badge-amber', confirmed:'badge-blue', completed:'badge-green', cancelled:'badge-red', 'no-show':'badge-gray' }
  return <span className={`badge ${m[s]||'badge-gray'}`}>{s}</span>
}

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  const load = () => {
    setLoading(true)
    const params = { page, limit }
    if (filter) params.status = filter
    appointmentAPI.getAll(params).then(r => { setAppointments(r.data.appointments || []); setTotal(r.data.total || 0) }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter, page])

  return (
    <div>
      <div className="page-header"><h1 className="page-title">All Appointments</h1><p className="page-subtitle">{total} total appointments</p></div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['', 'pending', 'confirmed', 'completed', 'cancelled', 'no-show'].map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setFilter(s); setPage(1) }}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>
      <div className="card">
        {loading ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          : appointments.length === 0 ? <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-400)' }}><Calendar size={40} style={{ margin: '0 auto 12px' }} /><p>No appointments</p></div>
          : (
            <>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Type</th><th>Payment</th><th>Status</th></tr></thead>
                  <tbody>
                    {appointments.map(a => (
                      <tr key={a._id}>
                        <td><div style={{ fontWeight: 500 }}>{a.patientName}</div><div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{a.patientEmail}</div></td>
                        <td>Dr. {a.doctorName}</td>
                        <td>{format(new Date(a.appointmentDate), 'dd MMM yyyy')}</td>
                        <td>{a.timeSlot}</td>
                        <td><span className="badge badge-gray">{a.type}</span></td>
                        <td><span className={`badge ${a.paymentStatus === 'paid' ? 'badge-green' : 'badge-amber'}`}>{a.paymentStatus}</span></td>
                        <td>{statusBadge(a.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>Page {page} of {Math.ceil(total / limit)}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                  <button className="btn btn-secondary btn-sm" disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)}>Next</button>
                </div>
              </div>
            </>
          )}
      </div>
    </div>
  )
}
