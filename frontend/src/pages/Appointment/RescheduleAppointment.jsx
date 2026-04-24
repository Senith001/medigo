import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, addDays, startOfToday } from 'date-fns'
import { appointmentAPI } from '../../services/api'

const TIME_SLOTS = [
  '08:00 - 08:30', '08:30 - 09:00', '09:00 - 09:30', '09:30 - 10:00',
  '10:00 - 10:30', '10:30 - 11:00', '11:00 - 11:30', '11:30 - 12:00',
  '14:00 - 14:30', '14:30 - 15:00', '15:00 - 15:30', '15:30 - 16:00',
  '16:00 - 16:30', '16:30 - 17:00',
]
const getDates = () => Array.from({ length: 14 }, (_, i) => addDays(startOfToday(), i + 1))
const MOCK = { _id: 'a1', doctorId: 'd1', doctorName: 'Dr. Kamal Perera', specialty: 'Cardiology', hospital: 'Colombo General', appointmentDate: new Date(Date.now() + 86400000 * 3).toISOString(), timeSlot: '09:00 - 09:30', fee: 2500 }

export default function RescheduleAppointment() {
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
  const dates = getDates()

  useEffect(() => {
    appointmentAPI.getById(id).then(r => setAppt(r.data)).catch(() => setAppt(MOCK)).finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!selectedDate || !appt) return
    setSlotsLoading(true); setSelectedSlot(null)
    appointmentAPI.getAvailability(appt.doctorId, format(selectedDate, 'yyyy-MM-dd'))
      .then(r => setBookedSlots(r.data.bookedSlots || [])).catch(() => setBookedSlots([]))
      .finally(() => setSlotsLoading(false))
  }, [selectedDate, appt?.doctorId])

  const handleSubmit = async () => {
    if (!selectedDate || !selectedSlot) { setError('Please select new date and time.'); return }
    setError(''); setSubmitting(true)
    try {
      await appointmentAPI.modify(id, { appointmentDate: format(selectedDate, 'yyyy-MM-dd'), timeSlot: selectedSlot })
      setSuccess(true); setTimeout(() => navigate('/appointments'), 2000)
    } catch (err) { setError(err.response?.data?.message || 'Failed to reschedule.') }
    finally { setSubmitting(false) }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner spinner-dark" style={{ width: 32, height: 32 }} /></div>

  if (success) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 24 }}>
      <div className="card fade-up" style={{ padding: '48px 40px', textAlign: 'center', maxWidth: 400 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--green-100)', color: 'var(--green-500)', fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>✓</div>
        <h2 style={{ marginBottom: 10 }}>Rescheduled!</h2>
        <p style={{ color: 'var(--gray-500)', marginBottom: 24 }}>
          Moved to <strong>{selectedDate && format(selectedDate, 'MMM d, yyyy')}</strong> at <strong>{selectedSlot}</strong>
        </p>
        <button className="btn btn-teal" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/appointments')}>Back to Appointments</button>
      </div>
    </div>
  )

  return (
    <div style={{ padding: '28px 0 60px' }}>
      <div className="container" style={{ maxWidth: 760 }}>
        {/* Current */}
        <div className="card" style={{ padding: '18px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--amber-100)', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📅</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{appt?.doctorName}</div>
            <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>
              Current: {appt && format(new Date(appt.appointmentDate), 'EEE MMM d, yyyy')} · {appt?.timeSlot}
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>← Back</button>
        </div>

        {/* Date */}
        <div className="card" style={{ padding: 20, marginBottom: 14 }}>
          <div className="form-label" style={{ marginBottom: 12 }}>Select New Date</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {dates.map(d => {
              const active = selectedDate?.toDateString() === d.toDateString()
              return (
                <button key={d.toISOString()} onClick={() => setSelectedDate(d)} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '9px 11px', borderRadius: 10, minWidth: 52,
                  border: `1.5px solid ${active ? 'var(--teal-400)' : 'var(--gray-200)'}`,
                  background: active ? 'var(--teal-500)' : '#fff',
                  cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all .15s',
                }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: active ? 'rgba(255,255,255,.7)' : 'var(--gray-400)' }}>{format(d, 'EEE')}</span>
                  <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-display)', color: active ? '#fff' : 'var(--gray-800)', lineHeight: 1.1 }}>{format(d, 'd')}</span>
                  <span style={{ fontSize: 10, color: active ? 'rgba(255,255,255,.6)' : 'var(--gray-400)' }}>{format(d, 'MMM')}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Slots */}
        {selectedDate && (
          <div className="card fade-up" style={{ padding: 20, marginBottom: 14 }}>
            <div className="form-label" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              New Time Slot {slotsLoading && <span className="spinner spinner-dark" style={{ width: 14, height: 14 }} />}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px,1fr))', gap: 8 }}>
              {TIME_SLOTS.map(slot => {
                const booked = bookedSlots.includes(slot), active = selectedSlot === slot
                return (
                  <button key={slot} disabled={booked} onClick={() => !booked && setSelectedSlot(slot)} style={{
                    padding: '9px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    border: `1.5px solid ${active ? 'var(--teal-400)' : booked ? 'var(--gray-100)' : 'var(--gray-200)'}`,
                    background: active ? 'var(--teal-500)' : booked ? 'var(--gray-50)' : '#fff',
                    color: active ? '#fff' : booked ? 'var(--gray-300)' : 'var(--gray-700)',
                    cursor: booked ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--font-body)', transition: 'all .15s', textAlign: 'center',
                  }}>
                    {slot}{booked && <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>Booked</div>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>⚠️ {error}</div>}

        <button className="btn btn-teal btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting || !selectedDate || !selectedSlot} onClick={handleSubmit}>
          {submitting ? <><span className="spinner" /> Saving…</> : 'Confirm Reschedule'}
        </button>
      </div>
    </div>
  )
}
