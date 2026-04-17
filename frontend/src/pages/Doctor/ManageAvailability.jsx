import { useState, useEffect } from 'react'
import {
   Clock, MapPin, Plus, Trash2,
   Building2, Loader2, CalendarDays,
   ShieldCheck, Calendar, Video,
   MapPinned, AlertCircle, CheckCircle2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { doctorAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'
import Button from '../../components/ui/Button'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// ✅ consultation type badge colors
const TYPE_STYLES = {
   'in-person': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', label: 'In-Person' },
   'telemedicine': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', label: 'Telemedicine' },
   'both': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', label: 'Both' },
}

// Convert "HH:MM AM/PM" ↔ "HH:MM" (input[type=time])
const to24 = (t) => {
   if (!t) return ''
   const m = t.trim().toUpperCase().match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/)
   if (!m) return t
   let h = parseInt(m[1])
   const min = m[2]
   if (m[3] === 'AM' && h === 12) h = 0
   if (m[3] === 'PM' && h !== 12) h += 12
   return `${String(h).padStart(2, '0')}:${min}`
}

const to12 = (t) => {
   if (!t) return ''
   const [hStr, min] = t.split(':')
   let h = parseInt(hStr)
   const period = h >= 12 ? 'PM' : 'AM'
   if (h === 0) h = 12
   else if (h > 12) h -= 12
   return `${h}:${min} ${period}`
}

const DEFAULT_FORM = {
   day: 'Monday',
   date: '',
   startTime: '09:00',
   endTime: '05:00',
   hospital: '',
   location: '',
   fee: 2500,
   consultationType: 'in-person',
}

export default function ManageAvailability() {
   const { user } = useAuth()
   const [sessions, setSessions] = useState([])
   const [loading, setLoading] = useState(true)
   const [adding, setAdding] = useState(false)
   const [error, setError] = useState('')
   const [successMsg, setSuccess] = useState('')
   const [form, setForm] = useState(DEFAULT_FORM)

   const fetchAvailability = async () => {
      if (!user?.doctorId) return
      try {
         setLoading(true)
         const res = await doctorAPI.getAvailability(user.doctorId)
         if (res.data.success) setSessions(res.data.data)
      } catch (err) {
         console.error(err)
      } finally {
         setLoading(false)
      }
   }

   useEffect(() => {
      if (user?.role === 'doctor' && user.doctorId) fetchAvailability()
   }, [user])

   const handleAdd = async (e) => {
      e.preventDefault()
      setError('')
      setSuccess('')

      if (!form.hospital.trim()) { setError('Hospital name is required.'); return }
      if (!form.location.trim()) { setError('Location is required.'); return }
      if (!form.startTime) { setError('Start time is required.'); return }
      if (!form.endTime) { setError('End time is required.'); return }
      if (form.startTime >= form.endTime) {
         setError('End time must be after start time.')
         return
      }

      if (!user?.doctorId) {
         setError('Consultant profile still synchronizing. Please wait.')
         return
      }

      setAdding(true)
      try {
         // ✅ Convert time input (24h) → 12h format for backend
         const payload = {
            ...form,
            startTime: to12(form.startTime),
            endTime: to12(form.endTime),
         }
         const res = await doctorAPI.addAvailability(user.doctorId, payload)
         if (res.data.success) {
            setSessions(prev => [...prev, res.data.data])
            setForm({ ...DEFAULT_FORM })
            setSuccess('Session registered successfully!')
            setTimeout(() => setSuccess(''), 3000)
         }
      } catch (err) {
         const msg = err.response?.data?.message || err.message
         setError(msg)
      } finally {
         setAdding(false)
      }
   }

   const handleDelete = async (id) => {
      if (!window.confirm('Remove this session?')) return
      try {
         await doctorAPI.deleteAvailability(id)
         setSessions(prev => prev.filter(s => s._id !== id))
      } catch {
         setError('Failed to remove session.')
      }
   }

   if (user?.role === 'doctor' && !user.doctorId) {
      return (
         <DashboardLayout isDoctor={true}>
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
               <Loader2 size={48} className="animate-spin text-medigo-blue" />
               <p className="text-sm font-black text-medigo-navy uppercase tracking-widest italic">
                  Synchronizing Clinical Identity...
               </p>
            </div>
         </DashboardLayout>
      )
   }

   return (
      <DashboardLayout isDoctor={true}>
         <div className="max-w-6xl mx-auto space-y-10 pb-20 font-inter">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="space-y-2">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-medigo-blue/10 rounded-xl flex items-center justify-center text-medigo-blue">
                        <CalendarDays size={22} />
                     </div>
                     <h1 className="text-3xl font-black text-medigo-navy tracking-tight uppercase italic">
                        Clinical <span className="text-medigo-blue">Availability</span>
                     </h1>
                  </div>
                  <p className="text-slate-500 font-medium italic">
                     Define your duty sessions and clinical locations.
                  </p>
               </div>
               <div className="px-5 py-2.5 bg-emerald-50 border border-emerald-100 rounded-full flex items-center gap-3 text-[10px] font-black text-emerald-600 uppercase tracking-widest animate-pulse">
                  <ShieldCheck size={16} /> Real-Time Residency Active
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

               {/* ── LEFT: Form ── */}
               <div className="lg:col-span-4 bg-slate-900 rounded-[3rem] p-8 text-white space-y-6 shadow-3xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(37,99,235,0.1),transparent)]" />

                  <div className="relative z-10 space-y-5">
                     <h3 className="text-sm font-black uppercase tracking-[0.3em] text-medigo-blue italic">
                        Configure New Session
                     </h3>

                     {/* Error */}
                     <AnimatePresence>
                        {error && (
                           <motion.div
                              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold"
                           >
                              <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
                           </motion.div>
                        )}
                        {successMsg && (
                           <motion.div
                              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-bold"
                           >
                              <CheckCircle2 size={16} /> {successMsg}
                           </motion.div>
                        )}
                     </AnimatePresence>

                     <form onSubmit={handleAdd} className="space-y-4">

                        {/* Day */}
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Week Day Cycle</label>
                           <select
                              className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-bold text-white outline-none focus:border-medigo-blue transition-all"
                              value={form.day}
                              onChange={e => setForm({ ...form, day: e.target.value })}
                           >
                              {DAYS.map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
                           </select>
                        </div>

                        {/* Date */}
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Specific Date (Optional)</label>
                           <div className="relative">
                              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                              <input
                                 type="date"
                                 className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 text-sm font-bold text-white outline-none focus:border-medigo-blue transition-all"
                                 value={form.date}
                                 onChange={e => setForm({ ...form, date: e.target.value })}
                              />
                           </div>
                        </div>

                        {/* Time — ✅ type="time" for proper validation */}
                        <div className="grid grid-cols-2 gap-3">
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Start Time</label>
                              <input
                                 type="time"
                                 required
                                 className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-bold text-white outline-none focus:border-medigo-blue transition-all"
                                 value={form.startTime}
                                 onChange={e => setForm({ ...form, startTime: e.target.value })}
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">End Time</label>
                              <input
                                 type="time"
                                 required
                                 className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-bold text-white outline-none focus:border-medigo-blue transition-all"
                                 value={form.endTime}
                                 onChange={e => setForm({ ...form, endTime: e.target.value })}
                              />
                           </div>
                        </div>

                        {/* Hospital */}
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Clinical Facility</label>
                           <div className="relative">
                              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                              <input
                                 type="text"
                                 required
                                 placeholder="e.g. Melsta Hospitals"
                                 className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 text-sm font-bold text-white outline-none focus:border-medigo-blue transition-all"
                                 value={form.hospital}
                                 onChange={e => setForm({ ...form, hospital: e.target.value })}
                              />
                           </div>
                        </div>

                        {/* Location + Fee */}
                        <div className="grid grid-cols-12 gap-3">
                           <div className="col-span-7 space-y-1.5">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Location</label>
                              <div className="relative">
                                 <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                 <input
                                    type="text"
                                    required
                                    placeholder="e.g. Ragama"
                                    className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 text-sm font-bold text-white outline-none focus:border-medigo-blue transition-all"
                                    value={form.location}
                                    onChange={e => setForm({ ...form, location: e.target.value })}
                                 />
                              </div>
                           </div>
                           <div className="col-span-5 space-y-1.5">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fee (LKR)</label>
                              <input
                                 type="number"
                                 min="0"
                                 required
                                 className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-bold text-white outline-none focus:border-medigo-blue transition-all"
                                 value={form.fee}
                                 onChange={e => setForm({ ...form, fee: Math.max(0, parseInt(e.target.value) || 0) })}
                              />
                           </div>
                        </div>

                        {/* ✅ NEW: Consultation Type Toggle */}
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Consultation Type</label>
                           <div className="grid grid-cols-3 gap-2">
                              {[
                                 { v: 'in-person', icon: MapPinned, l: 'In-Person' },
                                 { v: 'telemedicine', icon: Video, l: 'Video' },
                                 { v: 'both', icon: ShieldCheck, l: 'Both' },
                              ].map(t => (
                                 <button
                                    key={t.v}
                                    type="button"
                                    onClick={() => setForm({ ...form, consultationType: t.v })}
                                    className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-wider transition-all ${form.consultationType === t.v
                                          ? 'bg-medigo-blue border-medigo-blue text-white shadow-lg'
                                          : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                                       }`}
                                 >
                                    <t.icon size={16} />
                                    {t.l}
                                 </button>
                              ))}
                           </div>
                        </div>

                        <Button
                           type="submit"
                           loading={adding}
                           className="w-full h-14 rounded-[2rem] bg-medigo-blue hover:bg-medigo-blue-dark shadow-2xl shadow-blue-500/10 mt-2"
                        >
                           Deploy Clinical Slot <Plus size={18} className="ml-2" />
                        </Button>
                     </form>
                  </div>
               </div>

               {/* ── RIGHT: Sessions List ── */}
               <div className="lg:col-span-8 space-y-4">
                  <div className="bg-white rounded-[3.5rem] p-10 shadow-premium border border-slate-100 min-h-[600px] flex flex-col">
                     <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-[1.25rem] flex items-center justify-center">
                              <Clock size={24} />
                           </div>
                           <div>
                              <h2 className="text-xl font-black text-medigo-navy uppercase tracking-tighter italic leading-none">
                                 Registered Registry
                              </h2>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                 Live clinical schedule auditing
                              </p>
                           </div>
                        </div>
                        <span className="text-xs font-black text-medigo-blue uppercase tracking-widest">
                           {sessions.length} Slots Active
                        </span>
                     </div>

                     {loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-200">
                           <Loader2 size={48} className="animate-spin text-medigo-blue" />
                           <p className="text-[10px] font-black uppercase tracking-[0.3em]">Synchronizing Inventory...</p>
                        </div>
                     ) : sessions.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
                           <div className="w-32 h-32 bg-slate-50 text-slate-200 rounded-[3rem] flex items-center justify-center border-2 border-dashed border-slate-100">
                              <Calendar size={48} />
                           </div>
                           <div className="space-y-2">
                              <h3 className="text-xl font-black text-medigo-navy uppercase italic">Clinical Schedule Empty</h3>
                              <p className="text-slate-400 font-medium max-w-sm">
                                 No sessions configured. Add your first availability slot.
                              </p>
                           </div>
                        </div>
                     ) : (
                        <div className="grid gap-4">
                           <AnimatePresence mode="popLayout">
                              {sessions.map((session, i) => {
                                 const typeStyle = TYPE_STYLES[session.consultationType] || TYPE_STYLES['in-person']
                                 const TypeIcon = session.consultationType === 'telemedicine' ? Video
                                    : session.consultationType === 'both' ? ShieldCheck : MapPinned
                                 return (
                                    <motion.div
                                       key={session._id}
                                       initial={{ opacity: 0, x: 20 }}
                                       animate={{ opacity: 1, x: 0 }}
                                       exit={{ opacity: 0, scale: 0.95 }}
                                       transition={{ delay: i * 0.04 }}
                                       className="bg-white p-5 rounded-[2rem] border border-slate-100 hover:border-blue-200 hover:shadow-premium transition-all group flex items-center gap-5"
                                    >
                                       {/* Date badge */}
                                       <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-[1.25rem] flex flex-col items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors shrink-0 relative overflow-hidden">
                                          <div className="absolute top-0 left-0 w-full h-1 bg-medigo-blue opacity-50" />
                                          <span className="text-[9px] font-black text-medigo-blue uppercase tracking-tighter leading-none mb-0.5">
                                             {session.day.slice(0, 3)}
                                          </span>
                                          <span className="text-base font-black text-medigo-navy leading-none">
                                             {session.date ? session.date.split('-')[2] : '∞'}
                                          </span>
                                       </div>

                                       {/* Info */}
                                       <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                             <h4 className="text-sm font-black text-medigo-navy uppercase truncate">
                                                {session.hospital || 'Private Clinic'}
                                             </h4>
                                             {/* ✅ Consultation type badge */}
                                             <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wide ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}>
                                                <TypeIcon size={10} /> {typeStyle.label}
                                             </span>
                                             <span className="px-2 py-0.5 bg-slate-100 text-[9px] font-black text-slate-500 uppercase rounded">
                                                LKR {session.fee?.toLocaleString()}
                                             </span>
                                          </div>
                                          <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest flex-wrap">
                                             <span className="flex items-center gap-1.5">
                                                <Clock size={11} className="text-medigo-blue/40" />
                                                {session.startTime} – {session.endTime}
                                             </span>
                                             <span className="flex items-center gap-1.5">
                                                <MapPin size={11} className="text-medigo-blue/40" />
                                                {session.location}
                                             </span>
                                             {/* ✅ Capacity indicator */}
                                             <span className="flex items-center gap-1.5 text-emerald-500">
                                                <ShieldCheck size={11} />
                                                {session.bookedCount ?? 0}/{session.maxPatients ?? '∞'} booked
                                             </span>
                                          </div>
                                       </div>

                                       {/* Delete */}
                                       <button
                                          onClick={() => handleDelete(session._id)}
                                          className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 border border-transparent hover:border-red-100 transition-all flex items-center justify-center shrink-0"
                                       >
                                          <Trash2 size={16} />
                                       </button>
                                    </motion.div>
                                 )
                              })}
                           </AnimatePresence>
                        </div>
                     )}

                     <div className="mt-auto pt-8 flex items-center justify-center gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                           <ShieldCheck size={12} className="text-medigo-blue" /> Sovereign Clinical Identity Protected
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </DashboardLayout>
   )
}