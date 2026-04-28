import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Mail, Phone, MapPin, Stethoscope, 
  Award, Briefcase, DollarSign, LogOut, 
  ChevronRight, Camera, Shield, Bell, 
  Globe, Clock, CheckCircle2, AlertCircle,
  RefreshCw, Save, ArrowLeft, Star
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { doctorAPI, reportAPI } from '../../services/api'
import DashboardLayout from '../../components/DashboardLayout'

// --- Premium UI Components ---

const GlassCard = ({ children, className = "", hover = true }) => (
  <motion.div
    whileHover={hover ? { y: -5, transition: { duration: 0.2 } } : {}}
    className={`bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_15px_35px_rgba(0,0,0,0.03)] rounded-[2.5rem] overflow-hidden ${className}`}
  >
    {children}
  </motion.div>
)

const SettingRow = ({ icon: Icon, label, value, sub, color = "blue" }) => (
  <div className="flex items-center justify-between p-6 rounded-[2rem] bg-white/40 border border-white/60 hover:bg-white/60 transition-all group">
    <div className="flex items-center gap-5">
      <div className={`w-12 h-12 rounded-2xl bg-${color}-500/10 text-${color}-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-black text-medigo-navy">{value || 'Not specified'}</p>
        {sub && <p className="text-[9px] font-bold text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
    <button className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-medigo-blue hover:border-medigo-blue transition-all">
      <ChevronRight size={16} />
    </button>
  </div>
)

export default function DoctorProfile() {
  const { logout, user: authUser } = useAuth()
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const res = await doctorAPI.getMyProfile()
        setDoctor(res.data.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load your profile.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleSave = async () => {
     setSaving(true)
     try {
       await doctorAPI.updateMyProfile(doctor)
       setSuccess('Settings synchronized successfully.')
       setTimeout(() => setSuccess(''), 3000)
     } catch (err) {
       setError('Failed to save settings.')
     } finally {
       setSaving(false)
     }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setSaving(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('reportFile', file)
      
      // Use doctor ID or fallback to auth ID to satisfy backend requirements
      const docId = doctor.userId || doctor._id || authUser?.doctorId || 'DOC_PROMO'
      formData.append('patientId', docId) 
      formData.append('doctorId', docId)
      formData.append('reportTitle', `Profile Pic - ${doctor.fullName}`)
      formData.append('reportType', 'ProfilePic')
      formData.append('uploadedBy', 'doctor')

      const res = await reportAPI.upload(formData)
      if (res.data.success) {
        const imageUrl = res.data.data.fileUrl
        const updatedDoctor = { ...doctor, profilePic: imageUrl }
        await doctorAPI.updateMyProfile(updatedDoctor)
        setDoctor(updatedDoctor)
        setSuccess('Profile picture updated successfully.')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        throw new Error(res.data.message || 'Upload unsuccessful')
      }
    } catch (err) {
      console.error('Profile Pic Upload Error:', err)
      setError(err.response?.data?.message || err.message || 'Failed to upload image.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout isDoctor>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-medigo-blue/20 border-t-medigo-blue rounded-full animate-spin" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Initializing Vault...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout isDoctor>
      <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Header & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-indigo-500/10 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                     <Shield size={12} /> Privacy Console
                  </div>
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
               </div>
               <h1 className="text-4xl lg:text-6xl font-black text-medigo-navy tracking-tighter leading-none">
                  Core <br />
                  <span className="text-medigo-blue">Settings</span>
               </h1>
               <p className="text-slate-400 text-lg font-medium max-w-xl leading-relaxed">
                  Manage your professional identity, clinical credentials, and account security parameters.
               </p>
            </div>
            <div className="flex items-center gap-4 bg-white/50 backdrop-blur-xl p-3 rounded-[2rem] border border-white shadow-xl">
               <button 
                 onClick={() => navigate('/doctor')}
                 className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-medigo-navy transition-all"
               >
                 <ArrowLeft size={20} />
               </button>
               <button 
                 onClick={handleSave}
                 disabled={saving}
                 className="px-8 py-4 bg-medigo-navy text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-premium hover:shadow-2xl transition-all active:scale-95 flex items-center gap-3 group"
               >
                 {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                 <span>{saving ? 'Syncing...' : 'Save Changes'}</span>
               </button>
            </div>
          </div>

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-4 p-5 bg-emerald-500 text-white rounded-[2rem] shadow-xl shadow-emerald-500/20 text-sm font-black uppercase tracking-widest"
              >
                <CheckCircle2 size={24} /> {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Profile Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Identity Card */}
            <div className="lg:col-span-4 space-y-8">
               <GlassCard className="p-1 relative overflow-hidden" hover={false}>
                  <div className="h-32 bg-gradient-to-tr from-medigo-blue via-indigo-500 to-purple-500 relative">
                     <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
                  </div>
                  <div className="px-8 pb-10 -mt-16 relative z-10 text-center">
                     <div className="relative inline-block group">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-white p-1.5 shadow-2xl relative">
                           <div className="w-full h-full rounded-[2.2rem] bg-slate-100 overflow-hidden flex items-center justify-center text-4xl font-black text-medigo-blue border border-slate-50 relative">
                              {doctor.profilePic ? (
                                <img 
                                  src={doctor.profilePic} 
                                  alt="Profile" 
                                  className="w-full h-full object-cover"
                                />
                              ) : doctor.fullName?.[0]?.toUpperCase()}
                              
                              {saving && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                                  <RefreshCw className="animate-spin text-medigo-blue" size={24} />
                                </div>
                              )}
                           </div>
                           <input 
                             type="file" 
                             id="profile-pic-input" 
                             className="hidden" 
                             accept="image/*"
                             onChange={handleImageUpload}
                           />
                           <label 
                             htmlFor="profile-pic-input"
                             className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-medigo-navy text-white flex items-center justify-center border-4 border-white shadow-lg cursor-pointer hover:bg-medigo-blue transition-all scale-90 group-hover:scale-100 opacity-0 group-hover:opacity-100 z-20"
                           >
                              <Camera size={16} />
                           </label>
                        </div>
                     </div>
                     
                     {/* Inline Status Messages */}
                     <AnimatePresence>
                        {error && (
                          <motion.p initial={{opacity:0}} animate={{opacity:1}} className="text-[10px] font-black text-red-500 uppercase mt-4">{error}</motion.p>
                        )}
                        {success && (
                          <motion.p initial={{opacity:0}} animate={{opacity:1}} className="text-[10px] font-black text-emerald-500 uppercase mt-4">{success}</motion.p>
                        )}
                     </AnimatePresence>
                     <div className="mt-6 space-y-1">
                        <h2 className="text-2xl font-black text-medigo-navy tracking-tight">Dr. {doctor.fullName}</h2>
                        <p className="text-[10px] font-black text-medigo-blue uppercase tracking-[0.3em]">{doctor.specialty || 'Medical Specialist'}</p>
                     </div>
                     <div className="flex items-center justify-center gap-4 mt-8">
                        <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                           <Shield size={12} /> {doctor.status || 'Verified'}
                        </div>
                        <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                           <Star size={12} className="fill-amber-600" /> 4.9
                        </div>
                     </div>
                  </div>
                  <div className="border-t border-slate-50 bg-slate-50/30 p-6 flex items-center justify-between">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Public Profile Visibility</span>
                     <div className="w-12 h-6 rounded-full bg-emerald-500 flex items-center justify-end px-1 shadow-inner">
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                     </div>
                  </div>
               </GlassCard>

               <div className="flex gap-4">
                  <button onClick={logout} className="flex-1 h-14 bg-red-50 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all active:scale-95 border border-red-100 shadow-sm">
                     <LogOut size={16} /> Terminate Session
                  </button>
               </div>
            </div>

            {/* Right: Settings Groups */}
            <div className="lg:col-span-8 space-y-10">
               
               {/* Contact Group */}
               <div className="space-y-6">
                  <div className="flex items-center gap-3 px-2">
                     <div className="w-1.5 h-6 bg-medigo-blue rounded-full" />
                     <h3 className="text-[11px] font-black text-medigo-navy uppercase tracking-[0.2em]">Contact & Reachability</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <SettingRow icon={Mail} label="Professional Email" value={doctor.email} sub="Primary communication channel" color="blue" />
                     <SettingRow icon={Phone} label="Contact Number" value={doctor.phone} sub="Emergency & Patient callback" color="indigo" />
                     <SettingRow icon={MapPin} label="Primary Clinic" value={doctor.clinicLocation} sub="On-site consultation hub" color="emerald" />
                     <SettingRow icon={Globe} label="Region" value="South Asia" sub="Timezone: UTC+5:30" color="purple" />
                  </div>
               </div>

               {/* Clinical Group */}
               <div className="space-y-6">
                  <div className="flex items-center gap-3 px-2">
                     <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                     <h3 className="text-[11px] font-black text-medigo-navy uppercase tracking-[0.2em]">Clinical Credentials</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <SettingRow icon={Award} label="Qualifications" value={doctor.qualifications} color="amber" />
                     <SettingRow icon={Briefcase} label="Experience" value={`${doctor.experienceYears || '0'} Years Prof.`} color="sky" />
                     <SettingRow icon={DollarSign} label="Consultation Fee" value={`LKR ${doctor.consultationFee || '2500'}`} color="emerald" />
                     <SettingRow icon={Clock} label="Session Capacity" value="20 Patients / Daily" color="indigo" />
                  </div>
               </div>

               {/* System Settings */}
               <div className="space-y-6">
                  <div className="flex items-center gap-3 px-2">
                     <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
                     <h3 className="text-[11px] font-black text-medigo-navy uppercase tracking-[0.2em]">Platform Preferences</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <SettingRow icon={Bell} label="Notifications" value="Enabled" sub="Push, Email & SMS" color="rose" />
                     <SettingRow icon={Shield} label="Security" value="MFA Active" sub="2-Step Verification" color="slate" />
                  </div>
               </div>

               {/* Bio Section */}
               <GlassCard className="p-8" hover={false}>
                  <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-3">
                        <User size={18} className="text-medigo-blue" />
                        <h4 className="text-[11px] font-black text-medigo-navy uppercase tracking-[0.2em]">Professional Bio</h4>
                     </div>
                     <button className="text-[10px] font-black text-medigo-blue hover:underline uppercase tracking-widest">Edit Biography</button>
                  </div>
                  <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6">
                     <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                        "{doctor.bio || 'Please provide a professional biography to help patients understand your background and expertise.'}"
                     </p>
                  </div>
               </GlassCard>

            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}