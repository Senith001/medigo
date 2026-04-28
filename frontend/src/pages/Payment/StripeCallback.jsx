import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, ArrowRight, Download } from "lucide-react";
import { paymentAPI } from "../../services/api";

const StripeCallback = ({ status }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState(null);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const verifyPayment = async () => {
      if (status === "cancel") {
        setLoading(false);
        return;
      }

      try {
        const { data } = await paymentAPI.approve(sessionId); // Assuming success is autoverified
        setPayment(data.payment);
      } catch (err) {
        setError("We couldn't verify your payment. Please contact support.");
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) verifyPayment();
    else {
      setLoading(false);
      if (status === "success") setError("Missing transaction session ID.");
    }
  }, [sessionId, status]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-16 h-16 text-teal-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Verifying Transaction...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl max-w-lg w-full text-center border border-slate-100"
      >
        {status === "success" && !error ? (
          <>
            <div className="w-24 h-24 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Payment Successful!</h2>
            <p className="text-slate-600 mb-10 leading-relaxed">
              Your consultation is now confirmed. We've sent the receipt to your email. You can now access your doctor's schedule or wait for the appointment.
            </p>
            
            <div className="bg-slate-50 rounded-3xl p-6 mb-10 text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Invoice No</span>
                <span className="text-slate-900 font-bold">{payment?.invoiceNumber || "N/A"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Status</span>
                <span className="text-teal-600 font-bold uppercase tracking-wide">Paid</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => navigate("/dashboard")}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Download Receipt
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <XCircle className="w-12 h-12" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
              {status === "cancel" ? "Payment Cancelled" : "Payment Failed"}
            </h2>
            <p className="text-slate-600 mb-10 leading-relaxed">
              {error || "The transaction was not completed. No funds were debited from your account. You can try again whenever you're ready."}
            </p>
            
            <button 
              onClick={() => navigate("/dashboard")}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition shadow-xl"
            >
              Back to Appointments
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default StripeCallback;
