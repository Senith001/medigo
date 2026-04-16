import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  ArrowRight
} from "lucide-react";
import { telemedicineAPI, appointmentAPI } from "../../services/api";

const Lobby = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  useEffect(() => {
    const initLobby = async () => {
      try {
        const { data: appt } = await appointmentAPI.getById(appointmentId);
        setAppointment(appt);

        // Try to get or create telemedicine session
        try {
          const { data: tele } = await telemedicineAPI.getByAppt(appointmentId);
          setSession(tele);
        } catch (teleErr) {
          // If session doesn't exist, and user is doctor, create it
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          if (user.role === "doctor") {
            const { data: newSession } = await telemedicineAPI.create({
              appointmentId: appt._id,
              patientId: appt.patientId,
              patientName: appt.patientName,
              doctorId: appt.doctorId,
              doctorName: appt.doctorName,
              scheduledAt: appt.date + " " + appt.timeSlot
            });
            setSession(newSession.session);
          } else {
            setError("Consultation room hasn't been opened by the doctor yet.");
          }
        }
      } catch (err) {
        setError("Could not retrieve appointment details.");
      } finally {
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

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-slate-900"><Loader2 className="animate-spin text-white w-12 h-12" /></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Cam Preview */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group"
        >
          <div className="aspect-video bg-slate-900 rounded-[32px] overflow-hidden border border-white/10 shadow-2xl relative">
            {!cameraOn ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center">
                  <VideoOff className="w-8 h-8 text-slate-500" />
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex flex-col justify-end p-8">
                <p className="text-sm font-bold text-white/50 mb-1">Previewing</p>
                <p className="text-xl font-black">{JSON.parse(localStorage.getItem("user") || "{}").name}</p>
              </div>
            )}

            {/* Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
              <button 
                onClick={() => setMicOn(!micOn)}
                className={`p-4 rounded-2xl transition-all ${micOn ? "bg-white/10 hover:bg-white/20" : "bg-red-500 hover:bg-red-600"}`}
              >
                {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </button>
              <button 
                onClick={() => setCameraOn(!cameraOn)}
                className={`p-4 rounded-2xl transition-all ${cameraOn ? "bg-white/10 hover:bg-white/20" : "bg-red-500 hover:bg-red-600"}`}
              >
                {cameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              </button>
              <button className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all">
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Info & Action */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 text-teal-400 font-bold mb-4">
              <Shield className="w-5 h-5" />
              Secure Consultation
            </div>
            <h1 className="text-5xl font-black tracking-tight leading-tight">Ready to join your session?</h1>
            <p className="text-slate-400 text-lg mt-4 leading-relaxed">
              Dr. {appointment?.doctorName} is available for your {appointment?.timeSlot} consultation today. Ensure your internet connection is stable.
            </p>
          </div>

          <div className="bg-white/5 p-6 rounded-[24px] border border-white/10 flex items-center gap-6">
            <div className="flex -space-x-4">
              <div className="w-14 h-14 rounded-full bg-teal-600 border-4 border-slate-950 flex items-center justify-center font-bold">D</div>
              <div className="w-14 h-14 rounded-full bg-indigo-600 border-4 border-slate-950 flex items-center justify-center font-bold font-mono">P</div>
            </div>
            <div className="text-sm">
              <p className="text-white font-bold">Encryption Active</p>
              <p className="text-white/40">Only you and your doctor can access this room.</p>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <button
            disabled={!!error || !session}
            onClick={handleJoin}
            className="w-full bg-white text-slate-950 py-5 rounded-3xl font-black text-xl flex items-center justify-center gap-3 hover:bg-teal-400 transition-all shadow-2xl shadow-white/5 disabled:opacity-30 disabled:hover:bg-white"
          >
            Join Consultation
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default Lobby;
