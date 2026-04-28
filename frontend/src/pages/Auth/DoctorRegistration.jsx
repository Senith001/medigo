import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Stethoscope, Mail, Phone, MapPin, 
  CreditCard, BookOpen, User, 
  CheckCircle2, AlertCircle, Sparkles,
  ChevronRight, ArrowRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { doctorAPI } from '../../services/api'
import AuthLayout from '../../components/AuthLayout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

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
      setError(err.response?.data?.message || 'Submission failed. Please check your professional details.')
    } finally { setLoading(false) }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-slate-200 rounded-3xl p-10 max-w-lg shadow-premium text-center"
        >
          <div className="w-20 h-20 bg-medigo-mint/10 text-medigo-mint rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-3xl font-black text-medigo-navy mb-4 tracking-tight">Application Received!</h1>
          <p className="text-slate-500 leading-relaxed mb-8">
            Thank you, Dr. <span className="text-medigo-navy font-bold">{form.fullName.split(' ').pop()}</span>. 
            Our medical board will review your credentials and clinical experience. 
            Check your email for status updates—this typically takes 24-48 hours.
          </p>
          <div className="flex items-center justify-center gap-2 text-medigo-blue font-bold text-sm">
             <div className="w-4 h-4 border-2 border-medigo-blue/30 border-t-medigo-blue rounded-full animate-spin" />
             Redirecting to login...
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <AuthLayout 
      isWide={true}
      title="Practitioner Application" 
      subtitle="Join the Next Generation of Care. Join thousands of verified professionals globally."
      image="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=1600&q=80&fit=crop"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleSubmit} className="space-y-6 pb-12">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-600"
            >
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Input 
                label="Full Name" 
                required 
                placeholder="Dr. Alexander Maxwell"
                icon={User}
                value={form.fullName} 
                onChange={e => setForm({...form, fullName: e.target.value})}
              />
            </div>

            <Input 
              label="Work Email" 
              type="email" 
              required 
              placeholder="alex@hospital.com"
              icon={Mail}
              value={form.email} 
              onChange={e => setForm({...form, email: e.target.value})}
            />

            <Input 
              label="Phone Number" 
              type="tel" 
              required 
              placeholder="07XXXXXXXX"
              icon={Phone}
              value={form.phone} 
              onChange={e => setForm({...form, phone: e.target.value})}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Specialty</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-medigo-blue">
                  <Stethoscope size={18} />
                </div>
                <select 
                  required 
                  value={form.specialty} 
                  onChange={e => setForm({...form, specialty: e.target.value})}
                  className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/10 appearance-none font-medium text-slate-900 transition-all font-inter"
                >
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                   <ChevronRight size={14} className="rotate-90" />
                </div>
              </div>
            </div>

            <Input 
              label="Experience (Years)" 
              type="number" 
              required 
              placeholder="8"
              icon={Sparkles}
              value={form.experienceYears} 
              onChange={e => setForm({...form, experienceYears: e.target.value})}
            />

            <div className="md:col-span-2">
              <Input 
                label="Qualifications" 
                required 
                placeholder="MBBS, MD Cardiology (Imperial College London)"
                icon={BookOpen}
                value={form.qualifications} 
                onChange={e => setForm({...form, qualifications: e.target.value})}
              />
            </div>

            <Input 
              label="Primary Clinic Location" 
              required 
              placeholder="Central Hospital, Colombo 07"
              icon={MapPin}
              value={form.clinicLocation} 
              onChange={e => setForm({...form, clinicLocation: e.target.value})}
            />

            <Input 
              label="Consultation Fee (LKR)" 
              type="number" 
              required 
              placeholder="2500"
              icon={CreditCard}
              value={form.consultationFee} 
              onChange={e => setForm({...form, consultationFee: e.target.value})}
            />

            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Professional Bio</label>
              <textarea 
                rows="4" 
                placeholder="Briefly describe your clinical focus and patient philosophy..."
                value={form.bio} 
                onChange={e => setForm({...form, bio: e.target.value})}
                className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-slate-900 outline-none focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/10 transition-all font-medium resize-none font-inter" 
              />
            </div>
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              loading={loading}
              className="w-full h-14 text-lg"
            >
              Submit Professional Records <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="text-center pt-2">
             <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                <CheckCircle2 size={12} className="text-medigo-mint" /> 
                Secure HIPAA-compliant medical application
             </p>
          </div>
        </form>

        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-slate-500 font-medium hover:text-medigo-blue transition-colors">
            Already registered? <span className="font-bold">Log in to Doctor Portal</span>
          </Link>
        </div>
      </motion.div>
    </AuthLayout>
  )
}
