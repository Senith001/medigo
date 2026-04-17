import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { telemedicineAPI } from "../../services/api";

const VideoRoom = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        setUser(userData);
        
        const { data } = await telemedicineAPI.join(sessionId);
        setSession(data.session);
      } catch (err) {
        setError("Failed to initialize video room.");
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  const handleCanceled = () => {
    navigate("/dashboard");
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
      <Loader2 className="animate-spin text-teal-500 w-16 h-16 mb-4" />
      <p className="text-xl font-bold">Setting up secure connection...</p>
    </div>
  );

  if (error || !session) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4 text-center">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold">{error || "Session not found"}</h2>
      <button 
        onClick={() => navigate("/dashboard")}
        className="mt-6 px-8 py-3 bg-white text-slate-900 rounded-2xl font-bold"
      >
        Go to Dashboard
      </button>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-slate-950 overflow-hidden">
      <header className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-slate-950 to-transparent z-50 flex justify-between items-center px-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-white font-black tracking-tight">{session.doctorName} x {session.patientName}</h1>
            <p className="text-teal-400 text-xs font-bold uppercase tracking-widest">End-to-End Encrypted</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-white/50 text-xs font-bold uppercase">Live Consultation</span>
        </div>
      </header>

      <JitsiMeeting
        domain="meet.jit.si"
        roomName={session.roomName}
        configOverwrite={{
          startWithAudioMuted: true,
          disableModeratorIndicator: true,
          startScreenSharing: false,
          enableEmailInStats: false,
          prejoinPageEnabled: false,
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
          displayName: user?.name || "Patient",
          email: user?.email || ""
        }}
        onApiReady={(externalApi) => {
          externalApi.addEventListener('videoConferenceLeft', () => {
            telemedicineAPI.updateStatus(session._id, "ended");
            navigate("/dashboard");
          });
        }}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = '100vh';
          iframeRef.style.width = '100vw';
        }}
      />
    </div>
  );
};

export default VideoRoom;
