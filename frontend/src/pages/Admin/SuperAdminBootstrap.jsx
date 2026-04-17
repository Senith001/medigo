import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function SuperAdminBootstrap() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', superKey: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const passwordValid = passwordRegex.test(form.password);
  const passwordsMatch = form.password === form.confirmPassword;
  const canSubmit = form.fullName && form.email && form.password && form.confirmPassword && form.superKey && passwordValid && passwordsMatch && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      const res = await adminAPI.bootstrapSuperAdmin(
        { fullName: form.fullName, email: form.email, password: form.password },
        form.superKey
      );

      setSuccess(true);
      // If token returned, log the superadmin in immediately
      if (res.data.token) {
        login(res.data.token, res.data.data);
        setTimeout(() => navigate('/admin'), 2000);
      } else {
        setTimeout(() => navigate('/admin-login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Bootstrap failed. Check your details and super key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#0f172a', backgroundImage: 'radial-gradient(ellipse at 60% 20%, rgba(30,58,138,0.4) 0%, transparent 60%)',
      padding: '24px'
    }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ padding: '8px 12px', backgroundColor: '#3b82f6', borderRadius: '10px', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>♡</div>
            <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'white' }}>MediGo</span>
          </div>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>System Initialisation</p>
        </div>

        <div style={{
          backgroundColor: '#1e293b', borderRadius: '20px', padding: '36px',
          border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
        }}>
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ margin: '0 0 6px 0', fontSize: '1.4rem', fontWeight: '700', color: '#f1f5f9' }}>
              Bootstrap Super Admin
            </h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
              One-time setup to create the first super administrator account. Requires the system secret key.
            </p>
          </div>

          {success ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✅</div>
              <h2 style={{ color: '#4ade80', margin: '0 0 8px 0' }}>Super Admin Created!</h2>
              <p style={{ color: '#94a3b8', margin: 0 }}>Redirecting to the admin portal...</p>
            </div>
          ) : (
            <>
              {error && (
                <div style={{ backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '12px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Full Name */}
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input
                    type="text" required
                    value={form.fullName}
                    onChange={e => setForm({ ...form, fullName: e.target.value })}
                    placeholder="e.g. Dr. Jane Smith"
                    style={inputStyle}
                  />
                </div>

                {/* Email */}
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input
                    type="email" required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="superadmin@medigo.com"
                    style={inputStyle}
                  />
                </div>

                {/* Password */}
                <div>
                  <label style={labelStyle}>Password</label>
                  <input
                    type="password" required
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Create a strong password"
                    style={inputStyle}
                  />
                  {form.password && !passwordValid && (
                    <p style={hintStyle}>Must be ≥8 characters with uppercase, lowercase, number & special character.</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label style={labelStyle}>Confirm Password</label>
                  <input
                    type="password" required
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Re-enter password"
                    style={inputStyle}
                  />
                  {form.confirmPassword && !passwordsMatch && (
                    <p style={hintStyle}>Passwords do not match.</p>
                  )}
                </div>

                {/* Super Key */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                  <label style={{ ...labelStyle, color: '#fbbf24' }}>🔑 System Super Key</label>
                  <input
                    type="password" required
                    value={form.superKey}
                    onChange={e => setForm({ ...form, superKey: e.target.value })}
                    placeholder="Enter the system secret key"
                    style={{ ...inputStyle, borderColor: form.superKey ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.1)' }}
                  />
                  <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.78rem' }}>
                    This key is set in the admin-service environment variables.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  style={{
                    marginTop: '8px', padding: '13px', borderRadius: '10px', border: 'none',
                    backgroundColor: canSubmit ? '#3b82f6' : '#334155',
                    color: canSubmit ? 'white' : '#64748b',
                    fontWeight: '700', fontSize: '1rem',
                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s'
                  }}
                >
                  {loading ? 'Creating Super Admin...' : 'Initialize Super Admin'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <a href="/admin-login" style={{ color: '#64748b', fontSize: '0.85rem', textDecoration: 'none' }}>
                  ← Back to Admin Login
                </a>
              </div>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.78rem', marginTop: '16px' }}>
          ⚠️ This page should only be accessible during first-time system setup.
        </p>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '0.875rem',
  color: '#cbd5e1',
  fontWeight: '600'
};

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.1)',
  backgroundColor: '#0f172a',
  color: '#f1f5f9',
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s'
};

const hintStyle = {
  margin: '5px 0 0',
  color: '#f87171',
  fontSize: '0.78rem'
};
