import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Download, 
  Search, 
  Calendar, 
  User, 
  Plus, 
  Filter,
  MoreVertical,
  ExternalLink,
  Loader2,
  FileIcon,
  CheckCircle2,
  Clock,
  ShieldCheck,
  BrainCircuit,
  Share2,
  ArrowRight,
  Info
} from "lucide-react";
import { reportAPI, appointmentAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/DashboardLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function ReportCenter() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    type: 'Laboratory',
    doctorId: '',
    description: '',
    file: null
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchReports = async () => {
      try {
        const { data } = await reportAPI.getByPatient(user.id || user.userId);
        setReports(data.data || []);
      } catch (err) {
        console.error("Report Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchMyDoctors = async () => {
      try {
        // Fetch all patient appointments to populate the doctor dropdown
        const { data } = await appointmentAPI.getAll();
        if (data && data.appointments) {
          const uniqueDoctors = [];
          const seen = new Set();
          data.appointments.forEach(apt => {
            if (!seen.has(apt.doctorId)) {
              seen.add(apt.doctorId);
              uniqueDoctors.push({ id: apt.doctorId, name: apt.doctorName });
            }
          });
          setDoctors(uniqueDoctors);
        }
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
      }
    };

    fetchReports();
    fetchMyDoctors();
  }, [user]);

  const filteredReports = reports.filter(r => 
    (r.reportTitle?.toLowerCase().includes(search.toLowerCase()) || 
     r.reportType?.toLowerCase().includes(search.toLowerCase()) ||
     r.doctorName?.toLowerCase().includes(search.toLowerCase())) &&
    (filter === "all" || r.status === filter)
  );

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.doctorId) return alert("Please select a file and a doctor.");
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('reportFile', uploadForm.file);
      formData.append('patientId', user.id || user.userId);
      formData.append('doctorId', uploadForm.doctorId);
      formData.append('reportTitle', uploadForm.title);
      formData.append('reportType', uploadForm.type);
      formData.append('description', uploadForm.description);
      formData.append('uploadedBy', 'patient');

      const res = await reportAPI.upload(formData);
      if (res.data.success) {
        setReports([res.data.data, ...reports]);
        setShowUpload(false);
        setUploadForm({ title: '', type: 'Laboratory', doctorId: '', description: '', file: null });
      }
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout isPatient={true}>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-8 pb-24 font-inter"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div className="space-y-1">
              <h1 className="text-3xl font-black text-medigo-navy tracking-tight uppercase italic font-display">Health Repository</h1>
              <p className="text-slate-500 font-medium">Manage and review your secure medical clinical records.</p>
           </div>
           
           <div className="flex items-center gap-3">
              <Button size="sm" variant="outline" className="hidden sm:flex border-slate-200">
                 <ShieldCheck size={16} className="mr-2 text-medigo-mint" /> Encrypted Drive
              </Button>
              <Button size="sm" onClick={() => setShowUpload(true)} className="shadow-lg shadow-blue-500/10">
                 <Plus size={18} className="mr-2" /> Upload Records
              </Button>
           </div>
        </div>

        {/* Toolbar Section */}
        <section className="bg-white p-4 sm:p-6 rounded-[2.5rem] shadow-premium border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
           <div className="relative flex-1 w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-medigo-blue transition-colors" size={18} />
              <input 
                 type="text" 
                 placeholder="Search by diagnosis, doctor or hospital..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full h-14 pl-12 pr-6 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-medigo-navy placeholder:text-slate-300"
              />
           </div>
           
           <div className="flex p-1.5 bg-slate-50 rounded-2xl shrink-0">
             {["all", "ready", "pending"].map((f) => (
               <button
                 key={f}
                 onClick={() => setFilter(f)}
                 className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] transition-all ${
                   filter === f 
                     ? "bg-white text-medigo-blue shadow-md" 
                     : "text-slate-400 hover:text-slate-600"
                 }`}
               >
                 {f}
               </button>
             ))}
           </div>
        </section>

        {/* Dynamic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <AnimatePresence mode="popLayout">
              {loading ? (
                [1,2,3].map(i => <div key={i} className="h-64 bg-white rounded-[3rem] border border-slate-100 animate-pulse" />)
              ) : filteredReports.length === 0 ? (
                <div className="col-span-full py-24 text-center space-y-6 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-sm">
                   <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto">
                      <FileIcon size={48} />
                   </div>
                   <div className="space-y-2 px-4">
                      <h3 className="text-xl font-black text-medigo-navy uppercase tracking-tight italic">No Records Found</h3>
                      <p className="text-slate-400 font-medium max-w-sm mx-auto tracking-wide">Your medical vault is empty. Reports shared by your doctors will appear here instantly.</p>
                   </div>
                </div>
              ) : (
                filteredReports.map((report, idx) => (
                  <ReportCard key={report._id} report={report} index={idx} />
                ))
              )}
           </AnimatePresence>
        </div>

        {/* Security Tip */}
        <div className="flex justify-center pt-8">
           <div className="inline-flex items-center gap-3 px-6 py-4 bg-indigo-50/50 border border-indigo-100/50 rounded-3xl text-[11px] font-bold text-slate-500 shadow-sm group hover:border-indigo-200 transition-all">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-medigo-blue shadow-inner group-hover:scale-110 transition-transform">
                 <ShieldCheck size={16} />
              </div>
              <div className="space-y-0.5">
                 <p className="text-medigo-navy">Advanced Health Encryption Active</p>
                 <p className="opacity-60 text-[9px] uppercase tracking-widest">Compliant with International Medical Standards (ISO 27001)</p>
              </div>
           </div>
        </div>

        {/* Upload Modal */}
        <AnimatePresence>
          {showUpload && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowUpload(false)}
                className="absolute inset-0 bg-medigo-navy/40 backdrop-blur-md"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-3xl overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-r from-medigo-blue to-medigo-mint" />
                
                <h2 className="text-2xl font-black text-medigo-navy uppercase tracking-tighter italic mb-8">Share Clinical Document</h2>
                
                <form onSubmit={handleUpload} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Report Title</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Annual Blood Analysis 2024"
                      className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-medigo-blue transition-all"
                      value={uploadForm.title}
                      onChange={e => setUploadForm({...uploadForm, title: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Category</label>
                      <select 
                        className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-medigo-blue transition-all"
                        value={uploadForm.type}
                        onChange={e => setUploadForm({...uploadForm, type: e.target.value})}
                      >
                        <option value="Laboratory">Laboratory</option>
                        <option value="Radiology">Radiology</option>
                        <option value="Pharmacy">Pharmacy</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Assign to Doctor</label>
                       <select 
                         required
                         className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-medigo-blue transition-all"
                         value={uploadForm.doctorId}
                         onChange={e => setUploadForm({...uploadForm, doctorId: e.target.value})}
                       >
                         <option value="">Select Doctor</option>
                         {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                       </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">File Selection (PDF/JPG)</label>
                    <input 
                      type="file" 
                      required
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="w-full p-4 bg-slate-50 border-2 border-dashed border-slate-100 rounded-2xl text-[11px] font-bold text-slate-500 cursor-pointer hover:border-medigo-blue/30 transition-all"
                      onChange={e => setUploadForm({...uploadForm, file: e.target.files[0]})}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowUpload(false)}
                      className="flex-1 rounded-2xl h-14"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      loading={uploading}
                      className="flex-1 rounded-2xl h-14 shadow-lg shadow-blue-500/20"
                    >
                      Process Upload <ArrowRight size={18} className="ml-2" />
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
}

function ReportCard({ report, index }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-[2.5rem] p-8 mt-2 shadow-sm border border-slate-100 group hover:border-blue-100 hover:shadow-premium transition-all duration-300 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/10 blur-3xl rounded-full" />
      
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div className="w-16 h-16 bg-gradient-to-tr from-blue-50 to-indigo-50 text-medigo-blue rounded-[1.5rem] flex items-center justify-center border border-indigo-50 shadow-inner group-hover:bg-medigo-navy group-hover:text-white transition-all duration-500">
          <FileText size={32} />
        </div>
        <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border shadow-sm ${
          report.status === 'ready' 
            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
            : 'bg-amber-50 text-amber-600 border-amber-100'
        }`}>
          {report.status === 'ready' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
          {report.status}
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        <div>
          <h3 className="text-xl font-black text-medigo-navy leading-none tracking-tight uppercase italic mb-2 group-hover:text-medigo-blue transition-colors">
             {report.reportType || "Clinical Analysis"}
          </h3>
          <div className="flex items-center gap-1.5">
             <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                <User size={12} />
             </div>
             <p className="text-[12px] font-bold text-slate-400">Dr. {report.doctorName}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
           <div className="flex items-center gap-2">
              <Calendar size={14} className="text-medigo-blue/40" />
              <span className="text-xs font-bold text-slate-500">{new Date(report.createdAt).toLocaleDateString()}</span>
           </div>
           <div className="w-px h-3 bg-slate-200" />
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
              Format: <span className="text-medigo-navy">{report.fileFormat || "PDF"}</span>
           </div>
        </div>

        {report.aiAnalyzed && (
           <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50/50 border border-indigo-100 px-4 py-2 rounded-2xl w-fit">
              <BrainCircuit size={14} className="animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-widest">AI Insights Ready</span>
           </div>
        )}

        <div className="pt-2 flex gap-3">
          <Button 
            className="flex-1 h-12 shadow-sm"
            onClick={() => window.open(`http://localhost:5006${report.fileUrl}`, '_blank')}
          >
            <Download size={16} className="mr-2" /> Download
          </Button>
          <button className="w-12 h-12 flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl hover:bg-white hover:border-medigo-blue hover:text-medigo-blue transition-all">
            <Share2 size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
