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
import { reportAPI } from "../../services/api";
import DashboardLayout from "../../components/DashboardLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function ReportCenter() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUser(userData);
    
    const fetchReports = async () => {
      try {
        const { data } = await reportAPI.getByPatient(userData.userId || userData._id);
        setReports(data.reports || []);
      } catch (err) {
        console.error("Report Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (userData.userId || userData._id) fetchReports();
  }, []);

  const filteredReports = reports.filter(r => 
    (r.doctorName?.toLowerCase().includes(search.toLowerCase()) || 
     r.reportType?.toLowerCase().includes(search.toLowerCase())) &&
    (filter === "all" || r.status === filter)
  );

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
              <Button size="sm" className="shadow-lg shadow-blue-500/10">
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
