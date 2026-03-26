import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useAuth } from '../../context/AuthContext'
import { appointmentAPI } from '../../services/api'
import { StatCard, Badge, EmptyState, SectionHeader, PageLoader } from '../../components/ui/index.jsx'

export default function PatientDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    appointmentAPI.getAll({ limit: 10 })
      .then(r => setAppointments(r.data.appointments || []))
      .catch(() => setError('Could not load appointments.'))
      .finally(() => setLoading(false))
  }, [])

  const upcoming  = appointments.filter(a => ['pending','confirmed'].includes(a.status))
  const completed = appointments.filter(a => a.status === 'completed')
  const cancelled = appointments.filter(a => a.status === 'cancelled')
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome */}
        <div className="rounded-2xl bg-gradient-to-r from-navy to-navy-light p-7 relative overflow-hidden">
          <div className="absolute w-48 h-48 bg-teal/10 rounded-full -top-12 -right-12"/>
          <div className="relative">
            <p className="text-white/50 text-sm mb-1">{new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
            <h1 className="font-display font-black text-2xl text-white mb-2">{greeting}, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-white/60 text-sm mb-5">
              {loading ? 'Loading your appointments…' :
               upcoming.length > 0 ? `You have ${upcoming.length} upcoming appointment${upcoming.length > 1 ? 's' : ''}.` :
               'No upcoming appointments. Book one today!'}
            </p>
            <button className="btn-primary" onClick={() => navigate('/search')}>+ Book Appointment</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon="📋" label="Total" value={loading ? '—' : appointments.length} color="blue"/>
          <StatCard icon="📅" label="Upcoming" value={loading ? '—' : upcoming.length} color="teal"/>
          <StatCard icon="✅" label="Completed" value={loading ? '—' : completed.length} color="green"/>
          <StatCard icon="❌" label="Cancelled" value={loading ? '—' : cancelled.length} color="red"/>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon:'🔍', label:'Find Doctor',    path:'/search',               color:'bg-blue-50 border-blue-200'    },
            { icon:'📅', label:'Appointments',   path:'/patient/appointments', color:'bg-teal-50 border-teal-200'    },
            { icon:'📋', label:'My Reports',     path:'/patient/reports',      color:'bg-emerald-50 border-emerald-200'},
            { icon:'💊', label:'Prescriptions',  path:'/patient/prescriptions',color:'bg-purple-50 border-purple-200' },
          ].map(a => (
            <button key={a.path} onClick={() => navigate(a.path)}
              className={`card card-hover p-4 text-center border ${a.color} cursor-pointer`}>
              <div className="text-2xl mb-2">{a.icon}</div>
              <div className="text-sm font-bold text-gray-700">{a.label}</div>
            </button>
          ))}
        </div>

        {/* Upcoming */}
        <div className="card p-6">
          <SectionHeader title="Upcoming Appointments"
            action={<button className="btn-ghost text-sm text-teal font-bold" onClick={() => navigate('/patient/appointments')}>View all →</button>}
          />
          {loading ? <PageLoader/> : error ? (
            <p className="text-red-400 text-sm text-center py-8">{error}</p>
          ) : upcoming.length === 0 ? (
            <EmptyState icon="📅" title="No upcoming appointments" message="Book an appointment to get started">
              <button className="btn-primary btn-sm mt-3" onClick={() => navigate('/search')}>Find a Doctor</button>
            </EmptyState>
          ) : (
            <div className="space-y-3">
              {upcoming.map(appt => (
                <div key={appt._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 transition-all">
                  <div className="bg-teal-lighter border border-teal/20 rounded-xl p-3 text-center min-w-[52px]">
                    <div className="font-display font-black text-xl text-teal leading-none">{format(new Date(appt.appointmentDate),'d')}</div>
                    <div className="text-xs font-bold text-teal/70 uppercase">{format(new Date(appt.appointmentDate),'MMM')}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-sm">{appt.doctorName}</div>
                    <div className="text-xs text-gray-400 mt-0.5">⏰ {appt.timeSlot} · {appt.type === 'telemedicine' ? '📹 Video' : '🏥 In-Person'}</div>
                  </div>
                  <Badge status={appt.status}/>
                  {appt.meetingLink && appt.status === 'confirmed' && (
                    <a href={appt.meetingLink} target="_blank" rel="noreferrer" className="btn-primary btn-sm text-xs">Join</a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
