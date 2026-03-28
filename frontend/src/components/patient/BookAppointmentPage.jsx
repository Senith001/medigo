import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, Clock, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import { doctorAPI, apptAPI } from '../../services/api'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import { format, addDays } from 'date-fns'

const TIME_SLOTS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30']

export default function BookAppointmentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState(null)
  const [bookedSlots, setBookedSlots] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [type, setType] = useState('telemedicine')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    doctorAPI.byId(id).then(r => setDoctor(r.data.doctor)).catch(()=>{}).finally(()=>setLoading(false))
  }, [id])

  useEffect(() => {
    if (!selectedDate) return
    apptAPI.availability(id, selectedDate).then(r => setBookedSlots(r.data.bookedSlots || [])).catch(()=>{})
  }, [selectedDate, id])

  const dates = Array.from({length:14}, (_,i) => {
    const d = addDays(new Date(), i+1)
    return { value: format(d,'yyyy-MM-dd'), label: format(d,'EEE, dd MMM') }
  })

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot) return toast.error('Please select date and time')
    setSubmitting(true)
    try {
      await apptAPI.book({ doctorId:id, appointmentDate:selectedDate, timeSlot:selectedSlot, type, reason })
      toast.success('Appointment booked!')
      navigate('/patient/appointments')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed')
    } finally { setSubmitting(false) }
  }

  if (loading) return <div style={{display:'flex',justifyContent:'center',paddingTop:80}}><Spinner size={36}/></div>
  if (!doctor) return <div style={{padding:32,color:'var(--danger)'}}>Doctor not found</div>

  return (
    <div>
      <Header title="Book Appointment" subtitle={`with Dr. ${doctor.fullName}`} />

      <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:24}}>
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          {/* Doctor info */}
          <div style={{background:'var(--white)',borderRadius:'var(--radius-lg)',padding:20,border:'1px solid var(--gray-100)',display:'flex',gap:16,alignItems:'center'}}>
            <div style={{width:60,height:60,borderRadius:'50%',background:'var(--primary-light)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:600,color:'var(--primary)'}}>
              {doctor.fullName?.[0]}
            </div>
            <div>
              <div style={{fontWeight:600,fontSize:17,color:'var(--gray-800)'}}>Dr. {doctor.fullName}</div>
              <div style={{color:'var(--primary)',fontSize:13,marginTop:2}}>{doctor.specialty}</div>
              {doctor.hospital && <div style={{fontSize:12,color:'var(--gray-400)',display:'flex',alignItems:'center',gap:4,marginTop:2}}><MapPin size={11}/>{doctor.hospital}</div>}
              <div style={{fontSize:14,fontWeight:600,color:'var(--gray-700)',marginTop:4}}>LKR {doctor.fee?.toLocaleString()}</div>
            </div>
          </div>

          {/* Select date */}
          <div style={{background:'var(--white)',borderRadius:'var(--radius-lg)',padding:20,border:'1px solid var(--gray-100)'}}>
            <h3 style={{fontSize:15,fontWeight:600,marginBottom:14,display:'flex',alignItems:'center',gap:8}}><Calendar size={16}/>Select Date</h3>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {dates.map(d => (
                <button key={d.value} onClick={()=>{setSelectedDate(d.value);setSelectedSlot('')}}
                  style={{padding:'8px 14px',borderRadius:'var(--radius)',border:`1.5px solid ${selectedDate===d.value?'var(--primary)':'var(--gray-200)'}`,background:selectedDate===d.value?'var(--primary-light)':'var(--white)',color:selectedDate===d.value?'var(--primary)':'var(--gray-600)',fontSize:13,cursor:'pointer',fontWeight:selectedDate===d.value?500:400}}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Select time */}
          {selectedDate && (
            <div style={{background:'var(--white)',borderRadius:'var(--radius-lg)',padding:20,border:'1px solid var(--gray-100)'}}>
              <h3 style={{fontSize:15,fontWeight:600,marginBottom:14,display:'flex',alignItems:'center',gap:8}}><Clock size={16}/>Select Time</h3>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                {TIME_SLOTS.map(s => {
                  const booked = bookedSlots.includes(s)
                  return (
                    <button key={s} onClick={()=>!booked&&setSelectedSlot(s)} disabled={booked}
                      style={{padding:'9px 0',borderRadius:'var(--radius)',border:`1.5px solid ${selectedSlot===s?'var(--primary)':booked?'var(--gray-100)':'var(--gray-200)'}`,background:selectedSlot===s?'var(--primary)':booked?'var(--gray-50)':'var(--white)',color:selectedSlot===s?'#fff':booked?'var(--gray-300)':'var(--gray-600)',fontSize:13,cursor:booked?'not-allowed':'pointer',fontWeight:selectedSlot===s?500:400}}>
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Type + Reason */}
          <div style={{background:'var(--white)',borderRadius:'var(--radius-lg)',padding:20,border:'1px solid var(--gray-100)',display:'flex',flexDirection:'column',gap:14}}>
            <div>
              <label style={{fontSize:13,fontWeight:500,color:'var(--gray-700)',display:'block',marginBottom:8}}>Appointment Type</label>
              <div style={{display:'flex',gap:10}}>
                {['telemedicine','in-person'].map(t => (
                  <button key={t} onClick={()=>setType(t)}
                    style={{flex:1,padding:'9px 0',borderRadius:'var(--radius)',border:`1.5px solid ${type===t?'var(--primary)':'var(--gray-200)'}`,background:type===t?'var(--primary-light)':'var(--white)',color:type===t?'var(--primary)':'var(--gray-600)',fontSize:13,cursor:'pointer',textTransform:'capitalize',fontWeight:type===t?500:400}}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{fontSize:13,fontWeight:500,color:'var(--gray-700)',display:'block',marginBottom:8}}>Reason (optional)</label>
              <textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="Describe your symptoms or reason for visit..."
                rows={3} style={{width:'100%',padding:'10px 12px',border:'1.5px solid var(--gray-200)',borderRadius:'var(--radius)',fontSize:14,resize:'vertical',fontFamily:'var(--font)',outline:'none'}} />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div style={{background:'var(--white)',borderRadius:'var(--radius-lg)',padding:20,border:'1px solid var(--gray-100)',height:'fit-content',position:'sticky',top:24}}>
          <h3 style={{fontSize:15,fontWeight:600,marginBottom:16}}>Booking Summary</h3>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {[['Doctor',`Dr. ${doctor.fullName}`],['Specialty',doctor.specialty],['Date',selectedDate||'—'],['Time',selectedSlot||'—'],['Type',type]].map(([l,v])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',fontSize:13,paddingBottom:10,borderBottom:'1px solid var(--gray-100)'}}>
                <span style={{color:'var(--gray-500)'}}>{l}</span>
                <span style={{fontWeight:500,color:'var(--gray-700)',textTransform:'capitalize'}}>{v}</span>
              </div>
            ))}
            <div style={{display:'flex',justifyContent:'space-between',fontSize:15,fontWeight:600,marginTop:4}}>
              <span>Fee</span>
              <span style={{color:'var(--primary)'}}>LKR {doctor.fee?.toLocaleString()}</span>
            </div>
          </div>
          <Button style={{width:'100%',justifyContent:'center',marginTop:20}} size="lg" loading={submitting} onClick={handleBook}
            disabled={!selectedDate||!selectedSlot}>
            Confirm Booking
          </Button>
        </div>
      </div>
    </div>
  )
}
