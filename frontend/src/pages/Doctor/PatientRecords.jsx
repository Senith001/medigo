import { useState, useEffect } from 'react'
import {
  FileText, Search, Plus, Download, User, Calendar,
  Stethoscope, Send, Paperclip, ArrowUpRight,
  ShieldCheck, Inbox, FolderOpen, X, CheckCircle2,
  MessageSquare, Clock
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { reportAPI, appointmentAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'
import Button from '../../components/ui/Button'

export default function PatientRecords() {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all') // all | sent | received | messages
  const [showUpload, setShowUpload] = useState(false)
  const [appointments, setAppointments] = useState([])
  const [uploadForm, setUploadForm] = useState({
    patientId: '', title: '', type: 'Prescription', description: '', file: null
  })
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const fetchClinicalData = async () => {
    if (!user?.doctorId) return
    try {
      setLoading(true)
      const [reportsRes, apptsRes] = await Promise.all([
        reportAPI.getByDoctor(user.doctorId),
        appointmentAPI.getAll()
      ])
      if (reportsRes.data.success) setReports(reportsRes.data.data)
      if (apptsRes.data?.appointments) {
        setAppointments(apptsRes.data.appointments) // store full appointments for messages + patient select
      }
    } catch (err) {
      console.error('Clinical Sync Error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchClinicalData() }, [user])

  const filtered = reports.filter(r => {
    const matchSearch = r.reportTitle?.toLowerCase().includes(search.toLowerCase()) ||
      r.patientId?.toLowerCase().includes(search.toLowerCase())
    const matchTab = tab === 'all' || (tab === 'sent' && r.uploadedBy === 'doctor') || (tab === 'received' && r.uploadedBy === 'patient')
    return matchSearch && matchTab
  })

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!uploadForm.file || !uploadForm.patientId) return alert('Please select a file and a patient.')
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('reportFile', uploadForm.file)
      formData.append('patientId', uploadForm.patientId)
      formData.append('doctorId', user.doctorId)
      formData.append('reportTitle', uploadForm.title)
      formData.append('reportType', uploadForm.type)
      formData.append('description', uploadForm.description)
      formData.append('uploadedBy', 'doctor')
      const res = await reportAPI.upload(formData)
      if (res.data.success) {
        setReports([res.data.data, ...reports])
        setUploadSuccess(true)
        setTimeout(() => {
          setShowUpload(false)
          setUploadSuccess(false)
          setUploadForm({ patientId: '', title: '', type: 'Prescription', description: '', file: null })
        }, 1500)
      }
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || err.message))
    } finally {
      setUploading(false)
    }
  }

  const sentCount = reports.filter(r => r.uploadedBy === 'doctor').length
  const receivedCount = reports.filter(r => r.uploadedBy === 'patient').length
  const patientMessages = appointments.filter(apt => apt.reason && apt.reason.trim())
  const uniquePatients = Array.from(
    new Map(appointments.map(apt => [apt.patientId, { id: apt.patientId, name: apt.patientName || 'Patient' }])).values()
  )

  return (
    <DashboardLayout isDoctor={true}>
      <div className="max-w-6xl mx-auto space-y-6 pb-24 font-inter">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-black text-medigo-blue uppercase tracking-widest mb-1">Patient Files</p>
            <h1 className="text-3xl font-black text-medigo-navy tracking-tight">
              Clinical <span className="text-medigo-blue">Repository</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium mt-1">Manage medical records shared between you and your patients.</p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-2 bg-medigo-blue hover:bg-blue-700 text-white font-black text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
          >
            <Plus size={18} /> Send to Patient
          </button>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Files', value: reports.length, icon: FolderOpen, color: 'text-slate-600 bg-slate-50 border-slate-100' },
            { label: 'Sent by You', value: sentCount, icon: Send, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
            { label: 'From Patients', value: receivedCount, icon: Inbox, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
            { label: 'Patient Notes', value: patientMessages.length, icon: MessageSquare, color: 'text-teal-600 bg-teal-50 border-teal-100' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-black text-medigo-navy">{stat.value}</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Search + Tabs ── */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input
              type="text"
              placeholder="Search by title or patient ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-slate-50 rounded-xl text-sm font-bold text-medigo-navy outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
          <div className="flex bg-slate-50 p-1 rounded-xl gap-1 shrink-0">
            {[['all', 'All'], ['sent', 'Sent'], ['received', 'Received'], ['messages', 'Patient Notes']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  tab === key ? 'bg-white text-medigo-blue shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >{label}</button>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl shrink-0">
            <ShieldCheck size={12} /> Encrypted
          </div>
        </div>

        {/* ── Records Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-52 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-100 py-24 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-200">
              <FileText size={32} />
            </div>
            <h3 className="text-lg font-black text-medigo-navy">No Records Found</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              {tab === 'received' ? 'No documents shared by patients yet.' : 'Share a document with a patient to get started.'}
            </p>
            {tab !== 'received' && (
              <button onClick={() => setShowUpload(true)} className="inline-flex items-center gap-2 text-medigo-blue font-black text-sm underline underline-offset-4 mt-2">
                <Plus size={14} /> Send First Document
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((report, idx) => (
                <motion.div
                  key={report._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-white rounded-2xl border border-slate-100 p-6 hover:border-blue-100 hover:shadow-lg transition-all group"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      report.uploadedBy === 'doctor'
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'bg-blue-50 text-medigo-blue'
                    }`}>
                      {report.uploadedBy === 'doctor' ? <Stethoscope size={22} /> : <Inbox size={22} />}
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                      report.uploadedBy === 'doctor'
                        ? 'bg-indigo-50 text-indigo-500 border-indigo-100'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {report.uploadedBy === 'doctor' ? 'Sent' : 'Received'}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="space-y-1 mb-4">
                    <h4 className="font-black text-medigo-navy truncate">{report.reportTitle || 'Untitled Document'}</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{report.reportType}</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold mb-5">
                    <User size={12} className="text-medigo-blue/40" />
                    <span className="truncate">Patient: {report.patientId?.slice(0, 16)}…</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                    <button
                      onClick={() => window.open(report.fileUrl, '_blank')}
                      className="flex-1 flex items-center justify-center gap-2 h-10 bg-slate-50 hover:bg-medigo-blue hover:text-white text-slate-500 text-xs font-black rounded-xl transition-all border border-slate-100 hover:border-medigo-blue"
                    >
                      <Download size={14} /> Download
                    </button>
                    <button
                      onClick={() => window.open(report.fileUrl, '_blank')}
                      className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-medigo-blue rounded-xl transition-all border border-slate-100"
                    >
                      <ArrowUpRight size={15} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Patient Messages Section ── */}
      {tab === 'messages' && (
        <div className="space-y-4">
          {patientMessages.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-100 py-24 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-200">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-lg font-black text-medigo-navy">No Patient Messages</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">When patients leave pre-appointment notes, they will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {patientMessages.map((apt, idx) => (
                  <motion.div
                    key={apt._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="bg-white rounded-2xl border border-slate-100 p-6 hover:border-teal-200 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                          <MessageSquare size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-medigo-navy">{apt.patientName || 'Patient'}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Clock size={10} /> {apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                        apt.status === 'confirmed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        apt.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>{apt.status}</span>
                    </div>

                    <div className="bg-teal-50/60 border border-teal-100 rounded-xl px-4 py-3">
                      <p className="text-xs font-bold text-medigo-navy leading-relaxed">"{apt.reason}"</p>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Stethoscope size={11} className="text-teal-500" /> {apt.specialty || 'General'} · {apt.timeSlot || '—'}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* ── Upload Modal ── */}
      <AnimatePresence>
        {showUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowUpload(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Modal top accent bar */}
              <div className="h-1.5 bg-gradient-to-r from-medigo-blue via-indigo-500 to-medigo-teal" />

              <div className="p-8">
                {/* Success state */}
                <AnimatePresence>
                  {uploadSuccess && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 bg-white rounded-3xl flex flex-col items-center justify-center gap-4 z-10"
                    >
                      <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
                        <CheckCircle2 size={40} className="text-emerald-500" />
                      </div>
                      <p className="text-xl font-black text-medigo-navy">File Sent!</p>
                      <p className="text-slate-400 text-sm">The document has been dispatched to the patient.</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-black text-medigo-navy">Send Document to Patient</h2>
                    <p className="text-slate-400 text-xs mt-0.5">Upload a prescription, lab result, or clinical note</p>
                  </div>
                  <button onClick={() => setShowUpload(false)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 transition-all">
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleUpload} className="space-y-4">
                  {/* Patient select */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign to Patient</label>
                    <select
                      required
                      className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold outline-none focus:border-medigo-blue focus:ring-2 focus:ring-blue-100 transition-all"
                      value={uploadForm.patientId}
                      onChange={e => setUploadForm({ ...uploadForm, patientId: e.target.value })}
                    >
                      <option value="">Select a patient…</option>
                      {uniquePatients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>

                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Title</label>
                    <input
                      type="text" required placeholder="e.g. Blood Test Results — April 2026"
                      className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold outline-none focus:border-medigo-blue focus:ring-2 focus:ring-blue-100 transition-all"
                      value={uploadForm.title}
                      onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Type */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Type</label>
                      <select
                        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold outline-none focus:border-medigo-blue"
                        value={uploadForm.type}
                        onChange={e => setUploadForm({ ...uploadForm, type: e.target.value })}
                      >
                        <option value="Prescription">Prescription</option>
                        <option value="Lab Order">Lab Order</option>
                        <option value="Diagnosis">Diagnosis</option>
                        <option value="Referral">Referral Letter</option>
                        <option value="Report">Report</option>
                      </select>
                    </div>

                    {/* File */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attach File</label>
                      <input type="file" required accept=".pdf,.jpg,.jpeg,.png" className="hidden" id="doc-file"
                        onChange={e => setUploadForm({ ...uploadForm, file: e.target.files[0] })} />
                      <label htmlFor="doc-file"
                        className="w-full h-12 bg-slate-900 hover:bg-medigo-navy text-white rounded-xl px-4 flex items-center justify-between text-xs font-black cursor-pointer transition-all">
                        <span className="truncate">{uploadForm.file ? uploadForm.file.name.slice(0, 18) + '…' : 'Choose file'}</span>
                        <Paperclip size={14} className="shrink-0 ml-2" />
                      </label>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes (optional)</label>
                    <textarea
                      rows={2}
                      placeholder="Additional clinical notes for the patient…"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-medigo-blue resize-none transition-all"
                      value={uploadForm.description}
                      onChange={e => setUploadForm({ ...uploadForm, description: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowUpload(false)}
                      className="flex-1 h-12 rounded-xl border border-slate-200 text-slate-500 font-black text-sm hover:bg-slate-50 transition-all">
                      Cancel
                    </button>
                    <button type="submit" disabled={uploading}
                      className="flex-1 h-12 rounded-xl bg-medigo-blue hover:bg-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-60">
                      {uploading ? 'Sending…' : <><Send size={15} /> Send Document</>}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
