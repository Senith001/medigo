import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Building2, CheckCircle2, XCircle,
  Eye, Search, Loader2, Clock,
  Check, AlertCircle, RefreshCw,
  History, Filter, ChevronDown
} from "lucide-react"
import { paymentAPI } from "../../services/api"
import { format } from "date-fns"

const STATUS_STYLES = {
  approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  rejected: 'bg-red-50 text-red-500 border-red-100',
  processing: 'bg-amber-50 text-amber-600 border-amber-100',
  paid: 'bg-blue-50 text-blue-600 border-blue-100',
  refunded: 'bg-slate-100 text-slate-500 border-slate-200',
}

const AdminPayments = () => {
  const [pending, setPending] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [tab, setTab] = useState('pending') // 'pending' | 'history'
  const [search, setSearch] = useState("")
  const [selectedSlip, setSelectedSlip] = useState(null)
  const [processing, setProcessing] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)
  const [rejectReason, setRejectReason] = useState("")
  const [rejectError, setRejectError] = useState("")
  const [historyFilter, setHistoryFilter] = useState('all') // all | approved | rejected

  // ── Fetch pending ────────────────────────────────────────────────────────
  const fetchPending = async () => {
    setLoading(true)
    try {
      const { data } = await paymentAPI.getPendingTransfers()
      setPending(data.payments || [])
    } catch (err) {
      console.error("Failed to fetch pending payments", err)
    } finally {
      setLoading(false)
    }
  }

  // ── Fetch history (all non-pending bank transfers) ────────────────────────
  const fetchHistory = async () => {
    setHistoryLoading(true)
    try {
      // We reuse getPendingTransfers as base; history is derived from appointments endpoint
      // Fallback: use getAllPayments if available, otherwise mock from pending endpoint
      const res = await paymentAPI.getAllPayments().catch(() => ({ data: { payments: [] } }))
      const all = res.data.payments || res.data.data || []
      // Show all payment types that are NOT processing/pending
      setHistory(all.filter(p =>
        p.paymentStatus !== 'processing' && p.paymentStatus !== 'pending'
      ))
    } catch (err) {
      console.error("Failed to fetch payment history", err)
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    fetchPending()
    fetchHistory()
  }, [])

  // ── Approve ──────────────────────────────────────────────────────────────
  const handleApprove = async (id) => {
    setProcessing(id)
    try {
      await paymentAPI.approve(id)
      setPending(prev => {
        const approved = prev.find(p => p._id === id)
        if (approved) setHistory(h => [{ ...approved, paymentStatus: 'approved', resolvedAt: new Date().toISOString() }, ...h])
        return prev.filter(p => p._id !== id)
      })
      setSelectedSlip(null)
    } catch (err) {
      alert("Approval failed: " + (err.response?.data?.message || err.message))
    } finally {
      setProcessing(null)
    }
  }

  // ── Reject ───────────────────────────────────────────────────────────────
  const openRejectModal = (payment) => {
    setRejectTarget(payment)
    setRejectReason("")
    setRejectError("")
    setSelectedSlip(null)
  }

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      setRejectError("Please provide a rejection reason.")
      return
    }
    setProcessing(rejectTarget._id)
    try {
      await paymentAPI.reject(rejectTarget._id, { rejectionReason: rejectReason.trim() })
      setPending(prev => {
        const rejected = prev.find(p => p._id === rejectTarget._id)
        if (rejected) setHistory(h => [{ ...rejected, paymentStatus: 'rejected', rejectionReason: rejectReason.trim(), resolvedAt: new Date().toISOString() }, ...h])
        return prev.filter(p => p._id !== rejectTarget._id)
      })
      setRejectTarget(null)
      setRejectReason("")
    } catch (err) {
      setRejectError("Rejection failed: " + (err.response?.data?.message || err.message))
    } finally {
      setProcessing(null)
    }
  }

  // ── Filtered lists ───────────────────────────────────────────────────────
  const filteredPending = pending.filter(p =>
    p.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    p.invoiceNumber?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredHistory = history
    .filter(p => historyFilter === 'all' || p.paymentStatus === historyFilter)
    .filter(p =>
      p.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      p.invoiceNumber?.toLowerCase().includes(search.toLowerCase())
    )

  const totalApproved = history.filter(p => p.paymentStatus === 'approved').length
  const totalRejected = history.filter(p => p.paymentStatus === 'rejected').length
  const totalRevenue = history.filter(p => p.paymentStatus === 'approved').reduce((s, p) => s + (p.amount || 0), 0)

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-medigo-navy tracking-tight">
            Payment <span className="text-[#008080]">Approvals</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Verify bank transfers and review approval history.
          </p>
        </div>
        <button
          onClick={() => { fetchPending(); fetchHistory() }}
          className="self-start sm:self-auto flex items-center gap-2 px-5 py-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-[#008080] hover:border-[#008080]/30 transition-all shadow-sm text-sm font-bold"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', value: pending.length, color: 'text-amber-600 bg-amber-50 border-amber-100' },
          { label: 'Approved', value: totalApproved, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
          { label: 'Rejected', value: totalRejected, color: 'text-red-500 bg-red-50 border-red-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-5 flex items-center gap-4 ${s.color}`}>
            <div>
              <p className="text-3xl font-black leading-none">{s.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-70">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm w-fit">
        <button
          onClick={() => setTab('pending')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all ${
            tab === 'pending'
              ? 'bg-medigo-navy text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Clock size={15} />
          Pending
          {pending.length > 0 && (
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${tab === 'pending' ? 'bg-white/20' : 'bg-amber-100 text-amber-600'}`}>
              {pending.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('history')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all ${
            tab === 'history'
              ? 'bg-medigo-navy text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
          }`}
        >
          <History size={15} />
          Past Approvals
          {history.length > 0 && (
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${tab === 'history' ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
              {history.length}
            </span>
          )}
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by patient name or invoice..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[2rem] shadow-sm focus:outline-none focus:border-[#008080] focus:ring-4 focus:ring-teal-500/5 transition-all font-medium text-medigo-navy"
          />
        </div>
        {tab === 'history' && (
          <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-[2rem] px-4 py-2 shadow-sm">
            <Filter size={14} className="text-slate-400" />
            {['all', 'approved', 'rejected'].map(f => (
              <button
                key={f}
                onClick={() => setHistoryFilter(f)}
                className={`px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  historyFilter === f
                    ? 'bg-medigo-navy text-white'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── PENDING TAB ── */}
      {tab === 'pending' && (
        loading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="animate-spin text-[#008080] w-12 h-12" />
          </div>
        ) : filteredPending.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <CheckCircle2 className="w-16 h-16 text-emerald-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400">No Pending Approvals</h3>
            <p className="text-slate-300 text-sm mt-2">All bank transfers have been reviewed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredPending.map(p => (
                <PaymentCard
                  key={p._id}
                  p={p}
                  processing={processing}
                  onView={() => setSelectedSlip(p)}
                  onApprove={() => handleApprove(p._id)}
                  onReject={() => openRejectModal(p)}
                  isPending
                />
              ))}
            </AnimatePresence>
          </div>
        )
      )}

      {/* ── HISTORY TAB ── */}
      {tab === 'history' && (
        historyLoading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="animate-spin text-[#008080] w-12 h-12" />
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <History className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400">No Past Approvals</h3>
            <p className="text-slate-300 text-sm mt-2">Approved and rejected payments will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Revenue summary for approved */}
            {historyFilter !== 'rejected' && totalApproved > 0 && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-6 py-4 flex items-center justify-between">
                <p className="text-sm font-bold text-emerald-700">
                  <CheckCircle2 size={14} className="inline mr-2" />
                  {totalApproved} payments approved
                </p>
                <p className="text-lg font-black text-emerald-700">
                  LKR {totalRevenue.toLocaleString()}
                </p>
              </div>
            )}

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    {['Patient', 'Invoice', 'Amount', 'Method', 'Status', 'Submitted', 'Reason'].map(h => (
                      <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredHistory.map(p => (
                    <motion.tr
                      key={p._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-medigo-navy">{p.patientName || '—'}</p>
                        <p className="text-[10px] text-slate-400">{p.patientEmail || ''}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-[#008080] font-mono">{p.invoiceNumber || '—'}</td>
                      <td className="px-6 py-4 text-sm font-black text-medigo-navy">LKR {p.amount?.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-600">
                          {p.paymentMethod === 'stripe' ? '💳 Card' : '🏦 Bank Transfer'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${STATUS_STYLES[p.paymentStatus] || 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                          {p.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-500">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 max-w-[160px] truncate">
                        {p.rejectionReason || (p.paymentStatus === 'approved' || p.paymentStatus === 'paid' ? '✓ Confirmed' : '—')}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* ── Slip Viewer Modal ── */}
      <AnimatePresence>
        {selectedSlip && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
            onClick={() => setSelectedSlip(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="relative max-w-3xl w-full bg-white rounded-[2.5rem] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="max-h-[60vh] overflow-hidden bg-slate-900 flex items-center justify-center">
                <img src={selectedSlip.paymentSlipUrl} className="w-full object-contain max-h-[60vh]" alt="Payment Slip" />
              </div>
              <div className="p-8 border-t border-slate-100">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-black text-medigo-navy">{selectedSlip.patientName}</h3>
                    <p className="text-slate-400 text-sm mt-1">
                      {selectedSlip.invoiceNumber} · {new Date(selectedSlip.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-bold">Amount</p>
                    <p className="text-2xl font-black text-medigo-navy">LKR {selectedSlip.amount?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => handleApprove(selectedSlip._id)} disabled={processing === selectedSlip._id}
                    className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl font-black hover:bg-emerald-600 transition flex items-center justify-center gap-2 disabled:opacity-60">
                    {processing === selectedSlip._id ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    Confirm & Approve
                  </button>
                  <button onClick={() => openRejectModal(selectedSlip)}
                    className="flex-1 bg-red-50 text-red-500 border border-red-100 py-4 rounded-2xl font-black hover:bg-red-100 transition flex items-center justify-center gap-2">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <button onClick={() => setSelectedSlip(null)}
                    className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition">
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reject Modal ── */}
      <AnimatePresence>
        {rejectTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-lg flex items-center justify-center p-4"
            onClick={() => setRejectTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-[2.5rem] p-10 max-w-md w-full space-y-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-red-500">
                  <XCircle size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-medigo-navy leading-none">Reject Payment</h3>
                  <p className="text-sm text-slate-400 font-medium mt-1">
                    {rejectTarget.patientName} · {rejectTarget.invoiceNumber}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Quick Reason</p>
                <div className="flex flex-wrap gap-2">
                  {['Invalid slip image', 'Amount mismatch', 'Unreadable slip', 'Wrong account transfer', 'Duplicate submission'].map(r => (
                    <button key={r} onClick={() => setRejectReason(r)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${rejectReason === r
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-red-200 hover:text-red-500'
                      }`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Rejection Reason</p>
                <textarea rows={3} placeholder="Describe why this payment slip is being rejected..."
                  value={rejectReason}
                  onChange={e => { setRejectReason(e.target.value); setRejectError('') }}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-medigo-navy outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/5 transition-all resize-none"
                />
                {rejectError && (
                  <div className="flex items-center gap-2 text-red-500 text-xs font-bold">
                    <AlertCircle size={14} /> {rejectError}
                  </div>
                )}
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-amber-700 leading-relaxed">
                  Patient will receive an email notification with this rejection reason.
                </p>
              </div>

              <div className="flex gap-4">
                <button onClick={handleRejectConfirm} disabled={processing === rejectTarget._id}
                  className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-black hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-60">
                  {processing === rejectTarget._id ? <Loader2 className="animate-spin w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  Confirm Rejection
                </button>
                <button onClick={() => setRejectTarget(null)}
                  className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Payment Card (Pending) ──────────────────────────────────────────────────────
function PaymentCard({ p, processing, onView, onApprove, onReject }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-center"
    >
      {/* Slip Preview */}
      <div className="relative group w-36 h-36 shrink-0 cursor-pointer" onClick={onView}>
        <img src={p.paymentSlipUrl} alt="Slip"
          className="w-full h-full object-cover rounded-2xl shadow-md border border-slate-100 group-hover:opacity-70 transition" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
          <div className="bg-white p-2.5 rounded-full shadow-xl">
            <Eye className="w-5 h-5 text-slate-900" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 space-y-4 w-full min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <h3 className="text-lg font-black text-medigo-navy truncate">{p.patientName}</h3>
            <p className="text-xs font-black text-[#008080] uppercase tracking-widest mt-0.5">{p.invoiceNumber}</p>
          </div>
          <div className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shrink-0">
            <Clock className="w-3 h-3" /> Pending
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 font-bold">Amount</span>
            <span className="text-medigo-navy font-black">LKR {p.amount?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 font-bold">Reference</span>
            <span className="text-medigo-navy font-mono font-bold">{p.transferReference || "N/A"}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 font-bold">Submitted</span>
            <span className="text-medigo-navy font-bold">{new Date(p.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onApprove} disabled={processing === p._id}
            className="flex-1 bg-emerald-500 text-white py-3 rounded-2xl font-black hover:bg-emerald-600 transition flex items-center justify-center gap-2 text-sm disabled:opacity-60">
            {processing === p._id ? <Loader2 className="animate-spin w-4 h-4" /> : <Check className="w-4 h-4" />}
            Approve
          </button>
          <button onClick={onReject} disabled={processing === p._id}
            className="flex-1 bg-red-50 text-red-500 border border-red-100 py-3 rounded-2xl font-black hover:bg-red-100 transition flex items-center justify-center gap-2 text-sm disabled:opacity-60">
            <XCircle className="w-4 h-4" /> Reject
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default AdminPayments