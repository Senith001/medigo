import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, differenceInDays, isToday, isTomorrow } from 'date-fns'
import {
  Calendar, Clock, Video, MapPin,
  ChevronRight, ArrowRight, CheckCircle2,
  XCircle, AlertCircle, RefreshCw,
  Info, Plus, History, CalendarClock,
  Stethoscope, Users, X, CreditCard, FileText, Hash, Star
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { appointmentAPI } from '../../services/api'
import DashboardLayout from '../../components/DashboardLayout'
import Button from '../../components/ui/Button'

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  'no-show': 'bg-slate-100 text-slate-600 border-slate-200',
}

const HISTORY_FILTERS = ['all', 'completed', 'cancelled', 'no-show']

// Determines if an appointment belongs in Upcoming or History
function classifyAppointment(appt) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const apptDate = new Date(appt.appointmentDate)
  apptDate.setHours(0, 0, 0, 0)
  const isActiveStatus = ['pending', 'confirmed'].includes(appt.status)
  return isActiveStatus && apptDate >= today ? 'upcoming' : 'past'
}

function getDayLabel(apptDate) {
  const d = new Date(apptDate)
  if (isToday(d)) return { label: 'Today', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' }
  if (isTomorrow(d)) return { label: 'Tomorrow', color: 'text-blue-600 bg-blue-50 border-blue-200' }
  const days = differenceInDays(d, new Date())
  if (days > 0 && days <= 7) return { label: `In ${days}d`, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' }
  return null
}

export default function MyAppointments() {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('upcoming')
  const [historyFilter, setHistoryFilter] = useState('all')
  const [cancelling, setCancelling] = useState(null)
  const [selectedClinic, setSelectedClinic] = useState(null)
  const [selectedAppt, setSelectedAppt] = useState(null)
  const [ratingAppt, setRatingAppt] = useState(null)

  const fetchAll = () => {
    setLoading(true)
    appointmentAPI.getAll({})
      .then(r => setAppointments(r.data.appointments || []))
      .catch(() => setAppointments([])
      )
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment? This cannot be undone.')) return
    setCancelling(id)
    try {
      await appointmentAPI.cancel(id, 'Patient cancelled via portal')
      fetchAll()
    } catch {
      alert('Failed to cancel. Please try again.')
    } finally {
      setCancelling(null)
    }
  }

  const upcoming = appointments
    .filter(a => classifyAppointment(a) === 'upcoming')
    .sort((a, b) => {
      const dateDiff = new Date(a.appointmentDate) - new Date(b.appointmentDate);
      if (dateDiff !== 0) return dateDiff;

      const parseTime = (str) => {
        if (!str) return 0;
        const match = str.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return 0;
        let [, hrs, mins, ampm] = match;
        hrs = parseInt(hrs);
        mins = parseInt(mins);
        if (ampm.toUpperCase() === 'PM' && hrs < 12) hrs += 12;
        if (ampm.toUpperCase() === 'AM' && hrs === 12) hrs = 0;
        return hrs * 60 + mins;
      };

      return parseTime(a.timeSlot) - parseTime(b.timeSlot);
    })

  const past = appointments
    .filter(a => classifyAppointment(a) === 'past')
    .filter(a => historyFilter === 'all' || a.status === historyFilter)
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))

  const shown = tab === 'upcoming' ? upcoming : past

  return (
    <DashboardLayout isPatient>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-8 pb-20"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-medigo-navy tracking-tight">My Appointments</h1>
            <p className="text-slate-500 font-medium">Track your upcoming sessions and view your consultation history.</p>
          </div>
          <Button onClick={() => navigate('/search')} className="h-12 px-6 shadow-lg shadow-blue-500/10">
            <Plus size={17} className="mr-2" /> Book New Session
          </Button>
        </div>

        {/* Summary Stats */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Upcoming', val: upcoming.length, icon: CalendarClock, color: 'text-medigo-blue bg-blue-50 border-blue-100' },
              { label: 'Confirmed', val: appointments.filter(a => a.status === 'confirmed').length, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
              { label: 'Pending', val: appointments.filter(a => a.status === 'pending').length, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-100' },
              { label: 'Completed', val: appointments.filter(a => a.status === 'completed').length, icon: Stethoscope, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
            ].map((s, i) => (
              <motion.div key={i} whileHover={{ y: -3 }} className="bg-white p-5 rounded-[1.75rem] border border-slate-100 shadow-sm flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-sm shrink-0 ${s.color}`}>
                  <s.icon size={20} />
                </div>
                <div>
                  <p className="text-2xl font-black text-medigo-navy leading-none tracking-tight">{s.val}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm w-fit">
          <button
            onClick={() => setTab('upcoming')}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-black transition-all duration-200 ${tab === 'upcoming'
                ? 'bg-medigo-navy text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
          >
            <CalendarClock size={16} />
            Upcoming
            {upcoming.length > 0 && (
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${tab === 'upcoming' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {upcoming.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('past')}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-black transition-all duration-200 ${tab === 'past'
                ? 'bg-medigo-navy text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
          >
            <History size={16} />
            History
            {past.length > 0 && (
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${tab === 'past' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {appointments.filter(a => classifyAppointment(a) === 'past').length}
              </span>
            )}
          </button>
        </div>

        {/* History status sub-filter */}
        <AnimatePresence>
          {tab === 'past' && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: -16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 pt-2">
                {HISTORY_FILTERS.map(f => (
                  <button
                    key={f}
                    onClick={() => setHistoryFilter(f)}
                    className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest border transition-all ${historyFilter === f
                        ? 'bg-medigo-navy text-white border-medigo-navy shadow-md'
                        : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600'
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Appointment List */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-36 bg-white rounded-[2.5rem] border border-slate-100 animate-pulse" />
                ))}
              </div>
            ) : shown.length === 0 ? (
              <EmptyState tab={tab} historyFilter={historyFilter} navigate={navigate} />
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {shown.map((appt, i) => (
                    <AppointmentCard
                      key={appt._id}
                      appt={appt}
                      index={i}
                      isPast={tab === 'past'}
                      onCancel={() => handleCancel(appt._id)}
                      onShowClinic={setSelectedClinic}
                      onViewDetail={() => setSelectedAppt(appt)}
                      cancelling={cancelling === appt._id}
                      onRateClick={() => setRatingAppt(appt)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer tip */}
        {!loading && shown.length > 0 && tab === 'upcoming' && (
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2.5 px-6 py-3 bg-blue-50/60 border border-blue-100 rounded-2xl text-[11px] font-bold text-slate-500">
              <Info size={13} className="text-medigo-blue" />
              For rescheduling, contact the clinic at least 24 hours in advance.
            </div>
          </div>
        )}

        <AnimatePresence>
          {selectedClinic && (
            <ClinicDetailsModal appt={selectedClinic} onClose={() => setSelectedClinic(null)} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedAppt && (
            <AppointmentDetailModal
              appt={selectedAppt}
              onClose={() => setSelectedAppt(null)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {ratingAppt && (
            <RatingModal appt={ratingAppt} onClose={() => setRatingAppt(null)} />
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  )
}

// ─── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ tab, historyFilter, navigate }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-24 text-center space-y-6 bg-white rounded-[3rem] border-2 border-dashed border-slate-100"
    >
      <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto">
        {tab === 'upcoming' ? <CalendarClock size={40} /> : <History size={40} />}
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-black text-medigo-navy tracking-tight">
          {tab === 'upcoming' ? 'No upcoming appointments' : historyFilter !== 'all' ? `No ${historyFilter} appointments` : 'No appointment history'}
        </h3>
        <p className="text-slate-400 font-medium max-w-sm mx-auto text-sm">
          {tab === 'upcoming'
            ? 'You have no scheduled sessions. Book a consultation with a specialist to get started.'
            : 'Your past appointments and completed consultations will appear here.'}
        </p>
      </div>
      {tab === 'upcoming' && (
        <Button variant="outline" className="h-12 px-8 border-slate-200" onClick={() => navigate('/search')}>
          Browse Doctors <ArrowRight size={16} className="ml-2" />
        </Button>
      )}
    </motion.div>
  )
}

// ─── Appointment Card ──────────────────────────────────────────────────────────
function AppointmentCard({ appt, index, isPast, onCancel, onShowClinic, onViewDetail, cancelling, onRateClick }) {
  const navigate = useNavigate()
  const apptDate = new Date(appt.appointmentDate)
  const dayBadge = !isPast ? getDayLabel(appt.appointmentDate) : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: index * 0.04 }}
      onClick={onViewDetail}
      className={`bg-white rounded-[2.5rem] border shadow-sm group transition-all relative overflow-hidden cursor-pointer
        ${isPast
          ? 'border-slate-100 hover:border-slate-200 hover:shadow-md opacity-90 hover:opacity-100'
          : 'border-slate-100 hover:border-blue-100 hover:shadow-premium'
        }`}
    >
      {/* Upcoming left accent stripe */}
      {!isPast && (
        <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-full ${appt.status === 'confirmed' ? 'bg-medigo-blue' : 'bg-amber-400'
          }`} />
      )}

      <div className="flex flex-col lg:flex-row lg:items-center gap-6 p-6 sm:p-8">

        {/* Date Block */}
        <div className="shrink-0 flex flex-row lg:flex-col items-center gap-4 lg:gap-0">
          <div className={`w-20 rounded-3xl flex flex-col items-center justify-center p-3 transition-all duration-300
            ${isPast
              ? 'bg-slate-50 border border-slate-100'
              : 'bg-slate-50 border border-slate-100 group-hover:bg-medigo-navy group-hover:border-medigo-navy group-hover:shadow-xl'
            }`}
          >
            <span className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${isPast ? 'text-slate-400' : 'text-slate-400 group-hover:text-white/50'}`}>
              {format(apptDate, 'EEE')}
            </span>
            <span className={`text-3xl font-black tracking-tighter leading-none ${isPast ? 'text-slate-500' : 'text-medigo-navy group-hover:text-white'}`}>
              {format(apptDate, 'd')}
            </span>
            <span className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${isPast ? 'text-slate-400' : 'text-slate-400 group-hover:text-white/60'}`}>
              {format(apptDate, 'MMM yy')}
            </span>
          </div>

          {/* Day badge (Today / Tomorrow / In Xd) */}
          {dayBadge && (
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${dayBadge.color}`}>
              {dayBadge.label}
            </span>
          )}
        </div>

        {/* Main Info */}
        <div className="flex-1 space-y-3 min-w-0">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <h3 className={`text-lg font-extrabold tracking-tight leading-none ${isPast ? 'text-slate-600' : 'text-medigo-navy group-hover:text-medigo-blue transition-colors'}`}>
                {appt.doctorName}
              </h3>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_STYLES[appt.status] || STATUS_STYLES.pending}`}>
                {appt.status === 'pending' ? 'Awaiting Payment' : appt.status}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px] font-semibold text-slate-400">
              {(appt.hospital || appt.specialty) && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-slate-300" />
                  {appt.hospital || appt.specialty}
                </span>
              )}
              {appt.timeSlot && (
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-slate-300" />
                  {appt.timeSlot}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                {appt.type === 'telemedicine'
                  ? <><Video size={13} className="text-medigo-blue/60" /> Video Consultation</>
                  : <><MapPin size={13} className="text-amber-400/70" /> In-person Visit</>
                }
              </span>
            </div>
          </div>

          {/* Session queue position — shown when data is available */}
          {appt.patientNumber && appt.maxPatients && (
            <div className="flex items-center gap-3">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-black ${appt.status === 'confirmed'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                <Users size={12} />
                Patient #{appt.patientNumber} of {appt.maxPatients}
              </div>
              <div className="flex-1 max-w-[120px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${appt.status === 'confirmed' ? 'bg-medigo-blue' : 'bg-slate-300'}`}
                  style={{ width: `${Math.min(100, (appt.patientNumber / appt.maxPatients) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                {appt.maxPatients - appt.patientNumber} slot{appt.maxPatients - appt.patientNumber !== 1 ? 's' : ''} after you
              </span>
            </div>
          )}

          {appt.reason && (
            <p className="text-[12px] text-slate-400 italic font-medium bg-slate-50 border border-dashed border-slate-200 rounded-xl px-4 py-2 truncate max-w-md">
              "{appt.reason}"
            </p>
          )}

          {appt.cancellationReason && (
            <div className="flex items-center gap-2 text-[11px] font-bold text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-xl w-fit">
              <XCircle size={13} /> {appt.cancellationReason}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="shrink-0 lg:border-l lg:border-slate-100 lg:pl-7 flex flex-row lg:flex-col items-center gap-2.5 justify-end lg:justify-center lg:min-w-[160px]" onClick={e => e.stopPropagation()}>
          {!isPast && (
            <div className="flex flex-col gap-2.5 w-full">
              {/* Primary Action */}
              {appt.status === 'confirmed' ? (
                appt.type === 'telemedicine' ? (
                  <Button
                    onClick={() => navigate(`/telemedicine/lobby/${appt._id}`)}
                    className="w-full h-11 text-sm shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                  >
                    <Video size={15} /> Join Now
                  </Button>
                ) : (
                  <Button
                    onClick={() => onShowClinic(appt)}
                    className="w-full h-11 text-sm bg-medigo-navy shadow-lg shadow-slate-500/10 flex items-center justify-center gap-2"
                  >
                    <MapPin size={15} /> Clinic Info
                  </Button>
                )
              ) : (
                appt.status === 'pending' && ['unpaid', 'processing'].includes(appt.paymentStatus) && (
                  <Button
                    onClick={() => navigate(`/payment/${appt._id}`)}
                    className="w-full h-11 text-sm bg-medigo-blue shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                  >
                    <CreditCard size={15} /> Pay Now
                  </Button>
                )
              )}

              {/* Secondary Actions */}
              {['pending', 'confirmed'].includes(appt.status) && (
                <div className="flex flex-row lg:flex-col gap-2 w-full">
                  <button
                    onClick={() => navigate(`/appointments/${appt._id}/reschedule`)}
                    className="flex-1 lg:w-full h-10 flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black text-slate-500 uppercase tracking-widest hover:bg-white hover:border-medigo-blue hover:text-medigo-blue transition-all"
                  >
                    <RefreshCw size={13} /> Reschedule
                  </button>
                  <button
                    onClick={onCancel}
                    disabled={cancelling}
                    className="flex-1 lg:w-full h-10 flex items-center justify-center gap-1.5 border border-red-100 text-red-400 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-40"
                  >
                    {cancelling ? <RefreshCw size={13} className="animate-spin" /> : <XCircle size={13} />}
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {isPast && appt.status === 'completed' && (
            <div className="flex items-center gap-4">
              <button
                onClick={(e) => { e.stopPropagation(); onRateClick && onRateClick() }}
                className="flex items-center gap-1.5 text-[11px] font-black text-amber-500 uppercase tracking-widest hover:bg-amber-50 px-3 py-1.5 rounded-xl transition-colors"
              >
                <Star size={14} fill="currentColor" /> Rate Experience
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigate('/search') }}
                className="flex items-center gap-1.5 text-[11px] font-black text-medigo-blue uppercase tracking-widest hover:underline whitespace-nowrap"
              >
                Book Follow-up <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Clinic Details Modal ──────────────────────────────────────────────────────
function ClinicDetailsModal({ appt, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        className="bg-white max-w-lg w-full rounded-[3rem] overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-medigo-navy p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-medigo-blue/20 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mb-3">Clinic Information</p>
          <h2 className="text-3xl font-black tracking-tighter leading-none">{appt.hospital}</h2>
          <div className="mt-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
              <MapPin size={22} className="text-medigo-mint" />
            </div>
            <div>
              <p className="text-xs font-bold opacity-60">Physical Address</p>
              <p className="font-bold">Main Wing, Level 04, Tower B</p>
            </div>
          </div>
        </div>

        <div className="p-10 space-y-8">
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Preparation Checklist</h3>
            {[
              { icon: Clock, text: 'Arrive 15 minutes before your scheduled slot.' },
              { icon: AlertCircle, text: 'Bring your NIC and any previous medical records.' },
              { icon: CheckCircle2, text: 'Face masks are required on hospital premises.' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <item.icon size={16} className="text-medigo-blue shrink-0" />
                <p className="text-sm font-semibold text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button onClick={onClose} className="flex-1 h-13 bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-none">
              Close
            </Button>
            <Button className="flex-1 h-13">
              Get Directions
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Appointment Detail Modal ──────────────────────────────────────────────────
function AppointmentDetailModal({ appt, onClose }) {
  const navigate = useNavigate()
  const apptDate = appt.appointmentDate ? new Date(appt.appointmentDate) : null

  const statusColors = {
    confirmed: 'bg-blue-100 text-blue-700',
    pending: 'bg-amber-100 text-amber-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
    'no-show': 'bg-slate-100 text-slate-600',
  }

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
                {appt.type === 'telemedicine'
                  ? <Video size={22} className="text-cyan-300" />
                  : <MapPin size={22} className="text-emerald-300" />
                }
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight leading-tight">{appt.doctorName || 'Unknown Doctor'}</h2>
                <p className="text-sm opacity-60 font-medium">{appt.specialty || 'General Physician'}</p>
              </div>
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[appt.status] || statusColors.pending}`}>
              {appt.status === 'pending' ? 'Awaiting Payment' : appt.status}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ApptDetailRow icon={Calendar} label="Date"
              value={apptDate ? format(apptDate, 'EEE, dd MMM yyyy') : '—'} />
            <ApptDetailRow icon={Clock} label="Time" value={appt.timeSlot || '—'} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ApptDetailRow
              icon={appt.type === 'telemedicine' ? Video : MapPin}
              label="Consultation Type"
              value={appt.type === 'telemedicine' ? 'Video Call' : 'In-person'}
            />
            <ApptDetailRow
              icon={CreditCard}
              label="Fee"
              value={appt.fee ? `LKR ${appt.fee.toLocaleString()}` : '—'}
            />
          </div>

          {appt.hospital && (
            <ApptDetailRow icon={Stethoscope} label="Hospital / Clinic" value={appt.hospital} full />
          )}

          <ApptDetailRow
            icon={Hash}
            label="Appointment ID"
            value={`APT_${appt._id?.slice(-6).toUpperCase()}`}
            full
          />

          {appt.patientNumber && appt.maxPatients && (
            <ApptDetailRow
              icon={Users}
              label="Queue Position"
              value={`Patient #${appt.patientNumber} of ${appt.maxPatients}`}
              full
            />
          )}

          {appt.reason && (
            <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1.5">
                <FileText size={11} /> Reason for Visit
              </p>
              <p className="text-sm font-medium text-slate-600 italic">"{appt.reason}"</p>
            </div>
          )}

          {appt.meetingLink && (
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-medigo-blue mb-1">Meeting Link</p>
              <a href={appt.meetingLink} target="_blank" rel="noopener noreferrer"
                className="text-sm font-bold text-medigo-blue hover:underline break-all">
                {appt.meetingLink}
              </a>
            </div>
          )}

          {appt.cancellationReason && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Reason for Cancellation</p>
                <p className="text-sm font-medium text-red-600">{appt.cancellationReason}</p>
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex gap-3 pt-2">
            <Button onClick={onClose} variant="outline" className="flex-1 h-12 rounded-2xl border-slate-200">
              Close
            </Button>
            {appt.type === 'telemedicine' && appt.status === 'confirmed' && (
              <Button
                onClick={() => { onClose(); navigate(`/telemedicine/lobby/${appt._id}`) }}
                className="flex-1 h-12 rounded-2xl bg-medigo-blue shadow-lg shadow-blue-500/20"
              >
                <Video size={15} className="mr-2" /> Join Session
              </Button>
            )}
            {['pending', 'confirmed'].includes(appt.status) && (
              <Button
                onClick={() => { onClose(); navigate(`/appointments/${appt._id}/reschedule`) }}
                variant="outline"
                className="flex-1 h-12 rounded-2xl border-slate-200"
              >
                <RefreshCw size={14} className="mr-2" /> Reschedule
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ApptDetailRow({ icon: Icon, label, value, full }) {
  return (
    <div className={`p-4 bg-slate-50 border border-slate-100 rounded-2xl ${full ? 'col-span-2' : ''}`}>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1.5">
        <Icon size={11} /> {label}
      </p>
      <p className="text-sm font-bold text-medigo-navy">{value}</p>
    </div>
  )
}

// ─── Rating Modal ──────────────────────────────────────────────────────────────
function RatingModal({ appt, onClose }) {
  const [ratingVal, setRatingVal] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [justRated, setJustRated] = useState(false)

  const handleRate = (val) => {
    setRatingVal(val)
    setJustRated(true)
    setTimeout(() => {
      setJustRated(false)
      onClose()
    }, 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-white max-w-md w-full rounded-[3rem] overflow-hidden shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors z-10">
          <X size={16} />
        </button>

        <div className="p-10 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-slate-50 flex items-center justify-center">
            <Star size={32} className="text-amber-400" fill="currentColor" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-medigo-navy tracking-tight mb-2">Rate your Visit</h2>
            <p className="text-slate-500 text-sm font-medium">How was your medical consultation with {appt.doctorName}?</p>
          </div>

          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  disabled={justRated || ratingVal > 0}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => handleRate(star)}
                  className="transition-transform hover:scale-110 disabled:hover:scale-100"
                >
                  <Star
                    size={40}
                    fill={(hoveredStar || ratingVal) >= star ? "#f59e0b" : "transparent"}
                    className={`${(hoveredStar || ratingVal) >= star ? 'text-amber-400 drop-shadow-lg' : 'text-slate-200'} transition-all`}
                  />
                </button>
              ))}
            </div>
            <AnimatePresence>
              {justRated && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-black text-emerald-600 uppercase tracking-widest mt-6"
                >
                  Thank you for submitting your feedback!
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
