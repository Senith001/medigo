import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, 
  Calendar, Droplets, ShieldCheck, 
  Lock, Trash2, Camera, Info,
  Save, RotateCcw, ArrowRight,
  AlertCircle, ChevronRight, CheckCircle2,
  Heart, Smartphone, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { patientAPI, authAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

// Assuming these exist. If they don't, you must replace them with standard <button> and <input>
import DashboardLayout from '../../components/DashboardLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

// --- Client-side validators ---
const validatePatientProfileFields = (data) => {
  const errors = {};
  if (!data.fullName) {
    errors.fullName = "Full legal name is required";
  } else if (data.fullName.length > 30) {
    errors.fullName = "Name is too long";
  } else if (!/^[A-Za-z ]+$/.test(data.fullName)) {
    errors.fullName = "Name contains invalid characters";
  }

  if (!data.phone || String(data.phone).trim() === '') {
    errors.phone = "Mobile contact is required";
  } else if (!/^(0[0-9]{9}|(77|76|74|78|75|71|70)[0-9]{7})$/.test(String(data.phone).trim())) {
    errors.phone = "Enter a valid SL mobile number";
  }

  if (data.address && data.address.trim().length > 100) {
    errors.address = "Address is too long (max 100 chars)";
  }

  return errors;
};

export default function PatientProfile() {
  // Safety fallback in case AuthContext is not wrapping this component properly
  const { user, logout } = useAuth() || {}; 
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  // Password change state
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState('');
  const [pwdError, setPwdError] = useState(false);

  // Account deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteOtp, setShowDeleteOtp] = useState(false);
  const [deleteOtp, setDeleteOtp] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [formData, setFormData] = useState({
    title: 'Mr', fullName: '', phone: '', email: '',
    gender: '', address: '', bloodGroup: '', dateOfBirth: '',
    emergencyContactName: '', emergencyContactPhone: '', nic: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const response = await patientAPI.getMyProfile();
        if (response.data && response.data.success) {
          const data = response.data.data;
          setProfileData(data);
          const initialForm = {
            title: data.title || 'Mr',
            fullName: data.fullName || '',
            phone: data.phone || '',
            email: data.email || '',
            gender: data.gender || '',
            address: data.address || '',
            bloodGroup: data.bloodGroup || '',
            // Safely split date ensuring it's a string
            dateOfBirth: data.dateOfBirth ? String(data.dateOfBirth).split('T')[0] : '',
            emergencyContactName: data.emergencyContactName || '',
            emergencyContactPhone: data.emergencyContactPhone || '',
            nic: data.nic || ''
          };
          setFormData(initialForm);
          setFieldErrors(validatePatientProfileFields(initialForm));
        } else {
          setError('Failed to fetch valid profile data.');
        }
      } catch (err) {
        setError('Synchronizing error: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      setFieldErrors(validatePatientProfileFields(updated));
      return updated;
    });
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await patientAPI.updateMyProfile(formData);
      const res = await patientAPI.getMyProfile();
      setProfileData(res.data.data);
      alert('Profile security and data updated successfully!');
    } catch (err) {
      alert(`Update failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (profileData) {
      setFormData({
        title: profileData.title || 'Mr',
        fullName: profileData.fullName || '',
        phone: profileData.phone || '',
        email: profileData.email || '',
        gender: profileData.gender || '',
        address: profileData.address || '',
        bloodGroup: profileData.bloodGroup || '',
        dateOfBirth: profileData.dateOfBirth ? String(profileData.dateOfBirth).split('T')[0] : '',
        emergencyContactName: profileData.emergencyContactName || '',
        emergencyContactPhone: profileData.emergencyContactPhone || '',
        nic: profileData.nic || ''
      });
      setFieldErrors({});
    }
  };

  const requestDeletion = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const res = await authAPI.requestDeleteOtp();
      if(res.data.success) {
         setShowDeleteConfirm(false);
         setShowDeleteOtp(true);
      }
    } catch(err) {
      setDeleteError(err.response?.data?.message || err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const confirmDeletion = async () => {
    if(!deleteOtp) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
       const res = await authAPI.deleteMyAccount({ otp: deleteOtp });
       if(res.data.success) {
          logout?.(); // Safe optional call
          navigate('/login');
       }
    } catch(err) {
       setDeleteError(err.response?.data?.message || err.message);
    } finally {
       setDeleteLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError(true);
      setPwdMessage('Confirmation password does not match.');
      return;
    }
    setPwdLoading(true); setPwdMessage(''); setPwdError(false);
    try {
      const res = await authAPI.changePassword({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      if (res.data.success) {
        setPwdMessage('Security credentials updated successfully.');
        setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPwdError(true);
      // Ensure error message is explicitly a string to prevent rendering object crashes
      const errMessage = err.response?.data?.message;
      setPwdMessage(typeof errMessage === 'string' ? errMessage : "Failed to update credentials.");
    } finally {
      setPwdLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Identity & Vital Info', icon: User },
    { id: 'emergency_contacts', label: 'Emergency Network', icon: Heart },
    { id: 'password', label: 'Security & Access', icon: Lock },
  ];

  // 1. SAFE LOADING RETURN
  if (loading) return (
    <DashboardLayout isPatient={true}>
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
         <div className="w-16 h-16 bg-slate-200 rounded-full mb-4" />
         <div className="h-4 bg-slate-200 rounded-full w-48 mb-2" />
         <div className="h-3 bg-slate-200 rounded-full w-32" />
      </div>
    </DashboardLayout>
  );

  // 2. SAFE ERROR RETURN (Prevents rendering empty UI and crashing)
  if (error) return (
    <DashboardLayout isPatient={true}>
      <div className="flex flex-col items-center justify-center py-20 text-center">
         <AlertCircle size={48} className="text-red-400 mb-4" />
         <h2 className="text-xl font-bold text-slate-700">Unable to load profile</h2>
         <p className="text-slate-500">{error}</p>
         <Button onClick={() => window.location.reload()} className="mt-6">Refresh Page</Button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout isPatient={true}>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-8 pb-20 font-inter"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-white p-8 sm:p-10 rounded-[3rem] shadow-premium border border-slate-100 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 blur-[100px] rounded-full pointer-events-none" />
           
           <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 w-full md:w-auto">
              <div className="relative group/avatar">
                 <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[2rem] bg-gradient-to-tr from-blue-600 to-teal-400 text-white flex items-center justify-center text-4xl font-black shadow-xl">
                    {formData.fullName?.[0]?.toUpperCase() || 'P'}
                 </div>
              </div>
              
              <div className="text-center md:text-left space-y-1">
                 <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic">{formData.fullName || 'Unknown User'}</h1>
                 <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-6 gap-y-2 text-sm font-bold text-slate-400">
                    <div className="flex items-center gap-2">
                       <ShieldCheck size={16} className="text-emerald-500" />
                       {/* CRASH FIX: Safely convert userId to string before slicing */}
                       Patient ID: <span className="text-slate-800">#{profileData?.userId ? String(profileData.userId).slice(-6) : 'N/A'}</span>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="flex gap-3 relative z-10">
              <Button onClick={() => navigate('/appointments')} variant="outline">History</Button>
              <Button onClick={() => navigate('/book')}>Book Slot</Button>
           </div>
        </div>

        {/* Navigation Tabs */}
        <section className="flex flex-wrap items-center gap-2 bg-white p-2 border border-slate-100 rounded-[2rem] shadow-sm overflow-x-auto no-scrollbar">
           {tabs.map(tab => {
              const Icon = tab.icon; // Safely reference the icon component
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'bg-slate-800 text-white shadow-xl' 
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {Icon && <Icon size={16} />}
                  {tab.label}
                </button>
              );
           })}
        </section>

        {/* Tab Content Wrapper */}
        <AnimatePresence mode="wait">
           <motion.div 
             key={activeTab}
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
             className="bg-white p-8 sm:p-12 rounded-[3.5rem] shadow-premium border border-slate-100"
           >
              {activeTab === 'profile' && (
                 <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                       <div className="md:col-span-2">
                          <Input label="Title" name="title" type="select" value={formData.title} onChange={handleInputChange}>
                             <option>Mr</option><option>Mrs</option><option>Miss</option><option>Dr</option>
                          </Input>
                       </div>
                       <div className="md:col-span-10">
                          <Input 
                            label="Full Legal Name" 
                            name="fullName" 
                            value={formData.fullName} 
                            onChange={handleInputChange} 
                            icon={User}
                            error={fieldErrors.fullName}
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <Input 
                         label="Communication Email" 
                         value={formData.email} 
                         disabled 
                         icon={Mail} 
                       />
                       <Input 
                         label="Primary Mobile" 
                         name="phone" 
                         value={formData.phone} 
                         onChange={handleInputChange} 
                         icon={Smartphone}
                         error={fieldErrors.phone}
                       />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <Input label="Biological Gender" name="gender" type="select" value={formData.gender} onChange={handleInputChange}>
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                       </Input>
                       <Input label="Birth Date" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} icon={Calendar} />
                       <Input label="Blood Group" name="bloodGroup" type="select" value={formData.bloodGroup} onChange={handleInputChange} icon={Droplets}>
                          <option value="">Select</option>
                          {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
                       </Input>
                    </div>

                    <Input 
                      label="Permanent Residential Address" 
                      name="address" 
                      value={formData.address} 
                      onChange={handleInputChange} 
                      icon={MapPin} 
                      error={fieldErrors.address}
                    />

                    <div className="pt-10 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-6">
                       <button 
                         onClick={() => setShowDeleteConfirm(true)}
                         className="flex items-center gap-2 text-[11px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors"
                       >
                          <Trash2 size={16} /> Privacy: Deactivate Account
                       </button>
                       <div className="flex gap-4">
                          <Button variant="outline" onClick={handleReset}><RotateCcw size={18} className="mr-2" /> Reset</Button>
                          <Button className="px-10" onClick={handleUpdate} disabled={Object.keys(fieldErrors).length > 0}><Save size={18} className="mr-2" /> Save Profile</Button>
                       </div>
                    </div>
                 </div>
              )}

              {activeTab === 'emergency_contacts' && (
                 <div className="space-y-10">
                    <div className="bg-indigo-50/50 p-8 rounded-[2.5rem] border border-indigo-100/50 flex items-start gap-4">
                       <Info size={24} className="text-blue-500 shrink-0 mt-1" />
                       <div className="space-y-1">
                          <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight italic">Why we need this?</h4>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">In case of medical emergencies during telemedicine sessions or clinical visits, we will contact your primary emergency network representative.</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <Input 
                         label="Emergency Contact Representative" 
                         name="emergencyContactName" 
                         value={formData.emergencyContactName} 
                         onChange={handleInputChange} 
                         icon={User}
                       />
                       <Input 
                         label="Direct Contact Line" 
                         name="emergencyContactPhone" 
                         value={formData.emergencyContactPhone} 
                         onChange={handleInputChange} 
                         icon={Smartphone}
                       />
                    </div>

                    <div className="pt-10 border-t border-slate-50 flex justify-end">
                       <Button className="px-12" onClick={handleUpdate}><Save size={18} className="mr-2" /> Secure Contacts</Button>
                    </div>
                 </div>
              )}

              {activeTab === 'password' && (
                 <div className="space-y-10">
                    <form onSubmit={handlePasswordChange} className="max-w-md space-y-6">
                       <Input 
                         label="Current Verification Password" 
                         type="password" 
                         value={pwdForm.currentPassword} 
                         onChange={e => setPwdForm({ ...pwdForm, currentPassword: e.target.value })} 
                         required 
                       />
                       <div className="space-y-4">
                          <Input 
                            label="New Vault Key (Password)" 
                            type="password" 
                            value={pwdForm.newPassword} 
                            onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })} 
                            required 
                          />
                          <Input 
                            label="Confirm New Key" 
                            type="password" 
                            value={pwdForm.confirmPassword} 
                            onChange={e => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })} 
                            required 
                          />
                       </div>

                       <AnimatePresence>
                          {pwdMessage && (
                             <motion.div 
                               initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                               className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold ${pwdError ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}
                             >
                                {pwdError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                                {pwdMessage}
                             </motion.div>
                          )}
                       </AnimatePresence>

                       <Button 
                         type="submit" 
                         className="w-full h-14" 
                         disabled={pwdLoading}
                         loading={pwdLoading}
                       >
                          Update Security Credentials
                       </Button>
                    </form>
                 </div>
              )}
           </motion.div>
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
}