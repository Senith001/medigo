import { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { format, addDays, startOfToday } from 'date-fns'
import { appointmentAPI } from '../../services/api'
import { Alert, Spinner, PageLoader } from '../../components/ui/index.jsx'

const TIME_SLOTS = [
  '08:00 - 08:30','08:30 - 09:00','09:00 - 09:30','09:30 - 10:00',
  '10:00 - 10:30','10:30 - 11:00','11:00 - 11:30','11:30 - 12:00',
  '14:00 - 14:30','14:30 - 15:00','15:00 - 15:30','15:30 - 16:00',
  '16:00 - 16:30','16:30 - 17:00',
]
const getDates = () => Array.from({ length: 14 }, (_, i) => addDays(startOfToday(), i + 1))

function DatePicker({ selectedDate, onSelect }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {getDates().map(date => {
        const active = selectedDate?.toDateString() === date.toDateString()
        return (
          <button key={date.toISOString()} type="button" onClick={() => onSelect(date)}
            className={`flex flex-col items-center py-2.5 px-3 rounded-xl min-w-[52px] border-2 transition-all font-body ${
              active ? 'bg-teal border-teal text-white' : 'bg-white border-gray-200 hover:border-teal/50 text-gray-700'}`}>
            <span className={`text-[10px] font-bold uppercase ${active ? 'text-white/70' : 'text-gray-400'}`}>{format(date,'EEE')}</span>
            <span className={`font-display font-black text-xl leading-tight ${active ? 'text-white' : 'text-gray-800'}`}>{format(date,'d')}</span>
            <span className={`text-[10px] ${active ? 'text-white/60' : 'text-gray-400'}`}>{format(date,'MMM')}</span>
          </button>
        )
      })}
    </div>
  )
}

function SlotPicker({ selectedSlot, bookedSlots, onSelect, loading }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="label mb-0">Select Time Slot</span>
        {loading && <Spinner size="sm"/>}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {TIME_SLOTS.map(slot => {
          const booked = bookedSlots.includes(slot), active = selectedSlot === slot
          return (
            <button key={slot} type="button" disabled={booked} onClick={() => !booked && onSelect(slot)}
              className={`py-2.5 px-3 rounded-lg text-sm font-semibold border-2 transition-all font-body text-center ${
                active  ? 'bg-teal border-teal text-white' :
                booked  ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' :
                          'bg-white border-gray-200 hover:border-teal/50 text-gray-700'}`}>
              {slot}
              {booked && <div className="text-[10px] text-gray-400">Booked</div>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function BookAppointment() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const doctor = state?.doctor

  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [bookedSlots, setBookedSlots] = useState([])
  const [type, setType] = useState('telemedicine')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    if (!selectedDate || !doctor) return
    setSlotsLoading(true); setSelectedSlot(null)
    appointmentAPI.getAvailability(doctor._id, format(selectedDate,'yyyy-MM-dd'))
      .then(r => setBookedSlots(r.data.bookedSlots || []))
      .catch(() => setBookedSlots([]))
      .finally(() => setSlotsLoading(false))
  }, [selectedDate, doctor?._id])

  const handleSubmit = async () => {
    if (!selectedDate || !selectedSlot) { setError('Please select a date and time slot.'); return }
    setError(''); setLoading(true)
    try {
      const res = await appointmentAPI.book({
        doctorId:    doctor._id,
        doctorName:  doctor.fullName || doctor.name,
        doctorEmail: doctor.email || 'doctor@hospital.lk',
        specialty:   doctor.specialty,
        hospital:    doctor.hospital || null,
        appointmentDate: format(selectedDate,'yyyy-MM-dd'),
        timeSlot: selectedSlot, type, reason,
        fee: doctor.fee || 0,
      })
      setSuccess(res.data)
      if (res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl
      } else {
        setTimeout(() => navigate('/patient/appointments'), 2500)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book. Please try again.')
    } finally { setLoading(false) }
  }

  if (!doctor) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 mb-4">No doctor selected.</p>
        <button className="btn-primary" onClick={() => navigate('/search')}>Find a Doctor</button>
      </div>
    </div>
  )

  if (success && !success.checkoutUrl) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="card p-10 text-center max-w-md">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-5">✓</div>
        <h2 className="font-display font-bold text-2xl mb-2">Appointment Booked!</h2>
        <p className="text-gray-500 mb-1"><strong>{doctor.fullName}</strong></p>
        <p className="text-gray-500 mb-1">{selectedDate && format(selectedDate,'MMMM d, yyyy')} · <strong>{selectedSlot}</strong></p>
        <p className="text-xs text-gray-400 mb-6">📧 Confirmation email sent. Redirecting…</p>
        <button className="btn-primary w-full justify-center" onClick={() => navigate('/patient/appointments')}>View Appointments</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="card p-4 mb-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-lighter rounded-xl flex items-center justify-center font-display font-bold text-teal text-base flex-shrink-0">
            {(doctor.fullName||'').replace('Dr. ','').split(' ').map(n=>n[0]).join('').slice(0,2)}
          </div>
          <div className="flex-1">
            <div className="font-bold text-gray-900">{doctor.fullName}</div>
            <div className="text-sm text-gray-400">{doctor.specialty}{doctor.hospital ? ` · ${doctor.hospital}` : ''}{doctor.fee > 0 ? ` · Rs. ${doctor.fee.toLocaleString()}` : ''}</div>
          </div>
          <button className="btn-ghost btn-sm" onClick={() => navigate(-1)}>← Back</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-5">
              <label className="label">Appointment Type</label>
              <div className="flex gap-3 mt-2">
                {[{v:'telemedicine',i:'📹',l:'Video Consultation'},{v:'in-person',i:'🏥',l:'In-Person'}].map(t => (
                  <button key={t.v} type="button" onClick={() => setType(t.v)}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 text-center transition-all ${type===t.v ? 'border-teal bg-teal-lighter text-teal' : 'border-gray-200 bg-white text-gray-600 hover:border-teal/40'}`}>
                    <div className="text-2xl mb-1">{t.i}</div>
                    <div className="text-sm font-bold">{t.l}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="card p-5">
              <label className="label mb-3">Select Date</label>
              <DatePicker selectedDate={selectedDate} onSelect={setSelectedDate}/>
            </div>
            {selectedDate && (
              <div className="card p-5">
                <SlotPicker selectedSlot={selectedSlot} bookedSlots={bookedSlots} onSelect={setSelectedSlot} loading={slotsLoading}/>
              </div>
            )}
            <div className="card p-5">
              <label className="label">Reason <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
              <textarea className="input mt-2 resize-none" rows={3} placeholder="Describe your symptoms…" value={reason} onChange={e => setReason(e.target.value)}/>
            </div>
            {error && <Alert type="error" message={error}/>}
            <button className="btn-primary w-full justify-center py-3.5 text-base"
              disabled={loading || !selectedDate || !selectedSlot} onClick={handleSubmit}>
              {loading ? <><Spinner size="sm"/> Booking…</> :
               doctor.fee > 0 ? `Confirm & Pay Rs. ${doctor.fee.toLocaleString()}` : 'Confirm Appointment'}
            </button>
          </div>

          <div className="lg:col-span-1">
            {selectedDate && selectedSlot && (
              <div className="card p-5 bg-teal-lighter border-teal/30 sticky top-20">
                <h3 className="font-bold text-teal mb-4 text-sm uppercase tracking-wider">Booking Summary</h3>
                {[
                  { l:'Doctor', v: doctor.fullName },
                  { l:'Date',   v: format(selectedDate,'EEE, MMM d yyyy') },
                  { l:'Time',   v: selectedSlot },
                  { l:'Type',   v: type === 'telemedicine' ? '📹 Video' : '🏥 In-Person' },
                  { l:'Fee',    v: doctor.fee > 0 ? `Rs. ${doctor.fee.toLocaleString()}` : 'Free' },
                ].map(r => (
                  <div key={r.l} className="flex justify-between py-2 border-b border-teal/15 text-sm last:border-0">
                    <span className="text-gray-500">{r.l}</span>
                    <strong className="text-gray-800 text-right max-w-[60%]">{r.v}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function RescheduleAppointment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [appt, setAppt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [bookedSlots, setBookedSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    appointmentAPI.getById(id)
      .then(r => setAppt(r.data))
      .catch(() => setError('Could not load appointment details.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!selectedDate || !appt) return
    setSlotsLoading(true); setSelectedSlot(null)
    appointmentAPI.getAvailability(appt.doctorId, format(selectedDate,'yyyy-MM-dd'))
      .then(r => setBookedSlots(r.data.bookedSlots || []))
      .catch(() => setBookedSlots([]))
      .finally(() => setSlotsLoading(false))
  }, [selectedDate, appt?.doctorId])

  const handleSubmit = async () => {
    if (!selectedDate || !selectedSlot) { setError('Please select a new date and time.'); return }
    setError(''); setSubmitting(true)
    try {
      await appointmentAPI.modify(id, { appointmentDate: format(selectedDate,'yyyy-MM-dd'), timeSlot: selectedSlot })
      setSuccess(true); setTimeout(() => navigate('/patient/appointments'), 2000)
    } catch (err) { setError(err.response?.data?.message || 'Failed to reschedule.') }
    finally { setSubmitting(false) }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg"/></div>
  if (error && !appt) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-400">{error}</p></div>

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="card p-10 text-center max-w-md">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-5">✓</div>
        <h2 className="font-display font-bold text-2xl mb-3">Rescheduled!</h2>
        <p className="text-gray-500 mb-6">{selectedDate && format(selectedDate,'MMMM d, yyyy')} at <strong>{selectedSlot}</strong></p>
        <button className="btn-primary w-full justify-center" onClick={() => navigate('/patient/appointments')}>Back to Appointments</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="card p-4 mb-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📅</div>
          <div className="flex-1">
            <div className="font-bold text-gray-900 text-sm">{appt?.doctorName}</div>
            <div className="text-xs text-gray-400 mt-0.5">
              Current: {appt && format(new Date(appt.appointmentDate),'EEE MMM d, yyyy')} · {appt?.timeSlot}
            </div>
          </div>
          <button className="btn-ghost btn-sm" onClick={() => navigate(-1)}>← Back</button>
        </div>
        <div className="space-y-4">
          <div className="card p-5">
            <label className="label mb-3">New Date</label>
            <DatePicker selectedDate={selectedDate} onSelect={setSelectedDate}/>
          </div>
          {selectedDate && (
            <div className="card p-5">
              <SlotPicker selectedSlot={selectedSlot} bookedSlots={bookedSlots} onSelect={setSelectedSlot} loading={slotsLoading}/>
            </div>
          )}
          {error && <Alert type="error" message={error}/>}
          <button className="btn-primary w-full justify-center py-3" disabled={submitting || !selectedDate || !selectedSlot} onClick={handleSubmit}>
            {submitting ? <><Spinner size="sm"/> Saving…</> : 'Confirm Reschedule'}
          </button>
        </div>
      </div>
    </div>
  )
}
