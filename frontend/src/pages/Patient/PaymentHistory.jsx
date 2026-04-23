import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard, CheckCircle2, XCircle, Clock,
  RefreshCw, Receipt, Building2, AlertCircle,
  ArrowRight, Search
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { paymentAPI } from '../../services/api'
import DashboardLayout from '../../components/DashboardLayout'

const STATUS_STYLES = {
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  approved:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  pending:   'bg-amber-100 text-amber-700 border-amber-200',
  rejected:  'bg-red-100 text-red-700 border-red-200',
  refunded:  'bg-slate-100 text-slate-600 border-slate-200',
}

const STATUS_ICONS = {
  completed: CheckCircle2,
  approved:  CheckCircle2,
  pending:   Clock,
  rejected:  XCircle,
  refunded:  RefreshCw,
}

const METHOD_LABEL = {
  stripe:       'Card (Stripe)',
  bank_transfer: 'Bank Transfer',
  cash:         'Cash',
}

export default function PaymentHistory() {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!user?.id) return
    setLoading(true)
    paymentAPI.getByPatient(user.id)
      .then(res => setPayments(res.data.payments || res.data || []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false))
  }, [user?.id])

  const filtered = payments.filter(p => {
    const matchSearch =
      p.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      p.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
      String(p.amount || '').includes(search)
    const matchFilter = filter === 'all' || p.status === filter
    return matchSearch && matchFilter
  })

  const totalPaid = payments
    .filter(p => p.status === 'completed' || p.status === 'approved')
    .reduce((s, p) => s + (p.amount || 0), 0)

  return (
    <DashboardLayout isPatient>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-medigo-navy tracking-tight">Payment History</h1>
            <p className="text-slate-500 font-medium">Track all your consultation payments in one place.</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Payments', val: payments.length, icon: Receipt, color: 'text-medigo-blue bg-blue-50 border-blue-100' },
            { label: 'Total Spent', val: `Rs. ${totalPaid.toLocaleString()}`, icon: CreditCard, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
            { label: 'Pending Review', val: payments.filter(p => p.status === 'pending').length, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-100' },
          ].map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5"
            >
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

        {/* Table Section */}
        <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-medigo-blue rounded-xl">
                <Receipt size={22} />
              </div>
              <h2 className="text-xl font-extrabold text-medigo-navy tracking-tight">All Transactions</h2>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56 group">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-medigo-blue transition-colors" />
                <input
                  placeholder="Search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:bg-white focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                />
              </div>
              <div className="flex p-1 bg-slate-50 rounded-2xl">
                {['all', 'pending', 'approved', 'rejected'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                      filter === f ? 'bg-white text-medigo-blue shadow-md' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 space-y-5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-5 animate-pulse">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-2.5">
                      <div className="h-4 bg-slate-100 rounded-full w-1/3" />
                      <div className="h-3 bg-slate-100 rounded-full w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-20 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle size={32} className="text-slate-200" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-400">No payments found</p>
                  <p className="text-sm text-slate-300">Your payment history will appear here after booking.</p>
                </div>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50">
                    {['Invoice', 'Doctor', 'Amount', 'Method', 'Date', 'Status'].map(h => (
                      <th key={h} className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(p => {
                    const StatusIcon = STATUS_ICONS[p.status] || Clock
                    return (
                      <motion.tr layout key={p._id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-medigo-blue flex items-center justify-center shadow-sm">
                              {p.method === 'bank_transfer' ? <Building2 size={16} /> : <CreditCard size={16} />}
                            </div>
                            <span className="text-sm font-bold text-medigo-navy">
                              {p.invoiceNumber || `#${p._id?.slice(-6)}`}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm font-semibold text-slate-600">
                          {p.doctorName || '—'}
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm font-black text-medigo-navy">
                            Rs. {(p.amount || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-xs font-bold text-slate-500">
                            {METHOD_LABEL[p.method] || p.method || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-xs font-semibold text-slate-400">
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_STYLES[p.status] || STATUS_STYLES.pending}`}>
                            <StatusIcon size={12} />
                            {p.status}
                          </span>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Tip */}
        <div className="bg-gradient-to-br from-medigo-navy to-[#1e293b] p-6 sm:p-8 rounded-[2rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-medigo-blue/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <CreditCard size={26} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-black text-white">Bank Transfer Pending?</h3>
              <p className="text-slate-300 text-sm mt-1">Bank transfer payments are reviewed by our team within 24 hours. Once approved, your appointment will be confirmed.</p>
            </div>
            <div className="shrink-0">
              <div className="flex items-center gap-2 text-medigo-teal text-sm font-bold">
                Learn more <ArrowRight size={16} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}
