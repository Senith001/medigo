import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { format, addDays, startOfToday } from 'date-fns'
import {
   Video, MapPin, Calendar, Clock,
   ChevronLeft, ArrowRight, CheckCircle2,
   Activity, ShieldCheck, CreditCard,
   Stethoscope, AlertCircle, Sparkles,
   Loader2, Users, Hash
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { appointmentAPI, doctorAPI } from '../../services/api'
import DashboardLayout from '../../components/DashboardLayout'
import Button from '../../components/ui/Button'

const getDates = () => Array.from({ length: 14 }, (_, i) => addDays(startOfToday(), i + 1))

export function BookAppointment() {
   const { state } = useLocation()
   const navigate = useNavigate()
   const doctor = state?.doctor || null

   const [selectedDate, setSelectedDate] = useState(null)
   const [selectedSession, setSelectedSession] = useState(null)
   const [sessions, setSessions] = useState([])
   const [sessionsLoading, setSessionsLoading] = useState(false)
   const [type, setType] = useState('telemedicine')
   const [reason, setReason] = useState('')
   const [loading, setLoading] = useState(false)
   const [error, setError] = useState('')
   const dates = getDates()

   // ── Fetch doctor sessions for selected date ─────────────────
   useEffect(() => {
      if (!selectedDate || !doctor?._id) return
      setSessionsLoading(true)
      setSelectedSession(null)
      setSessions([])

      doctorAPI.getAvailability(doctor._id)
         .then(res => {
            if (res.data.success) {
               const dayName = format(selectedDate, 'EEEE') // Monday, Tuesday...
               const dateStr = format(selectedDate, 'yyyy-MM-dd')

               // Filter sessions matching selected day or specific date
               const matched = res.data.data.filter(s => {
                  if (s.date) return s.date === dateStr
                  return s.day === dayName
               })
               setSessions(matched)
            }
         })
         .catch(() => setSessions([]))
         .finally(() => setSessionsLoading(false))
   }, [selectedDate, doctor?._id])

   const handleSubmit = async () => {
      if (!selectedDate || !selectedSession) {
         setError('Please select a date and session.')
         return
      }
      if (!doctor._id || !doctor.email || !doctor.specialty) {
         setError('Doctor information is incomplete. Please go back and try again.')
         return
      }

      setError('')
      setLoading(true)

      try {
         const res = await appointmentAPI.book({
            doctorId: doctor._id,
            doctorName: doctor.fullName || doctor.name,
            doctorEmail: doctor.email,
            specialty: doctor.specialty,
            hospital: selectedSession.hospital || doctor.hospital || null,
            appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
            // ✅ timeSlot = session time range (not patient-selected)
            timeSlot: `${selectedSession.startTime} - ${selectedSession.endTime}`,
            sessionId: selectedSession._id,
            type,
            reason: reason.trim() || null,
            fee: selectedSession.fee || doctor.fee || 0,
         })

         if (res.status === 201) {
            navigate(`/payment/${res.data.appointment._id}`)
         } else if (res.status === 200) {
            const appt = res.data.appointment
            if (appt.paymentStatus === 'unpaid') {
               navigate(`/payment/${appt._id}`)
            } else if (appt.paymentStatus === 'processing') {
               setError('You already have a pending bank transfer for this session. Please wait for admin verification.')
               setSelectedSession(null)
            } else if (appt.paymentStatus === 'paid') {
               navigate('/appointments')
            }
         }

      } catch (err) {
         const status = err.response?.status
         const msg = err.response?.data?.message

         if (status === 409) {
            setError(msg || 'This session is fully booked. Please select another.')
            setSelectedSession(null)
            // Re-fetch sessions
            if (selectedDate && doctor?._id) {
               doctorAPI.getAvailability(doctor._id)
                  .then(res => {
                     if (res.data.success) {
                        const dayName = format(selectedDate, 'EEEE')
                        const dateStr = format(selectedDate, 'yyyy-MM-dd')
                        setSessions(res.data.data.filter(s =>
                           s.date ? s.date === dateStr : s.day === dayName
                        ))
                     }
                  })
                  .catch(() => { })
            }
         } else {
            setError(msg || 'Failed to book appointment. Please try again.')
         }
      } finally {
         setLoading(false)
      }
   }

   if (!doctor) return (
      <DashboardLayout isPatient={true}>
         <div className="py-20 text-center space-y-4">
            <p className="text-slate-400 font-bold uppercase tracking-widest">No doctor selected</p>
            <Button onClick={() => navigate('/search')}>Browse Medical Experts</Button>
         </div>
      </DashboardLayout>
   )

   return (
      <DashboardLayout isPatient={true}>
         <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto space-y-8 pb-20"
         >
            {/* Breadcrumb */}
            <div className="flex items-center justify-between">
               <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 group text-slate-400 hover:text-medigo-navy transition-colors font-bold text-sm"
               >
                  <div className="p-2 rounded-xl bg-white border border-slate-100 group-hover:border-medigo-blue transition-colors">
                     <ChevronLeft size={16} />
                  </div>
                  Back to search
               </button>
               <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Step 1 of 2</span>
                  <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                     <div className="bg-medigo-blue h-full w-1/2 rounded-full" />
                  </div>
               </div>
            </div>

            {/* Doctor Header */}
            <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-premium border border-slate-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-medigo-blue/5 blur-[100px] rounded-full" />
               <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-blue-50 to-indigo-50 border border-indigo-100 flex items-center justify-center text-medigo-blue text-3xl font-black shadow-sm shrink-0">
                  {(doctor.fullName || '').replace('Dr. ', '').split(' ').map(n => n[0]).join('').slice(0, 2)}
               </div>
               <div className="flex-1 text-center md:text-left space-y-2">
                  <h1 className="text-2xl font-black text-medigo-navy tracking-tight uppercase group-hover:text-medigo-blue transition-colors">
                     {doctor.fullName}
                  </h1>
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-6 gap-y-2 text-sm font-bold text-slate-400">
                     <div className="flex items-center gap-2">
                        <Stethoscope size={16} className="text-medigo-blue/40" />
                        {doctor.specialty}
                     </div>
                     <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-medigo-blue/40" />
                        {doctor.hospital}
                     </div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
               <div className="lg:col-span-8 space-y-8">

                  {/* Consultation Type */}
                  <section className="space-y-4">
                     <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                        1. Choose Consultation Type
                     </h3>
                     <div className="grid grid-cols-2 gap-4">
                        {[
                           { v: 'telemedicine', icon: Video, l: 'Video Call', desc: 'Secure HD video consultation' },
                           { v: 'in-person', icon: MapPin, l: 'Clinic Visit', desc: 'Face-to-face appointment' },
                        ].map(t => (
                           <button
                              key={t.v}
                              onClick={() => setType(t.v)}
                              className={`relative p-6 rounded-[2rem] border-2 text-left transition-all duration-300 group ${type === t.v
                                    ? 'bg-blue-50/50 border-medigo-blue shadow-premium ring-4 ring-blue-500/5'
                                    : 'bg-white border-slate-100 hover:border-slate-200'
                                 }`}
                           >
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all ${type === t.v ? 'bg-medigo-blue text-white shadow-lg' : 'bg-slate-50 text-slate-300'
                                 }`}>
                                 <t.icon size={24} />
                              </div>
                              <div className="space-y-1">
                                 <p className={`text-lg font-black tracking-tight leading-none ${type === t.v ? 'text-medigo-navy' : 'text-slate-500'
                                    }`}>{t.l}</p>
                                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.desc}</p>
                              </div>
                              {type === t.v && (
                                 <div className="absolute top-4 right-4 text-medigo-blue">
                                    <CheckCircle2 size={16} />
                                 </div>
                              )}
                           </button>
                        ))}
                     </div>
                  </section>

                  {/* Date + Session Selection */}
                  <section className="space-y-4">
                     <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                        2. Select Date & Session
                     </h3>
                     <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-premium border border-slate-100 space-y-8">

                        {/* Date Picker */}
                        <div className="flex overflow-x-auto pb-2 gap-3 no-scrollbar snap-x">
                           {dates.map(d => {
                              const active = selectedDate?.toDateString() === d.toDateString()
                              return (
                                 <button
                                    key={d.toISOString()}
                                    onClick={() => setSelectedDate(d)}
                                    className={`snap-center shrink-0 flex flex-col items-center justify-center w-20 h-24 rounded-[1.5rem] border-2 transition-all duration-300 ${active
                                          ? 'bg-medigo-navy border-medigo-navy text-white shadow-xl -translate-y-1'
                                          : 'bg-white border-slate-100 text-slate-400 hover:border-medigo-blue/30'
                                       }`}
                                 >
                                    <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${active ? 'text-white/50' : 'text-slate-300'}`}>
                                       {format(d, 'EEE')}
                                    </span>
                                    <span className={`text-2xl font-black tracking-tighter ${active ? 'text-white' : 'text-medigo-navy'}`}>
                                       {format(d, 'd')}
                                    </span>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${active ? 'text-white/60' : 'text-slate-400'}`}>
                                       {format(d, 'MMM')}
                                    </span>
                                 </button>
                              )
                           })}
                        </div>

                        {/* Sessions List */}
                        <AnimatePresence mode="wait">
                           {!selectedDate ? (
                              <div className="py-10 text-center bg-slate-50/50 rounded-3xl">
                                 <p className="text-xs font-black text-slate-300 uppercase tracking-widest">
                                    Select a date to view available sessions
                                 </p>
                              </div>
                           ) : sessionsLoading ? (
                              <div className="py-10 flex items-center justify-center gap-3 text-slate-300">
                                 <Loader2 size={24} className="animate-spin text-medigo-blue" />
                                 <p className="text-xs font-black uppercase tracking-widest">Loading sessions...</p>
                              </div>
                           ) : sessions.length === 0 ? (
                              <div className="py-10 text-center bg-slate-50/50 rounded-3xl">
                                 <Calendar size={32} className="text-slate-200 mx-auto mb-3" />
                                 <p className="text-xs font-black text-slate-300 uppercase tracking-widest">
                                    No sessions available on this date
                                 </p>
                              </div>
                           ) : (
                              <motion.div
                                 initial={{ opacity: 0, y: 8 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 className="space-y-3"
                              >
                                 <div className="flex items-center gap-2 mb-4">
                                    <Clock size={14} className="text-medigo-blue" />
                                    <p className="text-xs font-black text-medigo-navy uppercase tracking-widest">
                                       Available Sessions — {format(selectedDate, 'EEEE, MMM do')}
                                    </p>
                                 </div>

                                 {sessions.map(session => {
                                    const isFull = session.bookedCount >= session.maxPatients
                                    const isSelected = selectedSession?._id === session._id
                                    const remaining = session.maxPatients - (session.bookedCount || 0)
                                    const apptNo = (session.bookedCount || 0) + 1
                                    // Estimated time for next patient
                                    const estimatedTime = (() => {
                                       try {
                                          const [h, m] = session.startTime.replace(/\s?(AM|PM)/i, '').split(':').map(Number)
                                          const isPM = session.startTime.toUpperCase().includes('PM')
                                          let totalH = isPM && h !== 12 ? h + 12 : h
                                          let totalM = m + (session.bookedCount || 0) * (session.patientInterval || 30)
                                          totalH += Math.floor(totalM / 60)
                                          totalM = totalM % 60
                                          const period = totalH >= 12 ? 'PM' : 'AM'
                                          const dispH = totalH > 12 ? totalH - 12 : totalH || 12
                                          return `${dispH}:${String(totalM).padStart(2, '0')} ${period}`
                                       } catch {
                                          return session.startTime
                                       }
                                    })()

                                    return (
                                       <button
                                          key={session._id}
                                          disabled={isFull}
                                          onClick={() => !isFull && setSelectedSession(session)}
                                          className={`w-full p-5 rounded-[1.5rem] border-2 text-left transition-all duration-200 ${isSelected
                                                ? 'border-medigo-blue bg-blue-50/50 shadow-premium'
                                                : isFull
                                                   ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                                                   : 'border-slate-100 bg-white hover:border-medigo-blue/40 hover:shadow-sm'
                                             }`}
                                       >
                                          <div className="flex items-center gap-4">
                                             {/* Hospital logo placeholder */}
                                             <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-medigo-blue text-white' : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                <MapPin size={20} />
                                             </div>

                                             <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                   <p className="text-sm font-black text-medigo-navy uppercase truncate">
                                                      {session.hospital}
                                                   </p>
                                                   {isFull ? (
                                                      <span className="px-2 py-0.5 bg-red-50 text-red-500 border border-red-100 text-[9px] font-black uppercase rounded-full">
                                                         Full
                                                      </span>
                                                   ) : (
                                                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black uppercase rounded-full">
                                                         Available
                                                      </span>
                                                   )}
                                                </div>

                                                <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-wide flex-wrap">
                                                   <span className="flex items-center gap-1">
                                                      <Clock size={11} className="text-medigo-blue/50" />
                                                      {session.startTime} – {session.endTime}
                                                   </span>
                                                   <span className="flex items-center gap-1">
                                                      <MapPin size={11} className="text-medigo-blue/50" />
                                                      {session.location}
                                                   </span>
                                                   <span className="flex items-center gap-1 text-emerald-500">
                                                      <Users size={11} />
                                                      {remaining} slots left
                                                   </span>
                                                </div>
                                             </div>

                                             <div className="shrink-0 text-right">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                                   Your No.
                                                </p>
                                                <p className="text-2xl font-black text-medigo-blue tracking-tighter">
                                                   #{String(apptNo).padStart(2, '0')}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                                                   ~{estimatedTime}
                                                </p>
                                             </div>
                                          </div>

                                          {/* Fee */}
                                          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Channelling Fee
                                             </span>
                                             <span className="text-sm font-black text-medigo-navy">
                                                LKR {session.fee?.toLocaleString()}
                                             </span>
                                          </div>

                                          {isSelected && (
                                             <div className="mt-3 flex items-center gap-2 text-[10px] font-black text-medigo-blue uppercase tracking-widest">
                                                <CheckCircle2 size={12} /> Selected — Your estimated time is {estimatedTime}
                                             </div>
                                          )}
                                       </button>
                                    )
                                 })}
                              </motion.div>
                           )}
                        </AnimatePresence>
                     </div>
                  </section>

                  {/* Reason */}
                  <section className="space-y-4">
                     <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                        3. Consultation Notes
                     </h3>
                     <div className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-100 space-y-4">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                           Reason for Visit (Optional)
                        </label>
                        <textarea
                           className="w-full bg-slate-50/50 border border-slate-100 rounded-[1.5rem] px-5 py-4 text-medigo-navy outline-none focus:bg-white focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/5 transition-all font-bold placeholder:text-slate-300 resize-none h-32"
                           placeholder="Describe your symptoms or medical concerns..."
                           value={reason}
                           onChange={e => setReason(e.target.value)}
                        />
                        <div className="flex items-center gap-2 text-xs text-slate-300 font-bold px-1">
                           <Activity size={14} />
                           Your medical information is protected by 256-bit encryption.
                        </div>
                     </div>
                  </section>

                  {/* Error */}
                  {error && (
                     <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-600 text-sm font-bold"
                     >
                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                        <span>{error}</span>
                     </motion.div>
                  )}
               </div>

               {/* Booking Summary */}
               <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                  <div className="bg-gradient-to-br from-medigo-navy to-slate-900 rounded-[2.5rem] shadow-xl text-white p-8 overflow-hidden relative">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-medigo-blue/10 blur-3xl rounded-full" />
                     <div className="relative z-10 space-y-6">
                        <div>
                           <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">
                              Booking Summary
                           </h3>
                           <div className="h-0.5 w-12 bg-medigo-blue rounded-full" />
                        </div>

                        <div className="space-y-4">
                           <SummaryItem label="Doctor" value={doctor.fullName} />
                           <SummaryItem label="Type" value={type === 'telemedicine' ? 'Video Consult' : 'Clinic Visit'} icon={type === 'telemedicine' ? Video : MapPin} />
                           <SummaryItem label="Date" value={selectedDate ? format(selectedDate, 'MMM do, yyyy') : '—'} />
                           <SummaryItem label="Session" value={selectedSession ? `${selectedSession.startTime} – ${selectedSession.endTime}` : '—'} icon={Clock} />
                           <SummaryItem label="Hospital" value={selectedSession?.hospital || '—'} icon={MapPin} />
                           {selectedSession && (
                              <SummaryItem
                                 label="Appt No."
                                 value={`#${String((selectedSession.bookedCount || 0) + 1).padStart(2, '0')}`}
                                 icon={Hash}
                              />
                           )}
                        </div>

                        <div className="pt-4 border-t border-white/10">
                           <div className="flex justify-between items-end">
                              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total Fee</span>
                              <span className="text-3xl font-black text-white tracking-tighter">
                                 LKR {(selectedSession?.fee || doctor.fee || 0).toLocaleString()}
                              </span>
                           </div>
                        </div>

                        <Button
                           loading={loading}
                           disabled={loading || !selectedDate || !selectedSession}
                           onClick={handleSubmit}
                           className="w-full h-14 bg-medigo-blue hover:bg-medigo-blue-dark text-lg font-black group"
                        >
                           Confirm Booking
                           <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>

                        <div className="flex items-center justify-center gap-2 text-[10px] text-white/30 font-black uppercase tracking-widest">
                           <CreditCard size={12} /> Secure Payment
                        </div>
                     </div>
                  </div>

                  {selectedSession && (
                     <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-6">
                        <p className="text-[11px] font-black text-amber-700 uppercase tracking-widest mb-2">
                           Important Note
                        </p>
                        <p className="text-xs text-amber-600 font-medium leading-relaxed">
                           Please arrive at <span className="font-black">{selectedSession.hospital}</span> at least <span className="font-black">20 minutes</span> before your estimated time. Your appointment number is <span className="font-black">#{String((selectedSession.bookedCount || 0) + 1).padStart(2, '0')}</span>.
                        </p>
                     </div>
                  )}

                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                     <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
                        <Sparkles size={24} />
                     </div>
                     <div>
                        <p className="text-[14px] font-black text-medigo-navy leading-tight">Instant Confirmation</p>
                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">Verified Medical Network</p>
                     </div>
                  </div>
               </div>
            </div>
         </motion.div>
      </DashboardLayout>
   )
}

function SummaryItem({ label, value, icon: Icon }) {
   return (
      <div className="flex justify-between group">
         <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
         <div className="text-right flex items-center gap-2">
            {Icon && <Icon size={12} className="text-medigo-blue" />}
            <span className="text-sm font-black text-white group-hover:text-medigo-blue transition-colors truncate max-w-[140px]">
               {value}
            </span>
         </div>
      </div>
   )
}