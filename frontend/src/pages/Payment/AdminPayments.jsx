import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  ExternalLink, 
  Search, 
  Filter,
  Loader2,
  AlertCircle,
  FileText,
  Clock,
  Check
} from "lucide-react";
import { paymentAPI } from "../../services/api";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [processing, setProcessing] = useState(null);

  const fetchPending = async () => {
    try {
      const { data } = await paymentAPI.getPending();
      setPayments(data.payments || []);
    } catch (err) {
      console.error("Failed to fetch pending payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    setProcessing(id);
    try {
      await paymentAPI.approve(id);
      setPayments(payments.filter(p => p._id !== id));
      setSelectedSlip(null);
    } catch (err) {
      alert("Approval failed");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id, reason) => {
    setProcessing(id);
    try {
      await paymentAPI.reject(id, { rejectionReason: reason });
      setPayments(payments.filter(p => p._id !== id));
      setSelectedSlip(null);
    } catch (err) {
      alert("Rejection failed");
    } finally {
      setProcessing(null);
    }
  };

  const filtered = payments.filter(p => 
    p.patientName.toLowerCase().includes(search.toLowerCase()) ||
    p.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-teal-600 w-12 h-12" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            Bank Transfer Approvals
          </motion.h1>
          <p className="text-slate-500 mt-2 text-lg">Verify and authorize manual payment slips from patients</p>
        </header>

        {/* Search */}
        <div className="bg-white p-4 rounded-[32px] shadow-sm border border-slate-100 mb-8 relative">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by patient name or invoice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/20 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, idx) => (
              <motion.div
                key={p._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row gap-8 items-center"
              >
                {/* Slip Preview Thumb */}
                <div className="relative group w-40 h-40 shrink-0">
                  <img 
                    src={`http://localhost:5007${p.paymentSlipUrl}`} 
                    alt="Slip" 
                    className="w-full h-full object-cover rounded-3xl shadow-lg border border-slate-100 group-hover:opacity-75 transition"
                  />
                  <button 
                    onClick={() => setSelectedSlip(p)}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <div className="bg-white p-3 rounded-full shadow-xl">
                      <Eye className="w-6 h-6 text-slate-900" />
                    </div>
                  </button>
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{p.patientName}</h3>
                      <p className="text-sm font-semibold text-teal-600 uppercase tracking-wider">{p.invoiceNumber}</p>
                    </div>
                    <div className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      Pending
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Total Amount</span>
                      <span className="text-slate-900 font-bold">LKR {p.amount}.00</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Reference</span>
                      <span className="text-slate-900 font-mono">{p.transferReference || "N/A"}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleApprove(p._id)}
                      disabled={processing === p._id}
                      className="flex-1 bg-teal-600 text-white py-3 rounded-2xl font-bold hover:bg-teal-700 transition flex items-center justify-center gap-2"
                    >
                      {processing === p._id ? <Loader2 className="animate-spin w-4 h-4" /> : <Check className="w-4 h-4" />}
                      Approve
                    </button>
                    <button 
                      onClick={() => handleReject(p._id, "Invalid slip image")}
                      className="flex-1 bg-slate-100 text-red-500 py-3 rounded-2xl font-bold hover:bg-red-50 transition flex items-center justify-center gap-2"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
            <Building2 className="w-20 h-20 text-slate-100 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400">No Pending Approvals</h3>
          </div>
        )}
      </div>

      {/* Slip Modal Viewer */}
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
              className="relative max-w-4xl w-full bg-white rounded-[40px] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="aspect-[4/5] md:aspect-video w-full">
                <img 
                  src={`http://localhost:5007${selectedSlip.paymentSlipUrl}`} 
                  className="w-full h-full object-contain bg-slate-900"
                />
              </div>
              <div className="p-8 flex items-center justify-between border-t border-slate-100">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{selectedSlip.patientName}</h3>
                  <p className="text-slate-500">Submitted on {new Date(selectedSlip.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleApprove(selectedSlip._id)}
                    className="px-8 py-3 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition"
                  >
                    Confirm & Approve
                  </button>
                  <button 
                    onClick={() => setSelectedSlip(null)}
                    className="px-8 py-3 bg-slate-100 text-slate-900 rounded-2xl font-bold hover:bg-slate-200 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPayments;
