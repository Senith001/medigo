import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  Search, Calendar, FileText, Activity, 
  Heart, User, Video, ChevronRight, 
  Stethoscope, ShieldCheck, Clock, MapPin, Pill,
  ArrowRight, CalendarDays
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { appointmentAPI } from '../../services/api'
import DashboardLayout from '../../components/DashboardLayout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const SPECIALTIES = [
  { name: 'Cardiology',       icon: Heart,  color: 'bg-red-50 text-red-600 border-red-100' },
  { name: 'Dermatology',      icon: Activity,  color: 'bg-amber-50 text-amber-600 border-amber-100' },
  { name: 'Neurology',        icon: Activity,  color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  { name: 'Pediatrics',       icon: User,  color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
]

export default function PatientDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [doctorName, setDoctorName] = useState('')
  const [specialty, setSpecialty] = useState('')

  useEffect(() => {
    const fetchApts = async () => {
      try {
        const res = await appointmentAPI.getAll({ limit: 50 })
        setAppointments(res.data.appointments || [])
      } catch (err) {
        console.error("Failed fetching appointments", err)
      } finally {
        setLoading(false)
      }
    }
    fetchApts()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/search?specialty=${specialty}&name=${doctorName}`)
  }

  // Derived logic for upcoming and recent
  const upcomingAppointments = appointments
    .filter(a => new Date(a.appointmentDate) >= new Date() && ['pending', 'confirmed'].includes(a.status))
    .sort((a,b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
  
  const nextAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null
  const recentHistory = appointments.filter(a => a.status === 'completed').slice(0, 3)

  // Determine if next appointment is today
  const isToday = nextAppointment && new Date(nextAppointment.appointmentDate).toDateString() === new Date().toDateString()

  return (
    <DashboardLayout isPatient={true}>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8 pb-20"
      >
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-medigo-navy tracking-tight">
              Good morning, <span className="text-medigo-blue">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-500 font-medium">Your personal health portal is up to date.</p>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" className="border-slate-200 text-slate-600 bg-white shadow-sm" onClick={() => navigate('/appointments')}>
                <Calendar size={18} className="mr-2" /> Schedule
             </Button>
             <Button onClick={() => navigate('/search')} className="shadow-lg shadow-blue-500/20">
                <Search size={18} className="mr-2" /> Find Doctor
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Primary View: Left Column (Spans 2) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Dynamic Next Appointment Banner */}
            {loading ? (
              <div className="bg-white rounded-[2.5rem] h-48 animate-pulse border border-slate-100 shadow-sm" />
            ) : nextAppointment ? (
              <div className={`relative overflow-hidden rounded-[2.5rem] shadow-premium p-8 sm:p-10 ${isToday ? 'bg-gradient-to-br from-medigo-navy to-[#0F172A]' : 'bg-white border border-slate-100'}`}>
                {isToday && (
                  <>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-medigo-blue/20 rounded-full blur-[80px]" />
                    <div className="absolute top-4 right-6 px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-full animate-pulse">
                      Happening Today
                    </div>
                  </>
                )}
                
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2.5 rounded-xl ${isToday ? 'bg-white/10 text-medigo-mint backdrop-blur-md' : 'bg-blue-50 text-medigo-blue'}`}>
                    <CalendarDays size={20} />
                  </div>
                  <h2 className={`text-sm font-black uppercase tracking-widest ${isToday ? 'text-blue-200' : 'text-slate-400'}`}>Up Next</h2>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                  <div className="space-y-1">
                    <p className={`text-sm font-bold ${isToday ? 'text-slate-300' : 'text-slate-500'}`}>
                      {new Date(nextAppointment.appointmentDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric'})}
                    </p>
                    <h3 className={`text-3xl font-black tracking-tight ${isToday ? 'text-white' : 'text-medigo-navy'}`}>
                      {nextAppointment.timeSlot}
                    </h3>
                    <div className="flex items-center gap-3 mt-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-medigo-blue flex items-center justify-center text-white font-black text-sm shadow-md border-2 border-white">
                        {nextAppointment.doctorName?.charAt(0)}
                      </div>
                      <div>
                        <p className={`font-bold ${isToday ? 'text-white' : 'text-slate-800'}`}>Dr. {nextAppointment.doctorName}</p>
                        <p className={`text-xs font-bold ${isToday ? 'text-slate-400' : 'text-slate-500'} flex items-center gap-1 uppercase tracking-wide`}>
                          {nextAppointment.type === 'telemedicine' ? <Video size={12}/> : <MapPin size={12}/>}
                          {nextAppointment.type === 'telemedicine' ? 'Video Consult' : 'Clinic Visit'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    {nextAppointment.status === 'confirmed' && nextAppointment.type === 'telemedicine' ? (
                      <Button 
                        onClick={() => navigate(`/telemedicine/lobby/${nextAppointment._id}`)}
                        className={`w-full md:w-auto h-14 px-8 text-lg ${isToday ? 'bg-medigo-mint text-medigo-navy hover:bg-emerald-400' : 'bg-medigo-blue text-white'}`}
                      >
                        <Video size={20} className="mr-2" /> Enter Clinic Lobby
                      </Button>
                    ) : (
                      <Button variant={isToday ? "outline" : "primary"} onClick={() => navigate('/appointments')} className="w-full md:w-auto h-14 px-8 text-lg">
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-100/50 rounded-[2.5rem] shadow-sm p-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-xl font-black text-medigo-navy mb-2">No Upcoming Sessions</h2>
                  <p className="text-slate-500 font-medium max-w-md">You're all caught up! Book a new consultation when you're ready to see a doctor.</p>
                </div>
                <Button onClick={() => navigate('/search')} className="h-12 px-6">
                  Book Session <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>
            )}

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                 { title: 'New Booking', icon: Search, bg: 'bg-blue-50', text: 'text-blue-600', link: '/search' },
                 { title: 'Prescriptions', icon: Pill, bg: 'bg-emerald-50', text: 'text-emerald-600', link: '/prescriptions' },
                 { title: 'Test Reports', icon: FileText, bg: 'bg-indigo-50', text: 'text-indigo-600', link: '/reports' },
                 { title: 'Payments', icon: ShieldCheck, bg: 'bg-amber-50', text: 'text-amber-600', link: '/payments' },
               ].map((action, i) => (
                 <Link to={action.link} key={i}>
                   <motion.div whileHover={{ y: -4 }} className="bg-white border border-slate-100 p-5 rounded-[1.5rem] text-center shadow-sm hover:shadow-premium transition-all group">
                     <div className={`w-12 h-12 mx-auto rounded-2xl ${action.bg} ${action.text} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                       <action.icon size={24} />
                     </div>
                     <p className="text-xs font-black text-medigo-navy uppercase tracking-widest">{action.title}</p>
                   </motion.div>
                 </Link>
               ))}
            </div>

            {/* Find Doctor Widget */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
               <h3 className="text-lg font-black text-medigo-navy mb-6 flex items-center gap-2">
                 <Stethoscope size={20} className="text-medigo-blue" /> Need a Specialist?
               </h3>
               <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-10 gap-4 mb-6">
                 <div className="md:col-span-4 block">
                    <Input placeholder="Symptoms or Doctor name" value={doctorName} onChange={e=>setDoctorName(e.target.value)} icon={Activity} className="bg-slate-50 border-transparent shadow-none" />
                 </div>
                 <div className="md:col-span-4 block">
                    <select value={specialty} onChange={e=>setSpecialty(e.target.value)} className="w-full h-[50px] pl-4 pr-10 bg-slate-50 border border-slate-50 focus:bg-white rounded-xl text-sm font-medium outline-none focus:border-medigo-blue transition-colors">
                      <option value="">All Specialties</option>
                      {SPECIALTIES.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                    </select>
                 </div>
                 <div className="md:col-span-2 block">
                    <Button type="submit" className="w-full h-[50px]">Search</Button>
                 </div>
               </form>
               <div className="flex flex-wrap gap-2">
                 {SPECIALTIES.map((s, idx) => (
                   <button key={idx} onClick={() => navigate(`/search?specialty=${s.name}`)} className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors uppercase tracking-widest border border-slate-100">
                     {s.name}
                   </button>
                 ))}
               </div>
            </div>

          </div>

          {/* Side Column (Spans 1) */}
          <div className="space-y-8">
            
            {/* Vitals / Health Score Mock */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
               <div className="absolute -top-4 -right-4 text-rose-50 opacity-50">
                 <Heart size={120} />
               </div>
               <div className="relative z-10">
                 <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Health Overview</h3>
                 
                 <div className="space-y-6">
                   <div>
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Blood Pressure</p>
                     <div className="flex items-end gap-2">
                       <p className="text-3xl font-black text-medigo-navy leading-none tracking-tight">120/80</p>
                       <p className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded uppercase pb-0.5">Optimal</p>
                     </div>
                   </div>
                   
                   <div>
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Heart Rate</p>
                     <div className="flex items-end gap-2">
                       <p className="text-3xl font-black text-medigo-navy leading-none tracking-tight">72</p>
                       <p className="text-sm font-bold text-slate-400 pb-0.5">bpm</p>
                     </div>
                   </div>

                   <div>
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Weekly Activity</p>
                     <div className="flex items-end gap-1.5 h-10">
                       {[40, 70, 45, 90, 60, 85, 30].map((val, i) => (
                         <div key={i} className="flex-1 bg-slate-100 rounded-t-md relative flex items-end">
                           <motion.div initial={{height:0}} animate={{height: `${val}%`}} transition={{delay: i*0.1}} className="w-full bg-blue-200 rounded-t-md" />
                         </div>
                       ))}
                     </div>
                     <div className="flex justify-between mt-1 text-[9px] font-bold text-slate-300 uppercase">
                       <span>Mon</span><span>Sun</span>
                     </div>
                   </div>
                 </div>
               </div>
            </div>

            {/* Recent Completed Appointments */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
               <div className="flex items-center justify-between mb-6">
                 <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Recent Visits</h3>
                 <Link to="/appointments" className="text-[10px] font-black text-medigo-blue uppercase tracking-widest hover:underline">View All</Link>
               </div>
               
               {recentHistory.length === 0 ? (
                 <p className="text-sm font-medium text-slate-400 py-4 text-center bg-slate-50 rounded-2xl">No recent history.</p>
               ) : (
                 <div className="space-y-4">
                   {recentHistory.map(apt => (
                     <div key={apt._id} className="flex gap-4 items-start pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                       <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                         {apt.type === 'telemedicine' ? <Video size={16} className="text-slate-400" /> : <Stethoscope size={16} className="text-slate-400" />}
                       </div>
                       <div>
                         <p className="text-sm font-bold text-medigo-navy">Dr. {apt.doctorName}</p>
                         <p className="text-xs font-medium text-slate-400">{new Date(apt.appointmentDate).toLocaleDateString()} • {apt.type === 'telemedicine' ? 'Video' : 'Clinic'}</p>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>

          </div>

        </div>
      </motion.div>
    </DashboardLayout>
  )
}