import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { appointmentAPI } from '../../services/api'
import { Badge, EmptyState, PageLoader } from '../../components/ui/index.jsx'

const FILTERS = ['all','pending','confirmed','completed','cancelled']

export default function PatientAppointments() {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [cancelling, setCancelling] = useState(null)

  const fetch = () => {
    setLoading(true); setError('')
    appointmentAPI.getAll(filter !== 'all' ? { status: filter } : {})
      .then(r => setAppointments(r.data.appointments || []))
      .catch(() => setError('Could not load appointments. Make sure appointment-service is running.'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetch() }, [filter])

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return
    setCancelling(id)
    try { await appointmentAPI.cancel(id, 'Patient cancelled'); fetch() }
    catch { alert('Failed to cancel. Please try again.') }
    finally { setCancelling(null) }
  }

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)
  const counts = FILTERS.slice(1).reduce((acc, s) => { acc[s] = appointments.filter(a => a.status === s).length; return acc }, {})

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900">My Appointments</h1>
            <p className="text-sm text-gray-400 mt-0.5">{appointments.length} total appointments</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/search')}>+ New Appointment</button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold border transition-all ${
                filter === f ? 'bg-navy border-navy text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && counts[f] > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter===f?'bg-white/20':'bg-gray-100'}`}>{counts[f]}</span>
              )}
            </button>
          ))}
        </div>

        {error ? (
          <div className="card p-8 text-center">
            <p className="text-red-400 mb-3">{error}</p>
            <button className="btn-outline btn-sm" onClick={fetch}>Retry</button>
          </div>
        ) : loading ? <PageLoader/> : filtered.length === 0 ? (
          <div className="card">
            <EmptyState icon="📅" title="No appointments" message="Book your first appointment">
              <button className="btn-primary btn-sm mt-3" onClick={() => navigate('/search')}>Find a Doctor</button>
            </EmptyState>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((appt, i) => (
              <div key={appt._id} className={`card p-5 hover:shadow-md transition-all ${['completed','cancelled'].includes(appt.status) ? 'opacity-75' : ''}`}
                style={{ animation: `fadeUp 0.3s ease ${i*0.04}s both` }}>
                <div className="flex items-center gap-4">
                  <div className="bg-teal-lighter border border-teal/20 rounded-xl p-3 text-center min-w-[52px] flex-shrink-0">
                    <div className="font-display font-black text-2xl text-teal leading-none">{format(new Date(appt.appointmentDate),'d')}</div>
                    <div className="text-xs font-bold text-teal/70 uppercase">{format(new Date(appt.appointmentDate),'MMM')}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-display font-bold text-gray-900">{appt.doctorName}</span>
                      <Badge status={appt.status}/>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                      {appt.hospital && <span>🏥 {appt.hospital}</span>}
                      <span>⏰ {appt.timeSlot}</span>
                      <span>{appt.type === 'telemedicine' ? '📹 Video' : '🏥 In-Person'}</span>
                      {appt.fee > 0 && <span>💰 Rs. {appt.fee?.toLocaleString()}</span>}
                    </div>
                    {appt.reason && <p className="text-xs text-gray-400 italic mt-1">"{appt.reason}"</p>}
                    {appt.cancellationReason && <p className="text-xs text-red-400 mt-1">Cancelled: {appt.cancellationReason}</p>}
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {appt.meetingLink && appt.status === 'confirmed' && (
                      <a href={appt.meetingLink} target="_blank" rel="noreferrer" className="btn-primary btn-sm text-xs">📹 Join</a>
                    )}
                    {['pending','confirmed'].includes(appt.status) && (
                      <>
                        <button className="btn-outline btn-sm text-xs" onClick={() => navigate(`/patient/appointments/${appt._id}/reschedule`)}>Reschedule</button>
                        <button className="btn-danger btn-sm text-xs" onClick={() => handleCancel(appt._id)} disabled={cancelling === appt._id}>
                          {cancelling === appt._id ? '...' : 'Cancel'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
