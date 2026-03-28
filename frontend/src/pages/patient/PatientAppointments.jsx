import { useState, useEffect } from 'react'
import { appointmentAPI, paymentAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { format, addDays } from 'date-fns'
import { Calendar, X, CreditCard, RefreshCw } from 'lucide-react'

const statusBadge = (s) => {
  const m = { pending: 'badge-amber', confirmed: 'badge-blue', completed: 'badge-green', cancelled: 'badge-red', 'no-show': 'badge-gray' }
  return <span className={`badge ${m[s] || 'badge-gray'}`}>{s}</span>
}

const TIME_SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30']

export default function PatientAppointments() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [payingId, setPayingId] = useState(null)

  // Reschedule modal state
  const [rescheduleAppt, setRescheduleAppt] = useState(null)
  const [newDate, setNewDate] = useState('')
  const [newSlot, setNewSlot] = useState('')
  const [bookedSlots, setBookedSlots] = useState([])
  const [rescheduling, setRescheduling] = useState(false)

  const load = () => {
    const params = filter ? { status: filter } : {}
    appointmentAPI.getMy(params)
      .then(r => setAppointments(r.data.appointments || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])

  // Load booked slots when date changes in modal
  useEffect(() => {
    if (rescheduleAppt && newDate) {
      appointmentAPI.getAvailability(rescheduleAppt.doctorId, newDate)
        .then(r => setBookedSlots(r.data.bookedSlots || []))
        .catch(() => setBookedSlots([]))
    }
  }, [newDate, rescheduleAppt])

  const openReschedule = (appt) => {
    setRescheduleAppt(appt)
    setNewDate(format(addDays(new Date(), 1), 'yyyy-MM-dd'))
    setNewSlot('')
    setBookedSlots([])
  }

  const closeReschedule = () => {
    setRescheduleAppt(null)
    setNewDate('')
    setNewSlot('')
    setBookedSlots([])
  }

  const handleReschedule = async () => {
    if (!newSlot) return toast.error('Please select a time slot')
    setRescheduling(true)
    try {
      await appointmentAPI.modify(rescheduleAppt._id, {
        appointmentDate: newDate,
        timeSlot: newSlot,
      })
      toast.success('Appointment rescheduled!')
      closeReschedule()
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reschedule failed')
    } finally {
      setRescheduling(false)
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return
    try {
      await appointmentAPI.cancel(id, { reason: 'Cancelled by patient' })
      toast.success('Appointment cancelled')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handlePay = async (a) => {
    setPayingId(a._id)
    try {
      const res = await paymentAPI.create({
        appointmentId: a._id,
        patientId: user?.userId,
        patientName: user?.fullName,
        patientEmail: user?.email,
        doctorId: a.doctorId,
        doctorName: a.doctorName,
        amount: a.fee || 0,
      })
      const checkoutUrl = res.data.checkoutUrl
      if (checkoutUrl) window.location.href = checkoutUrl
      else toast.error('Could not get payment URL')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed')
    } finally {
      setPayingId(null)
    }
  }

  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i + 1))

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Appointments</h1>
        <p className="page-subtitle">Manage your scheduled visits</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(s)}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      <div className="card">
        {loading
          ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          : appointments.length === 0
          ? <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-400)' }}>
              <Calendar size={40} style={{ margin: '0 auto 12px' }} /><p>No appointments found</p>
            </div>
          : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Doctor</th><th>Specialty</th><th>Date</th><th>Time</th><th>Type</th><th>Fee</th><th>Payment</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {appointments.map(a => (
                    <tr key={a._id}>
                      <td style={{ fontWeight: 500 }}>Dr. {a.doctorName}</td>
                      <td style={{ color: 'var(--gray-500)', fontSize: 13 }}>{a.specialty}</td>
                      <td>{format(new Date(a.appointmentDate), 'dd MMM yyyy')}</td>
                      <td>{a.timeSlot}</td>
                      <td><span className="badge badge-gray">{a.type}</span></td>
                      <td style={{ fontWeight: 600, fontSize: 13 }}>LKR {a.fee || 0}</td>
                      <td><span className={`badge ${a.paymentStatus === 'paid' ? 'badge-green' : 'badge-amber'}`}>{a.paymentStatus}</span></td>
                      <td>{statusBadge(a.status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {a.paymentStatus === 'unpaid' && ['pending', 'confirmed'].includes(a.status) && (
                            <button className="btn btn-sm btn-primary" onClick={() => handlePay(a)} disabled={payingId === a._id}>
                              {payingId === a._id ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} /> : <CreditCard size={13} />}
                              Pay
                            </button>
                          )}
                          {a.status === 'pending' && (
                            <button className="btn btn-sm btn-secondary" onClick={() => openReschedule(a)}>
                              <RefreshCw size={13} /> Reschedule
                            </button>
                          )}
                          {['pending', 'confirmed'].includes(a.status) && (
                            <button className="btn btn-sm btn-danger" onClick={() => handleCancel(a._id)}>
                              <X size={13} /> Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleAppt && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Reschedule Appointment</h3>
              <button className="btn btn-secondary btn-sm" onClick={closeReschedule}><X size={14} /></button>
            </div>

            <div style={{ background: 'var(--blue-50)', borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 13 }}>
              <div style={{ fontWeight: 500 }}>Dr. {rescheduleAppt.doctorName}</div>
              <div style={{ color: 'var(--gray-500)', marginTop: 2 }}>
                Current: {format(new Date(rescheduleAppt.appointmentDate), 'dd MMM yyyy')} at {rescheduleAppt.timeSlot}
              </div>
            </div>

            {/* Date Selection */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-700)', marginBottom: 10 }}>Select New Date</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {dates.map(date => {
                  const val = format(date, 'yyyy-MM-dd')
                  const active = newDate === val
                  return (
                    <button key={val} onClick={() => { setNewDate(val); setNewSlot('') }}
                      style={{
                        padding: '8px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                        border: `1.5px solid ${active ? 'var(--blue-600)' : 'var(--gray-200)'}`,
                        background: active ? 'var(--blue-600)' : 'white',
                        color: active ? 'white' : 'var(--gray-700)',
                      }}>
                      <div style={{ fontSize: 11, fontWeight: 500 }}>{format(date, 'EEE')}</div>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{format(date, 'd')}</div>
                      <div style={{ fontSize: 11 }}>{format(date, 'MMM')}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time Slot Selection */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-700)', marginBottom: 10 }}>Select New Time Slot</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {TIME_SLOTS.map(slot => {
                  const booked = bookedSlots.includes(slot)
                  const active = newSlot === slot
                  return (
                    <button key={slot} disabled={booked} onClick={() => setNewSlot(slot)}
                      style={{
                        padding: '9px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: booked ? 'not-allowed' : 'pointer',
                        border: `1.5px solid ${active ? 'var(--blue-600)' : booked ? 'var(--gray-200)' : 'var(--gray-300)'}`,
                        background: active ? 'var(--blue-600)' : booked ? 'var(--gray-100)' : 'white',
                        color: active ? 'white' : booked ? 'var(--gray-400)' : 'var(--gray-700)',
                        textDecoration: booked ? 'line-through' : 'none',
                      }}>
                      {slot}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" onClick={handleReschedule} disabled={rescheduling || !newSlot} style={{ flex: 1 }}>
                {rescheduling ? <span className="spinner" /> : <><RefreshCw size={14} /> Confirm Reschedule</>}
              </button>
              <button className="btn btn-secondary" onClick={closeReschedule}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}