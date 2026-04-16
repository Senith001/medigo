import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShieldCheck, Lock, Mail, 
  ArrowRight, AlertCircle, Loader2,
  Stethoscope, ShieldAlert, Cpu
} from 'lucide-react'
import { adminAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleChange = (e) => setCredentials({ ...credentials, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await adminAPI.adminLogin(credentials)
      const userData = res.data.data

      if (userData.role !== 'admin' && userData.role !== 'superadmin') {
        setError('Unauthorized access. Administrative credentials required.')
        setLoading(false)
        return
      }

      login(res.data.token, userData)
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid administrative credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 font-inter selection:bg-medigo-blue selection:text-white flex overflow-hidden">
      {/* Left Decoration Column */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden">
         {/* Animated Background Gradients */}
         <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent_70%)] animate-pulse" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
         
         <div className="relative z-10 p-24 flex flex-col justify-between">
            <Link to="/" className="flex items-center gap-4 group">
               <div className="w-12 h-12 bg-medigo-blue rounded-xl flex items-center justify-center text-white shadow-3xl shadow-blue-500/20 group-hover:rotate-12 transition-transform">
                  <Stethoscope size={28} />
               </div>
               <span className="text-3xl font-black tracking-tighter text-white italic uppercase">
                  Medi<span className="text-medigo-blue">Go</span>
               </span>
            </Link>

            <div className="space-y-6">
               <div className="flex items-center gap-3">
                  <div className="h-0.5 w-12 bg-medigo-blue rounded-full" />
                  <span className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">Authorized Access Only</span>
               </div>
               <h1 className="text-6xl font-black text-white leading-[0.9] tracking-tighter uppercase italic">
                  Command <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-medigo-blue to-cyan-400">Control.</span>
               </h1>
               <p className="text-lg text-slate-500 font-medium max-w-md leading-relaxed">
                  Enterprise-grade administrative gateway for global clinical oversight and medical personnel verification.
               </p>
            </div>

            <div className="flex items-center gap-8 text-white/20">
               <div className="flex items-center gap-2">
                  <ShieldCheck size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">ISO 27001 SECURE</span>
               </div>
               <div className="flex items-center gap-2">
                  <Cpu size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">TLS 1.3 ENCRYPTION</span>
               </div>
            </div>
         </div>
      </div>

      {/* Right Login Column */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-medigo-blue/5 blur-[120px] rounded-full -z-10" />
         
         <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           className="w-full max-w-md space-y-12"
         >
            <div className="space-y-4">
               <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-900 border border-slate-800 rounded-full">
                  <ShieldAlert size={14} className="text-amber-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Internal Access Portal</span>
               </div>
               <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Admin <span className="text-medigo-blue">Login</span></h2>
               <p className="text-slate-500 font-medium">Verify credentials to access the operational control hub.</p>
            </div>

            <AnimatePresence mode="wait">
               {error && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3 text-red-400 text-sm font-bold shadow-lg shadow-red-500/5 animate-shake"
                 >
                    <AlertCircle size={20} className="shrink-0" />
                    {error}
                 </motion.div>
               )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">Admin Identifier</label>
                  <div className="relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 transition-colors pointer-events-none group-focus-within:text-medigo-blue">
                       <Mail size={18} />
                    </div>
                    <input 
                      type="email" name="email" required
                      value={credentials.email}
                      onChange={handleChange}
                      placeholder="admin@medigo.com"
                      className="w-full h-14 bg-slate-900/50 border border-slate-800 rounded-2xl pl-14 pr-6 text-white outline-none focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/5 transition-all font-bold placeholder:text-slate-700"
                    />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">Secure Passkey</label>
                  <div className="relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 transition-colors pointer-events-none group-focus-within:text-medigo-blue">
                       <Lock size={18} />
                    </div>
                    <input 
                      type="password" name="password" required
                      value={credentials.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full h-14 bg-slate-900/50 border border-slate-800 rounded-2xl pl-14 pr-6 text-white outline-none focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/5 transition-all font-bold placeholder:text-slate-700"
                    />
                  </div>
               </div>

               <Button 
                  loading={loading}
                  className="w-full h-16 text-lg bg-medigo-blue hover:bg-medigo-blue-dark shadow-3xl shadow-blue-500/20 group"
               >
                  Authorize Entry <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
               </Button>
            </form>

            <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-6">
               <Link to="/" className="text-xs font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors">Return to Surface</Link>
               <span className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em]">Terminal Secured • IP Logged</span>
            </div>
         </motion.div>
      </div>
    </div>
  )
}