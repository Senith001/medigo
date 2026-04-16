import { Link } from 'react-router-dom'

const FEATURES = [
  { icon: '🔍', title: 'Find Specialists', desc: 'Search 500+ verified doctors across 20+ specialties instantly.' },
  { icon: '📅', title: 'Easy Booking',     desc: 'Book appointments in seconds — pick your date and time slot.' },
  { icon: '📹', title: 'Telemedicine',     desc: 'Consult from home with secure HD video consultations.' },
  { icon: '📋', title: 'Medical Records',  desc: 'Access prescriptions and reports anytime, anywhere.' },
  { icon: '🔔', title: 'Notifications',    desc: 'Email & SMS reminders so you never miss an appointment.' },
  { icon: '💳', title: 'Easy Payments',    desc: 'Secure online payments with instant confirmation.' },
]

const SPECIALTIES = [
  { name: 'Cardiology',    icon: '❤️',  count: 42 },
  { name: 'Dermatology',   icon: '🧴',  count: 38 },
  { name: 'Neurology',     icon: '🧠',  count: 29 },
  { name: 'Orthopedics',   icon: '🦴',  count: 35 },
  { name: 'Pediatrics',    icon: '👶',  count: 51 },
  { name: 'Psychiatry',    icon: '🧘',  count: 24 },
  { name: 'Gynecology',    icon: '🌸',  count: 33 },
  { name: 'General Med.',  icon: '🩺',  count: 87 },
]

const STATS = [
  { val: '500+',  label: 'Verified Doctors' },
  { val: '20+',   label: 'Specializations'  },
  { val: '50K+',  label: 'Appointments Done' },
  { val: '4.9 ★', label: 'Average Rating'   },
]

const HOW = [
  { step:'01', title:'Create Account',     desc:'Register as a patient with your email in under a minute.' },
  { step:'02', title:'Search Doctors',     desc:'Filter by specialty, location, or availability to find the right doctor.' },
  { step:'03', title:'Book Appointment',   desc:'Pick a date and time slot — confirm in one click.' },
  { step:'04', title:'Get Consultation',   desc:'Meet your doctor in-person or via video call.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-body">

      {/* ── Navbar ─────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-navy-700 shadow-navy">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-display font-black text-xl text-white">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <rect x="11" y="3" width="2" height="18"/><rect x="3" y="11" width="18" height="2"/>
              </svg>
            </div>
            MEDI<span className="text-teal-400">GO</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"    className="text-white/70 hover:text-white text-sm font-semibold transition-colors px-3 py-1.5">Sign In</Link>
            <Link to="/register" className="btn btn-teal btn-sm">Get Started</Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-700 to-navy-800 pb-24 pt-20">
        {/* Decor blobs */}
        <div className="absolute w-96 h-96 rounded-full bg-teal-500/10 -top-20 -right-20 pointer-events-none" />
        <div className="absolute w-64 h-64 rounded-full bg-teal-400/5 bottom-0 left-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="max-w-2xl mx-auto text-center">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 bg-teal-500/15 border border-teal-400/30 text-teal-300 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              Sri Lanka's #1 Healthcare Platform
            </div>

            <h1 className="font-display text-5xl md:text-6xl font-black text-white leading-tight mb-5">
              Your Health,<br/>
              <span className="text-teal-400">Our Priority</span>
            </h1>
            <p className="text-white/60 text-lg mb-10 leading-relaxed">
              Connect with top doctors instantly. Book appointments, get telemedicine consultations, and manage your health records — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register" className="btn btn-teal btn-lg text-base font-bold">
                Book Appointment Free →
              </Link>
              <Link to="/login" className="btn btn-lg bg-white/10 text-white border border-white/20 hover:bg-white/20">
                Sign In
              </Link>
            </div>

            {/* Trust row */}
            <div className="flex items-center justify-center gap-6 mt-10 text-sm text-white/40">
              {['✅ Free to register', '🔒 Secure & Private', '📧 Instant confirmation'].map(t => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────── */}
      <section className="bg-navy-800 py-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-0">
          {STATS.map((s, i) => (
            <div key={s.label} className={`text-center py-2 ${i < 3 ? 'border-r border-white/10' : ''}`}>
              <div className="text-3xl font-black text-teal-400 font-display">{s.val}</div>
              <div className="text-xs text-white/50 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-black text-gray-900 mb-3">Everything You Need</h2>
            <p className="text-gray-500 max-w-xl mx-auto">MEDIGO brings the entire healthcare journey into one seamless platform.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="card p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 animate-fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-2xl mb-4">{f.icon}</div>
                <h3 className="font-display font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Browse Specialties ─────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-4xl font-black text-gray-900 mb-2">Browse by Specialty</h2>
              <p className="text-gray-500">Find the right specialist for your needs.</p>
            </div>
            <Link to="/register" className="btn btn-outline hidden sm:flex">View All →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SPECIALTIES.map((s, i) => (
              <div key={s.name} className="card p-5 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-pointer animate-fade-up border border-gray-100"
                style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="text-4xl mb-3">{s.icon}</div>
                <div className="font-bold text-gray-800 text-sm">{s.name}</div>
                <div className="text-xs text-teal-500 mt-1 font-semibold">{s.count} Doctors</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-navy-900 to-navy-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-black text-white mb-3">How It Works</h2>
            <p className="text-white/50">Get started in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW.map((h, i) => (
              <div key={h.step} className="text-center animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-400/30 text-teal-400 font-display font-black text-xl flex items-center justify-center mx-auto mb-4">
                  {h.step}
                </div>
                <h3 className="font-display font-bold text-white text-lg mb-2">{h.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────── */}
      <section className="py-20 bg-teal-500">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl font-black text-white mb-4">Ready to Get Started?</h2>
          <p className="text-white/80 mb-8 text-lg">Join thousands of patients who trust MEDIGO for their healthcare journey.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn btn-lg bg-white text-teal-600 font-bold hover:bg-teal-50">
              Create Free Account
            </Link>
            <Link to="/login" className="btn btn-lg bg-teal-600 text-white border border-white/20 hover:bg-teal-700">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────── */}
      <footer className="bg-navy-900 text-white/50 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2 font-display font-black text-white text-lg">
            <div className="w-7 h-7 bg-teal-500 rounded-lg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <rect x="11" y="3" width="2" height="18"/><rect x="3" y="11" width="18" height="2"/>
              </svg>
            </div>
            MEDI<span className="text-teal-400">GO</span>
          </div>
          <p>© {new Date().getFullYear()} MEDIGO. All rights reserved.</p>
          <div className="flex gap-5">
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
