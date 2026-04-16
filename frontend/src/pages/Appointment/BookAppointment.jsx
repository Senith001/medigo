import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { format, addDays, startOfToday } from 'date-fns'
import { 
  Video, MapPin, Calendar, Clock, 
  ChevronLeft, ArrowRight, CheckCircle2, 
  Activity, ShieldCheck, CreditCard, 
  Stethoscope, AlertCircle, Sparkles
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { appointmentAPI } from '../../services/api'
import DashboardLayout from '../../components/DashboardLayout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const TIME_SLOTS = [
  '08:00 - 08:30', '08:30 - 09:00', '09:00 - 09:30', '09:30 - 10:00',
  '10:00 - 10:30', '10:30 - 11:00', '11:00 - 11:30', '11:30 - 12:00',
  '14:00 - 14:30', '14:30 - 15:00', '15:00 - 15:30', '15:30 - 16:00',
  '16:00 - 16:30', '16:30 - 17:00',
]
const getDates = () => Array.from({ length: 14 }, (_, i) => addDays(startOfToday(), i + 1))

export function BookAppointment() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const doctor = state?.doctor || null
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [bookedSlots, setBookedSlots] = useState([])
  const [type, setType] = useState('telemedicine')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const dates = getDates()

  useEffect(() => {
    if (!selectedDate || !doctor) return
    setSlotsLoading(true); setSelectedSlot(null)
    appointmentAPI.getAvailability(doctor._id, format(selectedDate, 'yyyy-MM-dd'))
      .then(r => setBookedSlots(r.data.bookedSlots || []))
      .catch(() => setBookedSlots([]))
      .finally(() => setSlotsLoading(false))
  }, [selectedDate, doctor?._id])

  const handleSubmit = async () => {
    if (!selectedDate || !selectedSlot) { setError('Please select date and time.'); return }
    setError(''); setLoading(true)
    try {
      await appointmentAPI.book({
        doctorId: doctor._id,
        doctorName: doctor.fullName || doctor.name,
        doctorEmail: doctor.email || 'doctor@hospital.lk',
        specialty: doctor.specialty,
        hospital: doctor.hospital || null,
        appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
        timeSlot: selectedSlot, type, reason,
        fee: doctor.fee || 0,
      })
      setSuccess(true)
      setTimeout(() => navigate('/appointments'), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book. Please try another slot.')
    } finally { setLoading(false) }
  }

  if (!doctor) return (
    <DashboardLayout isPatient={true}>
      <div className="py-20 text-center space-y-4">
        <p className="text-slate-400 font-bold uppercase tracking-widest">No doctor selected</p>
        <Button onClick={() => navigate('/search')}>Browse Medical Experts</Button>
      </div>
    </DashboardLayout>
  )

  if (success) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 sm:p-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 sm:p-16 rounded-[3rem] shadow-premium border border-slate-100 max-w-xl w-full text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-medigo-blue/5 blur-3xl rounded-full" />
        
        <div className="w-24 h-24 bg-medigo-mint/10 text-medigo-mint rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
           <CheckCircle2 size={48} />
        </div>
        
        <h2 className="text-4xl font-black text-medigo-navy leading-tight tracking-tight mb-4">You're All Set!</h2>
        <p className="text-slate-500 font-medium mb-10 leading-relaxed text-lg">
          Appointment with <span className="text-medigo-blue font-black">{doctor.fullName}</span> has been confirmed for <span className="text-medigo-navy font-bold">{format(selectedDate, 'MMMM do')}</span> at <span className="text-medigo-navy font-bold">{selectedSlot}</span>.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
           <Button className="flex-1 h-14 text-lg" onClick={() => navigate('/appointments')}>My Appointments</Button>
           <Button variant="outline" className="flex-1 h-14 text-lg border-slate-200" onClick={() => navigate('/dashboard')}>Home</Button>
        </div>
        
        <p className="mt-8 text-xs text-slate-300 font-bold uppercase tracking-[0.2em]">Check your email for details • HIPAA Encrypted</p>
      </motion.div>
    </div>
  )

  return (
    <DashboardLayout isPatient={true}>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-8 pb-20"
      >
        {/* Navigation Breadcrumbs */}
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
           <div className="flex items-center gap-3 italic">
              <span className="text-xs font-black text-slate-300 uppercase tracking-widest leading-none">Step 1 of 2</span>
              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                 <div className="bg-medigo-blue h-full w-1/2 rounded-full" />
              </div>
           </div>
        </div>

        {/* Doctor Summary Header */}
        <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-premium border border-slate-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-medigo-blue/5 blur-[100px] rounded-full" />
           
           <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-blue-50 to-indigo-50 border border-indigo-100 flex items-center justify-center text-medigo-blue text-3xl font-black shadow-sm shrink-0">
              {(doctor.fullName || '').replace('Dr. ', '').split(' ').map(n => n[0]).join('').slice(0, 2)}
           </div>

           <div className="flex-1 text-center md:text-left space-y-2">
              <h1 className="text-2xl font-black text-medigo-navy tracking-tight uppercase group-hover:text-medigo-blue transition-colors">{doctor.fullName}</h1>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-6 gap-y-2 text-sm font-bold text-slate-400">
                 <div className="flex items-center gap-2">
                    <Stethoscope size={16} className="text-medigo-blue/40" />
                    {doctor.specialty}
                 </div>
                 <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-medigo-blue/40" />
                    {doctor.hospital}
                 </div>
                 <div className="flex items-center gap-2 text-medigo-mint">
                    <ShieldCheck size={16} />
                    Consultation Fee: Rs. {doctor.fee?.toLocaleString()}
                 </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           <div className="lg:col-span-8 space-y-8">
              
              {/* Type Selection */}
              <section className="space-y-4">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2 italic">1. Choose Consultation Type</h3>
                 <div className="grid grid-cols-2 gap-4">
                    {[
                      { v: 'telemedicine', icon: Video, l: 'Video Call', desc: 'Secure high-definition video room' }, 
                      { v: 'in-person', icon: MapPin, l: 'Clinic Visit', desc: 'Face-to-face in-person appointment' }
                    ].map(t => (
                       <button 
                         key={t.v} 
                         onClick={() => setType(t.v)}
                         className={`relative p-6 rounded-[2rem] border-2 text-left transition-all duration-300 group ${
                           type === t.v 
                             ? 'bg-blue-50/50 border-medigo-blue shadow-premium ring-4 ring-blue-500/5' 
                             : 'bg-white border-slate-100 hover:border-slate-200'
                         }`}
                       >
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all ${
                            type === t.v ? 'bg-medigo-blue text-white shadow-lg' : 'bg-slate-50 text-slate-300'
                          }`}>
                             <t.icon size={24} />
                          </div>
                          <div className="space-y-1">
                             <p className={`text-lg font-black tracking-tight leading-none ${type === t.v ? 'text-medigo-navy' : 'text-slate-500'}`}>{t.l}</p>
                             <p className="text-[11px] font-bold text-slate-400 group-hover:text-slate-500 transition-colors uppercase tracking-wider">{t.desc}</p>
                          </div>
                          {type === t.v && (
                            <div className="absolute top-4 right-4 text-medigo-blue animate-fade-in"><CheckCircle2 size={16} /></div>
                          )}
                       </button>
                    ))}
                 </div>
              </section>

              {/* Date Selection */}
              <section className="space-y-4">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2 italic">2. Select Availability</h3>
                 <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-premium border border-slate-100">
                    <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar snap-x">
                        {dates.map(d => {
                          const active = selectedDate?.toDateString() === d.toDateString()
                          return (
                            <button 
                               key={d.toISOString()} 
                               onClick={() => setSelectedDate(d)} 
                               className={`snap-center shrink-0 flex flex-col items-center justify-center w-20 h-24 rounded-[1.5rem] border-2 transition-all duration-300 ${
                                 active 
                                   ? 'bg-medigo-navy border-medigo-navy text-white shadow-xl -translate-y-1' 
                                   : 'bg-white border-slate-100 text-slate-400 hover:border-medigo-blue/30'
                               }`}
                            >
                               <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${active ? 'text-white/50' : 'text-slate-300'}`}>{format(d, 'EEE')}</span>
                               <span className={`text-2xl font-black tracking-tighter ${active ? 'text-white' : 'text-medigo-navy'}`}>{format(d, 'd')}</span>
                               <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${active ? 'text-white/60' : 'text-slate-400'}`}>{format(d, 'MMM')}</span>
                            </button>
                          )
                        })}
                    </div>

                    <AnimatePresence mode="wait">
                      {selectedDate ? (
                         <motion.div 
                           key={format(selectedDate, 'yyyy-MM-dd')}
                           initial={{ opacity: 0, height: 0 }}
                           animate={{ opacity: 1, height: 'auto' }}
                           exit={{ opacity: 0, height: 0 }}
                           className="mt-10 space-y-6 pt-10 border-t border-slate-50"
                         >
                            <div className="flex items-center gap-3 px-1">
                               <Clock size={16} className="text-medigo-blue" />
                               <h4 className="text-[14px] font-black text-medigo-navy uppercase tracking-widest italic">Choose Time Slot</h4>
                               {slotsLoading && <Loader2 size={14} className="animate-spin text-slate-300" />}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                               {TIME_SLOTS.map(slot => {
                                 const booked = bookedSlots.includes(slot), active = selectedSlot === slot
                                 return (
                                   <button 
                                     key={slot} 
                                     disabled={booked} 
                                     onClick={() => !booked && setSelectedSlot(slot)} 
                                     className={`px-4 py-3 rounded-2xl text-[13px] font-bold border-2 transition-all transition-duration-200 ${
                                       active 
                                         ? 'bg-blue-50 border-medigo-blue text-medigo-blue shadow-md' 
                                         : booked 
                                         ? 'bg-slate-50 border-transparent text-slate-300 line-through opacity-60' 
                                         : 'bg-white border-slate-100 text-slate-600 hover:border-medigo-blue/30'
                                     }`}
                                   >
                                     {slot}
                                   </button>
                                 )
                               })}
                            </div>
                         </motion.div>
                      ) : (
                         <div className="mt-10 py-10 text-center border-t border-slate-50 bg-slate-50/50 rounded-3xl">
                            <p className="text-xs font-black text-slate-300 uppercase tracking-widest italic">Select a date above to view available slots</p>
                         </div>
                      )}
                    </AnimatePresence>
                 </div>
              </section>

              {/* Consultation Context */}
              <section className="space-y-4">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2 italic">3. Consultation Context</h3>
                 <div className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-100 space-y-4">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason for Visit (Optional)</label>
                    <textarea 
                      className="w-full bg-slate-50/50 border border-slate-100 rounded-[1.5rem] px-5 py-4 text-medigo-navy outline-none focus:bg-white focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/5 transition-all font-bold placeholder:text-slate-300 resize-none h-32" 
                      placeholder="Tell us a little bit about your symptoms or medical concerns..."
                      value={reason} 
                      onChange={e => setReason(e.target.value)} 
                    />
                    <div className="flex items-center gap-2 text-xs text-slate-300 font-bold px-1">
                       <Activity size={14} />
                       Your medical information is protected by 256-bit encryption.
                    </div>
                 </div>
              </section>

              {error && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                   className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-600 text-sm font-bold shadow-lg shadow-red-500/5"
                 >
                    <AlertCircle size={20} className="shrink-0" /> {error}
                 </motion.div>
              )}
           </div>

           {/* Sticky Booking Summary */}
           <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              <div className="bg-gradient-to-br from-medigo-navy to-slate-900 rounded-[2.5rem] shadow-xl text-white p-8 overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-medigo-blue/10 blur-3xl rounded-full" />
                 
                 <div className="relative z-10 space-y-8">
                    <div>
                       <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 leading-none mb-4 italic">Booking Summary</h3>
                       <div className="h-0.5 w-12 bg-medigo-blue rounded-full" />
                    </div>

                    <div className="space-y-4">
                       <SummaryItem label="Doctor" value={doctor.fullName} />
                       <SummaryItem label="Type" value={type === 'telemedicine' ? 'Video Consult' : 'Clinic Visit'} icon={type === 'telemedicine' ? Video : MapPin} />
                       <SummaryItem label="Date" value={selectedDate ? format(selectedDate, 'MMM do, yyyy') : '—'} />
                       <SummaryItem label="Time Slot" value={selectedSlot || '—'} />
                    </div>

                    <div className="pt-6 border-t border-white/10 space-y-2">
                       <div className="flex justify-between items-end">
                          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total Fee</span>
                          <span className="text-3xl font-black text-white tracking-tighter italic">Rs. {doctor.fee?.toLocaleString()}</span>
                       </div>
                    </div>

                    <Button 
                      loading={loading}
                      disabled={loading || !selectedDate || !selectedSlot}
                      onClick={handleSubmit}
                      className="w-full h-14 bg-medigo-blue hover:bg-medigo-blue-dark text-lg font-black group transition-all"
                    >
                       Confirm Reservation <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-[10px] text-white/30 font-black uppercase tracking-widest">
                       <CreditCard size={12} /> Secure Stripe Payment
                    </div>
                 </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
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
          <span className="text-sm font-black text-white group-hover:text-medigo-blue transition-colors truncate max-w-[140px]">{value}</span>
       </div>
    </div>
  )
}
