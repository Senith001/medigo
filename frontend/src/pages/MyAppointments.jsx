import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { appointmentAPI } from '../services/api'

const TABS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled']

const STATUS_STYLE = {
  pending:   'badge-pending',
  confirmed: 'badge-confirmed',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
  'no-show': 'badge-no-show',
}

export default function MyAppointments() {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [tab, setTab]           = useState('All')
  const [loading, setLoading]   = useState(true)
  const [cancelling, setCancelling] = useState(null)

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const res = await appointmentAPI.getAll({ status: tab !== 'All' ? tab.toLowerCase() : undefined })
      setAppointments(res.data.appointments || [])
    } catch { setAppointments([]) } finally { setLoading(false) }
  }

  useEffect(() => { fetchAppointments() }, [tab])

  const handleCancel = async (id) => {
    const reason = window.prompt('Please provide a reason for cancellation (optional):')
    if (reason === null) return // User cancelled the prompt

    setCancelling(id)
    try {
      await appointmentAPI.cancel(id, reason || 'Patient requested cancellation')
      fetchAppointments()
    } finally { setCancelling(null) }
  }

  const fmt = (d) => new Date(d).toLocaleDateString('en-LK', { weekday:'short', month:'short', day:'numeric', year:'numeric' })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-700 to-navy-800 py-8">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="font-display text-3xl font-black text-white mb-1">My Appointments</h1>
          <p className="text-white/50 text-sm">Manage your upcoming and past appointments</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm mb-6 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-bold flex-shrink-0 transition-all ${
                tab === t ? 'bg-navy-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List */}
        {!loading && appointments.length > 0 && (
          <div className="space-y-4">
            {appointments.map((apt, i) => (
              <div key={apt._id} className="card p-5 hover:shadow-md transition-all duration-200 animate-fade-up"
                style={{ animationDelay: `${i * 0.04}s` }}>
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 font-display font-black text-sm flex items-center justify-center flex-shrink-0">
                    {apt.doctorName?.replace('Dr. ','').split(' ').map(n => n[0]).join('').slice(0,2)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h3 className="font-display font-bold text-gray-900">{apt.doctorName}</h3>
                        <p className="text-teal-600 text-xs font-semibold">{apt.specialty}</p>
                      </div>
                      <span className={`badge ${STATUS_STYLE[apt.status] || 'badge-no-show'}`}>
                        {apt.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                      <span>📅 {fmt(apt.appointmentDate)}</span>
                      <span>🕐 {apt.timeSlot}</span>
                      <span>{apt.type === 'telemedicine' ? '📹 Video' : '🏥 In-Person'}</span>
                      <span>💰 Rs. {apt.fee?.toLocaleString() || 0}</span>
                    </div>

                    {apt.reason && (
                      <p className="text-xs text-gray-400 mt-1.5 italic">"{apt.reason}"</p>
                    )}

                    {/* Actions */}
                    {['pending','confirmed'].includes(apt.status) && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => navigate(`/appointments/${apt._id}/reschedule`)}
                          className="btn btn-outline btn-sm">
                          Reschedule
                        </button>
                        <button
                          onClick={() => handleCancel(apt._id)}
                          disabled={cancelling === apt._id}
                          className="btn btn-sm bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-50">
                          {cancelling === apt._id ? 'Cancelling…' : 'Cancel'}
                        </button>
                      </div>
                    )}

                    {apt.meetingLink && apt.status === 'confirmed' && (
                      <a href={apt.meetingLink} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 btn btn-teal btn-sm mt-3">
                        📹 Join Consultation
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && appointments.length === 0 && (
          <div className="card text-center py-20 px-6">
            <div className="text-5xl mb-4 opacity-30">📋</div>
            <h3 className="font-display font-bold text-gray-400 text-lg mb-1">No appointments{tab !== 'All' ? ` with status "${tab}"` : ''}</h3>
            <p className="text-gray-400 text-sm mb-6">Start by booking your first appointment</p>
            <button onClick={() => navigate('/search')} className="btn btn-teal mx-auto">
              Find a Doctor →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
