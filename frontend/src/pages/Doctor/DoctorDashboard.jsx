import { useState, useEffect } from 'react'
import {
  Users, Calendar, Activity, Zap, Target, MoreVertical, FileText, Star, 
  TrendingUp, TrendingDown, RefreshCw, DollarSign, ArrowRight,
  MapPinned, Video, CalendarDays, Clock as ClockIcon, AlertCircle, ChevronRight, MapPin,
  Sparkles, ShieldCheck
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { appointmentAPI, doctorAPI, reportAPI } from '../../services/api'
import DashboardLayout from '../../components/DashboardLayout'
import { Link } from 'react-router-dom'

// --- Premium UI Components ---

const GlassCard = ({ children, className = "", hover = true }) => (
  <motion.div
    whileHover={hover ? { y: -8, transition: { duration: 0.3, ease: "easeOut" } } : {}}
    className={`bg-white/90 backdrop-blur-2xl border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[3rem] overflow-hidden transition-shadow hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] ${className}`}
  >
    {children}
  </motion.div>
)

const TYPE_META = {
  'in-person': { label: 'In-Person', icon: MapPinned, cls: 'bg-amber-500/10 text-amber-600 border-amber-200/50' },
  'telemedicine': { label: 'Virtual', icon: Video, cls: 'bg-blue-500/10 text-blue-600 border-blue-200/50' },
  'both': { label: 'Hybrid', icon: CalendarDays, cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50' },
}

const formatDate = (session) => {
  if (!session.date) return null
  const d = new Date(session.date)
  return {
    day: d.toLocaleDateString('en-US', { weekday: 'short' }),
    num: d.getDate(),
    mon: d.toLocaleDateString('en-US', { month: 'short' })
  }
}

const BarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end justify-between h-56 mt-8 pb-4 px-4 bg-slate-50/50 rounded-[2.5rem] border border-slate-100">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1 group relative">
          <div className="w-full px-2 relative flex justify-center h-[160px] items-end">
            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 bg-medigo-navy text-white text-[11px] font-black py-2 px-4 rounded-2xl pointer-events-none whitespace-nowrap z-20 shadow-2xl border border-white/10">
              Rs. {d.value.toLocaleString()}
            </div>
            <div className="absolute bottom-0 w-full max-w-[28px] h-full bg-white rounded-full shadow-inner border border-slate-50" />
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.value / max) * 100}%` }}
              transition={{ duration: 1.5, delay: i * 0.1, type: "spring", stiffness: 50 }}
              className={`w-full max-w-[28px] relative z-10 rounded-full bg-gradient-to-t ${i === data.length - 1
                ? 'from-medigo-blue to-[#60a5fa] shadow-[0_8px_20px_rgba(37,99,235,0.3)]'
                : 'from-slate-200 to-slate-300 opacity-60'
                }`}
            >
              {i === data.length - 1 && (
                <div className="absolute inset-0 bg-white/30 rounded-full mix-blend-overlay animate-pulse" />
              )}
            </motion.div>
          </div>
          <span className="text-[10px] font-black text-slate-400 mt-5 uppercase tracking-[0.2em]">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [availability, setAvailability] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [aptRes, availRes, reportRes] = await Promise.all([
        appointmentAPI.getAll({ limit: 1000 }),
        user?.doctorId ? doctorAPI.getAvailability(user.doctorId) : Promise.resolve({ data: { success: true, data: [] } }),
        user?.doctorId ? reportAPI.getByDoctor(user.doctorId) : Promise.resolve({ data: { success: true, data: [] } })
      ])
      
      setAppointments(aptRes.data.appointments || [])
      if (availRes.data.success) setAvailability(availRes.data.data)
      if (reportRes.data.success) setReports(reportRes.data.data || [])
    } catch (err) {
      console.error('Sync Error:', err)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDashboardData() }, [user?.doctorId])

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'

  const pendingCount = appointments.filter(a => a.status === 'pending').length
  const confirmedToday = appointments.filter(a => {
    const isToday = new Date(a.appointmentDate).toDateString() === now.toDateString()
    return a.status === 'confirmed' && isToday
  }).length

  const uniquePatients = new Set(appointments.map(a => a.patientId)).size
  const totalRelevantAppts = appointments.filter(a => a.status !== 'cancelled').length
  const completedCount = appointments.filter(a => a.status === 'completed').length
  const efficiency = totalRelevantAppts > 0 ? Math.round((completedCount / totalRelevantAppts) * 1000) / 10 : 0

  const incomeApts = appointments.filter(a => a.paymentStatus === 'paid' || a.status === 'completed')
  const totalIncome = incomeApts.reduce((sum, a) => sum + (a.fee || 2500), 0)

  const lastMonthIncome = incomeApts.filter(a => {
    const d = new Date(a.createdAt)
    return d.getMonth() === (now.getMonth() === 0 ? 11 : now.getMonth() - 1) && d.getFullYear() === (now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear())
  }).reduce((sum, a) => sum + (a.fee || 2500), 0)

  const currentMonthIncome = incomeApts.filter(a => {
    const d = new Date(a.createdAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).reduce((sum, a) => sum + (a.fee || 2500), 0)

  const incomeGrowth = lastMonthIncome === 0 ? 100 : Math.round(((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100)

  const getLast6MonthsIncome = () => {
    const data = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = d.toLocaleString('default', { month: 'short' })
      const monthlyAppts = incomeApts.filter(a => {
        const ad = new Date(a.createdAt)
        return ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear()
      })
      const value = monthlyAppts.reduce((sum, a) => sum + (a.fee || 2500), 0)
      data.push({ label, value })
    }
    return data
  }

  const statCards = [
    { label: 'Total Patients', icon: Users, val: uniquePatients, color: 'text-medigo-blue', bg: 'bg-medigo-blue/10', link: '/doctor/records', desc: 'Unique Lifetime Records', grad: 'from-blue-500/5 to-transparent' },
    { label: 'Active Roster', icon: Calendar, val: confirmedToday, color: 'text-emerald-500', bg: 'bg-emerald-500/10', link: '/doctor/appointments', desc: 'Confirmed for today', grad: 'from-emerald-500/5 to-transparent' },
    { label: 'Medical Load', icon: ClockIcon, val: pendingCount, color: 'text-amber-500', bg: 'bg-amber-500/10', link: '/doctor/appointments', desc: 'Awaiting consultation', grad: 'from-amber-500/5 to-transparent' },
  ]

  return (
    <DashboardLayout isDoctor={true}>
      <div className="relative min-h-screen bg-[#f8fafc]">
        {/* Animated Background Polish */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-16"
          >
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="px-3 py-1 bg-medigo-blue/10 rounded-full text-[10px] font-black text-medigo-blue uppercase tracking-[0.2em] flex items-center gap-2">
                      <Sparkles size={12} /> Live Hub
                   </div>
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <h1 className="text-5xl lg:text-7xl font-black text-medigo-navy tracking-tight leading-tight">
                  {greeting}, <br />
                  <span className="text-medigo-blue">Dr. {user?.name?.split(' ').pop()}</span>
                </h1>
                <p className="text-slate-400 text-xl font-medium max-w-2xl leading-relaxed">
                  Your digital practice is synchronized. We've optimized your <span className="text-medigo-navy font-bold">today's roster</span> with the latest clinical data.
                </p>
              </div>
              <div className="flex items-center gap-4 bg-white/50 backdrop-blur-xl p-3 rounded-[2rem] border border-white/60 shadow-xl">
                <button
                  onClick={fetchDashboardData}
                  disabled={loading}
                  className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-100 rounded-2xl text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
                >
                  <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                  <span>{loading ? 'Syncing...' : 'Sync Hub'}</span>
                </button>
                <Link to="/doctor/appointments">
                  <button className="px-10 py-4 bg-medigo-navy text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-premium hover:shadow-2xl transition-all active:scale-95">
                    Queue Console
                  </button>
                </Link>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {statCards.map((s, i) => (
                <Link to={s.link} key={i}>
                  <GlassCard className="p-10 group cursor-pointer relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${s.grad} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-8">
                        <div className={`w-20 h-20 rounded-[2rem] ${s.bg} flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6 duration-500 border border-white`}>
                          <s.icon size={36} className={s.color} />
                        </div>
                        <div className="p-3 bg-slate-50/50 rounded-2xl border border-white">
                          <ArrowRight size={18} className="text-slate-300 group-hover:text-medigo-blue group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-6xl font-black text-medigo-navy tracking-tighter mb-2">{s.val}</h3>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{s.label}</p>
                        <div className="mt-6 flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-medigo-mint animate-pulse" />
                          <span className="text-xs font-bold text-slate-500 tracking-tight">{s.desc}</span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 gap-12">
              <GlassCard className="p-12 relative overflow-hidden" hover={false}>
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between mb-16 gap-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 border border-emerald-100">
                        <DollarSign size={24} strokeWidth={3} />
                      </div>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Revenue Dynamics</h3>
                    </div>
                    <div className="flex items-baseline gap-6 mt-6">
                      <p className="text-7xl font-black text-medigo-navy tracking-tighter leading-none">
                        <span className="text-3xl text-slate-300 mr-2 font-bold">LKR</span>
                        {totalIncome.toLocaleString()}
                      </p>
                      <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest ${incomeGrowth >= 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                        {incomeGrowth >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {Math.abs(incomeGrowth)}% Growth
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Clinic Efficiency</p>
                    <div className="flex items-center gap-4">
                       <div className="w-48 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${efficiency}%` }} transition={{ duration: 2 }} className="h-full bg-medigo-blue" />
                       </div>
                       <p className="text-4xl font-black text-medigo-navy tracking-tight">{efficiency}%</p>
                    </div>
                  </div>
                </div>
                <BarChart data={getLast6MonthsIncome()} />
              </GlassCard>
            </div>

            {/* Bottom Grid: Clinical Roster & Records */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              {/* Clinical Roster (3 Columns) */}
              <GlassCard className="lg:col-span-3 p-12" hover={false}>
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600 border border-blue-100">
                      <CalendarDays size={24} />
                    </div>
                    <div className="space-y-1">
                       <h3 className="text-xl font-black text-medigo-navy tracking-tight">Practice Roster</h3>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Upcoming Clinical Sessions</p>
                    </div>
                  </div>
                  <Link to="/doctor/availability" className="group flex items-center gap-2 text-xs font-black text-medigo-blue uppercase tracking-widest">
                    Manage Roster 
                    <div className="w-8 h-8 rounded-full bg-medigo-blue/10 flex items-center justify-center group-hover:bg-medigo-blue group-hover:text-white transition-all">
                       <ArrowRight size={14} />
                    </div>
                  </Link>
                </div>

                <div className="space-y-5">
                  {availability.length === 0 ? (
                    <div className="py-24 text-center space-y-6">
                      <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto border border-slate-100">
                        <AlertCircle size={40} className="text-slate-200" />
                      </div>
                      <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">No active sessions configured</p>
                    </div>
                  ) : (
                    availability.slice(0, 5).map((session, i) => {
                      const meta = TYPE_META[session.consultationType] || TYPE_META['in-person']
                      const TypeIcon = meta.icon
                      const dateInfo = formatDate(session)
                      return (
                        <motion.div
                          key={session._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-slate-50/50 border border-slate-100 p-6 rounded-[2.5rem] flex items-center gap-8 group hover:bg-white hover:border-blue-100 hover:shadow-premium transition-all duration-300"
                        >
                          <div className={`w-20 h-20 rounded-[1.8rem] flex flex-col items-center justify-center shrink-0 border-2 ${
                            dateInfo ? 'bg-medigo-navy border-medigo-navy text-white' : 'bg-white border-slate-100 text-medigo-navy shadow-inner'
                          }`}>
                            {dateInfo ? (
                              <>
                                <span className="text-[10px] font-black uppercase opacity-60 tracking-tighter mb-0.5">{dateInfo.mon}</span>
                                <span className="text-3xl font-black leading-none mb-0.5">{dateInfo.num}</span>
                                <span className="text-[10px] font-black uppercase opacity-60 tracking-tighter">{dateInfo.day}</span>
                              </>
                            ) : (
                              <>
                                <CalendarDays size={24} className="mb-1 opacity-40" />
                                <span className="text-[11px] font-black uppercase tracking-tight">{session.day?.slice(0, 3)}</span>
                              </>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h4 className="text-xl font-black text-medigo-navy truncate tracking-tight">{session.hospital}</h4>
                              <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 ${meta.cls}`}>
                                <TypeIcon size={12} /> {meta.label}
                              </div>
                            </div>
                            <div className="flex items-center gap-6 text-xs font-bold text-slate-400">
                               <span className="flex items-center gap-2"><ClockIcon size={16} className="text-blue-500" /> <span className="text-slate-600">{session.startTime} – {session.endTime}</span></span>
                               <span className="flex items-center gap-2"><MapPin size={16} className="text-red-400" /> <span className="text-slate-600 truncate">{session.location}</span></span>
                               <span className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg border border-emerald-100"><Users size={14} /> {session.bookedCount || 0} booked</span>
                            </div>
                          </div>

                          <div className="text-right shrink-0 pr-4">
                             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Fee</p>
                             <p className="text-2xl font-black text-medigo-navy leading-none tracking-tighter">
                                <span className="text-xs text-slate-300 mr-1 font-bold">LKR</span>
                                {session.fee?.toLocaleString()}
                             </p>
                          </div>
                        </motion.div>
                      )
                    })
                  )}
                </div>
              </GlassCard>

              {/* Records Section (2 Columns) */}
              <div className="lg:col-span-2 grid grid-cols-1 gap-12">
                <motion.div
                  whileHover={{ y: -8 }}
                  className="bg-slate-900 rounded-[3rem] p-10 relative overflow-hidden flex flex-col h-full shadow-[0_30px_70px_rgba(15,23,42,0.4)] border border-white/5"
                >
                  <div className="absolute top-0 right-0 w-80 h-80 bg-medigo-blue/10 rounded-full blur-[100px] pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col h-full space-y-10">
                    <div className="flex items-center justify-between">
                      <div className="w-16 h-16 bg-white/10 backdrop-blur-2xl rounded-3xl flex items-center justify-center text-white border border-white/10 shadow-2xl">
                        <ShieldCheck size={32} />
                      </div>
                      <Link to="/doctor/records" className="group flex items-center gap-2 text-[11px] font-black text-blue-400 uppercase tracking-[0.2em] hover:text-blue-300 transition-colors">
                        Vault Access
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-4xl font-black text-white tracking-tight leading-[0.9]">Patient <br />Records</h3>
                      <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em]">End-to-End Encrypted</p>
                    </div>

                    <div className="flex-1 space-y-4 overflow-hidden">
                      {reports.length === 0 ? (
                        <div className="py-16 text-center space-y-4 opacity-30">
                           <Activity className="text-slate-500 mx-auto" size={40} />
                           <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">No recent activity</p>
                        </div>
                      ) : (
                        reports.slice(0, 4).map((report, i) => (
                          <motion.div
                            key={report._id}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-5 p-5 bg-white/5 border border-white/5 rounded-[2rem] group hover:bg-white/10 transition-all cursor-pointer"
                          >
                             <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-lg">
                                <FileText size={22} />
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className="text-md font-black text-slate-100 truncate tracking-tight">{report.patientName || 'Untitled Patient'}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate mt-0.5">
                                  {report.reportType || 'Record'} • {new Date(report.createdAt).toLocaleDateString()}
                                </p>
                             </div>
                             <ArrowRight size={16} className="text-slate-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                          </motion.div>
                        ))
                      )}
                    </div>

                    <Link to="/doctor/records" className="pt-6">
                      <button className="w-full py-5 bg-white hover:bg-blue-50 text-medigo-navy font-black text-sm uppercase tracking-[0.3em] rounded-3xl transition-all shadow-2xl active:scale-95 group">
                        Enter Secure Vault
                      </button>
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}