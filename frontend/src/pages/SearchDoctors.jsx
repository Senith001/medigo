import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { appointmentAPI } from '../services/api'

const SPECIALTIES = [
  'All','Cardiology','Dermatology','Neurology','Orthopedics','Pediatrics',
  'Psychiatry','Gynecology','General Medicine','Ophthalmology','ENT','Urology','Oncology',
]

export default function SearchDoctors() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const params    = new URLSearchParams(location.search)

  const [specialty, setSpecialty] = useState(params.get('specialty') || '')
  const [search,    setSearch]    = useState(params.get('name') || '')
  const [doctors,   setDoctors]   = useState([])
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  const fetchDoctors = async (spec) => {
    setLoading(true); setError('')
    try {
      const q = spec && spec !== 'All' ? spec : specialty && specialty !== 'All' ? specialty : 'General Medicine'
      const res = await appointmentAPI.searchDoctors(q)
      setDoctors(res.data.doctors || [])
    } catch { setDoctors([]) } finally { setLoading(false) }
  }

  useEffect(() => { fetchDoctors(specialty) }, [])

  const filtered = doctors.filter(d =>
    !search || d.fullName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-700 to-navy-800 py-10">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="font-display text-3xl font-black text-white mb-1">Find a Doctor</h1>
          <p className="text-white/50 text-sm">Search from 500+ verified specialists</p>

          {/* Search bar */}
          <div className="flex gap-3 mt-5">
            <input
              type="text"
              placeholder="Search doctor name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all max-w-sm"
            />
            <select
              value={specialty}
              onChange={e => { setSpecialty(e.target.value); fetchDoctors(e.target.value) }}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-teal-400 transition-all"
            >
              {SPECIALTIES.map(s => <option key={s} className="text-gray-900">{s}</option>)}
            </select>
            <button onClick={() => fetchDoctors(specialty)} className="btn btn-teal px-6">
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm">
            {loading ? 'Searching…' : `${filtered.length} doctor${filtered.length !== 1 ? 's' : ''} found`}
            {specialty && specialty !== 'All' ? ` in ${specialty}` : ''}
          </p>
          <div className="flex gap-2">
            {['All','Cardiology','Dermatology','General Medicine'].map(s => (
              <button key={s}
                onClick={() => { setSpecialty(s); fetchDoctors(s) }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${specialty === s ? 'bg-teal-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-300'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-8 bg-gray-100 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* Doctor cards */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((doc, i) => (
              <DoctorCard key={doc._id} doc={doc} index={i} onBook={() =>
                navigate('/book', { state: { doctor: doc } })
              } />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 opacity-30">🔍</div>
            <h3 className="font-display font-bold text-gray-400 text-lg mb-1">No doctors found</h3>
            <p className="text-gray-400 text-sm">Try a different specialty or search term</p>
          </div>
        )}
      </div>
    </div>
  )
}

function DoctorCard({ doc, index, onBook }) {
  const initials = (doc.fullName || '').replace('Dr. ', '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const rating = (4.5 + Math.random() * 0.4).toFixed(1)

  return (
    <div className="card p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 animate-fade-up flex flex-col"
      style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 font-display font-black text-base flex items-center justify-center flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-gray-900 text-base leading-tight truncate">{doc.fullName}</h3>
          <p className="text-teal-600 text-xs font-semibold mt-0.5">{doc.specialty}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-amber-400 text-xs">★</span>
            <span className="text-gray-600 text-xs font-semibold">{rating}</span>
            <span className="text-gray-300 text-xs mx-1">·</span>
            <span className="text-gray-400 text-xs">{doc.experienceYears || '5'}+ yrs exp</span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 mb-4 flex-1">
        {doc.hospital && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="text-gray-300">🏥</span> {doc.hospital}
          </div>
        )}
        {doc.qualifications && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="text-gray-300">🎓</span> {doc.qualifications}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-400">Consultation fee</span>
          <div className="font-display font-black text-gray-900 text-lg">
            Rs. {(doc.fee || 0).toLocaleString()}
          </div>
        </div>
        <button onClick={onBook}
          className="btn btn-teal btn-sm">
          Book →
        </button>
      </div>
    </div>
  )
}
