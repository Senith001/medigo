import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { doctorAPI, appointmentAPI, adminAPI } from '../../services/api'
import { StatCard, Badge, EmptyState, PageLoader, SectionHeader, Alert } from '../../components/ui/index.jsx'
import { useNavigate } from 'react-router-dom'

// ── Admin Dashboard ───────────────────────────────────────────
export function AdminDashboard() {
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      doctorAPI.getAllAdmin().catch(() => ({ data: { doctors: [] } })),
      appointmentAPI.getAllAdmin().catch(() => ({ data: { appointments: [] } })),
    ]).then(([d, a]) => {
      setDoctors(d.data.doctors || [])
      setAppointments(a.data.appointments || [])
    }).finally(() => setLoading(false))
  }, [])

  const unverified = doctors.filter(d => !d.isVerified)
  const today = appointments.filter(a => new Date(a.appointmentDate).toDateString() === new Date().toDateString())

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 p-7 relative overflow-hidden">
          <div className="absolute w-48 h-48 bg-white/5 rounded-full -top-12 -right-12"/>
          <div className="relative">
            <h1 className="font-display font-black text-2xl text-white mb-2">Admin Dashboard 🛡️</h1>
            <p className="text-white/70 text-sm mb-4">
              {unverified.length > 0 ? `⚠️ ${unverified.length} doctor${unverified.length>1?'s':''} awaiting verification.` : '✅ All doctors verified.'}
            </p>
            <div className="flex gap-3">
              <button className="bg-white text-orange-600 font-bold px-4 py-2 rounded-lg text-sm" onClick={() => navigate('/admin/doctors')}>Manage Doctors</button>
              <button className="bg-white/15 text-white border border-white/20 font-bold px-4 py-2 rounded-lg text-sm" onClick={() => navigate('/admin/appointments')}>View Appointments</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon="👨‍⚕️" label="Total Doctors"        value={loading?'—':doctors.length}       color="blue"/>
          <StatCard icon="⏳"  label="Pending Verification" value={loading?'—':unverified.length}     color="amber"/>
          <StatCard icon="📅"  label="Total Appointments"   value={loading?'—':appointments.length}   color="teal"/>
          <StatCard icon="🗓️" label="Today's Appointments"  value={loading?'—':today.length}          color="green"/>
        </div>

        {/* Pending verifications */}
        {!loading && unverified.length > 0 && (
          <div className="card p-6 border-amber-200 bg-amber-50/30">
            <SectionHeader title="⚠️ Pending Verifications" subtitle="Doctors awaiting verification"
              action={<button className="btn-ghost text-sm text-amber-600 font-bold" onClick={() => navigate('/admin/doctors')}>View all →</button>}
            />
            <div className="space-y-3">
              {unverified.slice(0,3).map(d => (
                <div key={d._id} className="flex items-center gap-4 bg-white rounded-xl p-4 border border-amber-100">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center font-bold text-amber-700 flex-shrink-0 font-display">
                    {(d.fullName||'').replace('Dr. ','').split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-sm">{d.fullName}</div>
                    <div className="text-xs text-gray-400">{d.specialty} · {d.hospital}</div>
                  </div>
                  <VerifyButton doctorId={d._id} onDone={() => doctorAPI.getAllAdmin().then(r=>setDoctors(r.data.doctors||[])).catch(()=>{})}/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent appointments */}
        <div className="card p-6">
          <SectionHeader title="Recent Appointments" action={<button className="btn-ghost text-sm text-teal font-bold" onClick={() => navigate('/admin/appointments')}>View all →</button>}/>
          {loading ? <PageLoader/> : appointments.length === 0 ? (
            <EmptyState icon="📅" title="No appointments yet" message=""/>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0,5).map(a => (
                <div key={a._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <span className="font-semibold text-sm text-gray-800">{a.patientName}</span>
                    <span className="text-gray-400 text-xs mx-2">→</span>
                    <span className="text-sm text-gray-600">{a.doctorName}</span>
                  </div>
                  <span className="text-xs text-gray-400">{format(new Date(a.appointmentDate),'MMM d')}</span>
                  <Badge status={a.status}/>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function VerifyButton({ doctorId, onDone }) {
  const [loading, setLoading] = useState(false)
  const handle = async () => { setLoading(true); try { await doctorAPI.verify(doctorId); onDone() } catch { alert('Failed.') } finally { setLoading(false) } }
  return <button className="btn-primary btn-sm text-xs bg-emerald-600 hover:bg-emerald-700" onClick={handle} disabled={loading}>{loading?'...':'✓ Verify'}</button>
}

// ── Admin Doctors ─────────────────────────────────────────────
export function AdminDoctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [msg, setMsg] = useState('')

  const fetch = () => {
    setLoading(true)
    doctorAPI.getAllAdmin().then(r=>setDoctors(r.data.doctors||[])).catch(()=>{}).finally(()=>setLoading(false))
  }
  useEffect(() => { fetch() }, [])

  const handleVerify = async (id) => {
    try { await doctorAPI.verify(id); setMsg('Doctor verified!'); fetch() } catch { setMsg('Failed.') }
    finally { setTimeout(()=>setMsg(''),3000) }
  }
  const handleToggle = async (id) => { try { await doctorAPI.toggle(id); fetch() } catch { alert('Failed.') } }

  const filtered = filter==='all' ? doctors :
    filter==='unverified' ? doctors.filter(d=>!d.isVerified) :
    filter==='verified'   ? doctors.filter(d=>d.isVerified) :
    doctors.filter(d=>!d.isActive)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeader title="Manage Doctors" subtitle={`${doctors.length} registered doctors`}/>
        {msg && <div className="mb-4"><Alert type="success" message={msg}/></div>}
        <div className="flex gap-2 mb-5 flex-wrap">
          {[['all','All'],['unverified','Pending'],['verified','Verified'],['inactive','Inactive']].map(([v,l]) => (
            <button key={v} onClick={()=>setFilter(v)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all ${filter===v?'bg-orange-500 border-orange-500 text-white':'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {l}
            </button>
          ))}
        </div>
        {loading ? <PageLoader/> : filtered.length===0 ? (
          <div className="card"><EmptyState icon="👨‍⚕️" title="No doctors" message="No doctors in this category"/></div>
        ) : (
          <div className="space-y-3">
            {filtered.map(doc => (
              <div key={doc._id} className="card p-5 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center font-display font-bold text-blue-700 flex-shrink-0">
                    {(doc.fullName||'').replace('Dr. ','').split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-gray-900">{doc.fullName}</span>
                      {doc.isVerified
                        ? <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">✓ Verified</span>
                        : <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">⏳ Pending</span>}
                      {!doc.isActive && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Inactive</span>}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                      <span>{doc.specialty}</span><span>🏥 {doc.hospital}</span>
                      <span>📧 {doc.email}</span>
                      {doc.createdAt && <span>Joined {format(new Date(doc.createdAt),'MMM d, yyyy')}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!doc.isVerified && <button className="btn-primary btn-sm text-xs bg-emerald-600 hover:bg-emerald-700" onClick={()=>handleVerify(doc._id)}>✓ Verify</button>}
                    <button className={`btn-sm text-xs ${doc.isActive?'btn-danger':'btn-outline'}`} onClick={()=>handleToggle(doc._id)}>
                      {doc.isActive?'Deactivate':'Activate'}
                    </button>
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

// ── Admin Appointments ────────────────────────────────────────
export function AdminAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    appointmentAPI.getAllAdmin()
      .then(r=>setAppointments(r.data.appointments||[]))
      .catch(()=>{})
      .finally(()=>setLoading(false))
  }, [])

  const filtered = filter==='all' ? appointments : appointments.filter(a=>a.status===filter)
  const counts = ['pending','confirmed','completed','cancelled'].reduce((acc,s)=>{acc[s]=appointments.filter(a=>a.status===s).length;return acc},{})

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeader title="All Appointments" subtitle={`${appointments.length} total`}/>
        <div className="flex flex-wrap gap-2 mb-5">
          {[['all','All'],['pending','Pending'],['confirmed','Confirmed'],['completed','Completed'],['cancelled','Cancelled']].map(([v,l]) => (
            <button key={v} onClick={()=>setFilter(v)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold border transition-all ${filter===v?'bg-navy border-navy text-white':'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {l}
              {v!=='all'&&counts[v]>0&&<span className={`text-xs px-1.5 py-0.5 rounded-full ${filter===v?'bg-white/20':'bg-gray-100'}`}>{counts[v]}</span>}
            </button>
          ))}
        </div>
        {loading ? <PageLoader/> : filtered.length===0 ? (
          <div className="card"><EmptyState icon="📅" title="No appointments" message="No appointments in this category"/></div>
        ) : (
          <div className="space-y-3">
            {filtered.map(appt => (
              <div key={appt._id} className="card p-4 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 rounded-xl p-3 text-center min-w-[52px] flex-shrink-0">
                    <div className="font-display font-black text-xl text-gray-700 leading-none">{format(new Date(appt.appointmentDate),'d')}</div>
                    <div className="text-xs font-bold text-gray-500 uppercase">{format(new Date(appt.appointmentDate),'MMM')}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-gray-900 text-sm">{appt.patientName}</span>
                      <span className="text-gray-400 text-xs">→</span>
                      <span className="text-sm text-gray-600">{appt.doctorName}</span>
                      <Badge status={appt.status}/>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                      <span>{appt.specialty}</span><span>⏰ {appt.timeSlot}</span>
                      {appt.fee>0&&<span>💰 Rs. {appt.fee?.toLocaleString()}</span>}
                    </div>
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

// ── Admin Patients ────────────────────────────────────────────
export function AdminPatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState(null)
  const [msg, setMsg] = useState('')

  const fetch = () => {
    setLoading(true); setError('')
    adminAPI.getPatients()
      .then(r => setPatients(r.data.patients || r.data || []))
      .catch(() => setError('Could not load patients. Make sure admin-service is running on port 5000.'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetch() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this patient account? This cannot be undone.')) return
    setDeleting(id)
    try {
      await adminAPI.deletePatient(id)
      setMsg('Patient account deleted.')
      fetch()
    } catch { setMsg('Failed to delete.') }
    finally { setDeleting(null); setTimeout(() => setMsg(''), 3000) }
  }

  const filtered = patients.filter(p =>
    !search ||
    p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeader title="Manage Patients" subtitle={`${patients.length} registered patients`}/>
        {msg && <div className="mb-4"><Alert type="success" message={msg}/></div>}

        <div className="card p-4 mb-5">
          <input className="input" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}/>
        </div>

        {error ? (
          <div className="card p-8 text-center"><p className="text-red-400 mb-3">{error}</p><button className="btn-outline btn-sm" onClick={fetch}>Retry</button></div>
        ) : loading ? <PageLoader/> : filtered.length === 0 ? (
          <div className="card"><EmptyState icon="👤" title="No patients found" message="No patients registered yet"/></div>
        ) : (
          <div className="space-y-3">
            {filtered.map((patient, i) => (
              <div key={patient._id} className="card p-4 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center font-display font-bold text-blue-700 flex-shrink-0">
                    {(patient.fullName||'P')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-sm mb-0.5">{patient.fullName}</div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                      <span>📧 {patient.email}</span>
                      {patient.phone && <span>📞 {patient.phone}</span>}
                      {patient.userId && <span>ID: {patient.userId}</span>}
                      {patient.createdAt && <span>Joined {format(new Date(patient.createdAt),'MMM d, yyyy')}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${patient.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {patient.isVerified ? '✓ Verified' : '⏳ Unverified'}
                    </span>
                    <button
                      className="btn-danger btn-sm text-xs"
                      onClick={() => handleDelete(patient._id)}
                      disabled={deleting === patient._id}
                    >
                      {deleting === patient._id ? '...' : '🗑️ Delete'}
                    </button>
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

// ── Admin Management (superadmin only) ───────────────────────
export function AdminManagement() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ fullName:'', email:'', password:'' })
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [msg, setMsg] = useState({ type:'', text:'' })

  const fetch = () => {
    setLoading(true)
    adminAPI.getAdmins()
      .then(r => setAdmins(r.data.admins || r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetch() }, [])

  const handleCreate = async (e) => {
    e.preventDefault(); setSubmitting(true)
    try {
      await adminAPI.createAdmin(form)
      setMsg({ type:'success', text:'Admin created successfully!' })
      setShowForm(false)
      setForm({ fullName:'', email:'', password:'' })
      fetch()
    } catch (err) {
      setMsg({ type:'error', text: err.response?.data?.message || 'Failed to create admin.' })
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this admin account?')) return
    setDeleting(id)
    try { await adminAPI.deleteAdmin(id); fetch() }
    catch { alert('Failed to delete.') }
    finally { setDeleting(null) }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <SectionHeader title="Admin Accounts" subtitle="Superadmin only"
          action={<button className="btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? '✕ Cancel' : '+ Create Admin'}</button>}
        />
        {msg.text && <div className="mb-4"><Alert type={msg.type} message={msg.text}/></div>}

        {showForm && (
          <div className="card p-6 mb-5 border-orange-200 bg-orange-50/30">
            <h3 className="font-bold text-gray-800 mb-4">Create New Admin</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Full Name</label><input className="input" required value={form.fullName} onChange={e => setForm({...form,fullName:e.target.value})} placeholder="Admin Name"/></div>
                <div><label className="label">Email</label><input className="input" type="email" required value={form.email} onChange={e => setForm({...form,email:e.target.value})} placeholder="admin@medigo.lk"/></div>
              </div>
              <div><label className="label">Password</label><input className="input" type="password" required value={form.password} onChange={e => setForm({...form,password:e.target.value})} placeholder="Min 8 chars..."/></div>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? '...' : '+ Create Admin'}
              </button>
            </form>
          </div>
        )}

        {loading ? <PageLoader/> : admins.length === 0 ? (
          <div className="card"><EmptyState icon="🛡️" title="No admins" message="Create the first admin account"/></div>
        ) : (
          <div className="space-y-3">
            {admins.map(admin => (
              <div key={admin._id} className="card p-4 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center font-display font-bold text-orange-600 flex-shrink-0">
                    {(admin.fullName || 'A')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-sm mb-0.5">{admin.fullName}</div>
                    <div className="flex gap-3 text-xs text-gray-400">
                      <span>📧 {admin.email}</span>
                      <span className={`font-bold ${admin.role === 'superadmin' ? 'text-orange-500' : 'text-gray-500'}`}>
                        {admin.role}
                      </span>
                    </div>
                  </div>
                  {admin.role !== 'superadmin' && (
                    <button className="btn-danger btn-sm text-xs" onClick={() => handleDelete(admin._id)} disabled={deleting === admin._id}>
                      {deleting === admin._id ? '...' : '🗑️ Delete'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
