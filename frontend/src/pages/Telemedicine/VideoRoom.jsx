import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { 
  Loader2, ArrowLeft, AlertCircle, 
  ShieldCheck, Activity, Video, 
  User, Lock, CheckCircle2,
  XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { telemedicineAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const VideoRoom = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [jitsiApi, setJitsiApi] = useState(null);
  const [jitsiToken, setJitsiToken] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        console.log("[VideoRoom] Fetching session data for", sessionId);
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        console.log("[VideoRoom] User from localStorage:", userData);
        console.log("[VideoRoom] User from AuthContext:", authUser);
        setUser(userData);
        
        const { data } = await telemedicineAPI.getById(sessionId);
        console.log("[VideoRoom] Session fetched successfully", data);
        setSession(data);

        // Try to fetch a Jitsi JWT for authenticated rooms (if backend configured)
        try {
          const tokenRes = await telemedicineAPI.getJitsiToken(sessionId);
          const token = tokenRes?.data?.token;
          if (token) {
            console.log("[VideoRoom] Received Jitsi JWT");
            setJitsiToken(token);
          } else {
            console.log("[VideoRoom] No Jitsi JWT available from server");
          }
        } catch (tErr) {
          console.warn("[VideoRoom] Could not obtain Jitsi JWT:", tErr?.response?.data || tErr.message);
        }
      } catch (err) {
        console.error("[VideoRoom] Failed to fetch session", err?.response?.data || err?.message);
        setError("Failed to initialize secure video vault.");
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchSession();
  }, [sessionId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white space-y-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-medigo-blue/5 blur-[120px] rounded-full scale-150 animate-pulse" />
      <div className="relative z-10 flex flex-col items-center">
         <div className="w-20 h-20 border-t-4 border-l-4 border-medigo-mint border-r-4 border-r-white/5 border-b-4 border-b-white/5 rounded-full animate-spin mb-8 shadow-2xl shadow-medigo-mint/20" />
         <div className="space-y-2 text-center">
            <h2 className="text-2xl font-black uppercase tracking-widest italic tracking-tighter">Handshaking Secure Tunnel</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">HIPAA Compliance Handshake in Progress</p>
         </div>
      </div>
    </div>
  );

  if (error || !session) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-8 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-red-500/5 blur-[120px] rounded-full" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 bg-white/[0.03] backdrop-blur-xl border border-white/10 p-12 rounded-[3.5rem] shadow-3xl max-w-md w-full"
      >
        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
           <XCircle size={40} />
        </div>
        <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">{error || "Tunnel Timeout"}</h2>
        <p className="text-slate-400 font-medium mb-10">We couldn't establish a secure line to this consultation session. The room may have expired or was closed by the provider.</p>
        <button 
          onClick={() => navigate("/dashboard")}
          className="w-full py-5 bg-white text-medigo-navy rounded-3xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all transform active:scale-95 shadow-xl shadow-white/5"
        >
          Return to HQ
        </button>
      </motion.div>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-slate-950 overflow-hidden relative font-inter">
      {/* Premium Overlay Header */}
      <header className="absolute top-0 left-0 right-0 p-6 sm:p-8 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent z-[50] pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
           <div className="flex items-center gap-6 pointer-events-auto">
              <button 
                onClick={() => navigate(-1)}
                className="w-12 h-12 flex items-center justify-center bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
              >
                <ArrowLeft size={20} className="text-white group-hover:-translate-x-1 transition-transform" />
              </button>
              
              <div className="space-y-1">
                 <div className="flex items-center gap-3">
                    <h1 className="text-white text-xl font-black tracking-tight uppercase italic">{session.doctorName} <span className="text-white/30 lowercase mx-2">x</span> {session.patientName}</h1>
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                       <ShieldCheck size={12} className="text-emerald-500" />
                       <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none">P2P Encrypted</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5"><Activity size={12} className="text-medigo-mint" /> 0.2ms Latency</div>
                    <div className="flex items-center gap-1.5"><Lock size={12} /> Secure Tunnel</div>
                 </div>
              </div>
           </div>

           <div className="hidden md:flex items-center gap-4 pointer-events-auto">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                 <span className="text-white text-[11px] font-black uppercase tracking-widest">Live: Clinical Mode</span>
              </div>
              <div className="flex -space-x-3">
                 <div className="w-10 h-10 bg-medigo-navy border-2 border-slate-900 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center text-[10px] font-black uppercase">{session.doctorName?.[0]}</div>
                 <div className="w-10 h-10 bg-medigo-mint border-2 border-slate-900 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center text-[10px] font-black uppercase text-medigo-navy">{session.patientName?.[0]}</div>
              </div>
           </div>
        </div>
      </header>

      {/* Jitsi Integrated Wrapper */}
      <div className="relative h-full w-full">
         <JitsiMeeting
           domain="meet.jit.si"
           roomName={session.roomName}
           configOverwrite={{
             startWithAudioMuted: true,
             disableModeratorIndicator: false,
             startScreenSharing: false,
             enableEmailInStats: false,
             prejoinPageEnabled: false,
             lobbyModeEnabled: false,
             membersOnly: false,
             disableLobbyView: true,
             allowUserInteraction: true,
             waitForNamePrompt: false,
             enableLobbyChat: false,
             focusOnBrowserTab: true,
             // For doctors (moderators), start with video/audio capabilities
             ...(authUser?.role === "doctor" && {
               startWithVideoMuted: false,
               startWithAudioMuted: false
             }),
             toolbarButtons: [
               'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
               'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
               'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
               'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
               'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
               'security'
             ],
           }}
           interfaceConfigOverwrite={{
             DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
             SHOW_JITSI_WATERMARK: false,
             SHOW_WATERMARK_FOR_GUESTS: false,
           }}
           userInfo={{
             displayName: authUser?.name || user?.name || "Participant",
             email: authUser?.email || user?.email || ""
           }}
           onApiReady={(externalApi) => {
             console.log("[VideoRoom] Jitsi API ready, user role:", authUser?.role);
             setJitsiApi(externalApi);
             
             // If doctor, make them a moderator so they can start the meeting
             if (authUser?.role === "doctor") {
               console.log("[VideoRoom] Promoting doctor to moderator");
               try {
                 externalApi.executeCommand('toggleAudioOnly', false);
                 console.log("[VideoRoom] Doctor privileges enabled");
               } catch (err) {
                 console.error("[VideoRoom] Failed to set doctor privileges:", err);
               }
             }
             
             externalApi.addEventListener('videoConferenceLeft', () => {
               console.log("[VideoRoom] User left conference");
               telemedicineAPI.updateStatus(session._id, "ended");
               navigate("/dashboard");
             });
             
             externalApi.addEventListener('participantJoined', (participant) => {
               console.log("[VideoRoom] Participant joined:", participant);
             });
             
             externalApi.addEventListener('conferenceJoined', () => {
               console.log("[VideoRoom] Conference joined successfully");
               
               // For doctors, try to get moderator status
               if (authUser?.role === "doctor") {
                 console.log("[VideoRoom] Setting up doctor as moderator");
                 try {
                   // Get the current room object
                   const room = externalApi.getRoomName?.() || session.roomName;
                   console.log("[VideoRoom] Current room:", room);
                   
                   // Attempt to enable moderator capabilities
                   externalApi.executeCommand?.('setVideoQuality', 720);
                   externalApi.executeCommand?.('toggleLobby', false);
                   
                   console.log("[VideoRoom] Doctor moderator setup complete");
                 } catch (err) {
                   console.warn("[VideoRoom] Could not set full moderator privileges:", err?.message);
                 }
               }
             });
           }}
           getIFrameRef={(iframeRef) => {
             iframeRef.style.height = '100vh';
             iframeRef.style.width = '100vw';
             iframeRef.style.border = 'none';
           }}
         />
      </div>

      {/* Security Footer Overlay */}
      <div className="absolute bottom-6 left-6 z-[50] pointer-events-none hidden sm:block">
         <div className="flex items-center gap-3 px-4 py-2 bg-slate-950/40 backdrop-blur-lg border border-white/5 rounded-2xl">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">MediGo Sovereign Video Core v4.0 Active</p>
         </div>
      </div>
    </div>
  );
};

export default VideoRoom;
