import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { doctorAPI } from '../../services/api'
import { Calendar, CheckCircle, Clock, Users } from 'lucide-react'
import { format } from 'date-fns'

const statusBadge = (s) => {
  const m = { pending:'badge-amber', confirmed:'badge-blue', completed:'badge-green', cancelled:'badge-red', 'no-show':'badge-gray' }
  return <span className={`badge ${m[s]||'badge-gray'}`}>{s}</span>
}

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    doctorAPI.getMyAppointments().then(r => setAppointments(r.data.appointments || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const today = appointments.filter(a => {
    const d = new Date(a.appointmentDate)
    const n = new Date()
    return d.toDateString() === n.toDateString()
  })
  const pending = appointments.filter(a => a.status === 'pending')
  const completed = appointments.filter(a => a.status === 'completed')
  const patients = [...new Set(appointments.map(a => a.patientId))].length

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome, Dr. {user?.fullName?.split(' ').slice(-1)[0]} 👨‍⚕️</h1>
        <p className="page-subtitle">Here's your practice summary</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: "Today's Appointments", value: today.length, icon: Calendar, color: '#2563eb', bg: '#eff6ff' },
          { label: 'Pending Approval', value: pending.length, icon: Clock, color: '#d97706', bg: '#fffbeb' },
          { label: 'Completed', value: completed.length, icon: CheckCircle, color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Total Patients', value: patients, icon: Users, color: '#7c3aed', bg: '#f5f3ff' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Sora, sans-serif' }}>{value}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Today's Schedule</h3>
          <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>{format(new Date(), 'dd MMMM yyyy')}</span>
        </div>
        {loading ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          : today.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}><Calendar size={36} style={{ margin: '0 auto 10px' }} /><p>No appointments today</p></div>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {today.sort((a,b) => a.timeSlot.localeCompare(b.timeSlot)).map(a => (
                <div key={a._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--gray-50)', borderRadius: 10, border: '1px solid var(--gray-200)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--blue-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--blue-700)', flexShrink: 0 }}>
                    {a.patientName?.[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{a.patientName}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{a.reason || 'No reason provided'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: 'var(--blue-700)' }}>{a.timeSlot}</div>
                    <div style={{ marginTop: 4 }}>{statusBadge(a.status)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}
