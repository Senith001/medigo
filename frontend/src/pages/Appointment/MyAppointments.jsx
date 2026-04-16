import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { 
  Calendar, Clock, Video, MapPin, 
  ChevronRight, ArrowRight, CheckCircle2, 
  XCircle, AlertCircle, RefreshCw, 
  Filter, MoreHorizontal, Info,
  Plus
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { appointmentAPI } from '../../services/api'
import DashboardLayout from '../../components/DashboardLayout'
import Button from '../../components/ui/Button'

const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled']

export default function MyAppointments() {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [cancelling, setCancelling] = useState(null)

  const fetchAll = () => {
    setLoading(true)
    appointmentAPI.getAll(filter !== 'all' ? { status: filter } : {})
      .then(r => setAppointments(r.data.appointments || []))
      .catch((err) => {
        console.error('Failed to fetch appointments:', err)
        setAppointments([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [filter])

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment? This action cannot be undone.')) return
    setCancelling(id)
    try { 
      await appointmentAPI.cancel(id, 'Patient cancelled via portal'); 
      fetchAll() 
    } catch (err) { 
      alert('Failed to cancel appointment. Please try again.') 
    } finally { 
      setCancelling(null) 
    }
  }

  const getStatusStyle = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      confirmed: 'bg-blue-100 text-blue-700 border-blue-200 shadow-sm shadow-blue-500/10',
      completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      'no-show': 'bg-slate-100 text-slate-700 border-slate-200',
    }
    return styles[status] || styles.pending
  }

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === 'all' ? appointments.length : appointments.filter(a => a.status === f).length
    return acc
  }, {})

  return (
    <DashboardLayout isPatient={true}>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-8 pb-20"
      >
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
           <div className="space-y-1">
              <h1 className="text-3xl font-black text-medigo-navy tracking-tight italic uppercase">My Consultations</h1>
              <p className="text-slate-500 font-medium">Manage your upcoming and past medical appointments.</p>
           </div>
           <Button onClick={() => navigate('/search')} className="h-12 px-6 shadow-lg shadow-blue-500/10 active:scale-95 transition-transform">
              <Plus size={18} className="mr-2" /> Book New Session
           </Button>
        </div>

        {/* Filter Toolbar */}
        <section className="flex flex-wrap items-center gap-2 bg-white p-2 border border-slate-100 rounded-[2rem] shadow-sm overflow-x-auto no-scrollbar">
           {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  filter === f 
                    ? 'bg-medigo-navy text-white shadow-xl translate-y-[-1px]' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f}
                {counts[f] > 0 && (
                   <span className={`px-2 py-0.5 rounded-lg text-[10px] ${filter === f ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {counts[f]}
                   </span>
                )}
              </button>
           ))}
        </section>

        {/* List Content */}
        <div className="space-y-4">
           {loading ? (
              <div className="space-y-4 animate-pulse">
                 {[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-[2rem] border border-slate-100 w-full" />)}
              </div>
           ) : appointments.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-24 text-center space-y-6 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-sm"
              >
                 <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar size={48} />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-xl font-black text-medigo-navy uppercase tracking-tight italic">No {filter !== 'all' ? filter : ''} appointments</h3>
                    <p className="text-slate-400 font-medium max-w-sm mx-auto">Your medical schedule is currently clear. Start by booking a consultation with a specialist.</p>
                 </div>
                 <Button variant="outline" className="h-12 border-slate-200 font-black px-8" onClick={() => navigate('/search')}>
                    Browse Doctors <ArrowRight size={18} className="ml-2" />
                 </Button>
              </motion.div>
           ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {appointments.map((appt, i) => (
                    <AppointmentCard 
                      key={appt._id} 
                      appt={appt} 
                      index={i} 
                      onCancel={() => handleCancel(appt._id)}
                      cancelling={cancelling === appt._id}
                      getStatusStyle={getStatusStyle}
                    />
                  ))}
                </AnimatePresence>
              </div>
           )}
        </div>

        {/* Help Tip */}
        {!loading && appointments.length > 0 && (
           <div className="flex justify-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl text-[11px] font-bold text-slate-500">
                 <Info size={14} className="text-medigo-blue" />
                 For rescheduling, please contact the clinic at least 24 hours in advance.
              </div>
           </div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}

function AppointmentCard({ appt, index, onCancel, cancelling, getStatusStyle }) {
  const navigate = useNavigate()
  const apptDate = new Date(appt.appointmentDate)
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.005, y: -2 }}
      className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-premium hover:border-blue-100 group transition-all relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-blue-500/5 transition-colors" />
      
      <div className="flex flex-col lg:flex-row lg:items-center gap-8 relative z-10">
        {/* Date Indicator */}
        <div className="shrink-0 flex justify-center">
           <div className="w-20 h-22 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center p-4 group-hover:bg-medigo-navy group-hover:border-medigo-navy group-hover:shadow-xl transition-all duration-300">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white/50 mb-1">{format(apptDate, 'EEE')}</span>
              <span className="text-3xl font-black text-medigo-navy group-hover:text-white tracking-tighter leading-none">{format(apptDate, 'd')}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white/60 mt-1">{format(apptDate, 'MMM')}</span>
           </div>
        </div>

        {/* Identity & Status */}
        <div className="flex-1 space-y-4">
           <div>
              <div className="flex flex-wrap items-center gap-3 mb-2.5">
                 <h3 className="text-xl font-black text-medigo-navy leading-none tracking-tight uppercase italic group-hover:text-medigo-blue transition-colors">
                    {appt.doctorName}
                 </h3>
                 <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${getStatusStyle(appt.status)} shadow-sm transition-all`}>
                    {appt.status}
                 </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-bold text-slate-400">
                 <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-medigo-blue/40" />
                    {appt.hospital || appt.specialty}
                 </div>
                 <div className="flex items-center gap-2">
                    <Clock size={14} className="text-medigo-blue/40" />
                    {appt.timeSlot}
                 </div>
                 <div className="flex items-center gap-2">
                    {appt.type === 'telemedicine' ? (
                       <><Video size={14} className="text-medigo-mint" /> Video Secure Room</>
                    ) : (
                       <><MapPin size={14} className="text-amber-400" /> In-person Visit</>
                    )}
                 </div>
              </div>
           </div>
           
           {appt.reason && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                 <p className="text-[11px] font-bold text-slate-400 italic leading-none truncate max-w-[280px]">"{appt.reason}"</p>
              </div>
           )}
           
           {appt.cancellationReason && (
              <div className="flex items-center gap-2 text-[11px] font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-xl w-fit">
                 <XCircle size={14} /> Refusal Reason: {appt.cancellationReason}
              </div>
           )}
        </div>

        {/* Action Controls */}
        <div className="lg:w-56 shrink-0 lg:border-l lg:border-slate-50 lg:pl-8 flex lg:flex-col items-center gap-3 justify-end lg:justify-center">
           {appt.status === 'confirmed' && (
              <Button 
                onClick={() => navigate(`/telemedicine/lobby/${appt._id}`)} 
                className="w-full h-12 bg-medigo-blue shadow-lg shadow-blue-500/20 group/b flex items-center justify-center gap-2"
              >
                <Video size={16} /> Join Now <ArrowRight size={14} className="group-hover/b:translate-x-1 transition-transform" />
              </Button>
           )}
           
           {['pending', 'confirmed'].includes(appt.status) && (
              <div className="flex flex-row lg:flex-col gap-2 w-full">
                 <button 
                    onClick={() => navigate(`/appointments/${appt._id}/reschedule`)}
                    className="flex-1 lg:w-full h-12 flex items-center justify-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black text-slate-500 uppercase tracking-widest hover:bg-white hover:border-medigo-blue hover:text-medigo-blue transition-all"
                 >
                    <RefreshCw size={14} /> Reschedule
                 </button>
                 <button 
                    onClick={onCancel}
                    disabled={cancelling}
                    className="flex-1 lg:w-full h-12 flex items-center justify-center gap-2 border border-red-50 text-red-500 text-[11px] font-black uppercase tracking-widest hover:bg-red-50 transition-all disabled:opacity-50"
                 >
                    {cancelling ? <RefreshCw size={14} className="animate-spin" /> : <XCircle size={14} />} 
                    Cancel
                 </button>
              </div>
           )}
           
           {appt.status === 'completed' && (
              <button 
                 onClick={() => navigate('/search')}
                 className="flex items-center gap-2 text-[11px] font-black text-medigo-blue uppercase tracking-widest hover:underline"
              >
                 Book Follow-up <ChevronRight size={14} />
              </button>
           )}

           <button className="p-2 text-slate-200 hover:text-slate-400 self-center hidden lg:block transition-colors mt-2">
              <MoreHorizontal size={20} />
           </button>
        </div>
      </div>
    </motion.div>
  )
}
