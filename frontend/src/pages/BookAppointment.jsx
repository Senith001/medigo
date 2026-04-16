import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { format, addDays, startOfToday } from 'date-fns'
import { appointmentAPI } from '../services/api'

const TIME_SLOTS = [
  '08:00 - 08:30','08:30 - 09:00','09:00 - 09:30','09:30 - 10:00',
  '10:00 - 10:30','10:30 - 11:00','11:00 - 11:30','11:30 - 12:00',
  '14:00 - 14:30','14:30 - 15:00','15:00 - 15:30','15:30 - 16:00',
  '16:00 - 16:30','16:30 - 17:00',
]
const getDates = () => Array.from({ length: 14 }, (_, i) => addDays(startOfToday(), i + 1))

export function BookAppointment() {
  const { state }  = useLocation()
  const navigate   = useNavigate()
  const doctor     = state?.doctor || null
  const [selectedDate, setDate] = useState(null)
  const [selectedSlot, setSlot] = useState(null)
  const [bookedSlots, setBooked] = useState([])
  const [type, setType]   = useState('telemedicine')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [sloading, setSloading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const dates = getDates()

  useEffect(() => {
    if (!selectedDate || !doctor) return
    setSloading(true); setSlot(null)
    appointmentAPI.getAvailability(doctor._id, format(selectedDate, 'yyyy-MM-dd'))
      .then(r => setBooked(r.data.bookedSlots || []))
      .catch(() => setBooked([]))
      .finally(() => setSloading(false))
  }, [selectedDate, doctor?._id])

  const handleSubmit = async () => {
    if (!selectedDate || !selectedSlot) { setError('Please select date and time.'); return }
    setError(''); setLoading(true)
    try {
      await appointmentAPI.book({
        doctorId:        doctor._id,
        appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
        timeSlot:        selectedSlot,
        type, reason,
      })
      setSuccess(true)
      setTimeout(() => navigate('/appointments'), 2500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book. Try again.')
    } finally { setLoading(false) }
  }

  if (!doctor) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="card p-10 text-center max-w-sm w-full">
        <div className="text-4xl mb-4 opacity-30">👨‍⚕️</div>
        <p className="text-gray-500 mb-5">No doctor selected.</p>
        <button className="btn btn-teal w-full justify-center" onClick={() => navigate('/search')}>
          Find a Doctor →
        </button>
      </div>
    </div>
  )

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="card p-10 text-center max-w-sm w-full animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-green-100 text-green-500 text-3xl flex items-center justify-center mx-auto mb-5">✓</div>
        <h2 className="font-display font-black text-gray-900 text-2xl mb-2">Appointment Booked!</h2>
        <p className="text-gray-500 text-sm mb-1">
          <strong>{doctor.fullName}</strong> · {selectedDate && format(selectedDate,'MMM d, yyyy')} · <strong>{selectedSlot}</strong>
        </p>
        <p className="text-gray-400 text-xs mb-6">📧 Confirmation email sent. Redirecting…</p>
        <button className="btn btn-teal w-full justify-center" onClick={() => navigate('/appointments')}>
          View Appointments
        </button>
      </div>
    </div>
  )

  const initials = (doctor.fullName || '').replace('Dr. ','').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-700 to-navy-800 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <button onClick={() => navigate(-1)} className="text-white/60 hover:text-white text-sm transition-colors mb-3">← Back</button>
          <h1 className="font-display text-2xl font-black text-white">Book Appointment</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Doctor card */}
        <div className="card p-5 mb-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 font-display font-black text-base flex items-center justify-center flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <h2 className="font-display font-bold text-gray-900 text-lg leading-tight">{doctor.fullName}</h2>
            <p className="text-teal-600 text-sm">{doctor.specialty}{doctor.hospital ? ` · ${doctor.hospital}` : ''}</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Consultation fee</div>
            <div className="font-display font-black text-gray-900 text-xl">Rs. {(doctor.fee || 0).toLocaleString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: form */}
          <div className="lg:col-span-2 space-y-4">

            {/* Type selector */}
            <div className="card p-5">
              <p className="form-label mb-3">Appointment Type</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { v:'telemedicine', i:'📹', l:'Video Consultation' },
                  { v:'in-person',    i:'🏥', l:'In-Person Visit' },
                ].map(t => (
                  <button key={t.v} onClick={() => setType(t.v)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      type === t.v ? 'border-teal-400 bg-teal-50 text-teal-700' : 'border-gray-200 bg-white text-gray-600 hover:border-teal-200'
                    }`}>
                    <div className="text-2xl mb-1">{t.i}</div>
                    <div className="text-sm font-bold">{t.l}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date picker */}
            <div className="card p-5">
              <p className="form-label mb-3">Select Date</p>
              <div className="flex flex-wrap gap-2">
                {dates.map(d => {
                  const active = selectedDate?.toDateString() === d.toDateString()
                  return (
                    <button key={d.toISOString()} onClick={() => setDate(d)}
                      className={`flex flex-col items-center px-3 py-2 rounded-xl border transition-all min-w-[50px] ${
                        active ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-teal-300'
                      }`}>
                      <span className="text-[10px] font-bold uppercase opacity-70">{format(d,'EEE')}</span>
                      <span className="text-xl font-black font-display leading-tight">{format(d,'d')}</span>
                      <span className="text-[10px] opacity-70">{format(d,'MMM')}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div className="card p-5 animate-fade-up">
                <p className="form-label mb-3 flex items-center gap-2">
                  Select Time Slot
                  {sloading && <span className="w-3 h-3 rounded-full border-2 border-teal-100 border-t-teal-500 animate-spin" />}
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {TIME_SLOTS.map(slot => {
                    const booked = bookedSlots.includes(slot), active = selectedSlot === slot
                    return (
                      <button key={slot} disabled={booked} onClick={() => setSlot(slot)}
                        className={`py-2.5 px-1 rounded-xl text-xs font-semibold border text-center transition-all ${
                          active  ? 'bg-teal-500 border-teal-500 text-white' :
                          booked  ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' :
                                    'bg-white border-gray-200 text-gray-700 hover:border-teal-300 hover:bg-teal-50'
                        }`}>
                        {slot}
                        {booked && <div className="text-[9px] text-gray-300">Booked</div>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Reason */}
            <div className="card p-5">
              <label className="form-label">
                Reason for Visit <span className="text-gray-400 font-normal normal-case text-xs">(optional)</span>
              </label>
              <textarea className="form-input mt-1.5 resize-none" rows={3}
                placeholder="Describe your symptoms or reason for visit…"
                value={reason} onChange={e => setReason(e.target.value)} />
            </div>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <button onClick={handleSubmit} disabled={loading || !selectedDate || !selectedSlot}
              className="w-full btn btn-teal btn-lg justify-center disabled:opacity-50">
              {loading ? <><span className="spinner" /> Booking…</> : 'Confirm Appointment →'}
            </button>
          </div>

          {/* Right: summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              {selectedDate && selectedSlot ? (
                <div className="card p-5 bg-teal-50 border-teal-200 animate-fade-up">
                  <p className="text-xs font-bold text-teal-700 uppercase tracking-wide mb-3">Booking Summary</p>
                  <div className="space-y-2.5">
                    {[
                      { l:'Doctor',   v: doctor.fullName },
                      { l:'Date',     v: format(selectedDate,'EEE, MMM d yyyy') },
                      { l:'Time',     v: selectedSlot },
                      { l:'Type',     v: type === 'telemedicine' ? '📹 Video' : '🏥 In-Person' },
                      { l:'Fee',      v: `Rs. ${(doctor.fee||0).toLocaleString()}` },
                    ].map(r => (
                      <div key={r.l} className="flex justify-between items-start text-sm py-2 border-b border-teal-100 last:border-0">
                        <span className="text-gray-500">{r.l}</span>
                        <strong className="text-gray-900 text-right max-w-[140px] leading-snug">{r.v}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="card p-6 text-center border-dashed border-2 border-gray-200">
                  <div className="text-3xl mb-2 opacity-20">📋</div>
                  <p className="text-gray-400 text-sm">Select a date and time to see your booking summary</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
