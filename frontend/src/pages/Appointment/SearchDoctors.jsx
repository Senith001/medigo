import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Search, Filter, Star, ChevronRight, Stethoscope,
  Loader2, AlertCircle, LayoutGrid, List,
  MapPin, Clock, BadgeCheck, Video, Building2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from '../../components/DashboardLayout'
import { doctorAPI } from '../../services/api'

const SPECIALTIES = [
  'All Specialties', 'Cardiology', 'Dermatology', 'Neurology', 'Orthopedics',
  'Pediatrics', 'Psychiatry', 'Gynecology', 'General Medicine',
  'Ophthalmology', 'ENT', 'Urology', 'Oncology', 'Immunology'
]

const SPECIALTY_ICONS = {
  Cardiology: '❤️', Dermatology: '🧬', Neurology: '🧠',
  Orthopedics: '🦴', Pediatrics: '👶', Psychiatry: '💭',
  Gynecology: '🌸', 'General Medicine': '🏥', Oncology: '🔬',
  Ophthalmology: '👁️', ENT: '👂', Urology: '💧', Immunology: '🛡️'
}

export default function SearchDoctors() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [nameFilter, setNameFilter] = useState(searchParams.get('name') || '')
  const [specFilter, setSpecFilter] = useState(searchParams.get('specialty') || '')
  const [viewMode, setViewMode] = useState('grid')

  const fetchDoctors = async (name = nameFilter, specialty = specFilter) => {
    try {
      setLoading(true)
      setError(null)
      const res = await doctorAPI.getProfiles({
        fullName: name || undefined,
        specialty: specialty && specialty !== 'All Specialties' ? specialty : undefined,
        status: 'verified'
      })
      if (res.data.success) setDoctors(res.data.data)
      else setError('Unable to retrieve practitioners.')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const sp = searchParams.get('specialty')
    if (sp) setSpecFilter(sp)
    fetchDoctors(searchParams.get('name'), sp)
  }, [searchParams])

  const handleSearch = (e) => { e?.preventDefault(); fetchDoctors() }

  return (
    <DashboardLayout isPatient={true}>
      <div className="max-w-7xl mx-auto space-y-8 pb-20 font-inter">

        {/* ── Hero Search ── */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-8 sm:p-10">
          {/* Background glow blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-20 w-64 h-64 bg-indigo-600/15 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
                <Stethoscope size={18} className="text-blue-400" />
              </div>
              <span className="text-blue-400 text-xs font-black uppercase tracking-widest">Find Doctors</span>
            </div>

            <div>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">
                Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Specialist</span>
              </h1>
              <p className="text-slate-400 mt-2 text-base">Book verified medical professionals in seconds.</p>
            </div>

            {/* Search form */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  placeholder="Doctor name..."
                  value={nameFilter}
                  onChange={e => setNameFilter(e.target.value)}
                  className="w-full h-13 py-3.5 pl-11 pr-4 bg-white/8 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 font-medium text-sm outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all backdrop-blur-sm"
                />
              </div>
              <div className="relative sm:w-52">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
                <select
                  value={specFilter}
                  onChange={e => setSpecFilter(e.target.value)}
                  className="w-full h-13 py-3.5 pl-11 pr-4 bg-white/8 border border-white/10 rounded-2xl text-white font-medium text-sm outline-none appearance-none focus:border-blue-500/50 focus:bg-white/10 transition-all backdrop-blur-sm"
                >
                  {SPECIALTIES.map(s => <option key={s} value={s === 'All Specialties' ? '' : s} className="bg-slate-900 text-white">{s}</option>)}
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 whitespace-nowrap"
              >
                {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Search'}
              </button>
            </form>

            {/* Specialty pill filters */}
            <div className="flex flex-wrap gap-2 pt-1">
              {SPECIALTIES.slice(1, 8).map(s => (
                <button
                  key={s}
                  onClick={() => { setSpecFilter(s); fetchDoctors(nameFilter, s) }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    specFilter === s
                      ? 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/30'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {SPECIALTY_ICONS[s]} {s}
                </button>
              ))}
              {specFilter && (
                <button
                  onClick={() => { setSpecFilter(''); fetchDoctors(nameFilter, '') }}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all"
                >
                  ✕ Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Results Bar ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-sm font-bold text-slate-500">
              <span className="text-medigo-navy font-black">{doctors.length}</span> doctors found
              {specFilter ? <span className="text-medigo-blue"> in {specFilter}</span> : ''}
            </p>
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Live</span>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-medigo-blue' : 'text-slate-400'}`}>
              <LayoutGrid size={15} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-medigo-blue' : 'text-slate-400'}`}>
              <List size={15} />
            </button>
          </div>
        </div>

        {/* ── Results ── */}
        {loading ? (
          <div className="py-32 flex flex-col items-center gap-4 text-slate-300">
            <Loader2 size={48} className="animate-spin text-medigo-blue" />
            <p className="text-xs font-black uppercase tracking-widest">Finding specialists…</p>
          </div>
        ) : error ? (
          <div className="py-24 text-center space-y-4 bg-white rounded-3xl border border-slate-100">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle size={28} className="text-red-400" />
            </div>
            <p className="text-slate-500 font-bold">{error}</p>
            <button onClick={fetchDoctors} className="text-medigo-blue font-black text-sm underline underline-offset-2">Retry</button>
          </div>
        ) : doctors.length === 0 ? (
          <div className="py-28 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100 space-y-3">
            <div className="text-5xl mb-2">🔍</div>
            <h3 className="text-lg font-black text-medigo-navy">No doctors found</h3>
            <p className="text-slate-400 text-sm">Try a different specialty or clear your filters.</p>
          </div>
        ) : (
          <motion.div layout className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            <AnimatePresence>
              {doctors.map((doc, i) => (
                <DoctorCard
                  key={doc._id}
                  doctor={doc}
                  index={i}
                  viewMode={viewMode}
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

function DoctorCard({ doctor, index, viewMode, onBook }) {
  const isGrid = viewMode === 'grid'
  const initials = doctor.fullName?.replace('Dr. ', '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const colors = ['from-blue-600 to-indigo-700', 'from-teal-600 to-cyan-700', 'from-violet-600 to-purple-700', 'from-rose-600 to-pink-700']
  const colorClass = colors[index % colors.length]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04 }}
      className={`bg-white rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/8 transition-all duration-300 group overflow-hidden ${isGrid ? 'flex flex-col' : 'flex flex-row items-center'}`}
    >
      {/* Top gradient accent */}
      <div className={`h-1 bg-gradient-to-r ${colorClass} w-full`} />

      <div className={`${isGrid ? 'p-6 flex flex-col items-center text-center' : 'p-5 flex items-center gap-5 flex-1'}`}>
        {/* Avatar */}
        <div className={`${isGrid ? 'w-20 h-20 mb-4' : 'w-16 h-16 shrink-0'} relative rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white text-xl font-black shadow-lg`}>
          {initials}
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
        </div>

        <div className={`${isGrid ? '' : 'flex-1 min-w-0'}`}>
          {/* Specialty */}
          <span className="text-[10px] font-black text-medigo-blue uppercase tracking-widest">{doctor.specialty}</span>

          {/* Name */}
          <h3 className={`font-black text-medigo-navy tracking-tight leading-tight mt-0.5 ${isGrid ? 'text-lg' : 'text-base truncate'}`}>
            {doctor.fullName}
          </h3>

          {/* Meta */}
          <div className={`flex items-center gap-3 mt-2 text-[11px] font-bold text-slate-400 ${isGrid ? 'justify-center' : ''}`}>
            <span className="flex items-center gap-1"><Star size={11} fill="#f59e0b" className="text-amber-500" /> 4.9</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock size={11} /> {doctor.experienceYears || '—'}y exp</span>
          </div>

          {/* Hospital / Location */}
          {(doctor.clinicLocation || doctor.hospital) && (
            <div className={`flex items-center gap-1 mt-1.5 text-[11px] text-slate-400 font-semibold ${isGrid ? 'justify-center' : ''}`}>
              <Building2 size={11} className="shrink-0" />
              <span className="truncate">{doctor.clinicLocation || doctor.hospital}</span>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className={`${isGrid ? 'px-6 pb-6 pt-2' : 'pr-5 shrink-0'}`}>
        {isGrid && (
          <div className="flex items-center justify-between mb-3 pb-3 border-t border-slate-50 pt-3">
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${doctor.offersTelemedicine ? 'text-blue-500' : 'text-slate-400'}`}>
              {doctor.offersTelemedicine
                ? <><Video size={12} /> Telemedicine</>
                : <><Building2 size={12} /> Clinic Only</>
              }
            </div>
            <span className="text-base font-black text-medigo-navy">
              LKR {doctor.consultationFee?.toLocaleString() || '—'}
            </span>
          </div>
        )}
        <button
          onClick={e => { e.stopPropagation(); onBook() }}
          className={`${isGrid ? 'w-full' : 'w-36'} flex items-center justify-center gap-1.5 bg-medigo-navy hover:bg-medigo-blue text-white font-black text-xs py-3 px-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-md group`}
        >
          Book Now <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  )
}
