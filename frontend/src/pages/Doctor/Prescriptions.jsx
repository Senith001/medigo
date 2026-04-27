import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Pill, Plus, Trash2, Edit2, X,
  CheckCircle2, AlertCircle, Search,
  User, Calendar, FileText, ChevronDown, ChevronUp
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { prescriptionAPI } from '../../services/api'
import DashboardLayout from '../../components/DashboardLayout'
import Button from '../../components/ui/Button'

const EMPTY_MED = { name: '', dosage: '', duration: '' }
const EMPTY_FORM = { patientId: '', diagnosis: '', notes: '', medicines: [{ ...EMPTY_MED }] }

function MedicineRow({ med, idx, onChange, onRemove, canRemove }) {
  return (
    <div className="grid grid-cols-12 gap-3 items-end">
      <div className="col-span-5">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Medicine Name</label>
        <input
          placeholder="e.g. Paracetamol"
          value={med.name}
          onChange={e => onChange(idx, 'name', e.target.value)}
          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
        />
      </div>
      <div className="col-span-3">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Dosage</label>
        <input
          placeholder="e.g. 500mg"
          value={med.dosage}
          onChange={e => onChange(idx, 'dosage', e.target.value)}
          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
        />
      </div>
      <div className="col-span-3">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Duration</label>
        <input
          placeholder="e.g. 5 days"
          value={med.duration}
          onChange={e => onChange(idx, 'duration', e.target.value)}
          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
        />
      </div>
      <div className="col-span-1 flex justify-end pb-0.5">
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(idx)}
            className="w-10 h-10 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-all"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  )
}

function PrescriptionCard({ rx, onDelete, onEdit }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div layout className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-premium transition-all">
      <div className="flex items-center p-6 gap-5">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm shrink-0">
          <Pill size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-extrabold text-medigo-navy tracking-tight truncate">{rx.diagnosis}</h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <User size={11} /> Patient: {rx.patientId}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <Calendar size={11} /> {rx.issuedDate || new Date(rx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
              {rx.medicines?.length || 0} medicine{rx.medicines?.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onEdit(rx)}
            className="w-9 h-9 rounded-xl bg-blue-50 text-medigo-blue hover:bg-blue-100 flex items-center justify-center transition-all"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(rx._id)}
            className="w-9 h-9 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-all"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => setOpen(v => !v)}
            className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-all"
          >
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-slate-50 px-6 pb-6 pt-5 space-y-5"
        >
          {rx.medicines?.length > 0 && (
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Medicines</h4>
              <div className="overflow-hidden rounded-2xl border border-slate-100">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      {['Medicine', 'Dosage', 'Duration'].map(h => (
                        <th key={h} className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {rx.medicines.map((m, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5 text-sm font-bold text-medigo-navy">{m.name}</td>
                        <td className="px-5 py-3.5 text-sm text-slate-600">{m.dosage}</td>
                        <td className="px-5 py-3.5 text-sm text-slate-600">{m.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {rx.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
              <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1.5">Notes</h4>
              <p className="text-sm font-medium text-amber-800 leading-relaxed">{rx.notes}</p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

export default function Prescriptions() {
  const { user } = useAuth()
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
      const all = res.data.data || res.data || []
      setPrescriptions(all.filter(r => r.doctorId === user?.doctorId || !user?.doctorId || true))
    } catch {
      setPrescriptions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [user?.doctorId])

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
        setSuccess('Prescription updated successfully.')
      } else {
        await prescriptionAPI.create(payload)
        setSuccess('Prescription created successfully.')
      }
      setShowForm(false)
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save prescription.')
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
    rx.patientId?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout isDoctor>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-medigo-navy tracking-tight">Prescriptions</h1>
            <p className="text-slate-500 font-medium">Create and manage patient prescriptions.</p>
          </div>
          <Button onClick={openCreate} className="h-11 px-6 shadow-lg shadow-blue-500/10">
            <Plus size={16} className="mr-2" /> New Prescription
          </Button>
        </div>

        {/* Success Toast */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-sm font-bold"
            >
              <CheckCircle2 size={18} /> {success}
              <button onClick={() => setSuccess('')} className="ml-auto"><X size={16} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Prescriptions', val: prescriptions.length, icon: FileText, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
            { label: 'Total Medicines', val: prescriptions.reduce((s, r) => s + (r.medicines?.length || 0), 0), icon: Pill, color: 'text-medigo-blue bg-blue-50 border-blue-100' },
            { label: 'Unique Patients', val: new Set(prescriptions.map(r => r.patientId)).size, icon: User, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
          ].map((s, i) => (
            <motion.div key={i} whileHover={{ y: -4 }} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm ${s.color}`}>
                <s.icon size={24} />
              </div>
              <div>
                <p className="text-2xl font-black text-medigo-navy leading-none tracking-tight">{s.val}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="relative group max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-medigo-blue transition-colors" />
          <input
            placeholder="Search by diagnosis or patient ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-medium focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/5 outline-none transition-all shadow-sm"
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-6 animate-pulse flex items-center gap-5">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-slate-100 rounded-full w-1/3" />
                  <div className="h-3 bg-slate-100 rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={32} className="text-slate-200" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-400">No prescriptions yet</p>
              <p className="text-sm text-slate-300">Click "New Prescription" to create one.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(rx => (
              <PrescriptionCard key={rx._id} rx={rx} onDelete={handleDelete} onEdit={openEdit} />
            ))}
          </div>
        )}

        {/* Create / Edit Modal */}
        <AnimatePresence>
          {showForm && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowForm(false)}
                className="fixed inset-0 bg-medigo-navy/40 backdrop-blur-sm z-40"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-x-4 top-8 bottom-8 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl z-50 bg-white rounded-[2.5rem] shadow-2xl overflow-y-auto"
              >
                <div className="p-6 sm:p-8 space-y-6">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-extrabold text-medigo-navy tracking-tight">
                        {editTarget ? 'Edit Prescription' : 'New Prescription'}
                      </h2>
                      <p className="text-sm text-slate-400 font-medium mt-0.5">
                        {editTarget ? 'Update prescription details.' : 'Create a prescription for your patient.'}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowForm(false)}
                      className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-all"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Patient ID */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Patient ID *</label>
                      <input
                        placeholder="Enter patient ID"
                        value={form.patientId}
                        onChange={e => setForm(p => ({ ...p, patientId: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      />
                    </div>

                    {/* Diagnosis */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Diagnosis *</label>
                      <input
                        placeholder="Primary diagnosis"
                        value={form.diagnosis}
                        onChange={e => setForm(p => ({ ...p, diagnosis: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      />
                    </div>

                    {/* Medicines */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medicines *</label>
                        <button
                          type="button"
                          onClick={addMed}
                          className="flex items-center gap-1.5 text-xs font-black text-medigo-blue hover:underline"
                        >
                          <Plus size={13} /> Add Medicine
                        </button>
                      </div>
                      <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
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

                    {/* Notes */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Notes (Optional)</label>
                      <textarea
                        placeholder="Additional instructions or notes for the patient..."
                        value={form.notes}
                        onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                      />
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-bold">
                        <AlertCircle size={16} /> {error}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="flex-1 h-12 rounded-2xl border border-slate-200 text-sm font-bold text-slate-500 hover:border-slate-300 transition-all"
                      >
                        Cancel
                      </button>
                      <Button type="submit" loading={saving} className="flex-1 h-12">
                        {editTarget ? 'Update Prescription' : 'Create Prescription'}
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  )
}
