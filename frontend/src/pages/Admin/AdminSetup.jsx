import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';

export default function AdminSetup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  const passwordValid = passwordRegex.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword;
  const canSubmit = newPassword && confirmPassword && passwordValid && passwordsMatch && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      await authAPI.setupAdminPassword({ token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/admin-login', { state: { toast: 'Account activated successfully! Please log in.' } }), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ color: '#991b1b', marginBottom: '8px' }}>Invalid Link</h2>
          <p style={{ color: '#64748b' }}>This activation link is missing or malformed. Please contact your super admin for a new invitation.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
          <h2 style={{ color: '#166534', marginBottom: '8px' }}>Account Activated!</h2>
          <p style={{ color: '#64748b' }}>Your password has been set. Redirecting you to the login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '28px' }}>
          <div style={{ padding: '6px 10px', backgroundColor: '#1a1a1a', borderRadius: '8px', color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>♡</div>
          <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1a1a1a' }}>MediGo</span>
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '6px', textAlign: 'center' }}>Set Up Your Account</h1>
        <p style={{ color: '#64748b', textAlign: 'center', marginBottom: '28px', fontSize: '0.9rem' }}>
          You've been invited to join MediGo as an admin. Create a secure password to activate your account.
        </p>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={labelStyle}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              style={inputStyle}
              placeholder="Create a strong password"
            />
            {newPassword && !passwordValid && (
              <p style={hintStyle}>
                Must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character.
              </p>
            )}
          </div>

          <div>
            <label style={labelStyle}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              style={inputStyle}
              placeholder="Re-enter your password"
            />
            {confirmPassword && !passwordsMatch && (
              <p style={hintStyle}>Passwords do not match.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: canSubmit ? '#1a1a1a' : '#94a3b8',
              color: 'white',
              fontWeight: '700',
              fontSize: '1rem',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              marginTop: '4px',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Activating...' : 'Activate Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f1f5f9',
  padding: '24px'
};

const cardStyle = {
  backgroundColor: 'white',
  borderRadius: '20px',
  padding: '40px 36px',
  width: '100%',
  maxWidth: '420px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
};

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '0.9rem',
  color: '#475569',
  fontWeight: '600'
};

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  outline: 'none',
  fontSize: '0.95rem',
  boxSizing: 'border-box'
};

const hintStyle = {
  color: '#b91c1c',
  fontSize: '0.8rem',
  marginTop: '4px',
  margin: '4px 0 0 0'
};
