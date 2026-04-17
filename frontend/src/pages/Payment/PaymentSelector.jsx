import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck,
  AlertCircle,
  Loader2,
  ChevronLeft,
  Calendar,
  Clock,
  User,
  Wallet
} from "lucide-react";
import { appointmentAPI, paymentAPI } from "../../services/api";
import DashboardLayout from "../../components/DashboardLayout";
import Button from "../../components/ui/Button";

const PaymentSelector = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState("stripe");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const { data } = await appointmentAPI.getById(appointmentId);
        setAppointment(data);
      } catch (err) {
        setError("Clinical Context Identification Failed. Please restart the reservation.");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [appointmentId]);

  const handlePayment = async () => {
    setProcessing(true);
    setError(null);
    try {
      if (method === "stripe") {
        const { data } = await paymentAPI.createSession({
          appointmentId: appointment._id,
          patientId: appointment.patientId,
          patientName: appointment.patientName,
          patientEmail: appointment.patientEmail,
          doctorId: appointment.doctorId,
          doctorName: appointment.doctorName,
          amount: appointment.fee || 2500,
          currency: 'LKR',
          successUrl: `${window.location.origin}/payment/success`,
          cancelUrl: `${window.location.origin}/payment/cancel`
        });
        
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          throw new Error("Stripe Authority Link not generated.");
        }
      } else {
        navigate(`/payment/bank-transfer/${appointmentId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Payment Protocol Interrupted.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout isPatient={true}>
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-medigo-blue animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Payment Gateway...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!appointment) {
    return (
      <DashboardLayout isPatient={true}>
        <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
          <AlertCircle className="w-16 h-16 text-red-500" />
          <h2 className="text-2xl font-black text-medigo-navy uppercase tracking-tighter italic">Appointment Not Found</h2>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout isPatient={true}>
      <div className="max-w-6xl mx-auto space-y-12 pb-20 font-inter">
        {/* Header */}
        <div className="space-y-4">
           <button 
             onClick={() => navigate(-1)}
             className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group hover:text-medigo-blue transition-colors"
           >
             <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
             Back to Reservation
           </button>
           <h1 className="text-4xl font-black text-medigo-navy tracking-tighter italic uppercase leading-none">Choose <span className="text-medigo-blue">Settlement</span> Method</h1>
           <p className="text-slate-500 font-medium">Verify your clinical authority and complete the transaction.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Summary Card */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 rounded-[3rem] text-white p-10 space-y-8 shadow-3xl shadow-slate-900/40 relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(37,99,235,0.15),transparent)]" />
               
               <div className="relative z-10 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] italic text-medigo-blue">Clinical Summary</h3>
                  <Wallet size={20} className="text-white/20" />
               </div>

               <div className="relative z-10 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                       <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-medigo-blue">
                          <User size={20} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Specialist</p>
                          <p className="text-sm font-bold truncate uppercase">{appointment.doctorName}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-medigo-blue">
                          <Calendar size={20} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">DateTime</p>
                          <p className="text-sm font-bold lowercase">{appointment.date} | {appointment.timeSlot}</p>
                       </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                     <p className="text-[10px] font-black text-medigo-blue uppercase tracking-widest italic leading-none mb-1">Authorization Amount</p>
                     <p className="text-3xl font-black text-white tracking-tighter italic leading-none">LKR <span className="text-medigo-blue">{(appointment.fee || 2500).toLocaleString()}</span></p>
                  </div>
               </div>
            </motion.div>
          </div>

          {/* Methods Selection */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Stripe Card */}
               <motion.div 
                 whileHover={{ scale: 1.02 }}
                 onClick={() => setMethod("stripe")}
                 className={`p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all relative overflow-hidden ${
                   method === "stripe" 
                    ? "bg-white border-medigo-blue shadow-premium" 
                    : "bg-slate-50 border-slate-100 hover:border-slate-300"
                 }`}
               >
                  <div className="flex justify-between items-start mb-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${method === "stripe" ? "bg-medigo-blue text-white shadow-lg shadow-blue-500/30" : "bg-slate-200 text-slate-500"}`}>
                       <CreditCard size={28} />
                    </div>
                    {method === "stripe" && <CheckCircle2 className="text-medigo-blue" size={24} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-medigo-navy uppercase tracking-tighter italic leading-none">Instant Checkout</h3>
                    <p className="text-xs text-slate-500 mt-2 font-medium">Credit / Debit Card Secured by Stripe.</p>
                  </div>
               </motion.div>

               {/* Bank Transfer Card */}
               <motion.div 
                 whileHover={{ scale: 1.02 }}
                 onClick={() => setMethod("bank")}
                 className={`p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all relative overflow-hidden ${
                   method === "bank" 
                    ? "bg-white border-medigo-blue shadow-premium" 
                    : "bg-slate-50 border-slate-100 hover:border-slate-300"
                 }`}
               >
                  <div className="flex justify-between items-start mb-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${method === "bank" ? "bg-medigo-blue text-white shadow-lg shadow-blue-500/30" : "bg-slate-200 text-slate-500"}`}>
                       <Building2 size={28} />
                    </div>
                    {method === "bank" && <CheckCircle2 className="text-medigo-blue" size={24} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-medigo-navy uppercase tracking-tighter italic leading-none">Bank Transfer</h3>
                    <p className="text-xs text-slate-500 mt-2 font-medium">Upload SLIP for Manual Verification.</p>
                  </div>
               </motion.div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 italic">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            <Button
              loading={processing}
              onClick={handlePayment}
              className="w-full h-16 text-lg bg-medigo-navy hover:bg-slate-800 shadow-2xl group"
            >
              Continue to {method === "stripe" ? "Secure Portal" : "Upload Slip"}
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <div className="flex items-center justify-center gap-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">
               <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-medigo-blue" /> PCI DSS Compliant
               </div>
               <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-medigo-blue" /> Secure Handoff
               </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PaymentSelector;
