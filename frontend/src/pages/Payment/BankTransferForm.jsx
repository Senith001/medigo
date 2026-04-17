import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Building2, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft,
  ArrowRight,
  FileText,
  Copy,
  Info,
  ChevronLeft,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { appointmentAPI, paymentAPI } from "../../services/api";
import DashboardLayout from "../../components/DashboardLayout";
import Button from "../../components/ui/Button";

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
        setMessage({ type: "error", text: "Appointment Identification Failed." });
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
      setMessage({ type: "error", text: "Secure Upload Protocol failed. Please try again." });
      setProcessing(false);
    }
  };

  if (loading) return (
    <DashboardLayout isPatient={true}>
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-medigo-blue w-12 h-12" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Clinical Payload...</p>
      </div>
    </DashboardLayout>
  );

  if (success) {
    return (
      <DashboardLayout isPatient={true}>
        <div className="h-[70vh] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-12 rounded-[3.5rem] shadow-premium max-w-lg w-full text-center border border-slate-50"
          >
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-medigo-navy uppercase tracking-tighter italic mb-4 leading-none">Slip Received</h2>
            <p className="text-slate-500 font-medium mb-10 leading-relaxed px-4">
              Your clinical settlement slip has been securely uploaded. Our verification protocol takes <span className="font-bold text-medigo-blue">24 hours</span>. Check your dashoard for status updates.
            </p>
            <Button 
              onClick={() => navigate("/dashboard")}
              className="w-full h-16 text-lg bg-medigo-navy shadow-2xl"
            >
              Back to Clinical Dashboard
            </Button>
          </motion.div>
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
             Back to Selector
           </button>
           <h1 className="text-4xl font-black text-medigo-navy tracking-tighter italic uppercase leading-none">Manual <span className="text-medigo-blue">Settlement</span></h1>
           <p className="text-slate-500 font-medium">Please transfer the precise authorization amount to our clinical treasury.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
          {/* Instructions Block */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-3xl shadow-slate-900/40 relative overflow-hidden h-full">
               <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(37,99,235,0.15),transparent)]" />
               
               <div className="relative z-10 space-y-8">
                  <div className="flex justify-between items-center border-b border-white/5 pb-6">
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic mb-1">Treasury Partner</p>
                       <p className="text-sm font-bold uppercase">{BANK_DETAILS.bank}</p>
                    </div>
                    <Building2 size={24} className="text-white/20" />
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Full Account Name</p>
                      <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl group hover:bg-white/10 transition-colors">
                        <span className="font-bold text-sm tracking-tight">{BANK_DETAILS.accountName}</span>
                        <button onClick={() => copyToClipboard(BANK_DETAILS.accountName)} className="text-medigo-blue hover:text-white transition"><Copy size={16} /></button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Electronic Unit Identifier (Account)</p>
                      <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl group hover:bg-white/10 transition-colors border border-white/5">
                        <span className="font-mono text-xl font-black text-medigo-blue">{BANK_DETAILS.accountNumber}</span>
                        <button onClick={() => copyToClipboard(BANK_DETAILS.accountNumber)} className="text-slate-400 hover:text-white transition"><Copy size={16} /></button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/5 flex flex-col gap-1">
                     <p className="text-[10px] font-black text-medigo-blue uppercase tracking-widest italic leading-none mb-1">Authorization Amount</p>
                     <p className="text-4xl font-black text-white tracking-tighter italic leading-none">LKR <span className="text-medigo-blue">{(appointment?.fee || 2500).toLocaleString()}</span></p>
                  </div>
               </div>
            </div>

            <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 flex gap-4">
               <Info size={24} className="text-medigo-blue shrink-0" />
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-medigo-blue uppercase tracking-widest leading-none italic">Important Protocol</p>
                  <p className="text-[13px] text-slate-500 font-medium">Specify <span className="font-bold text-slate-900 uppercase tracking-tighter">{BANK_DETAILS.ref}</span> as your transfer reference to ensure immediate identification.</p>
               </div>
            </div>
          </motion.div>

          {/* Form & Upload Area */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col h-full"
          >
            <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3.5rem] shadow-premium border border-slate-50 flex-1 flex flex-col space-y-10">
               <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-medigo-navy uppercase tracking-tighter italic leading-none">Evidence <span className="text-medigo-blue">Upload</span></h3>
                  <FileText size={24} className="text-slate-200" />
               </div>

               <div className="flex-1 space-y-8">
                  <div className={`relative border-2 border-dashed rounded-[2.5rem] p-12 h-64 flex flex-col items-center justify-center transition-all group ${
                    file ? "border-emerald-500 bg-emerald-50/20" : "border-slate-100 bg-slate-50 hover:border-medigo-blue hover:bg-medigo-blue/5"
                  }`}>
                    <input 
                      type="file" 
                      onChange={handleFileChange} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      accept="image/*,.pdf"
                    />
                    
                    {preview ? (
                      <div className="text-center">
                        <img src={preview} alt="Slip preview" className="w-32 h-32 object-cover rounded-2xl shadow-premium mb-4 mx-auto border-4 border-white" />
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest truncate max-w-[200px]">{file.name}</p>
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 mx-auto shadow-sm group-hover:text-medigo-blue transition-colors">
                          <Upload size={32} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-medigo-navy uppercase tracking-tighter italic italic">Drop Clinical Slip</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Maximum Size 5MB (JPG, PNG, PDF)</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {message && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 italic italic">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      {message.text}
                    </div>
                  )}
               </div>

               <Button
                 type="submit"
                 disabled={!file || processing}
                 loading={processing}
                 className="w-full h-16 text-lg bg-medigo-blue shadow-2xl shadow-blue-500/20"
               >
                 Submit Evidence <ArrowRight size={20} className="ml-2" />
               </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BankTransferForm;
