import { useState, useEffect } from 'react'
import {
  Clock, MapPin, Plus, Trash2, Building2, Loader2,
  CalendarDays, Video, MapPinned, AlertCircle,
  CheckCircle2, Calendar, ChevronRight, Users
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { doctorAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_INDEX = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 0 }

const TYPE_META = {
  'in-person':   { label: 'In-Person', icon: MapPinned, cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  'telemedicine':{ label: 'Telemedicine', icon: Video,     cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  'both':        { label: 'Both',      icon: CalendarDays,cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
}

const to24 = (t) => {
  if (!t) return ''
  const m = t.trim().toUpperCase().match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/)
  if (!m) return t
  let h = parseInt(m[1]); const min = m[2]
  if (m[3] === 'AM' && h === 12) h = 0
  if (m[3] === 'PM' && h !== 12) h += 12
  return `${String(h).padStart(2, '0')}:${min}`
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

// Format date for display
const formatDate = (session) => {
  if (!session.date) return null
  const d = new Date(session.date)
  return { day: d.toLocaleDateString('en-US', { weekday: 'short' }), num: d.getDate(), mon: d.toLocaleDateString('en-US', { month: 'short' }) }
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
    
    // Validate past dates
    if (form.date) {
      const selectedDate = new Date(form.date)
      selectedDate.setHours(0, 0, 0, 0)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        return setError('Cannot schedule a session for a past date.')
      }
    }

    if (!user?.doctorId) return setError('Profile still syncing. Please wait.')
    setAdding(true)
    try {
      const res = await doctorAPI.addAvailability(user.doctorId, { ...form, startTime: to12(form.startTime), endTime: to12(form.endTime) })
      if (res.data.success) {
        setSessions(prev => [res.data.data, ...prev])
        setForm({ ...DEFAULT_FORM })
        setSuccess('Session added successfully!')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) { setError(err.response?.data?.message || err.message) }
    finally { setAdding(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this session?')) return
    try { await doctorAPI.deleteAvailability(id); setSessions(prev => prev.filter(s => s._id !== id)) }
    catch { setError('Failed to remove session.') }
  }

  // Separate upcoming vs past
  const upcomingSessions = sessions.filter(isUpcoming)
  const pastSessions = sessions.filter(s => !isUpcoming(s))
  const displaySessions = showAll ? sessions : upcomingSessions

  if (user?.role === 'doctor' && !user.doctorId) {
    return (
      <DashboardLayout isDoctor={true}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 size={40} className="animate-spin text-blue-600" />
          <p className="text-sm font-bold text-slate-500">Syncing your profile...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout isDoctor={true}>
      <div className="max-w-6xl mx-auto space-y-6 pb-20" style={{ fontFamily: "'Inter', sans-serif" }}>

        {/* ── Hero Banner with animated image ── */}
        <div className="relative rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0c1a2e 100%)' }}>
          {/* Glow blobs */}
          <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
          <div className="absolute -bottom-10 left-10 w-52 h-52 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-7">
            <div>
              <p className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-1">Clinical Management</p>
              <h1 className="text-3xl font-black text-white tracking-tight">
                Clinical <span className="text-transparent" style={{ WebkitBackgroundClip:'text', backgroundClip:'text', backgroundImage:'linear-gradient(90deg,#60a5fa,#34d399)' }}>Sessions</span>
              </h1>
              <p className="text-slate-400 text-sm mt-1">Configure and manage your availability schedule.</p>
              <div className="flex items-center gap-3 mt-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-emerald-400">{upcomingSessions.length} Upcoming</span>
                </div>
                {pastSessions.length > 0 && (
                  <button onClick={() => setShowAll(!showAll)}
                    className="text-xs font-bold text-slate-400 hover:text-white underline underline-offset-2 transition-colors">
                    {showAll ? 'Upcoming only' : `All sessions (${sessions.length})`}
                  </button>
                )}
              </div>
            </div>
            {/* Animated hero image */}
            <motion.img
              src="/doctor-schedule-hero.png"
              alt="Clinical scheduling"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-40 sm:w-52 object-contain opacity-90 drop-shadow-2xl hidden sm:block"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ── LEFT: Add Session Form ── */}
          <div className="lg:col-span-4">
            <div className="bg-slate-900 rounded-2xl p-6 text-white sticky top-6 overflow-hidden">
              {/* Decorative floating orbs */}
              <motion.div animate={{ scale: [1,1.15,1], opacity:[0.08,0.15,0.08] }} transition={{ duration:5, repeat:Infinity }}
                className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600 rounded-full blur-3xl pointer-events-none" />
              <motion.div animate={{ scale: [1,1.2,1], opacity:[0.05,0.1,0.05] }} transition={{ duration:7, repeat:Infinity, delay:2 }}
                className="absolute -bottom-10 -left-5 w-32 h-32 bg-indigo-500 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
                  <Plus size={18} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="font-black text-white text-sm">Add New Session</h3>
                  <p className="text-slate-500 text-xs">Configure a clinical availability slot</p>
                </div>
              </div>

              {/* Alerts */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold mb-4">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
                  </motion.div>
                )}
                {successMsg && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold mb-4">
                    <CheckCircle2 size={14} /> {successMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleAdd} className="space-y-4">
                {/* Day */}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Day of Week</label>
                  <select className="w-full h-11 bg-white/6 border border-white/10 rounded-xl px-3 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all"
                    value={form.day} onChange={e => setForm({ ...form, day: e.target.value })}>
                    {DAYS.map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
                  </select>
                </div>

                {/* Specific Date */}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Specific Date <span className="text-slate-600 normal-case">(optional)</span></label>
                  <input type="date" min={new Date().toISOString().split('T')[0]} className="w-full h-11 bg-white/6 border border-white/10 rounded-xl px-3 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all"
                    value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>

                {/* Times */}
                <div className="grid grid-cols-2 gap-3">
                  {[['Start Time', 'startTime'], ['End Time', 'endTime']].map(([label, field]) => (
                    <div key={field}>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">{label}</label>
                      <input type="time" required className="w-full h-11 bg-white/6 border border-white/10 rounded-xl px-3 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all"
                        value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} />
                    </div>
                  ))}
                </div>

                {/* Hospital */}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Hospital / Clinic</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={15} />
                    <input type="text" required placeholder="e.g. Melsta Hospitals"
                      className="w-full h-11 bg-white/6 border border-white/10 rounded-xl pl-9 pr-3 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all"
                      value={form.hospital} onChange={e => setForm({ ...form, hospital: e.target.value })} />
                  </div>
                </div>

                {/* Location + Fee */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                      <input type="text" required placeholder="City"
                        className="w-full h-11 bg-white/6 border border-white/10 rounded-xl pl-8 pr-3 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all"
                        value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Fee (LKR)</label>
                    <input type="number" min="0" required
                      className="w-full h-11 bg-white/6 border border-white/10 rounded-xl px-3 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all"
                      value={form.fee} onChange={e => setForm({ ...form, fee: Math.max(0, parseInt(e.target.value) || 0) })} />
                  </div>
                </div>

                {/* Consultation Type */}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Consultation Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { v: 'in-person', icon: MapPinned, l: 'In-Person' },
                      { v: 'telemedicine', icon: Video, l: 'Video' },
                      { v: 'both', icon: CalendarDays, l: 'Both' },
                    ].map(t => (
                      <button key={t.v} type="button" onClick={() => setForm({ ...form, consultationType: t.v })}
                        className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-[10px] font-black uppercase transition-all ${
                          form.consultationType === t.v
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'
                        }`}>
                        <t.icon size={15} />{t.l}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={adding}
                  className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 mt-2"
                  style={{ boxShadow: '0 4px 15px rgba(37,99,235,0.4)' }}>
                  {adding ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} /> Add Session</>}
                </button>
              </form>
              </div>{/* end relative z-10 */}
            </div>
          </div>

          {/* ── RIGHT: Sessions List ── */}
          <div className="lg:col-span-8 space-y-4">

            {/* Section Label */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-blue-600" />
                <span className="font-black text-slate-700 text-sm">
                  {showAll ? 'All Sessions' : 'Upcoming Sessions'}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium">{displaySessions.length} slot{displaySessions.length !== 1 ? 's' : ''}</span>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl border border-slate-100 py-16 flex flex-col items-center gap-3">
                <Loader2 size={32} className="animate-spin text-blue-500" />
                <p className="text-sm text-slate-400 font-medium">Loading sessions...</p>
              </div>
            ) : displaySessions.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-slate-100 py-12 text-center space-y-3">
                <motion.img
                  src="/clinical-empty-state.png"
                  alt="No sessions"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-36 mx-auto"
                />
                <h3 className="font-black text-slate-700">
                  {showAll ? 'No sessions configured' : 'No upcoming sessions'}
                </h3>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">
                  {showAll ? 'Add your first availability slot using the form.' : 'All your sessions have passed, or none are scheduled yet.'}
                </p>
                {!showAll && pastSessions.length > 0 && (
                  <button onClick={() => setShowAll(true)} className="text-blue-600 text-sm font-bold underline underline-offset-2">
                    View {pastSessions.length} past session{pastSessions.length !== 1 ? 's' : ''}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {displaySessions.map((session, i) => {
                    const meta = TYPE_META[session.consultationType] || TYPE_META['in-person']
                    const TypeIcon = meta.icon
                    const dateInfo = formatDate(session)
                    const isPast = !isUpcoming(session)
                    return (
                      <motion.div
                        key={session._id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ delay: i * 0.03 }}
                        className={`bg-white rounded-2xl border p-5 flex items-center gap-4 hover:shadow-md transition-all group ${
                          isPast ? 'border-slate-100 opacity-60' : 'border-slate-100 hover:border-blue-100'
                        }`}
                      >
                        {/* Date Badge */}
                        <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
                          dateInfo
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-slate-50 border-slate-100 text-slate-500'
                        }`}>
                          {dateInfo ? (
                            <>
                              <span className="text-[9px] font-black uppercase opacity-75">{dateInfo.mon}</span>
                              <span className="text-xl font-black leading-none">{dateInfo.num}</span>
                              <span className="text-[9px] font-black uppercase opacity-75">{dateInfo.day}</span>
                            </>
                          ) : (
                            <>
                              <Calendar size={16} className="mb-0.5" />
                              <span className="text-[9px] font-black uppercase">{session.day?.slice(0, 3)}</span>
                              <span className="text-[8px] opacity-60">Weekly</span>
                            </>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-black text-slate-800 truncate">{session.hospital || 'Private Clinic'}</h4>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${meta.cls}`}>
                              <TypeIcon size={10} /> {meta.label}
                            </span>
                            {isPast && <span className="text-[10px] font-black text-slate-400 bg-slate-50 border border-slate-100 rounded-full px-2 py-0.5">Past</span>}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1.5">
                              <Clock size={12} className="text-blue-400" />
                              {session.startTime} – {session.endTime}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin size={12} className="text-blue-400" />
                              {session.location}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Users size={12} className="text-emerald-500" />
                              {session.bookedCount ?? 0}/{session.maxPatients ?? '∞'} booked
                            </span>
                          </div>
                        </div>

                        {/* Fee + Delete */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right hidden sm:block">
                            <p className="text-[10px] text-slate-400 font-medium">Fee</p>
                            <p className="font-black text-slate-800 text-sm">LKR {session.fee?.toLocaleString()}</p>
                          </div>
                          <button onClick={() => handleDelete(session._id)}
                            className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 border border-transparent hover:border-red-100 transition-all flex items-center justify-center">
                            <Trash2 size={15} />
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
      </div>
    </DashboardLayout>
  )
}