import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { 
  Calendar, Clock, MapPin, 
  ChevronLeft, ArrowRight, Star,
  Stethoscope, Building2, ShieldCheck,
  Info, Loader2, Hospital, ChevronRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from '../../components/DashboardLayout'
import Button from '../../components/ui/Button'
import { doctorAPI, appointmentAPI } from '../../services/api'

export default function DoctorSessions() {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [doctor, setDoctor] = useState(location.state?.doctor || null)
  const [loading, setLoading] = useState(!doctor)
  const [sessions, setSessions] = useState([])
  const [selectedHospital, setSelectedHospital] = useState('all')

  const fetchDetails = async () => {
    try {
      setLoading(true)
      if (!doctor) {
        const docRes = await doctorAPI.getById(doctorId)
        setDoctor(docRes.data.data)
      }
      
      const sessionRes = await doctorAPI.getAvailability(doctorId)
      if (sessionRes.data.success) {
        setSessions(sessionRes.data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDetails() }, [doctorId])

  const hospitals = ['all', ...new Set(sessions.map(s => s.hospital))]

  const filteredSessions = selectedHospital === 'all' 
    ? sessions 
    : sessions.filter(s => s.hospital === selectedHospital)

  if (loading) return (
    <DashboardLayout isPatient={true}>
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-300">
        <Loader2 size={48} className="animate-spin text-medigo-blue" />
        <p className="text-xs font-black uppercase tracking-widest">Loading Specialist Sessions...</p>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout isPatient={true}>
      <div className="max-w-6xl mx-auto space-y-8 pb-20 font-inter">
        {/* Breadcrumbs / Back */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group hover:text-medigo-blue transition-colors"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Search Results
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Doctor Profile & Tools */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-100 flex flex-col items-center text-center space-y-6">
               <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-3xl font-black text-medigo-blue shadow-inner relative">
                  {doctor.fullName?.replace('Dr. ', '').split(' ').map(n => n[0]).join('').slice(0, 2)}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center">
                    <ShieldCheck size={14} className="text-white" />
                  </div>
               </div>
               
               <div className="space-y-2">
                  <h2 className="text-2xl font-black text-medigo-navy uppercase tracking-tighter italic">{doctor.fullName}</h2>
                  <p className="text-[10px] font-black text-medigo-blue uppercase tracking-[0.2em] px-4 py-1.5 bg-blue-50 rounded-full inline-block">
                    {doctor.specialty}
                  </p>
               </div>

               <div className="w-full pt-6 border-t border-slate-50 flex items-center justify-around">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Rating</p>
                    <div className="flex items-center gap-1 text-amber-500 justify-center">
                       <Star size={12} fill="currentColor" />
                       <span className="text-sm font-black italic">4.9</span>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-slate-100" />
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Exp</p>
                    <p className="text-sm font-black text-medigo-navy italic">{doctor.experienceYears}Y</p>
                  </div>
               </div>
               
               <Button variant="outline" className="w-full text-xs h-12 rounded-2xl border-slate-200">View Full Profile</Button>
            </div>

            {/* Filter by Hospital */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-6">
               <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 italic">
                  <Hospital size={16} className="text-medigo-blue" /> Available Hospitals
               </h3>
               <div className="space-y-2">
                  {hospitals.map(h => (
                    <button
                      key={h}
                      onClick={() => setSelectedHospital(h)}
                      className={`w-full p-4 rounded-2xl border flex items-center justify-between group transition-all ${
                        selectedHospital === h 
                          ? 'bg-medigo-blue border-medigo-blue shadow-lg shadow-blue-500/20' 
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <span className={`text-[11px] font-black uppercase tracking-widest ${selectedHospital === h ? 'text-white' : 'text-slate-400'}`}>
                        {h === 'all' ? 'All Locations' : h}
                      </span>
                      <ChevronRight size={14} className={selectedHospital === h ? 'text-white' : 'text-white/20 group-hover:text-white/40'} />
                    </button>
                  ))}
               </div>
            </div>
          </div>

          {/* Right: Sessions List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] shadow-premium border border-slate-100 min-h-[600px] flex flex-col">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                        <Calendar size={20} />
                     </div>
                     <h3 className="text-xl font-black text-medigo-navy uppercase tracking-tighter italic">Available Sessions</h3>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    {filteredSessions.length} Sessions Found
                  </span>
               </div>

               <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {sessions.map((session, i) => (
                      <motion.div
                        key={session._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 rounded-[2rem] border border-slate-100 hover:border-blue-200 transition-all hover:shadow-premium group flex flex-col sm:flex-row items-center gap-6"
                      >
                         <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-4">
                               <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center italic leading-none group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{session.day?.slice(0, 3)}</span>
                                  <span className="text-lg font-black text-medigo-navy">{session.date ? session.date.split('-')[2] : '∞'}</span>
                               </div>
                               <div>
                                  <div className="flex items-center gap-2 mb-1">
                                     <h4 className="text-sm font-black text-medigo-navy uppercase italic">{session.hospital || 'Private Clinic'}</h4>
                                     <span className="px-2 py-0.5 bg-slate-100 text-[9px] font-black text-slate-500 uppercase rounded group-hover:bg-blue-100 group-hover:text-medigo-blue transition-colors">Clinical Session</span>
                                  </div>
                                  <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                     <span className="flex items-center gap-1.5"><Clock size={12} /> {session.startTime} - {session.endTime}</span>
                                     <span className="flex items-center gap-1.5"><MapPin size={12} /> {session.location}</span>
                                  </div>
                               </div>
                            </div>
                            
                            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 w-fit">
                               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                 Confirmed Session Available
                               </span>
                            </div>
                         </div>

                         <div className="shrink-0 flex sm:flex-col items-center gap-4 justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-8">
                            <div className="text-right">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Session Fee</p>
                               <p className="text-lg font-black text-medigo-navy tracking-tight italic leading-none group-hover:text-medigo-blue transition-colors">
                                 LKR {session.fee?.toLocaleString()}
                               </p>
                            </div>
                            <Button 
                              onClick={() => navigate(`/checkout/${session._id}`, { state: { doctor, session } })}
                              className="h-12 w-36 shadow-lg shadow-blue-500/10 group-hover:-translate-y-1 transition-transform"
                            >
                               Available <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                         </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
               </div>
               
               <div className="mt-auto pt-12 text-center text-slate-300">
                  <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] italic">
                     <ShieldCheck size={16} className="text-medigo-blue" /> HIPAA Compliant Reservation System
                  </div>
               </div>
            </div>

            {/* Note Section */}
            <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex gap-4">
               <Info size={24} className="text-amber-500 shrink-0" />
               <div className="space-y-1">
                  <p className="text-xs font-black text-amber-700 uppercase tracking-widest italic leading-none">Special Instructions</p>
                  <p className="text-[13px] text-amber-600 font-medium">Please arrive at the clinical facility at least <span className="font-bold">20 minutes prior</span> to your session time for initial health assessment and documentation.</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
