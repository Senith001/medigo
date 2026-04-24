import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  Search, Calendar, FileText, Activity, 
  Heart, User, ArrowRight, Video, 
  ChevronRight, Sparkles, MapPin, 
  Stethoscope, ShieldCheck
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const SPECIALTIES = [
  { name: 'Cardiology',       icon: Heart,  color: 'bg-red-50 text-red-600 border-red-100' },
  { name: 'Dermatology',      icon: Sparkles,  color: 'bg-amber-50 text-amber-600 border-amber-100' },
  { name: 'Neurology',        icon: Activity,  color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  { name: 'Orthopedics',      icon: User,  color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { name: 'Pediatrics',       icon: Sparkles,  color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { name: 'Psychiatry',       icon: ShieldCheck,  color: 'bg-sky-50 text-sky-600 border-sky-100' },
  { name: 'Gynecology',       icon: Heart,  color: 'bg-rose-50 text-rose-600 border-rose-100' },
  { name: 'General Medicine', icon: Stethoscope,  color: 'bg-teal-50 text-teal-600 border-teal-100' },
]

export default function PatientDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [doctorName, setDoctorName] = useState('')
  const [specialty, setSpecialty] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/search?specialty=${specialty}&name=${doctorName}`)
  }

  return (
    <DashboardLayout isPatient={true}>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Welcome Header */}
        <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-medigo-navy tracking-tight">
              Welcome back, <br className="sm:hidden" />
              <span className="text-medigo-blue">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-500 font-medium">Your health journey is looking great today. What can we help you with?</p>
          </div>
          
          <div className="flex items-center gap-3">
             <Button variant="outline" size="sm" onClick={() => navigate('/appointments')}>
                <Calendar size={16} className="mr-2" /> My Schedule
             </Button>
             <Button size="sm" onClick={() => navigate('/search')}>
                <Video size={16} className="mr-2" /> Book Consultaion
             </Button>
          </div>
        </section>

        {/* Quick Search Card */}
        <section className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-premium border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-blue-50 text-medigo-blue rounded-xl">
                <Search size={20} />
             </div>
             <h2 className="text-lg font-extrabold text-medigo-navy tracking-tight">Find a Specialist</h2>
          </div>
          
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4">
             <div className="md:col-span-5">
                <Input 
                   placeholder="Search by doctor name..." 
                   value={doctorName} 
                   onChange={e => setDoctorName(e.target.value)}
                   icon={User}
                />
             </div>
             <div className="md:col-span-4">
                <div className="relative group h-full">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-medigo-blue transition-colors">
                    <Stethoscope size={18} />
                  </div>
                  <select 
                    value={specialty} 
                    onChange={e => setSpecialty(e.target.value)}
                    className="block w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/10 appearance-none font-medium text-slate-900 transition-all h-[50px]"
                  >
                    <option value="">All Specialties</option>
                    {SPECIALTIES.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
             </div>
             <div className="md:col-span-3">
                <Button type="submit" className="w-full h-[50px] shadow-lg">
                   Search Doctors
                </Button>
             </div>
          </form>

          <div className="mt-6 flex flex-wrap items-center gap-2">
             <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mr-2">Quick Search:</span>
             {['Cardiology', 'Pediatrics', 'Neurology'].map(s => (
                <button 
                   key={s} 
                   onClick={() => navigate(`/search?specialty=${s}`)}
                   className="px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-slate-600 text-[13px] font-bold hover:bg-medigo-blue hover:text-white hover:border-medigo-blue transition-all"
                >
                   {s}
                </button>
             ))}
          </div>
        </section>

        {/* Categories Grid */}
        <section className="space-y-6">
           <div className="flex justify-between items-end">
              <h2 className="text-xl font-black text-medigo-navy tracking-tight">Browse Categories</h2>
              <Link to="/search" className="text-sm font-bold text-medigo-blue hover:underline flex items-center gap-1">
                 View All Specialists <ChevronRight size={14} />
              </Link>
           </div>

           <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
              {SPECIALTIES.slice(0, 8).map((s, i) => (
                <motion.button
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  key={s.name}
                  onClick={() => navigate(`/search?specialty=${s.name}`)}
                  className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-premium transition-all text-center group"
                >
                  <div className={`w-14 h-14 rounded-2xl ${s.color} border flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                     <s.icon size={28} />
                  </div>
                  <h3 className="text-[14px] font-black text-medigo-navy tracking-tight leading-tight">{s.name}</h3>
                </motion.button>
              ))}
           </div>
        </section>

        {/* Stats Section with Glassmorphism */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
           {[
              { label: 'Verified Experts', val: '500+', icon: ShieldCheck, color: 'text-medigo-blue' },
              { label: 'Global Network', val: '20+', icon: MapPin, color: 'text-medigo-mint' },
              { label: 'Monthly Care', val: '50k+', icon: Activity, color: 'text-indigo-500' },
              { label: 'Patient Rating', val: '4.9★', icon: Sparkles, color: 'text-amber-500' },
           ].map((stat, i) => (
              <div key={i} className="bg-white/40 backdrop-blur-sm border border-white/50 p-6 rounded-3xl flex items-center gap-4">
                 <div className={`p-3 bg-white rounded-2xl shadow-sm ${stat.color}`}>
                    <stat.icon size={24} />
                 </div>
                 <div>
                    <p className="text-2xl font-black text-medigo-navy tracking-tight leading-none">{stat.val}</p>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
                 </div>
              </div>
           ))}
        </section>

        {/* Promotion Card */}
        <section className="bg-gradient-to-br from-medigo-navy to-[#1e293b] p-8 sm:p-12 rounded-[2.5rem] relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-medigo-blue/10 blur-[100px] rounded-full pointer-events-none" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-medigo-teal/10 blur-[100px] rounded-full pointer-events-none" />
           
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1 space-y-6 text-center md:text-left">
                 <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 px-4 py-1.5 rounded-full">
                    <Sparkles size={16} className="text-medigo-teal" />
                    <span className="text-xs font-bold text-white uppercase tracking-widest">New Feature</span>
                 </div>
                 <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight">
                    Get AI-Powered <br/>
                    Health Recommendations
                 </h2>
                 <p className="text-slate-300 text-lg max-w-md mx-auto md:mx-0">
                    Connect your health data and get instant insights from our AI clinical assistant.
                 </p>
                 <div className="pt-2">
                    <Button className="h-14 px-8 text-lg">
                       Try AI Assistant <ArrowRight size={20} className="ml-2" />
                    </Button>
                 </div>
              </div>
              
              <div className="w-full max-w-xs relative animate-float">
                 <div className="absolute -inset-4 bg-medigo-blue/20 blur-2xl rounded-full" />
                 <img 
                    src="https://images.unsplash.com/photo-1576091160550-21735999181c?w=1600&q=80&fit=crop" 
                    alt="AI Health" 
                    className="w-full aspect-square object-cover rounded-[3rem] shadow-2xl relative z-10 border-4 border-white/10"
                 />
                 <div className="absolute -bottom-6 -right-6 glass p-4 rounded-2xl shadow-premium z-20 border border-white/20">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-medigo-mint rounded-full flex items-center justify-center text-white">
                          <ShieldCheck size={16} />
                       </div>
                       <p className="text-[12px] font-bold text-medigo-navy leading-none">AI Verified Analysis</p>
                    </div>
                 </div>
              </div>
           </div>
        </section>
      </motion.div>
    </DashboardLayout>
  )
}