import { useState, useEffect } from 'react'
import { 
  Calendar, Clock, MapPin, 
  Plus, Trash2, Building2, 
  CircleDollarSign, Loader2, CalendarDays,
  ShieldCheck, AlertCircle, Info
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { doctorAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'
import Button from '../../components/ui/Button'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function ManageAvailability() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  
  // Form State
  const [form, setForm] = useState({
    day: 'Monday',
    date: '',
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    hospital: '',
    location: '',
    fee: 2500
  })

  const fetchAvailability = async () => {
    try {
      setLoading(true)
      const res = await doctorAPI.getAvailability(user.doctorId)
      if (res.data.success) {
        setSessions(res.data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (user?.doctorId) fetchAvailability() }, [user])

  const handleAdd = async (e) => {
    e.preventDefault()
    setAdding(true)
    try {
      const res = await doctorAPI.addAvailability(user.doctorId, form)
      if (res.data.success) {
        setSessions([...sessions, res.data.data])
        setForm({ ...form, hospital: '', location: '', date: '' })
      }
    } catch (err) {
      alert('Failed to register session: ' + (err.response?.data?.message || err.message))
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this session legacy?')) return
    try {
      const res = await doctorAPI.deleteAvailability(id)
      if (res.data.success) {
        setSessions(sessions.filter(s => s._id !== id))
      }
    } catch (err) {
      alert('Removal failed.')
    }
  }

  return (
    <DashboardLayout isDoctor={true}>
      <div className="max-w-6xl mx-auto space-y-10 pb-20 font-inter">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-medigo-blue/10 rounded-xl flex items-center justify-center text-medigo-blue shadow-sm">
                    <CalendarDays size={22} />
                 </div>
                 <h1 className="text-3xl font-black text-medigo-navy tracking-tight uppercase italic">Clinical <span className="text-medigo-blue">Availability</span></h1>
              </div>
              <p className="text-slate-500 font-medium italic">Define your sovereign duty sessions and clinical locations.</p>
           </div>
           
           <div className="px-5 py-2.5 bg-emerald-50 border border-emerald-100 rounded-full flex items-center gap-3 text-[10px] font-black text-emerald-600 uppercase tracking-widest italic animate-pulse">
              <ShieldCheck size={16} /> Real-Time Residency Active
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           {/* Left: Session Configuration Form */}
           <div className="lg:col-span-4 bg-slate-900 rounded-[3rem] p-8 text-white space-y-8 shadow-3xl shadow-slate-900/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(37,99,235,0.1),transparent)]" />
              
              <div className="relative z-10 space-y-6">
                 <h3 className="text-sm font-black uppercase tracking-[0.3em] text-medigo-blue italic">Configure New Session</h3>
                 
                 <form onSubmit={handleAdd} className="space-y-5">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Week Day Cycle</label>
                       <select 
                         className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-bold text-white outline-none focus:border-medigo-blue transition-all"
                         value={form.day}
                         onChange={e => setForm({...form, day: e.target.value})}
                       >
                          {DAYS.map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Specific Calendar Date</label>
                       <div className="relative">
                          <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                          <input 
                            type="date" 
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 text-sm font-bold text-white outline-none focus:border-medigo-blue transition-all"
                            value={form.date}
                            onChange={e => setForm({...form, date: e.target.value})}
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Arrival Time</label>
                          <input 
                            type="text" 
                            placeholder="05:30 PM"
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-bold text-white outline-none focus:border-medigo-blue transition-all italic"
                            value={form.startTime}
                            onChange={e => setForm({...form, startTime: e.target.value})}
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Departure</label>
                          <input 
                            type="text" 
                            placeholder="09:00 PM"
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-bold text-white outline-none focus:border-medigo-blue transition-all italic"
                            value={form.endTime}
                            onChange={e => setForm({...form, endTime: e.target.value})}
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Clinical Facility Name</label>
                       <div className="relative">
                          <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                          <input 
                            type="text" 
                            placeholder="e.g. Melsta Hospitals"
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 text-sm font-bold text-white outline-none focus:border-medigo-blue transition-all italic"
                            value={form.hospital}
                            onChange={e => setForm({...form, hospital: e.target.value})}
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 items-end">
                       <div className="col-span-8 space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Geographic Location</label>
                          <div className="relative">
                             <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                             <input 
                               type="text" 
                               placeholder="e.g. Ragama"
                               className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 text-sm font-bold text-white outline-none focus:border-medigo-blue transition-all italic"
                               value={form.location}
                               onChange={e => setForm({...form, location: e.target.value})}
                             />
                          </div>
                       </div>
                       <div className="col-span-4 space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Fee (LKR)</label>
                          <input 
                            type="number" 
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm font-bold text-white outline-none focus:border-medigo-blue transition-all italic"
                            value={form.fee}
                            onChange={e => setForm({...form, fee: parseInt(e.target.value)})}
                          />
                       </div>
                    </div>

                    <Button type="submit" loading={adding} className="w-full h-16 rounded-[2rem] bg-medigo-blue hover:bg-medigo-blue-dark shadow-2xl shadow-blue-500/10">
                       Deploy Clinical Slot <Plus size={20} className="ml-2" />
                    </Button>
                 </form>
              </div>
           </div>

           {/* Right: Active Sessions Inventory */}
           <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-[3.5rem] p-10 shadow-premium border border-slate-100 min-h-[600px] flex flex-col">
                 <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-[1.25rem] flex items-center justify-center">
                          <Clock size={24} />
                       </div>
                       <div>
                          <h2 className="text-2xl font-black text-medigo-navy uppercase tracking-tighter italic italic leading-none">Registered Registry</h2>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Live clinical schedule auditing</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-black text-medigo-blue uppercase italic tracking-widest">{sessions.length} Slots Active</p>
                    </div>
                 </div>

                 {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-200">
                       <Loader2 size={48} className="animate-spin text-medigo-blue" />
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Synchronizing Inventory...</p>
                    </div>
                 ) : sessions.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
                       <div className="w-32 h-32 bg-slate-50 text-slate-200 rounded-[3rem] flex items-center justify-center border-2 border-dashed border-slate-100">
                          <Calendar size={48} />
                       </div>
                       <div className="space-y-2">
                          <h3 className="text-xl font-black text-medigo-navy uppercase italic">Clinical Schedule Empty</h3>
                          <p className="text-slate-400 font-medium max-w-sm px-8">No session narrative exists. Begin by configuring your first availability slot in the controller pane.</p>
                       </div>
                    </div>
                 ) : (
                    <div className="grid gap-4">
                       <AnimatePresence mode="popLayout">
                          {sessions.map((session, i) => (
                             <motion.div
                               key={session._id}
                               initial={{ opacity: 0, x: 20 }}
                               animate={{ opacity: 1, x: 0 }}
                               exit={{ opacity: 0, scale: 0.95 }}
                               transition={{ delay: i * 0.05 }}
                               className="bg-white p-6 rounded-[2.5rem] border border-slate-100 hover:border-blue-200 transition-all hover:shadow-premium group flex flex-col sm:flex-row items-center gap-6"
                             >
                                <div className="flex-1 flex items-center gap-5 min-w-0 w-full">
                                   <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-[1.5rem] flex flex-col items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors shrink-0 overflow-hidden relative">
                                      <div className="absolute top-0 left-0 w-full h-1 bg-medigo-blue opacity-50" />
                                      <span className="text-[10px] font-black text-medigo-blue uppercase tracking-tighter leading-none mb-1">{session.day.slice(0, 3)}</span>
                                      <span className="text-lg font-black text-medigo-navy italic leading-none">{session.date ? session.date.split('-')[2] : '∞'}</span>
                                   </div>
                                   <div className="min-w-0">
                                      <div className="flex items-center gap-3 mb-1">
                                         <h4 className="text-sm font-black text-medigo-navy uppercase italic truncate">{session.hospital || 'Private Clinic'}</h4>
                                         <span className="px-2.5 py-0.5 bg-slate-100 text-[9px] font-black text-slate-500 uppercase rounded group-hover:bg-blue-100 group-hover:text-medigo-blue transition-colors">LKR {session.fee?.toLocaleString()}</span>
                                      </div>
                                      <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest italic flex-wrap">
                                         <div className="flex items-center gap-1.5"><Clock size={12} className="text-medigo-blue/40" /> {session.startTime} - {session.endTime}</div>
                                         <div className="flex items-center gap-1.5"><MapPin size={12} className="text-medigo-blue/40" /> {session.location}</div>
                                      </div>
                                   </div>
                                </div>
                                <button 
                                  onClick={() => handleDelete(session._id)}
                                  className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 transition-all flex items-center justify-center group/btn shrink-0"
                                >
                                   <Trash2 size={20} className="group-hover/btn:scale-110 transition-transform" />
                                </button>
                             </motion.div>
                          ))}
                       </AnimatePresence>
                    </div>
                 )}

                 <div className="mt-auto pt-10 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
                       <ShieldCheck size={14} className="text-medigo-blue" /> Sovereign Clinical Identity Protected
                    </div>
                    <div className="w-1 h-1 bg-slate-200 rounded-full" />
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest italic underline cursor-pointer hover:text-medigo-blue transition-colors">
                       Regulatory Audit Documentation
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
