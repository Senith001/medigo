import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  User, Mail, Phone, 
  MapPin, CreditCard, ShieldCheck,
  ChevronLeft, ArrowRight, Wallet,
  Building2, Calendar, Clock,
  Loader2, BadgePercent, ShieldAlert,
  ChevronRight
} from 'lucide-react'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/DashboardLayout'
import Button from '../../components/ui/Button'
import { paymentAPI } from '../../services/api'

export default function Checkout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { doctor, session } = location.state || {}
  
  const [form, setForm] = useState({
    title: 'Mr',
    fullName: 'Mr. Prabash Mihiranga', // Pre-filled for demo
    email: 'prabashmihiranga@gmail.com',
    phone: '759573995',
    nic: '200307500811',
    city: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const feeDetails = {
    doctor: session?.fee || 2800,
    hospital: 1200,
    service: 199,
    discount: 0
  }
  const total = feeDetails.doctor + feeDetails.hospital + feeDetails.service - feeDetails.discount

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await paymentAPI.createSession({
        appointmentId: session.id, // In real app, first create appt, then pay
        amount: total,
        currency: 'LKR',
        successUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`
      })
      
      if (res.data.url) {
        window.location.href = res.data.url
      }
    } catch (err) {
      setError('Transaction Authority Failed: Secure handoff to payment gateway interrupted.')
    } finally {
      setLoading(false)
    }
  }

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
      <div className="max-w-7xl mx-auto space-y-8 pb-20 font-inter">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div className="space-y-4">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group hover:text-medigo-blue transition-colors"
              >
                <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Change Selection
              </button>
              <h1 className="text-4xl font-black text-medigo-navy tracking-tighter italic uppercase leading-none">Complete <span className="text-medigo-blue">Reservation</span></h1>
              <p className="text-slate-500 font-medium">Authentication and clinical billing protocol.</p>
           </div>
           
           <div className="flex bg-slate-100 p-1 rounded-2xl">
              <div className="px-5 py-2.5 rounded-xl bg-white shadow-sm text-[10px] font-black text-medigo-blue uppercase tracking-widest flex items-center gap-2 italic">
                 <ShieldCheck size={14} /> Encrypted Session
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
           {/* Left: Patient Details Form */}
           <div className="lg:col-span-8 space-y-8">
              {/* Doctor Quick View */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-100 flex items-center gap-8 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-medigo-blue/5 rounded-full blur-3xl group-hover:bg-medigo-blue/10 transition-colors" />
                 <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center text-white text-2xl font-black italic shadow-2xl relative z-10 shrink-0">
                    {doctor.fullName?.replace('Dr. ', '').split(' ').map(n => n[0]).join('').slice(0, 2)}
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-medigo-blue uppercase tracking-widest italic mb-1">Clinical Specialist</p>
                    <h3 className="text-xl font-black text-medigo-navy uppercase tracking-tighter italic leading-none truncate">{doctor.fullName}</h3>
                    <div className="flex items-center gap-4 mt-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                       <span className="flex items-center gap-1.5"><Building2 size={13} /> {session.hospital}</span>
                       <span className="flex items-center gap-1.5"><Calendar size={13} /> {session.date}</span>
                    </div>
                 </div>
                 <button className="hidden sm:flex items-center gap-2 text-xs font-black text-slate-300 hover:text-medigo-blue transition-colors uppercase italic group transition-colors">
                    View Profile <ChevronRight size={16} />
                 </button>
              </div>

              {/* Data Entry Form */}
              <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-slate-100 space-y-12">
                 <div className="flex items-baseline gap-4">
                    <h2 className="text-2xl font-black text-medigo-navy uppercase tracking-tighter italic italic">Patient Metadata</h2>
                    <div className="h-px flex-1 bg-slate-50" />
                 </div>

                 <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 italic italic">Identity Title</label>
                          <select className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-bold text-medigo-navy outline-none focus:bg-white focus:border-medigo-blue transition-all appearance-none" value={form.title} onChange={e => setForm({...form, title: e.target.value})}>
                             <option>Mr</option>
                             <option>Ms</option>
                             <option>Dr</option>
                             <option>Prof</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 italic italic">Legal Full Name</label>
                          <div className="relative">
                             <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                             <input type="text" className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 text-sm font-bold text-medigo-navy outline-none focus:bg-white focus:border-medigo-blue transition-all" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} placeholder="e.g. John Doe" />
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 italic italic">Mobile Directive</label>
                          <div className="relative flex">
                             <div className="h-14 bg-slate-100 border border-slate-200 rounded-l-2xl flex items-center px-4 text-xs font-black text-slate-500 tracking-tighter">+94</div>
                             <input type="text" className="w-full h-14 bg-slate-50 border border-slate-100 rounded-r-2xl px-6 text-sm font-bold text-medigo-navy outline-none focus:bg-white focus:border-medigo-blue transition-all" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="77XXXXXXX" />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 italic italic">Electronic Mail</label>
                          <div className="relative">
                             <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                             <input type="email" className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 text-sm font-bold text-medigo-navy outline-none focus:bg-white focus:border-medigo-blue transition-all" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="name@domain.lk" />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 italic italic">NIC / Passport Number</label>
                       <input type="text" className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-bold text-medigo-navy outline-none focus:bg-white focus:border-medigo-blue transition-all italic tracking-tighter" value={form.nic} onChange={e => setForm({...form, nic: e.target.value})} placeholder="Enter official ID identifier..." />
                    </div>

                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-50">
                       <div className="flex items-center gap-3 text-red-500 group cursor-pointer">
                          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                             <ShieldAlert size={18} />
                          </div>
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest leading-none">No Show Protocol</p>
                             <p className="text-[11px] font-bold text-slate-400">Strict refund policy enforced.</p>
                          </div>
                       </div>
                       
                       <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic pr-4">
                          Secure clinical handoff protocol active
                       </div>
                    </div>
                 </form>
              </div>
           </div>

           {/* Right: Payment Summary Card */}
           <div className="lg:col-span-4 sticky top-8 space-y-6">
              <div className="bg-slate-900 rounded-[3rem] text-white p-10 space-y-8 shadow-3xl shadow-slate-900/40 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(37,99,235,0.15),transparent)]" />
                 
                 <div className="relative z-10 flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] italic text-medigo-blue">Financial Breakdown</h3>
                    <Wallet size={20} className="text-white/20" />
                 </div>

                 <div className="relative z-10 space-y-6">
                    <div className="flex justify-between items-center group">
                       <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic group-hover:text-white transition-colors">Clinical Specialist Fee</span>
                       <span className="text-sm font-bold tracking-tight italic">LKR {feeDetails.doctor.toLocaleString()}.00</span>
                    </div>
                    <div className="flex justify-between items-center group text-white/60">
                       <span className="text-[11px] font-black uppercase tracking-widest italic group-hover:text-white transition-colors">Digital Admin Surcharge</span>
                       <span className="text-sm font-bold tracking-tight italic font-black">LKR {feeDetails.hospital.toLocaleString()}.00</span>
                    </div>
                    <div className="flex justify-between items-center group text-white/40">
                       <span className="text-[11px] font-black uppercase tracking-widest italic group-hover:text-white transition-colors">Technology Infrastructure</span>
                       <span className="text-sm font-bold tracking-tight italic">LKR {feeDetails.service.toLocaleString()}.00</span>
                    </div>
                    
                    <div className="h-px bg-white/5 my-4" />

                    <div className="space-y-4">
                       <div className="flex justify-between items-end">
                          <div>
                             <p className="text-[10px] font-black text-medigo-blue uppercase tracking-widest italic leading-none mb-1">Authorization Amount</p>
                             <p className="text-xs text-white/40 font-bold truncate max-w-[140px] italic">VAT & Levies Included</p>
                          </div>
                          <div className="text-right">
                             <p className="text-3xl font-black text-white tracking-tighter italic leading-none">LKR <span className="text-medigo-blue">{total.toLocaleString()}</span></p>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Promo Code Box */}
                 <div className="relative z-10 pt-4 flex gap-2">
                    <div className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center px-4">
                       <input type="text" placeholder="Promo Protocol" className="bg-transparent w-full text-[10px] font-black uppercase tracking-widest outline-none text-white placeholder:text-white/20 italic" />
                    </div>
                    <button className="h-12 w-12 bg-white/10 hover:bg-white text-white hover:text-medigo-navy rounded-xl flex items-center justify-center transition-all">
                       <BadgePercent size={18} />
                    </button>
                 </div>

                 <Button 
                    loading={loading}
                    onClick={handleSubmit}
                    className="w-full h-16 text-lg bg-medigo-blue hover:bg-medigo-blue-dark shadow-2xl shadow-blue-500/20 group relative z-10"
                 >
                    Authorize Payment <CreditCard size={20} className="ml-2 group-hover:scale-110 transition-transform" />
                 </Button>

                 <div className="relative z-10 pt-8 flex items-center justify-center gap-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                       <div className="w-1 h-1 bg-medigo-blue rounded-full" /> Stripe Secured
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-1 h-1 bg-medigo-blue rounded-full" /> SSL-256 Bit
                    </div>
                 </div>
              </div>

              {/* Security Shield */}
              <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 flex gap-4">
                 <ShieldCheck size={28} className="text-medigo-blue shrink-0" />
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-medigo-blue uppercase tracking-widest leading-none italic">Sovereign Encryption</p>
                    <p className="text-[12px] text-slate-500 leading-relaxed font-medium">Your financial authority and personal metadata are encrypted using clinical-grade PGP protocols.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
