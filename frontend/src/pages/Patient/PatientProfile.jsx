import React, { useState, useEffect } from 'react';
// --- Client-side validators (mirroring backend logic) ---
const validatePatientProfileFields = (data) => {
  const errors = {};
  // Full Name
  if (!data.fullName) {
    errors.fullName = "Name is required";
  } else if (data.fullName.length > 30) {
    errors.fullName = "Name must not exceed 30 characters";
  } else if (!/^[A-Za-z ]+$/.test(data.fullName)) {
    errors.fullName = "Name cannot contain special characters or digits";
  }

  // Phone
  if (!data.phone || typeof data.phone !== 'string' || data.phone.trim() === '') {
    errors.phone = "Mobile number is required";
  } else if (!/^(0[0-9]{9}|(77|76|74|78|75|71|70)[0-9]{7})$/.test(data.phone.trim())) {
    errors.phone = "Invalid mobile number";
  }

  // Address: (optional)
  if (data.address && typeof data.address === 'string' && data.address.trim() !== '') {
    if (!/^[A-Za-z0-9/\-,/. ]+$/.test(data.address.trim())) {
      errors.address = "Address can only contain letters, numbers, '/', and '-'";
    } else if (data.address.trim().length > 100) {
      errors.address = "Address must not exceed 100 characters";
    }
  }

  // Emergency Contact Name: (optional)
  if (data.emergencyContactName && typeof data.emergencyContactName === 'string' && data.emergencyContactName.trim() !== '') {
    if (data.emergencyContactName.length > 30) {
      errors.emergencyContactName = "Name must not exceed 30 characters";
    } else if (!/^[A-Za-z ]+$/.test(data.emergencyContactName)) {
      errors.emergencyContactName = "Name cannot contain special characters or digits";
    }
  }

  // Emergency Contact Phone: (optional)
  if (data.emergencyContactPhone && typeof data.emergencyContactPhone === 'string' && data.emergencyContactPhone.trim() !== '') {
    if (!/^(0[0-9]{9}|(77|76|74|78|75|71|70)[0-9]{7})$/.test(data.emergencyContactPhone.trim())) {
      errors.emergencyContactPhone = "Invalid mobile number";
    }
  }

  return errors;
};
import { useAuth } from '../../context/AuthContext';
import { patientAPI, authAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function PatientProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData]   = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [activeTab, setActiveTab]       = useState('profile');

  // Password change state
  const [pwdForm, setPwdForm]       = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState('');
  const [pwdError, setPwdError]     = useState(false);

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
        if (response.data.success) {
          const data = response.data.data;
          setProfileData(data);
          setFormData({
            title: 'Mr',
            fullName: data.fullName || '',
            phone: data.phone || '',
            email: data.email || '',
            gender: data.gender || '',
            address: data.address || '',
            bloodGroup: data.bloodGroup || '',
            dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
            emergencyContactName: data.emergencyContactName || '',
            emergencyContactPhone: data.emergencyContactPhone || '',
            nic: data.nic || ''
          });
        } else {
          setError('Failed to fetch profile details.');
        }
      } catch (err) {
        setError('Error loading profile. ' + (err.response?.data?.message || err.message));
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

  // Validate on mount and when profile loads
  useEffect(() => {
    setFieldErrors(validatePatientProfileFields(formData));
    // eslint-disable-next-line
  }, [profileData]);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await patientAPI.updateMyProfile(formData);
      const res = await patientAPI.getMyProfile();
      setProfileData(res.data.data);
      alert('Profile updated successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Unknown error';
      alert(`Failed to update profile: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (profileData) {
      setFormData({
        title: 'Mr',
        fullName: profileData.fullName || '',
        phone: profileData.phone || '',
        email: profileData.email || '',
        gender: profileData.gender || '',
        address: profileData.address || '',
        bloodGroup: profileData.bloodGroup || '',
        dateOfBirth: profileData.dateOfBirth ? profileData.dateOfBirth.split('T')[0] : '',
        emergencyContactName: profileData.emergencyContactName || '',
        emergencyContactPhone: profileData.emergencyContactPhone || '',
        nic: profileData.nic || ''
      });
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
          logout();
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
      setPwdMessage('New passwords do not match.');
      return;
    }
    setPwdLoading(true); setPwdMessage(''); setPwdError(false);
    try {
      const res = await authAPI.changePassword({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      if (res.data.success) {
        setPwdMessage('✅ Password changed successfully.');
        setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPwdError(true);
      setPwdMessage('❌ ' + (err.response?.data?.message || err.message));
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading && !profileData) return <div className="container" style={{ padding: '2rem' }}>Loading profile...</div>;
  if (error)                    return <div className="container" style={{ padding: '2rem', color: 'red' }}>{error}</div>;

  const tabs = [
    { id: 'profile',            label: 'My Profile' },
    { id: 'emergency_contacts', label: 'Emergency Contact Numbers' },
    { id: 'password',           label: 'Change Password' },
  ];

  // Check if any validation errors exist for relevant fields
  const hasValidationErrors = Object.values(fieldErrors).some(Boolean);

  return (
    <div className="container" style={{ padding: '3rem 2rem', maxWidth: '1100px', background: '#ffffff', minHeight: '100vh' }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#0ea5e9', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(14,165,233,0.3)' }}>
            {profileData?.fullName?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || '👤'}
          </div>
          <div>
            <h2 style={{ margin: 0, textTransform: 'uppercase', color: '#1a3c6e', letterSpacing: '0.5px', fontSize: '1.4rem' }}>
              {profileData?.fullName || user?.name}
            </h2>
            <p style={{ margin: '0.3rem 0', color: '#94a3b8', fontSize: '0.85rem' }}>Member ID : {profileData?.userId || 'Loading...'}</p>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
              Registered : {new Date(profileData?.createdAt || Date.now()).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
            
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn" style={{ background: '#ffffff', color: '#1d4ed8', border: '1px solid #1d4ed8', borderRadius: '8px', padding: '0.6rem 1.2rem', fontWeight: '600' }} onClick={() => navigate('/appointments')}>My Appointment</button>
            <button className="btn" style={{ background: '#0ea5e9', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.2rem', fontWeight: '600', boxShadow: '0 4px 6px -1px rgba(14,165,233,0.3)' }} onClick={() => navigate('/book')}>Make An Appointment</button>
          </div>
        </div>
      </div>

      {/* ── HORIZONTAL TAB NAV ── */}
      <div style={{ display: 'flex', borderBottom: '2px solid #f1f5f9', marginBottom: '2rem', gap: '0' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.85rem 1.6rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? '700' : '500',
              fontSize: '0.9rem',
              color: activeTab === tab.id ? '#1d4ed8' : '#64748b',
              borderBottom: activeTab === tab.id ? '2px solid #1d4ed8' : '2px solid transparent',
              marginBottom: '-2px',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}

      {/* PROFILE FORM */}
      {activeTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(80px, 1fr) 3fr 4fr', gap: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Title</label>
              <select name="title" value={formData.title} onChange={handleInputChange} className="form-input" style={inputStyle}>
                <option>Mr</option><option>Mrs</option><option>Miss</option><option>Dr</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>First name</label>
              <input type="text" name="fullName" value={formData.fullName.split(' ')[0] || formData.fullName} onChange={(e) => {
                const last = formData.fullName.split(' ').slice(1).join(' ');
                handleInputChange({ target: { name: 'fullName', value: `${e.target.value} ${last}`.trim() } });
              }} className="form-input" style={inputStyle} />
              {fieldErrors.fullName && <div style={{ color: '#b91c1c', fontSize: '0.85rem', marginTop: '0.2rem' }}>{fieldErrors.fullName}</div>}
            </div>
            <div>
              <label style={labelStyle}>Last name</label>
              <input type="text" value={formData.fullName.split(' ').slice(1).join(' ') || ''} onChange={(e) => {
                const first = formData.fullName.split(' ')[0] || '';
                handleInputChange({ target: { name: 'fullName', value: `${first} ${e.target.value}`.trim() } });
              }} className="form-input" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Phone</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select className="form-input" style={{ width: '80px', flexShrink: 0, ...inputStyle }}><option>+94</option></select>
                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="form-input" style={inputStyle} />
              </div>
              {fieldErrors.phone && <div style={{ color: '#b91c1c', fontSize: '0.85rem', marginTop: '0.2rem' }}>{fieldErrors.phone}</div>}
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" name="email" value={formData.email} className="form-input" style={inputStyle} disabled />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="form-input" placeholder="Please enter your permanent address" style={inputStyle} />
            {fieldErrors.address && <div style={{ color: '#b91c1c', fontSize: '0.85rem', marginTop: '0.2rem' }}>{fieldErrors.address}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleInputChange} className="form-input" style={{ ...inputStyle, width: '100%' }}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Date of Birth</label>
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="form-input" style={{ ...inputStyle, width: '100%' }} />
            </div>
            <div>
              <label style={labelStyle}>Blood Group</label>
              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="form-input" style={{ ...inputStyle, width: '100%' }}>
                <option value="">Select blood group</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <button className="btn" style={{ background: '#b91c1c', color: '#ffffff', borderRadius: '8px', padding: '0.6rem 1.5rem', fontWeight: '500', opacity: 0.85 }} onClick={() => setShowDeleteConfirm(true)}>Account Delete</button>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn" style={{ background: '#9ca3af', color: '#ffffff', borderRadius: '8px', padding: '0.6rem 1.5rem', fontWeight: '500' }} onClick={handleReset}>Reset</button>
              <button className="btn" style={{ background: '#0ea5e9', color: '#ffffff', borderRadius: '8px', padding: '0.6rem 1.5rem', fontWeight: '500', opacity: hasValidationErrors ? 0.6 : 1, cursor: hasValidationErrors ? 'not-allowed' : 'pointer' }} onClick={handleUpdate} disabled={hasValidationErrors}>Update</button>
            </div>
          </div>
        </div>
      )}

      {/* EMERGENCY CONTACTS */}
      {activeTab === 'emergency_contacts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#1a3c6e', marginBottom: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>Emergency Contact Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Contact Name</label>
              <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleInputChange} className="form-input" style={inputStyle} />
              {fieldErrors.emergencyContactName && <div style={{ color: '#b91c1c', fontSize: '0.85rem', marginTop: '0.2rem' }}>{fieldErrors.emergencyContactName}</div>}
            </div>
            <div>
              <label style={labelStyle}>Contact Phone</label>
              <input type="text" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleInputChange} className="form-input" style={inputStyle} />
              {fieldErrors.emergencyContactPhone && <div style={{ color: '#b91c1c', fontSize: '0.85rem', marginTop: '0.2rem' }}>{fieldErrors.emergencyContactPhone}</div>}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="btn" style={{ background: '#0ea5e9', color: '#ffffff', borderRadius: '8px', padding: '0.6rem 1.5rem', fontWeight: '500', opacity: hasValidationErrors ? 0.6 : 1, cursor: hasValidationErrors ? 'not-allowed' : 'pointer' }} onClick={handleUpdate} disabled={hasValidationErrors}>Save Changes</button>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD */}
      {activeTab === 'password' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#1a3c6e', marginBottom: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>Change Password</h3>
          <form onSubmit={handlePasswordChange} style={{ maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Current Password</label>
              <input type="password" value={pwdForm.currentPassword} onChange={e => setPwdForm({ ...pwdForm, currentPassword: e.target.value })} required className="form-input" style={inputStyle} placeholder="Enter current password" />
            </div>
            <div>
              <label style={labelStyle}>New Password</label>
              <input type="password" value={pwdForm.newPassword} onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })} required className="form-input" style={inputStyle} placeholder="Enter new password" />
              {pwdForm.newPassword && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(pwdForm.newPassword) && (
                <div style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                  Must be at least 8 characters and contain at least one uppercase, lowercase, number, and special character.
                </div>
              )}
            </div>
            <div>
              <label style={labelStyle}>Confirm New Password</label>
              <input type="password" value={pwdForm.confirmPassword} onChange={e => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })} required className="form-input" style={inputStyle} placeholder="Confirm new password" />
              {pwdForm.confirmPassword && pwdForm.confirmPassword !== pwdForm.newPassword && (
                <div style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                  Passwords do not match.
                </div>
              )}
            </div>
            {pwdMessage && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: pwdError ? '#fef2f2' : '#f0fdf4', color: pwdError ? '#b91c1c' : '#15803d', fontWeight: '600', fontSize: '0.85rem' }}>
                {pwdMessage}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.5rem' }}>
              <button 
                type="submit" 
                disabled={pwdLoading || (pwdForm.newPassword && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(pwdForm.newPassword)) || (pwdForm.confirmPassword && pwdForm.confirmPassword !== pwdForm.newPassword)} 
                className="btn" 
                style={{ 
                  background: '#0ea5e9', color: '#ffffff', borderRadius: '8px', padding: '0.6rem 1.5rem', fontWeight: '500', 
                  opacity: (pwdLoading || (pwdForm.newPassword && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(pwdForm.newPassword)) || (pwdForm.confirmPassword && pwdForm.confirmPassword !== pwdForm.newPassword)) ? 0.6 : 1, 
                  cursor: (pwdLoading || (pwdForm.newPassword && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(pwdForm.newPassword)) || (pwdForm.confirmPassword && pwdForm.confirmPassword !== pwdForm.newPassword)) ? 'not-allowed' : 'pointer' 
                }}
              >
                {pwdLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.25rem' }}>Delete Account</h3>
            <p style={{ margin: '0 0 1.5rem 0', color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Are you sure you want to permanently delete your account? All your data will be permanently removed. This action cannot be undone.
            </p>
            {deleteError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>{deleteError}</p>}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteError(''); }} disabled={deleteLoading} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              <button onClick={requestDeletion} disabled={deleteLoading} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: '600', cursor: 'pointer', opacity: deleteLoading ? 0.7 : 1 }}>
                {deleteLoading ? 'Sending OTP...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE OTP MODAL */}
      {showDeleteOtp && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', fontSize: '2rem', marginBottom: '1rem' }}>✉️</div>
            <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.25rem' }}>Verify Deletion</h3>
            <p style={{ margin: '0 0 1.5rem 0', color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>
              We've sent a 6-digit verification code to your email. Enter it below to confirm account deletion.
            </p>
            <input 
              type="text" 
              maxLength="6"
              value={deleteOtp}
              onChange={(e) => setDeleteOtp(e.target.value)}
              placeholder="000000"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.5rem', marginBottom: '1rem', outline: 'none' }}
            />
            {deleteError && <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: '-0.5rem 0 1rem 0' }}>{deleteError}</p>}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => { setShowDeleteOtp(false); setDeleteOtp(''); setDeleteError(''); }} disabled={deleteLoading} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmDeletion} disabled={deleteLoading || deleteOtp.length !== 6} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: '600', cursor: 'pointer', opacity: (deleteLoading || deleteOtp.length !== 6) ? 0.7 : 1 }}>
                {deleteLoading ? 'Verifying...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' };
const inputStyle  = { borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#475569' };
