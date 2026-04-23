import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, Calendar, Clock, Video,
  CheckCircle2, XCircle, FileText, CheckCircle,
  ClipboardList, AlertCircle, CalendarDays,
  Stethoscope, MessageSquare, ShieldCheck, Mail, X, RefreshCw
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { appointmentAPI } from '../../services/api'
import DashboardLayout from '../../components/DashboardLayout'
import Button from '../../components/ui/Button'

export default function DoctorAppointments() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  
  // Tabs: 'today', 'upcoming', 'past'
  const [tab, setTab] = useState('today')
  const [selectedAppt, setSelectedAppt] = useState(null)

  const fetchApts = async () => {
    setLoading(true)
    try {
      const res = await appointmentAPI.getAll({ limit: 1000 })
      setAppointments(res.data.appointments || [])
    } catch {
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchApts() }, [])

  const updateStatus = async (id, status, meetingLink) => {
    setUpdating(id)
    try {
      await appointmentAPI.updateStatus(id, { status, meetingLink })
      fetchApts()
      if (selectedAppt && selectedAppt._id === id) {
        setSelectedAppt(prev => ({ ...prev, status }))
      }
    } finally {
      setUpdating(null)
    }
  }

  // Filter Logic
  const getFilteredAppointments = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return appointments.filter(a => {
      const aptDate = new Date(a.appointmentDate)
      aptDate.setHours(0, 0, 0, 0)
      
      if (tab === 'today') return aptDate.getTime() === today.getTime()
      if (tab === 'upcoming') return aptDate.getTime() > today.getTime()
      if (tab === 'past') return aptDate.getTime() < today.getTime()
      return true
    })
  }

  // Grouping Logic
  const groupedSessions = () => {
    const list = getFilteredAppointments()
    const groups = {}

    list.forEach(a => {
      const dateKey = new Date(a.appointmentDate).toISOString().split('T')[0]
      const key = `${dateKey}_${a.timeSlot}_${a.type}`
      if (!groups[key]) {
        groups[key] = {
           id: key,
           date: a.appointmentDate,
           timeSlot: a.timeSlot,
           type: a.type,
           appointments: []
        }
      }
      groups[key].appointments.push(a)
    })

    return Object.values(groups).sort((a,b) => {
      if (tab === 'past') {
         return new Date(b.date) - new Date(a.date) // Descending for past
      }
      return new Date(a.date) - new Date(b.date) // Ascending for today/upcoming
    })
  }

  const getStatusStyle = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
      completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      'no-show': 'bg-slate-100 text-slate-700 border-slate-200',
    }
    return styles[status] || styles.pending
  }

  const sessions = groupedSessions()

  return (
    <DashboardLayout isDoctor={true}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8 pb-20"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-medigo-navy tracking-tight">Consultations</h1>
            <p className="text-slate-500 font-medium">Manage your daily clinic and virtual sessions.</p>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" size="sm" onClick={fetchApts} loading={loading}>
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Sync
             </Button>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="bg-white border border-slate-100 rounded-2xl p-2 inline-flex shadow-sm">
           {['today', 'upcoming', 'past'].map((t) => (
             <button
               key={t}
               onClick={() => setTab(t)}
               className={`px-8 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                 tab === t
                   ? 'bg-medigo-navy text-white shadow-md'
                   : 'text-slate-400 hover:text-medigo-navy hover:bg-slate-50'
               }`}
             >
               {t}
             </button>
           ))}
        </div>

        {loading ? (
           <div className="space-y-6">
             {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-[2.5rem] p-8 animate-pulse border border-slate-100 shadow-sm h-40" />
             ))}
           </div>
        ) : sessions.length === 0 ? (
           <div className="bg-white rounded-[2.5rem] border border-slate-100 p-20 text-center shadow-sm">
             <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={40} className="text-slate-300" />
             </div>
             <h3 className="text-2xl font-black text-medigo-navy mb-2">No {tab} sessions</h3>
             <p className="text-slate-400 font-medium">You don't have any sessions scheduled for this period.</p>
           </div>
        ) : (
           <div className="space-y-8">
              {sessions.map((session, idx) => (
                 <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={session.id}
                    className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium overflow-hidden"
                 >
                    {/* Session Header */}
                    <div className="bg-gradient-to-r from-slate-50 to-white p-6 sm:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div className="flex items-center gap-6">
                          <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center border shadow-sm ${session.type === 'telemedicine' ? 'bg-blue-50 text-medigo-blue border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                             {session.type === 'telemedicine' ? <Video size={30} /> : <Stethoscope size={30} />}
                          </div>
                          <div>
                             <h2 className="text-2xl font-black text-medigo-navy tracking-tight flex items-center gap-2">
                               {new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                             </h2>
                             <div className="flex items-center gap-4 mt-2">
                                <span className="flex items-center gap-1.5 text-sm font-bold text-slate-500 uppercase tracking-widest">
                                   <Clock size={16} className="text-medigo-blue" /> {session.timeSlot}
                                </span>
                                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                                <span className="text-sm font-bold text-slate-500 flex items-center gap-1.5">
                                   <Users size={16} /> {session.appointments.length} Patient{session.appointments.length !== 1 && 's'} Booked
                                </span>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Patient List container */}
                    <div className="divide-y divide-slate-50">
                       {session.appointments.map(apt => (
                          <div key={apt._id} className="p-6 sm:p-8 flex flex-col xl:flex-row items-center gap-6 hover:bg-slate-50/50 transition-colors">
                             
                             {/* Patient Info */}
                             <div className="flex-1 flex items-center gap-5 w-full">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-lg shadow-sm shrink-0 cursor-pointer hover:bg-indigo-100 transition-colors" onClick={() => setSelectedAppt(apt)}>
                                  {apt.patientName?.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setSelectedAppt(apt)}>
                                  <div className="flex items-center gap-3">
                                    {apt.patientNumber && (
                                      <span className="shrink-0 px-2.5 py-1 rounded-[6px] text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200 shadow-sm">
                                        No. {apt.patientNumber}
                                      </span>
                                    )}
                                    <h3 className="text-lg font-black text-medigo-navy truncate">{apt.patientName}</h3>
                                    <span className={`shrink-0 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(apt.status)}`}>
                                      {apt.status}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 mt-1.5">
                                     <p className="text-xs font-bold text-slate-400 truncate">Appt No: #{apt._id.slice(-6).toUpperCase()}</p>
                                     {apt.reason && (
                                       <>
                                         <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                         <p className="text-xs font-bold text-medigo-blue flex items-center gap-1 truncate">
                                            <MessageSquare size={12} /> Note Attached
                                         </p>
                                       </>
                                     )}
                                  </div>
                                </div>
                             </div>

                             {/* Quick Actions explicitly surfaced outside the modal */}
                             <div className="flex items-center gap-3 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 hide-scrollbar">
                                {apt.status === 'pending' && (
                                  <>
                                    <Button 
                                      variant="outline" 
                                      className="border-red-200 text-red-600 hover:bg-red-50"
                                      onClick={() => updateStatus(apt._id, 'cancelled')}
                                      loading={updating === apt._id}
                                    >
                                      Decline
                                    </Button>
                                    <Button 
                                      className="bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                                      onClick={() => updateStatus(apt._id, 'confirmed')}
                                      loading={updating === apt._id}
                                    >
                                      <CheckCircle2 size={16} className="mr-1.5" /> Accept
                                    </Button>
                                  </>
                                )}

                                {apt.status === 'confirmed' && (
                                  <>
                                    {apt.type === 'telemedicine' && (
                                      <Button 
                                        className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
                                        onClick={() => navigate(`/telemedicine/lobby/${apt._id}`)}
                                      >
                                        <Video size={16} className="mr-1.5" /> Join Video
                                      </Button>
                                    )}
                                    <Button 
                                      variant="outline"
                                      className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                      onClick={() => updateStatus(apt._id, 'completed')}
                                      loading={updating === apt._id}
                                    >
                                      Mark Completed
                                    </Button>
                                  </>
                                )}

                                <Button 
                                  variant="outline"
                                  className="text-slate-500 hover:text-medigo-navy"
                                  onClick={() => setSelectedAppt(apt)}
                                >
                                  Details
                                </Button>
                             </div>
                          </div>
                       ))}
                    </div>
                 </motion.div>
              ))}
           </div>
        )}
      </motion.div>

      {/* ── Appointment Details Modal ── */}
      <AnimatePresence>
        {selectedAppt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAppt(null)}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 sm:p-8 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-black text-2xl shadow-md">
                    {selectedAppt.patientName?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-medigo-navy tracking-tight mt-1">{selectedAppt.patientName}</h2>
                    <div className="flex items-center gap-3 mt-1.5">
                      {selectedAppt.patientNumber && (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border bg-slate-100 text-slate-500 border-slate-200">
                          QUEUE NO. {selectedAppt.patientNumber}
                        </span>
                      )}
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(selectedAppt.status)}`}>
                        {selectedAppt.status}
                      </span>
                      <span className="text-xs font-bold text-slate-400">Appt No: #{selectedAppt._id.slice(-6).toUpperCase()}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAppt(null)}
                  className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                      <Calendar size={16} />
                      <span className="text-xs font-black uppercase tracking-widest">Schedule</span>
                    </div>
                    <p className="text-sm font-bold text-medigo-navy">{new Date(selectedAppt.appointmentDate).toLocaleDateString()}</p>
                    <p className="text-lg font-black text-blue-600">{selectedAppt.timeSlot}</p>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                      {selectedAppt.type === 'telemedicine' ? <Video size={16} /> : <Stethoscope size={16} />}
                      <span className="text-xs font-black uppercase tracking-widest">Type</span>
                    </div>
                    <p className="text-lg font-black text-indigo-900">{selectedAppt.type === 'telemedicine' ? 'Video Consult' : 'Clinic Visit'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <MessageSquare size={14} className="text-[#008080]" /> Message for Doctor
                  </h3>
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-5">
                    {selectedAppt.reason ? (
                      <p className="text-sm font-bold text-medigo-navy leading-relaxed italic">"{selectedAppt.reason}"</p>
                    ) : (
                      <p className="text-sm text-slate-400 italic">No notes provided.</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 bg-slate-50/50 p-5 border border-slate-100 rounded-2xl">
                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><ShieldCheck size={12} /> Payment</h3>
                    <p className="text-sm font-bold text-medigo-navy flex items-center gap-2">
                      {selectedAppt.paymentStatus === 'paid' ? <span className="text-emerald-500">Paid</span> : <span className="text-amber-500">{selectedAppt.paymentStatus}</span>}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Mail size={12} /> Contact</h3>
                    <p className="text-sm font-bold text-medigo-navy break-all">{selectedAppt.patientEmail || 'N/A'}</p>
                  </div>
                </div>
                
                {selectedAppt.status === 'cancelled' && selectedAppt.cancellationReason && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">Reason for Cancellation</p>
                    <p className="text-sm font-medium text-red-900">{selectedAppt.cancellationReason}</p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-100 bg-white flex flex-col sm:flex-row gap-3 justify-end">
                 <Button className="w-full sm:w-auto" onClick={() => setSelectedAppt(null)}>Close Details</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
