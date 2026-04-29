import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Video, Calendar, Clock, ArrowRight,
  ExternalLink, Loader2, VideoOff,
  CheckCircle2, AlertCircle, PlayCircle,
  ChevronRight, History, X, MapPin,
  Stethoscope, CreditCard, FileText, Hash
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { telemedicineAPI } from '../../services/api'
import DashboardLayout from '../../components/DashboardLayout'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'

// ── Helper: is the appointment date >= today (midnight) ──────────────────────────
function isUpcomingDate(dateStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const apptDate = new Date(dateStr)
  apptDate.setHours(0, 0, 0, 0)
  return apptDate >= today
}

// ── Helper: is the appointment happening today ────────────────────────────────────
function isToday(dateStr) {
  const today = new Date().toISOString().split('T')[0]
  return (dateStr || '').split('T')[0] === today
}

export default function Telemedicine() {
  const { user } = useAuth()
  const isDoctor = user?.role === 'doctor'
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAppt, setSelectedAppt] = useState(null)

  const fetchTeleAppointments = async () => {
    try {
      setLoading(true)
      console.log('Fetching telemedicine sessions. User role:', user?.role, 'User ID:', user?.id)
      const res = await telemedicineAPI.getAll()

      console.log('API response:', res.data)
      if (res.data?.sessions) {
        const tele = res.data.sessions
          .sort((a, b) => new Date(a.scheduledAt || a.createdAt) - new Date(b.scheduledAt || b.createdAt))
        console.log('Sessions loaded:', tele.length)
        setAppointments(tele)
      } else {
        console.log('No sessions in response')
        setAppointments([])
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTeleAppointments() }, [])

  // ── Categories ────────────────────────────────────────────────────────────────
  // Live: active/waiting + today
  const liveSessions = appointments.filter(
    apt => ['active', 'waiting'].includes(apt.status) && isToday(apt.appointmentDate)
  )
  // Upcoming: scheduled/waiting/active + future date (not today)
  const upcomingSessions = appointments.filter(
    apt =>
      ['scheduled', 'waiting', 'active'].includes(apt.status) &&
      isUpcomingDate(apt.appointmentDate) &&
      !isToday(apt.appointmentDate)
  )
  // Past: ended/cancelled OR any session with a past date
  const pastSessions = appointments.filter(
    apt =>
      ['ended', 'cancelled'].includes(apt.status) ||
      (!isUpcomingDate(apt.appointmentDate) && !isToday(apt.appointmentDate))
  )

  if (loading) {
    return (
      <DashboardLayout isPatient={!isDoctor} isDoctor={isDoctor}>
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-300">
          <Loader2 size={48} className="animate-spin text-medigo-blue" />
          <p className="text-xs font-black uppercase tracking-widest">Synchronizing Telemedicine Channel...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout isPatient={!isDoctor} isDoctor={isDoctor}>
      <div className="max-w-6xl mx-auto space-y-10 pb-20 font-inter">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-medigo-blue/10 rounded-xl flex items-center justify-center text-medigo-blue shadow-sm">
              <Video size={22} />
            </div>
            <h1 className="text-3xl font-black text-medigo-navy tracking-tight uppercase italic">Tele<span className="text-medigo-blue">medicine</span></h1>
          </div>
          <p className="text-slate-500 font-medium italic">
            {isDoctor ? 'Manage your upcoming consultation sessions' : 'Video consultations with your doctors'}
          </p>
        </div>

        {/* Live Session Alert */}
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
                onClick={() => navigate(`/telemedicine/lobby/${liveSessions[0].appointmentId}`)}
                className="relative z-10 h-14 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 font-black uppercase text-xs tracking-widest"
              >
                Join Now <PlayCircle size={18} className="ml-2" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upcoming Sessions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                <Calendar size={18} />
              </div>
              <h2 className="text-xl font-black text-medigo-navy uppercase tracking-tighter italic">Upcoming Sessions</h2>
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
                <p className="text-slate-400 font-medium max-w-sm mx-auto italic">
                  {isDoctor 
                    ? 'You have no upcoming consultation sessions. Patients will see your availability and book with you.' 
                    : 'Start a digital consultation by selecting the Telemedicine option when booking a specialist.'}
                </p>
              </div>
              <Button onClick={() => navigate(isDoctor ? '/doctor/availability' : '/search')} variant="outline" className="rounded-2xl h-12">
                {isDoctor ? 'Manage Availability' : 'Search Doctors'}
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {upcomingSessions.map((session, i) => (
                <SessionCard
                  key={session._id}
                  session={session}
                  index={i}
                  isDoctor={isDoctor}
                  onJoin={() => navigate(`/telemedicine/lobby/${session.appointmentId}`)}
                  onClick={() => setSelectedAppt(session)}
                />
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
                <h2 className="text-xl font-black text-medigo-navy uppercase tracking-tighter italic">Past Sessions</h2>
              </div>
            </div>

            <div className="grid gap-3 opacity-70 hover:opacity-100 transition-opacity">
              {pastSessions.slice(0, 5).map((session) => (
                <button
                  key={session._id}
                  onClick={() => setSelectedAppt(session)}
                  className="bg-white/60 p-5 rounded-3xl border border-slate-100 flex items-center justify-between gap-4 hover:bg-white hover:shadow-md hover:border-slate-200 transition-all text-left w-full"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      session.status === 'ended' ? 'bg-emerald-50 text-emerald-500' :
                      session.status === 'cancelled' ? 'bg-red-50 text-red-400' : 'bg-slate-50 text-slate-400'
                    }`}>
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-medigo-navy uppercase italic">{isDoctor ? session.patientName : session.doctorName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {session.appointmentDate ? format(new Date(session.appointmentDate), 'dd MMM yyyy') : '—'} · {session.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    View Details <ChevronRight size={14} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Appointment Detail Modal */}
      <AnimatePresence>
        {selectedAppt && (
          <AppointmentDetailModal
            appt={selectedAppt}
            onClose={() => setSelectedAppt(null)}
            onJoin={() => navigate(`/telemedicine/lobby/${selectedAppt.appointmentId}`)}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}

// ── Session Card ─────────────────────────────────────────────────────────────────
function SessionCard({ session, index, isDoctor, onJoin, onClick }) {
  const isFull = (session.bookedCount || 0) >= (session.maxPatients || 999)
  const statusLabel = {
    scheduled: 'Scheduled',
    waiting: 'Waiting',
    active: 'Live',
    ended: 'Completed',
    cancelled: 'Cancelled'
  }[session.status] || session.status

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-white p-6 rounded-[2.5rem] border border-slate-100 hover:border-blue-200 transition-all hover:shadow-premium group flex flex-col sm:flex-row items-center gap-6 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex-1 flex items-center gap-5 min-w-0 w-full">
        {/* Date block */}
        <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-[1.5rem] flex flex-col items-center justify-center italic leading-none group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors shrink-0">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            {session.appointmentDate ? format(new Date(session.appointmentDate), 'MMM') : '—'}
          </span>
          <span className="text-xl font-black text-medigo-navy">
            {session.appointmentDate ? format(new Date(session.appointmentDate), 'd') : '—'}
          </span>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h4 className="text-sm font-black text-medigo-navy uppercase italic truncate">{isDoctor ? session.patientName : session.doctorName}</h4>
            <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded shadow-sm ${
              session.status === 'active'
                ? 'bg-emerald-50 text-emerald-600'
                : session.status === 'waiting'
                  ? 'bg-teal-50 text-teal-600'
                  : session.status === 'cancelled'
                    ? 'bg-red-50 text-red-600'
                    : session.status === 'ended'
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-indigo-50 text-indigo-600'
            }`}>
              {statusLabel}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest italic flex-wrap">
            <div className="flex items-center gap-1.5 font-black text-medigo-blue"><Clock size={12} /> {session.timeSlot?.split(' - ')[0]}</div>
            <div className="flex items-center gap-1.5"><ExternalLink size={12} /> ID: APT_{session._id.slice(-6).toUpperCase()}</div>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 italic">Click to view full details</p>
        </div>
      </div>

      <div className="shrink-0 flex sm:flex-col items-center gap-3 justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-8" onClick={e => e.stopPropagation()}>
        <Button
          onClick={onJoin}
          disabled={isFull}
          className="h-14 w-full sm:w-44 bg-teal-600 hover:bg-teal-700 shadow-xl shadow-teal-600/10 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest"
        >
          Join Session <Video size={16} className="ml-2" />
        </Button>
      </div>
    </motion.div>
  )
}

// ── Appointment Detail Modal ──────────────────────────────────────────────────────
function AppointmentDetailModal({ appt, onClose, onJoin }) {
  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-700',
    waiting:   'bg-teal-100 text-teal-700',
    active: 'bg-emerald-100 text-emerald-700',
    ended: 'bg-slate-100 text-slate-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  const apptDate = appt.appointmentDate ? new Date(appt.appointmentDate) : null
  const { user } = useAuth()
  const isDoctor = user?.role === 'doctor'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.93, y: 24 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="bg-white max-w-lg w-full rounded-[2.5rem] shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-medigo-navy to-[#0d3b6e] p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-56 h-56 bg-medigo-blue/20 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors z-10"
          >
            <X size={18} />
          </button>
          <div className="relative z-10 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">Appointment Details</span>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                <Video size={22} className="text-medigo-mint" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight leading-tight">{isDoctor ? appt.patientName : appt.doctorName || 'Unknown'}</h2>
                <p className="text-sm opacity-60 font-medium">{isDoctor ? 'Patient' : appt.specialty || 'General Physician'}</p>
              </div>
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[appt.status] || statusColors.scheduled}`}>
              {appt.status}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-5">
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <DetailRow icon={Calendar} label="Date" value={apptDate ? format(apptDate, 'EEEE, dd MMM yyyy') : '—'} />
            <DetailRow icon={Clock} label="Time" value={appt.timeSlot || '—'} />
          </div>

          {/* Type & Fee */}
          <div className="grid grid-cols-2 gap-4">
            <DetailRow
              icon={Video}
              label="Type"
              value="Video Consultation"
            />
            <DetailRow
              icon={CreditCard}
              label="Fee"
              value={appt.fee ? `LKR ${appt.fee.toLocaleString()}` : '—'}
            />
          </div>

          {/* Hospital */}
          {appt.hospital && (
            <DetailRow icon={Stethoscope} label="Hospital / Clinic" value={appt.hospital} full />
          )}

          {/* Appointment ID */}
          <DetailRow
            icon={Hash}
            label="Appointment ID"
            value={`APT_${appt._id?.slice(-6).toUpperCase()}`}
            full
          />

          {/* Reason */}
          {appt.reason && (
            <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1.5">
                <FileText size={11} /> Reason for Visit
              </p>
              <p className="text-sm font-medium text-slate-600 italic">"{appt.reason}"</p>
            </div>
          )}

          {/* Meeting Link */}
          {appt.meetingLink && (
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-medigo-blue mb-1">Meeting Link</p>
              <a
                href={appt.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-medigo-blue hover:underline break-all"
              >
                {appt.meetingLink}
              </a>
            </div>
          )}

          {/* Cancellation reason */}
          {appt.cancellationReason && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Cancellation Reason</p>
                <p className="text-sm font-medium text-red-600">{appt.cancellationReason}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 h-12 rounded-2xl border-slate-200 text-slate-600"
            >
              Close
            </Button>
            {['scheduled', 'waiting', 'active'].includes(appt.status) && (
              <Button
                onClick={() => { onClose(); onJoin() }}
                className="flex-1 h-12 rounded-2xl bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20"
              >
                <Video size={16} className="mr-2" /> Join Session
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Detail Row Helper ─────────────────────────────────────────────────────────────
function DetailRow({ icon: Icon, label, value, full }) {
  return (
    <div className={`p-4 bg-slate-50 border border-slate-100 rounded-2xl ${full ? 'col-span-2' : ''}`}>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1.5">
        <Icon size={11} /> {label}
      </p>
      <p className="text-sm font-bold text-medigo-navy">{value}</p>
    </div>
  )
}
