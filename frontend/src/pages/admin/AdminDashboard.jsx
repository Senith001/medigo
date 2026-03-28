import { useState, useEffect } from 'react'
import { adminAPI, appointmentAPI, doctorAPI } from '../../services/api'
import { Users, Stethoscope, Calendar, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ patients: 0, doctors: 0, appointments: 0, completed: 0 })
  const [recentAppts, setRecentAppts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminAPI.getPatients().catch(() => ({ data: { data: [] } })),
      doctorAPI.adminGetAll().catch(() => ({ data: { doctors: [] } })),
      appointmentAPI.getAll({ limit: 5 }).catch(() => ({ data: { appointments: [], total: 0 } })),
    ]).then(([patients, doctors, appts]) => {
      setStats({
        patients: patients.data.count || patients.data.data?.length || 0,
        doctors: doctors.data.total || doctors.data.doctors?.length || 0,
        appointments: appts.data.total || 0,
        completed: (appts.data.appointments || []).filter(a => a.status === 'completed').length,
      })
      setRecentAppts(appts.data.appointments || [])
    }).finally(() => setLoading(false))
  }, [])

  const statusBadge = (s) => {
    const m = { pending:'badge-amber', confirmed:'badge-blue', completed:'badge-green', cancelled:'badge-red', 'no-show':'badge-gray' }
    return <span className={`badge ${m[s]||'badge-gray'}`}>{s}</span>
  }

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Admin Dashboard</h1><p className="page-subtitle">Platform overview</p></div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Patients', value: stats.patients, icon: Users, color: '#2563eb', bg: '#eff6ff' },
          { label: 'Total Doctors', value: stats.doctors, icon: Stethoscope, color: '#7c3aed', bg: '#f5f3ff' },
          { label: 'Total Appointments', value: stats.appointments, icon: Calendar, color: '#d97706', bg: '#fffbeb' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: '#16a34a', bg: '#f0fdf4' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Sora, sans-serif' }}>{value}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Recent Appointments</h3>
        {loading ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Type</th><th>Status</th></tr></thead>
                <tbody>
                  {recentAppts.map(a => (
                    <tr key={a._id}>
                      <td style={{ fontWeight: 500 }}>{a.patientName}</td>
                      <td>Dr. {a.doctorName}</td>
                      <td>{format(new Date(a.appointmentDate), 'dd MMM yyyy')} · {a.timeSlot}</td>
                      <td><span className="badge badge-gray">{a.type}</span></td>
                      <td>{statusBadge(a.status)}</td>
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
