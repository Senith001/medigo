// BookAppointment.jsx
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
  const { state } = useLocation()
  const navigate = useNavigate()
  const doctor = state?.doctor || null
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [bookedSlots, setBookedSlots] = useState([])
  const [type, setType] = useState('telemedicine')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const dates = getDates()

  useEffect(() => {
    if (!selectedDate || !doctor) return
    setSlotsLoading(true); setSelectedSlot(null)
    appointmentAPI.getAvailability(doctor._id, format(selectedDate,'yyyy-MM-dd'))
      .then(r => setBookedSlots(r.data.bookedSlots || []))
      .catch(() => setBookedSlots([]))
      .finally(() => setSlotsLoading(false))
  }, [selectedDate, doctor?._id])

  const handleSubmit = async () => {
    if (!selectedDate || !selectedSlot) { setError('Please select date and time.'); return }
    setError(''); setLoading(true)
    try {
      await appointmentAPI.book({
        doctorId:    doctor._id,
        doctorName:  doctor.fullName || doctor.name,
        doctorEmail: doctor.email || 'doctor@hospital.lk',
        specialty:   doctor.specialty,
        hospital:    doctor.hospital || null,
        appointmentDate: format(selectedDate,'yyyy-MM-dd'),
        timeSlot: selectedSlot, type, reason,
        fee: doctor.fee || 0,
      })
      setSuccess(true)
      setTimeout(() => navigate('/appointments'), 2500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book. Try again.')
    } finally { setLoading(false) }
  }

  if (!doctor) return (
    <div style={{ textAlign:'center', padding:60 }}>
      <p style={{ marginBottom:16, color:'var(--gray-500)' }}>No doctor selected.</p>
      <button className="btn btn-teal" onClick={() => navigate('/search')}>Find a Doctor</button>
    </div>
  )

  if (success) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', padding:24 }}>
      <div className="card fade-up" style={{ padding:'48px 40px', textAlign:'center', maxWidth:420 }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'var(--green-100)', color:'var(--green-500)', fontSize:32, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>✓</div>
        <h2 style={{ marginBottom:10 }}>Appointment Booked!</h2>
        <p style={{ color:'var(--gray-500)', marginBottom:6 }}>
          <strong>{doctor.fullName}</strong> · {selectedDate && format(selectedDate,'MMM d, yyyy')} · <strong>{selectedSlot}</strong>
        </p>
        <p style={{ fontSize:13, color:'var(--gray-400)', marginBottom:24 }}>📧 Confirmation email sent. Redirecting…</p>
        <button className="btn btn-teal" style={{ width:'100%', justifyContent:'center' }} onClick={() => navigate('/appointments')}>View Appointments</button>
      </div>
    </div>
  )

  return (
    <div style={{ padding:'28px 0 60px' }}>
      <div className="container">
        {/* Doctor summary */}
        <div className="card" style={{ padding:'18px 24px', marginBottom:20, display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ width:50, height:50, borderRadius:10, background:'var(--teal-50)', color:'var(--teal-700)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontSize:16, fontWeight:800 }}>
            {(doctor.fullName||'').replace('Dr. ','').split(' ').map(n=>n[0]).join('').slice(0,2)}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:16, fontWeight:800, fontFamily:'var(--font-display)' }}>{doctor.fullName}</div>
            <div style={{ fontSize:13, color:'var(--gray-400)' }}>{doctor.specialty} · {doctor.hospital} · Rs. {doctor.fee?.toLocaleString()}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>← Back</button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:20, alignItems:'start' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Type */}
            <div className="card" style={{ padding:20 }}>
              <div className="form-label" style={{ marginBottom:10 }}>Appointment Type</div>
              <div style={{ display:'flex', gap:10 }}>
                {[{v:'telemedicine',i:'📹',l:'Video Consultation'},{v:'in-person',i:'🏥',l:'In-Person'}].map(t => (
                  <button key={t.v} onClick={() => setType(t.v)} style={{
                    flex:1, padding:'12px 10px', borderRadius:10, textAlign:'center',
                    border:`2px solid ${type===t.v ? 'var(--teal-400)' : 'var(--gray-200)'}`,
                    background: type===t.v ? 'var(--teal-50)' : '#fff',
                    color: type===t.v ? 'var(--teal-700)' : 'var(--gray-600)',
                    cursor:'pointer', fontFamily:'var(--font-body)', fontWeight:700, fontSize:13,
                  }}>
                    <div style={{ fontSize:22, marginBottom:4 }}>{t.i}</div>{t.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div className="card" style={{ padding:20 }}>
              <div className="form-label" style={{ marginBottom:12 }}>Select Date</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {dates.map(d => {
                  const active = selectedDate?.toDateString() === d.toDateString()
                  return (
                    <button key={d.toISOString()} onClick={() => setSelectedDate(d)} style={{
                      display:'flex', flexDirection:'column', alignItems:'center',
                      padding:'9px 11px', borderRadius:10, minWidth:52,
                      border:`1.5px solid ${active ? 'var(--teal-400)' : 'var(--gray-200)'}`,
                      background: active ? 'var(--teal-500)' : '#fff',
                      cursor:'pointer', fontFamily:'var(--font-body)', transition:'all .15s',
                    }}>
                      <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', color: active ? 'rgba(255,255,255,.7)' : 'var(--gray-400)' }}>{format(d,'EEE')}</span>
                      <span style={{ fontSize:20, fontWeight:800, fontFamily:'var(--font-display)', color: active ? '#fff' : 'var(--gray-800)', lineHeight:1.1 }}>{format(d,'d')}</span>
                      <span style={{ fontSize:10, color: active ? 'rgba(255,255,255,.6)' : 'var(--gray-400)' }}>{format(d,'MMM')}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Slots */}
            {selectedDate && (
              <div className="card fade-up" style={{ padding:20 }}>
                <div className="form-label" style={{ marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
                  Select Time Slot {slotsLoading && <span className="spinner spinner-dark" style={{ width:14, height:14 }}/>}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(130px,1fr))', gap:8 }}>
                  {TIME_SLOTS.map(slot => {
                    const booked = bookedSlots.includes(slot), active = selectedSlot === slot
                    return (
                      <button key={slot} disabled={booked} onClick={() => !booked && setSelectedSlot(slot)} style={{
                        padding:'9px', borderRadius:8, fontSize:13, fontWeight:600,
                        border:`1.5px solid ${active ? 'var(--teal-400)' : booked ? 'var(--gray-100)' : 'var(--gray-200)'}`,
                        background: active ? 'var(--teal-500)' : booked ? 'var(--gray-50)' : '#fff',
                        color: active ? '#fff' : booked ? 'var(--gray-300)' : 'var(--gray-700)',
                        cursor: booked ? 'not-allowed' : 'pointer',
                        fontFamily:'var(--font-body)', transition:'all .15s', textAlign:'center',
                      }}>
                        {slot}{booked && <div style={{ fontSize:10, color:'var(--gray-400)' }}>Booked</div>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Reason */}
            <div className="card" style={{ padding:20 }}>
              <div className="form-label" style={{ marginBottom:8 }}>Reason for Visit <span style={{ color:'var(--gray-400)', fontWeight:400, textTransform:'none' }}>(optional)</span></div>
              <textarea className="form-input" rows={3} placeholder="Describe your symptoms..." value={reason} onChange={e => setReason(e.target.value)} style={{ resize:'none' }}/>
            </div>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <button className="btn btn-teal btn-lg" style={{ width:'100%', justifyContent:'center' }} disabled={loading || !selectedDate || !selectedSlot} onClick={handleSubmit}>
              {loading ? <><span className="spinner"/> Booking…</> : 'Confirm Appointment'}
            </button>
          </div>

          {/* Summary */}
          <div style={{ position:'sticky', top:88 }}>
            {selectedDate && selectedSlot && (
              <div className="card fade-up" style={{ padding:20, background:'var(--teal-50)', borderColor:'var(--teal-200)' }}>
                <div className="form-label" style={{ color:'var(--teal-700)', marginBottom:12 }}>Booking Summary</div>
                {[
                  { l:'Doctor', v: doctor.fullName },
                  { l:'Date',   v: format(selectedDate,'EEE, MMM d yyyy') },
                  { l:'Time',   v: selectedSlot },
                  { l:'Type',   v: type === 'telemedicine' ? '📹 Video' : '🏥 In-Person' },
                  { l:'Fee',    v: `Rs. ${(doctor.fee||0).toLocaleString()}` },
                ].map(r => (
                  <div key={r.l} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid var(--teal-100)', fontSize:13 }}>
                    <span style={{ color:'var(--gray-500)' }}>{r.l}</span>
                    <strong style={{ color:'var(--gray-800)', textAlign:'right', maxWidth:160 }}>{r.v}</strong>
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
