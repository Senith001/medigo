import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { appointmentAPI } from '../../services/api'

const METRIC_CARDS = (apts) => [
  { label:'Total Appointments', icon:'📋', val: apts.length,                                     color:'from-navy-700 to-navy-800', text:'text-white' },
  { label:'Pending Review',     icon:'⏳', val: apts.filter(a=>a.status==='pending').length,    color:'from-amber-500 to-amber-600',  text:'text-white' },
  { label:'Confirmed Today',    icon:'✅', val: apts.filter(a=>a.status==='confirmed').length,  color:'from-teal-500 to-teal-600',    text:'text-white' },
  { label:'Completed',          icon:'🎯', val: apts.filter(a=>a.status==='completed').length,  color:'from-green-500 to-green-600',  text:'text-white' },
]

const STATUS_STYLE = {
  pending:'badge-pending', confirmed:'badge-confirmed',
  completed:'badge-completed', cancelled:'badge-cancelled', 'no-show':'badge-no-show',
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [search, setSearch]     = useState('')
  const [cancelling, setCancelling] = useState(null)
  const [page, setPage]         = useState(1)
  const LIMIT = 10

  const isActive = (path) => location.pathname === path

  const navItems = [
    { label: 'Dashboard',    icon: '📊', path: '/admin' },
    { label: 'Doctors',      icon: '👨‍⚕️', path: '/admin/doctors' },
    { label: 'Payments',     icon: '💳', path: '/admin/payments' },
    { label: 'Patients',     icon: '👥', path: '/admin/patients' },
  ]

  const fetchApts = async () => {
    setLoading(true)
    try {
      const res = await appointmentAPI.getAllAdmin({ status: filter !== 'all' ? filter : undefined, limit: 100 })
      setAppointments(res.data.appointments || [])
    } catch { setAppointments([]) } finally { setLoading(false) }
  }

  useEffect(() => { fetchApts() }, [filter])

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return
    setCancelling(id)
    try {
      await appointmentAPI.cancel(id, 'Admin cancelled')
      fetchApts()
    } finally { setCancelling(null) }
  }

  const filtered = appointments.filter(a =>
    !search || a.patientName?.toLowerCase().includes(search.toLowerCase()) ||
               a.doctorName?.toLowerCase().includes(search.toLowerCase())
  )
  const total = filtered.length
  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT)

  return (
    <div className="min-h-screen bg-gray-950 flex transition-all">
      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-gray-900 border-r border-gray-800 flex-shrink-0 hidden lg:flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <Link to="/admin" className="flex items-center gap-2 font-display font-black text-xl text-white">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <rect x="11" y="3" width="2" height="18"/><rect x="3" y="11" width="18" height="2"/>
              </svg>
            </div>
            MEDI<span className="text-teal-400">GO</span>
          </Link>
          <div className="mt-2 inline-flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
            🛡️ Admin
          </div>
        </div>

        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500 text-white font-display font-black flex items-center justify-center text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="text-white font-bold text-sm">{user?.name}</div>
              <div className="text-gray-500 text-xs">Administrator</div>
            </div>
          </div>
        </div>

        <nav className="p-4 flex-1 space-y-1">
          {navItems.map(n => (
            <Link key={n.label} to={n.path}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-all ${
                isActive(n.path) ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-gray-500 hover:text-gray-200 hover:bg-gray-800 border border-transparent'
              }`}>
              {n.icon} {n.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button onClick={() => { logout(); navigate('/admin-login') }}
            className="w-full btn btn-sm bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 justify-center">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display font-black text-white text-xl">Admin Dashboard</h1>
            <p className="text-gray-500 text-xs mt-0.5">MEDIGO Control Panel</p>
          </div>
          <button onClick={fetchApts} className="btn btn-sm bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700">
            🔄 Refresh
          </button>
        </div>

        <div className="p-6">
          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {METRIC_CARDS(appointments).map(m => (
              <div key={m.label} className={`card p-5 bg-gradient-to-br ${m.color} border-0`}>
                <div className={`text-3xl mb-2 ${m.text}`}>{m.icon}</div>
                <div className={`font-display font-black text-3xl ${m.text}`}>{m.val}</div>
                <div className={`text-xs mt-1 opacity-70 ${m.text}`}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Appointment table */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            {/* Table header */}
            <div className="p-5 border-b border-gray-800 flex flex-wrap items-center gap-4">
              <h2 className="font-display font-bold text-white flex-1">All Appointments</h2>

              <input
                type="text"
                placeholder="Search patient or doctor…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-teal-500 transition-all w-56"
              />

              <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1) }}
                className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-gray-300 text-sm outline-none focus:border-teal-500 transition-all">
                {['all','pending','confirmed','completed','cancelled','no-show'].map(s => (
                  <option key={s} value={s} className="capitalize">{s === 'all' ? 'All Statuses' : s}</option>
                ))}
              </select>
            </div>

            {/* Table */}
            {loading ? (
              <div className="p-8 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-800 rounded w-1/4" />
                      <div className="h-3 bg-gray-800 rounded w-1/3" />
                    </div>
                    <div className="h-6 w-20 bg-gray-800 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        {['Patient','Doctor','Date & Time','Type','Status','Fee','Actions'].map(h => (
                          <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-5 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60">
                      {paginated.map(apt => (
                        <tr key={apt._id} className="hover:bg-gray-800/40 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-semibold text-white text-sm">{apt.patientName}</div>
                            <div className="text-gray-500 text-xs">{apt.patientEmail}</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-semibold text-gray-200 text-sm">{apt.doctorName}</div>
                            <div className="text-gray-500 text-xs">{apt.specialty}</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="text-gray-200 text-sm">{new Date(apt.appointmentDate).toLocaleDateString('en-LK',{month:'short',day:'numeric',year:'numeric'})}</div>
                            <div className="text-gray-500 text-xs">{apt.timeSlot}</div>
                          </td>
                          <td className="px-5 py-4 text-gray-400 text-xs">
                            {apt.type === 'telemedicine' ? '📹 Video' : '🏥 In-Person'}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`badge ${STATUS_STYLE[apt.status] || 'badge-no-show'}`}>{apt.status}</span>
                          </td>
                          <td className="px-5 py-4 text-gray-300 text-sm font-semibold">
                            Rs. {apt.fee?.toLocaleString() || 0}
                          </td>
                          <td className="px-5 py-4">
                            {['pending','confirmed'].includes(apt.status) && (
                              <button onClick={() => handleCancel(apt._id)} disabled={cancelling === apt._id}
                                className="text-red-400 hover:text-red-300 text-xs font-bold disabled:opacity-50 transition-colors">
                                {cancelling === apt._id ? '…' : 'Cancel'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {total > LIMIT && (
                  <div className="p-4 border-t border-gray-800 flex items-center justify-between">
                    <span className="text-gray-500 text-xs">{total} total appointments</span>
                    <div className="flex gap-2">
                      <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                        className="btn btn-sm bg-gray-800 text-gray-300 border border-gray-700 disabled:opacity-40">← Prev</button>
                       <span className="flex items-center px-3 text-gray-400 text-sm">Page {page} of {Math.ceil(total/LIMIT)}</span>
                      <button disabled={page >= Math.ceil(total/LIMIT)} onClick={() => setPage(p => p + 1)}
                        className="btn btn-sm bg-gray-800 text-gray-300 border border-gray-700 disabled:opacity-40">Next →</button>
                    </div>
                  </div>
                )}

                {total === 0 && !loading && (
                  <div className="p-12 text-center">
                    <div className="text-4xl mb-3 opacity-20">📋</div>
                    <p className="text-gray-500">No appointments found</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}