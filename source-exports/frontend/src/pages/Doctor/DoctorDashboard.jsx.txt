import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, Calendar, Clock, Video, 
  CheckCircle2, XCircle, ChevronRight, 
  RefreshCw, ClipboardList, AlertCircle,
  MoreVertical, CalendarDays
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { appointmentAPI } from '../../services/api'
import DashboardLayout from '../../components/DashboardLayout'
import Button from '../../components/ui/Button'

export default function DoctorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [tab, setTab] = useState('pending')

  const fetchApts = async () => {
    setLoading(true)
    try {
      const res = await appointmentAPI.getAll({ status: tab })
      setAppointments(res.data.appointments || [])
    } catch { 
      setAppointments([]) 
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { fetchApts() }, [tab])

  const updateStatus = async (id, status, meetingLink) => {
    setUpdating(id)
    try {
      await appointmentAPI.updateStatus(id, { status, meetingLink })
      fetchApts()
    } finally { 
      setUpdating(null) 
    }
  }

  const statCards = [
    { label: 'Pending Review', icon: Clock, val: appointments.filter(a => a.status === 'pending').length, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { label: 'Confirmed Today', icon: CheckCircle2, val: appointments.filter(a => a.status === 'confirmed').length, color: 'text-medigo-blue bg-blue-50 border-blue-100' },
    { label: 'Total Patients', icon: Users, val: '24', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
  ]

  const getStatusStyle = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
      completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      'no-show': 'bg-slate-100 text-slate-700 border-slate-200',
    }
    return styles[status] || styles.pending
  }

  return (
    <DashboardLayout isDoctor={true}>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-medigo-navy tracking-tight">Clinical Overview</h1>
            <p className="text-slate-500 font-medium">Hello Dr. {user?.name?.split(' ').pop()}, you have {appointments.length} patients in your {tab} queue.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-xl shadow-sm text-sm font-bold text-slate-500">
                <CalendarDays size={16} className="text-medigo-blue" />
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
             </div>
             <Button variant="outline" size="sm" onClick={fetchApts} loading={loading}>
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
             </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((s, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 translate-y-0 transition-all hover:shadow-premium"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm ${s.color}`}>
                <s.icon size={26} />
              </div>
              <div>
                <p className="text-3xl font-black text-medigo-navy leading-none tracking-tight">{s.val}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Appointment Queue Section */}
        <section className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
               <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <ClipboardList size={22} />
               </div>
               <h2 className="text-xl font-extrabold text-medigo-navy tracking-tight">Consultation Queue</h2>
            </div>
            
            <div className="flex p-1.5 bg-slate-50 rounded-2xl">
              {['pending', 'confirmed', 'completed'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    tab === t 
                      ? 'bg-white text-medigo-blue shadow-md' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-6 animate-pulse">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 shrink-0" />
                    <div className="flex-1 space-y-3"><div className="h-4 bg-slate-100 rounded-full w-1/4" /><div className="h-3 bg-slate-100 rounded-full w-1/2" /></div>
                  </div>
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-20 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                   <AlertCircle size={32} className="text-slate-200" />
                </div>
                <div className="space-y-1">
                   <p className="text-lg font-bold text-slate-400">No appointments found</p>
                   <p className="text-sm text-slate-300">New patients will appear here once booked.</p>
                </div>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Patient Details</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Appointment Info</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {appointments.map((apt) => (
                    <motion.tr 
                      layout
                      key={apt._id} 
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
                            {apt.patientName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-medigo-navy">{apt.patientName}</p>
                            <p className="text-xs text-slate-400 font-medium">Patient ID: #{apt._id?.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                           <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
                              <Calendar size={14} className="text-medigo-blue" />
                              {new Date(apt.appointmentDate).toDateString()}
                           </p>
                           <p className="text-xs text-slate-400 font-bold flex items-center gap-2 uppercase tracking-wide">
                              <Clock size={14} />
                              {apt.timeSlot} · {apt.type === 'telemedicine' ? 'Video Consult' : 'Clinic Visit'}
                           </p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(apt.status)}`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {apt.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => updateStatus(apt._id, 'confirmed')}
                                className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all"
                                title="Confirm"
                              >
                                <CheckCircle2 size={18} />
                              </button>
                              <button 
                                onClick={() => updateStatus(apt._id, 'no-show')}
                                className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all"
                                title="Decline"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                          {apt.status === 'confirmed' && (
                            <>
                              <Button 
                                size="sm" 
                                className="h-10 px-4" 
                                onClick={() => navigate(`/telemedicine/lobby/${apt._id}`)}
                              >
                                <Video size={16} className="mr-2" /> Join
                              </Button>
                              <button 
                                onClick={() => updateStatus(apt._id, 'completed')}
                                className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-medigo-blue transition-all border border-slate-100"
                                title="Mark as Completed"
                              >
                                <CheckCircle2 size={18} />
                              </button>
                            </>
                          )}
                          <button className="p-2.5 text-slate-300 hover:text-slate-600 transition-colors">
                             <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Analytics Mini-Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-[2.5rem] border border-blue-100/50 relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                 <h3 className="text-lg font-black text-medigo-navy leading-tight tracking-tight">Monthly Performance</h3>
                 <div className="flex items-end gap-3">
                    <p className="text-4xl font-black text-medigo-blue tracking-tighter">94%</p>
                    <p className="text-sm font-bold text-slate-500 pb-1.5 uppercase tracking-widest leading-none">Satisfaction</p>
                 </div>
                 <div className="w-full bg-slate-200/50 rounded-full h-2">
                    <div className="bg-medigo-blue h-full rounded-full w-[94%]" />
                 </div>
                 <p className="text-xs text-slate-400 font-medium">+12% increase from last month</p>
              </div>
              <Users size={120} className="absolute -bottom-4 -right-4 text-medigo-blue/5 rotate-12" />
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                 <h3 className="text-lg font-black text-medigo-navy leading-tight tracking-tight">Financial Overview</h3>
                 <div className="flex items-end gap-3">
                    <p className="text-4xl font-black text-medigo-navy tracking-tighter">Rs. 4.2k</p>
                    <p className="text-sm font-bold text-slate-500 pb-1.5 uppercase tracking-widest leading-none">Earned Today</p>
                 </div>
                 <Button variant="outline" size="sm" className="h-10 border-slate-100 hover:border-medigo-blue">
                    View Statements <ChevronRight size={16} />
                 </Button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-medigo-teal/5 rounded-full blur-3xl group-hover:bg-medigo-teal/10 transition-all" />
           </div>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}
