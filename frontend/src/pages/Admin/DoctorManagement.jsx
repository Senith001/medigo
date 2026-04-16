import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Search, ShieldCheck, 
  Trash2, AlertCircle, CheckCircle2, 
  XCircle, Filter, ChevronRight, 
  Mail, Phone, Award, MapPin,
  Stethoscope, Clock, ShieldAlert,
  Loader2, MoreHorizontal
} from 'lucide-react'
import { adminAPI } from '../../services/api'
import Button from '../../components/ui/Button'

const STATUS_STYLES = {
  pending:  { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400', border: 'border-amber-100', label: 'Pending Verification' },
  verified: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400', border: 'border-emerald-100', label: 'Verified Practitioner' },
  rejected: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400', border: 'border-red-100', label: 'Credential Rejected' },
}

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Modal & Action states
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const res = await adminAPI.getDoctors()
      if (res.data.success) {
        setDoctors(res.data.data)
      } else {
        setError('Synchronisation failure: Unable to retrieve clinical personnel.')
      }
    } catch (err) {
      setError('System Error: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDoctors() }, [])

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id)
    try {
      const res = await adminAPI.updateDoctorStatus(id, newStatus)
      if (res.data.success) {
        setDoctors(prev => prev.map(d => d._id === id ? { ...d, status: newStatus } : d))
        if (selectedDoctor?._id === id) {
          setSelectedDoctor(prev => ({ ...prev, status: newStatus }))
        }
      }
    } catch (err) {
      setError('Credential Update Failed: ' + (err.response?.data?.message || err.message))
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('CRITICAL ACTION: Are you sure you want to permanently purge this clinical account? This action cannot be undone.')) return
    setDeletingId(id)
    try {
      const res = await adminAPI.deleteDoctor(id)
      if (res.data.success) {
        setDoctors(prev => prev.filter(d => d._id !== id))
        setSelectedDoctor(null)
      }
    } catch (err) {
      setError('Purge Operation Failed: ' + (err.response?.data?.message || err.message))
    } finally {
      setDeletingId(null)
    }
  }

  const filteredDoctors = doctors.filter(d => {
    const matchesSearch = d.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         d.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         d.email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || d.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-inter">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-100">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-medigo-blue/10 rounded-xl flex items-center justify-center text-medigo-blue">
                <Stethoscope size={24} />
             </div>
             <h1 className="text-3xl font-black text-medigo-navy tracking-tight uppercase italic">Clinical <span className="text-medigo-blue">Personnel</span></h1>
          </div>
          <p className="text-slate-500 font-medium">Verify credentials and manage global clinical oversight.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           {Object.entries(STATUS_STYLES).map(([key, st]) => (
             <button 
               key={key} 
               onClick={() => setFilterStatus(prev => prev === key ? 'all' : key)}
               className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all duration-300 ${
                 filterStatus === key 
                   ? 'bg-medigo-navy border-medigo-navy text-white shadow-xl -translate-y-1' 
                   : `${st.bg} ${st.border} ${st.text} hover:scale-105 active:scale-95`
               }`}
             >
                <div className={`w-2 h-2 rounded-full ${filterStatus === key ? 'bg-white shadow-[0_0_8px_white]' : st.dot}`} />
                <span className="text-xs font-black uppercase tracking-widest">{st.label.replace(' Practitioner', '')}</span>
                <span className={`text-lg font-black tracking-tighter ${filterStatus === key ? 'text-white/40' : 'text-current opacity-30'}`}>
                   {doctors.filter(d => d.status === key).length}
                </span>
             </button>
           ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
         <div className="md:col-span-8 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-medigo-blue transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, specialty, or identifier..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-16 bg-white border border-slate-100 rounded-3xl pl-14 pr-6 text-medigo-navy font-bold placeholder:text-slate-300 outline-none focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/5 shadow-sm transition-all"
            />
         </div>
         <button className="md:col-span-4 bg-white border border-slate-100 rounded-3xl px-8 h-16 flex items-center justify-between text-slate-400 font-black text-xs uppercase tracking-widest hover:border-medigo-blue hover:text-medigo-blue transition-all shadow-sm">
            Advanced Filters <Filter size={18} />
         </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4 text-slate-300 animate-pulse">
             <Loader2 size={48} className="animate-spin text-medigo-blue" />
             <p className="text-xs font-black uppercase tracking-widest">Hydrating Clinical Interface...</p>
          </div>
        ) : error ? (
          <div className="p-20 text-center space-y-4">
             <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <ShieldAlert size={32} />
             </div>
             <p className="text-red-500 font-bold">{error}</p>
             <Button size="sm" variant="outline" onClick={fetchDoctors}>Reconnect to Services</Button>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="py-32 text-center space-y-4">
             <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-slate-100">
                <Users size={40} />
             </div>
             <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No personnel matched your criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50">
                   <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Clinical Specialist</th>
                   <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Medical Focus</th>
                   <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Proficiency</th>
                   <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Consultation Fee</th>
                   <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic text-right">Action Gateway</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {filteredDoctors.map(doctor => {
                   const st = STATUS_STYLES[doctor.status] || STATUS_STYLES.pending
                   return (
                     <motion.tr 
                       layout
                       key={doctor._id}
                       className="group hover:bg-blue-50/20 transition-colors cursor-pointer"
                       onClick={() => setSelectedDoctor(doctor)}
                     >
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 border border-indigo-100 flex items-center justify-center text-medigo-blue text-sm font-black shadow-sm group-hover:scale-110 transition-transform">
                                {(doctor.fullName?.[0] || 'D').toUpperCase()}
                             </div>
                             <div>
                                <div className="text-sm font-black text-medigo-navy uppercase tracking-tight group-hover:text-medigo-blue transition-colors leading-none mb-1">{doctor.fullName}</div>
                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">{doctor.email}</div>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase italic">
                             <Award size={14} className="text-medigo-blue/40" />
                             {doctor.specialty}
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{doctor.experienceYears} Year Sequence</span>
                       </td>
                       <td className="px-8 py-6">
                          <span className="text-sm font-black text-medigo-navy uppercase italic tracking-tighter shrink-0">LKR {doctor.consultationFee?.toLocaleString()}</span>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                             <div className={`px-4 py-2 rounded-full border ${st.bg} ${st.text} ${st.border} text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                                {st.label.replace(' Verification', '').replace(' Practitioner', '')}
                             </div>
                             <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-medigo-blue group-hover:text-white transition-all">
                                <ChevronRight size={16} />
                             </div>
                          </div>
                       </td>
                     </motion.tr>
                   )
                 })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Doctor Insight Modal */}
      <AnimatePresence>
        {selectedDoctor && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-8 bg-slate-950/60 backdrop-blur-xl"
            onClick={() => setSelectedDoctor(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white w-full max-w-4xl rounded-[3rem] shadow-3xl border border-white/20 overflow-hidden flex flex-col lg:flex-row relative"
            >
               <button onClick={() => setSelectedDoctor(null)} className="absolute top-8 right-8 z-10 w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-medigo-navy transition-all">
                  <XCircle size={24} />
               </button>

               {/* Profile Sidebar */}
               <div className="lg:w-1/3 bg-slate-50 p-12 flex flex-col items-center text-center space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.05),transparent)]" />
                  
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2.5rem] bg-gradient-to-tr from-medigo-blue to-indigo-600 border-4 border-white shadow-2xl flex items-center justify-center text-white text-5xl font-black relative overflow-hidden group">
                     {selectedDoctor.fullName?.[0]?.toUpperCase()}
                     <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors" />
                  </div>

                  <div className="space-y-4 relative z-10">
                     <h3 className="text-2xl font-black text-medigo-navy uppercase tracking-tighter leading-none italic">{selectedDoctor.fullName}</h3>
                     <div className="px-4 py-2 bg-white border border-slate-200 rounded-full inline-flex items-center gap-2 text-[10px] font-black uppercase text-medigo-blue tracking-widest italic">
                        <Award size={12} /> {selectedDoctor.specialty}
                     </div>
                  </div>

                  <div className="w-full pt-8 border-t border-slate-200 space-y-6">
                     <div className="flex justify-between items-center text-xs">
                        <span className="font-black text-slate-400 uppercase tracking-widest italic">System ID</span>
                        <span className="font-bold text-medigo-navy">#{selectedDoctor._id.slice(-6).toUpperCase()}</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                        <span className="font-black text-slate-400 uppercase tracking-widest italic">Verification</span>
                        <span className={`font-black uppercase tracking-widest italic ${STATUS_STYLES[selectedDoctor.status]?.text}`}>
                           {selectedDoctor.status}
                        </span>
                     </div>
                  </div>
               </div>

               {/* Right Details Pane */}
               <div className="flex-1 p-12 space-y-12">
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] italic leading-none">Contact Protocol</h4>
                        <div className="space-y-4">
                           <div className="flex items-center gap-3 text-sm font-bold text-medigo-navy">
                              <Mail size={16} className="text-medigo-blue/40" /> {selectedDoctor.email}
                           </div>
                           <div className="flex items-center gap-3 text-sm font-bold text-medigo-navy">
                              <Phone size={16} className="text-medigo-blue/40" /> {selectedDoctor.phone || 'N/A'}
                           </div>
                        </div>
                     </div>
                     <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] italic leading-none">Clinical Metadata</h4>
                        <div className="space-y-4">
                           <div className="flex items-center gap-3 text-sm font-bold text-medigo-navy">
                              <MapPin size={16} className="text-medigo-blue/40" /> {selectedDoctor.clinicLocation || 'TBD'}
                           </div>
                           <div className="flex items-center gap-3 text-sm font-bold text-medigo-navy text-emerald-500">
                              <Clock size={16} className="opacity-40" /> {selectedDoctor.experienceYears} Years Clinical Duty
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] italic leading-none">Biographical Narrative</h4>
                     <p className="text-slate-500 text-[14px] leading-relaxed font-medium">
                        {selectedDoctor.bio || 'No biographical metadata submitted for this practitioner cycle.'}
                     </p>
                  </div>

                  {/* Operational Controls */}
                  <div className="pt-12 border-t border-slate-100 flex items-center justify-between gap-6">
                     <div className="flex items-center gap-4">
                        <button 
                          disabled={selectedDoctor.status === 'verified' || updatingId}
                          onClick={() => handleStatusChange(selectedDoctor._id, 'verified')}
                          className={`h-11 px-8 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${
                            selectedDoctor.status === 'verified' 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-not-allowed' 
                              : 'bg-medigo-blue text-white shadow-xl shadow-blue-500/20 hover:-translate-y-1'
                          }`}
                        >
                           {updatingId === selectedDoctor._id ? 'Processing...' : 'Verify Personnel'}
                        </button>
                        <button 
                          disabled={selectedDoctor.status === 'rejected' || updatingId}
                          onClick={() => handleStatusChange(selectedDoctor._id, 'rejected')}
                          className="h-11 px-6 rounded-xl border border-slate-200 text-slate-400 font-bold text-[11px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                        >
                           Reject
                        </button>
                     </div>

                     <button 
                       disabled={deletingId}
                       onClick={() => handleDelete(selectedDoctor._id)}
                       className="w-11 h-11 bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-600 rounded-xl flex items-center justify-center transition-all group"
                     >
                        <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                     </button>
                  </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
