import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { appointmentAPI } from '../services/api'

const FILTERS = ['all','pending','confirmed','completed','cancelled']
const MOCK = [
  { _id:'a1', doctorName:'Dr. Kamal Perera',    specialty:'Cardiology',       hospital:'Colombo General', appointmentDate: new Date(Date.now()+86400000*3).toISOString(),  timeSlot:'09:00 - 09:30', type:'telemedicine', status:'confirmed', fee:2500, reason:'Chest pain' },
  { _id:'a2', doctorName:'Dr. Nisha Fernando',  specialty:'Dermatology',      hospital:'Nawaloka Hospital', appointmentDate: new Date(Date.now()+86400000*7).toISOString(), timeSlot:'11:00 - 11:30', type:'telemedicine', status:'pending',   fee:2000, reason:'Skin rash'  },
  { _id:'a3', doctorName:'Dr. Rohan Silva',     specialty:'Neurology',        hospital:'Lanka Hospitals',   appointmentDate: new Date(Date.now()-86400000*5).toISOString(), timeSlot:'14:00 - 14:30', type:'telemedicine', status:'completed', fee:3000 },
  { _id:'a4', doctorName:'Dr. Priya Rajapaksa', specialty:'Pediatrics',       hospital:'Asiri Hospital',    appointmentDate: new Date(Date.now()-86400000*10).toISOString(),timeSlot:'10:00 - 10:30', type:'in-person',    status:'cancelled', fee:1800, cancellationReason:'Doctor unavailable' },
]

export default function MyAppointments() {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [cancelling, setCancelling] = useState(null)

  const fetchAll = () => {
    setLoading(true)
    appointmentAPI.getAll(filter !== 'all' ? { status: filter } : {})
      .then(r => setAppointments(r.data.appointments || []))
      .catch(() => setAppointments(MOCK))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchAll() }, [filter])

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return
    setCancelling(id)
    try { await appointmentAPI.cancel(id, 'Patient cancelled'); fetchAll() }
    catch { alert('Failed to cancel.') }
    finally { setCancelling(null) }
  }

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)
  const counts = FILTERS.slice(1).reduce((a,s) => { a[s] = appointments.filter(x=>x.status===s).length; return a }, {})

  return (
    <div style={{ padding:'28px 0 60px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div>
            <h2 className="section-title" style={{ marginBottom:4 }}>My Appointments</h2>
            <p style={{ fontSize:13, color:'var(--gray-400)' }}>{appointments.length} total appointments</p>
          </div>
          <button className="btn btn-teal" onClick={() => navigate('/search')}>+ New Appointment</button>
        </div>

        {/* Filter tabs */}
        <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              display:'flex', alignItems:'center', gap:6,
              padding:'7px 16px', borderRadius:99,
              border:`1.5px solid ${filter===f ? 'var(--navy)' : 'var(--gray-200)'}`,
              background: filter===f ? 'var(--navy)' : '#fff',
              color: filter===f ? '#fff' : 'var(--gray-600)',
              fontSize:13, fontWeight:700, cursor:'pointer',
              fontFamily:'var(--font-body)', transition:'all .15s',
            }}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
              {f!=='all' && counts[f]>0 && (
                <span style={{ background: filter===f ? 'rgba(255,255,255,.2)' : 'var(--gray-100)', color: filter===f ? '#fff' : 'var(--gray-600)', fontSize:11, fontWeight:700, padding:'1px 7px', borderRadius:99 }}>{counts[f]}</span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:90, borderRadius:12 }}/>)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state-icon">📅</div>
            <h3>No {filter !== 'all' ? filter : ''} appointments</h3>
            <p>Book an appointment to get started</p>
            <button className="btn btn-teal btn-sm" style={{ marginTop:14 }} onClick={() => navigate('/search')}>Find a Doctor</button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {filtered.map((appt, i) => (
              <div key={appt._id} className="card card-hover fade-up" style={{ padding:'20px 24px', animationDelay:`${i*.05}s` }}>
                <div style={{ display:'flex', alignItems:'center', gap:18 }}>
                  {/* Date */}
                  <div style={{ minWidth:52, textAlign:'center', padding:'8px 10px', background:'var(--teal-50)', borderRadius:10, border:'1px solid var(--teal-100)' }}>
                    <div style={{ fontSize:22, fontWeight:800, fontFamily:'var(--font-display)', color:'var(--teal-700)', lineHeight:1 }}>{format(new Date(appt.appointmentDate),'d')}</div>
                    <div style={{ fontSize:10, fontWeight:700, color:'var(--teal-500)', textTransform:'uppercase' }}>{format(new Date(appt.appointmentDate),'MMM')}</div>
                  </div>

                  {/* Info */}
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
                      <span style={{ fontSize:15, fontWeight:800, fontFamily:'var(--font-display)' }}>{appt.doctorName}</span>
                      <span className={`badge badge-${appt.status}`}>{appt.status}</span>
                    </div>
                    <div style={{ display:'flex', gap:16, fontSize:13, color:'var(--gray-400)', flexWrap:'wrap' }}>
                      <span>🏥 {appt.hospital || appt.specialty}</span>
                      <span>⏰ {appt.timeSlot}</span>
                      <span>{appt.type==='telemedicine' ? '📹 Video' : '🏥 In-Person'}</span>
                      <span>💰 Rs. {appt.fee?.toLocaleString()}</span>
                    </div>
                    {appt.reason && <div style={{ fontSize:12, color:'var(--gray-400)', marginTop:4, fontStyle:'italic' }}>"{appt.reason}"</div>}
                    {appt.cancellationReason && <div style={{ fontSize:12, color:'var(--red-500)', marginTop:4 }}>Cancelled: {appt.cancellationReason}</div>}
                  </div>

                  {/* Actions */}
                  <div style={{ display:'flex', flexDirection:'column', gap:7, flexShrink:0 }}>
                    {appt.meetingLink && appt.status==='confirmed' && (
                      <a href={appt.meetingLink} target="_blank" rel="noreferrer" className="btn btn-teal btn-sm">📹 Join</a>
                    )}
                    {['pending','confirmed'].includes(appt.status) && (
                      <>
                        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/appointments/${appt._id}/reschedule`)}>Reschedule</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(appt._id)} disabled={cancelling===appt._id}>
                          {cancelling===appt._id ? <span className="spinner"/> : 'Cancel'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
