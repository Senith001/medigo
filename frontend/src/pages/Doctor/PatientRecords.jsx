import { useState, useEffect } from 'react'
import { 
  FileText, Search, Plus, Filter, 
  Download, Loader2, User, Calendar, 
  ExternalLink, ArrowRight, ShieldCheck,
  CheckCircle2, Clock, Share2, Paperclip,
  Stethoscope, Send
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
  const [showUpload, setShowUpload] = useState(false)
  const [appointments, setAppointments] = useState([])
  
  const [uploadForm, setUploadForm] = useState({
    patientId: '',
    patientName: '',
    title: '',
    type: 'Prescription',
    description: '',
    file: null
  })
  const [uploading, setUploading] = useState(false)

  const fetchClinicalData = async () => {
    if (!user?.doctorId) return
    try {
      setLoading(true)
      const [reportsRes, apptsRes] = await Promise.all([
        reportAPI.getByDoctor(user.doctorId),
        appointmentAPI.getAll({ doctorId: user.doctorId })
      ])
      
      if (reportsRes.data.success) setReports(reportsRes.data.data)
      if (apptsRes.data.success) {
        // Unique patients list from appointments
        const uniquePatients = []
        const seen = new Set()
        apptsRes.data.data.forEach(apt => {
          if (!seen.has(apt.patientId)) {
            seen.add(apt.patientId)
            uniquePatients.push({ id: apt.patientId, name: apt.patientName || 'Patient' })
          }
        })
        setAppointments(uniquePatients)
      }
    } catch (err) {
      console.error("Clinical Sync Error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClinicalData()
  }, [user])

  const filteredReports = reports.filter(r => 
    (r.reportTitle?.toLowerCase().includes(search.toLowerCase()) || 
     r.patientId?.toLowerCase().includes(search.toLowerCase()))
  )

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!uploadForm.file || !uploadForm.patientId) return alert("Please select a file and a patient.")
    
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
        setShowUpload(false)
        setUploadForm({ patientId: '', patientName: '', title: '', type: 'Prescription', description: '', file: null })
      }
    } catch (err) {
      alert("Analysis delivery failed: " + (err.response?.data?.message || err.message))
    } finally {
      setUploading(false)
    }
  }

  return (
    <DashboardLayout isDoctor={true}>
      <div className="max-w-6xl mx-auto space-y-8 pb-24 font-inter">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div className="space-y-1">
              <h1 className="text-3xl font-black text-medigo-navy tracking-tight uppercase italic font-display">Clinical <span className="text-medigo-blue">Repository</span></h1>
              <p className="text-slate-500 font-medium italic">Manage securely shared patient records and analysis delivery.</p>
           </div>
           
           <Button onClick={() => setShowUpload(true)} className="shadow-lg shadow-blue-500/10">
              <Plus size={18} className="mr-2" /> Dispatch Analysis
           </Button>
        </div>

        {/* Toolbar */}
        <section className="bg-white p-6 rounded-[2.5rem] shadow-premium border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
           <div className="relative flex-1 w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-medigo-blue transition-colors" size={18} />
              <input 
                 type="text" 
                 placeholder="Search by report title or patient ID..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full h-14 pl-12 pr-6 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:border-medigo-blue outline-none transition-all font-bold text-medigo-navy"
              />
           </div>
           <div className="px-6 py-2 bg-indigo-50 text-[10px] font-black text-indigo-600 uppercase tracking-widest rounded-xl border border-indigo-100 italic">
              Sovereign Clinical Access Active
           </div>
        </section>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {loading ? (
             [1,2,3].map(i => <div key={i} className="h-64 bg-white rounded-[3rem] border border-slate-100 animate-pulse" />)
           ) : filteredReports.length === 0 ? (
             <div className="col-span-full py-24 text-center space-y-6 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto">
                   <FileText size={48} />
                </div>
                <h3 className="text-xl font-black text-medigo-navy uppercase italic">No Clinical Documents</h3>
                <p className="text-slate-400 font-medium max-w-sm mx-auto italic">Patients who book sessions with you will be able to share their records here.</p>
             </div>
           ) : (
             filteredReports.map((report, idx) => (
               <motion.div
                 key={report._id}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: idx * 0.05 }}
                 className="bg-white rounded-[2.25rem] p-7 border border-slate-100 group hover:border-blue-100 hover:shadow-premium transition-all"
               >
                 <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner transition-all ${
                      report.uploadedBy === 'doctor' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-medigo-blue/5 text-medigo-blue border-blue-100'
                    }`}>
                       {report.uploadedBy === 'doctor' ? <Stethoscope size={28} /> : <FileText size={28} />}
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                      report.uploadedBy === 'doctor' ? 'bg-indigo-50 text-indigo-500 border-indigo-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'
                    }`}>
                       {report.uploadedBy === 'doctor' ? 'Dispatched' : 'Received'}
                    </span>
                 </div>

                 <div className="space-y-4">
                    <div>
                       <h4 className="text-lg font-black text-medigo-navy uppercase truncate italic">{report.reportTitle}</h4>
                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{report.reportType}</p>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase italic">
                       <User size={12} className="text-medigo-blue/50" /> ID: {report.patientId}
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex gap-3">
                       <Button 
                         variant="outline" 
                         className="flex-1 h-11 text-[10px] rounded-xl border-slate-200"
                         onClick={() => window.open(`http://localhost:5006${report.fileUrl}`, '_blank')}
                       >
                          <Download size={14} className="mr-2" /> Open
                       </Button>
                       <button className="w-11 h-11 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-medigo-blue transition-all border border-transparent hover:border-blue-100">
                          <ExternalLink size={16} />
                       </button>
                    </div>
                 </div>
               </motion.div>
             ))
           )}
        </div>

        {/* Dispatch Modal */}
        <AnimatePresence>
          {showUpload && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowUpload(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-3xl">
                <h2 className="text-2xl font-black text-medigo-navy uppercase tracking-tighter italic mb-8">Dispatch Clinical Document</h2>
                
                <form onSubmit={handleUpload} className="space-y-6 font-inter">
                   <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Assign to Patient</label>
                       <select 
                         required
                         className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-medigo-blue"
                         value={uploadForm.patientId}
                         onChange={e => setUploadForm({...uploadForm, patientId: e.target.value})}
                       >
                         <option value="">Search Patient Registry</option>
                         {appointments.map(p => <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>)}
                       </select>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Diagnostic Title</label>
                      <input 
                         type="text" required placeholder="e.g. Clinical Assessment Note"
                         className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-medigo-blue"
                         value={uploadForm.title}
                         onChange={e => setUploadForm({...uploadForm, title: e.target.value})}
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Type</label>
                         <select className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-medigo-blue"
                           value={uploadForm.type}
                           onChange={e => setUploadForm({...uploadForm, type: e.target.value})}
                         >
                           <option value="Prescription">Prescription</option>
                           <option value="Lab Order">Lab Order</option>
                           <option value="Diagnosis">Diagnosis</option>
                           <option value="Referral">Referral Letter</option>
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">File Payload</label>
                         <input type="file" required accept=".pdf,.jpg,.png" className="hidden" id="file-up" 
                           onChange={e => setUploadForm({...uploadForm, file: e.target.files[0]})}
                         />
                         <label htmlFor="file-up" className="w-full h-14 bg-slate-900 text-white rounded-2xl px-5 flex items-center justify-between text-xs font-black uppercase cursor-pointer hover:bg-medigo-navy transition-all">
                            {uploadForm.file ? uploadForm.file.name.slice(0, 15) + '...' : 'Attach Case File'} <Paperclip size={16} />
                         </label>
                      </div>
                   </div>

                   <div className="flex gap-4 pt-4">
                      <Button type="button" variant="outline" onClick={() => setShowUpload(false)} className="flex-1 h-14 rounded-2xl">Cancel</Button>
                      <Button type="submit" loading={uploading} className="flex-1 h-14 rounded-2xl bg-medigo-blue hover:bg-medigo-blue-dark shadow-xl shadow-blue-500/10">
                         Dispatch File <Send size={18} className="ml-2" />
                      </Button>
                   </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
