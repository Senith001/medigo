import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, addDays, startOfToday } from 'date-fns'
import { appointmentAPI } from '../services/api'

const TIME_SLOTS = [
  '08:00 - 08:30','08:30 - 09:00','09:00 - 09:30','09:30 - 10:00',
  '10:00 - 10:30','10:30 - 11:00','11:00 - 11:30','11:30 - 12:00',
  '14:00 - 14:30','14:30 - 15:00','15:00 - 15:30','15:30 - 16:00',
  '16:00 - 16:30','16:30 - 17:00',
]

export default function RescheduleAppointment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [apt, setApt]             = useState(null)
  const [selectedDate, setDate]   = useState(null)
  const [selectedSlot, setSlot]   = useState(null)
  const [bookedSlots, setBooked]  = useState([])
  const [reason, setReason]       = useState('')
  const [loading, setLoading]     = useState(true)
  const [sloading, setSloading]   = useState(false)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState(false)
  const dates = Array.from({ length: 14 }, (_, i) => addDays(startOfToday(), i + 1))

  useEffect(() => {
    appointmentAPI.getById(id)
      .then(r => setApt(r.data))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!selectedDate || !apt) return
    setSloading(true); setSlot(null)
    appointmentAPI.getAvailability(apt.doctorId, format(selectedDate, 'yyyy-MM-dd'))
      .then(r => setBooked(r.data.bookedSlots || []))
      .catch(() => setBooked([]))
      .finally(() => setSloading(false))
  }, [selectedDate, apt?.doctorId])

  const handleSave = async () => {
    if (!selectedDate && !selectedSlot) { setError('Select a date or time slot.'); return }
    setError(''); setSaving(true)
    try {
      await appointmentAPI.modify(id, {
        appointmentDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
        timeSlot: selectedSlot || undefined,
        reason,
      })
      setSuccess(true)
      setTimeout(() => navigate('/appointments'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Reschedule failed.')
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-teal-100 border-t-teal-500 animate-spin" />
    </div>
  )

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="card p-10 text-center max-w-sm w-full animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-green-100 text-green-500 text-3xl flex items-center justify-center mx-auto mb-5">✓</div>
        <h2 className="font-display font-black text-gray-900 text-2xl mb-2">Rescheduled!</h2>
        <p className="text-gray-500 text-sm">Your appointment has been updated. Redirecting…</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-navy-700 to-navy-800 py-8">
        <div className="max-w-3xl mx-auto px-6 flex items-center gap-4">
          <button onClick={() => navigate('/appointments')} className="text-white/60 hover:text-white transition-colors">← Back</button>
          <div>
            <h1 className="font-display text-2xl font-black text-white">Reschedule Appointment</h1>
            <p className="text-white/50 text-sm mt-0.5">with {apt?.doctorName}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-5">
        {/* Current details */}
        <div className="card p-5 bg-amber-50 border-amber-200">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2">Current Appointment</p>
          <div className="flex flex-wrap gap-4 text-sm text-amber-800">
            <span>📅 {new Date(apt?.appointmentDate).toDateString()}</span>
            <span>🕐 {apt?.timeSlot}</span>
            <span>{apt?.type === 'telemedicine' ? '📹 Video' : '🏥 In-Person'}</span>
          </div>
        </div>

        {/* Select New Date */}
        <div className="card p-5">
          <p className="form-label mb-3">Select New Date</p>
          <div className="flex gap-2 flex-wrap">
            {dates.map(d => {
              const active = selectedDate?.toDateString() === d.toDateString()
              return (
                <button key={d.toISOString()} onClick={() => setDate(d)}
                  className={`flex flex-col items-center px-3 py-2 rounded-xl border transition-all min-w-[52px] ${
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

        {/* Select Time Slot */}
        {selectedDate && (
          <div className="card p-5 animate-fade-up">
            <p className="form-label mb-3 flex items-center gap-2">
              Select New Time Slot
              {sloading && <span className="w-3 h-3 rounded-full border-2 border-teal-200 border-t-teal-500 animate-spin" />}
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {TIME_SLOTS.map(slot => {
                const booked = bookedSlots.includes(slot), active = selectedSlot === slot
                return (
                  <button key={slot} disabled={booked} onClick={() => setSlot(slot)}
                    className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all text-center ${
                      active  ? 'bg-teal-500 border-teal-500 text-white' :
                      booked  ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' :
                                'bg-white border-gray-200 text-gray-700 hover:border-teal-300'
                    }`}>
                    {slot}
                    {booked && <div className="text-[9px] text-gray-300">Booked</div>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="card p-5">
          <label className="form-label">Notes (optional)</label>
          <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)}
            placeholder="Reason for rescheduling…"
            className="form-input mt-1.5 resize-none" />
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <button onClick={handleSave} disabled={saving || (!selectedDate && !selectedSlot)}
          className="w-full btn btn-teal btn-lg justify-center disabled:opacity-50">
          {saving ? <><span className="spinner" /> Saving…</> : 'Confirm Reschedule →'}
        </button>
      </div>
    </div>
  )
}
