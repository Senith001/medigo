import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  Search, Filter, Star, 
  ChevronRight, Stethoscope, 
  Loader2, CheckCircle2, AlertCircle,
  LayoutGrid, List, User
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from '../../components/DashboardLayout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { doctorAPI } from '../../services/api'

const SPECIALTIES = [
  'Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 
  'Pediatrics', 'Psychiatry', 'Gynecology', 'General Medicine', 
  'Ophthalmology', 'ENT', 'Urology', 'Oncology'
]

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
        specialty: specialty || undefined,
        status: 'verified' 
      })
      
      if (res.data.success) {
        setDoctors(res.data.data)
      } else {
        setError('Synchronisation failure: Unable to retrieve practitioners.')
      }
    } catch (err) {
      setError('Communication Interrupted: Gateway timeout or network latency.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const sp = searchParams.get('specialty')
    if (sp) setSpecFilter(sp)
    fetchDoctors(searchParams.get('name'), sp)
  }, [searchParams])

  const handleSearch = (e) => {
    e?.preventDefault()
    fetchDoctors()
  }

  return (
    <DashboardLayout isPatient={true}>
      <div className="max-w-[1400px] mx-auto space-y-10 pb-20 font-inter">
        {/* Cinematic Header Area */}
        <div className="bg-slate-900 p-8 sm:p-12 rounded-[3rem] text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-medigo-blue/10 rounded-full blur-[120px] -z-0 group-hover:bg-medigo-blue/20 transition-colors duration-700" />
           <div className="relative z-10 space-y-8">
              <div className="space-y-3">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-medigo-blue rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                       <Stethoscope size={20} className="text-white" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">Clinical Directory</span>
                 </div>
                 <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">Find Your <span className="text-medigo-blue">Specialist.</span></h1>
                 <p className="text-slate-400 font-medium max-w-xl text-lg">Query our global network of verified medical professionals and reserve your session instantly.</p>
              </div>

              {/* Ultra-Modern Search Bar */}
              <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4 bg-white/5 p-3 rounded-[2rem] border border-white/10 backdrop-blur-md">
                 <div className="flex-1 relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-medigo-blue transition-colors" size={20} />
                    <input 
                      type="text" 
                      placeholder="Specialist Name or Identifier..." 
                      className="w-full h-16 bg-transparent pl-16 pr-6 text-white font-bold outline-none placeholder:text-white/20 italic"
                      value={nameFilter}
                      onChange={e => setNameFilter(e.target.value)}
                    />
                 </div>
                 <div className="h-16 w-px bg-white/10 hidden lg:block" />
                 <div className="flex-1 relative group">
                    <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-medigo-blue transition-colors" size={20} />
                    <select 
                      className="w-full h-16 bg-transparent pl-16 pr-6 text-white font-bold outline-none appearance-none italic"
                      value={specFilter}
                      onChange={e => setSpecFilter(e.target.value)}
                    >
                       <option value="" className="bg-slate-900">All Clinical Fields</option>
                       {SPECIALTIES.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                    </select>
                 </div>
                 <Button type="submit" loading={loading} className="h-16 px-10 rounded-2xl bg-medigo-blue hover:bg-medigo-blue-dark shadow-xl shadow-blue-500/20">
                    Query Directory
                 </Button>
              </form>
           </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between px-4">
           <div className="flex items-center gap-6">
              <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase italic">
                 Displaying <span className="text-medigo-blue">{doctors.length} Records</span> found in database
              </p>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex bg-slate-100 p-1 rounded-xl">
                 <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-medigo-blue' : 'text-slate-400 hover:text-slate-600'}`}>
                    <LayoutGrid size={16} />
                 </button>
                 <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-medigo-blue' : 'text-slate-400 hover:text-slate-600'}`}>
                    <List size={16} />
                 </button>
              </div>
           </div>
           
           <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic">Live Personnel Registry Active</span>
           </div>
        </div>

        {/* Results Container */}
        <div className="space-y-4">
           {loading ? (
             <div className="py-40 flex flex-col items-center justify-center gap-4 text-slate-300">
                <Loader2 size={64} className="animate-spin text-medigo-blue" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Retrieving Verified Practitioners...</p>
             </div>
           ) : error ? (
             <div className="py-32 text-center space-y-6">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100">
                   <AlertCircle size={40} />
                </div>
                <p className="text-red-500 font-bold uppercase italic">{error}</p>
                <Button variant="outline" size="sm" onClick={() => fetchDoctors()}>Retry Directory Query</Button>
             </div>
           ) : doctors.length === 0 ? (
             <div className="py-40 text-center space-y-6 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[2rem] flex items-center justify-center mx-auto">
                   <User size={48} />
                </div>
                <div className="space-y-2">
                   <h3 className="text-2xl font-black text-medigo-navy uppercase tracking-tighter italic">Registry Empty</h3>
                   <p className="text-slate-400 font-medium max-w-sm mx-auto">No verified practitioners matched your query protocols in this specialty cycle.</p>
                </div>
             </div>
           ) : (
             <motion.div 
               layout
               className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}
             >
                <AnimatePresence>
                   {doctors.map((doc, i) => (
                     <DoctorSelectionCard 
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
      </div>
    </DashboardLayout>
  )
}

function DoctorSelectionCard({ doctor, index, viewMode, onBook }) {
  const isGrid = viewMode === 'grid'
  const initials = doctor.fullName?.replace('Dr. ', '').split(' ').map(n => n[0]).join('').slice(0, 2)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className={`bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-premium hover:border-blue-100 transition-all duration-300 group relative overflow-hidden flex ${isGrid ? 'flex-col' : 'flex-row items-center p-8'}`}
    >
       {/* Background Decoration */}
       <div className="absolute top-0 right-0 w-32 h-32 bg-medigo-blue/5 rounded-full blur-3xl -z-0" />

       {/* Avatar & Info */}
       <div className={`${isGrid ? 'p-10 text-center flex flex-col items-center' : 'flex items-center gap-8 flex-1'}`}>
          <div className={`${isGrid ? 'w-24 h-24 mb-6' : 'w-20 h-20'} rounded-[2rem] bg-slate-900 text-white flex items-center justify-center text-2xl font-black italic shadow-2xl relative overflow-hidden shrink-0`}>
             {initials}
             <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="absolute bottom-2 right-2 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-sm" />
          </div>

          <div className="space-y-2 min-w-0">
             <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-medigo-blue uppercase tracking-widest italic leading-none">{doctor.specialty}</span>
                <h3 className="text-xl font-black text-medigo-navy uppercase tracking-tighter truncate leading-none italic group-hover:text-medigo-blue transition-colors">
                  {doctor.fullName}
                </h3>
             </div>
             
             <div className={`flex items-center ${isGrid ? 'justify-center' : '' } gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest`}>
                <span className="flex items-center gap-1"><Star size={12} fill="currentColor" className="text-amber-500" /> 4.9</span>
                <span className="flex items-center gap-1 italic">{doctor.experienceYears}Y Experience</span>
             </div>
          </div>
       </div>

       {/* CTA Section */}
       <div className={`${isGrid ? 'px-8 pb-10 pt-4 border-t border-slate-50' : 'pl-12 border-l border-slate-50 shrink-0'} flex flex-col gap-4 text-center items-center`}>
          {isGrid && (
            <div className="text-center mb-2">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Standard Revenue</p>
               <p className="text-xl font-black text-medigo-navy italic tracking-tighter">LKR {doctor.consultationFee?.toLocaleString()}</p>
            </div>
          )}
          <Button 
            onClick={e => { e.stopPropagation(); onBook(); }}
            className={`w-full ${isGrid ? 'h-14 rounded-2xl' : 'h-14 w-48 rounded-2xl'} bg-medigo-navy hover:bg-medigo-blue shadow-xl shadow-slate-900/10 group group-hover:shadow-blue-500/20`}
          >
             Book Now <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
       </div>
    </motion.div>
  )
}
