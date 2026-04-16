import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { appointmentAPI } from '../../services/api'

const SPECIALTIES = [
  { name: 'Cardiology',       icon: '❤️',  color: 'bg-red-50 border-red-200' },
  { name: 'Dermatology',      icon: '🧴',  color: 'bg-amber-50 border-amber-200' },
  { name: 'Neurology',        icon: '🧠',  color: 'bg-purple-50 border-purple-200' },
  { name: 'Orthopedics',      icon: '🦴',  color: 'bg-blue-50 border-blue-200' },
  { name: 'Pediatrics',       icon: '👶',  color: 'bg-green-50 border-green-200' },
  { name: 'Psychiatry',       icon: '🧘',  color: 'bg-sky-50 border-sky-200' },
  { name: 'Gynecology',       icon: '🌸',  color: 'bg-pink-50 border-pink-200' },
  { name: 'General Medicine', icon: '🩺',  color: 'bg-teal-50 border-teal-200' },
]

export default function PatientDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [specialty, setSpecialty] = useState('')
  const [doctorName, setDoctorName] = useState('')
  const [recentApts, setRecentApts] = useState([])
  const [aptLoading, setAptLoading] = useState(true)

  useEffect(() => {
    appointmentAPI.getAll({ limit: 3 })
      .then(r => setRecentApts(r.data.appointments || []))
      .catch(() => setRecentApts([]))
      .finally(() => setAptLoading(false))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/search?specialty=${specialty}&name=${doctorName}`)
  }

  const STATUS_STYLE = {
    pending:'badge-pending', confirmed:'badge-confirmed',
    completed:'badge-completed', cancelled:'badge-cancelled',
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-700 to-navy-800 pb-20 pt-8">
        <div className="absolute w-80 h-80 rounded-full bg-teal-500/10 -top-16 -right-16 pointer-events-none" />
        <div className="absolute w-56 h-56 rounded-full bg-teal-400/5 bottom-0 left-10 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative">
          {/* Top bar */}
          <div className="flex justify-end gap-2 mb-6">
            <button onClick={() => navigate('/appointments')}
              className="btn btn-sm bg-white/10 border border-white/20 text-white hover:bg-white/20">
              📋 My Appointments
            </button>
            <button onClick={() => { logout(); navigate('/login') }}
              className="btn btn-sm bg-transparent border border-red-400/30 text-red-300 hover:bg-red-500/10">
              Sign Out
            </button>
          </div>

          {/* Greeting */}
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-teal-500/15 border border-teal-400/30 text-teal-300 text-xs font-bold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              Patient Portal Active
            </div>
            <h1 className="font-display text-5xl font-black text-white mb-4 leading-tight">
              Welcome back,<br />
              <span className="text-teal-400">{user?.name || 'Patient'}</span> 👋
            </h1>
            <p className="text-white/50 text-lg mb-8">
              Find and book specialists across Sri Lanka
            </p>

            {/* Search card */}
            <div className="bg-white rounded-2xl p-5 shadow-xl">
              <form onSubmit={handleSearch}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    className="form-input sm:col-span-1"
                    placeholder="Doctor name…"
                    value={doctorName}
                    onChange={e => setDoctorName(e.target.value)}
                  />
                  <select
                    className="form-input"
                    value={specialty}
                    onChange={e => setSpecialty(e.target.value)}
                  >
                    <option value="">All Specialties</option>
                    {SPECIALTIES.map(s => <option key={s.name}>{s.name}</option>)}
                  </select>
                  <button type="submit" className="btn btn-navy w-full justify-center">
                    🔍 Search
                  </button>
                </div>
              </form>
              {/* Quick pills */}
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">Quick:</span>
                {['Cardiology','Dermatology','Pediatrics','General Medicine'].map(s => (
                  <button key={s} onClick={() => navigate(`/search?specialty=${s}`)}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="bg-navy-800 py-6">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-4 gap-0">
          {[
            { val: '500+', label: 'Verified Doctors' },
            { val: '20+',  label: 'Specializations' },
            { val: '50K+', label: 'Appointments' },
            { val: '4.9★', label: 'Average Rating' },
          ].map((s, i) => (
            <div key={s.label} className={`text-center py-1 ${i < 3 ? 'border-r border-white/10' : ''}`}>
              <div className="font-display font-black text-2xl text-teal-400">{s.val}</div>
              <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Specialties grid */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-black text-gray-900">Browse by Specialty</h2>
              <button onClick={() => navigate('/search')} className="text-teal-600 text-sm font-bold hover:text-teal-700">
                View All →
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SPECIALTIES.map((s, i) => (
                <button key={s.name} onClick={() => navigate(`/search?specialty=${s.name}`)}
                  className={`card p-4 text-center hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer animate-fade-up border ${s.color}`}
                  style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="text-xs font-bold text-gray-700 leading-tight">{s.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent appointments */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-black text-gray-900">Recent Activity</h2>
              <button onClick={() => navigate('/appointments')} className="text-teal-600 text-sm font-bold">
                View All →
              </button>
            </div>

            {aptLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="card p-4 animate-pulse">
                    <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : recentApts.length === 0 ? (
              <div className="card p-8 text-center">
                <div className="text-3xl mb-3 opacity-30">📋</div>
                <p className="text-gray-400 text-sm mb-3">No appointments yet</p>
                <button onClick={() => navigate('/search')} className="btn btn-teal btn-sm">
                  Book now →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApts.map(apt => (
                  <div key={apt._id} className="card p-4 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{apt.doctorName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(apt.appointmentDate).toLocaleDateString('en-LK',{month:'short',day:'numeric'})} · {apt.timeSlot}
                        </p>
                      </div>
                      <span className={`badge ${STATUS_STYLE[apt.status] || 'badge-no-show'}`}>{apt.status}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      {apt.status === 'pending' && (
                        <button 
                          onClick={() => navigate(`/payment/${apt._id}`)}
                          className="flex-1 py-1.5 bg-teal-600 text-white text-[10px] font-bold rounded-lg hover:bg-teal-700 transition"
                        >
                          💳 Pay Now
                        </button>
                      )}
                      {apt.status === 'confirmed' && (
                        <button 
                          onClick={() => navigate(`/telemedicine/lobby/${apt._id}`)}
                          className="flex-1 py-1.5 bg-navy-700 text-white text-[10px] font-bold rounded-lg hover:bg-navy-800 transition"
                        >
                          🎥 Join Meeting
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button onClick={() => navigate('/appointments')}
                  className="w-full btn btn-outline btn-sm mt-1">
                  All Appointments →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}