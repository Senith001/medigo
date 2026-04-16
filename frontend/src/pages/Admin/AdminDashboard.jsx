import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Stethoscope, Landmark, TrendingUp, 
  ChevronRight, MoreVertical, Search, ExternalLink,
  ShieldCheck, AlertCircle, CheckCircle2, XCircle,
  Calendar, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAPI } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import Button from '../../components/ui/Button';

const STATUS_STYLES = {
  pending:  { 
    bg: 'bg-amber-50', 
    text: 'text-amber-700', 
    border: 'border-amber-100',
    activeBg: 'bg-amber-600', 
    label: 'Pending Approval' 
  },
  verified: { 
    bg: 'bg-emerald-50', 
    text: 'text-emerald-700', 
    border: 'border-emerald-100',
    activeBg: 'bg-emerald-600', 
    label: 'Verified Member' 
  },
  rejected: { 
    bg: 'bg-red-50', 
    text: 'text-red-700', 
    border: 'border-red-100',
    activeBg: 'bg-red-600', 
    label: 'Rejected' 
  },
};

export default function AdminDashboard() {
  const [patientCount, setPatientCount] = useState(null);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      adminAPI.getPatients(),
      adminAPI.getDoctors()
    ]).then(([patientRes, doctorRes]) => {
      if (patientRes.data.success) setPatientCount(patientRes.data.data.length);
      if (doctorRes.data.success) {
        setPendingDoctors(doctorRes.data.data.filter(d => d.status === 'pending'));
      }
    }).catch(err => {
      console.error('Admin Dashboard Sync Error:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await adminAPI.updateDoctorStatus(id, newStatus);
      if (res.data.success) {
        if (newStatus !== 'pending') {
          setPendingDoctors(prev => prev.filter(d => d._id !== id));
          setSelectedDoctor(null);
        } else {
          setSelectedDoctor(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      alert('Verification Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = [
    { label: 'Active Patients', val: patientCount || '0', icon: Users, color: 'text-blue-600', trend: '+12%', up: true },
    { label: 'New Revenue', val: 'Rs. 42k', icon: Landmark, color: 'text-emerald-600', trend: '+5.4', up: true },
    { label: 'Platform Growth', val: '18%', icon: TrendingUp, color: 'text-indigo-600', trend: '-2%', up: false },
  ];

  return (
    <DashboardLayout isAdmin={true}>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="space-y-1">
              <h1 className="text-3xl font-black text-medigo-navy tracking-tight italic">Platform Command</h1>
              <p className="text-slate-500 font-medium">Monitoring MediGo health network operations and verifications.</p>
           </div>
           
           <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white border border-slate-100 rounded-xl shadow-sm flex items-center gap-2">
                 <ShieldCheck size={16} className="text-medigo-mint" />
                 <span className="text-xs font-black text-medigo-navy uppercase tracking-widest">Admin Secure Mode</span>
              </div>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {stats.map((stat, i) => (
             <motion.div 
               key={stat.label}
               whileHover={{ y: -5 }}
               className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group overflow-hidden relative"
             >
                <div className="flex items-center gap-5">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm transition-colors group-hover:bg-slate-50 ${stat.color} border-slate-100`}>
                      <stat.icon size={26} />
                   </div>
                   <div>
                      <p className="text-3xl font-black text-medigo-navy leading-none tracking-tight">{stat.val}</p>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-2">{stat.label}</p>
                   </div>
                </div>
                
                <div className={`flex items-center gap-1 text-[11px] font-black px-2 py-1 rounded-lg ${stat.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                   {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                   {stat.trend}
                </div>
                
                <stat.icon size={100} className={`absolute -bottom-6 -right-6 opacity-[0.03] rotate-12 transition-transform group-hover:scale-110 ${stat.color}`} />
             </motion.div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Verification Queue - 8 columns */}
           <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden">
                 <div className="p-6 sm:p-8 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                          <Stethoscope size={22} />
                       </div>
                       <h2 className="text-xl font-extrabold text-medigo-navy tracking-tight">Practitioner Verifications</h2>
                    </div>
                    
                    <Link to="/admin/doctors" className="text-xs font-black text-medigo-blue uppercase tracking-widest hover:underline">
                       Manage All
                    </Link>
                 </div>

                 <div className="p-6">
                    {loading ? (
                      <div className="space-y-4 animate-pulse">
                         {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-50 rounded-2xl w-full" />)}
                      </div>
                    ) : pendingDoctors.length === 0 ? (
                      <div className="py-20 text-center space-y-4 border-2 border-dashed border-slate-100 rounded-[2rem]">
                         <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 size={32} className="text-slate-300" />
                         </div>
                         <p className="text-sm font-bold text-slate-400">Zero pending verifications</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {pendingDoctors.map(doctor => (
                           <div key={doctor._id} className="bg-slate-50/50 hover:bg-white p-5 rounded-3xl border border-transparent hover:border-slate-100 hover:shadow-lg transition-all group">
                              <div className="flex items-center gap-4 mb-4">
                                 <div className="w-12 h-12 rounded-xl bg-medigo-blue/10 text-medigo-blue flex items-center justify-center font-black shadow-sm group-hover:scale-110 transition-transform">
                                    {doctor.fullName?.[0]}
                                 </div>
                                 <div className="flex-1 overflow-hidden">
                                    <h4 className="text-sm font-black text-medigo-navy truncate leading-none uppercase tracking-tight">{doctor.fullName}</h4>
                                    <p className="text-xs text-slate-400 font-bold mt-1.5">{doctor.specialty}</p>
                                 </div>
                                 <span className="px-2 py-0.5 bg-amber-100/50 text-amber-600 text-[9px] font-black uppercase tracking-wider rounded-md">NEW</span>
                              </div>
                              
                              <div className="bg-white/50 p-3 rounded-2xl mb-5 space-y-1">
                                 <div className="flex justify-between text-[10px] font-bold">
                                    <span className="text-slate-400 uppercase tracking-widest leading-none">Experience</span>
                                    <span className="text-medigo-navy">{doctor.experienceYears} Years</span>
                                 </div>
                                 <div className="flex justify-between text-[10px] font-bold">
                                    <span className="text-slate-400 uppercase tracking-widest leading-none">Education</span>
                                    <span className="text-medigo-navy truncate ml-4">MD / Specialized</span>
                                 </div>
                              </div>
                              
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full h-10 border-slate-200 text-xs shadow-none group-hover:border-medigo-blue group-hover:text-medigo-blue"
                                onClick={() => setSelectedDoctor(doctor)}
                              >
                                Review Credentials <ExternalLink size={12} className="ml-2" />
                              </Button>
                           </div>
                         ))}
                      </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Quick Actions / Recent Activty - 4 columns */}
           <div className="lg:col-span-4 space-y-8">
              <div className="bg-gradient-to-br from-medigo-navy to-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-medigo-blue/20 blur-3xl rounded-full" />
                 <div className="relative z-10 space-y-6">
                    <h3 className="text-lg font-black tracking-tight leading-none italic">Admin Quick Settings</h3>
                    <div className="space-y-2">
                       <button className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                          <span className="text-xs font-bold tracking-widest uppercase">Manage Administrators</span>
                          <ChevronRight size={14} className="text-white/40 group-hover:text-white" />
                       </button>
                       <button className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group text-medigo-blue">
                          <span className="text-xs font-bold tracking-widest uppercase">System Audit Logs</span>
                          <ChevronRight size={14} className="text-white/40 group-hover:text-medigo-blue" />
                       </button>
                       <button className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                          <span className="text-xs font-bold tracking-widest uppercase">Maintenance Mode</span>
                          <div className="w-8 h-4 bg-white/10 rounded-full relative">
                             <div className="absolute left-1 top-1 w-2 h-2 bg-white/40 rounded-full" />
                          </div>
                       </button>
                    </div>
                 </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-medigo-navy uppercase tracking-widest leading-none">Recent Activity</h3>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 </div>
                 
                 <div className="space-y-6">
                    {[
                      { type: 'Doctor Verified', desc: 'Dr. Emily Watson was approved', time: '12m ago' },
                      { type: 'Support Request', desc: 'Patient #4421 reported issue', time: '1h ago' },
                      { type: 'New Registration', desc: 'Dr. Ken Ryu submitted docs', time: '3h ago' },
                    ].map((act, i) => (
                      <div key={i} className="flex gap-4 relative">
                         <div className="shrink-0 w-0.5 bg-slate-100 absolute left-[7px] top-4 bottom-[-16px]" />
                         <div className="w-4 h-4 rounded-full bg-blue-50 border-2 border-medigo-blue shrink-0 z-10 mt-1" />
                         <div>
                            <p className="text-[12px] font-black text-medigo-navy leading-none uppercase tracking-tight">{act.type}</p>
                            <p className="text-[11px] text-slate-400 font-medium mt-1.5">{act.desc}</p>
                            <span className="text-[10px] text-slate-300 font-bold mt-2 block">{act.time}</span>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </motion.div>

      {/* Doctor Review Sidebar Modal */}
      <AnimatePresence>
        {selectedDoctor && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 bg-medigo-navy/60 backdrop-blur-md z-[100]" 
               onClick={() => setSelectedDoctor(null)}
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-[101] overflow-y-auto font-inter"
            >
              <div className="p-8 space-y-10">
                 {/* Modal Header */}
                 <div className="flex items-start justify-between">
                    <div className="flex items-center gap-6">
                       <div className="w-20 h-20 bg-gradient-to-tr from-medigo-blue to-medigo-teal text-white rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-xl">
                          {selectedDoctor.fullName?.[0].toUpperCase()}
                       </div>
                       <div>
                          <h2 className="text-2xl font-black text-medigo-navy leading-none tracking-tight uppercase italic">{selectedDoctor.fullName}</h2>
                          <div className="flex items-center gap-2 mt-3">
                             <div className="px-3 py-1 bg-blue-50 text-medigo-blue border border-blue-100 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedDoctor.specialty}</div>
                             <div className={`px-3 py-1 ${STATUS_STYLES[selectedDoctor.status].bg} ${STATUS_STYLES[selectedDoctor.status].text} border ${STATUS_STYLES[selectedDoctor.status].border} rounded-full text-[10px] font-black uppercase tracking-widest`}>{selectedDoctor.status}</div>
                          </div>
                       </div>
                    </div>
                    <button onClick={() => setSelectedDoctor(null)} className="p-2 text-slate-300 hover:text-slate-600 transition-colors"><XCircle size={24} /></button>
                 </div>

                 {/* Information Grid */}
                 <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                       <ModalDetail label="Contact Email" value={selectedDoctor.email} icon={Mail} />
                       <ModalDetail label="Phone" value={selectedDoctor.phone} icon={Phone} />
                       <ModalDetail label="Registered" value={new Date(selectedDoctor.createdAt).toDateString()} icon={Calendar} />
                       <ModalDetail label="Experience" value={`${selectedDoctor.experienceYears} Years Clinical Practice`} icon={TrendingUp} />
                    </div>
                    
                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                       <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Medical Credentials</h3>
                       <div className="space-y-4">
                          <ModalDetail label="Degrees & Qualifications" value={selectedDoctor.qualifications} icon={CheckCircle2} fullWidth />
                          <ModalDetail label="Primary Affiliation" value={selectedDoctor.clinicLocation} icon={MapPin} fullWidth />
                          <ModalDetail label="Professional Bio" value={selectedDoctor.bio} icon={FileText} fullWidth />
                       </div>
                    </div>
                 </div>

                 {/* Action Panel */}
                 <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-500/10">
                    <div className="flex items-center gap-3 mb-6">
                       <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"><ShieldCheck size={16} /></div>
                       <h3 className="text-sm font-black uppercase tracking-widest">Final Decision</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <Button 
                          className="h-14 font-black shadow-none bg-emerald-500 hover:bg-emerald-600" 
                          onClick={() => handleStatusChange(selectedDoctor._id, 'verified')}
                          loading={updatingId === selectedDoctor._id}
                       >
                          Verify Doctor
                       </Button>
                       <Button 
                          variant="outline"
                          className="h-14 font-black border-red-500/30 text-red-400 bg-white/5 hover:bg-red-500/10 hover:border-red-500/50" 
                          onClick={() => handleStatusChange(selectedDoctor._id, 'rejected')}
                          loading={updatingId === selectedDoctor._id}
                       >
                          Reject Application
                       </Button>
                    </div>
                    <p className="mt-6 text-center text-[10px] text-white/30 font-bold uppercase tracking-[0.2em]">Medical Board Authority Action Required</p>
                 </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

function ModalDetail({ label, value, icon: Icon, fullWidth }) {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      <div className="flex items-center gap-2 mb-2">
         {Icon && <Icon size={12} className="text-medigo-blue" />}
         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-[14px] font-bold text-medigo-navy leading-snug">{value || 'N/A'}</p>
    </div>
  );
}

function Mail({ size, ...p }) { return <svg {...p} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><rect width="20" height="16" x="2" y="4" rx="2"/></svg> }
function Phone({ size, ...p }) { return <svg {...p} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> }
function FileText({ size, ...p }) { return <svg {...p} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg> }