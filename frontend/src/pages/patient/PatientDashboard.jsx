import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { appointmentAPI, patientAPI } from '../../services/api'
import { Calendar, Search, FileText, CreditCard, Clock, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'

const statusBadge = (status) => {
  const map = { pending: 'badge-amber', confirmed: 'badge-blue', completed: 'badge-green', cancelled: 'badge-red', 'no-show': 'badge-gray' }
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>
}

export default function PatientDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    appointmentAPI.getMy({ limit: 5 }).then(r => setAppointments(r.data.appointments || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const upcoming = appointments.filter(a => ['pending', 'confirmed'].includes(a.status))
  const completed = appointments.filter(a => a.status === 'completed').length

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.fullName?.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Here's your health summary</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Upcoming', value: upcoming.length, icon: Calendar, color: '#2563eb', bg: '#eff6ff' },
          { label: 'Completed', value: completed, icon: CheckCircle, color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Total Visits', value: appointments.length, icon: Clock, color: '#d97706', bg: '#fffbeb' },
          { label: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length, icon: XCircle, color: '#dc2626', bg: '#fef2f2' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Sora, sans-serif', color: 'var(--gray-900)' }}>{value}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
        <Link to="/patient/doctors" className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none', transition: 'box-shadow 0.2s', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search size={22} color="#2563eb" />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>Find a Doctor</div>
            <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>Browse by specialty</div>
          </div>
        </Link>
        <Link to="/patient/reports" className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none', transition: 'box-shadow 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={22} color="#16a34a" />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>My Reports</div>
            <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>Upload & view reports</div>
          </div>
        </Link>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Recent Appointments</h3>
          <Link to="/patient/appointments" style={{ fontSize: 13, color: 'var(--blue-600)' }}>View all</Link>
        </div>
        {loading ? <div style={{ textAlign: 'center', padding: '32px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          : appointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
              <Calendar size={40} style={{ margin: '0 auto 12px' }} />
              <p>No appointments yet</p>
              <Link to="/patient/doctors" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Book Now</Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Doctor</th><th>Date</th><th>Time</th><th>Type</th><th>Status</th></tr></thead>
                <tbody>
                  {appointments.map(a => (
                    <tr key={a._id}>
                      <td style={{ fontWeight: 500 }}>Dr. {a.doctorName}</td>
                      <td>{format(new Date(a.appointmentDate), 'dd MMM yyyy')}</td>
                      <td>{a.timeSlot}</td>
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
