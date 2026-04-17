import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { doctorAPI } from '../../services/api'
import { motion, AnimatePresence } from 'framer-motion'

const SPECIALTIES = [
  'General Medicine', 'Cardiology', 'Dermatology', 'Neurology', 
  'Pediatrics', 'Psychiatry', 'Orthopedics', 'Gynecology', 'ENT'
]

export default function DoctorRegistration() {
  const [form, setForm] = useState({ 
    fullName: '', email: '', phone: '', specialty: 'General Medicine', 
    qualifications: '', experienceYears: '', clinicLocation: '', 
    consultationFee: '', bio: '' 
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await doctorAPI.register({ ...form, status: 'pending' })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 5000)
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please check your data.')
    } finally { setLoading(false) }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center p-6 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-xl border border-teal-500/20 rounded-3xl p-12 max-w-lg shadow-2xl shadow-teal-500/10">
          <div className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-6 shadow-glow">✓</div>
          <h1 className="font-display text-3xl font-black text-white mb-4">Application Received!</h1>
          <p className="text-white/60 leading-relaxed mb-6 text-lg">
            Thank you, Dr. <span className="text-white font-bold">{form.fullName.split(' ').pop()}</span>. 
            Our medical board will review your credentials and clinical experience. 
            Check your email for status updates—this typically takes 24-48 hours.
          </p>
          <p className="text-teal-400 text-sm font-bold animate-pulse">Redirecting to home...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col lg:flex-row overflow-hidden italic-bg">
      {/* Visual Overlay */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden h-screen w-screen z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Left side: Information */}
      <div className="lg:w-2/5 p-8 lg:p-16 flex flex-col justify-between relative z-10 bg-navy-950/40 border-r border-white/5">
        <Link to="/" className="inline-flex items-center gap-2 font-display font-black text-2xl text-white mb-12">
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <rect x="11" y="3" width="2" height="18"/><rect x="3" y="11" width="18" height="2"/>
            </svg>
          </div>
          MEDI<span className="text-teal-400">GO</span>
        </Link>

        <div>
           <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">
            Professional Network
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
            Join the Next <br/><span className="text-teal-400 italic font-medium">Generation</span> of Care.
          </h2>
          <p className="text-white/50 text-lg leading-relaxed max-w-md">
            Medigo provides its clinical staff with high-fidelity telemedicine tools, simplified reporting, and a global patient base. 
            Apply today to expand your practice.
          </p>
        </div>

        <div className="mt-12">
          <div className="flex -space-x-3 mb-4">
            {[1,2,3,4].map(i => (
               <div key={i} className={`w-10 h-10 rounded-full border-2 border-navy-900 bg-teal-${400 + i*100}`} />
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-navy-900 bg-white/10 flex items-center justify-center text-white text-[10px] font-bold">+12k</div>
          </div>
          <p className="text-white/30 text-xs">Join thousands of verified professionals globally.</p>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="flex-1 p-8 lg:p-16 overflow-y-auto relative z-10 custom-scrollbar">
        <div className="max-w-xl mx-auto">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="font-display text-3xl font-black text-white">Practitioner Application</h1>
            <p className="text-white/40 mt-1">Please provide accurate professional records for verification.</p>
          </div>

          {error && (
            <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-sm mb-8 flex items-center gap-3">
              <span className="text-xl">⚠️</span> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2 ml-1">Full Name</label>
              <input type="text" required placeholder="Dr. Alexander Maxwell"
                value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-teal-500 focus:bg-white/10 transition-all font-semibold" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2 ml-1">Work Email</label>
              <input type="email" required placeholder="alex@hospital.com"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-teal-500 focus:bg-white/10 transition-all font-semibold" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
              <input type="tel" required placeholder="07XXXXXXXX"
                value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-teal-500 focus:bg-white/10 transition-all font-semibold" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2 ml-1">Specialty</label>
              <select required value={form.specialty} onChange={e => setForm({...form, specialty: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-teal-500 focus:bg-white/10 transition-all font-semibold appearance-none">
                {SPECIALTIES.map(s => <option key={s} value={s} className="bg-navy-900">{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2 ml-1">Experience Years</label>
              <input type="number" required placeholder="8"
                value={form.experienceYears} onChange={e => setForm({...form, experienceYears: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-teal-500 focus:bg-white/10 transition-all font-semibold" 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2 ml-1">Qualifications</label>
              <input type="text" required placeholder="MBBS, MD Cardiology (Imperial College London)"
                value={form.qualifications} onChange={e => setForm({...form, qualifications: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-teal-500 focus:bg-white/10 transition-all font-semibold" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2 ml-1">Clinic/Hospital Location</label>
              <input type="text" required placeholder="Central Hospital, Colombo 07"
                value={form.clinicLocation} onChange={e => setForm({...form, clinicLocation: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-teal-500 focus:bg-white/10 transition-all font-semibold" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2 ml-1">Consultation Fee (Rs.)</label>
              <input type="number" required placeholder="2500"
                value={form.consultationFee} onChange={e => setForm({...form, consultationFee: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-teal-500 focus:bg-white/10 transition-all font-semibold" 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2 ml-1">Professional Bio</label>
              <textarea rows="4" placeholder="Briefly describe your clinical focus and patient philosophy..."
                value={form.bio} onChange={e => setForm({...form, bio: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-teal-500 focus:bg-white/10 transition-all font-semibold resize-none" 
              />
            </div>

            <div className="md:col-span-2 mt-4">
              <button type="submit" disabled={loading}
                className="w-full bg-teal-500 hover:bg-teal-400 text-white font-display font-black text-lg py-5 rounded-2xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-3 group disabled:opacity-50">
                {loading ? 'Processing...' : (
                  <>Submit Professional Records <span className="group-hover:translate-x-1 transition-transform">→</span></>
                )}
              </button>
            </div>
          </form>

          <footer className="mt-12 text-center text-white/30 text-[10px] uppercase tracking-widest pb-10">
            © 2026 MEDIGO Medical Board • Encrypted Submission • HIPAA Compliant
          </footer>
        </div>
      </div>
    </div>
  )
}
