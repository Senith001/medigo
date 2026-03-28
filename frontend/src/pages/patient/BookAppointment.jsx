import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doctorAPI, appointmentAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { format, addDays } from 'date-fns'
import { ArrowLeft, MapPin, Star, Clock } from 'lucide-react'

const TIME_SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30']

export default function BookAppointment() {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState(null)
  const [selectedDate, setSelectedDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'))
  const [selectedSlot, setSelectedSlot] = useState('')
  const [bookedSlots, setBookedSlots] = useState([])
  const [type, setType] = useState('telemedicine')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    doctorAPI.getById(doctorId).then(r => setDoctor(r.data.doctor))
  }, [doctorId])

  useEffect(() => {
    if (selectedDate) {
      appointmentAPI.getAvailability(doctorId, selectedDate).then(r => setBookedSlots(r.data.bookedSlots || [])).catch(() => setBookedSlots([]))
    }
  }, [selectedDate, doctorId])

  const handleBook = async () => {
    if (!selectedSlot) return toast.error('Please select a time slot')
    setLoading(true)
    try {
      await appointmentAPI.book({ doctorId, appointmentDate: selectedDate, timeSlot: selectedSlot, type, reason })
      toast.success('Appointment booked successfully!')
      navigate('/patient/appointments')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed')
    } finally { setLoading(false) }
  }

  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i + 1))

  if (!doctor) return <div className="loading-page"><div className="spinner" /></div>

  return (
    <div>
      <button className="btn btn-secondary btn-sm" style={{ marginBottom: 20 }} onClick={() => navigate(-1)}>
        <ArrowLeft size={15} /> Back
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--blue-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: 'var(--blue-700)' }}>{doctor.fullName?.[0]}</div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>Dr. {doctor.fullName}</h2>
                <div style={{ color: 'var(--blue-600)', marginTop: 2 }}>{doctor.specialty}</div>
                {doctor.hospital && <div style={{ fontSize: 13, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}><MapPin size={12} />{doctor.hospital}</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}><Star size={13} color="#f59e0b" fill="#f59e0b" />{doctor.rating?.toFixed(1)}</span>
                  <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>{doctor.experience} yrs experience</span>
                  <span style={{ fontWeight: 600, color: 'var(--blue-700)' }}>LKR {doctor.fee}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Select Date</h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {dates.map(date => {
                const val = format(date, 'yyyy-MM-dd')
                const active = selectedDate === val
                return (
                  <button key={val} onClick={() => { setSelectedDate(val); setSelectedSlot('') }}
                    style={{ padding: '10px 16px', borderRadius: 10, border: `1.5px solid ${active ? 'var(--blue-600)' : 'var(--gray-200)'}`, background: active ? 'var(--blue-600)' : 'white', color: active ? 'white' : 'var(--gray-700)', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 500 }}>{format(date, 'EEE')}</div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{format(date, 'd')}</div>
                    <div style={{ fontSize: 11 }}>{format(date, 'MMM')}</div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={16} /> Available Time Slots</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {TIME_SLOTS.map(slot => {
                const booked = bookedSlots.includes(slot)
                const active = selectedSlot === slot
                return (
                  <button key={slot} disabled={booked}
                    onClick={() => setSelectedSlot(slot)}
                    style={{ padding: '10px', borderRadius: 8, border: `1.5px solid ${active ? 'var(--blue-600)' : booked ? 'var(--gray-200)' : 'var(--gray-300)'}`, background: active ? 'var(--blue-600)' : booked ? 'var(--gray-100)' : 'white', color: active ? 'white' : booked ? 'var(--gray-400)' : 'var(--gray-700)', cursor: booked ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 500, textDecoration: booked ? 'line-through' : 'none' }}>
                    {slot}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Booking Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Consultation Type</label>
                <select className="form-input" value={type} onChange={e => setType(e.target.value)}>
                  <option value="telemedicine">Telemedicine</option>
                  <option value="in-person">In-Person</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Reason for Visit</label>
                <textarea className="form-input" rows={3} placeholder="Describe your symptoms..." value={reason} onChange={e => setReason(e.target.value)} style={{ resize: 'vertical' }} />
              </div>
              {selectedDate && selectedSlot && (
                <div style={{ background: 'var(--blue-50)', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 6 }}>Summary</div>
                  <div style={{ fontWeight: 600 }}>{format(new Date(selectedDate), 'dd MMMM yyyy')}</div>
                  <div style={{ color: 'var(--blue-700)' }}>{selectedSlot} · {type}</div>
                  <div style={{ marginTop: 8, fontWeight: 700, fontSize: 16 }}>LKR {doctor.fee}</div>
                </div>
              )}
              <button className="btn btn-primary btn-lg" onClick={handleBook} disabled={loading || !selectedSlot} style={{ width: '100%' }}>
                {loading ? <span className="spinner" /> : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
