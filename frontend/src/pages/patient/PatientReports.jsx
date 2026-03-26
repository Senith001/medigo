// PatientReports.jsx
import { useState, useEffect, useRef } from 'react'
import { reportAPI } from '../../services/api'
import { EmptyState, Alert, Spinner, SectionHeader, PageLoader } from '../../components/ui/index.jsx'
import { format } from 'date-fns'

const REPORT_TYPES = ['blood_test','x_ray','mri','ct_scan','ecg','urine_test','other']
const TYPE_ICONS = { blood_test:'🩸', x_ray:'🦴', mri:'🧲', ct_scan:'📡', ecg:'💓', urine_test:'🧪', other:'📋' }

export function PatientReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [msg, setMsg] = useState({ type:'', text:'' })
  const [form, setForm] = useState({ title:'', reportType:'other', description:'' })
  const fileRef = useRef()

  const fetch = () => {
    setLoading(true); setError('')
    reportAPI.getMy()
      .then(r => setReports(r.data.reports || []))
      .catch(() => setError('Could not load reports. Make sure medical-report-service is running.'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetch() }, [])

  const handleUpload = async (e) => {
    e.preventDefault()
    const file = fileRef.current?.files[0]
    if (!file) { setMsg({ type:'error', text:'Please select a file.' }); return }
    setUploading(true); setMsg({ type:'', text:'' })
    try {
      const fd = new FormData()
      fd.append('report', file)
      fd.append('title', form.title || file.name)
      fd.append('reportType', form.reportType)
      fd.append('description', form.description)
      await reportAPI.upload(fd)
      setMsg({ type:'success', text:'Report uploaded successfully!' })
      setShowUpload(false)
      setForm({ title:'', reportType:'other', description:'' })
      fetch()
    } catch (err) {
      setMsg({ type:'error', text: err.response?.data?.message || 'Upload failed.' })
    } finally { setUploading(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report?')) return
    try { await reportAPI.delete(id); fetch() }
    catch { alert('Failed to delete.') }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <SectionHeader title="My Medical Reports" subtitle={`${reports.length} reports`}
          action={<button className="btn-primary" onClick={() => setShowUpload(!showUpload)}>{showUpload ? '✕ Cancel' : '+ Upload Report'}</button>}
        />
        {msg.text && <div className="mb-4"><Alert type={msg.type} message={msg.text}/></div>}

        {showUpload && (
          <div className="card p-6 mb-5 border-teal/30 bg-teal-lighter/30">
            <h3 className="font-bold text-gray-800 mb-4">Upload New Report</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="label">Report Title</label><input className="input" placeholder="e.g. Blood Test March 2026" value={form.title} onChange={e => setForm({...form,title:e.target.value})}/></div>
                <div><label className="label">Report Type</label>
                  <select className="input" value={form.reportType} onChange={e => setForm({...form,reportType:e.target.value})}>
                    {REPORT_TYPES.map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {t.replace(/_/g,' ').toUpperCase()}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="label">File (PDF, JPG, PNG — max 5MB)</label><input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="input" required/></div>
              <div><label className="label">Description (optional)</label><input className="input" placeholder="Brief description..." value={form.description} onChange={e => setForm({...form,description:e.target.value})}/></div>
              <button type="submit" className="btn-primary" disabled={uploading}>
                {uploading ? <><Spinner size="sm"/> Uploading…</> : '⬆️ Upload'}
              </button>
            </form>
          </div>
        )}

        {error ? (
          <div className="card p-8 text-center"><p className="text-red-400 mb-3">{error}</p><button className="btn-outline btn-sm" onClick={fetch}>Retry</button></div>
        ) : loading ? <PageLoader/> : reports.length === 0 ? (
          <div className="card"><EmptyState icon="📋" title="No reports yet" message="Upload your first medical report"/></div>
        ) : (
          <div className="space-y-3">
            {reports.map(report => (
              <div key={report._id} className="card p-4 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">{TYPE_ICONS[report.reportType] || '📋'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-sm mb-0.5">{report.title}</div>
                    <div className="flex gap-3 text-xs text-gray-400 flex-wrap">
                      <span>{report.reportType?.replace(/_/g,' ').toUpperCase()}</span>
                      <span>{format(new Date(report.createdAt),'MMM d, yyyy')}</span>
                      {report.fileSize && <span>{(report.fileSize/1024).toFixed(0)} KB</span>}
                    </div>
                    {report.doctorNotes && (
                      <div className="mt-1.5 text-xs text-teal bg-teal-lighter px-2 py-1 rounded-lg border border-teal/20">
                        💊 Doctor: {report.doctorNotes}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <a href={reportAPI.downloadUrl(report._id)} className="btn-outline btn-sm text-xs" download>⬇️ Download</a>
                    <button className="btn-ghost btn-sm text-xs text-red-400 hover:text-red-500" onClick={() => handleDelete(report._id)}>🗑️</button>
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

// PatientPrescriptions.jsx
import { prescriptionAPI } from '../../services/api'

export function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    prescriptionAPI.getMy()
      .then(r => setPrescriptions(r.data.prescriptions || []))
      .catch(() => setError('Could not load prescriptions. Make sure doctor-service is running.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <SectionHeader title="My Prescriptions" subtitle={`${prescriptions.length} prescriptions`}/>
        {error ? (
          <div className="card p-8 text-center"><p className="text-red-400">{error}</p></div>
        ) : loading ? <PageLoader/> : prescriptions.length === 0 ? (
          <div className="card"><EmptyState icon="💊" title="No prescriptions yet" message="Your doctor will issue prescriptions after consultations"/></div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map(p => (
              <div key={p._id} className="card overflow-hidden">
                <div className="p-5 flex items-start gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(expanded === p._id ? null : p._id)}>
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">💊</div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">{p.diagnosis}</div>
                    <div className="text-sm text-gray-400 mt-0.5">{p.doctorName} · {p.specialty} · {format(new Date(p.createdAt),'MMM d, yyyy')}</div>
                    {p.followUpDate && <div className="text-xs text-teal font-semibold mt-1">📅 Follow-up: {format(new Date(p.followUpDate),'MMM d, yyyy')}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${p.status==='active'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>{p.status}</span>
                    <span className="text-gray-400">{expanded===p._id?'▲':'▼'}</span>
                  </div>
                </div>
                {expanded === p._id && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">💊 Medicines</h4>
                    <div className="space-y-2 mb-4">
                      {p.medicines?.map((m, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
                          <div className="flex items-start justify-between mb-1">
                            <span className="font-bold text-gray-900">{m.name}</span>
                            <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{m.dosage}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                            <span>🕐 {m.frequency}</span><span>📆 {m.duration}</span>
                          </div>
                          {m.notes && <p className="text-xs text-amber-600 mt-1.5 italic">⚠️ {m.notes}</p>}
                        </div>
                      ))}
                    </div>
                    {p.instructions && (
                      <div className="bg-teal-lighter rounded-xl p-4 border border-teal/20">
                        <h4 className="text-xs font-bold text-teal uppercase tracking-wider mb-2">📋 Doctor's Instructions</h4>
                        <p className="text-sm text-gray-700">{p.instructions}</p>
                      </div>
                    )}
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
