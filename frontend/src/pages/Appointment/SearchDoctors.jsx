import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Search, Star, ChevronRight, Stethoscope,
  Loader2, AlertCircle, Video, Building2,
  Clock, BadgeCheck, SlidersHorizontal, X, Users
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from '../../components/DashboardLayout'
import { doctorAPI } from '../../services/api'

const SPECIALTIES = [
  'All', 'Cardiology', 'Dermatology', 'Neurology', 'Orthopedics',
  'Pediatrics', 'Psychiatry', 'Gynecology', 'General Medicine',
  'Ophthalmology', 'ENT', 'Urology', 'Oncology', 'Immunology'
]

const SPECIALTY_META = {
  Cardiology:         { icon: '❤️', color: 'bg-red-50 text-red-600 border-red-100' },
  Dermatology:        { icon: '🧬', color: 'bg-pink-50 text-pink-600 border-pink-100' },
  Neurology:          { icon: '🧠', color: 'bg-purple-50 text-purple-600 border-purple-100' },
  Orthopedics:        { icon: '🦴', color: 'bg-orange-50 text-orange-600 border-orange-100' },
  Pediatrics:         { icon: '👶', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
  Psychiatry:         { icon: '💭', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  Gynecology:         { icon: '🌸', color: 'bg-rose-50 text-rose-600 border-rose-100' },
  'General Medicine': { icon: '🏥', color: 'bg-green-50 text-green-600 border-green-100' },
  Ophthalmology:      { icon: '👁️', color: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
  ENT:                { icon: '👂', color: 'bg-teal-50 text-teal-600 border-teal-100' },
  Urology:            { icon: '💧', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  Oncology:           { icon: '🔬', color: 'bg-slate-50 text-slate-600 border-slate-200' },
  Immunology:         { icon: '🛡️', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
}

const AVATAR_GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-teal-500 to-cyan-600',
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-green-600',
]

export default function SearchDoctors() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [allDoctors, setAllDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [nameFilter, setNameFilter] = useState(searchParams.get('name') || '')
  const [specFilter, setSpecFilter] = useState(searchParams.get('specialty') || 'All')

  // Fetch all doctors once — filter client-side
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await doctorAPI.getProfiles({})
        if (res.data.success) setAllDoctors(res.data.data)
        else setError('Unable to retrieve doctors.')
      } catch {
        setError('Network error. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Compute filtered list reactively — no stale closures possible
  const doctors = allDoctors.filter(d => {
    const matchName = !nameFilter.trim() ||
      d.fullName?.toLowerCase().includes(nameFilter.toLowerCase())
    const matchSpec = !specFilter || specFilter === 'All' ||
      d.specialty?.toLowerCase() === specFilter.toLowerCase()
    return matchName && matchSpec
  })

  const handleSearch = (e) => e?.preventDefault()
  const selectSpecialty = (s) => setSpecFilter(s)
  const clearFilters = () => { setNameFilter(''); setSpecFilter('All') }
  const hasFilters = nameFilter || (specFilter && specFilter !== 'All')




  return (
    <DashboardLayout isPatient={true}>
      <div className="max-w-7xl mx-auto space-y-6 pb-20" style={{ fontFamily: "'Inter', sans-serif" }}>

        {/* ── Hero Banner ── */}
        <div className="relative rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0c1a2e 100%)' }}>
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
          <div className="absolute -bottom-10 left-10 w-60 h-60 rounded-full opacity-8" style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />

          <div className="relative z-10 p-8 sm:p-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1.5 mb-5">
              <Stethoscope size={14} className="text-blue-400" />
              <span className="text-blue-300 text-xs font-bold uppercase tracking-wider">MediGo Doctor Directory</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-2">
              Find Your <span className="text-transparent" style={{ WebkitBackgroundClip: 'text', backgroundClip: 'text', backgroundImage: 'linear-gradient(90deg, #60a5fa, #34d399)' }}>Perfect Doctor</span>
            </h1>
            <p className="text-slate-400 text-sm mb-7 max-w-lg">
              Browse from our network of verified specialists and book your appointment instantly.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  placeholder="Search by doctor name..."
                  value={nameFilter}
                  onChange={e => setNameFilter(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-xl text-sm font-medium outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(96,165,250,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="h-12 px-7 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', boxShadow: '0 4px 15px rgba(37,99,235,0.4)' }}
              >
                {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Search'}
              </button>
              {hasFilters && (
                <button type="button" onClick={clearFilters}
                  className="h-12 px-4 rounded-xl font-bold text-sm text-slate-300 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2">
                  <X size={14} /> Clear
                </button>
              )}
            </form>
          </div>
        </div>

        {/* ── Specialty Filter Pills ── */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal size={14} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filter by Specialty</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map(s => {
              const meta = SPECIALTY_META[s]
              const isActive = specFilter === s || (s === 'All' && (!specFilter || specFilter === 'All'))
              return (
                <button
                  key={s}
                  onClick={() => selectSpecialty(s)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    isActive
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                      : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {meta && <span>{meta.icon}</span>}
                  {s}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Results Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {loading ? (
              <span className="text-sm text-slate-400 font-medium">Searching...</span>
            ) : (
              <>
                <Users size={16} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-600">
                  <span className="text-blue-600">{doctors.length}</span> doctors found
                  {specFilter && specFilter !== 'All' && <span className="text-slate-400 font-medium"> in {specFilter}</span>}
                </span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse ml-1" />
              </>
            )}
          </div>
        </div>

        {/* ── Results ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-16" />
                    <div className="h-4 bg-slate-100 rounded w-28" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-100 rounded" />
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                </div>
                <div className="h-10 bg-slate-100 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-red-100 p-10 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={24} className="text-red-400" />
            </div>
            <p className="font-bold text-slate-700 mb-1">Something went wrong</p>
            <p className="text-slate-400 text-sm mb-4">{error}</p>
            <button onClick={fetchDoctors}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all">
              Try Again
            </button>
          </div>
        ) : doctors.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-100 p-16 text-center">
            <div className="text-5xl mb-3">🔍</div>
            <h3 className="text-lg font-black text-slate-700 mb-1">No doctors found</h3>
            <p className="text-slate-400 text-sm mb-4">
              Try searching with a different name or selecting another specialty.
            </p>
            <button onClick={clearFilters}
              className="px-5 py-2 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition-all">
              Clear Filters
            </button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {doctors.map((doc, i) => (
                <DoctorCard
                  key={doc._id}
                  doctor={doc}
                  index={i}
                  onBook={() => navigate(`/doctor/${doc._id}/sessions`, { state: { doctor: doc } })}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  )
}

function DoctorCard({ doctor, index, onBook }) {
  const initials = (doctor.fullName || 'DR')
    .replace(/^Dr\.?\s*/i, '')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const gradient = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length]
  const specialtyMeta = SPECIALTY_META[doctor.specialty]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.035 }}
      className="bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-200 group flex flex-col overflow-hidden"
    >
      {/* Card Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start gap-3 mb-4">
          {/* Avatar */}
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black text-lg shadow-md relative shrink-0`}>
            {initials}
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
          </div>

          {/* Name & Specialty */}
          <div className="flex-1 min-w-0">
            {specialtyMeta && (
              <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border mb-1 ${specialtyMeta.color}`}>
                {specialtyMeta.icon} {doctor.specialty}
              </span>
            )}
            <h3 className="font-black text-slate-800 text-sm leading-tight truncate group-hover:text-blue-600 transition-colors">
              {doctor.fullName}
            </h3>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2">
          {/* Rating & Experience */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} fill="#f59e0b" className="text-amber-400" />
              ))}
              <span className="text-xs font-bold text-slate-600 ml-1">4.9</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <Clock size={11} />
              {doctor.experienceYears || '—'}y experience
            </div>
          </div>

          {/* Location */}
          {doctor.clinicLocation && (
            <div className="flex items-start gap-1.5 text-xs text-slate-500">
              <Building2 size={12} className="mt-0.5 shrink-0 text-slate-400" />
              <span className="line-clamp-1">{doctor.clinicLocation}</span>
            </div>
          )}

          {/* Qualifications */}
          {doctor.qualifications && (
            <div className="flex items-start gap-1.5 text-xs text-slate-500">
              <BadgeCheck size={12} className="mt-0.5 shrink-0 text-blue-400" />
              <span className="line-clamp-1">{doctor.qualifications}</span>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-50 mx-5" />

      {/* Card Footer */}
      <div className="p-4 mt-auto">
        <div className="flex items-center justify-between mb-3">
          {/* Consultation type badge */}
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${
            doctor.offersTelemedicine
              ? 'bg-blue-50 text-blue-600'
              : 'bg-slate-50 text-slate-500'
          }`}>
            <Video size={10} />
            {doctor.offersTelemedicine ? 'Online & In-person' : 'Clinic Only'}
          </span>

          {/* Fee */}
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-medium leading-none mb-0.5">From</p>
            <p className="text-sm font-black text-slate-800">
              LKR {doctor.consultationFee?.toLocaleString() || '—'}
            </p>
          </div>
        </div>

        {/* Book Button */}
        <button
          onClick={e => { e.stopPropagation(); onBook() }}
          className="w-full h-10 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-1.5 transition-all hover:opacity-90 active:scale-95 group-hover:shadow-md"
          style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}
        >
          Book Appointment
          <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  )
}
