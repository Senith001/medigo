import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Pill, Plus, Trash2, Edit2, X,
  CheckCircle2, AlertCircle, Search,
  User, Calendar, FileText, ChevronDown, ChevronUp,
  Sparkles, ArrowRight, Printer, Download, Filter, 
  Stethoscope, Clock, ShieldCheck, RefreshCw
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { prescriptionAPI } from '../../services/api'
import DashboardLayout from '../../components/DashboardLayout'
import Button from '../../components/ui/Button'

// --- Premium UI Components ---

const GlassCard = ({ children, className = "", hover = true }) => (
  <motion.div
    whileHover={hover ? { y: -5, transition: { duration: 0.2 } } : {}}
    className={`bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_15px_35px_rgba(0,0,0,0.03)] rounded-[2.5rem] overflow-hidden ${className}`}
  >
    {children}
  </motion.div>
)

const EMPTY_MED = { name: '', dosage: '', duration: '' }
const EMPTY_FORM = { patientId: '', diagnosis: '', notes: '', medicines: [{ ...EMPTY_MED }] }

function MedicineRow({ med, idx, onChange, onRemove, canRemove }) {
  return (
    <div className="grid grid-cols-12 gap-4 items-end bg-white/50 p-4 rounded-3xl border border-slate-100 group hover:border-blue-200 transition-all">
      <div className="col-span-5">
        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Medicine Name</label>
        <div className="relative">
           <Pill className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-medigo-blue transition-colors" size={14} />
           <input
             placeholder="e.g. Paracetamol"
             value={med.name}
             onChange={e => onChange(idx, 'name', e.target.value)}
             className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-medigo-navy focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
           />
        </div>
      </div>
      <div className="col-span-3">
        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Dosage</label>
        <input
          placeholder="e.g. 500mg"
          value={med.dosage}
          onChange={e => onChange(idx, 'dosage', e.target.value)}
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-medigo-navy focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
        />
      </div>
      <div className="col-span-3">
        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Duration</label>
        <input
          placeholder="e.g. 5 days"
          value={med.duration}
          onChange={e => onChange(idx, 'duration', e.target.value)}
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-medigo-navy focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
        />
      </div>
      <div className="col-span-1 flex justify-end">
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(idx)}
            className="w-11 h-11 rounded-2xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-sm active:scale-95"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

function PrescriptionCard({ rx, onDelete, onEdit }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div layout className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-premium transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-center p-6 sm:p-8 gap-6">
        <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner shrink-0">
          <Pill size={28} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
             <h3 className="text-xl font-black text-medigo-navy tracking-tight truncate">{rx.diagnosis}</h3>
             <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[9px] font-black uppercase tracking-widest">
                Active Cycle
             </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
            <span className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <User size={14} className="text-medigo-blue" /> <span className="text-slate-600">Patient: {rx.patientId}</span>
            </span>
            <span className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <Calendar size={14} className="text-indigo-400" /> <span className="text-slate-600">{rx.issuedDate || new Date(rx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </span>
            <span className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <Clock size={14} className="text-amber-400" /> <span className="text-slate-600">{rx.medicines?.length || 0} Prescribed Items</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
          <button
            onClick={() => onEdit(rx)}
            className="w-12 h-12 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-medigo-blue hover:border-medigo-blue hover:shadow-lg transition-all flex items-center justify-center group"
          >
            <Edit2 size={18} className="group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => onDelete(rx._id)}
            className="w-12 h-12 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 hover:shadow-lg transition-all flex items-center justify-center group"
          >
            <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => setOpen(v => !v)}
            className={`w-12 h-12 rounded-2xl transition-all flex items-center justify-center group shadow-sm ${
              open ? 'bg-medigo-navy text-white shadow-xl' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100'
            }`}
          >
            {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-50 bg-slate-50/30 px-8 pb-8 pt-6 space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-1.5 h-1.5 rounded-full bg-medigo-blue animate-pulse" />
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medical Prescriptions</h4>
                </div>
                <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                      <tr>
                        {['Medicine', 'Dosage', 'Duration'].map(h => (
                          <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {rx.medicines?.map((m, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-5">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-400 flex items-center justify-center">
                                   <Pill size={14} />
                                </div>
                                <span className="text-sm font-black text-medigo-navy">{m.name}</span>
                             </div>
                          </td>
                          <td className="px-6 py-5 text-sm font-bold text-slate-600">{m.dosage}</td>
                          <td className="px-6 py-5 text-sm font-bold text-slate-600">{m.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <FileText size={12} className="text-amber-500" /> Clinical Notes
                   </h4>
                   <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                      "{rx.notes || 'No clinical notes provided for this prescription.'}"
                   </p>
                </div>
                <div className="flex gap-3">
                   <button className="flex-1 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 shadow-lg">
                      <Printer size={14} /> Print
                   </button>
                   <button className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95">
                      <Download size={14} /> PDF
                   </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Prescriptions() {
  const { user } = useAuth()
  const location = useLocation()
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchAll = async () => {
    setLoading(true)
    try {
      const res = await prescriptionAPI.getAll()
      const all = Array.isArray(res.data.data) ? res.data.data : Array.isArray(res.data) ? res.data : []
      setPrescriptions(all)
    } catch {
      setPrescriptions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    fetchAll() 
    
    // Check if we came from Appointments with a patient
    if (location.state?.patientId) {
       setForm({ ...EMPTY_FORM, patientId: location.state.patientId })
       setShowForm(true)
    }
  }, [user?.doctorId, location.state])

  const openCreate = () => {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  const openEdit = (rx) => {
    setEditTarget(rx)
    setForm({
      patientId: rx.patientId || '',
      diagnosis: rx.diagnosis || '',
      notes: rx.notes || '',
      medicines: rx.medicines?.length ? rx.medicines.map(m => ({ name: m.name, dosage: m.dosage, duration: m.duration })) : [{ ...EMPTY_MED }],
    })
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  const handleMedChange = (idx, field, value) => {
    setForm(prev => {
      const meds = [...prev.medicines]
      meds[idx] = { ...meds[idx], [field]: value }
      return { ...prev, medicines: meds }
    })
  }

  const addMed = () => setForm(prev => ({ ...prev, medicines: [...prev.medicines, { ...EMPTY_MED }] }))
  const removeMed = (idx) => setForm(prev => ({ ...prev, medicines: prev.medicines.filter((_, i) => i !== idx) }))

  const validate = () => {
    if (!form.patientId.trim()) return 'Patient ID is required.'
    if (!form.diagnosis.trim()) return 'Diagnosis is required.'
    if (!form.medicines.length) return 'Add at least one medicine.'
    for (const m of form.medicines) {
      if (!m.name.trim() || !m.dosage.trim() || !m.duration.trim()) return 'Fill all medicine fields.'
    }
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setSaving(true)
    setError('')
    try {
      const payload = { ...form, doctorId: user?.doctorId }
      if (editTarget) {
        await prescriptionAPI.update(editTarget._id, payload)
        setSuccess('Clinical record updated.')
      } else {
        await prescriptionAPI.create(payload)
        setSuccess('New prescription deployed.')
      }
      setShowForm(false)
      setTimeout(() => setSuccess(''), 3000)
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sync record.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this prescription?')) return
    try {
      await prescriptionAPI.remove(id)
      fetchAll()
    } catch {
      alert('Failed to delete prescription.')
    }
  }

  const filtered = prescriptions.filter(rx =>
    rx.diagnosis?.toLowerCase().includes(search.toLowerCase()) ||
    rx.patientId?.toLowerCase().includes(search.toLowerCase()) ||
    rx.patientName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout isDoctor>
      <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-indigo-500/10 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                     <Sparkles size={12} /> Pharmacy Console
                  </div>
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
               </div>
               <h1 className="text-4xl lg:text-6xl font-black text-medigo-navy tracking-tighter leading-none">
                  Clinical <br />
                  <span className="text-medigo-blue">Prescriptions</span>
               </h1>
               <p className="text-slate-400 text-lg font-medium max-w-xl leading-relaxed">
                  Generate digital scripts and manage patient pharmacy cycles. All prescriptions are <span className="text-medigo-navy font-bold">automatically synchronized</span> with the patient vault.
               </p>
            </div>
            <div className="flex items-center gap-4 bg-white/50 backdrop-blur-xl p-3 rounded-[2rem] border border-white shadow-xl">
               <div className="relative group min-w-[280px]">
                 <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-medigo-blue transition-colors" />
                 <input
                   placeholder="Search diagnoses or patient IDs..."
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                   className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-medigo-navy focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                 />
               </div>
               <button 
                 onClick={openCreate}
                 className="px-8 py-4 bg-medigo-navy text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-premium hover:shadow-2xl transition-all active:scale-95 flex items-center gap-3 group"
               >
                 <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                 <span>Deploy Script</span>
               </button>
            </div>
          </div>

          {/* Success Toast */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-4 p-5 bg-emerald-500 text-white rounded-3xl shadow-xl shadow-emerald-500/20 text-sm font-black uppercase tracking-widest"
              >
                <ShieldCheck size={24} /> {success}
                <button onClick={() => setSuccess('')} className="ml-auto bg-white/20 p-1.5 rounded-lg hover:bg-white/30 transition-all"><X size={16} /></button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Active Scripts', val: prescriptions.length, icon: FileText, bg: 'bg-indigo-500/10', color: 'text-indigo-600', grad: 'from-indigo-500/5 to-transparent' },
              { label: 'Dispensed Units', val: prescriptions.reduce((s, r) => s + (r.medicines?.length || 0), 0), icon: Pill, bg: 'bg-blue-500/10', color: 'text-blue-600', grad: 'from-blue-500/5 to-transparent' },
              { label: 'Reach Rate', val: new Set(prescriptions.map(r => r.patientId).filter(Boolean)).size, icon: Stethoscope, bg: 'bg-emerald-500/10', color: 'text-emerald-600', grad: 'from-emerald-500/5 to-transparent' },
            ].map((s, i) => (
              <GlassCard key={i} className="p-8 relative group">
                <div className={`absolute inset-0 bg-gradient-to-br ${s.grad} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10 flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-2xl ${s.bg} border border-white flex items-center justify-center ${s.color} shadow-sm group-hover:rotate-6 transition-transform`}>
                    <s.icon size={28} />
                  </div>
                  <div>
                    <p className="text-4xl font-black text-medigo-navy tracking-tighter leading-none mb-1">{s.val}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* List Section */}
          {loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-28 bg-white/50 rounded-[2.5rem] border border-slate-100 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[3rem] border border-slate-100 shadow-premium p-24 text-center space-y-6"
            >
              <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto border border-slate-100">
                <Pill size={40} className="text-slate-200" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-medigo-navy tracking-tight">Empty Pharmacy Roster</h3>
                <p className="text-slate-400 font-medium max-w-xs mx-auto">Start by deploying your first clinical script for a patient.</p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {filtered.map(rx => (
                <PrescriptionCard key={rx._id} rx={rx} onDelete={handleDelete} onEdit={openEdit} />
              ))}
            </div>
          )}

          {/* Modal Overlay */}
          <AnimatePresence>
            {showForm && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowForm(false)}
                  className="fixed inset-0 bg-medigo-navy/40 backdrop-blur-md z-[60]"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 50 }}
                  className="fixed inset-x-4 top-10 bottom-10 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl z-[70] bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
                >
                  <div className="p-8 sm:p-12 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="flex items-center justify-between mb-12">
                      <div className="space-y-2">
                         <div className="px-3 py-1 bg-medigo-blue/10 rounded-full text-[9px] font-black text-medigo-blue uppercase tracking-widest inline-block mb-2">
                            {editTarget ? 'Edit Mode' : 'New Deployment'}
                         </div>
                         <h2 className="text-3xl font-black text-medigo-navy tracking-tight leading-none">
                           {editTarget ? 'Modify Prescription' : 'Clinical Scripting'}
                         </h2>
                         <p className="text-slate-400 text-sm font-medium">Configure medications and clinical directives.</p>
                      </div>
                      <button
                        onClick={() => setShowForm(false)}
                        className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all border border-slate-100 hover:border-red-100 shadow-sm"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Patient Identifier *</label>
                          <div className="relative group">
                             <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-medigo-blue transition-colors" size={18} />
                             <input
                               placeholder="Enter patient ID"
                               value={form.patientId}
                               onChange={e => setForm(p => ({ ...p, patientId: e.target.value }))}
                               className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-medigo-navy focus:bg-white focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-inner"
                             />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Primary Diagnosis *</label>
                          <div className="relative group">
                             <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-medigo-blue transition-colors" size={18} />
                             <input
                               placeholder="e.g. Hypertension"
                               value={form.diagnosis}
                               onChange={e => setForm(p => ({ ...p, diagnosis: e.target.value }))}
                               className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-medigo-navy focus:bg-white focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-inner"
                             />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                             Pharmacy Roster <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                          </label>
                          <button
                            type="button"
                            onClick={addMed}
                            className="flex items-center gap-2 text-[10px] font-black text-medigo-blue hover:text-medigo-navy transition-colors uppercase tracking-widest"
                          >
                            <Plus size={14} /> Add Medicine
                          </button>
                        </div>
                        <div className="space-y-4">
                          {form.medicines.map((med, idx) => (
                            <MedicineRow
                              key={idx}
                              med={med}
                              idx={idx}
                              onChange={handleMedChange}
                              onRemove={removeMed}
                              canRemove={form.medicines.length > 1}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Clinical Directives (Optional)</label>
                        <textarea
                          placeholder="e.g. Take after meals, avoid cold water..."
                          value={form.notes}
                          onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                          rows={4}
                          className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold text-medigo-navy focus:bg-white focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none shadow-inner"
                        />
                      </div>

                      {error && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 p-5 bg-red-50 border border-red-100 rounded-3xl text-red-600 text-xs font-black uppercase tracking-widest">
                          <AlertCircle size={20} /> {error}
                        </motion.div>
                      )}

                      <div className="flex gap-4 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowForm(false)}
                          className="flex-1 h-16 rounded-[1.5rem] border-2 border-slate-100 text-xs font-black text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-all uppercase tracking-widest"
                        >
                          Discard
                        </button>
                        <button 
                          type="submit" 
                          disabled={saving} 
                          className="flex-[2] h-16 bg-medigo-navy text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-premium hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                          {saving ? <RefreshCw className="animate-spin" size={20} /> : (
                            <>
                               <span>{editTarget ? 'Sync Record' : 'Deploy Script'}</span>
                               <ArrowRight size={18} />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}