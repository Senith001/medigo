import { useState, useEffect } from 'react'
import {
  Clock, MapPin, Plus, Trash2, Building2, Loader2,
  CalendarDays, Video, MapPinned, AlertCircle,
  CheckCircle2, Calendar, ChevronRight, Users, Star, ArrowRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { doctorAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const TYPE_META = {
  'in-person': { label: 'In-Person', icon: MapPinned, cls: 'bg-amber-500/10 text-amber-600 border-amber-200/50' },
  'telemedicine': { label: 'Telemedicine', icon: Video, cls: 'bg-blue-500/10 text-blue-600 border-blue-200/50' },
  'both': { label: 'Hybrid', icon: CalendarDays, cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50' },
}

const to12 = (t) => {
  if (!t) return ''
  const [hStr, min] = t.split(':')
  let h = parseInt(hStr)
  const p = h >= 12 ? 'PM' : 'AM'
  if (h === 0) h = 12; else if (h > 12) h -= 12
  return `${h}:${min} ${p}`
}


// Helper to parse "09:00 AM" into minutes from midnight
const parseTime = (timeStr) => {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let [_, hours, mins, period] = match;
  hours = parseInt(hours);
  mins = parseInt(mins);
  if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
  if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
  return hours * 60 + mins;
};

// Determine if a session is upcoming

const isUpcoming = (session) => {
  const now = new Date();
  const today = new Date(); today.setHours(0, 0, 0, 0)
  
  if (session.date) {
    const d = new Date(session.date); d.setHours(0, 0, 0, 0)
    
    if (d < today) return false;
    if (d.getTime() === today.getTime()) {
      // Today: check if end time has passed
      const currentMins = now.getHours() * 60 + now.getMinutes();
      const endMins = parseTime(session.endTime);
      return endMins > currentMins;
    }
    return true; // Future date
  }

  // Recurring: always upcoming

  return true
}

const formatDate = (session) => {
  if (!session.date) return null
  const d = new Date(session.date)
  return {
    day: d.toLocaleDateString('en-US', { weekday: 'short' }),
    num: d.getDate(),
    mon: d.toLocaleDateString('en-US', { month: 'short' })
  }
}

const DEFAULT_FORM = { day: 'Monday', date: '', startTime: '09:00', endTime: '17:00', hospital: '', location: '', fee: 2500, consultationType: 'in-person' }

export default function ManageAvailability() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccess] = useState('')
  const [form, setForm] = useState(DEFAULT_FORM)
  const [showAll, setShowAll] = useState(false)

  const fetchAvailability = async () => {
    if (!user?.doctorId) return
    try {
      setLoading(true)
      const res = await doctorAPI.getAvailability(user.doctorId)
      if (res.data.success) setSessions(res.data.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { if (user?.role === 'doctor' && user.doctorId) fetchAvailability() }, [user])

  const handleAdd = async (e) => {
    e.preventDefault(); setError(''); setSuccess('')
    if (!form.hospital.trim()) return setError('Hospital name is required.')
    if (!form.location.trim()) return setError('Location is required.')
    if (form.startTime >= form.endTime) return setError('End time must be after start time.')

    if (form.date) {
      const selectedDate = new Date(form.date)
      selectedDate.setHours(0, 0, 0, 0)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) return setError('Cannot schedule for a past date.')
    }

    if (!user?.doctorId) return setError('Profile still syncing. Please wait.')
    setAdding(true)
    try {
      const res = await doctorAPI.addAvailability(user.doctorId, { ...form, startTime: to12(form.startTime), endTime: to12(form.endTime) })
      if (res.data.success) {
        setSessions(prev => [res.data.data, ...prev])
        setForm({ ...DEFAULT_FORM })
        setSuccess('Session successfully deployed!')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) { setError(err.response?.data?.message || err.message) }
    finally { setAdding(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this clinical session?')) return
    try { await doctorAPI.deleteAvailability(id); setSessions(prev => prev.filter(s => s._id !== id)) }
    catch { setError('Failed to deactivate session.') }
  }

  const upcomingSessions = sessions.filter(isUpcoming)
  const pastSessions = sessions.filter(s => !isUpcoming(s))
  const displaySessions = showAll ? sessions : upcomingSessions

  if (user?.role === 'doctor' && !user.doctorId) {
    return (
      <DashboardLayout isDoctor={true}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Star size={20} className="text-blue-600 fill-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Practice Credentials...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout isDoctor={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/10 p-2.5 rounded-2xl">
                  <CalendarDays className="text-emerald-600" size={24} />
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-medigo-navy tracking-tight">Clinical Sessions</h1>
              </div>
              <p className="text-slate-500 text-lg font-medium max-w-2xl">
                Configure your practice schedule. Manage availability across <span className="text-medigo-navy font-bold">multiple hospitals and consultation types</span>.
              </p>
            </div>
            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
              <div className="px-4 py-2 border-r border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Active</p>
                <p className="text-lg font-black text-medigo-navy leading-none">{upcomingSessions.length}</p>
              </div>
              <button
                onClick={() => setShowAll(!showAll)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-black text-slate-500 hover:text-medigo-blue transition-colors uppercase tracking-widest"
              >
                {showAll ? 'Upcoming Only' : `Full History (${sessions.length})`}
                <ChevronRight size={14} className={showAll ? 'rotate-180 transition-transform' : ''} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">

            {/* LEFT: Configuration Terminal */}
            <div className="xl:col-span-4">
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center">
                      <Plus size={24} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white tracking-tight leading-tight">Session Setup</h3>
                      <p className="text-slate-400 text-sm font-medium">New availability slot</p>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold flex items-start gap-3">
                        <AlertCircle size={16} className="shrink-0" /> {error}
                      </motion.div>
                    )}
                    {successMsg && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-bold flex items-center gap-3">
                        <CheckCircle2 size={16} className="shrink-0" /> {successMsg}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleAdd} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block">Day of Week</label>
                        <select className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-bold text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer"
                          value={form.day} onChange={e => setForm({ ...form, day: e.target.value })}>
                          {DAYS.map(d => <option key={d} value={d} className="bg-slate-900 text-white">{d}</option>)}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block">Specific Date (Optional)</label>
                        <input type="date" min={new Date().toISOString().split('T')[0]} className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-bold text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                          value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {[['Start Time', 'startTime'], ['End Time', 'endTime']].map(([label, field]) => (
                        <div key={field} className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block">{label}</label>
                          <input type="time" required className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-bold text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                            value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block">Hospital / Institution</label>
                      <div className="relative">
                        <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                        <input type="text" required placeholder="e.g. Apollo Medical Center"
                          className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 text-sm font-bold text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                          value={form.hospital} onChange={e => setForm({ ...form, hospital: e.target.value })} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block">Location</label>
                        <input type="text" required placeholder="City"
                          className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-bold text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                          value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block">Fee (LKR)</label>
                        <input type="number" min="0" required
                          className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-bold text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                          value={form.fee} onChange={e => setForm({ ...form, fee: Math.max(0, parseInt(e.target.value) || 0) })} />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block">Service Type</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { v: 'in-person', icon: MapPinned, l: 'On-Site' },
                          { v: 'telemedicine', icon: Video, l: 'Virtual' },
                          { v: 'both', icon: CalendarDays, l: 'Hybrid' },
                        ].map(t => (
                          <button key={t.v} type="button" onClick={() => setForm({ ...form, consultationType: t.v })}
                            className={`flex flex-col items-center justify-center gap-2 py-3.5 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all ${form.consultationType === t.v
                                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30'
                                : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'
                              }`}>
                            <t.icon size={18} />
                            <span>{t.l}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button type="submit" disabled={adding}
                      className="w-full h-16 rounded-[1.5rem] bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all hover:shadow-[0_15px_35px_rgba(37,99,235,0.4)] active:scale-95 disabled:opacity-50 mt-4 group">
                      {adding ? <Loader2 size={24} className="animate-spin" /> : (
                        <>
                          <span>Activate Session</span>
                          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* RIGHT: Practice Roster */}
            <div className="xl:col-span-8 space-y-8">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  Clinical Roster <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </h3>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-28 bg-white/80 backdrop-blur-xl rounded-[2rem] border border-slate-100 animate-pulse shadow-sm" />
                  ))}
                </div>
              ) : displaySessions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-[2.5rem] border border-slate-100 p-20 text-center space-y-6 shadow-premium"
                >
                  <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto border border-slate-100">
                    <CalendarDays size={40} className="text-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-medigo-navy tracking-tight">Empty Practice Schedule</h3>
                    <p className="text-slate-400 font-medium max-w-sm mx-auto">
                      {showAll ? 'No sessions have been configured for your profile yet.' : 'All scheduled clinical sessions have concluded.'}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {displaySessions.map((session, i) => {
                      const meta = TYPE_META[session.consultationType] || TYPE_META['in-person']
                      const TypeIcon = meta.icon
                      const dateInfo = formatDate(session)
                      const isPast = !isUpcoming(session)

                      return (
                        <motion.div
                          key={session._id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: i * 0.05 }}
                          className={`bg-white/80 backdrop-blur-xl rounded-[2rem] border p-6 flex items-center gap-6 group transition-all duration-300 ${isPast ? 'opacity-60 border-slate-100' : 'border-slate-100 hover:border-medigo-blue/30 hover:shadow-premium'
                            }`}
                        >
                          {/* Premium Date Block */}
                          <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-sm border ${dateInfo
                              ? 'bg-medigo-navy border-medigo-navy text-white'
                              : 'bg-white border-slate-100 text-medigo-navy'
                            }`}>
                            {dateInfo ? (
                              <>
                                <span className="text-[10px] font-black uppercase opacity-60 tracking-tighter">{dateInfo.mon}</span>
                                <span className="text-2xl font-black leading-none">{dateInfo.num}</span>
                                <span className="text-[10px] font-black uppercase opacity-60 tracking-tighter">{dateInfo.day}</span>
                              </>
                            ) : (
                              <>
                                <Calendar size={20} className="mb-0.5 opacity-40" />
                                <span className="text-[11px] font-black uppercase tracking-tighter">{session.day?.slice(0, 3)}</span>
                              </>
                            )}
                          </div>

                          {/* Session Context */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h4 className="text-lg font-black text-medigo-navy truncate tracking-tight">{session.hospital}</h4>
                              <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border flex items-center gap-1.5 ${meta.cls}`}>
                                <TypeIcon size={12} />
                                {meta.label}
                              </div>
                              {isPast && <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 border border-slate-200">Archive</span>}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-bold text-slate-400">
                              <div className="flex items-center gap-2">
                                <Clock size={16} className="text-medigo-blue" />
                                <span className="text-slate-600">{session.startTime} – {session.endTime}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-red-400" />
                                <span className="text-slate-600 truncate">{session.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users size={16} className="text-emerald-500" />
                                <span className="text-slate-600">{session.bookedCount || 0} booked</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Hub */}
                          <div className="flex items-center gap-5 shrink-0 pl-4 border-l border-slate-50">
                            <div className="text-right hidden sm:block">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Session Fee</p>
                              <p className="text-xl font-black text-medigo-navy tracking-tighter leading-none">
                                <span className="text-xs text-slate-300 font-bold mr-1">LKR</span>
                                {session.fee?.toLocaleString()}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDelete(session._id)}
                              className="w-12 h-12 rounded-2xl bg-white text-slate-300 hover:text-red-500 hover:bg-red-50 border border-slate-100 hover:border-red-100 transition-all flex items-center justify-center group/del shadow-sm hover:shadow-md"
                            >
                              <Trash2 size={20} className="group-hover/del:scale-110 transition-transform" />
                            </button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}