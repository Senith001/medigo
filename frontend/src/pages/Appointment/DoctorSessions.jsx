import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { 
  Calendar, Clock, MapPin, 
  ChevronLeft, ArrowRight, Star,
  Stethoscope, ShieldCheck,
  Info, Loader2, Hospital,
  Video, CalendarDays, Award, AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from '../../components/DashboardLayout'
import Button from '../../components/ui/Button'
import { doctorAPI } from '../../services/api'

export default function DoctorSessions() {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [doctor, setDoctor] = useState(location.state?.doctor || null)
  const [loading, setLoading] = useState(!doctor)
  const [sessions, setSessions] = useState([])
  const [selectedHospital, setSelectedHospital] = useState('all')
  const [selectedMode, setSelectedMode] = useState(null)

  const fetchDetails = async () => {
    try {
      setLoading(true)
      if (!doctor) {
        const docRes = await doctorAPI.getById(doctorId)
        if (docRes.data.success) {
           setDoctor(docRes.data.data)
        }
      }
      const sessionRes = await doctorAPI.getAvailability(doctorId)
      if (sessionRes.data.success) {
        setSessions(sessionRes.data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDetails() }, [doctorId])

  const hospitals = ['all', ...new Set(sessions.map(s => s.hospital))]

  // Helper to parse "09:00 AM" into minutes from midnight
  const parseTime = (timeStr) => {
    if (!timeStr) return 0;
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;
    let [_, hours, mins, period] = match;
    hours = parseInt(hours);
    mins = parseInt(mins);
    if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
    if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
    return hours * 60 + mins;
  };

  const filteredSessions = sessions.filter(s => {
    let upcoming = true;
    if (s.date) {
      const datePart = s.date.split('T')[0];
      const [y, m, d] = datePart.split('-').map(Number);

      if (y && m && d) {
        const sessionDate = new Date(y, m - 1, d);
        sessionDate.setHours(0, 0, 0, 0);

        const now = new Date();
        const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (sessionDate < todayMidnight) {
          // Past date
          upcoming = false;
        } else if (sessionDate.getTime() === todayMidnight.getTime()) {
          // Today: allow if end time hasn't passed
          const currentMins = now.getHours() * 60 + now.getMinutes();
          const endMins = parseTime(s.endTime);
          
          if (endMins <= currentMins) {
            upcoming = false;
          }
        }
      }
    }
    const matchesHospital = selectedHospital === 'all' || s.hospital === selectedHospital;
    const mode = s.consultationType || 'both';
    const matchesMode = selectedMode === null || mode === 'both' || mode === selectedMode;

    return upcoming && matchesHospital && matchesMode;
  }).sort((a, b) => {
    // Sort by Date
    const dateA = new Date(a.date || 0);
    const dateB = new Date(b.date || 0);
    if (dateA - dateB !== 0) return dateA - dateB;
    
    // Sort by Start Time
    return parseTime(a.startTime) - parseTime(b.startTime);
  });

  // ✅ MERGE DUPLICATES: Group sessions by Date + StartTime + Hospital
  const mergedSessions = filteredSessions.reduce((acc, s) => {
    const dateKey = s.date?.split('T')[0] || s.day;
    const startTime = (s.startTime || '').trim();
    const key = `${dateKey}_${startTime}_${s.hospital}`;
    
    if (!acc[key]) {
      acc[key] = { ...s };
    } else {
      // If we find a duplicate, sum up the counts
      acc[key].bookedCount = (acc[key].bookedCount || 0) + (s.bookedCount || 0);
      acc[key].maxPatients = (acc[key].maxPatients || 0) + (s.maxPatients || 0);
      // Keep the longer end time if they differ
      if (parseTime(s.endTime) > parseTime(acc[key].endTime)) {
        acc[key].endTime = s.endTime;
      }
    }
    return acc;
  }, {});

  const finalSessions = Object.values(mergedSessions);

  // Check if a session has already started (but not ended)
  const hasSessionStarted = (session) => {
    const now = new Date();
    const datePart = session.date?.split('T')[0];
    if (!datePart) return false;
    const [y, m, d] = datePart.split('-').map(Number);
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sessionDate = new Date(y, m - 1, d);
    sessionDate.setHours(0, 0, 0, 0);

    if (sessionDate.getTime() !== todayMidnight.getTime()) return false;

    const currentMins = now.getHours() * 60 + now.getMinutes();
    const startMins = parseTime(session.startTime);
    const endMins = parseTime(session.endTime);

    return currentMins >= startMins && currentMins < endMins;
  };

  if (loading) return (
    <DashboardLayout isPatient={true}>
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 size={40} className="animate-spin text-medigo-blue" />
        <p className="font-bold">Fetching specialist details...</p>
      </div>
    </DashboardLayout>
  )

  if (!doctor) return (
     <DashboardLayout isPatient={true}>
        <div className="h-[60vh] flex flex-col items-center justify-center">
           <h2 className="text-xl font-bold text-medigo-navy">Specialist Not Found</h2>
           <Button className="mt-4" onClick={() => navigate('/search')}>Return to Search</Button>
        </div>
     </DashboardLayout>
  )

  const docInitials = doctor.fullName?.replace('Dr. ', '').split(' ').map(n => n[0]).join('').slice(0, 2)

  return (
    <DashboardLayout isPatient={true}>
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        
        {/* Navigation */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-medigo-blue transition-colors group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Specialists
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ── LEFT: Doctor Profile ── */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Main Profile Card */}
            <div className="bg-white p-8 rounded-[2rem] shadow-premium border border-slate-100 flex flex-col items-center text-center">
               <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-50 to-indigo-50 border-[3px] border-white shadow-xl flex items-center justify-center text-4xl font-black text-medigo-blue">
                     {docInitials}
                  </div>
                  <div className="absolute bottom-0 right-2 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center shadow-sm">
                    <ShieldCheck size={14} className="text-white" />
                  </div>
               </div>
               
               <h1 className="text-2xl font-black text-medigo-navy">{doctor.fullName}</h1>
               <div className="flex items-center justify-center gap-2 mt-2">
                 <Stethoscope size={16} className="text-medigo-blue" />
                 <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">{doctor.specialty}</span>
               </div>

               <div className="grid grid-cols-2 gap-4 w-full mt-8 bg-slate-50 p-4 rounded-2xl">
                 <div className="flex flex-col items-center border-r border-slate-200">
                    <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                      <Star size={16} fill="currentColor" />
                      <span className="text-lg font-black">4.9</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rating</span>
                 </div>
                 <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5 text-indigo-600 mb-1">
                      <Award size={16} />
                      <span className="text-lg font-black">{doctor.experienceYears}y</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Experience</span>
                 </div>
               </div>
               
               <div className="w-full mt-6 space-y-4">
                 <div className="flex items-start gap-3 text-left bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                    <Info size={18} className="text-medigo-blue shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">About Me</p>
                      <p className="text-sm font-bold text-medigo-navy leading-snug">{doctor.bio || 'Dedicated medical specialist committed to providing high-quality healthcare and patient-centered service.'}</p>
                    </div>
                 </div>
               </div>
            </div>

            {/* Filter by Location (Only if there are multiple) */}
            {hospitals.length > 2 && (
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                 <h3 className="text-sm font-black text-medigo-navy uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={16} className="text-red-500" /> Filter by Location
                 </h3>
                 <div className="space-y-2">
                    {hospitals.map(h => (
                      <button
                        key={h}
                        onClick={() => setSelectedHospital(h)}
                        className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          selectedHospital === h 
                            ? 'bg-medigo-navy text-white shadow-md border-medigo-navy' 
                            : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <span className={`text-[11px] font-black uppercase tracking-widest ${selectedHospital === h ? 'text-white' : 'text-slate-500'}`}>
                          {h === 'all' ? 'All Clinics' : h}
                        </span>
                      </button>
                    ))}
                 </div>
              </div>
            )}
          </div>

           {/* ── RIGHT: Sessions & Selection ── */}
           <div className="lg:col-span-8 space-y-6">
             <AnimatePresence mode="wait">
               {/* Mode Selection */}
               {!selectedMode ? (
                 <motion.div 
                   key="choice"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="bg-white p-8 sm:p-12 rounded-[3rem] shadow-premium border border-slate-100 min-h-[600px] flex flex-col justify-center space-y-10"
                 >
                    <div className="text-center space-y-3 relative z-10">
                       <h3 className="text-3xl font-black text-medigo-navy tracking-tight">How would you like to consult?</h3>
                       <p className="text-slate-500 font-medium max-w-md mx-auto">Please select your preferred method of consultation. The doctor's available session dates will be filtered accordingly.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl mx-auto">
                       {/* Telemedicine Option */}
                       <button 
                         onClick={() => setSelectedMode('telemedicine')}
                         className="group p-8 rounded-[2.5rem] bg-white border border-slate-200 hover:border-medigo-blue hover:shadow-xl hover:shadow-blue-500/10 transition-all text-left relative overflow-hidden"
                       >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[4rem] -z-0 opacity-50 group-hover:bg-blue-100 transition-colors" />
                          <div className="w-16 h-16 bg-blue-50 text-medigo-blue rounded-[1.5rem] flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform">
                             <Video size={30} />
                          </div>
                          <div className="relative z-10">
                             <h4 className="text-xl font-black text-medigo-navy mb-2">Video Consultation</h4>
                             <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">Consult seamlessly from the comfort of your home via our secure HD telemedicine system.</p>
                             <span className="text-sm font-bold text-medigo-blue flex items-center gap-2">
                               View Schedule <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                             </span>
                          </div>
                       </button>

                       {/* In-Person Option */}
                       <button 
                         onClick={() => setSelectedMode('in-person')}
                         className="group p-8 rounded-[2.5rem] bg-white border border-slate-200 hover:border-medigo-navy hover:shadow-xl hover:shadow-indigo-500/10 transition-all text-left relative overflow-hidden"
                       >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] -z-0 opacity-50 group-hover:bg-slate-100 transition-colors" />
                          <div className="w-16 h-16 bg-slate-50 text-medigo-navy rounded-[1.5rem] flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform">
                             <MapPin size={30} />
                          </div>
                          <div className="relative z-10">
                             <h4 className="text-xl font-black text-medigo-navy mb-2">In-Person Visit</h4>
                             <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">Visit the specialist physically at one of their available clinical hospital locations.</p>
                             <span className="text-sm font-bold text-medigo-navy flex items-center gap-2">
                               View Schedule <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                             </span>
                          </div>
                       </button>
                    </div>
                 </motion.div>
               ) : (
                 /* Available Sessions List */
                 <motion.div 
                   key="sessions"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="space-y-6"
                 >
                   <div className="bg-white p-8 sm:p-10 rounded-[3rem] shadow-premium border border-slate-100 min-h-[600px] flex flex-col">
                      
                      {/* Sub-header / Filter Details */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-8 border-b border-slate-100">
                         <div>
                            <button 
                              onClick={() => setSelectedMode(null)}
                              className="text-[10px] font-black text-medigo-blue uppercase tracking-widest flex items-center gap-1 mb-2 hover:underline"
                            >
                              <ChevronLeft size={12} /> Change Method
                            </button>
                            <h3 className="text-2xl font-black text-medigo-navy flex items-center gap-3">
                              {selectedMode === 'telemedicine' ? <Video size={24} className="text-medigo-blue" /> : <MapPin size={24} className="text-indigo-600" />}
                              {selectedMode === 'telemedicine' ? 'Video Consultations' : 'Clinic Visits'}
                            </h3>
                         </div>
                         <div className="bg-slate-50 px-4 py-2 rounded-xl text-sm font-bold text-slate-500">
                           {filteredSessions.length} Session{filteredSessions.length !== 1 && 's'} Found
                         </div>
                      </div>

                      {/* Sessions List */}
                      {filteredSessions.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                           <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mb-4">
                             <CalendarDays size={32} className="text-slate-300" />
                           </div>
                           <h4 className="text-xl font-black text-medigo-navy mb-2">No Sessions Available</h4>
                           <p className="text-slate-400 font-medium max-w-xs">This specialist does not have any upcoming sessions matching your criteria.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                           <AnimatePresence mode="popLayout">
                             {finalSessions.map((session, i) => {
                               const startMins = parseTime(session.startTime);
                               const endMins = parseTime(session.endTime);
                               const totalDuration = endMins - startMins;
                               const maxPossible = session.maxPatients || 10;
                               const minsPerPatient = totalDuration / maxPossible;

                               const now = new Date();
                               const currentTimeMins = now.getHours() * 60 + now.getMinutes();
                               const isToday = (() => {
                                 const datePart = session.date?.split('T')[0];
                                 if (!datePart) return false;
                                 const [y, m, d] = datePart.split('-').map(Number);
                                 const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                 const sessionDate = new Date(y, m - 1, d);
                                 sessionDate.setHours(0, 0, 0, 0);
                                 return sessionDate.getTime() === todayMidnight.getTime();
                               })();

                               let dynamicMax = maxPossible;
                               if (isToday && currentTimeMins > startMins) {
                                 const elapsed = currentTimeMins - startMins;
                                 const slotsLost = Math.floor(elapsed / minsPerPatient);
                                 dynamicMax = Math.max(0, maxPossible - slotsLost);
                               }

                               const isFull = (session.bookedCount || 0) >= dynamicMax;
                               const isTrulyFull = (session.bookedCount || 0) >= maxPossible;

                               return (
                                 <motion.div
                                   key={session._id}
                                   initial={{ opacity: 0, y: 10 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ delay: i * 0.05 }}
                                   className={`flex flex-col sm:flex-row relative p-6 sm:p-8 rounded-[2rem] border transition-all ${
                                     isFull 
                                       ? 'bg-slate-50 border-slate-100 opacity-75' 
                                       : 'bg-white border-slate-200 hover:border-medigo-blue hover:shadow-lg hover:shadow-blue-500/10'
                                   }`}
                                 >
                                    {/* Left: Date Display */}
                                    <div className="flex sm:flex-col items-center sm:items-start gap-4 sm:gap-1 sm:w-32 shrink-0 border-b sm:border-b-0 sm:border-r border-slate-100 pb-4 sm:pb-0 sm:pr-8 mb-4 sm:mb-0">
                                       {(() => {
                                         if (session.date) {
                                           const datePart = session.date.split('T')[0]
                                           const [y, m, d] = datePart.split('-')
                                           const dt = new Date(y, m - 1, d)
                                           return (
                                              <>
                                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{dt.toLocaleDateString('en-US', { month: 'short', weekday: 'short' })}</p>
                                                <p className="text-4xl font-black text-medigo-navy tracking-tighter">{d}</p>
                                              </>
                                           )
                                         }
                                         return (
                                           <div className="bg-slate-100 px-4 py-2 rounded-xl text-center">
                                              <p className="text-sm font-black text-slate-500 uppercase">{session.day?.slice(0, 3)}</p>
                                           </div>
                                         )
                                       })()}
                                    </div>
                                    
                                    {/* Middle: Details */}
                                    <div className="flex-1 sm:px-8 flex flex-col justify-center space-y-3">
                                       <div className="flex items-center gap-3">
                                          <h4 className="text-lg font-black text-medigo-navy">{session.hospital || 'Private Clinic'}</h4>
                                          <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md ${
                                            selectedMode === 'telemedicine' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                                          }`}>
                                            {selectedMode === 'telemedicine' ? 'Virtual' : 'Physical'}
                                          </span>
                                       </div>
                                       
                                       <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-500">
                                          <div className="flex items-center gap-1.5"><Clock size={16} className="text-slate-400" /> {session.startTime} - {session.endTime}</div>
                                          {session.location && <div className="flex items-center gap-1.5"><MapPin size={16} className="text-slate-400" /> {session.location}</div>}
                                       </div>

                                       <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mt-2">
                                          <span className={isTrulyFull ? 'text-red-500' : 'text-medigo-blue'}>{session.bookedCount || 0} BOOKED</span>
                                          <span className="text-slate-300">/</span>
                                          <span className="text-slate-400">{maxPossible} TOTAL CAPACITY</span>
                                          {dynamicMax < maxPossible && !isTrulyFull && (
                                            <span className="ml-2 text-amber-500 text-[9px] animate-pulse">
                                              (Time Limited: {dynamicMax} available)
                                            </span>
                                          )}
                                       </div>

                                       {!isFull && (
                                         <div className="flex items-center gap-1.5 text-[10px] font-black text-medigo-navy uppercase tracking-widest mt-1 bg-slate-50 self-start px-2 py-0.5 rounded">
                                            <ShieldCheck size={12} className="text-medigo-blue" /> Next Patient No: #{String((session.bookedCount || 0) + 1).padStart(2, '0')}
                                         </div>
                                       )}

                                       {hasSessionStarted(session) && (
                                         <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-500 uppercase tracking-widest mt-1">
                                            <AlertCircle size={12} /> Session has already begun
                                         </div>
                                       )}
                                    </div>

                                    {/* Right: Booking Action */}
                                    <div className="flex flex-col items-start sm:items-end justify-center shrink-0 border-t sm:border-t-0 sm:border-l border-slate-100 pt-5 sm:pt-0 sm:pl-8 mt-4 sm:mt-0">
                                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Consultation Fee</p>
                                       <p className="text-2xl font-black text-medigo-navy tracking-tight mb-4 flex items-start gap-1">
                                          <span className="text-xs mt-1 text-slate-400">Rs.</span> {session.fee?.toLocaleString()}
                                       </p>
                                       
                                       <Button 
                                          onClick={() => navigate(`/checkout/${session._id}`, { state: { doctor, session, selectedMode } })}
                                          disabled={isFull}
                                          className={`w-full sm:w-auto h-12 px-8 shadow-md ${isFull ? 'bg-slate-200 text-slate-400 shadow-none' : ''}`}
                                        >
                                          {isFull ? (isTrulyFull ? 'Fully Booked' : 'Time Expired') : 'Book Session'}
                                        </Button>
                                    </div>
                                 </motion.div>
                               )
                             })}
                           </AnimatePresence>
                        </div>
                      )}
                      
                   </div>

                   {/* Protocol Banner */}
                   <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="bg-white p-6 rounded-[2rem] border border-slate-200 flex sm:items-center gap-4 shadow-sm"
                   >
                      <div className={`p-3 rounded-xl shrink-0 ${selectedMode === 'telemedicine' ? 'bg-blue-50 text-medigo-blue' : 'bg-slate-50 text-medigo-navy'}`}>
                         <Info size={24} />
                      </div>
                      <div>
                         <p className="text-sm font-black text-medigo-navy mb-0.5">
                           {selectedMode === 'telemedicine' ? 'Telemedicine Requirements' : 'Hospital Guidelines'}
                         </p>
                         <p className="text-sm text-slate-500 font-medium">
                           {selectedMode === 'telemedicine' 
                             ? 'Ensure a stable internet connection. You will receive a secure meeting link 5 minutes before your time.' 
                             : 'Please arrive at the clinic checkout desk at least 20 minutes prior to your scheduled time.'}
                         </p>
                      </div>
                   </motion.div>
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
