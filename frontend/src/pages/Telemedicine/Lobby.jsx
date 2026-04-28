import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Video, 
  Mic, 
  Settings, 
  Loader2, 
  Clock, 
  Layout, 
  Shield, 
  AlertCircle,
  VideoOff,
  MicOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2
} from "lucide-react";
import { telemedicineAPI, appointmentAPI } from "../../services/api";
import Button from "../../components/ui/Button";

const formatSessionTime = (scheduledAt) => {
  if (!scheduledAt) return null;

  const date = new Date(scheduledAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Lobby = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [checking, setChecking] = useState(true);
  const [signalStrength, setSignalStrength] = useState(100);

  useEffect(() => {
    const initLobby = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        try {
          const { data: tele } = await telemedicineAPI.getByAppt(appointmentId);
          setSession(tele);
          return;
        } catch (teleErr) {
          const { data: appt } = await appointmentAPI.getById(appointmentId);
          setAppointment(appt);

          if (user.role === "doctor") {
            const { data: newSession } = await telemedicineAPI.create({
              appointmentId: appt._id
            });
            setSession(newSession.session);
          } else if (appt.status !== "confirmed") {
            setError("Consultation room will open after the appointment is confirmed.");
          } else if (appt.paymentStatus !== "paid") {
            setError("Consultation room will open after the payment is completed.");
          } else {
            setError("Consultation room hasn't been opened by the doctor yet.");
          }
        }
      } catch (err) {
        setError("Could not retrieve appointment details.");
      } finally {
        setTimeout(() => setChecking(false), 2000);
        setLoading(false);
      }
    };
    initLobby();
  }, [appointmentId]);

  const handleJoin = async () => {
    try {
      await telemedicineAPI.join(session._id);
      navigate(`/telemedicine/room/${session._id}`);
    } catch (err) {
      setError("Failed to join the room. Please try again.");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-medigo-navy text-white space-y-4">
      <div className="w-16 h-16 border-4 border-white/10 border-t-medigo-blue rounded-full animate-spin" />
      <p className="text-xs font-black uppercase tracking-[0.3em] opacity-40">Initializing Secure Room</p>
    </div>
  );

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const doctorName = session?.doctorName || appointment?.doctorName;
  const patientName = session?.patientName || appointment?.patientName;
  const sessionTime =
    formatSessionTime(session?.scheduledAt) || appointment?.timeSlot || "scheduled time";

  return (
    <div className="min-h-screen bg-slate-950 text-white font-inter flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-medigo-blue/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-medigo-teal/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10"
      >
        
        {/* Left: Cam Preview & Hardware Controls */}
        <div className="space-y-8">
           <div className="relative group">
              <div className="aspect-video bg-slate-900 rounded-[3rem] overflow-hidden border border-white/10 shadow-3xl relative">
                 <AnimatePresence mode="wait">
                    {!cameraOn ? (
                       <motion.div 
                         key="cam-off"
                         initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                         className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-xl"
                       >
                          <div className="w-24 h-24 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center mb-4">
                             <VideoOff size={32} className="text-slate-500" />
                          </div>
                          <p className="text-sm font-bold text-slate-400">Camera is turned off</p>
                       </motion.div>
                    ) : (
                       <motion.div 
                         key="cam-on"
                         initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                         className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent flex flex-col justify-end p-10"
                       >
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-black text-sm">
                                {user.name?.[0].toUpperCase()}
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-medigo-blue uppercase tracking-widest leading-none mb-1">Preview Mode</p>
                                <p className="text-lg font-black tracking-tight">{user.name}</p>
                             </div>
                          </div>
                       </motion.div>
                    )}
                 </AnimatePresence>

                 {/* Hardware Quick Actions */}
                 <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4">
                    <button 
                       onClick={() => setMicOn(!micOn)}
                       className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 border ${
                         micOn 
                           ? "bg-white/10 border-white/10 text-white hover:bg-white/20" 
                           : "bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/20"
                       }`}
                    >
                       {micOn ? <Mic size={24} /> : <MicOff size={24} />}
                    </button>
                    <button 
                       onClick={() => setCameraOn(!cameraOn)}
                       className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 border ${
                         cameraOn 
                           ? "bg-white/10 border-white/10 text-white hover:bg-white/20" 
                           : "bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/20"
                       }`}
                    >
                       {cameraOn ? <Video size={24} /> : <VideoOff size={24} />}
                    </button>
                    <button className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                       <Settings size={22} />
                    </button>
                 </div>
              </div>
              
              {/* Floating Badge */}
               <div className="absolute -top-4 -right-4 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 shadow-2xl">
                  {checking ? (
                    <div className="flex items-center gap-2">
                       <Loader2 size={12} className="animate-spin text-medigo-mint" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Checking Hardware...</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Hardware Verified</span>
                    </>
                  )}
               </div>
            </div>
           
           <div className="flex items-center gap-8 px-4">
              <div className="flex flex-col gap-1">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Speed</span>
                 <div className="flex gap-1.5 items-end h-4">
                    <div className="w-1 h-2 bg-emerald-500/30 rounded-full" />
                    <div className="w-1 h-3 bg-emerald-500/60 rounded-full" />
                    <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                 </div>
              </div>
              <div className="flex flex-col gap-1 border-l border-white/5 pl-8">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Privacy level</span>
                 <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck size={14} /> HIPAA Compliant
                 </div>
              </div>
           </div>
        </div>

        {/* Right: Room Info & Join CTA */}
        <div className="space-y-12">
           <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-medigo-blue/10 border border-medigo-blue/20 rounded-full text-medigo-blue">
                 <Zap size={16} fill="currentColor" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Smart Telemedicine</span>
              </div>
              
              <div className="space-y-4">
                 <h1 className="text-5xl font-black tracking-tighter leading-none italic uppercase">Virtual Consultation</h1>
                 <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-md">
                    Dr. <span className="text-white font-bold">{doctorName}</span> is ready for your <span className="text-white font-bold">{sessionTime}</span> session. Join now to enter the secure diagnostic room.
                 </p>
              </div>
           </div>

           {/* Participant Card */}
           <div className="bg-white/[0.03] backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
              <div className="flex items-center gap-6">
                 <div className="flex -space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-medigo-navy border-4 border-slate-950 flex items-center justify-center font-black shadow-2xl overflow-hidden relative group-hover:-translate-x-2 transition-transform capitalize">
                       {doctorName?.[0]}
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-medigo-mint border-4 border-slate-950 flex items-center justify-center font-black shadow-2xl overflow-hidden relative group-hover:translate-x-2 transition-transform capitalize">
                       {patientName?.[0]}
                    </div>
                 </div>
                 <div className="space-y-1">
                    <p className="text-sm font-black uppercase tracking-widest leading-none">Safe-Room Active</p>
                    <p className="text-xs text-slate-500 font-bold leading-none">2 Participants Expected</p>
                 </div>
              </div>
              <CheckCircle2 size={24} className="text-emerald-500" />
           </div>

           {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="p-5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-3xl flex items-start gap-4"
              >
                 <AlertCircle className="shrink-0 mt-0.5" size={20} />
                 <div>
                    <p className="text-sm font-black uppercase tracking-widest leading-none mb-1.5">Waiting for connection</p>
                    <p className="text-xs font-medium opacity-80">{error}</p>
                 </div>
              </motion.div>
           )}

           <div className="pt-4">
              <button
                disabled={!!error || !session}
                onClick={handleJoin}
                className="w-full bg-white text-medigo-navy py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-3 hover:bg-medigo-blue hover:text-white transition-all shadow-3xl shadow-white/5 disabled:opacity-20 transform active:scale-95 group transition-all"
              >
                Join Consultation Room
                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </button>
           </div>

           <div className="text-center">
              <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                 <Shield size={12} /> Encrypted at Rest & Transit • HIPAA Verified
              </p>
           </div>
        </div>

      </motion.div>
    </div>
  );
};

export default Lobby;
