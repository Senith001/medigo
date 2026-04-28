import { useState, useEffect } from 'react'
import {
  Users, Calendar, Activity, CheckCircle2, ChevronRight,
  RefreshCw, FileText, AlertCircle, TrendingUp, TrendingDown,
  DollarSign, Clock
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { appointmentAPI } from '../../services/api'
import DashboardLayout from '../../components/DashboardLayout'
import Button from '../../components/ui/Button'
import { Link } from 'react-router-dom'

const BarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end justify-between h-48 mt-8 pb-4">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1 group">
          <div className="w-full px-1.5 relative flex justify-center h-[120px] items-end">
            {/* Tooltip */}
            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-medigo-navy text-white text-[10px] font-bold py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap z-10">
              Rs. {d.value.toLocaleString()}
            </div>
            {/* Bar */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.value / max) * 100}%` }}
              transition={{ duration: 1, delay: i * 0.1, type: "spring", stiffness: 50 }}
              className={`w-full max-w-[28px] rounded-t-lg bg-gradient-to-t ${
                i === data.length - 1
                  ? 'from-medigo-blue to-[#40B0FF] shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                  : 'from-blue-100 to-blue-200'
              }`}
            />
          </div>
          <span className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

const LineChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.value), 4)
  const min = Math.min(...data.map(d => d.value), 0)
  const range = max - min || 1

  return (
    <div className="relative h-40 mt-8 w-full">
      <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(37, 99, 235, 0.2)" />
            <stop offset="100%" stopColor="rgba(37, 99, 235, 0)" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {[0, 0.5, 1].map((ratio) => (
          <line
            key={ratio}
            x1="0"
            y1={ratio * 100 + "%"}
            x2="100%"
            y2={ratio * 100 + "%"}
            stroke="#f1f5f9"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}

        {/* Path data */}
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          d={`M ${data.map((d, i) => {
            const x = (i / (Math.max(data.length - 1, 1))) * 100
            const y = 100 - ((d.value - min) / range) * 100
            return `${x},${y}`
          }).join(' L ')}`}
          fill="none"
          stroke="#2563EB"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Area fill */}
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          d={`M 0,100 L ${data.map((d, i) => {
            const x = (i / (Math.max(data.length - 1, 1))) * 100
            const y = 100 - ((d.value - min) / range) * 100
            return `${x},${y}`
          }).join(' L ')} L 100,100 Z`}
          fill="url(#lineGrad)"
          vectorEffect="non-scaling-stroke"
        />

        {/* Data points */}
        {data.map((d, i) => {
          const x = (i / (Math.max(data.length - 1, 1))) * 100
          const y = 100 - ((d.value - min) / range) * 100
          return (
            <g key={i} className="group">
              <circle cx={`${x}%`} cy={`${y}%`} r="4" fill="white" stroke="#2563EB" strokeWidth="2" className="transition-all hover:r-6" />
              <text x={`${x}%`} y={`${y - 15}%`} textAnchor="middle" fill="#1e293b" fontSize="10" fontWeight="bold" className="opacity-0 group-hover:opacity-100 transition-opacity">
                {d.value} pts
              </text>
            </g>
          )
        })}
      </svg>
      {/* X Axis Labels */}
      <div className="flex justify-between items-center absolute -bottom-6 w-full px-1">
        {data.map((d, i) => (
          <span key={i} className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">{d.label}</span>
        ))}
      </div>
    </div>
  )
}

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchApts = async () => {
    setLoading(true)
    try {
      // Fetch up to 1000 appointments so we can build accurate historical analytics
      const res = await appointmentAPI.getAll({ limit: 1000 })
      setAppointments(res.data.appointments || [])
    } catch {
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchApts() }, [])

  // Derived Analytics Data
  const now = new Date()
  
  // Basic Stats
  const pendingCount = appointments.filter(a => a.status === 'pending').length
  const completedCount = appointments.filter(a => a.status === 'completed').length
  const confirmedToday = appointments.filter(a => {
    const isToday = new Date(a.appointmentDate).toDateString() === now.toDateString()
    return a.status === 'confirmed' && isToday
  }).length

  // Financial Stats (Paid or Completed)
  const incomeApts = appointments.filter(a => a.paymentStatus === 'paid' || a.status === 'completed')
  const totalIncome = incomeApts.reduce((sum, a) => sum + (a.fee || 2500), 0)
  
  // Last Month Income
  const lastMonthIncome = incomeApts.filter(a => {
    const d = new Date(a.createdAt)
    return d.getMonth() === (now.getMonth() === 0 ? 11 : now.getMonth() - 1) && d.getFullYear() === (now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear())
  }).reduce((sum, a) => sum + (a.fee || 2500), 0)
  
  const currentMonthIncome = incomeApts.filter(a => {
    const d = new Date(a.createdAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).reduce((sum, a) => sum + (a.fee || 2500), 0)

  const incomeGrowth = lastMonthIncome === 0 ? 100 : Math.round(((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100)

  // Chart Data: Last 6 Months Income
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

  // Chart Data: Last 7 Days Appointments
  const getWeeklyAppts = () => {
    const data = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const label = d.toLocaleString('default', { weekday: 'short' })
      const dailyAppts = appointments.filter(a => new Date(a.appointmentDate).toDateString() === d.toDateString())
      data.push({ label, value: dailyAppts.length })
    }
    return data
  }

  const statCards = [
    { label: 'Pending Consultations', icon: Clock, val: pendingCount, color: 'text-amber-600 bg-amber-50 border-amber-100', link: '/doctor/appointments' },
    { label: 'Sessions Today', icon: Calendar, val: confirmedToday, color: 'text-medigo-blue bg-blue-50 border-blue-100', link: '/doctor/appointments' },
    { label: 'Total Treated', icon: CheckCircle2, val: completedCount, color: 'text-emerald-600 bg-emerald-50 border-emerald-100', link: '/doctor/records' },
  ]

  // Group Today's Appointments into Sessions
  const getTodaySessions = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todaysAppts = appointments.filter(a => {
      const aptDate = new Date(a.appointmentDate)
      aptDate.setHours(0, 0, 0, 0)
      return aptDate.getTime() === today.getTime()
    })

    const groups = {}
    todaysAppts.forEach(a => {
      const key = `${a.timeSlot}_${a.type}`
      if (!groups[key]) {
        groups[key] = { id: key, timeSlot: a.timeSlot, type: a.type, appointments: [] }
      }
      groups[key].appointments.push(a)
    })

    return Object.values(groups).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
  }
  const todaysSessions = getTodaySessions()

  return (
    <DashboardLayout isDoctor={true}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8 pb-20"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-medigo-navy tracking-tight">Medical Hub</h1>
            <p className="text-slate-500 font-medium">Welcome back, Dr. {user?.name?.split(' ').pop()}. Here's your clinic pulse today.</p>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" size="sm" onClick={fetchApts} loading={loading}>
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Sync
             </Button>
             <Link to="/doctor/appointments">
               <Button size="sm" className="bg-medigo-navy text-white">
                 View Queue
               </Button>
             </Link>
          </div>
        </div>

        {/* Highlight KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((s, i) => (
            <Link to={s.link} key={i}>
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 cursor-pointer hover:shadow-premium transition-all"
              >
                <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center border shadow-sm ${s.color}`}>
                  <s.icon size={26} />
                </div>
                <div>
                  <p className="text-3xl font-black text-medigo-navy leading-none tracking-tight">{s.val}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5">{s.label}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Charts & Income Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Income Graph */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <DollarSign size={16} strokeWidth={3} />
                  </div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Revenue Analytics</h3>
                </div>
                <div className="flex items-end gap-3 mt-1">
                  <p className="text-4xl font-black text-medigo-navy tracking-tighter shrink-0">
                    <span className="text-xl text-slate-400 pr-1">Rs.</span>
                    {totalIncome.toLocaleString()}
                  </p>
                  <div className={`flex items-center gap-1 mb-1.5 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${incomeGrowth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {incomeGrowth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(incomeGrowth)}%
                  </div>
                </div>
              </div>
            </div>
            
            <BarChart data={getLast6MonthsIncome()} />
          </div>

          {/* Activity Line Graph */}
          <div className="bg-gradient-to-br from-[#0F172A] to-medigo-navy rounded-[2.5rem] shadow-premium p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                   <div className="p-2 bg-white/10 text-white rounded-lg backdrop-blur-md">
                     <Activity size={16} />
                   </div>
                   <h3 className="text-sm font-black text-blue-200 uppercase tracking-widest">Weekly Load</h3>
                 </div>
              </div>
              <p className="text-3xl font-black text-white tracking-tighter">
                {getWeeklyAppts().reduce((acc, a) => acc + a.value, 0)} <span className="text-sm font-medium text-slate-400 font-inter">patients this week</span>
              </p>
            </div>
            
            <div className="mt-4 relative z-10">
               <LineChart data={getWeeklyAppts()} />
            </div>
          </div>
        </div>

        {/* Split View: Recent vs Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 sm:p-8 flex items-center justify-between border-b border-slate-50">
              <h2 className="text-xl font-extrabold text-medigo-navy tracking-tight mt-1">Today's Sessions</h2>
              <Link to="/doctor/appointments" className="text-sm font-bold text-medigo-blue hover:text-blue-700 flex items-center bg-blue-50 px-4 py-2 rounded-xl transition-all">
                Manage Queue <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
            {todaysSessions.length === 0 ? (
              <div className="p-12 text-center">
                 <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-[1.25rem] flex items-center justify-center mx-auto mb-3">
                   <AlertCircle size={24} className="text-slate-300" />
                 </div>
                 <p className="text-slate-400 font-medium text-sm">No sessions scheduled for today.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {todaysSessions.map(session => (
                  <div key={session.id} className="p-6 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-black shadow-sm ${
                        session.type === 'telemedicine' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {session.type === 'telemedicine' ? <Users size={20} /> : <Users size={20} />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-medigo-navy flex items-center gap-2">
                           {session.timeSlot} 
                           <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-widest ${session.type === 'telemedicine' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                              {session.type === 'telemedicine' ? 'Video' : 'Clinic'}
                           </span>
                        </p>
                        <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wide">
                           {session.appointments.length} Patient{session.appointments.length !== 1 && 's'} Booked
                        </p>
                      </div>
                    </div>
                    <Link to="/doctor/appointments">
                       <Button variant="outline" size="sm" className="w-full sm:w-auto text-slate-500 hover:text-medigo-navy hover:bg-slate-50">
                         View Roster
                       </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] shadow-xl p-8 relative overflow-hidden flex flex-col justify-end min-h-[300px]">
             <div className="absolute top-0 right-0 w-64 h-64 bg-[#008080] rounded-full mix-blend-screen filter blur-3xl opacity-20" />
             <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-medigo-blue rounded-full mix-blend-screen filter blur-3xl opacity-30" />
             
             <div className="relative z-10">
               <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-6 border border-white/10">
                 <FileText size={24} />
               </div>
               <h3 className="text-2xl font-black text-white leading-tight mb-2">Patient Records</h3>
               <p className="text-sm text-slate-400 font-medium mb-6">Manage history, medical records, and issue new prescriptions securely.</p>
               <Link to="/doctor/records">
                 <Button className="w-full bg-white hover:bg-slate-50 text-medigo-navy font-black">
                   Access Secure Files
                 </Button>
               </Link>
             </div>
          </div>
        </div>

      </motion.div>
    </DashboardLayout>
  )
}
