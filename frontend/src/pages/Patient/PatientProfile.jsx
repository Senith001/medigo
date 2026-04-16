import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function PatientProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('profile');

  const [formData, setFormData] = useState({
    title: 'Mr',
    fullName: '',
    phone: '',
    email: '',
    gender: '',
    address: '',
    bloodGroup: '',
    dateOfBirth: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    nic: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
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
        console.error("Error fetching patient profile:", err);
        setError('Error loading profile. ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await patientAPI.updateMyProfile(formData);
      const res = await patientAPI.getMyProfile();
      setProfileData(res.data.data);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading && !profileData) return <div className="container" style={{ padding: '2rem' }}>Loading profile...</div>;
  if (error) return <div className="container" style={{ padding: '2rem', color: 'red' }}>{error}</div>;

  const tabs = [
    { id: 'profile', label: 'My profile' },
    { id: 'doctors', label: 'My favorite doctors' },
    { id: 'emergency_contacts', label: 'Emergency Contact Numbers' },
    { id: 'offers', label: 'Member offers' },
    { id: 'subscriptions', label: 'My subscriptions' },
    { id: 'topup', label: 'Account top up' },
    { id: 'rewards', label: 'My reward points' },
    { id: 'password', label: 'Change password' },
    { id: 'wallet', label: 'My wallet' },
  ];

  return (
    <div className="container" style={{ padding: '3rem 2rem', maxWidth: '1200px', background: '#ffffff', minHeight: '100vh' }}>
      
      {/* HEADER AREA (MATCHING THE IMAGE) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            backgroundColor: '#0ea5e9',
            color: 'white',
            
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.3)'
          }}>
            {profileData?.fullName?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || '👤'}
          </div>
          <div>
            <h2 style={{ margin: 0, textTransform: 'uppercase', color: '#1a3c6e', letterSpacing: '0.5px', fontSize: '1.4rem' }}>
              {profileData?.fullName || user?.name}
            </h2>
            <p style={{ margin: '0.3rem 0', color: '#94a3b8', fontSize: '0.85rem' }}>Member ID : M{(profileData?._id || "815118").slice(-6).toUpperCase()}</p>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>Registration date : {new Date(profileData?.createdAt || Date.now()).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'})}</p>
            <div style={{ marginTop: '0.6rem' }}>
              <span style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                fontSize: '0.8rem', fontWeight: 'bold', color: '#0ea5e9'
              }}>
                <span style={{ 
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '18px', height: '18px', borderRadius: '50%', background: '#e0f2fe', color: '#0ea5e9', fontSize: '10px'
                }}>👑</span> Free Member
              </span>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1.5rem' }}>
          <div style={{ padding: '0.5rem 1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '220px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)' }}>$</div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem', lineHeight: 1, color: '#1e293b' }}>0</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Available eRewards points</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn" style={{ 
              background: '#ffffff', color: '#1d4ed8', border: '1px solid #1d4ed8', borderRadius: '8px', padding: '0.6rem 1.2rem', fontWeight: '600'
            }} onClick={() => navigate('/appointments')}>My Appointment</button>
            <button className="btn" style={{ 
              background: '#0ea5e9', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.2rem', fontWeight: '600', boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.3)'
            }} onClick={() => navigate('/book')}>Make An Appointment</button>
          </div>
        </div>
      </div>

      {/* MAIN BODY LAYOUT */}
      <div style={{ display: 'flex', gap: '3rem' }}>
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <div style={{ width: '240px', flexShrink: 0 }}>
          <div style={{ 
            border: '1px solid #f1f5f9', 
            borderRadius: '12px', 
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            {tabs.map(tab => (
              <div 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '1rem 1.5rem',
                  cursor: 'pointer',
                  background: activeTab === tab.id ? '#3b82f6' : '#ffffff',
                  color: activeTab === tab.id ? '#ffffff' : '#64748b',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.label}
              </div>
            ))}
            <div 
              onClick={handleLogout}
              style={{
                padding: '1rem 1.5rem',
                cursor: 'pointer',
                background: '#ffffff',
                color: '#64748b',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
              }}
            >
              Log out
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT AREA */}
        <div style={{ flexGrow: 1 }}>
          
          {/* PROFILE FORM */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(80px, 1fr) 3fr 4fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Title</label>
                  <select name="title" value={formData.title} onChange={handleInputChange} className="form-input" style={{ borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#475569' }}>
                    <option>Mr</option>
                    <option>Mrs</option>
                    <option>Miss</option>
                    <option>Dr</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>First name</label>
                  {/* Using split approximation since DB holds one fullName */}
                  <input type="text" name="fullName" value={formData.fullName.split(' ')[0] || formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="form-input" style={{ borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#475569' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Last name</label>
                  <input type="text" value={formData.fullName.split(' ').slice(1).join(' ') || ''} onChange={(e) => {
                     const first = formData.fullName.split(' ')[0] || '';
                     setFormData({...formData, fullName: `${first} ${e.target.value}`.trim()})
                  }} className="form-input" style={{ borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#475569' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Number</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select className="form-input" style={{ width: '80px', flexShrink: 0, borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#475569' }}>
                      <option>+94</option>
                    </select>
                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="form-input" style={{ borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#475569' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="form-input" style={{ borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#475569' }} disabled />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="form-input" placeholder="Please enter your permanent address" style={{ borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#475569' }} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#475569', cursor: 'pointer' }}>
                    <input type="radio" name="idType" defaultChecked style={{ accentColor: '#3b82f6' }} /> NIC
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#475569', cursor: 'pointer' }}>
                    <input type="radio" name="idType" style={{ accentColor: '#3b82f6' }} /> Passport
                  </label>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>NIC</label>
                  <input type="text" name="nic" value={formData.nic} onChange={handleInputChange} className="form-input" style={{ borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#475569', width: '50%' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <button className="btn" style={{ background: '#075985', color: '#ffffff', borderRadius: '8px', padding: '0.6rem 1.2rem', fontWeight: '500' }}>Upgrade Membership</button>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn" style={{ background: '#b91c1c', color: '#ffffff', borderRadius: '8px', padding: '0.6rem 1.5rem', fontWeight: '500', opacity: 0.85 }}>Account Delete</button>
                  <button className="btn" style={{ background: '#9ca3af', color: '#ffffff', borderRadius: '8px', padding: '0.6rem 1.5rem', fontWeight: '500' }} onClick={() => window.location.reload()}>Reset</button>
                  <button className="btn" style={{ background: '#9ca3af', color: '#ffffff', borderRadius: '8px', padding: '0.6rem 1.5rem', fontWeight: '500' }} onClick={handleUpdate}>Update</button>
                </div>
              </div>
            </div>
          )}

          {/* EMERGENCY CONTACTS TAB */}
          {activeTab === 'emergency_contacts' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#1a3c6e', marginBottom: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>Emergency Contact Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Contact Name</label>
                      <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleInputChange} className="form-input" style={{ borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#475569' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Contact Phone</label>
                      <input type="text" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleInputChange} className="form-input" style={{ borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#475569' }} />
                    </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button className="btn" style={{ background: '#0ea5e9', color: '#ffffff', borderRadius: '8px', padding: '0.6rem 1.5rem', fontWeight: '500' }} onClick={handleUpdate}>Save Changes</button>
                </div>
              </div>
          )}

          {/* PASSWORD TAB */}
          {activeTab === 'password' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#1a3c6e', marginBottom: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>Change Password</h3>
                <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Current Password</label>
                      <input type="password" placeholder="Enter current password" className="form-input" style={{ borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#475569' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>New Password</label>
                      <input type="password" placeholder="Enter new password" className="form-input" style={{ borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#475569' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Confirm New Password</label>
                      <input type="password" placeholder="Confirm new password" className="form-input" style={{ borderRadius: '6px', padding: '0.6rem 0.8rem', color: '#475569' }} />
                    </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1rem' }}>
                    <button className="btn" style={{ background: '#0ea5e9', color: '#ffffff', borderRadius: '8px', padding: '0.6rem 1.5rem', fontWeight: '500' }}>Update Password</button>
                </div>
              </div>
          )}

          {/* Fallback for other tabs */}
          {activeTab !== 'profile' && activeTab !== 'emergency_contacts' && activeTab !== 'password' && (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</div>
              <h3 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>Under Construction</h3>
              <p style={{ color: '#64748b' }}>This section is currently being updated. Please check back later.</p>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
