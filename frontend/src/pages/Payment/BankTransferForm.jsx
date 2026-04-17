import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Building2, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft,
  FileText,
  Copy,
  Info
} from "lucide-react";
import { appointmentAPI, paymentAPI } from "../../services/api";

const BankTransferForm = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState(null);
  const [success, setSuccess] = useState(false);

  const BANK_DETAILS = {
    bank: "Medigo Global Bank",
    accountName: "MEDIGO HEALTHCARE PVT LTD",
    accountNumber: "001-9238475-201",
    branch: "Colombo Main",
    ref: `REF-${appointmentId?.slice(-6).toUpperCase()}`
  };

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const { data } = await appointmentAPI.getById(appointmentId);
        setAppointment(data);
      } catch (err) {
        setMessage({ type: "error", text: "Appointment not found." });
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [appointmentId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Simple toast could go here
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setProcessing(true);
    const formData = new FormData();
    formData.append("appointmentId", appointment._id);
    formData.append("patientId", appointment.patientId);
    formData.append("patientName", appointment.patientName);
    formData.append("patientEmail", appointment.patientEmail);
    formData.append("doctorId", appointment.doctorId);
    formData.append("doctorName", appointment.doctorName);
    formData.append("amount", appointment.fee || 2500);
    formData.append("paymentSlip", file);
    formData.append("transferReference", BANK_DETAILS.ref);

    try {
      await paymentAPI.bankTransfer(formData);
      setSuccess(true);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to upload slip. Please try again." });
      setProcessing(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-teal-600 w-12 h-12" /></div>;

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-10 rounded-[40px] shadow-2xl max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Slip Submitted!</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            We've received your transfer slip. Our billing team will verify it within 24 hours. You'll receive a notification once it's approved.
          </p>
          <button 
            onClick={() => navigate("/dashboard")}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition shadow-lg"
          >
            Track in Appointments
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Selector
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Instructions & Bank Info */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-black text-slate-900 mb-6">Bank Transfer</h1>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Please transfer the exact amount to the account below and upload a clear photo or screenshot of the transaction slip.
            </p>

            <div className="bg-slate-900 text-white p-8 rounded-[32px] shadow-2xl space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-white/50 text-xs uppercase tracking-wider">Bank Name</span>
                <span className="font-bold">{BANK_DETAILS.bank}</span>
              </div>
              <div className="space-y-2">
                <span className="text-white/50 text-xs uppercase tracking-wider block">Account Name</span>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                  <span className="font-mono text-sm">{BANK_DETAILS.accountName}</span>
                  <button onClick={() => copyToClipboard(BANK_DETAILS.accountName)} className="text-teal-400 hover:text-white transition"><Copy className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-white/50 text-xs uppercase tracking-wider block">Account Number</span>
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                  <span className="font-mono text-lg font-bold">{BANK_DETAILS.accountNumber}</span>
                  <button onClick={() => copyToClipboard(BANK_DETAILS.accountNumber)} className="text-teal-400 hover:text-white transition"><Copy className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4">
                <div className="flex flex-col">
                  <span className="text-white/50 text-xs uppercase tracking-wider">Transaction Ref</span>
                  <span className="font-bold text-teal-400">{BANK_DETAILS.ref}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-white/50 text-xs uppercase tracking-wider">Amount Due</span>
                  <span className="text-2xl font-black text-white">LKR {appointment.fee || 2500}.00</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3 p-4 border border-teal-100 bg-teal-50/30 rounded-2xl items-start">
              <Info className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Include the Transaction Reference in your bank application notes for faster verification.
              </p>
            </div>
          </motion.div>

          {/* Form & Upload */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[32px] shadow-xl border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Upload className="w-5 h-5 text-teal-600" />
                Upload Slip
              </h3>

              <div className="space-y-6">
                <div className={`relative border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center transition-all ${
                  file ? "border-teal-500 bg-teal-50/20" : "border-slate-200 hover:border-teal-400"
                }`}>
                  <input 
                    type="file" 
                    onChange={handleFileChange} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*,.pdf"
                  />
                  
                  {preview ? (
                    <div className="w-full flex flex-col items-center">
                      <img src={preview} alt="Slip preview" className="w-48 h-48 object-cover rounded-xl shadow-lg mb-4" />
                      <p className="text-sm font-bold text-teal-600">{file.name}</p>
                      <p className="text-xs text-slate-500 mt-1">Click or drag to replace</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
                        <FileText className="w-8 h-8" />
                      </div>
                      <p className="text-slate-900 font-bold">Drop your slip here</p>
                      <p className="text-sm text-slate-500 mt-1 text-center">Supported: JPG, PNG, PDF (Max 5MB)</p>
                    </>
                  )}
                </div>

                {message && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!file || processing}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all disabled:opacity-50 shadow-xl shadow-slate-200"
                >
                  {processing ? <Loader2 className="animate-spin" /> : "Submit Payment Slip"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BankTransferForm;
