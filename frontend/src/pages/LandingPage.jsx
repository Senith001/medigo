import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Video, FileText,
  CheckCircle2, Star,
  ChevronLeft, ChevronRight, Heart,
  ArrowRight, ShieldCheck,
  Activity, Users, Stethoscope as LucideStethoscope,
  Globe, Award, Lock, ChevronUp, MessageCircle, Clock, Languages
} from 'lucide-react'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'

// ─── Custom Icons ───────────────────────────────────────────────────────────────
function Stethoscope({ size = 24, ...props }) {
  return (
    <svg {...props} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
      <path d="M8 15v1a6 6 0 0 0 6 6h2a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1.5" />
      <circle cx="20" cy="10" r="2" />
    </svg>
  )
}

// ─── NavBar ──────────────────────────────────────────────────────────────────────
function NavBar({ scrolled, isSinhala, setIsSinhala }) {
  const navigate = useNavigate();
  const [active, setActive] = useState('Home');


  const navItems = isSinhala
    ? [
      { name: 'මුල් පිටුව', path: '/' },
      { name: 'වෛද්‍යවරුන්', path: '/search' },
      { name: 'ඇපොයිමන්ට්', path: '/appointments' },
      { name: 'වෛද්‍ය වාර්තා', path: '/reports' }
    ]
    : [
      { name: 'Home', path: '/' },
      { name: 'Find doctors', path: '/search' },
      { name: 'Appointments', path: '/appointments' },
      { name: 'Medical reports', path: '/reports' }
    ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ${scrolled
      ? 'bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-lg py-3'
      : 'bg-transparent py-6'
      }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-tr from-[#008080] to-[#00b3b3] rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
            <Stethoscope size={22} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-medigo-navy">
            Medi<span className="text-[#008080]">Go</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-2">
          {navItems.map(item => (
            <button
              key={item.name}
              onClick={() => {
                setActive(item.name);
                navigate(item.path);
              }}
              className={`px-5 py-2 rounded-xl text-[15px] font-black transition-all ${active === item.name
                ? 'bg-[#008080] text-white shadow-md'
                : scrolled
                  ? 'text-slate-800 hover:text-[#008080]'
                  : 'text-slate-900 hover:bg-white/30'
                }`}
              style={{ textShadow: !scrolled ? '0px 1px 3px rgba(255,255,255,0.8)' : 'none' }}
            >
              {item.name}
            </button>
          ))}
        </div>

        <NavBarActions scrolled={scrolled} isSinhala={isSinhala} setIsSinhala={setIsSinhala} />
      </div>
    </nav>
  )
}

// ─── NavBar Auth Actions (auth-aware) ──────────────────────────────────────────
function NavBarActions({ scrolled, isSinhala, setIsSinhala }) {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardPath =
    user?.role === 'doctor' ? '/doctor/dashboard'
      : user?.role === 'admin' ? '/admin/dashboard'
        : '/dashboard';

  const initials = user?.name
    ? user.name.trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setIsSinhala(!isSinhala)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-slate-900/10 bg-white/50 backdrop-blur-sm text-xs font-black text-slate-900 hover:bg-white transition-all shadow-sm"
      >
        <Languages size={14} className="text-[#008080]" />
        {isSinhala ? 'English' : 'සිංහල'}
      </button>

      {token ? (
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(dashboardPath)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#008080]/10 hover:bg-[#008080]/20 border border-[#008080]/20 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-[#008080] text-white text-[11px] font-black flex items-center justify-center shadow-sm">
              {initials}
            </div>
            <span className="hidden sm:block text-sm font-black text-[#008080]">
              {isSinhala ? 'උපකරණ පුවරුව' : 'Dashboard'}
            </span>
          </button>
          <button
            onClick={logout}
            className="hidden sm:block text-sm font-black text-slate-500 hover:text-red-500 transition-colors"
          >
            {isSinhala ? 'ඉවත් වන්න' : 'Sign out'}
          </button>
        </div>
      ) : (
        <>
          <Link to="/login" className="hidden sm:block text-sm font-black text-slate-900 hover:text-[#008080] drop-shadow-sm">
            {isSinhala ? 'පිවිසෙන්න' : 'Sign in'}
          </Link>
          <Link to="/register">
            <Button size="sm" className="bg-[#008080] hover:bg-[#006666] font-bold shadow-lg shadow-teal-500/10 px-8 h-10">
              {isSinhala ? 'ලියාපදිංචි වන්න' : 'Get started'}
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}

// ─── Immersive 3D Hero ─────────────────────────────────────────────────────────
function ImmersiveHero({ isSinhala }) {
  const [idx, setIdx] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)

  const HERO_SLIDES = [
    {
      img: '/images/banner1.png',
      eyebrow: isSinhala ? 'පහසු වෛද්‍ය සේවාව' : 'Compassionate Clinical Care',
      title: isSinhala ? ['පහසුවෙන් වෛද්‍යවරයකු', 'සොයාගන්න.'] : ['Healthcare', 'You Can Trust.'],
      desc: isSinhala ? 'සත්‍යාපනය කළ වෛද්‍ය විශේෂඥයන් සමඟ සරල, ආරක්ෂිත සහ පහසු ලෙස සම්බන්ධ වන්න.' : 'Connect with verified medical specialists through a simple, secure, and human-centered platform.',
    },
    {
      img: '/images/banner2.png',
      eyebrow: isSinhala ? 'Telemedicine සේවාව' : 'Your Health, Simplified',
      title: isSinhala ? ['වෛද්‍ය උපදෙස්', 'නිවසේ සිටම.'] : ['Care From the', 'Comfort of Home.'],
      desc: isSinhala ? 'උසස් තත්ත්වයේ වීඩියෝ උපදේශන සහ ආරක්ෂිත වෛද්‍ය වාර්තා කළමනාකරණය අත්විඳින්න.' : 'Experience high-quality video consultations and secure record management tailored to your life.',
    },
    {
      img: '/images/banner3.png',
      eyebrow: isSinhala ? 'පවුලේ සෞඛ්‍යය' : 'Family Healthcare First',
      title: isSinhala ? ['ඔබේ පවුලට', 'පූර්ණ රැකවරණය.'] : ['Complete Health', 'For Your Family.'],
      desc: isSinhala ? 'පවුලේ සැමගේ වෛද්‍ය ඉතිහාසය සහ වාර්තා එකම තැනකින් සුරක්ෂිතව කළමනාකරණය කරන්න.' : 'Manage prescriptions, medical history, and profiles for every family member in one secure place.',
    },
    {
      img: '/images/banner4.png',
      eyebrow: isSinhala ? 'නවීන තාක්ෂණය' : 'Advanced Technology',
      title: isSinhala ? ['සුරක්ෂිත', 'ඩිජිටල් දත්ත.'] : ['Secure & Resilient', 'Digital Platform.'],
      desc: isSinhala ? 'Microservices තාක්ෂණයෙන් බලගැන්වූ, ඔබේ පෞද්ගලිකත්වය රකින නවීන සෞඛ්‍ය වේදිකාව.' : 'A secure healthcare platform powered by modern microservices, prioritizing your data privacy.',
    }
  ]

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const { left, top, width, height } = containerRef.current.getBoundingClientRect()
    setMousePos({ x: (e.clientX - left) / width - 0.5, y: (e.clientY - top) / height - 0.5 })
  }

  useEffect(() => {
    const timer = setInterval(() => setIdx(p => (p + 1) % HERO_SLIDES.length), 8000)
    return () => clearInterval(timer)
  }, [HERO_SLIDES.length])

  const current = HERO_SLIDES[idx]

  return (
    <div ref={containerRef} onMouseMove={handleMouseMove} className="relative h-screen min-h-[850px] w-full overflow-hidden bg-white font-inter perspective-[2000px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-cover bg-center brightness-[0.95]" style={{ backgroundImage: `url(${current.img})` }} />
          <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-20 h-full max-w-7xl mx-auto px-6 pt-44 flex flex-col justify-start">
        <motion.div
          animate={{ rotateX: mousePos.y * 10, rotateY: mousePos.x * -10, x: mousePos.x * 20, y: mousePos.y * 20 }}
          className="max-w-2xl space-y-6"
        >
          <div className="flex items-center gap-4">
            <div className="h-0.5 w-12 bg-[#008080] rounded-full" />
            <span className="text-[12px] font-bold text-[#008080] uppercase tracking-[0.3em]">{current.eyebrow}</span>
          </div>

          <h1 className="text-6xl lg:text-7xl font-extrabold text-medigo-navy leading-[1.1] tracking-tight">
            {current.title[0]}<br />
            <span className="text-[#008080]">{current.title[1]}</span>
          </h1>

          <p className="text-lg text-slate-900 font-bold leading-relaxed max-w-lg drop-shadow-[0_1.2px_1.2px_rgba(255,255,255,0.8)]">
            {current.desc}
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-4">
            <Link to="/register">
              <Button className="h-16 px-12 text-lg bg-[#008080] hover:bg-[#006666] shadow-2xl shadow-teal-500/20 transform hover:scale-105 transition-all font-bold">
                {isSinhala ? 'දැන්ම එක්වන්න' : 'Join Ecosystem'} <ArrowRight className="ml-3" />
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
            { t: isSinhala ? 'සත්‍යාපිත විශේෂඥයන්' : 'Certified Experts', s: 'Verified Clinical Pros', img: '/assets/human_centered/card_slmc.png' },
            { t: isSinhala ? 'වීඩියෝ ඇමතුම්' : 'Video Calls', s: 'Private Room Consults', img: '/assets/human_centered/card_video.png' },
            { t: isSinhala ? 'සෞඛ්‍ය වාර්තා' : 'Health Records', s: 'Simple & Secure Access', img: '/assets/human_centered/card_records.png' },
            { t: isSinhala ? 'සුරක්ෂිත ගෙවීම්' : 'Secure Billing', s: 'Transparent Payments', img: '/assets/human_centered/card_pay.png' }
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1, duration: 0.8 }}
              whileHover={{ y: -10, rotateX: 5, rotateY: 5, scale: 1.02 }}
              className="bg-white/90 backdrop-blur-sm p-6 rounded-[2.5rem] shadow-premium border border-slate-100 flex flex-col items-center text-center group cursor-default pointer-events-auto overflow-hidden relative"
            >
              <div className="w-full aspect-square max-h-24 mb-4 flex items-center justify-center">
                <img src={card.img} alt={card.t} className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div>
                <h4 className="text-[14px] font-black text-slate-900 uppercase tracking-tight mb-1">{card.t}</h4>
                <p className="text-[9px] text-[#008080] font-black uppercase tracking-widest leading-none">{card.s}</p>
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
  const [isSinhala, setIsSinhala] = useState(false)
  const [doctorName, setDoctorName] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [hospital, setHospital] = useState('')
  const [date, setDate] = useState('')
  const navigate = useNavigate()
  const { token } = useAuth()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (!token) { navigate('/login'); return; }
    const params = new URLSearchParams()
    if (doctorName.trim()) params.set('doctorName', doctorName.trim())
    if (specialization) params.set('specialty', specialization)
    if (hospital.trim()) params.set('hospital', hospital.trim())
    if (date) params.set('date', date)
    navigate(`/search?${params.toString()}`)
  }

  const goProtected = (path) => {
    if (!token) { navigate('/login'); return; }
    navigate(path)
  }

  return (
    <div className="bg-white text-medigo-navy font-inter selection:bg-teal-500 selection:text-white pb-0">
      <NavBar scrolled={scrolled} isSinhala={isSinhala} setIsSinhala={setIsSinhala} />

      <ImmersiveHero isSinhala={isSinhala} />

      {/* ── SEARCH + QUICK ACCESS ─────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <form className="rounded-2xl bg-[#008080] text-white p-6 md:p-8 shadow-2xl" onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-black mb-2 text-white uppercase tracking-wider">{isSinhala ? 'වෛද්‍යවරයාගේ නම' : 'Doctor name'}</label>
                <input
                  type="text"
                  placeholder={isSinhala ? "නම සොයන්න" : "Search doctor name"}
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full h-11 rounded-xl px-4 text-sm text-black font-bold focus:outline-none border-2 border-transparent focus:border-white/50 placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black mb-2 text-white uppercase tracking-wider">{isSinhala ? 'විශේෂඥතාව' : 'Specialization'}</label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full h-11 rounded-xl px-4 text-sm text-black font-bold focus:outline-none"
                >
                  <option value="">{isSinhala ? 'තෝරන්න' : 'Select'}</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-black mb-2 text-white uppercase tracking-wider">{isSinhala ? 'රෝහල' : 'Hospital'}</label>
                <input
                  type="text"
                  placeholder={isSinhala ? "ඇතුළත් කරන්න" : "Select hospital"}
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  className="w-full h-11 rounded-xl px-4 text-sm text-black font-bold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black mb-2 text-white uppercase tracking-wider">{isSinhala ? 'දිනය' : 'Date'}</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-11 rounded-xl px-4 text-sm text-black font-bold focus:outline-none"
                />
              </div>
              <button type="submit" className="h-11 rounded-xl bg-white text-[#008080] text-sm font-black hover:bg-teal-50 transition-all uppercase tracking-widest shadow-lg">
                {isSinhala ? 'සොයන්න' : 'Search'}
              </button>
            </div>
          </form>

          <div className="mt-16">
            <h3 className="text-2xl font-black text-slate-900 mb-8">{isSinhala ? 'ක්ෂණික පිවිසුම්' : 'Quick Access'}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[
                { t: isSinhala ? 'රියදුරු බලපත්‍ර වෛද්‍ය' : 'Driving License Medical', img: '/assets/service_driving.png', path: '/search', protected: true },
                { t: isSinhala ? 'විදේශ කටයුතු වෛද්‍ය' : 'Foreign Affairs Medical', img: '/assets/card_icon_iq.png', path: '/search', protected: true },
                { t: isSinhala ? 'ඊ-ආයුර්වේද' : 'eAyurveda', img: '/assets/hero_1.png', path: '/search', protected: true, isNew: true },
                { t: isSinhala ? 'ඊ-ප්‍රීමියම්' : 'ePremium', img: '/assets/card_icon_slmc.png', path: '/payments', protected: true },
                { t: isSinhala ? 'ඊ-රෝහල' : 'eHospital', icon: Calendar, path: '/appointments', protected: true },
                { t: isSinhala ? 'නිවාස ප්‍රතිකාර' : 'eHomeCare', icon: Heart, path: '/telemedicine', protected: true, isNew: true },
                { t: isSinhala ? 'ඊ-ඖෂධසල' : 'ePharmacy', img: '/assets/service_pharmacy.png', path: '/prescriptions', protected: true },
                { t: isSinhala ? 'රසායනාගාර වාර්තා' : 'eDiagnostics', img: '/assets/card_icon_video.png', path: '/reports', protected: true, isNew: true },
              ].map((item) => (
                <motion.button
                  type="button"
                  key={item.t}
                  whileHover={{ y: -6, scale: 1.02 }}
                  onClick={() => (item.protected ? goProtected(item.path) : navigate(item.path))}
                  className="relative rounded-3xl border-2 border-slate-50 bg-[#f8fafc] p-6 text-center min-h-[160px] flex flex-col items-center justify-center cursor-pointer shadow-sm hover:shadow-xl hover:border-[#008080]/20 transition-all"
                >
                  {item.isNew && (
                    <span className="absolute top-4 right-4 text-[10px] bg-emerald-500 text-white px-3 py-1 rounded-full font-black uppercase">New</span>
                  )}
                  <div className="w-16 h-16 mb-4 flex items-center justify-center bg-white rounded-2xl shadow-md">
                    {item.img ? (
                      <img src={item.img} alt={item.t} className="w-10 h-10 object-contain" />
                    ) : (
                      <item.icon size={28} className="text-[#008080]" />
                    )}
                  </div>
                  <p className="text-sm font-black text-slate-800 leading-snug px-2">{item.t}</p>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="relative pt-24 pb-14 px-6 overflow-hidden bg-white/90 border-t border-slate-100 pb-0">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url("/assets/medical_pattern.png")',
              backgroundSize: '800px',
              backgroundRepeat: 'repeat',
            }}
            animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="rounded-[2.5rem] border border-white/80 bg-white/40 backdrop-blur-md p-8 md:p-12 shadow-2xl shadow-slate-200/50">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[#008080] rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-100 rotate-3">
                    <Stethoscope size={24} />
                  </div>
                  <span className="text-3xl font-extrabold text-medigo-navy tracking-tight">
                    Medi<span className="text-[#008080]">Go</span>
                  </span>
                </div>
                <p className="text-lg text-slate-800 font-bold leading-relaxed max-w-sm">
                  {isSinhala
                    ? 'පවුලේ සැමට නවීන තාක්ෂණයෙන් යුත් කාරුණික ඩිජිටල් සෞඛ්‍ය සේවාව. ඔබේ සෞඛ්‍යය අපගේ ප්‍රමුඛතාවයයි.'
                    : 'Compassionate digital healthcare with modern tools for patients, doctors, and care teams. Your health is our priority.'}
                </p>
              </div>

              <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
                {[
                  { title: isSinhala ? 'සේවා' : 'Platform', items: isSinhala ? ['වෛද්‍යවරුන්', 'ඇපොයිමන්ට්', 'වීඩියෝ ඇමතුම්', 'වාර්තා'] : ['Find Doctors', 'Appointments', 'Video Consults', 'Records'] },
                  { title: isSinhala ? 'සම්පත්' : 'Resources', items: isSinhala ? ['උදවු', 'රහස්‍යතාව', 'කොන්දේසි', 'සම්බන්ධ වන්න'] : ['Help Center', 'Privacy Policy', 'Terms of Service', 'Contact'] },
                  { title: isSinhala ? 'සමාජ' : 'Connect', items: ['Support', 'Community', 'Our Story', 'Join Us'] },
                ].map((col) => (
                  <div key={col.title} className="space-y-6">
                    <h4 className="text-[13px] font-black uppercase tracking-[0.2em] text-medigo-navy">{col.title}</h4>
                    <ul className="space-y-4">
                      {col.items.map((item) => (
                        <li key={item}>
                          <Link to="#" className="text-[15px] font-black text-slate-700 hover:text-[#008080] transition-colors flex items-center group">
                            <span className="w-0 group-hover:w-2 h-0.5 bg-[#008080] mr-0 group-hover:mr-2 transition-all"></span>
                            {item}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-16 pt-10 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-8">
              <div className="text-sm font-black text-slate-700">
                © 2026 <span className="text-medigo-navy font-bold">MediGo</span>.
                {isSinhala ? ' සියලුම හිමිකම් ඇවිරිණි.' : ' Healthcare simplified for everyone.'}
              </div>

              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="group px-8 py-4 bg-white border border-slate-100 rounded-2xl text-medigo-navy font-black text-sm flex items-center gap-3 shadow-xl hover:shadow-teal-100 hover:border-[#008080]/30 transition-all"
              >
                {isSinhala ? 'ඉහළට යන්න' : 'Back to Top'}
                <div className="p-1 bg-slate-100 rounded-lg group-hover:bg-teal-50 group-hover:text-[#008080] transition-colors">
                  <ChevronUp size={18} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}