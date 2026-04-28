import { useEffect, useState } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { 
  User, Mail, Phone, 
  MapPin, CreditCard, ShieldCheck,
  ChevronLeft, ArrowRight, Wallet,
  Building2, Calendar, Clock,
  Loader2, BadgePercent, ShieldAlert,
  ChevronRight, Lock, Map, 
  Stethoscope, Info, AlertCircle,
  X, BadgeCheck, Star
} from "lucide-react"
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from '../../components/DashboardLayout'
import Button from '../../components/ui/Button'
import { appointmentAPI, patientAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function Checkout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { sessionId } = useParams()
  const { user } = useAuth()
  const { doctor, session, selectedMode } = location.state || {}
  
  const [form, setForm] = useState({
    title: 'Mr',
    fullName: '',
    email: '',
    phone: '',
    nic: '',
    patientNote: '',
    idType: 'NIC'
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await patientAPI.getMyProfile()
        if (res.data.success) {
          const profile = res.data.data
          setForm(prev => ({
            ...prev,
            title: profile.gender === 'female' ? 'Ms' : 'Mr',
            fullName: profile.fullName || user?.name || '',
            email: profile.email || user?.email || '',
            phone: profile.phone?.replace('+94', '') || '',
            nic: profile.nic || '',
          }))
        }
      } catch (err) {
        console.error("Failed to fetch patient profile:", err)
        if (user) {
          setForm(prev => ({
            ...prev,
            fullName: user.name || '',
            email: user.email || ''
          }))
        }
      }
    }
    fetchProfile()
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    
    // Validation
    if (!form.fullName.trim()) return setError('Please enter patient full name.')
    if (!form.phone.trim()) return setError('Please enter mobile number.')
    if (form.phone.length < 9) return setError('Please enter a valid mobile number.')
    if (!form.nic.trim()) return setError('Please enter NIC or Passport number.')

    setLoading(true)
    setError(null)

    try {
      const res = await appointmentAPI.book({
        doctorId: doctor._id || doctor.id,
        sessionId: session._id || sessionId, // Link to exactly this session
        doctorName: doctor.fullName,
        doctorEmail: doctor.email,
        specialty: doctor.specialty,
        appointmentDate: session.date,
        timeSlot: `${session.startTime} - ${session.endTime}`,
        fee: total,
        hospital: session.hospital || 'MediGo Central Clinic',
        type: selectedMode || session.consultationType || 'telemedicine',
        reason: form.patientNote.trim() || null,
        metadata: {
          patientNic: form.nic,
          patientPhone: form.phone
        }
      })
      
      if (res.data.appointment?._id) {
        navigate(`/payment/${res.data.appointment._id}`)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Clinical Reservation Protocol failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const feeDetails = {
    doctor: session?.fee || 2500,
    service: 199,
    discount: 0
  }
  const total = feeDetails.doctor + feeDetails.service - feeDetails.discount

  if (!doctor || !session) return (
    <DashboardLayout isPatient={true}>
      <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
         <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500">
            <ShieldAlert size={40} />
         </div>
         <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic">Session Context Lost</p>
         <Button onClick={() => navigate('/search')}>Restart Booking Flow</Button>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout isPatient={true}>
      <div className="max-w-7xl mx-auto space-y-8 pb-20 font-inter px-4 sm:px-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
           <div className="space-y-1">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group hover:text-medigo-blue transition-colors mb-2"
              >
                <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Back to Specialist Sessions
              </button>
              <h1 className="text-4xl font-black text-medigo-navy uppercase tracking-tighter italic leading-tight">Place <span className="text-medigo-blue">Appointment</span></h1>
           </div>
           
           <div className="flex items-center gap-4 py-3 px-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Secure Session Pipeline Active</span>
           </div>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Column 1: Specialist & Session Details (Left) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Specialist Card */}
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-50 overflow-hidden">
               <div className="p-8 text-center space-y-4">
                  <div className="w-32 h-32 mx-auto rounded-[2rem] bg-gradient-to-tr from-slate-50 to-blue-50 border border-slate-100 flex items-center justify-center text-3xl font-black text-medigo-blue shadow-inner relative group">
                     {doctor.fullName?.replace('Dr. ', '').split(' ').map(n => n[0]).join('').slice(0, 2)}
                     <div className="absolute inset-0 bg-medigo-blue/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-medigo-navy uppercase italic tracking-tighter leading-none">{doctor.fullName}</h3>
                    <p className="text-[10px] font-black text-medigo-blue uppercase tracking-widest mt-2">{doctor.specialty}</p>
                  </div>
                  <button 
                    onClick={() => setShowProfile(true)}
                    className="w-full h-11 bg-medigo-navy text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    View Specialist Profile
                  </button>
               </div>
            </div>

            {/* Session Card */}
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-50 overflow-hidden">
               <div className="p-8 space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                        <Building2 size={24} />
                     </div>
                     <div>
                        <h4 className="text-sm font-black text-medigo-navy uppercase tracking-tighter italic">{session.hospital || 'Private Clinic'}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{session.location || 'Colombo, Sri Lanka'}</p>
                     </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-50">
                     <div className="flex items-center gap-4">
                        <Calendar size={18} className="text-slate-300" />
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Session date</p>
                           <p className="text-xs font-bold text-slate-900">{session.date}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <Clock size={18} className="text-slate-300" />
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Session time</p>
                           <p className="text-xs font-bold text-slate-900 lowercase">{session.startTime} - {session.endTime}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <ShieldCheck size={18} className="text-slate-300" />
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Appointment no</p>
                           <p className="text-xs font-black text-medigo-blue italic tracking-tighter">
                             #{String((session?.bookedCount || 0) + 1).padStart(2, '0')}
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 italic">
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Your estimated appointment time is depending on the time spend with patients / applicants ahead of you.</p>
               </div>
            </div>
          </div>

          {/* Column 2: Patient Information (Center) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-[3rem] shadow-premium border border-slate-50 overflow-hidden">
               <div className="bg-slate-900 p-8 flex items-center justify-between text-white">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-medigo-blue italic">Authenticated Session</h3>
                    <p className="text-lg font-black tracking-tighter uppercase italic mt-1">Patient Identity Metadata</p>
                  </div>
                  <div className="px-4 py-2 border border-white/10 rounded-xl bg-white/5 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-medigo-blue flex items-center justify-center">
                        <User size={16} />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest">Active Member</span>
                  </div>
               </div>

               <form onSubmit={handleSubmit} className="p-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* Title & Name */}
                     <div className="md:col-span-1 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic ml-1">Title *</label>
                        <select 
                          name="title" 
                          value={form.title} 
                          onChange={handleInputChange}
                          className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 outline-none focus:border-medigo-blue transition-colors text-xs font-bold uppercase tracking-widest"
                        >
                          <option>Mr</option>
                          <option>Ms</option>
                          <option>Dr</option>
                          <option>Rev</option>
                        </select>
                     </div>
                     <div className="md:col-span-1 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic ml-1">Full Name *</label>
                        <div className="relative group">
                           <input 
                             name="fullName"
                             value={form.fullName}
                             onChange={handleInputChange}
                             placeholder="Enter patient name" 
                             className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 outline-none focus:border-medigo-blue transition-colors text-xs font-bold"
                           />
                           <User className="absolute left-4 top-4 text-slate-300 group-focus-within:text-medigo-blue transition-colors" size={18} />
                        </div>
                     </div>

                     {/* Mobile & Email */}
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic ml-1">Mobile Number *</label>
                        <div className="relative flex gap-2">
                           <div className="h-14 bg-slate-100 border border-slate-100 rounded-2xl px-4 flex items-center text-[10px] font-black text-slate-500 italic">+94</div>
                           <input 
                             name="phone"
                             value={form.phone}
                             onChange={handleInputChange}
                             placeholder="71XXXXXXX" 
                             className="flex-1 h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 outline-none focus:border-medigo-blue transition-colors text-xs font-bold"
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic ml-1">Email Address</label>
                        <div className="relative group">
                           <input 
                             name="email"
                             value={form.email}
                             onChange={handleInputChange}
                             placeholder="Receipt will send to this email" 
                             className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 outline-none focus:border-medigo-blue transition-colors text-xs font-bold"
                           />
                           <Mail className="absolute left-4 top-4 text-slate-300 group-focus-within:text-medigo-blue transition-colors" size={18} />
                        </div>
                     </div>

                     {/* Message for Doctor */}
                     <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic ml-1 flex items-center gap-2">
                          <span className="w-4 h-4 bg-teal-50 text-teal-600 rounded flex items-center justify-center"><Stethoscope size={10} /></span>
                          Message for Doctor (Optional)
                        </label>
                        <textarea
                          name="patientNote"
                          value={form.patientNote}
                          onChange={handleInputChange}
                          rows={4}
                          placeholder="Describe your symptoms, concerns, or anything you'd like the doctor to know before the appointment…"
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-5 pr-5 py-4 outline-none focus:border-medigo-blue focus:bg-white transition-colors text-xs font-bold resize-none placeholder:text-slate-300"
                        />
                        <p className="text-[10px] text-slate-300 font-bold px-1 flex items-center gap-1.5">
                          <Info size={11} /> This message will be visible to your doctor before the appointment.
                        </p>
                     </div>

                     {/* ID Verification */}
                     <div className="md:col-span-2 pt-4 space-y-4">
                        <div className="flex items-center gap-10">
                           <label className="flex items-center gap-3 cursor-pointer group">
                              <input 
                                type="radio" 
                                name="idType" 
                                checked={form.idType === 'NIC'} 
                                onChange={() => setForm(f => ({ ...f, idType: 'NIC' }))}
                                className="w-5 h-5 accent-medigo-blue" 
                              />
                              <span className="text-xs font-black text-medigo-navy uppercase tracking-widest italic group-hover:text-medigo-blue transition-colors">NIC</span>
                           </label>
                           <label className="flex items-center gap-3 cursor-pointer group">
                              <input 
                                type="radio" 
                                name="idType" 
                                checked={form.idType === 'Passport'} 
                                onChange={() => setForm(f => ({ ...f, idType: 'Passport' }))}
                                className="w-5 h-5 accent-medigo-blue" 
                              />
                              <span className="text-xs font-black text-medigo-navy uppercase tracking-widest italic group-hover:text-medigo-blue transition-colors">Passport</span>
                           </label>
                        </div>
                        
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic ml-1">{form.idType} Number *</label>
                           <input 
                             name="nic"
                             value={form.nic}
                             onChange={handleInputChange}
                             placeholder={`Enter ${form.idType} number`} 
                             className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 outline-none focus:border-medigo-blue transition-colors text-xs font-bold uppercase tracking-widest"
                           />
                        </div>
                     </div>
                  </div>
               </form>
            </div>
          </div>

          {/* Column 3: Summary & Payment (Right) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Patient Summary Preview */}
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-50 overflow-hidden">
               <div className="p-8 space-y-4">
                  <h3 className="text-[10px] font-black text-medigo-blue uppercase tracking-[0.2em] italic border-b border-slate-50 pb-2">Patient Details</h3>
                  <div className="space-y-3">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Name</span>
                        <span className="text-xs font-bold text-slate-700 truncate capitalize">{form.title} {form.fullName || '-'}</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">NIC</span>
                        <span className="text-xs font-bold text-slate-700 uppercase">{form.nic || '-'}</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Mobile</span>
                        <span className="text-xs font-bold text-slate-700">{form.phone ? `+94 ${form.phone}` : '-'}</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Promo Code Card */}
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-50 overflow-hidden">
               <div className="p-8 space-y-4">
                  <h3 className="text-[10px] font-black text-medigo-blue uppercase tracking-[0.2em] italic">Promotion Code</h3>
                  <div className="flex gap-2">
                     <input type="text" placeholder="Promo code" className="flex-1 h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 text-[10px] outline-none focus:border-medigo-blue" />
                     <button className="px-4 h-11 bg-slate-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-medigo-navy transition-colors">Apply</button>
                  </div>
               </div>
            </div>

            {/* Payment Details Breakdown */}
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-50 overflow-hidden">
               <div className="p-8 space-y-4">
                  <h3 className="text-[10px] font-black text-medigo-blue uppercase tracking-[0.2em] italic border-b border-slate-50 pb-2">Payment Details</h3>
                  <div className="space-y-3">
                     <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 italic uppercase">
                        <span>Doctor fee</span>
                        <span>Rs {feeDetails.doctor.toLocaleString()}.00</span>
                     </div>
                     <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 italic uppercase">
                        <span>MediGo Surcharge</span>
                        <span>Rs {feeDetails.service.toLocaleString()}.00</span>
                     </div>
                     <div className="flex justify-between items-center text-[10px] font-bold text-rose-500 italic uppercase">
                        <span>Discount</span>
                        <span>- Rs 0.00</span>
                     </div>
                     <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 italic uppercase">
                        <span>No show fee</span>
                        <span>Rs 0.00</span>
                     </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                     <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total fee</p>
                        <p className="text-2xl font-black text-medigo-navy tracking-tighter italic leading-none">Rs {total.toLocaleString()}.00</p>
                     </div>
                  </div>
               </div>

               <div className="p-4 bg-slate-900 border-t border-slate-100">
                  <Button 
                    loading={loading}
                    onClick={handleSubmit}
                    className="w-full h-14 bg-medigo-blue hover:bg-blue-600 shadow-xl shadow-blue-500/20 group uppercase tracking-widest italic font-black text-xs"
                  >
                    <Lock size={14} className="mr-2" /> Pay
                  </Button>
               </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                 <AlertCircle size={18} className="shrink-0" />
                 {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Specialist Profile Modal */}
      <AnimatePresence>
        {showProfile && (
           <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6" onClick={() => setShowProfile(false)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={e => e.stopPropagation()}
                className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="relative bg-gradient-to-br from-slate-900 to-medigo-navy pt-16 pb-8 px-8 sm:px-12 text-center overflow-hidden shrink-0">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]" />
                  <button onClick={() => setShowProfile(false)} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors">
                    <X size={20} />
                  </button>

                  <div className="w-24 h-24 mx-auto rounded-[2rem] bg-white text-medigo-blue flex items-center justify-center text-3xl font-black shadow-2xl relative z-10 mb-6">
                    {doctor.fullName?.replace('Dr. ', '').split(' ').map(n => n[0]).join('').slice(0, 2)}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-slate-900 rounded-full flex items-center justify-center">
                      <BadgeCheck size={10} className="text-white" />
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-black text-white relative z-10">{doctor.fullName}</h2>
                  <div className="flex items-center justify-center gap-2 mt-3 relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md bg-white/10 text-white border border-white/20">
                      🛡️ {doctor.specialty}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md bg-white/10 text-white border border-white/20">
                      {doctor.experienceYears || '8'}Y Exp
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-8 sm:px-12 py-8 space-y-6 bg-slate-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="bg-white p-6 rounded-[2rem] border border-slate-100">
                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                         <Info size={14} className="text-indigo-500" /> About Me
                       </h3>
                       <p className="text-xs font-bold text-medigo-navy leading-relaxed">{doctor.bio || 'Professional medical specialist dedicated to providing exceptional patient care and clinical excellence.'}</p>
                     </div>
                     <div className="bg-white p-6 rounded-[2rem] border border-slate-100">
                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                         <Stethoscope size={14} className="text-teal-500" /> Qualifications
                       </h3>
                       <p className="text-xs font-bold text-medigo-navy leading-relaxed">{doctor.qualifications || 'MBBS, MD (General Medicine)'}</p>
                     </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row items-center gap-8">
                     <div className="text-center md:text-left shrink-0">
                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-center md:justify-start gap-2">
                         <Star size={14} className="text-amber-500" /> Rating
                       </h3>
                       <div className="flex items-end justify-center md:justify-start gap-1">
                         <span className="text-4xl font-black text-medigo-navy tracking-tighter">4.9</span>
                         <span className="text-[10px] font-bold text-slate-400 mb-1.5">/ 5.0</span>
                       </div>
                     </div>
                     <div className="flex-1 w-full bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-center">
                       <div className="flex justify-center gap-1 mb-2">
                         {[1, 2, 3, 4, 5].map((star) => (
                           <Star key={star} size={18} fill="#f59e0b" className="text-amber-400" />
                         ))}
                       </div>
                       <p className="text-[9px] font-bold text-slate-400">Ratings are verified from patient feedback.</p>
                     </div>
                  </div>
                </div>

                <div className="p-6 bg-white border-t border-slate-100">
                   <button onClick={() => setShowProfile(false)} className="w-full h-12 bg-medigo-navy text-white text-xs font-black uppercase tracking-widest rounded-2xl">
                     Return to Checkout
                   </button>
                </div>
              </motion.div>
           </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
