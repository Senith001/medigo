import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  Video, Calendar, Clock, ArrowRight, 
  ExternalLink, Loader2, VideoOff, 
  CheckCircle2, AlertCircle, PlayCircle,
  MoreHorizontal, ChevronRight, History
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { appointmentAPI } from '../../services/api'
import DashboardLayout from '../../components/DashboardLayout'
import Button from '../../components/ui/Button'

export default function Telemedicine() {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTeleAppointments = async () => {
    try {
      setLoading(true)
      const res = await appointmentAPI.getAppointments()
      if (res.data.success) {
        // Filter for telemedicine and sort by date
        const tele = res.data.data
          .filter(apt => apt.type === 'telemedicine')
          .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
        setAppointments(tele)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Helper to check if a session is "Live" (simplified: scheduled for today)
  const isLive = (date) => {
    const today = new Date().toISOString().split('T')[0]
    return date === today
  }

  useEffect(() => {
    fetchTeleAppointments()
  }, [])

  // Categories
  const liveSessions = appointments.filter(apt => apt.status === 'confirmed' && isLive(apt.appointmentDate))
  const upcomingSessions = appointments.filter(apt => apt.status === 'confirmed' && !isLive(apt.appointmentDate))
  const pastSessions = appointments.filter(apt => ['completed', 'cancelled'].includes(apt.status))

  if (loading) {
    return (
      <DashboardLayout isPatient={true}>
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-300">
          <Loader2 size={48} className="animate-spin text-medigo-blue" />
          <p className="text-xs font-black uppercase tracking-widest">Synchronizing Telemedicine Channel...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout isPatient={true}>
      <div className="max-w-6xl mx-auto space-y-10 pb-20 font-inter">
        {/* Header */}
        <div className="space-y-2">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-medigo-blue/10 rounded-xl flex items-center justify-center text-medigo-blue shadow-sm">
                 <Video size={22} />
              </div>
              <h1 className="text-3xl font-black text-medigo-navy tracking-tight uppercase italic">Tele<span className="text-medigo-blue">medicine</span></h1>
           </div>
           <p className="text-slate-500 font-medium italic">Video consultations with your doctors</p>
        </div>

        {/* Live Session Alert Section */}
        <AnimatePresence>
          {liveSessions.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative p-6 px-8 rounded-[2.5rem] bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden group shadow-xl shadow-emerald-500/5"
            >
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
               <div className="flex items-center gap-5 relative z-10">
                  <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform animate-pulse">
                     <Video size={28} />
                  </div>
                  <div className="space-y-1">
                     <h3 className="text-xl font-black text-medigo-navy uppercase tracking-tighter italic">Live Session Active</h3>
                     <p className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                        With {liveSessions[0].doctorName} <span className="w-1 h-1 bg-emerald-300 rounded-full" /> Today at {liveSessions[0].timeSlot?.split(' - ')[0]}
                     </p>
                  </div>
               </div>
               <Button 
                 onClick={() => navigate(`/telemedicine/lobby/${liveSessions[0]._id}`)}
                 className="relative z-10 h-14 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 font-black uppercase text-xs tracking-widest"
               >
                 Join Now <PlayCircle size={18} className="ml-2" />
               </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upcoming Sessions List */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                    <Calendar size={18} />
                 </div>
                 <h2 className="text-xl font-black text-medigo-navy uppercase tracking-tighter italic italic">Upcoming Sessions</h2>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{upcomingSessions.length} Scheduled</span>
           </div>

           {upcomingSessions.length === 0 && !liveSessions.length ? (
              <div className="bg-white p-16 rounded-[3rem] border border-slate-100 border-dashed text-center space-y-6 flex flex-col items-center">
                 <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[2.5rem] flex items-center justify-center border border-slate-100">
                    <VideoOff size={40} />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-xl font-black text-medigo-navy uppercase italic">No Virtual Sessions Scheduled</h3>
                    <p className="text-slate-400 font-medium max-w-sm mx-auto italic">Start a digital consultation by selecting the Telemedicine option when booking a specialist.</p>
                 </div>
                 <Button onClick={() => navigate('/search')} variant="outline" className="rounded-2xl h-12">Search Doctors</Button>
              </div>
           ) : (
              <div className="grid gap-4">
                 {upcomingSessions.map((session, i) => (
                    <motion.div
                      key={session._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white p-6 rounded-[2.5rem] border border-slate-100 hover:border-blue-200 transition-all hover:shadow-premium group flex flex-col sm:flex-row items-center gap-6"
                    >
                       <div className="flex-1 flex items-center gap-5 min-w-0 w-full">
                          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-[1.5rem] flex flex-col items-center justify-center italic leading-none group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors shrink-0">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                {new Date(session.appointmentDate).toLocaleDateString('en-US', { month: 'short' })}
                             </span>
                             <span className="text-xl font-black text-medigo-navy">
                                {new Date(session.appointmentDate).getDate()}
                             </span>
                          </div>
                          
                          <div className="min-w-0">
                             <div className="flex items-center gap-3 mb-1">
                                <h4 className="text-sm font-black text-medigo-navy uppercase italic truncate">{session.doctorName}</h4>
                                <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded shadow-sm ${
                                   session.status === 'confirmed' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                                }`}>
                                   {session.status === 'confirmed' ? 'Scheduled' : 'Pending'}
                                </span>
                             </div>
                             <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest italic flex-wrap">
                                <div className="flex items-center gap-1.5 font-black text-medigo-blue"><Clock size={12} /> {session.timeSlot?.split(' - ')[0]}</div>
                                <div className="flex items-center gap-1.5"><ExternalLink size={12} /> ID: apt_{session._id.slice(-6).toUpperCase()}</div>
                             </div>
                          </div>
                       </div>

                       <div className="shrink-0 flex sm:flex-col items-center gap-4 justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-8">
                          <Button 
                            onClick={() => navigate(`/telemedicine/lobby/${session._id}`)}
                            className="h-14 w-full sm:w-48 bg-teal-600 hover:bg-teal-700 shadow-xl shadow-teal-600/10 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest"
                          >
                             Join Session <Video size={16} className="ml-2" />
                          </Button>
                       </div>
                    </motion.div>
                 ))}
              </div>
           )}
        </div>

        {/* Past Sessions */}
        {pastSessions.length > 0 && (
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center">
                       <History size={18} />
                    </div>
                    <h2 className="text-xl font-black text-medigo-navy uppercase tracking-tighter italic italic">Past Sessions</h2>
                 </div>
              </div>

              <div className="grid gap-3 opacity-60 hover:opacity-100 transition-opacity">
                 {pastSessions.slice(0, 3).map((session) => (
                    <div key={session._id} className="bg-white/50 p-5 rounded-3xl border border-slate-100 flex items-center justify-between gap-4 grayscale hover:grayscale-0 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                             <CheckCircle2 size={20} />
                          </div>
                          <div>
                             <p className="text-sm font-black text-medigo-navy uppercase italic">{session.doctorName}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{session.appointmentDate}</p>
                          </div>
                       </div>
                       <Button variant="outline" className="h-10 rounded-xl text-[10px]">Medical Record</Button>
                    </div>
                 ))}
              </div>
           </div>
        )}
      </div>
    </DashboardLayout>
  )
}
