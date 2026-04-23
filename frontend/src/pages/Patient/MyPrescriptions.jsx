import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Pill, Calendar, User, ChevronDown,
  ChevronUp, AlertCircle, Search, RefreshCw,
  ClipboardList, FileText
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { prescriptionAPI } from '../../services/api'
import DashboardLayout from '../../components/DashboardLayout'

function PrescriptionCard({ rx }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      layout
      className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-premium transition-all"
    >
      <button
        className="w-full flex items-center justify-between p-6 sm:p-8 text-left group"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
            <Pill size={24} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-medigo-navy tracking-tight">{rx.diagnosis}</h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <User size={12} /> Dr. {rx.doctorName || 'Doctor'}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <Calendar size={12} /> {rx.issuedDate || new Date(rx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                {rx.medicines?.length || 0} Medicine{rx.medicines?.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
        <div className="text-slate-400 shrink-0 ml-4">
          {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-slate-50 px-6 sm:px-8 pb-6 sm:pb-8 pt-6 space-y-6"
        >
          {/* Medicines Table */}
          {rx.medicines?.length > 0 && (
            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Prescribed Medicines</h4>
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
                    {rx.medicines.map((med, i) => (
                      <tr key={i} className="bg-white hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5 text-sm font-bold text-medigo-navy">{med.name}</td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-slate-600">{med.dosage}</td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-slate-600">{med.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes */}
          {rx.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
              <h4 className="text-xs font-black text-amber-700 uppercase tracking-widest mb-2">Doctor's Notes</h4>
              <p className="text-sm font-medium text-amber-800 leading-relaxed">{rx.notes}</p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

export default function MyPrescriptions() {
  const { user } = useAuth()
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetch = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const res = await prescriptionAPI.getByPatient(user.id)
      setPrescriptions(res.data.data || res.data || [])
    } catch {
      setPrescriptions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [user?.id])

  const filtered = prescriptions.filter(rx =>
    rx.diagnosis?.toLowerCase().includes(search.toLowerCase()) ||
    rx.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
    rx.medicines?.some(m => m.name?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <DashboardLayout isPatient>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-medigo-navy tracking-tight">My Prescriptions</h1>
            <p className="text-slate-500 font-medium">View all prescriptions issued by your doctors.</p>
          </div>
          <button
            onClick={fetch}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-sm font-bold text-slate-500 hover:border-medigo-blue hover:text-medigo-blue shadow-sm transition-all"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* Stats + Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex-1 grid grid-cols-2 gap-4">
            {[
              { label: 'Total Prescriptions', val: prescriptions.length, icon: ClipboardList, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
              { label: 'Total Medicines', val: prescriptions.reduce((s, r) => s + (r.medicines?.length || 0), 0), icon: Pill, color: 'text-medigo-blue bg-blue-50 border-blue-100' },
            ].map((s, i) => (
              <div key={i} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-sm ${s.color}`}>
                  <s.icon size={20} />
                </div>
                <div>
                  <p className="text-xl font-black text-medigo-navy leading-none tracking-tight">{s.val}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative sm:w-72 group">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-medigo-blue transition-colors" />
            <input
              placeholder="Search diagnosis or medicine..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-medium focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/5 outline-none transition-all shadow-sm"
            />
          </div>
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
              <p className="text-lg font-bold text-slate-400">No prescriptions found</p>
              <p className="text-sm text-slate-300">Prescriptions from your doctors will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(rx => (
              <PrescriptionCard key={rx._id} rx={rx} />
            ))}
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-6 rounded-[2rem] flex items-start gap-5">
          <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <FileText size={20} />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-medigo-navy">Keep your prescriptions safe</h4>
            <p className="text-sm font-medium text-slate-500 mt-1 leading-relaxed">
              These prescriptions are issued by your verified doctors. Always follow the prescribed dosage and consult your doctor before making any changes.
            </p>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}
