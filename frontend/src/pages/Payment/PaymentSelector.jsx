import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck,
  AlertCircle,
  Loader2
} from "lucide-react";
import { appointmentAPI, paymentAPI } from "../../services/api";

const PaymentSelector = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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
        setError("Could not find appointment details.");
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
          amount: appointment.fee || 2500, // Fixed fee for demo if missing
        });
        window.location.href = data.checkoutUrl;
      } else {
        navigate(`/payment/bank-transfer/${appointmentId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Payment initiation failed.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Appointment Not Found</h2>
        <p className="text-slate-600 mt-2">The appointment you are trying to pay for does not exist.</p>
        <button 
          onClick={() => navigate("/dashboard")}
          className="mt-6 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
        >
          Go Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            Complete Your Payment
          </motion.h1>
          <p className="text-slate-600 mt-3 text-lg">Securely finalize your appointment with Dr. {appointment.doctorName}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Summary Card */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-4">Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Service</span>
                  <span className="font-semibold text-slate-900">Consultation</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Date</span>
                  <span className="font-semibold text-slate-900">{appointment.date}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Time</span>
                  <span className="font-semibold text-slate-900">{appointment.timeSlot}</span>
                </div>
                <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-lg font-bold">
                  <span className="text-slate-900 text-base">Total Amount</span>
                  <span className="text-teal-600">LKR {appointment.fee || 2500}.00</span>
                </div>
              </div>

              <div className="mt-8 p-4 bg-slate-50 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your payment is protected by industry-standard encryption. Medigo never stores your card details.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div 
                onClick={() => setMethod("stripe")}
                className={`group relative overflow-hidden bg-white p-6 rounded-3xl border-2 transition-all cursor-pointer ${
                  method === "stripe" ? "border-teal-600 ring-4 ring-teal-50" : "border-slate-100 hover:border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl transition-colors ${method === "stripe" ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Stripe Online Payment</h3>
                      <p className="text-sm text-slate-500">Credit or Debit Card (Immediate Confirmation)</p>
                    </div>
                  </div>
                  {method === "stripe" && <CheckCircle2 className="text-teal-600 w-6 h-6" />}
                </div>
              </div>

              <div 
                onClick={() => setMethod("bank")}
                className={`group relative overflow-hidden bg-white p-6 rounded-3xl border-2 transition-all cursor-pointer ${
                  method === "bank" ? "border-teal-600 ring-4 ring-teal-50" : "border-slate-100 hover:border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl transition-colors ${method === "bank" ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Manual Bank Transfer</h3>
                      <p className="text-sm text-slate-500">Upload deposit slip (Manual Verification)</p>
                    </div>
                  </div>
                  {method === "bank" && <CheckCircle2 className="text-teal-600 w-6 h-6" />}
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              <button
                disabled={processing}
                onClick={handlePayment}
                className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-3xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
              >
                {processing ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    Proceed to {method === "stripe" ? "Secure Checkout" : "Transfer Details"}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSelector;
