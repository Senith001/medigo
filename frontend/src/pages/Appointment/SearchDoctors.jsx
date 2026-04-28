import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Search, Star, ChevronRight, Stethoscope,
  Loader2, AlertCircle, Video, Building2,
  Clock, BadgeCheck, SlidersHorizontal, X, Users, Info
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
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  
  // New States for "Available Today" filtering
  const [todayFilter, setTodayFilter] = useState(false)
  const [availabilities, setAvailabilities] = useState({}) // docId -> hasSessionToday

  // Fetch all doctors once — filter client-side
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await doctorAPI.getProfiles({})
        if (res.data.success) {
          const docs = res.data.data
          setAllDoctors(docs)

          // Background fetch to map today's availability
          Promise.all(docs.map(d => doctorAPI.getAvailability(d._id).catch(() => null)))
            .then(avResults => {
               const avMap = {}
               const todayStr = new Date().toDateString()
               docs.forEach((d, i) => {
                 const r = avResults[i]
                 if (r?.data?.success) {
                   const sessions = r.data.data
                   avMap[d._id] = sessions.some(s => {
                      if (!s.date) return false
                      return new Date(s.date).toDateString() === todayStr
                   })
                 } else {
                   avMap[d._id] = false
                 }
               })
               setAvailabilities(avMap)
            })
        }
        else setError('Unable to retrieve doctors.')
      } catch {
        setError('Network error. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Compute filtered list reactively
  const doctors = allDoctors.filter(d => {
    const matchName = !nameFilter.trim() ||
      d.fullName?.toLowerCase().includes(nameFilter.toLowerCase())
    const matchSpec = !specFilter || specFilter === 'All' ||
      d.specialty?.toLowerCase() === specFilter.toLowerCase()
    const matchToday = !todayFilter || availabilities[d._id] === true
    return matchName && matchSpec && matchToday
  })

  const handleSearch = (e) => e?.preventDefault()
  const selectSpecialty = (s) => setSpecFilter(s)
  const clearFilters = () => { setNameFilter(''); setSpecFilter('All'); setTodayFilter(false) }
  const hasFilters = nameFilter || (specFilter && specFilter !== 'All') || todayFilter




  return (
    <DashboardLayout isPatient={true}>
      <div className="max-w-7xl mx-auto space-y-6 pb-20" style={{ fontFamily: "'Inter', sans-serif" }}>

        {/* ── Hero Banner ── */}
        <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-premium min-h-[380px] flex items-center border border-slate-100">
          
          {/* Background Image & Gradient Overlay */}
          <div className="absolute inset-0 z-0">
             <img src="/images/search-doctor.png" alt="Doctor Directory Banner" className="w-full h-full object-cover object-center opacity-70" />
             <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent" />
          </div>

          <div className="relative z-10 p-8 sm:p-14 w-full max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-full px-4 py-2 mb-6">
              <Stethoscope size={16} className="text-blue-400" />
              <span className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em]">MediGo Medical Network</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4 tracking-tight">
              A Healthier Future <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 italic">Starts Here.</span>
            </h1>
            <p className="text-slate-300 text-sm font-medium mb-10 max-w-lg leading-relaxed">
              Connect with top-rated medical specialists and seamlessly book video or clinical consultations in seconds.
            </p>

            {/* Smart Search Bar */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[1.5rem] shadow-2xl gap-2">
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-4 text-slate-300" size={20} />
                <input
                  type="text"
                  placeholder="Type a doctor's name to search..."
                  value={nameFilter}
                  onChange={e => setNameFilter(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-transparent text-white placeholder-slate-400 font-medium outline-none text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="h-14 px-8 rounded-[1rem] font-black text-sm text-white transition-all hover:bg-blue-600 disabled:opacity-50 whitespace-nowrap bg-medigo-blue shadow-lg shadow-blue-500/20 flex items-center justify-center"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Find Doctor'}
              </button>
              <AnimatePresence>
                {hasFilters && (
                  <motion.button 
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                    type="button" 
                    onClick={clearFilters}
                    className="h-14 px-5 rounded-[1rem] font-black text-xs text-white bg-white/10 hover:bg-white/20 transition-all border border-white/10 flex items-center gap-2"
                  >
                    <X size={16} /> Clear
                  </motion.button>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>

        {/* ── Specialty Filter Pills ── */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div>
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
          
          <div className="md:border-l border-slate-100 md:pl-6 h-full flex items-center">
             <button
               onClick={() => setTodayFilter(!todayFilter)}
               className={`flex items-center gap-2 px-6 py-3 rounded-2xl border text-sm font-black transition-all ${
                 todayFilter 
                   ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm' 
                   : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
               }`}
             >
               <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                 todayFilter ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
               }`}>
                 {todayFilter && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
               </div>
               Available Today
             </button>
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
              <div key={i} className="bg-white rounded-[1.5rem] border border-slate-100 p-5 animate-pulse">
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
          <div className="bg-white rounded-[2rem] border border-red-100 p-10 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={24} className="text-red-400" />
            </div>
            <p className="font-bold text-slate-700 mb-1">Something went wrong</p>
            <p className="text-slate-400 text-sm mb-4">{error}</p>
            <button onClick={() => window.location.reload()}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all">
              Try Again
            </button>
          </div>
        ) : doctors.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-dashed border-slate-200 p-16 text-center">
            <div className="text-5xl mb-3 opacity-50">🔍</div>
            <h3 className="text-lg font-black text-medigo-navy mb-1">No doctors found</h3>
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
                  doctor={{...doc, hasSessionToday: availabilities[doc._id]}}
                  index={i}
                  onViewProfile={() => setSelectedDoctor(doc)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectedDoctor && (
           <DoctorProfileModal 
             doctor={selectedDoctor} 
             onClose={() => setSelectedDoctor(null)}
             onBook={() => navigate(`/doctor/${selectedDoctor._id}/sessions`, { state: { doctor: selectedDoctor } })} 
           />
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}

function DoctorCard({ doctor, index, onViewProfile }) {
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
      onClick={onViewProfile}
      className="bg-white rounded-[2rem] border border-slate-100 hover:border-blue-200 hover:shadow-premium transition-all duration-300 group flex flex-col overflow-hidden cursor-pointer relative"
    >
      {doctor.hasSessionToday && (
        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl z-20 shadow-sm">
           Available Today
        </div>
      )}
      <div className="p-6 pb-4 relative z-10">
        <div className="flex flex-col items-center text-center gap-3 mb-4">
          <div className={`w-20 h-20 rounded-[1.5rem] bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black text-2xl shadow-md relative shrink-0 transition-transform group-hover:scale-105`}>
            {initials}
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center">
              <BadgeCheck size={8} className="text-white" />
            </span>
          </div>

          <div className="space-y-1">
             <h3 className="font-black text-medigo-navy text-lg leading-tight group-hover:text-blue-600 transition-colors">
               {doctor.fullName}
             </h3>
             {specialtyMeta && (
               <span className={`inline-flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${specialtyMeta.color}`}>
                 {specialtyMeta.icon} {doctor.specialty}
               </span>
             )}
          </div>
        </div>

        <div className="space-y-3 bg-slate-50/50 p-4 rounded-[1.5rem] border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rating</span>
            <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md shadow-sm">
              <Star size={10} fill="#f59e0b" className="text-amber-400" />
              <span className="text-xs font-bold text-medigo-navy">4.9</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience</span>
            <span className="text-xs font-bold text-medigo-navy capitalize">{doctor.experienceYears || '—'} years</span>
          </div>
        </div>
      </div>

      <div className="p-4 mt-auto border-t border-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Session Fee</p>
            <p className="text-sm font-black text-medigo-navy">
              LKR {doctor.consultationFee?.toLocaleString() || '—'}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 group-hover:bg-medigo-blue group-hover:text-white flex items-center justify-center transition-all group-hover:translate-x-1">
             <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function DoctorProfileModal({ doctor, onClose, onBook }) {
  const liveRating = 4.8
  const ratingCount = 124

  const initials = (doctor.fullName || 'DR').replace(/^Dr\.?\s*/i, '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const specialtyMeta = SPECIALTY_META[doctor.specialty] || { icon: '⚕️', color: 'bg-blue-50 text-blue-600 border-blue-100' }

  const handleRate = (val) => {
    setRatingVal(val)
    setJustRated(true)
    setTimeout(() => {
       setLiveRating(prev => Number(((prev * ratingCount + val) / (ratingCount + 1)).toFixed(1)))
       setRatingCount(prev => prev + 1)
       setJustRated(false)
    }, 800)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="relative bg-gradient-to-br from-slate-900 to-medigo-navy pt-16 pb-8 px-8 sm:px-12 text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px]" />
          
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors">
            <X size={20} />
          </button>

          <div className="w-28 h-28 mx-auto rounded-[2rem] bg-white text-medigo-blue flex items-center justify-center text-4xl font-black shadow-2xl relative z-10 mb-6">
            {initials}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-slate-900 rounded-full flex items-center justify-center">
              <BadgeCheck size={14} className="text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-black text-white relative z-10">{doctor.fullName}</h2>
          <div className="flex items-center justify-center gap-2 mt-3 relative z-10">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-md bg-white/10 text-white border border-white/20`}>
              {specialtyMeta.icon} {doctor.specialty}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-md bg-white/10 text-white border border-white/20">
              {doctor.experienceYears}Y Exp
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 sm:px-12 py-8 space-y-8 bg-slate-50">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Info size={16} className="text-indigo-500" /> About Me
               </h3>
               <p className="text-sm font-bold text-medigo-navy leading-relaxed">{doctor.bio || 'Professional medical specialist dedicated to providing exceptional patient care and clinical excellence.'}</p>
             </div>

             <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Stethoscope size={16} className="text-teal-500" /> Qualifications
               </h3>
               <p className="text-sm font-bold text-medigo-navy leading-relaxed">{doctor.qualifications || 'MBBS, MD (General Medicine)'}</p>
             </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8">
             <div className="text-center md:text-left shrink-0">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-center md:justify-start gap-2">
                 <Star size={16} className="text-amber-500" /> Live Rating
               </h3>
               <div className="flex items-end justify-center md:justify-start gap-2">
                 <span className="text-5xl font-black text-medigo-navy tracking-tighter">{liveRating}</span>
                 <span className="text-sm font-bold text-slate-400 mb-1.5">/ 5.0</span>
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{ratingCount} Verified Reviews</p>
             </div>
             
             <div className="flex-1 w-full bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center text-center">
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Service Satisfaction</p>
               <div className="flex justify-center gap-1.5 mb-3">
                 {[1, 2, 3, 4, 5].map((star) => (
                   <Star 
                     key={star}
                     size={24} 
                     fill={star <= Math.round(liveRating) ? "#f59e0b" : "transparent"} 
                     className={star <= Math.round(liveRating) ? 'text-amber-400' : 'text-slate-200'}
                   />
                 ))}
               </div>
               <p className="text-[10px] font-bold text-slate-400">Ratings are verified and powered by real patients after completion of an appointment.</p>
             </div>
          </div>

        </div>

        <div className="p-6 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="text-center sm:text-left">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Consultation Fee</p>
             <p className="text-2xl font-black text-medigo-navy tracking-tighter">LKR {doctor.consultationFee?.toLocaleString() || '2,500'}</p>
           </div>
           <button 
             onClick={onBook}
             className="w-full sm:w-auto h-14 px-10 rounded-[1.5rem] bg-medigo-navy hover:bg-slate-800 text-white font-bold tracking-wide transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 group"
           >
             Check Schedule & Book <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
