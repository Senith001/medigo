import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

export default function AdminProfile() {
  const { user } = useAuth();
  
  // Profile State
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Password State
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState('');
  const [pwdError, setPwdError] = useState(false);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const res = await authAPI.getMe();
        if (res.data.success) {
          setProfile(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load admin profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminProfile();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdLoading(true);
    setPwdMessage('');
    setPwdError(false);
    
    try {
      const res = await authAPI.changePassword(passwords);
      if (res.data.success) {
        setPwdMessage('✅ Password updated successfully.');
        setPasswords({ currentPassword: '', newPassword: '' });
      }
    } catch (err) {
      setPwdError(true);
      setPwdMessage('❌ ' + (err.response?.data?.message || err.message));
    } finally {
      setPwdLoading(false);
    }
  };

  const handlePwdInput = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '1.8rem' }}>Admin Configuration</h2>
        <p style={{ margin: 0, color: '#64748b' }}>Manage your system identity and security parameters.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '24px' }}>
        
        {/* Profile Card */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 24px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>👤</span> Profile Information
          </h3>
          
          {loading ? (
            <div style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>Loading...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#1e293b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {profile?.fullName?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>{profile?.fullName || user?.name}</h4>
                  <div style={{ display: 'inline-block', backgroundColor: '#e0e7ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', marginTop: '4px', textTransform: 'uppercase' }}>
                    {profile?.role || user?.role} Mode
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <DetailBox label="Admin ID" value={profile?.userId || user?.userId} />
                  <DetailBox label="Email Address" value={profile?.email || user?.email} />
                  <DetailBox label="Phone Number" value={profile?.phone || 'Not provided'} />
                </div>
              </div>
              
            </div>
          )}
        </div>

        {/* Security / Password Change Card */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 24px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>🔒</span> Security Controls
          </h3>

          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Current Password</label>
              <input 
                type="password" 
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handlePwdInput}
                required
                style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#f8fafc', transition: 'border 0.2s ease', color: '#1e293b' }}
                onFocus={(e) => e.target.style.border = '1px solid #3b82f6'}
                onBlur={(e) => e.target.style.border = '1px solid #cbd5e1'}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>New Password</label>
              <input 
                type="password" 
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePwdInput}
                required
                style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#f8fafc', transition: 'border 0.2s ease', color: '#1e293b' }}
                onFocus={(e) => e.target.style.border = '1px solid #3b82f6'}
                onBlur={(e) => e.target.style.border = '1px solid #cbd5e1'}
              />
            </div>

            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
              Password must be strictly higher than 8 characters, and incorporate an uppercase, memory-safe numeric string, and symbolic character.
            </p>

            <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
              <button 
                type="submit" 
                disabled={pwdLoading}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  backgroundColor: '#1a1a1a', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '10px', 
                  fontWeight: '600', 
                  cursor: pwdLoading ? 'not-allowed' : 'pointer',
                  opacity: pwdLoading ? 0.7 : 1
                }}
              >
                {pwdLoading ? 'Processing...' : 'Update Password Protocol'}
              </button>
            </div>

            {pwdMessage && (
              <div style={{ 
                marginTop: '12px', 
                padding: '12px', 
                backgroundColor: pwdError ? '#fef2f2' : '#f0fdf4', 
                color: pwdError ? '#b91c1c' : '#15803d', 
                borderRadius: '8px', 
                fontSize: '0.85rem', 
                fontWeight: '600',
                textAlign: 'center'
              }}>
                {pwdMessage}
              </div>
            )}
            
          </form>
        </div>

      </div>
    </div>
  );
}

// Simple layout aid
function DetailBox({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>{label}</span>
      <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '500' }}>{value}</span>
    </div>
  );
}
