import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useAuth } from '../../context/AuthContext'
import { appointmentAPI, prescriptionAPI, availabilityAPI, doctorAPI } from '../../services/api'
import { StatCard, Badge, EmptyState, SectionHeader, PageLoader, Alert, Spinner } from '../../components/ui/index.jsx'

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

// ── Doctor Dashboard ──────────────────────────────────────────
export function DoctorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    appointmentAPI.getAll()
      .then(r => setAppointments(r.data.appointments || []))
      .catch(() => setError('Could not load appointments.'))
      .finally(() => setLoading(false))
  }, [])

  const today   = appointments.filter(a => new Date(a.appointmentDate).toDateString() === new Date().toDateString())
  const pending = appointments.filter(a => a.status === 'pending')

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-emerald-700 to-teal p-7 relative overflow-hidden">
          <div className="absolute w-48 h-48 bg-white/5 rounded-full -top-12 -right-12"/>
          <div className="relative">
            <h1 className="font-display font-black text-2xl text-white mb-2">Welcome, {user?.name}! 👨‍⚕️</h1>
            <p className="text-white/60 text-sm mb-5">
              {today.length > 0 ? `${today.length} appointment${today.length>1?'s':''} today.` : 'No appointments today.'}
              {pending.length > 0 && ` ${pending.length} awaiting confirmation.`}
            </p>
            <div className="flex gap-3">
              <button className="bg-white text-teal font-bold px-4 py-2 rounded-lg text-sm" onClick={() => navigate('/doctor/appointments')}>View Appointments</button>
              <button className="bg-white/15 text-white border border-white/20 font-bold px-4 py-2 rounded-lg text-sm" onClick={() => navigate('/doctor/availability')}>Set Availability</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon="📅" label="Today" value={loading?'—':today.length} color="teal"/>
          <StatCard icon="⏳" label="Pending" value={loading?'—':pending.length} color="amber"/>
          <StatCard icon="✅" label="Completed" value={loading?'—':appointments.filter(a=>a.status==='completed').length} color="green"/>
          <StatCard icon="📋" label="Total" value={loading?'—':appointments.length} color="blue"/>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {icon:'📅',label:"Today's Schedule",  path:'/doctor/appointments',  color:'bg-teal-50 border-teal/30'},
            {icon:'💊',label:'Issue Prescription', path:'/doctor/prescriptions', color:'bg-purple-50 border-purple-200'},
            {icon:'🕐',label:'Set Availability',  path:'/doctor/availability',  color:'bg-amber-50 border-amber-200'},
            {icon:'👤',label:'My Profile',         path:'/doctor/profile',       color:'bg-blue-50 border-blue-200'},
          ].map(a => (
            <button key={a.path} onClick={() => navigate(a.path)} className={`card card-hover p-4 text-center border ${a.color} cursor-pointer`}>
              <div className="text-2xl mb-2">{a.icon}</div>
              <div className="text-sm font-bold text-gray-700">{a.label}</div>
            </button>
          ))}
        </div>

        <div className="card p-6">
          <SectionHeader title="Today's Schedule" action={<button className="btn-ghost text-sm text-teal font-bold" onClick={() => navigate('/doctor/appointments')}>View all →</button>}/>
          {loading ? <PageLoader/> : error ? <p className="text-red-400 text-sm text-center py-8">{error}</p> : today.length === 0 ? (
            <EmptyState icon="🗓️" title="No appointments today" message="You're free today!"/>
          ) : (
            <div className="space-y-3">
              {today.map(appt => (
                <div key={appt._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 transition-all">
                  <div className="text-center bg-teal-lighter border border-teal/20 rounded-xl p-3 min-w-[52px]">
                    <div className="font-display font-black text-lg text-teal leading-none">{appt.timeSlot?.split(' ')[0]}</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-sm">{appt.patientName}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{appt.reason || 'General consultation'}</div>
                  </div>
                  <Badge status={appt.status}/>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Doctor Appointments ───────────────────────────────────────
export function DoctorAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState(null)
  const [showLinkModal, setShowLinkModal] = useState(null)
  const [meetingLink, setMeetingLink] = useState('')
  const [msg, setMsg] = useState('')

  const fetch = () => {
    setLoading(true)
    appointmentAPI.getAll()
      .then(r => setAppointments(r.data.appointments || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetch() }, [])

  const handleStatus = async (id, status, link = '') => {
    setUpdating(id)
    try {
      await appointmentAPI.updateStatus(id, { status, meetingLink: link || undefined })
      setMsg(`Appointment ${status}!`); setShowLinkModal(null); fetch()
    } catch { setMsg('Failed to update.') }
    finally { setUpdating(null); setTimeout(() => setMsg(''), 3000) }
  }

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)
  const counts = ['pending','confirmed','completed','cancelled'].reduce((acc,s) => { acc[s]=appointments.filter(a=>a.status===s).length; return acc },{})

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <SectionHeader title="Appointments" subtitle={`${appointments.length} total`}/>
        {msg && <div className="mb-4"><Alert type="success" message={msg}/></div>}
        <div className="flex flex-wrap gap-2 mb-5">
          {['all','pending','confirmed','completed','cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold border transition-all ${
                filter===f?'bg-emerald-700 border-emerald-700 text-white':'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
              {f!=='all'&&counts[f]>0&&<span className={`text-xs px-1.5 py-0.5 rounded-full ${filter===f?'bg-white/20':'bg-gray-100'}`}>{counts[f]}</span>}
            </button>
          ))}
        </div>
        {loading ? <PageLoader/> : filtered.length === 0 ? (
          <div className="card"><EmptyState icon="📅" title="No appointments" message="No appointments in this category"/></div>
        ) : (
          <div className="space-y-3">
            {filtered.map(appt => (
              <div key={appt._id} className="card p-5 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center min-w-[52px] flex-shrink-0">
                    <div className="font-display font-black text-xl text-emerald-700 leading-none">{format(new Date(appt.appointmentDate),'d')}</div>
                    <div className="text-xs font-bold text-emerald-500 uppercase">{format(new Date(appt.appointmentDate),'MMM')}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1"><span className="font-bold text-gray-900">{appt.patientName}</span><Badge status={appt.status}/></div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                      <span>📧 {appt.patientEmail}</span><span>⏰ {appt.timeSlot}</span>
                      <span>{appt.type==='telemedicine'?'📹 Video':'🏥 In-Person'}</span>
                    </div>
                    {appt.reason && <p className="text-xs text-gray-400 italic mt-1">"{appt.reason}"</p>}
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {appt.status === 'pending' && (
                      <>
                        <button className="btn-primary btn-sm text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowLinkModal(appt._id)} disabled={updating===appt._id}>✓ Confirm</button>
                        <button className="btn-danger btn-sm text-xs" onClick={() => handleStatus(appt._id,'no-show')} disabled={updating===appt._id}>✕ Reject</button>
                      </>
                    )}
                    {appt.status === 'confirmed' && (
                      <button className="btn-outline btn-sm text-xs border-emerald-400 text-emerald-600" onClick={() => handleStatus(appt._id,'completed')} disabled={updating===appt._id}>✓ Mark Done</button>
                    )}
                  </div>
                </div>
                {showLinkModal === appt._id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <label className="label">Meeting Link (optional)</label>
                    <div className="flex gap-2 mt-1">
                      <input className="input flex-1" placeholder="https://meet.jit.si/room-..." value={meetingLink} onChange={e => setMeetingLink(e.target.value)}/>
                      <button className="btn-primary" onClick={() => handleStatus(appt._id,'confirmed',meetingLink)}>Confirm</button>
                      <button className="btn-ghost" onClick={() => setShowLinkModal(null)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Doctor Prescriptions ──────────────────────────────────────
export function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ appointmentId:'', patientId:'', patientName:'', patientEmail:'', diagnosis:'', instructions:'', followUpDate:'' })
  const [medicines, setMedicines] = useState([{ name:'', dosage:'', frequency:'', duration:'', notes:'' }])
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState({ type:'', text:'' })

  const fetch = () => {
    prescriptionAPI.getMy().then(r => setPrescriptions(r.data.prescriptions||[])).catch(()=>{}).finally(()=>setLoading(false))
  }
  useEffect(() => { fetch() }, [])

  const addMed = () => setMedicines([...medicines,{name:'',dosage:'',frequency:'',duration:'',notes:''}])
  const removeMed = (i) => setMedicines(medicines.filter((_,idx)=>idx!==i))
  const updateMed = (i,f,v) => { const m=[...medicines]; m[i][f]=v; setMedicines(m) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true)
    try {
      await prescriptionAPI.create({...form,medicines})
      setMsg({type:'success',text:'Prescription issued!'})
      setShowForm(false)
      setForm({appointmentId:'',patientId:'',patientName:'',patientEmail:'',diagnosis:'',instructions:'',followUpDate:''})
      setMedicines([{name:'',dosage:'',frequency:'',duration:'',notes:''}])
      fetch()
    } catch(err) { setMsg({type:'error',text:err.response?.data?.message||'Failed.'}) }
    finally { setSubmitting(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <SectionHeader title="Prescriptions" subtitle={`${prescriptions.length} issued`}
          action={<button className="btn-primary" onClick={()=>setShowForm(!showForm)}>{showForm?'✕ Cancel':'+ Issue Prescription'}</button>}
        />
        {msg.text && <div className="mb-4"><Alert type={msg.type} message={msg.text}/></div>}
        {showForm && (
          <div className="card p-6 mb-5 border-purple-200 bg-purple-50/30">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Appointment ID</label><input className="input" required value={form.appointmentId} onChange={e=>setForm({...form,appointmentId:e.target.value})} placeholder="Appointment ID"/></div>
                <div><label className="label">Patient ID</label><input className="input" required value={form.patientId} onChange={e=>setForm({...form,patientId:e.target.value})} placeholder="Patient ID"/></div>
                <div><label className="label">Patient Name</label><input className="input" required value={form.patientName} onChange={e=>setForm({...form,patientName:e.target.value})} placeholder="Full name"/></div>
                <div><label className="label">Patient Email</label><input className="input" type="email" required value={form.patientEmail} onChange={e=>setForm({...form,patientEmail:e.target.value})} placeholder="email@example.com"/></div>
              </div>
              <div><label className="label">Diagnosis</label><input className="input" required value={form.diagnosis} onChange={e=>setForm({...form,diagnosis:e.target.value})} placeholder="e.g. Hypertension Stage 1"/></div>
              <div>
                <div className="flex items-center justify-between mb-2"><label className="label mb-0">Medicines</label><button type="button" className="btn-ghost btn-sm text-teal text-sm" onClick={addMed}>+ Add</button></div>
                <div className="space-y-3">
                  {medicines.map((m,i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                        <input className="input text-sm" placeholder="Medicine" value={m.name} onChange={e=>updateMed(i,'name',e.target.value)} required/>
                        <input className="input text-sm" placeholder="Dosage" value={m.dosage} onChange={e=>updateMed(i,'dosage',e.target.value)} required/>
                        <input className="input text-sm" placeholder="Frequency" value={m.frequency} onChange={e=>updateMed(i,'frequency',e.target.value)} required/>
                        <input className="input text-sm" placeholder="Duration" value={m.duration} onChange={e=>updateMed(i,'duration',e.target.value)} required/>
                      </div>
                      <div className="flex gap-2">
                        <input className="input text-sm flex-1" placeholder="Notes (optional)" value={m.notes} onChange={e=>updateMed(i,'notes',e.target.value)}/>
                        {medicines.length>1 && <button type="button" className="btn-ghost btn-sm text-red-400" onClick={()=>removeMed(i)}>✕</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div><label className="label">Instructions</label><textarea className="input resize-none" rows={2} value={form.instructions} onChange={e=>setForm({...form,instructions:e.target.value})} placeholder="Dietary advice..."/></div>
              <div><label className="label">Follow-up Date (optional)</label><input className="input" type="date" value={form.followUpDate} onChange={e=>setForm({...form,followUpDate:e.target.value})} min={new Date().toISOString().split('T')[0]}/></div>
              <button type="submit" className="btn-primary" disabled={submitting}>{submitting?<><Spinner size="sm"/> Issuing…</>:'💊 Issue Prescription'}</button>
            </form>
          </div>
        )}
        {loading ? <PageLoader/> : prescriptions.length === 0 ? (
          <div className="card"><EmptyState icon="💊" title="No prescriptions" message="Issue your first prescription"/></div>
        ) : (
          <div className="space-y-3">
            {prescriptions.map(p => (
              <div key={p._id} className="card p-5">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">💊</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{p.patientName}</span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${p.status==='active'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>{p.status}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">🔍 {p.diagnosis}</div>
                    <div className="text-xs text-gray-400">{format(new Date(p.createdAt),'MMM d, yyyy')} · {p.medicines?.length} medicine{p.medicines?.length!==1?'s':''}</div>
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

// ── Doctor Availability ───────────────────────────────────────
export function DoctorAvailability() {
  const [availability, setAvailability] = useState(DAYS.map(day => ({day,startTime:'09:00',endTime:'17:00',isAvailable:false})))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({type:'',text:''})

  useEffect(() => {
    availabilityAPI.getMy()
      .then(r => {
        if (r.data.availability?.length) {
          const map = {}; r.data.availability.forEach(a => { map[a.day]=a })
          setAvailability(DAYS.map(day => map[day]||{day,startTime:'09:00',endTime:'17:00',isAvailable:false}))
        }
      }).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  const toggle  = (i) => { const a=[...availability]; a[i].isAvailable=!a[i].isAvailable; setAvailability(a) }
  const setTime = (i,f,v) => { const a=[...availability]; a[i][f]=v; setAvailability(a) }

  const handleSave = async () => {
    setSaving(true)
    try {
      await availabilityAPI.updateMy({availability:availability.filter(a=>a.isAvailable)})
      setMsg({type:'success',text:'Availability saved!'})
    } catch(err) { setMsg({type:'error',text:err.response?.data?.message||'Failed.'}) }
    finally { setSaving(false); setTimeout(()=>setMsg({type:'',text:''}),3000) }
  }

  if (loading) return <PageLoader/>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <SectionHeader title="Set Availability" subtitle="Configure your working hours"/>
        {msg.text && <div className="mb-4"><Alert type={msg.type} message={msg.text}/></div>}
        <div className="card p-6 space-y-3">
          {availability.map((slot,i) => (
            <div key={slot.day} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${slot.isAvailable?'border-teal bg-teal-lighter/30':'border-gray-100 bg-gray-50 opacity-60'}`}>
              <button type="button" onClick={()=>toggle(i)} className={`w-12 h-6 rounded-full transition-all flex-shrink-0 relative ${slot.isAvailable?'bg-teal':'bg-gray-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-all ${slot.isAvailable?'right-0.5':'left-0.5'}`}/>
              </button>
              <span className="font-bold text-gray-800 w-24 flex-shrink-0">{slot.day}</span>
              {slot.isAvailable ? (
                <div className="flex items-center gap-2 flex-1">
                  <input type="time" className="input py-1.5 text-sm w-32" value={slot.startTime} onChange={e=>setTime(i,'startTime',e.target.value)}/>
                  <span className="text-gray-400 text-sm">to</span>
                  <input type="time" className="input py-1.5 text-sm w-32" value={slot.endTime} onChange={e=>setTime(i,'endTime',e.target.value)}/>
                </div>
              ) : <span className="text-gray-400 text-sm">Not available</span>}
            </div>
          ))}
          <button className="btn-primary w-full justify-center mt-4" onClick={handleSave} disabled={saving}>
            {saving?<><Spinner size="sm"/> Saving…</>:'💾 Save Availability'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Doctor Profile ────────────────────────────────────────────
export function DoctorProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({type:'',text:''})

  useEffect(() => {
    doctorAPI.getProfile().then(r=>setProfile(r.data.doctor)).catch(()=>setProfile({})).finally(()=>setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try { await doctorAPI.updateProfile(profile); setMsg({type:'success',text:'Profile updated!'}) }
    catch(err) { setMsg({type:'error',text:err.response?.data?.message||'Failed.'}) }
    finally { setSaving(false); setTimeout(()=>setMsg({type:'',text:''}),3000) }
  }

  if (loading) return <PageLoader/>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <SectionHeader title="My Profile" subtitle="Update your professional information"/>
        {msg.text && <div className="mb-4"><Alert type={msg.type} message={msg.text}/></div>}
        <div className="card p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Full Name</label><input className="input" value={profile?.fullName||''} onChange={e=>setProfile({...profile,fullName:e.target.value})}/></div>
              <div><label className="label">Phone</label><input className="input" value={profile?.phone||''} onChange={e=>setProfile({...profile,phone:e.target.value})}/></div>
              <div><label className="label">Specialty</label><input className="input" value={profile?.specialty||''} onChange={e=>setProfile({...profile,specialty:e.target.value})}/></div>
              <div><label className="label">Hospital</label><input className="input" value={profile?.hospital||''} onChange={e=>setProfile({...profile,hospital:e.target.value})}/></div>
              <div><label className="label">Experience (years)</label><input className="input" type="number" value={profile?.experience||0} onChange={e=>setProfile({...profile,experience:e.target.value})}/></div>
              <div><label className="label">Consultation Fee (Rs.)</label><input className="input" type="number" value={profile?.fee||0} onChange={e=>setProfile({...profile,fee:e.target.value})}/></div>
            </div>
            <div><label className="label">Qualifications</label><input className="input" value={profile?.qualifications||''} onChange={e=>setProfile({...profile,qualifications:e.target.value})} placeholder="e.g. MBBS, MD"/></div>
            <div><label className="label">Bio</label><textarea className="input resize-none" rows={3} value={profile?.bio||''} onChange={e=>setProfile({...profile,bio:e.target.value})} placeholder="Brief professional bio..."/></div>
            <button type="submit" className="btn-primary" disabled={saving}>{saving?<><Spinner size="sm"/> Saving…</>:'💾 Update Profile'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
