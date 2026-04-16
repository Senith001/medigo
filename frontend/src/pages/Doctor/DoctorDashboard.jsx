import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { appointmentAPI } from '../../services/api'

const STATUS_STYLE = {
  pending:'badge-pending', confirmed:'badge-confirmed',
  completed:'badge-completed', cancelled:'badge-cancelled', 'no-show':'badge-no-show',
}

export default function DoctorDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [tab, setTab] = useState('pending')

  const fetchApts = async () => {
    setLoading(true)
    try {
      const res = await appointmentAPI.getAll({ status: tab })
      setAppointments(res.data.appointments || [])
    } catch { setAppointments([]) } finally { setLoading(false) }
  }

  useEffect(() => { fetchApts() }, [tab])

  const updateStatus = async (id, status, meetingLink) => {
    setUpdating(id)
    try {
      await appointmentAPI.updateStatus(id, { status, meetingLink })
      fetchApts()
    } finally { setUpdating(null) }
  }

  const stats = [
    { label: 'Pending',   icon: '⏳', val: appointments.filter(a => a.status === 'pending').length,   color: 'bg-amber-50 border-amber-200 text-amber-700' },
    { label: 'Confirmed', icon: '✅', val: appointments.filter(a => a.status === 'confirmed').length, color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { label: 'Today',     icon: '📅', val: appointments.filter(a => new Date(a.appointmentDate).toDateString() === new Date().toDateString()).length, color: 'bg-teal-50 border-teal-200 text-teal-700' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Layout */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-navy-700 flex-shrink-0 hidden lg:flex flex-col">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-2 font-display font-black text-xl text-white">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <rect x="11" y="3" width="2" height="18"/><rect x="3" y="11" width="18" height="2"/>
                </svg>
              </div>
              MEDI<span className="text-teal-400">GO</span>
            </div>
            <div className="mt-4 text-white/60 text-xs font-semibold uppercase tracking-wider">Doctor Portal</div>
          </div>

          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500 text-white font-display font-black flex items-center justify-center">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="text-white font-bold text-sm leading-tight">{user?.name}</div>
                <div className="text-white/40 text-xs">{user?.email}</div>
              </div>
            </div>
          </div>

          <nav className="p-4 flex-1 space-y-1">
            {[
              { label:'Dashboard',    icon:'📊', active:true },
              { label:'Appointments', icon:'📋', active:false },
              { label:'Schedule',     icon:'📅', active:false },
            ].map(n => (
              <button key={n.label} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-all ${
                n.active ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white hover:bg-white/10'}`}>
                {n.icon} {n.label}
              </button>
            ))}
            <button onClick={() => navigate('/doctor/profile')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-all text-white/50 hover:text-white hover:bg-white/10">
              👤 Profile
            </button>
          </nav>

          <div className="p-4 border-t border-white/10">
            <button onClick={() => { logout(); navigate('/login') }}
              className="w-full btn btn-sm bg-red-500/10 border border-red-400/20 text-red-300 hover:bg-red-500/20 justify-center">
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="font-display font-black text-gray-900 text-xl">Doctor Dashboard</h1>
              <p className="text-gray-500 text-xs mt-0.5">
                {new Date().toLocaleDateString('en-LK', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}
              </p>
            </div>
            <button onClick={fetchApts} className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200">
              🔄 Refresh
            </button>
          </div>

          <div className="p-6">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {stats.map(s => (
                <div key={s.label} className={`card p-5 border flex items-center gap-4 ${s.color}`}>
                  <div className="text-3xl">{s.icon}</div>
                  <div>
                    <div className="font-display font-black text-2xl">{s.val}</div>
                    <div className="text-xs font-semibold opacity-70">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Appointment queue */}
            <div className="card overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                <h2 className="font-display font-bold text-gray-900 flex-1">Appointment Queue</h2>
                <div className="flex gap-1 bg-gray-50 rounded-xl p-1">
                  {['pending','confirmed','completed'].map(t => (
                    <button key={t} onClick={() => setTab(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                        tab === t ? 'bg-white text-navy-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="p-5 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex gap-4">
                      <div className="w-11 h-11 rounded-xl bg-gray-100" />
                      <div className="flex-1 space-y-2"><div className="h-4 bg-gray-100 rounded w-1/3" /><div className="h-3 bg-gray-100 rounded w-1/2" /></div>
                    </div>
                  ))}
                </div>
              ) : appointments.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-4xl mb-3 opacity-20">📋</div>
                  <p className="text-gray-400 text-sm">No {tab} appointments</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {appointments.map(apt => (
                    <div key={apt._id} className="p-5 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 font-display font-black text-sm flex items-center justify-center flex-shrink-0">
                          {apt.patientName?.split(' ').map(n => n[0]).join('').slice(0,2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              <h3 className="font-bold text-gray-900 text-sm">{apt.patientName}</h3>
                              <p className="text-gray-500 text-xs mt-0.5">
                                📅 {new Date(apt.appointmentDate).toDateString()} · {apt.timeSlot} · {apt.type === 'telemedicine' ? '📹 Video' : '🏥 In-Person'}
                              </p>
                              {apt.reason && <p className="text-gray-400 text-xs mt-1 italic">"{apt.reason}"</p>}
                            </div>
                            <span className={`badge ${STATUS_STYLE[apt.status] || 'badge-no-show'}`}>{apt.status}</span>
                          </div>

                          {/* Action buttons */}
                          {apt.status === 'pending' && (
                            <div className="flex gap-2 mt-3">
                              <button onClick={() => updateStatus(apt._id, 'confirmed')} disabled={updating === apt._id}
                                className="btn btn-sm bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 disabled:opacity-50">
                                {updating === apt._id ? '…' : '✅ Confirm'}
                              </button>
                              <button onClick={() => updateStatus(apt._id, 'no-show')} disabled={updating === apt._id}
                                className="btn btn-sm bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 disabled:opacity-50">
                                No-show
                              </button>
                            </div>
                          )}
                          {apt.status === 'confirmed' && (
                            <div className="flex gap-2 mt-3">
                              <button 
                                onClick={() => navigate(`/telemedicine/lobby/${apt._id}`)}
                                className="btn btn-sm bg-teal-600 text-white hover:bg-teal-700 font-bold"
                              >
                                🎥 Join Meeting
                              </button>
                              <button onClick={() => updateStatus(apt._id, 'completed')} disabled={updating === apt._id}
                                className="btn btn-sm bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 disabled:opacity-50">
                                Mark Complete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
