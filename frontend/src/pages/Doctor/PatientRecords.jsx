import { useState, useEffect } from 'react'
import {
  FileText, Search, Plus, Download, User, Calendar,
  Stethoscope, Send, Paperclip, ArrowUpRight,
  ShieldCheck, Inbox, FolderOpen, X, CheckCircle2,
  MessageSquare, Clock, Sparkles, Filter, ChevronRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { reportAPI, appointmentAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'

// --- Premium UI Components ---

const GlassCard = ({ children, className = "", hover = true }) => (
  <motion.div
    whileHover={hover ? { y: -5, transition: { duration: 0.2 } } : {}}
    className={`bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_15px_35px_rgba(0,0,0,0.03)] rounded-[2.5rem] overflow-hidden ${className}`}
  >
    {children}
  </motion.div>
)

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
        setAppointments(apptsRes.data.appointments)
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
      <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12 space-y-12 font-inter">

        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-emerald-500/10 rounded-full text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                   <ShieldCheck size={12} /> Secure Cloud Vault
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             </div>
             <h1 className="text-4xl lg:text-6xl font-black text-medigo-navy tracking-tighter leading-none">
                Clinical <br />
                <span className="text-medigo-blue">Repository</span>
             </h1>
             <p className="text-slate-400 text-lg font-medium max-w-xl leading-relaxed">
                Manage and exchange medical records with your patients in a <span className="text-medigo-navy font-bold underline decoration-emerald-400/30">fully encrypted</span> environment.
             </p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="px-8 py-5 bg-medigo-navy text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-premium hover:shadow-2xl transition-all active:scale-95 flex items-center gap-3 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            <span>Send to Patient</span>
          </button>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Files', val: reports.length, icon: FolderOpen, color: 'text-slate-600', bg: 'bg-slate-50' },
            { label: 'Sent by You', val: sentCount, icon: Send, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'From Patients', val: receivedCount, icon: Inbox, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Patient Notes', val: patientMessages.length, icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((stat, i) => (
            <GlassCard key={i} className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center border border-white shadow-sm`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-2xl font-black text-medigo-navy tracking-tight">{stat.val}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* ── Search + Tabs ── */}
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-medigo-blue transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search by title or patient ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-16 pl-14 pr-6 bg-white/50 backdrop-blur-xl border border-white rounded-[1.5rem] text-sm font-bold text-medigo-navy outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
            />
          </div>
          <div className="flex bg-white/50 backdrop-blur-xl p-2 rounded-[1.5rem] border border-white gap-1 shrink-0 shadow-sm">
            {[['all', 'All Files'], ['sent', 'Sent'], ['received', 'Received'], ['messages', 'Patient Notes']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  tab === key ? 'bg-medigo-navy text-white shadow-lg' : 'text-slate-400 hover:text-medigo-navy hover:bg-white'
                }`}
              >{label}</button>
            ))}
          </div>
        </div>

        {/* ── Records Content ── */}
        <AnimatePresence mode="wait">
          {tab !== 'messages' ? (
            <motion.div
              key="records"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white/50 rounded-[2.5rem] border border-white animate-pulse" />)}
                </div>
              ) : filtered.length === 0 ? (
                <GlassCard className="py-24 text-center space-y-6" hover={false}>
                  <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto border border-slate-100">
                    <FileText size={32} className="text-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-medigo-navy">No Records Found</h3>
                    <p className="text-slate-400 text-sm font-medium max-w-xs mx-auto">
                      {tab === 'received' ? 'No documents shared by patients yet.' : 'Share a clinical document to begin synchronization.'}
                    </p>
                  </div>
                </GlassCard>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filtered.map((report, idx) => (
                    <GlassCard
                      key={report._id}
                      className="p-8 group"
                    >
                      <div className="flex items-start justify-between mb-8">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
                          report.uploadedBy === 'doctor' ? 'bg-indigo-50 text-indigo-500' : 'bg-blue-50 text-medigo-blue'
                        }`}>
                          {report.uploadedBy === 'doctor' ? <Stethoscope size={24} /> : <Inbox size={24} />}
                        </div>
                        <div className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${
                          report.uploadedBy === 'doctor' ? 'bg-indigo-50 text-indigo-500 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {report.uploadedBy === 'doctor' ? 'Sent' : 'Received'}
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-8">
                        <h4 className="text-lg font-black text-medigo-navy truncate group-hover:text-medigo-blue transition-colors">{report.reportTitle || 'Untitled Document'}</h4>
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{report.reportType}</p>
                        </div>
                      </div>

                      <div className="bg-slate-50/50 rounded-2xl px-4 py-3 flex items-center gap-3 mb-8">
                        <User size={14} className="text-medigo-blue" />
                        <span className="text-[11px] font-bold text-slate-500 truncate">Patient: {report.patientId}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => window.open(report.fileUrl, '_blank')}
                          className="flex-1 h-12 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-medigo-navy hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
                        >
                          <Download size={14} /> Download
                        </button>
                        <button
                          onClick={() => window.open(report.fileUrl, '_blank')}
                          className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-medigo-blue rounded-xl transition-all shadow-sm"
                        >
                          <ArrowUpRight size={18} />
                        </button>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="messages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {patientMessages.length === 0 ? (
                <GlassCard className="py-24 text-center space-y-6" hover={false}>
                  <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto border border-slate-100">
                    <MessageSquare size={32} className="text-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-medigo-navy">No Patient Notes</h3>
                    <p className="text-slate-400 text-sm font-medium max-w-xs mx-auto">Patient messages from appointment bookings will appear here.</p>
                  </div>
                </GlassCard>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {patientMessages.map((apt, idx) => (
                    <GlassCard
                      key={apt._id}
                      className="p-8 group"
                    >
                      <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100">
                            <MessageSquare size={24} />
                          </div>
                          <div>
                            <p className="text-lg font-black text-medigo-navy tracking-tight">{apt.patientName || 'Patient'}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                              <Clock size={12} className="text-teal-400" /> 
                              {apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                            </p>
                          </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${
                          apt.status === 'confirmed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          apt.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>{apt.status}</div>
                      </div>

                      <div className="bg-slate-50/50 border border-slate-100 rounded-[1.5rem] p-6 relative group-hover:bg-white transition-colors">
                        <p className="text-sm font-bold text-medigo-navy leading-relaxed italic">"{apt.reason}"</p>
                      </div>

                      <div className="mt-8 flex items-center gap-4 text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
                        <span className="flex items-center gap-2"><Stethoscope size={12} className="text-teal-500" /> {apt.specialty || 'General'}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="flex items-center gap-2"><Clock size={12} className="text-teal-500" /> {apt.timeSlot || '—'}</span>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Upload Modal ── */}
      <AnimatePresence>
        {showUpload && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowUpload(false)}
              className="absolute inset-0 bg-medigo-navy/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10 lg:p-14">
                <AnimatePresence>
                  {uploadSuccess && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 bg-white rounded-[3rem] flex flex-col items-center justify-center gap-6 z-10"
                    >
                      <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                        <CheckCircle2 size={48} className="text-emerald-500" />
                      </div>
                      <div className="text-center space-y-2">
                         <p className="text-3xl font-black text-medigo-navy tracking-tight">File Dispatched</p>
                         <p className="text-slate-400 text-sm font-medium">The document is now available in the patient's vault.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between mb-12">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black text-medigo-navy tracking-tight leading-none">Send Document</h2>
                    <p className="text-slate-400 text-sm font-medium">Securely share clinical records with patients.</p>
                  </div>
                  <button onClick={() => setShowUpload(false)} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-50 hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100 shadow-sm">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleUpload} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assign to Patient</label>
                    <select
                      required
                      className="w-full h-16 bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm font-bold text-medigo-navy outline-none focus:bg-white focus:border-medigo-blue transition-all shadow-inner"
                      value={uploadForm.patientId}
                      onChange={e => setUploadForm({ ...uploadForm, patientId: e.target.value })}
                    >
                      <option value="">Select a patient…</option>
                      {uniquePatients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Document Title</label>
                    <input
                      type="text" required placeholder="e.g. Lab Report - Q1"
                      className="w-full h-16 bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm font-bold text-medigo-navy outline-none focus:bg-white focus:border-medigo-blue transition-all shadow-inner"
                      value={uploadForm.title}
                      onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Type</label>
                      <select
                        className="w-full h-16 bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm font-bold text-medigo-navy outline-none focus:bg-white focus:border-medigo-blue transition-all shadow-inner"
                        value={uploadForm.type}
                        onChange={e => setUploadForm({ ...uploadForm, type: e.target.value })}
                      >
                        <option value="Prescription">Prescription</option>
                        <option value="Lab Order">Lab Order</option>
                        <option value="Diagnosis">Diagnosis</option>
                        <option value="Report">Report</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Attachment</label>
                      <input type="file" required accept=".pdf,.jpg,.jpeg,.png" className="hidden" id="doc-file-up"
                        onChange={e => setUploadForm({ ...uploadForm, file: e.target.files[0] })} />
                      <label htmlFor="doc-file-up"
                        className="w-full h-16 bg-slate-900 text-white rounded-2xl px-6 flex items-center justify-between text-xs font-black cursor-pointer hover:bg-black transition-all shadow-lg active:scale-95">
                        <span className="truncate">{uploadForm.file ? uploadForm.file.name : 'Choose File'}</span>
                        <Paperclip size={18} className="shrink-0" />
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button type="button" onClick={() => setShowUpload(false)}
                      className="flex-1 h-16 rounded-2xl border-2 border-slate-100 text-xs font-black text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest">
                      Discard
                    </button>
                    <button type="submit" disabled={uploading}
                      className="flex-[2] h-16 rounded-2xl bg-medigo-navy text-white font-black text-xs uppercase tracking-[0.2em] shadow-premium hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                      {uploading ? 'Encrypting…' : <><Send size={18} /> Send Vault</>}
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