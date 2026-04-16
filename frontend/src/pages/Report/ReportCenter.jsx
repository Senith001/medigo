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
  Clock
} from "lucide-react";
import { reportAPI } from "../../services/api";

const ReportCenter = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
    
    const fetchReports = async () => {
      try {
        const { data } = await reportAPI.getByPatient(userData.userId || userData._id);
        setReports(data.reports || []);
      } catch (err) {
        console.error("Failed to fetch reports");
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

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-teal-600 w-12 h-12" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-extrabold text-slate-900 tracking-tight"
            >
              Medical Reports
            </motion.h1>
            <p className="text-slate-500 mt-2 text-lg">Access and manage your complete health records</p>
          </div>
          <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200">
            <Plus className="w-5 h-5" />
            Upload New Record
          </button>
        </header>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-[32px] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by doctor or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/20 transition-all text-slate-900"
            />
          </div>
          <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl">
            {["all", "ready", "pending"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                  filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredReports.map((report, idx) => (
              <motion.div
                key={report._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-[40px] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 group hover:border-teal-100 transition-all"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-3xl flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors duration-500">
                    <FileIcon className="w-7 h-7" />
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                    report.status === 'ready' ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {report.status === 'ready' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {report.status}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight mb-1">{report.reportType || "General Report"}</h3>
                    <p className="text-slate-400 text-sm flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      Dr. {report.doctorName}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 bg-slate-50 p-3 rounded-2xl">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                    <div className="w-1 h-1 bg-slate-300 rounded-full" />
                    <div className="uppercase tracking-widest">{report.fileFormat || "PDF"}</div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <button 
                      className="flex-1 bg-slate-900 text-white p-3 rounded-2xl text-sm font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2"
                      onClick={() => window.open(`http://localhost:5006${report.fileUrl}`, '_blank')}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileIcon className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No Reports Found</h3>
            <p className="text-slate-500 mt-2">We couldn't find any medical reports matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportCenter;
