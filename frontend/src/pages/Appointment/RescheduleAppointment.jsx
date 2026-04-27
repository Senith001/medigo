import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, addDays, startOfToday } from 'date-fns'
import { appointmentAPI, doctorAPI } from '../../services/api'
import DashboardLayout from '../../components/DashboardLayout'
import Button from '../../components/ui/Button'
import { Calendar, Clock, ChevronLeft, CalendarClock, UserCheck, Loader2, MapPin, Building2, UserCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const getDates = () => Array.from({ length: 14 }, (_, i) => addDays(startOfToday(), i + 1))
const MOCK = { _id: 'a1', doctorId: 'd1', doctorName: 'Dr. Kamal Perera', specialty: 'Cardiology', hospital: 'Colombo General', appointmentDate: new Date(Date.now() + 86400000 * 3).toISOString(), timeSlot: '09:00 - 09:30', fee: 2500 }

export default function RescheduleAppointment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [appt, setAppt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)
  const [doctorSessions, setDoctorSessions] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const dates = getDates()

  // Helper to parse "HH:MM" into total minutes
  const parseTime = (t) => {
    if (!t) return 0;
    const clean = t.replace(/(AM|PM)/, '').trim();
    const [h, m] = clean.split(':').map(Number);
    let total = h * 60 + m;
    if (t.includes('PM') && h !== 12) total += 12 * 60;
    if (t.includes('AM') && h === 12) total -= 12 * 60;
    return total;
  };

  useEffect(() => {
    appointmentAPI.getById(id).then(r => {
      setAppt(r.data);
      if (r.data?.doctorId) {
        doctorAPI.getAvailability(r.data.doctorId)
          .then(res => setDoctorSessions(res.data.data || []))
          .catch(() => setDoctorSessions([]));
      }
    }).catch(() => setAppt(MOCK)).finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!selectedDate || !appt) return
    setSelectedSession(null)
  }, [selectedDate, appt?.doctorId])

  const getAvailableSessionsForDate = (date) => {
    if (!date) return [];
    return doctorSessions.filter(s => {
      if (s.date && s.date.split('T')[0] === format(date, 'yyyy-MM-dd')) return true;
      if (!s.date && s.day === format(date, 'EEEE')) return true;
      return false;
    });
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedSession) { setError('Please select a new session.'); return }
    setError(''); setSubmitting(true)
    const timeSlot = `${selectedSession.startTime} - ${selectedSession.endTime}`;
    try {
      await appointmentAPI.modify(id, { 
        appointmentDate: format(selectedDate, 'yyyy-MM-dd'), 
        timeSlot: timeSlot,
        sessionId: selectedSession._id // Added in case backend is updated to support occupancy
      })
      setSuccess(true); setTimeout(() => navigate('/appointments'), 2500)
    } catch (err) { setError(err.response?.data?.message || 'Failed to reschedule.') }
    finally { setSubmitting(false) }
  }

  if (loading) return (
    <DashboardLayout isPatient={true}>
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-300">
        <Loader2 size={48} className="animate-spin text-blue-600" />
        <p className="text-xs font-black uppercase tracking-widest">Loading Details...</p>
      </div>
    </DashboardLayout>
  )

  if (success) return (
    <DashboardLayout isPatient={true}>
      <div className="h-[75vh] flex items-center justify-center font-inter">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-12 rounded-[3.5rem] shadow-premium border border-slate-100 text-center max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-400" />
          <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-6">
            <CalendarClock size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic mb-2">Rescheduled!</h2>
          <p className="text-slate-500 text-sm font-medium mb-8">
            Your appointment has been successfully moved to <strong className="text-slate-800">{selectedDate && format(selectedDate, 'MMM d, yyyy')}</strong> at <strong className="text-slate-800">{selectedSession && `${selectedSession.startTime} - ${selectedSession.endTime}`}</strong>.
          </p>
          <Button onClick={() => navigate('/appointments')} className="w-full h-12 rounded-2xl">Return to Appointments</Button>
        </motion.div>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout isPatient={true}>
      <div className="max-w-4xl mx-auto space-y-6 pb-20 font-inter">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group hover:text-blue-600 transition-colors"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>

        {/* Current Appointment Banner */}
        <div className="bg-slate-900 rounded-3xl p-6 relative overflow-hidden shadow-xl text-white flex flex-col sm:flex-row items-center gap-6">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-16 h-16 bg-blue-500/20 border border-blue-400/30 rounded-2xl flex flex-col items-center justify-center shrink-0">
             <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest">{appt && format(new Date(appt.appointmentDate), 'MMM')}</span>
             <span className="text-xl font-black text-white">{appt && format(new Date(appt.appointmentDate), 'dd')}</span>
          </div>
          <div className="flex-1 text-center sm:text-left relative z-10">
            <h1 className="text-2xl font-black uppercase tracking-tighter italic text-white mb-1">Modify Appointment</h1>
            <p className="text-slate-400 text-sm font-medium">Currently scheduled with <span className="text-blue-300 font-bold">{appt?.doctorName}</span> for <span className="font-bold text-white">{appt?.timeSlot}</span>.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Calendar Picker */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-premium shrink-0 h-fit">
             <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Calendar size={14} /> Select New Date</h3>
             <div className="grid grid-cols-3 gap-2">
               {dates.map(d => {
                 const active = selectedDate?.toDateString() === d.toDateString()
                 const isActiveDay = getAvailableSessionsForDate(d).length > 0;
                 return (
                   <button 
                     key={d.toISOString()} 
                     disabled={!isActiveDay}
                     onClick={() => setSelectedDate(d)} 
                     className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all border-2 ${
                       active 
                        ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105' 
                        : isActiveDay 
                            ? 'border-slate-100 bg-slate-50 text-slate-500 hover:border-blue-200 hover:bg-blue-50'
                            : 'border-slate-50 bg-slate-50/50 text-slate-300 opacity-50 cursor-not-allowed'
                     }`}
                   >
                     <span className={`text-[9px] font-black uppercase tracking-widest ${active ? 'text-blue-200' : 'text-slate-400'}`}>{format(d, 'EEE')}</span>
                     <span className="text-xl font-black">{format(d, 'd')}</span>
                   </button>
                 )
               })}
             </div>
          </div>

          {/* Sessions & Confirm */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-premium flex-1">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><Clock size={14} /> Available Sessions</h3>
               </div>
               
               {!selectedDate ? (
                 <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-400">
                    <Calendar size={24} className="mb-2 opacity-50" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Pick a date first</span>
                 </div>
               ) : getAvailableSessionsForDate(selectedDate).length === 0 ? (
                 <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-400">
                    <Clock size={24} className="mb-2 opacity-50" />
                    <span className="text-[10px] font-black uppercase tracking-widest">No sessions scheduled for this date</span>
                 </div>
               ) : (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    {getAvailableSessionsForDate(selectedDate).map(session => {
                      const isFull = (session.bookedCount || 0) >= (session.maxPatients || 10);
                      const active = selectedSession?._id === session._id;
                      return (
                        <button 
                          key={session._id} 
                          disabled={isFull} 
                          onClick={() => !isFull && setSelectedSession(session)} 
                          className={`w-full text-left p-4 rounded-2xl transition-all border-2 relative overflow-hidden ${
                            active 
                              ? 'border-medigo-blue bg-blue-50/50 shadow-inner' 
                              : isFull 
                                ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                                : 'border-slate-50 bg-slate-50/50 hover:border-blue-200 hover:bg-blue-50/30'
                          }`}
                        >
                           <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                 <Building2 size={12} className={active ? 'text-medigo-blue' : 'text-slate-400'} />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{session.hospital}</span>
                              </div>
                              <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter italic ${
                                session.consultationType === 'telemedicine' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'
                              }`}>
                                {session.consultationType === 'telemedicine' ? 'Online' : 'Clinic'}
                              </div>
                           </div>
                           
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <div className="flex items-center gap-1.5 text-xs font-black text-slate-600 italic">
                                    <Clock size={12} className="text-medigo-blue" />
                                    {session.startTime} - {session.endTime}
                                 </div>
                                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <UserCircle2 size={12} />
                                    {session.bookedCount || 0} / {session.maxPatients || 10} Load
                                 </div>
                              </div>
                              {isFull ? (
                                <span className="text-[9px] font-black text-red-500 uppercase tracking-widest italic">Fully Booked</span>
                              ) : active && (
                                <div className="w-1.5 h-1.5 bg-medigo-blue rounded-full shadow-[0_0_10px_#2563eb]" />
                              )}
                           </div>
                        </button>
                      )
                    })}
                 </motion.div>
               )}
            </div>

            {/* Action Bar */}
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center mt-auto">
               <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
               <AnimatePresence>
                 {error && (
                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-xs font-bold bg-red-500/10 px-4 py-2 rounded-lg mb-4 w-full border border-red-500/20 flex justify-center">
                     {error}
                   </motion.div>
                 )}
               </AnimatePresence>
               
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Finalize Modification</p>
               <Button 
                 onClick={handleSubmit} 
                 disabled={submitting || !selectedDate || !selectedSession}
                 className="w-full h-14 rounded-2xl text-sm disabled:opacity-50"
               >
                 {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Confirm New Schedule'}
               </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
