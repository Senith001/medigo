import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, Calendar, Clock, Video,
  CheckCircle2, XCircle, FileText, CheckCircle,
  ClipboardList, AlertCircle, CalendarDays, MapPin, Building2,
  Stethoscope, MessageSquare, ShieldCheck, Mail, X, RefreshCw,
  ChevronRight, Pill, Download, Plus
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { appointmentAPI, reportAPI, prescriptionAPI } from '../../services/api'
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
  const [history, setHistory] = useState({ reports: [], prescriptions: [] })
  const [loadingHistory, setLoadingHistory] = useState(false)

  const fetchHistory = async (patientId) => {
    if (!patientId) return
    setLoadingHistory(true)
    try {
      const [repRes, preRes] = await Promise.all([
        reportAPI.getByPatient(patientId),
        prescriptionAPI.getByPatient(patientId)
      ])
      setHistory({
        reports: repRes.data.data || [],
        prescriptions: preRes.data.data || []
      })
    } catch (err) {
      console.error("Failed to fetch history:", err)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    if (selectedAppt) {
      fetchHistory(selectedAppt.patientId)
    } else {
      setHistory({ reports: [], prescriptions: [] })
    }
  }, [selectedAppt])

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
      
      const isCancelled = a.status === 'cancelled' || a.status === 'no-show';

      if (tab === 'today') {
        return aptDate.getTime() === today.getTime() && !isCancelled;
      }
      if (tab === 'upcoming') {
        return aptDate.getTime() > today.getTime() && !isCancelled;
      }
      if (tab === 'past') {
        return aptDate.getTime() < today.getTime() || (aptDate.getTime() >= today.getTime() && isCancelled);
      }
      return true
    })
  }

  // Grouping Logic
  const groupedSessions = () => {
    const list = getFilteredAppointments()
    const groups = {}

    list.forEach(a => {
      const dateKey = new Date(a.appointmentDate).toISOString().split('T')[0]
      // Use only the START time for grouping to catch overlapping sessions
      const startTime = (a.timeSlot || '').split('-')[0].trim()
      const key = `${dateKey}_${startTime}_${a.type}_${a.hospital || ''}`
      if (!groups[key]) {
        groups[key] = {
           id: key,
           date: a.appointmentDate,
           timeSlot: a.timeSlot, // Display the first one found
           type: a.type,
           hospital: a.hospital,
           location: a.location,
           appointments: [],
           totalCapacity: a.maxPatients || 0
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
        className="max-w-7xl mx-auto space-y-12 pb-20"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-medigo-blue mb-2">
              <ShieldCheck size={18} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Medical Verified</span>
            </div>
            <h1 className="text-4xl font-black text-medigo-navy tracking-tight leading-none">Consultations</h1>
            <p className="text-slate-500 font-medium mt-3 max-w-md">Manage your clinical queue and telemedicine sessions with real-time patient tracking.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex flex-col items-end mr-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Synced</span>
                <span className="text-xs font-bold text-medigo-navy">{new Date().toLocaleTimeString()}</span>
             </div>
             <Button 
                variant="outline" 
                size="md" 
                onClick={fetchApts} 
                loading={loading}
                className="bg-white border-slate-200 hover:border-medigo-blue hover:text-medigo-blue shadow-sm rounded-2xl px-6"
             >
                <RefreshCw size={18} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Sync Data
             </Button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 p-2 rounded-[2rem] border border-slate-100">
          <div className="flex items-center gap-1 w-full sm:w-auto p-1 bg-white rounded-2xl shadow-sm border border-slate-100">
             {[
               { id: 'today', label: 'Today', icon: CalendarDays },
               { id: 'upcoming', label: 'Upcoming', icon: Calendar },
               { id: 'past', label: 'History', icon: Clock }
             ].map((t) => (
               <button
                 key={t.id}
                 onClick={() => setTab(t.id)}
                 className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                   tab === t.id
                     ? 'bg-medigo-navy text-white shadow-lg shadow-medigo-navy/20 scale-[1.02]'
                     : 'text-slate-400 hover:text-medigo-navy hover:bg-slate-50'
                 }`}
               >
                 <t.icon size={14} />
                 {t.label}
               </button>
             ))}
          </div>
          
          <div className="flex items-center gap-6 px-6">
             <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase">Total Slots</span>
                <span className="text-lg font-black text-medigo-navy">{appointments.length}</span>
             </div>
             <div className="w-px h-8 bg-slate-200" />
             <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase">Active</span>
                <span className="text-lg font-black text-emerald-600">{appointments.filter(a => a.status === 'confirmed').length}</span>
             </div>
          </div>
        </div>

        {loading ? (
           <div className="grid grid-cols-1 gap-8">
             {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-[3rem] p-10 animate-pulse border border-slate-100 shadow-premium h-64" />
             ))}
           </div>
        ) : sessions.length === 0 ? (
           <motion.div 
             initial={{ opacity: 0, scale: 0.98 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-white rounded-[3rem] border border-slate-100 p-24 text-center shadow-premium relative overflow-hidden"
           >
             <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
             <div className="relative z-10">
                <div className="w-28 h-28 bg-gradient-to-tr from-slate-50 to-slate-100 border border-slate-200 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                   <Calendar size={48} className="text-slate-300" />
                </div>
                <h3 className="text-3xl font-black text-medigo-navy mb-3 tracking-tight">No {tab} appointments</h3>
                <p className="text-slate-400 font-medium max-w-sm mx-auto text-lg leading-relaxed">
                   Your clinical schedule is clear for this period. Enjoy your downtime or sync to refresh.
                </p>
                <Button variant="outline" className="mt-8 rounded-2xl px-10 border-slate-200" onClick={fetchApts}>
                  Refresh Schedule
                </Button>
             </div>
           </motion.div>
        ) : (
           <div className="space-y-12">
              {sessions.map((session, idx) => (
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    key={session.id}
                    className="bg-white rounded-[3rem] border border-slate-100 shadow-premium overflow-hidden group hover:border-medigo-blue/30 transition-all duration-500"
                 >
                     {/* Session Hero Header */}
                    <div className="relative p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-gradient-to-br from-slate-50/50 to-white">
                       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-medigo-blue via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                       
                       <div className="flex items-center gap-8 relative z-10">
                          <div className={`w-20 h-20 rounded-[1.75rem] flex items-center justify-center border-2 shadow-xl transform transition-transform group-hover:scale-105 duration-500 ${
                            session.type === 'telemedicine' 
                              ? 'bg-blue-600 text-white border-blue-400' 
                              : 'bg-emerald-600 text-white border-emerald-400'
                          }`}>
                             {session.type === 'telemedicine' ? <Video size={36} /> : <Stethoscope size={36} />}
                          </div>
                          <div>
                             <div className="flex items-center gap-3 mb-1.5">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${
                                  session.type === 'telemedicine' 
                                    ? 'bg-blue-50 text-blue-600 border-blue-100' 
                                    : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                }`}>
                                  {session.type === 'telemedicine' ? 'Virtual Session' : 'In-Clinic Clinic'}
                                </span>
                                {session.hospital && (
                                   <span className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest shadow-sm flex items-center gap-1.5">
                                      <MapPin size={10} className="text-medigo-blue" /> {session.hospital}
                                   </span>
                                )}
                                {tab === 'today' && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />}
                             </div>
                             <h2 className="text-3xl font-black text-medigo-navy tracking-tight">
                               {new Date(session.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                             </h2>
                             <div className="flex flex-wrap items-center gap-5 mt-3">
                                <span className="flex items-center gap-2 text-[13px] font-black text-slate-500 uppercase tracking-wider bg-slate-100/80 px-4 py-1.5 rounded-xl border border-slate-200/50 shadow-sm">
                                   <Clock size={16} className="text-medigo-blue" /> {session.timeSlot}
                                </span>
                                {session.location && (
                                   <span className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                                      <Building2 size={16} className="text-indigo-400" /> {session.location}
                                   </span>
                                )}
                                <div className="flex -space-x-3 overflow-hidden">
                                   {session.appointments.slice(0, 3).map((a, i) => (
                                     <div key={i} className="inline-block h-8 w-8 rounded-full ring-4 ring-white bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 border border-indigo-200">
                                       {a.patientName?.charAt(0)}
                                     </div>
                                   ))}
                                   {session.appointments.length > 3 && (
                                     <div className="inline-block h-8 w-8 rounded-full ring-4 ring-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200">
                                       +{session.appointments.length - 3}
                                     </div>
                                   )}
                                </div>
                             </div>
                          </div>
                       </div>
                       
                       <div className="bg-slate-50/80 border border-slate-100 rounded-[2rem] p-6 flex flex-col items-center min-w-[140px] shadow-inner relative z-10">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Queue Status</span>
                          <span className="text-3xl font-black text-medigo-navy">{session.appointments.length}</span>
                          <span className="text-[10px] font-bold text-slate-400">Total Booked</span>
                       </div>
                    </div>

                    {/* Patient List - More compact and premium */}
                    <div className="bg-white">
                       <div className="grid grid-cols-1 divide-y divide-slate-50">
                          {session.appointments.map((apt, aIdx) => (
                             <motion.div 
                                key={apt._id} 
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ delay: aIdx * 0.05 }}
                                className="group/item p-8 sm:px-10 flex flex-col lg:flex-row items-center gap-8 hover:bg-slate-50/70 transition-all duration-300 relative"
                             >
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-medigo-blue rounded-r-full opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                
                                {/* Patient Info Section */}
                                <div className="flex-1 flex items-center gap-8 w-full min-w-0">
                                   <div className="relative shrink-0">
                                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center text-medigo-navy font-black text-xl shadow-sm overflow-hidden group-hover/item:shadow-md transition-all">
                                         {apt.patientName?.substring(0, 2).toUpperCase()}
                                         <div className="absolute inset-0 bg-medigo-blue/5 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                      </div>
                                      {apt.patientNumber && (
                                        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-xl bg-medigo-navy text-white text-[10px] font-black flex items-center justify-center shadow-lg ring-4 ring-white">
                                          {apt.patientNumber}
                                        </div>
                                      )}
                                   </div>

                                   <div className="min-w-0 flex-1">
                                      <div className="flex flex-wrap items-center gap-3 mb-2">
                                         <h3 className="text-xl font-black text-medigo-navy tracking-tight">{apt.patientName}</h3>
                                         <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm ${getStatusStyle(apt.status)}`}>
                                            {apt.status}
                                         </span>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                         <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                            <ShieldCheck size={14} className="text-indigo-400" /> ID: {apt._id.slice(-6).toUpperCase()}
                                         </p>
                                         <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                            <Mail size={14} className="text-indigo-400" /> {apt.patientEmail || 'No Email'}
                                         </p>
                                         {apt.reason && (
                                            <span className="px-3 py-1 bg-blue-50 text-medigo-blue text-[10px] font-black rounded-lg border border-blue-100 flex items-center gap-1.5 animate-pulse">
                                               <MessageSquare size={12} /> Priority Note
                                            </span>
                                         )}
                                      </div>
                                   </div>
                                </div>

                                {/* Actions Section */}
                                <div className="flex items-center gap-3 shrink-0 w-full lg:w-auto">
                                   {apt.status === 'confirmed' && (
                                     <>
                                       {apt.type === 'telemedicine' && (
                                         <Button 
                                           className="flex-1 lg:flex-none h-12 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 px-8"
                                           onClick={() => navigate(`/telemedicine/lobby/${apt._id}`)}
                                         >
                                           <Video size={18} className="mr-2" /> Start Session
                                         </Button>
                                       )}
                                       <Button 
                                         variant="outline"
                                         className="flex-1 lg:flex-none h-12 rounded-xl text-emerald-600 border-emerald-200 hover:bg-emerald-50 px-8"
                                         onClick={() => updateStatus(apt._id, 'completed')}
                                         loading={updating === apt._id}
                                       >
                                         <CheckCircle size={18} className="mr-2" /> Finish
                                       </Button>
                                     </>
                                   )}

                                   <Button 
                                     variant="outline"
                                     className="flex-1 lg:flex-none h-12 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 px-8"
                                     onClick={() => setSelectedAppt(apt)}
                                   >
                                     View Details
                                   </Button>
                                </div>
                             </motion.div>
                          ))}
                       </div>
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

                {/* ── Patient History Section ── */}
                <div className="space-y-6 pt-4 border-t border-slate-100">
                   <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-medigo-navy uppercase tracking-widest">Patient Medical Records</h3>
                      <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                         {history.reports.length + history.prescriptions.length} Total Records
                      </span>
                   </div>

                   {loadingHistory ? (
                      <div className="flex items-center justify-center py-10">
                         <RefreshCw size={24} className="text-medigo-blue animate-spin" />
                      </div>
                   ) : (history.reports.length === 0 && history.prescriptions.length === 0) ? (
                      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center">
                         <FileText size={32} className="text-slate-300 mx-auto mb-3" />
                         <p className="text-sm font-bold text-slate-400 tracking-tight">No previous medical records found for this patient.</p>
                      </div>
                   ) : (
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                         {/* Reports */}
                         {history.reports.map(report => (
                            <div key={report._id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-medigo-blue/30 hover:shadow-sm transition-all group">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                                     <FileText size={20} />
                                  </div>
                                  <div>
                                     <h4 className="text-sm font-black text-medigo-navy group-hover:text-medigo-blue transition-colors">{report.title}</h4>
                                     <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(report.date).toLocaleDateString()}</p>
                                  </div>
                               </div>
                               <a href={`/${report.fileUrl}`} target="_blank" rel="noopener noreferrer">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-medigo-blue hover:bg-blue-50">
                                     <Download size={14} />
                                  </Button>
                               </a>
                            </div>
                         ))}

                         {/* Prescriptions */}
                         {history.prescriptions.map(prescription => (
                            <div key={prescription._id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-500/30 hover:shadow-sm transition-all group">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                                     <Pill size={20} />
                                  </div>
                                  <div>
                                     <h4 className="text-sm font-black text-medigo-navy group-hover:text-emerald-600 transition-colors">{prescription.diagnosis || 'Prescription'}</h4>
                                     <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(prescription.createdAt).toLocaleDateString()}</p>
                                  </div>
                               </div>
                               <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-emerald-500 hover:bg-emerald-50">
                                  <ChevronRight size={14} />
                               </Button>
                            </div>
                         ))}
                      </div>
                   )}
                </div>
                
                {selectedAppt.status === 'cancelled' && selectedAppt.cancellationReason && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">Reason for Cancellation</p>
                    <p className="text-sm font-medium text-red-900">{selectedAppt.cancellationReason}</p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-100 bg-white flex flex-col sm:flex-row gap-3 justify-end">
                 {selectedAppt.status === 'confirmed' && (
                    <Button 
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                      onClick={() => navigate('/doctor/prescriptions', { state: { patientId: selectedAppt.patientId, patientName: selectedAppt.patientName } })}
                    >
                       <Plus size={18} className="mr-2" /> Issue Prescription
                    </Button>
                 )}
                 <Button variant="outline" className="w-full sm:w-auto border-slate-200" onClick={() => setSelectedAppt(null)}>Close</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
