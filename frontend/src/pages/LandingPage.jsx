import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, Video, FileText, 
  CheckCircle2, Star, 
  ChevronLeft, ChevronRight, Heart,
  ArrowRight, ShieldCheck,
  Activity, Users, Stethoscope as LucideStethoscope,
  Globe, Award, Lock, ChevronUp, MessageCircle, Clock
} from 'lucide-react'
import Button from '../components/ui/Button'

// ─── Custom Icons ───────────────────────────────────────────────────────────────
function Stethoscope({ size = 24, ...props }) {
  return (
    <svg {...props} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
      <path d="M8 15v1a6 6 0 0 0 6 6h2a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1.5"/>
      <circle cx="20" cy="10" r="2"/>
    </svg>
  )
}

// ─── NavBar ──────────────────────────────────────────────────────────────────────
function NavBar({ scrolled }) {
  const [active, setActive] = useState('Home')
  const navItems = ['Home', 'Find doctors', 'Appointments', 'Medical reports']
  
  return (
    <nav className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ${
      scrolled 
        ? 'bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-premium py-3' 
        : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-tr from-medigo-blue to-medigo-teal rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
             <Stethoscope size={22} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-medigo-navy">
             Medi<span className="text-medigo-blue">Go</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-2">
          {navItems.map(item => (
            <button
              key={item}
              onClick={() => setActive(item)}
              className={`px-5 py-2 rounded-xl text-[14px] font-semibold transition-all ${
                active === item 
                  ? 'bg-blue-50 text-medigo-blue' 
                  : 'text-slate-500 hover:text-medigo-navy'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="hidden sm:block text-sm font-semibold px-6 py-2 text-slate-500 hover:text-medigo-navy transition-colors">Sign in</Link>
          <Link to="/register">
            <Button size="sm" className="shadow-lg shadow-blue-500/10 px-8 h-10">Get started</Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}

// ─── Immersive 3D Hero ─────────────────────────────────────────────────────────
function ImmersiveHero() {
  const [idx, setIdx] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)

  const HERO_SLIDES = [
    {
      img: '/assets/human_centered/hero_doctor.png',
      eyebrow: 'Compassionate Clinical Care',
      title: ['Healthcare', 'You Can Trust.'],
      desc: 'Connect with verified medical specialists through a simple, secure, and human-centered platform.',
      color: 'from-blue-600 to-indigo-600'
    },
    {
      img: '/assets/human_centered/hero_telemedicine.png',
      eyebrow: 'Your Health, Simplified',
      title: ['Care From the', 'Comfort of Home.'],
      desc: 'Experience high-quality video consultations and secure record management tailored to your life.',
      color: 'from-medigo-blue to-cyan-500'
    }
  ]

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const { left, top, width, height } = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - left) / width - 0.5
    const y = (e.clientY - top) / height - 0.5
    setMousePos({ x, y })
  }

  useEffect(() => {
    const timer = setInterval(() => setIdx(p => (p + 1) % HERO_SLIDES.length), 8000)
    return () => clearInterval(timer)
  }, [])

  const current = HERO_SLIDES[idx]

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative h-screen min-h-[850px] w-full overflow-hidden bg-white font-inter perspective-[2000px]"
    >
      <AnimatePresence mode="wait">
        <motion.div
           key={idx}
           initial={{ opacity: 0, scale: 1.1 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.95 }}
           transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
           className="absolute inset-0"
        >
           <div 
             className="absolute inset-0 bg-cover bg-center brightness-[0.85]"
             style={{ backgroundImage: `url(${current.img})` }}
           />
           <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/20 to-transparent" />
           <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-20 h-full max-w-7xl mx-auto px-6 pt-44 flex flex-col justify-start">
        <motion.div
          animate={{
            rotateX: mousePos.y * 10,
            rotateY: mousePos.x * -10,
            x: mousePos.x * 20,
            y: mousePos.y * 20,
          }}
          className="max-w-2xl space-y-6"
        >
           <div className="flex items-center gap-4">
              <div className="h-0.5 w-12 bg-medigo-blue rounded-full" />
              <span className="text-[12px] font-bold text-medigo-blue uppercase tracking-[0.3em]">{current.eyebrow}</span>
           </div>

           <h1 className="text-6xl lg:text-7xl font-extrabold text-medigo-navy leading-[1.1] tracking-tight">
             {current.title[0]}<br />
             <span className="text-medigo-blue">
               {current.title[1]}
             </span>
           </h1>

           <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-lg">
             {current.desc}
           </p>

           <div className="flex flex-wrap items-center gap-6 pt-4">
              <Link to="/register">
                <Button className="h-16 px-12 text-lg shadow-2xl shadow-blue-500/20 transform hover:scale-105 transition-all">
                   Join Ecosystem <ArrowRight className="ml-3" />
                </Button>
              </Link>
              <div className="flex gap-4">
                 <button onClick={() => setIdx(p => (p - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)} className="w-14 h-14 rounded-full border border-slate-200 flex items-center justify-center text-medigo-navy hover:bg-slate-50 transition-all backdrop-blur-md">
                    <ChevronLeft size={24} />
                 </button>
                 <button onClick={() => setIdx(p => (p + 1) % HERO_SLIDES.length)} className="w-14 h-14 rounded-full border border-slate-200 flex items-center justify-center text-medigo-navy hover:bg-slate-50 transition-all backdrop-blur-md">
                    <ChevronRight size={24} />
                 </button>
              </div>
           </div>
        </motion.div>

        <div className="absolute bottom-12 left-6 right-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pointer-events-none sm:pointer-events-auto">
           {[
             { t: 'Certified Experts', s: 'Verified Clinical Pros', img: '/assets/human_centered/card_slmc.png' },
             { t: 'Video Calls', s: 'Private Room Consults', img: '/assets/human_centered/card_video.png' },
             { t: 'Health Records', s: 'Simple & Secure Access', img: '/assets/human_centered/card_records.png' },
             { t: 'Secure Billing', s: 'Transparent Payments', img: '/assets/human_centered/card_pay.png' }
           ].map((card, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.8 + i * 0.1, duration: 0.8 }}
               whileHover={{ y: -10, rotateX: 5, rotateY: 5, scale: 1.02 }}
               className="bg-white p-6 rounded-[2.5rem] shadow-premium border border-slate-100 flex flex-col items-center text-center group cursor-default pointer-events-auto overflow-hidden relative"
             >
                <div className="w-full aspect-square max-h-24 mb-4 flex items-center justify-center">
                   <img src={card.img} alt={card.t} className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div>
                   <h4 className="text-[14px] font-bold text-medigo-navy uppercase tracking-tight mb-1">{card.t}</h4>
                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">{card.s}</p>
                </div>
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Landing Page ────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const stats = [
    { v: '100k+', l: 'Patients helped', icon: Users },
    { v: '500+', l: 'Specialists', icon: LucideStethoscope },
    { v: '24/7', l: 'Support available', icon: Activity },
    { v: '99.9%', l: 'Reliability', icon: Globe },
  ]

  return (
    <div className="bg-white text-medigo-navy font-inter selection:bg-medigo-blue selection:text-white pb-0">
      <NavBar scrolled={scrolled} />

      {/* ── HERO SECTION ─────────────────────────────────────────────────────── */}
      <ImmersiveHero />

      {/* ── INTERACTIVE CARE NAVIGATOR ────────────────────────────────────────── */}
      <section className="py-24 bg-white relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
               <h2 className="text-4xl font-extrabold text-medigo-navy">Choose Your Care Journey</h2>
               <p className="text-slate-500 font-medium">Select a path that fits your life and discover how we can help you stay healthy.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { 
                   t: 'Family Wellness', 
                   s: 'Complete care for parents and children.', 
                   icon: Heart, 
                   color: 'bg-rose-50 text-rose-500', 
                   border: 'border-rose-100',
                   image: '/assets/human_centered/hero_doctor.png'
                 },
                 { 
                   t: 'Expert Consults', 
                   s: 'Direct access to world-class specialists.', 
                   icon: Users, 
                   color: 'bg-blue-50 text-blue-500', 
                   border: 'border-blue-100',
                   image: '/assets/human_centered/hero_telemedicine.png'
                 },
                 { 
                   t: 'Preventive Care', 
                   s: 'Smart records and regular checkups.', 
                   icon: Activity, 
                   color: 'bg-emerald-50 text-emerald-500', 
                   border: 'border-emerald-100',
                   image: '/assets/human_centered/hero_doctor.png'
                 }
               ].map((path, i) => (
                 <motion.div 
                   key={i}
                   whileHover={{ y: -12 }}
                   className="group relative h-[450px] rounded-[3rem] overflow-hidden border border-slate-100 shadow-premium cursor-pointer"
                 >
                    <div className="absolute inset-0">
                       <img src={path.image} alt={path.t} className="w-full h-full object-cover brightness-90 group-hover:scale-105 transition-transform duration-700" />
                       <div className="absolute inset-0 bg-gradient-to-t from-medigo-navy via-medigo-navy/20 to-transparent" />
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
                       <div className={`w-12 h-12 rounded-2xl ${path.color} flex items-center justify-center border ${path.border} shadow-sm transition-transform duration-500 group-hover:scale-110`}>
                          <path.icon size={24} />
                       </div>
                       <div>
                          <h3 className="text-2xl font-bold text-white mb-2">{path.t}</h3>
                          <p className="text-white/80 text-sm font-medium leading-relaxed">{path.s}</p>
                       </div>
                       <div className="pt-4 flex items-center gap-3 text-white font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                          Start Journey <ArrowRight size={14} />
                       </div>
                    </div>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* ── QUICK ACCESS SERVICES ───────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50/30 border-y border-slate-100 relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
               <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-medigo-teal/10 border border-medigo-teal/20 rounded-full">
                     <div className="w-1.5 h-1.5 rounded-full bg-medigo-teal animate-pulse" />
                     <span className="text-[10px] font-bold text-medigo-teal uppercase tracking-widest">Live Services</span>
                  </div>
                  <h2 className="text-4xl font-extrabold text-medigo-navy tracking-tight">Quick Access</h2>
                  <p className="text-slate-500 font-medium max-w-xl">Instant access to our most requested clinical services and support hubs.</p>
               </div>
               <Link to="/register" className="text-sm font-bold text-medigo-blue hover:underline mb-2">View all services <ArrowRight size={14} className="inline ml-1" /></Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
               {[
                 { t: 'Driving Medical', s: 'Service available', img: '/assets/service_driving.png', badge: 'Active' },
                 { t: 'ePharmacy', s: 'Home delivery', img: '/assets/service_pharmacy.png', badge: '24/7' },
                 { t: 'eDiagnostics', s: 'Lab reports', icon: Activity, bg: 'bg-blue-50', text: 'text-blue-500' },
                 { t: 'Visa Medical', s: 'Official visits', icon: Globe, bg: 'bg-indigo-50', text: 'text-indigo-500' },
                 { t: 'Now Serving', s: 'Live clinic queue', icon: Clock, bg: 'bg-emerald-50', text: 'text-emerald-500', pulse: true },
                 { t: 'ePremium', s: 'Member benefits', icon: Award, bg: 'bg-amber-50', text: 'text-amber-500' },
                 { t: 'eMindCare', s: 'Mental wellness', icon: Heart, bg: 'bg-rose-50', text: 'text-rose-500' },
                 { t: 'Support Hub', s: 'Help available', icon: MessageCircle, bg: 'bg-slate-100', text: 'text-slate-500' }
               ].map((item, i) => (
                 <motion.div
                   key={i}
                   whileHover={{ y: -5, scale: 1.02 }}
                   className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-premium transition-all duration-300 group cursor-pointer relative overflow-hidden"
                 >
                    {item.pulse && <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
                    
                    <div className="mb-6">
                       {item.img ? (
                         <div className="w-16 h-16 flex items-center justify-center">
                            <img src={item.img} alt={item.t} className="w-full h-full object-contain transform group-hover:rotate-6 transition-transform" />
                         </div>
                       ) : (
                         <div className={`w-16 h-16 rounded-2xl ${item.bg} ${item.text} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                            <item.icon size={28} />
                         </div>
                       )}
                    </div>
                    
                    <div className="space-y-1">
                       <h4 className="text-lg font-bold text-medigo-navy leading-tight">{item.t}</h4>
                       <p className="text-xs font-medium text-slate-400">{item.s}</p>
                    </div>
                    
                    {item.badge && (
                      <span className="absolute top-6 right-8 text-[8px] font-black uppercase tracking-[.2em] text-slate-300">{item.badge}</span>
                    )}
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* ── THE PULSE OF CARE (INTERACTIVE ORB) ───────────────────────────────── */}
      <section className="py-32 relative overflow-hidden bg-white border-y border-slate-50">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.03),transparent_70%)]" />
         
         <div className="max-w-7xl mx-auto px-6 relative">
            <div className="flex flex-col lg:flex-row items-center gap-20">
               <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full">
                     <span className="text-[10px] font-bold text-medigo-blue uppercase tracking-widest">Digital Health Pulse</span>
                  </div>
                  <h2 className="text-5xl sm:text-6xl font-extrabold text-medigo-navy leading-tight tracking-tight">
                     Connect to the <br />
                     <span className="text-medigo-blue">Future of Care.</span>
                  </h2>
                  <p className="text-lg text-slate-500 font-medium leading-relaxed">
                     Our platform isn't just a site—it's a living ecosystem designed to put expert clinical care at your fingertips.
                  </p>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                     {['Smart Checkups', 'Direct Access', 'Global Records'].map(tag => (
                       <span key={tag} className="px-5 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-400 capitalize">{tag}</span>
                     ))}
                  </div>
               </div>

               <div className="lg:w-1/2 relative flex items-center justify-center">
                  <div className="relative w-full aspect-square max-w-[500px] flex items-center justify-center">
                     <div className="absolute w-[80%] h-[80%] bg-medigo-blue/5 rounded-full blur-[100px] animate-pulse" />
                     
                     {[
                       { t: 'Live Support', x: '10%', y: '20%', d: 0 },
                       { t: 'Secure HIPAA', x: '80%', y: '15%', d: 0.2 },
                       { t: 'Instant Booking', x: '5%', y: '75%', d: 0.4 },
                       { t: 'Global Records', x: '85%', y: '70%', d: 0.6 }
                     ].map((h, i) => (
                       <motion.div
                         key={i}
                         animate={{ 
                           opacity: [0.4, 1, 0.4], 
                           y: [0, -10, 0],
                           scale: [0.95, 1, 0.95]
                         }}
                         transition={{ duration: 4, repeat: Infinity, delay: h.d, ease: "easeInOut" }}
                         className="absolute z-10 hidden sm:flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl shadow-premium pointer-events-none"
                         style={{ top: h.y, left: h.x }}
                       >
                          <div className="w-2 h-2 rounded-full bg-medigo-blue animate-ping" />
                          <span className="text-[10px] font-bold text-medigo-navy uppercase tracking-widest">{h.t}</span>
                       </motion.div>
                     ))}

                     <motion.div
                       initial={{ opacity: 0, scale: 0.5 }}
                       animate={{ opacity: 1, scale: 1 }}
                       transition={{ duration: 1.5, ease: "easeOut" }}
                       className="relative z-0 w-full h-full p-12"
                     >
                        <img 
                          src="/assets/interactive_orb.png" 
                          alt="Clinical Orb" 
                          className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(37,99,235,0.15)] animate-pulse"
                        />
                        <div className="absolute inset-0 m-auto w-24 h-24 bg-blue-400/20 rounded-full blur-3xl animate-ping" />
                     </motion.div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* ── STATS SECTION ────────────────────────────────────────────────────── */}
      <section className="bg-white py-32 relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-20 text-center sm:text-left">
               {stats.map((s, i) => (
                 <div key={i} className="space-y-4">
                    <div className="flex items-center justify-center sm:justify-start gap-4">
                       <s.icon className="text-medigo-blue" size={24} />
                       <span className="text-5xl sm:text-6xl font-extrabold text-medigo-navy tracking-tight">{s.v}</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-normal sm:max-w-[140px]">
                       {s.l}
                    </p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* ── CLINICAL PRECISION SECTION ────────────────────────────────────────── */}
      <section className="py-24 sm:py-40 bg-slate-50/50">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
               <div className="relative">
                  <div className="aspect-square bg-white rounded-[5rem] overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-700 p-8 border border-slate-100 flex items-center justify-center">
                     <img src="/assets/human_centered/hero_doctor.png" alt="Clinical App" className="w-full h-full object-cover rounded-[4rem]" />
                  </div>
               </div>

               <div className="space-y-10">
                  <div className="space-y-6">
                     <h2 className="text-5xl font-extrabold text-medigo-navy leading-tight tracking-tight">
                        Unrivaled Clinical <br />
                        <span className="text-medigo-blue">Precision.</span>
                     </h2>
                     <p className="text-lg text-slate-500 font-medium leading-relaxed">
                        MediGo is more than just a platform; it's a commitment to your health. We use industry-standard security to ensure your data stays private.
                     </p>
                  </div>

                  <div className="space-y-6">
                     {[
                       { t: 'Secure Consultations', d: 'Private and safe environment for every visit.' },
                       { t: 'Personal Health Vault', d: 'Your records belong to you, and only you.' },
                       { t: 'Expert Clinical Insights', d: 'High-quality care from verified professionals.' }
                     ].map((item, i) => (
                       <div key={i} className="flex gap-6 items-start group">
                          <div className="w-6 h-6 rounded-full border-2 border-medigo-blue flex items-center justify-center group-hover:bg-medigo-blue transition-colors shrink-0 mt-1">
                             <CheckCircle2 size={12} className="text-medigo-blue group-hover:text-white transition-colors" />
                          </div>
                          <div>
                             <h4 className="text-md font-bold text-medigo-navy leading-none mb-2">{item.t}</h4>
                             <p className="text-sm text-slate-400 font-medium">{item.d}</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* ── CTA SECTION ──────────────────────────────────────────────────────── */}
      <section className="pb-32 px-6 pt-32 bg-white">
         <div className="max-w-7xl mx-auto bg-slate-50/50 border border-slate-100 p-12 sm:p-24 rounded-[4rem] text-center space-y-12 relative overflow-hidden backdrop-blur-3xl shadow-sm">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.05),transparent)] z-0" />
            
            <div className="relative z-10 space-y-6">
               <h2 className="text-5xl sm:text-6xl font-extrabold text-medigo-navy leading-tight tracking-tight">
                  Ready to find <br />
                  <span className="text-medigo-blue">your doctor?</span>
               </h2>
               <p className="text-slate-500 text-lg sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                  Join thousands of patients who have already simplified their healthcare. It takes less than a minute to get started.
               </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6">
               <Link to="/register"><Button className="h-16 px-14 text-lg">Create Your Account</Button></Link>
               <Link to="/login" className="text-sm font-bold text-medigo-blue hover:text-medigo-navy transition-colors">Already have an account?</Link>
            </div>

            <div className="relative z-10 pt-12 flex justify-center gap-8 border-t border-slate-200/50">
               {[
                 { icon: ShieldCheck, label: 'ISO Certified' },
                 { icon: Lock, label: 'HIPAA Secure' }
               ].map((badge, i) => (
                 <div key={i} className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-all duration-500">
                    <badge.icon size={18} className="text-medigo-blue" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-medigo-navy">{badge.label}</span>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* ── MOSAIC PATTERNED FOOTER ──────────────────────────────────────────── */}
      <footer className="relative bg-white pt-32 pb-16 px-6 overflow-hidden border-t border-slate-50">
         <div 
           className="absolute inset-0 opacity-[0.08] pointer-events-none"
           style={{ 
             backgroundImage: 'url(/assets/medical_pattern.png)',
             backgroundRepeat: 'repeat',
             backgroundSize: '350px'
           }}
         />
         <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white to-transparent" />

         <div className="max-w-7xl mx-auto relative z-10">
            <div className="bg-white/40 backdrop-blur-2xl border border-white/50 rounded-[4rem] p-12 sm:p-20 shadow-premium">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
                  <div className="lg:col-span-5 space-y-8">
                     <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-medigo-blue rounded-2xl flex items-center justify-center text-white shadow-lg">
                           <Stethoscope size={26} />
                        </div>
                        <span className="text-3xl font-bold tracking-tight text-medigo-navy">Medi<span className="text-medigo-blue">Go</span></span>
                     </div>
                     <p className="text-slate-500 font-medium leading-relaxed max-w-sm">
                        Revolutionizing healthcare through compassion, simplicity, and expert clinical precision.
                     </p>
                  </div>

                  <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-12">
                     {[
                       { title: 'Platform', items: ['Find Doctors', 'Appointments', 'Video Consults', 'Records'] },
                       { title: 'Resources', items: ['Help Center', 'Privacy Policy', 'Terms of Service', 'Contact'] },
                       { title: 'Connect', items: ['Support', 'Community', 'Our Story', 'Join Us'] }
                     ].map((col, i) => (
                       <div key={i} className="space-y-6">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-medigo-navy">{col.title}</h4>
                          <ul className="space-y-4">
                             {col.items.map(item => (
                               <li key={item}>
                                  <Link to="#" className="text-sm font-medium text-slate-400 hover:text-medigo-blue transition-colors">{item}</Link>
                               </li>
                             ))}
                          </ul>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="mt-20 pt-12 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-8">
                  <p className="text-xs font-medium text-slate-400 italic">© 2026 MediGo. Healthcare simplified for everyone.</p>
                  <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="group px-6 py-3 bg-medigo-blue rounded-full text-white font-bold text-xs flex items-center gap-3 shadow-xl hover:shadow-cyan-400/20 transition-all hover:-translate-y-1"
                  >
                     Back to Top
                     <ChevronUp size={16} />
                  </button>
               </div>
            </div>
         </div>
      </footer>
    </div>
  )
}
