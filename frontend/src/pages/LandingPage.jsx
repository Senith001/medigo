import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, Video, FileText, 
  Pill, Search, CheckCircle2, 
  MessageCircle, Shield, Star, 
  ChevronLeft, ChevronRight, Heart,
  Zap, ArrowRight, ShieldCheck,
  Smartphone, Activity, Users,
  Globe, Clock, Award, Lock, CreditCard
} from 'lucide-react'
import Button from '../components/ui/Button'


// ─── Reusable: Stars ────────────────────────────────────────────────────────────
function Stars({ count = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array(5).fill(0).map((_, i) => (
        <Star key={i} size={14} fill={i < count ? '#fbbf24' : 'none'} className={i < count ? 'text-amber-400' : 'text-slate-200'} />
      ))}
    </div>
  )
}

// ─── NavBar ──────────────────────────────────────────────────────────────────────
function NavBar({ scrolled }) {
  const [active, setActive] = useState('Home')
  const navItems = ['Home', 'Find Doctors', 'Appointments', 'Services', 'Pricing']
  
  return (
    <nav className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ${
      scrolled 
        ? 'bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-premium py-3' 
        : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-tr from-medigo-blue to-medigo-teal rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
             <Stethoscope size={22} strokeWidth={2.5} />
          </div>
          <span className={`text-2xl font-black tracking-tighter ${scrolled ? 'text-medigo-navy' : 'text-white'}`}>
             Medi<span className="text-medigo-blue italic">Go</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-2">
          {navItems.map(item => (
            <button
              key={item}
              onClick={() => setActive(item)}
              className={`px-5 py-2 rounded-xl text-[13px] font-black uppercase tracking-widest transition-all ${
                active === item 
                  ? (scrolled ? 'bg-blue-50 text-medigo-blue' : 'bg-white/10 text-white') 
                  : (scrolled ? 'text-slate-500 hover:text-medigo-navy' : 'text-white/70 hover:text-white')
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className={`hidden sm:block text-xs font-black uppercase tracking-widest px-6 py-2 transition-colors ${
            scrolled ? 'text-slate-500 hover:text-medigo-navy' : 'text-white/80 hover:text-white'
          }`}>Sign In</Link>
          <Link to="/register">
            <Button size="sm" className="shadow-xl shadow-blue-500/20 px-8 h-10">Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}

function Stethoscope({ size, ...p }) { return <svg {...p} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6h2a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1.5"/><circle cx="20" cy="10" r="2"/></svg> }

// ─── Immersive 3D Hero ─────────────────────────────────────────────────────────
function ImmersiveHero() {
  const [idx, setIdx] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)

  const HERO_SLIDES = [
    {
      img: '/assets/hero_1.png',
      eyebrow: 'Precision Clinical Architecture',
      title: ['Professional', 'Health Care.'],
      desc: 'Seamlessly connecting verified specialists with advanced patient management systems.',
      color: 'from-blue-600 to-indigo-600'
    },
    {
      img: '/assets/hero_2.png',
      eyebrow: 'Sovereign Digital Identity',
      title: ['Your Secure', 'Medical Vault.'],
      desc: 'End-to-end encrypted record management and high-definition telemedicine ecosystems.',
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
      {/* Immersive Background Images */}
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
             className="absolute inset-0 bg-cover bg-center brightness-[0.7] saturate-[0.8]"
             style={{ backgroundImage: `url(${current.img})` }}
           />
           <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent" />
           <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-20 h-full max-w-7xl mx-auto px-6 pt-32 flex flex-col justify-center">
        {/* Animated Hero Text */}
        <motion.div
          style={{
            rotateX: mousePos.y * 10,
            rotateY: mousePos.x * -10,
            x: mousePos.x * 20,
            y: mousePos.y * 20,
          }}
          className="max-w-3xl space-y-8"
        >
           <div className="flex items-center gap-4">
              <div className="h-0.5 w-12 bg-medigo-blue rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
              <span className="text-[12px] font-black text-medigo-blue uppercase tracking-[0.4em] italic">{current.eyebrow}</span>
           </div>

           <h1 className="text-7xl lg:text-8xl font-black text-medigo-navy leading-[0.85] tracking-tighter uppercase italic">
             {current.title[0]}<br />
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-medigo-navy via-medigo-blue to-cyan-600">
               {current.title[1]}
             </span>
           </h1>

           <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
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

        {/* Bottom Floating Info Cards (With Generated Images) */}
        <div className="absolute bottom-12 left-6 right-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pointer-events-none sm:pointer-events-auto">
           {[
             { 
               t: 'SLMC Certified', 
               s: 'Verified Practitioners Only', 
               img: '/assets/card_icon_slmc.png', 
               c: 'text-blue-500' 
             },
             { 
               t: 'Video Vault', 
               s: 'P2P Encrypted Consults', 
               img: '/assets/card_icon_video.png', 
               c: 'text-indigo-500' 
             },
             { 
               t: 'Health IQ', 
               s: 'AI-Driven Record Mapping', 
               img: '/assets/card_icon_iq.png', 
               c: 'text-emerald-500' 
             },
             { 
               t: 'Secure Pay', 
               s: 'Multi-Gateway Assurance', 
               img: '/assets/card_icon_pay.png', 
               c: 'text-purple-500' 
             }
           ].map((card, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.8 + i * 0.1, duration: 0.8 }}
               whileHover={{ y: -10, rotateX: 5, rotateY: 5, scale: 1.02 }}
               className="bg-white p-6 rounded-[2.5rem] shadow-premium border border-slate-100 flex flex-col items-center text-center group cursor-default pointer-events-auto overflow-hidden relative"
             >
                <div className="w-full aspect-square max-h-24 mb-4 flex items-center justify-center overflow-hidden">
                   <img src={card.img} alt={card.t} className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div>
                   <h4 className="text-[14px] font-black text-medigo-navy uppercase tracking-tight italic mb-1">{card.t}</h4>
                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">{card.s}</p>
                </div>
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const services = [
    { Icon: Calendar, title: 'Smart Booking', desc: 'Browse verified clinical experts and secure top-tier slots in seconds.', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { Icon: Video, title: 'Telemedicine', desc: 'Private, role-based role encrypted HD video consults from your secure vault.', color: 'text-medigo-blue', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { Icon: FileText, title: 'Medical Archives', desc: 'Securely upload and share diagnostic reports with AI-powered trend mapping.', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    { Icon: ShieldCheck, title: 'Health Wallet', desc: 'Unified digital prescriptions and history accessible across all global zones.', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  ]

  const stats = [
    { v: '100k+', l: 'Active Managed Patients', icon: Users },
    { v: '500+', l: 'Verified Clinical Experts', icon: Stethoscope },
    { v: '24/7', l: 'Autonomous Health Guard', icon: Activity },
    { v: '99.9%', l: 'Service Integrity Uptime', icon: Globe },
  ]

  return (
    <div className="bg-white text-medigo-navy font-inter selection:bg-medigo-blue selection:text-white">
      <NavBar scrolled={scrolled} />

      {/* ── HERO SECTION ─────────────────────────────────────────────────────── */}
      <ImmersiveHero />

      {/* ── TRUST BAR ────────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 border-b border-slate-100 py-10">
         <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-wrap justify-between items-center gap-10">
               {[
                 { icon: ShieldCheck, title: 'SLMC Certified', sub: 'Verified Medical Board' },
                 { icon: Lock, title: 'HIPAA Secure', sub: 'Enterprise Grade Safety' },
                 { icon: Award, title: 'Top Rated', sub: '98% Patient Approval' },
                 { icon: Globe, title: 'Global Access', sub: 'Consult from Anywhere' }
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-4 group">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-medigo-blue group-hover:bg-medigo-blue group-hover:text-white transition-all duration-500">
                       <item.icon size={26} />
                    </div>
                    <div>
                       <p className="text-sm font-black uppercase tracking-tight leading-none mb-1 group-hover:text-medigo-blue transition-colors">{item.title}</p>
                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">{item.sub}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* ── SERVICES SECTION ─────────────────────────────────────────────────── */}
      <section className="py-24 sm:py-32 relative overflow-hidden">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-50/50 blur-[120px] rounded-full -z-10" />
         
         <div className="max-w-7xl mx-auto px-6 space-y-20">
            <div className="max-w-3xl space-y-6">
               <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full">
                  <span className="text-[10px] font-black text-medigo-blue uppercase tracking-[0.2em] leading-none italic">Platform Overview</span>
               </div>
               <h2 className="text-5xl sm:text-6xl font-black text-medigo-navy leading-none tracking-tighter uppercase italic">
                  Healthcare Built for <br />
                  <span className="text-medigo-blue">Modern Life.</span>
               </h2>
               <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
                  We've harmonized every clinical touchpoint into a single premium experience. From autonomous scheduling to high-fidelity telemedicine, care is now instant.
               </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {services.map((s, i) => (
                 <motion.div 
                   key={i}
                   whileHover={{ y: -10 }}
                   className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-premium hover:border-medigo-blue transition-all duration-500 group"
                 >
                    <div className={`w-16 h-16 rounded-[1.5rem] mb-10 flex items-center justify-center border shadow-inner transition-all duration-500 group-hover:scale-110 ${s.bg} ${s.color} ${s.border}`}>
                       <s.Icon size={32} />
                    </div>
                    <h3 className="text-xl font-black text-medigo-navy uppercase tracking-tight italic mb-4 group-hover:text-medigo-blue transition-colors leading-none">{s.title}</h3>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed group-hover:text-slate-500 transition-colors">
                       {s.desc}
                    </p>
                    <div className="mt-8 pt-8 border-t border-slate-50">
                       <Link to="/register" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-300 group-hover:text-medigo-blue transition-colors">
                          Explore Capability <ArrowRight size={14} />
                       </Link>
                    </div>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* ── STATS SECTION ────────────────────────────────────────────────────── */}
      <section className="bg-slate-950 py-32 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-medigo-blue/10 blur-[150px] rounded-full" />
         
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-20">
               {stats.map((s, i) => (
                 <div key={i} className="space-y-4 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-4">
                       <s.icon className="text-medigo-blue" size={24} />
                       <span className="text-5xl sm:text-6xl font-black text-white tracking-tighter italic">{s.v}</span>
                    </div>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] leading-normal sm:max-w-[140px]">
                       {s.l}
                    </p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* ── FEATURE SPLIT ────────────────────────────────────────────────────── */}
      <section className="py-24 sm:py-40 bg-white">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
               <div className="relative">
                  <div className="aspect-square bg-slate-100 rounded-[5rem] overflow-hidden shadow-3xl transform -rotate-3 hover:rotate-0 transition-transform duration-700">
                     <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=90&fit=crop" alt="Clinical App" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
                  </div>
                  
                  {/* Floating Performance Card */}
                  <motion.div 
                    animate={{ y: [0, -20, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute -bottom-10 -right-6 sm:-right-12 bg-white p-8 rounded-[3rem] shadow-premium border border-slate-100 max-w-xs space-y-6 hidden sm:block"
                  >
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                           <ShieldCheck size={24} />
                        </div>
                        <div>
                           <p className="text-xs font-black uppercase text-medigo-navy leading-none mb-1">Clinic IQ Ready</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Autonomous Guard</p>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div className="flex justify-between items-end">
                           <span className="text-[10px] font-black text-slate-300 uppercase italic">Encryption</span>
                           <span className="text-lg font-black text-medigo-blue tracking-tighter uppercase italic leading-none">Military Grade</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                           <div className="bg-emerald-500 h-full w-[94%] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        </div>
                     </div>
                  </motion.div>
               </div>

               <div className="space-y-10">
                  <div className="space-y-6">
                     <h2 className="text-5xl font-black text-medigo-navy leading-none tracking-tighter uppercase italic">
                        Unrivaled Clinical <br />
                        <span className="text-medigo-blue underline decoration-8 decoration-blue-500/20 underline-offset-8">Precision.</span>
                     </h2>
                     <p className="text-lg text-slate-500 font-medium leading-relaxed">
                        MediGo isn't just an app; it's a sovereign medical utility. We've built on military-grade encryption backbones to ensure patient data stays exactly where it belongs: in your control.
                     </p>
                  </div>

                  <div className="space-y-4">
                     {[
                       { t: 'P2P Encrypted Video', d: 'Safe-room architecture for every consultation.' },
                       { t: 'Universal Data Vault', d: 'One secure identity across every clinical zone.' },
                       { t: 'Smart AI Insights', d: 'Diagnostic trend mapping from clinical records.' }
                     ].map((item, i) => (
                       <div key={i} className="flex gap-6 items-start group">
                          <div className="w-6 h-6 rounded-full border-2 border-medigo-blue flex items-center justify-center group-hover:bg-medigo-blue transition-colors shrink-0 mt-1">
                             <CheckCircle2 size={12} className="text-medigo-blue group-hover:text-white transition-colors" />
                          </div>
                          <div>
                             <h4 className="text-md font-black text-medigo-navy uppercase tracking-tight leading-none mb-2">{item.t}</h4>
                             <p className="text-sm text-slate-400 font-medium">{item.d}</p>
                          </div>
                       </div>
                     ))}
                  </div>

                  <Button className="h-16 px-12 text-lg">Download Capability Brief</Button>
               </div>
            </div>
         </div>
      </section>

      {/* ── CTA SECTION ──────────────────────────────────────────────────────── */}
      <section className="pb-32 px-6">
         <div className="max-w-7xl mx-auto bg-gradient-to-br from-medigo-navy to-slate-900 p-12 sm:p-24 rounded-[4rem] text-center space-y-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent)] z-0" />
            
            <div className="relative z-10 space-y-6">
               <h2 className="text-5xl sm:text-7xl font-black text-white leading-none tracking-tighter uppercase italic drop-shadow-2xl">
                  Your Journey to <br />
                  Better Health <span className="text-medigo-blue">Starts Here.</span>
               </h2>
               <p className="text-slate-400 text-lg sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                  Join 100k+ global citizens who have upgraded their healthcare experience. Autonomous, secure, and always clinical.
               </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6">
               <Link to="/register"><Button className="h-18 px-14 text-xl shadow-3xl shadow-blue-500/20">Secure Your Slot Now</Button></Link>
               <Link to="/login" className="text-sm font-black text-white/40 uppercase tracking-[0.2em] hover:text-white transition-colors">Already Enrolled?</Link>
            </div>

            <div className="relative z-10 pt-12 flex justify-center gap-8 border-t border-white/5 grayscale opacity-30">
               {/* Placeholders for logos if needed */}
               <div className="flex items-center gap-3"><Activity size={24} className="text-white" /><span className="text-lg font-black uppercase tracking-widest text-white">ISO 27001</span></div>
               <div className="flex items-center gap-3"><Shield size={24} className="text-white" /><span className="text-lg font-black uppercase tracking-widest text-white">HIPAA</span></div>
            </div>
         </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 pt-24 pb-12 px-6 font-inter">
         <div className="max-w-7xl mx-auto space-y-24">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-24">
               <div className="lg:col-span-5 space-y-8">
                  <div className="flex items-center gap-3 group">
                    <div className="w-12 h-12 bg-medigo-blue rounded-xl flex items-center justify-center text-white shadow-lg">
                       <Stethoscope size={28} />
                    </div>
                    <span className="text-3xl font-black tracking-tighter text-white uppercase italic">
                       Medi<span className="text-medigo-blue">Go</span>
                    </span>
                  </div>
                  <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-sm">
                     A world-class healthcare utility delivering sovereign medical precision through autonomous systems and secure clinical architecture.
                  </p>
                  <div className="flex items-center gap-6">
                     {['Twitter', 'LinkedIn', 'AppStore', 'PlayStore'].map(p => (
                        <button key={p} className="text-[10px] font-black uppercase tracking-[.3em] text-slate-600 hover:text-white transition-colors">{p}</button>
                     ))}
                  </div>
               </div>

               <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-12">
                  {[
                    { title: 'Capability', items: ['Search Experts', 'Secure Booking', 'Video Vault', 'Health IQ'] },
                    { title: 'Ecosystem', items: ['About Tech', 'Our Vision', 'Developers', 'Clinical Board'] },
                    { title: 'Governance', items: ['Global Terms', 'Data Privacy', 'Compliance', 'Audit Logs'] }
                  ].map((group, i) => (
                    <div key={i} className="space-y-6">
                       <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] italic">{group.title}</h4>
                       <ul className="space-y-4">
                          {group.items.map(item => (
                            <li key={item}><Link to="#" className="text-sm font-bold text-slate-500 hover:text-medigo-blue transition-colors">{item}</Link></li>
                          ))}
                       </ul>
                    </div>
                  ))}
               </div>
            </div>

            <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
               <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">© 2026 MEDIGO HEALTH TECHNOLOGIES • ALL RIGHTS RESERVED</p>
               <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Online</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest leading-none">V4.0.0-PRO</span>
               </div>
            </div>
         </div>
      </footer>
    </div>
  )
}
