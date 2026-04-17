import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
   Building2, CheckCircle2, XCircle,
   Eye, Search, Loader2, Clock,
   Check, AlertCircle, RefreshCw
} from "lucide-react";
import { paymentAPI } from "../../services/api";
import DashboardLayout from "../../components/DashboardLayout";

const AdminPayments = () => {
   const [payments, setPayments] = useState([])
   const [loading, setLoading] = useState(true)
   const [search, setSearch] = useState("")
   const [selectedSlip, setSelectedSlip] = useState(null)
   const [processing, setProcessing] = useState(null)

   // ✅ Reject reason modal state
   const [rejectTarget, setRejectTarget] = useState(null)
   const [rejectReason, setRejectReason] = useState("")
   const [rejectError, setRejectError] = useState("")

   const fetchPending = async () => {
      setLoading(true)
      try {
         // ✅ FIX: correct method name
         const { data } = await paymentAPI.getPendingTransfers()
         setPayments(data.payments || [])
      } catch (err) {
         console.error("Failed to fetch pending payments", err)
      } finally {
         setLoading(false)
      }
   }

   useEffect(() => { fetchPending() }, [])

   const handleApprove = async (id) => {
      setProcessing(id)
      try {
         await paymentAPI.approve(id)
         setPayments(prev => prev.filter(p => p._id !== id))
         setSelectedSlip(null)
      } catch (err) {
         alert("Approval failed: " + (err.response?.data?.message || err.message))
      } finally {
         setProcessing(null)
      }
   }

   // ✅ FIX: reject with reason modal
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
         setPayments(prev => prev.filter(p => p._id !== rejectTarget._id))
         setRejectTarget(null)
         setRejectReason("")
      } catch (err) {
         setRejectError("Rejection failed: " + (err.response?.data?.message || err.message))
      } finally {
         setProcessing(null)
      }
   }

   const filtered = payments.filter(p =>
      p.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      p.invoiceNumber?.toLowerCase().includes(search.toLowerCase())
   )

   return (
      <DashboardLayout isAdmin={true}>
         <div className="max-w-7xl mx-auto space-y-8 pb-20">

            {/* Header */}
            <div className="flex items-center justify-between">
               <div>
                  <h1 className="text-3xl font-black text-medigo-navy tracking-tight italic">
                     Bank Transfer Approvals
                  </h1>
                  <p className="text-slate-500 font-medium mt-1">
                     Verify and authorize manual payment slips from patients.
                  </p>
               </div>
               <button
                  onClick={fetchPending}
                  className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-medigo-blue hover:border-medigo-blue transition-all shadow-sm"
               >
                  <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
               </button>
            </div>

            {/* Search */}
            <div className="relative">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
               <input
                  type="text"
                  placeholder="Search by patient name or invoice..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[2rem] shadow-sm focus:outline-none focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/5 transition-all font-medium text-medigo-navy"
               />
            </div>

            {/* Content */}
            {loading ? (
               <div className="flex justify-center items-center py-32">
                  <Loader2 className="animate-spin text-medigo-blue w-12 h-12" />
               </div>
            ) : filtered.length === 0 ? (
               <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                  <Building2 className="w-20 h-20 text-slate-100 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-400">No Pending Approvals</h3>
                  <p className="text-slate-300 text-sm mt-2">All bank transfers have been reviewed.</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AnimatePresence mode="popLayout">
                     {filtered.map(p => (
                        <motion.div
                           key={p._id}
                           layout
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, scale: 0.95 }}
                           className="bg-white rounded-[2.5rem] p-8 shadow-premium border border-slate-100 flex flex-col md:flex-row gap-6 items-center"
                        >
                           {/* Slip Preview */}
                           <div
                              className="relative group w-36 h-36 shrink-0 cursor-pointer"
                              onClick={() => setSelectedSlip(p)}
                           >
                              <img
                                 src={`http://localhost:5007${p.paymentSlipUrl}`}
                                 alt="Slip"
                                 className="w-full h-full object-cover rounded-2xl shadow-md border border-slate-100 group-hover:opacity-70 transition"
                              />
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
                                    <p className="text-xs font-black text-medigo-blue uppercase tracking-widest mt-0.5">
                                       {p.invoiceNumber}
                                    </p>
                                 </div>
                                 <div className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shrink-0">
                                    <Clock className="w-3 h-3" /> Pending
                                 </div>
                              </div>

                              <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                                 <div className="flex justify-between text-xs">
                                    <span className="text-slate-400 font-bold">Amount</span>
                                    <span className="text-medigo-navy font-black">
                                       LKR {p.amount?.toLocaleString()}
                                    </span>
                                 </div>
                                 <div className="flex justify-between text-xs">
                                    <span className="text-slate-400 font-bold">Reference</span>
                                    <span className="text-medigo-navy font-mono font-bold">
                                       {p.transferReference || "N/A"}
                                    </span>
                                 </div>
                                 <div className="flex justify-between text-xs">
                                    <span className="text-slate-400 font-bold">Submitted</span>
                                    <span className="text-medigo-navy font-bold">
                                       {new Date(p.createdAt).toLocaleDateString()}
                                    </span>
                                 </div>
                              </div>

                              <div className="flex gap-3">
                                 {/* ✅ Approve */}
                                 <button
                                    onClick={() => handleApprove(p._id)}
                                    disabled={processing === p._id}
                                    className="flex-1 bg-emerald-500 text-white py-3 rounded-2xl font-black hover:bg-emerald-600 transition flex items-center justify-center gap-2 text-sm disabled:opacity-60"
                                 >
                                    {processing === p._id
                                       ? <Loader2 className="animate-spin w-4 h-4" />
                                       : <Check className="w-4 h-4" />
                                    }
                                    Approve
                                 </button>
                                 {/* ✅ Reject — opens modal */}
                                 <button
                                    onClick={() => openRejectModal(p)}
                                    disabled={processing === p._id}
                                    className="flex-1 bg-red-50 text-red-500 border border-red-100 py-3 rounded-2xl font-black hover:bg-red-100 transition flex items-center justify-center gap-2 text-sm disabled:opacity-60"
                                 >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                 </button>
                              </div>
                           </div>
                        </motion.div>
                     ))}
                  </AnimatePresence>
               </div>
            )}
         </div>

         {/* ── Slip Viewer Modal ─────────────────────────────── */}
         <AnimatePresence>
            {selectedSlip && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
                  onClick={() => setSelectedSlip(null)}
               >
                  <motion.div
                     initial={{ scale: 0.9, y: 20 }}
                     animate={{ scale: 1, y: 0 }}
                     className="relative max-w-3xl w-full bg-white rounded-[2.5rem] overflow-hidden"
                     onClick={e => e.stopPropagation()}
                  >
                     <div className="max-h-[60vh] overflow-hidden bg-slate-900 flex items-center justify-center">
                        <img
                           src={`http://localhost:5007${selectedSlip.paymentSlipUrl}`}
                           className="w-full object-contain max-h-[60vh]"
                           alt="Payment Slip"
                        />
                     </div>

                     <div className="p-8 border-t border-slate-100">
                        <div className="flex items-start justify-between mb-6">
                           <div>
                              <h3 className="text-xl font-black text-medigo-navy">{selectedSlip.patientName}</h3>
                              <p className="text-slate-400 text-sm mt-1">
                                 {selectedSlip.invoiceNumber} · Submitted {new Date(selectedSlip.createdAt).toLocaleString()}
                              </p>
                           </div>
                           <div className="text-right">
                              <p className="text-xs text-slate-400 font-bold">Amount</p>
                              <p className="text-2xl font-black text-medigo-navy">
                                 LKR {selectedSlip.amount?.toLocaleString()}
                              </p>
                           </div>
                        </div>

                        <div className="flex gap-4">
                           {/* ✅ Approve from modal */}
                           <button
                              onClick={() => handleApprove(selectedSlip._id)}
                              disabled={processing === selectedSlip._id}
                              className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl font-black hover:bg-emerald-600 transition flex items-center justify-center gap-2 disabled:opacity-60"
                           >
                              {processing === selectedSlip._id
                                 ? <Loader2 className="animate-spin w-4 h-4" />
                                 : <CheckCircle2 className="w-4 h-4" />
                              }
                              Confirm & Approve
                           </button>
                           {/* ✅ Reject from modal */}
                           <button
                              onClick={() => openRejectModal(selectedSlip)}
                              className="flex-1 bg-red-50 text-red-500 border border-red-100 py-4 rounded-2xl font-black hover:bg-red-100 transition flex items-center justify-center gap-2"
                           >
                              <XCircle className="w-4 h-4" /> Reject Slip
                           </button>
                           <button
                              onClick={() => setSelectedSlip(null)}
                              className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition"
                           >
                              Close
                           </button>
                        </div>
                     </div>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* ── Reject Reason Modal ───────────────────────────── */}
         <AnimatePresence>
            {rejectTarget && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-lg flex items-center justify-center p-4"
                  onClick={() => setRejectTarget(null)}
               >
                  <motion.div
                     initial={{ scale: 0.9, y: 20 }}
                     animate={{ scale: 1, y: 0 }}
                     exit={{ scale: 0.9, y: 20 }}
                     className="bg-white rounded-[2.5rem] p-10 max-w-md w-full space-y-6 shadow-2xl"
                     onClick={e => e.stopPropagation()}
                  >
                     {/* Header */}
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-red-500">
                           <XCircle size={28} />
                        </div>
                        <div>
                           <h3 className="text-xl font-black text-medigo-navy leading-none">
                              Reject Payment
                           </h3>
                           <p className="text-sm text-slate-400 font-medium mt-1">
                              {rejectTarget.patientName} · {rejectTarget.invoiceNumber}
                           </p>
                        </div>
                     </div>

                     {/* Reason presets */}
                     <div className="space-y-2">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                           Quick Reason
                        </p>
                        <div className="flex flex-wrap gap-2">
                           {[
                              'Invalid slip image',
                              'Amount mismatch',
                              'Unreadable slip',
                              'Wrong account transfer',
                              'Duplicate submission',
                           ].map(reason => (
                              <button
                                 key={reason}
                                 onClick={() => setRejectReason(reason)}
                                 className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${rejectReason === reason
                                       ? 'bg-red-500 text-white border-red-500'
                                       : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-red-200 hover:text-red-500'
                                    }`}
                              >
                                 {reason}
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* Custom reason textarea */}
                     <div className="space-y-2">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                           Rejection Reason
                        </p>
                        <textarea
                           rows={3}
                           placeholder="Describe why this payment slip is being rejected..."
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

                     {/* Note — notification will be sent */}
                     <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                        <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs font-bold text-amber-700 leading-relaxed">
                           Patient will receive an email notification with this rejection reason and can resubmit their payment.
                        </p>
                     </div>

                     {/* Actions */}
                     <div className="flex gap-4">
                        <button
                           onClick={handleRejectConfirm}
                           disabled={processing === rejectTarget._id}
                           className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-black hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                           {processing === rejectTarget._id
                              ? <Loader2 className="animate-spin w-4 h-4" />
                              : <XCircle className="w-4 h-4" />
                           }
                           Confirm Rejection
                        </button>
                        <button
                           onClick={() => setRejectTarget(null)}
                           className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition"
                        >
                           Cancel
                        </button>
                     </div>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>
      </DashboardLayout>
   )
}

export default AdminPayments