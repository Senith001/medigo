import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { 
  Calendar, Clock, MapPin, 
  ChevronLeft, ArrowRight, Star,
  Stethoscope, Building2, ShieldCheck,
  Info, Loader2, Hospital, ChevronRight,
  Video, UserCircle2, Globe, Map
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
  const [selectedMode, setSelectedMode] = useState(null)

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

  const filteredSessions = sessions.filter(s => {
    const matchesHospital = selectedHospital === 'all' || s.hospital === selectedHospital;
    const mode = s.consultationType || 'both';
    const matchesMode = selectedMode === null || mode === 'both' || mode === selectedMode;
    return matchesHospital && matchesMode;
  });

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

           {/* Right: Sessions & Choice Screen */}
           <div className="lg:col-span-8 space-y-6">
             <AnimatePresence mode="wait">
               {!selectedMode ? (
                 <motion.div 
                   key="choice-screen"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                   className="bg-white p-12 rounded-[3.5rem] shadow-premium border border-slate-100 min-h-[600px] flex flex-col items-center justify-center text-center space-y-12"
                 >
                    <div className="space-y-4">
                       <h3 className="text-3xl font-black text-medigo-navy uppercase tracking-tighter italic">Choose Your <span className="text-medigo-blue">Consultation Mode</span></h3>
                       <p className="text-slate-500 font-medium max-w-sm mx-auto italic">Before accessing the specialist's schedule, please select how you would like to proceed with your medical consultation.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-2xl">
                       <button 
                         onClick={() => setSelectedMode('telemedicine')}
                         className="group p-8 rounded-[3rem] border-2 border-slate-100 hover:border-medigo-blue hover:bg-blue-50/50 transition-all text-left space-y-6 relative overflow-hidden"
                       >
                          <div className="w-16 h-16 bg-blue-50 text-medigo-blue rounded-[1.5rem] flex items-center justify-center group-hover:bg-medigo-blue group-hover:text-white transition-all">
                             <Video size={32} />
                          </div>
                          <div className="space-y-2">
                             <h4 className="text-xl font-black text-medigo-navy uppercase tracking-tighter italic group-hover:text-medigo-blue">Video Consult</h4>
                             <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Consult from the comfort of your home via our secure HD pipeline.</p>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-medigo-blue uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
                             Select Telemedicine <ArrowRight size={14} />
                          </div>
                       </button>

                       <button 
                         onClick={() => setSelectedMode('in-person')}
                         className="group p-8 rounded-[3rem] border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50/50 transition-all text-left space-y-6"
                       >
                          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                             <MapPin size={32} />
                          </div>
                          <div className="space-y-2">
                             <h4 className="text-xl font-black text-medigo-navy uppercase tracking-tighter italic group-hover:text-indigo-600">In-Person Visit</h4>
                             <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Visit the specialist at their physical clinical facility.</p>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
                             Select Physical Visit <ArrowRight size={14} />
                          </div>
                       </button>
                    </div>

                    <div className="pt-8 flex items-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] italic">
                       <Globe size={18} className="text-medigo-blue" /> Choose a protocol to view availability
                    </div>
                 </motion.div>
               ) : (
                 <motion.div 
                   key="sessions-list"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="space-y-6"
                 >
                   <div className="bg-white p-8 rounded-[3rem] shadow-premium border border-slate-100 min-h-[600px] flex flex-col">
                      <div className="flex items-center justify-between mb-8">
                         <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              selectedMode === 'telemedicine' ? 'bg-blue-50 text-medigo-blue' : 'bg-indigo-50 text-indigo-600'
                            }`}>
                               {selectedMode === 'telemedicine' ? <Video size={20} /> : <Calendar size={20} />}
                            </div>
                            <div className="relative">
                               <button 
                                 onClick={() => setSelectedMode(null)}
                                 className="text-[9px] font-black text-medigo-blue uppercase tracking-widest block mb-0.5 hover:underline"
                               >
                                 Change Method
                               </button>
                               <h3 className="text-xl font-black text-medigo-navy uppercase tracking-tighter italic">
                                 {selectedMode === 'telemedicine' ? 'Video Sessions' : 'Clinic Sessions'}
                               </h3>
                            </div>
                         </div>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                           {filteredSessions.length} Matching Found
                         </span>
                      </div>

                      <div className="space-y-4">
                         <AnimatePresence mode="popLayout">
                           {filteredSessions.map((session, i) => (
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
                                            <h4 className="text-sm font-black text-medigo-navy uppercase italic italic">{session.hospital || 'Private Clinic'}</h4>
                                            <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded transition-colors ${
                                              selectedMode === 'telemedicine' 
                                                ? 'bg-blue-50 text-medigo-blue group-hover:bg-medigo-blue group-hover:text-white' 
                                                : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
                                            }`}>
                                              {selectedMode === 'telemedicine' ? 'Video Consult' : 'In-Person Visit'}
                                            </span>
                                         </div>
                                         <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                            <span className="flex items-center gap-1.5"><Clock size={12} /> {session.startTime} - {session.endTime}</span>
                                            <span className="flex items-center gap-1.5"><MapPin size={12} /> {session.location}</span>
                                         </div>
                                      </div>
                                   </div>
                                   
                                    <div className="flex flex-wrap items-center gap-3">
                                       <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 w-fit">
                                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                            Slot Confirmed Available
                                          </span>
                                       </div>
                                       <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border w-fit ${
                                         (session.bookedCount || 0) >= (session.maxPatients || 10)
                                           ? 'bg-red-50 border-red-100 text-red-600'
                                           : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                                       }`}>
                                          <div className={`w-1.5 h-1.5 rounded-full ${
                                            (session.bookedCount || 0) >= (session.maxPatients || 10) ? 'bg-red-500' : 'bg-indigo-500'
                                          }`} />
                                          <span className="text-[10px] font-black uppercase tracking-widest">
                                            {session.bookedCount || 0} / {session.maxPatients || 10} Patient Load
                                          </span>
                                       </div>
                                    </div>
                                </div>

                                <div className="shrink-0 flex sm:flex-col items-center gap-4 justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-8">
                                   <div className="text-right">
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Fee</p>
                                      <p className="text-lg font-black text-medigo-navy tracking-tight italic leading-none group-hover:text-medigo-blue transition-colors">
                                        LKR {session.fee?.toLocaleString()}
                                      </p>
                                   </div>
                                   <Button 
                                      onClick={() => navigate(`/checkout/${session._id}`, { state: { doctor, session, selectedMode } })}
                                      disabled={(session.bookedCount || 0) >= (session.maxPatients || 10)}
                                      className={`h-12 w-36 shadow-lg transition-transform ${
                                        selectedMode === 'telemedicine' ? 'shadow-blue-500/10' : 'shadow-indigo-500/10'
                                      } ${
                                        (session.bookedCount || 0) >= (session.maxPatients || 10)
                                          ? 'bg-slate-200 text-slate-400 border-transparent shadow-none cursor-not-allowed'
                                          : 'group-hover:-translate-y-1'
                                      }`}
                                    >
                                      {(session.bookedCount || 0) >= (session.maxPatients || 10) ? (
                                        'Fully Loaded'
                                      ) : (
                                        <>Available <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" /></>
                                      )}
                                    </Button>
                                </div>
                             </motion.div>
                           ))}
                         </AnimatePresence>
                      </div>
                      
                      <div className="mt-auto pt-12 text-center text-slate-300">
                         <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] italic">
                            <ShieldCheck size={16} className={selectedMode === 'telemedicine' ? 'text-medigo-blue' : 'text-indigo-600'} /> End-to-End Encrypted Tunnel Active
                         </div>
                      </div>
                   </div>

                   {/* Note Section */}
                   <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className={`${selectedMode === 'telemedicine' ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-100'} p-6 rounded-[2rem] border flex gap-4 transition-colors`}
                   >
                      <Info size={24} className={selectedMode === 'telemedicine' ? 'text-medigo-blue' : 'text-amber-500'} />
                      <div className="space-y-1">
                         <p className={`text-xs font-black uppercase tracking-widest italic leading-none ${selectedMode === 'telemedicine' ? 'text-medigo-blue' : 'text-amber-700'}`}>
                           {selectedMode === 'telemedicine' ? 'Digital Consultation Protocol' : 'Physical Clinical Protocol'}
                         </p>
                         <p className={`text-[13px] font-medium ${selectedMode === 'telemedicine' ? 'text-blue-700' : 'text-amber-600'}`}>
                           {selectedMode === 'telemedicine' 
                             ? 'Ensure a stable internet connection and find a quiet space. You will receive a secure meeting link 5 minutes before your time.' 
                             : 'Please arrive at the clinical facility at least 20 minutes prior for initial health assessment and documentation.'}
                         </p>
                      </div>
                   </motion.div>
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
