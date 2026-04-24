import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function DoctorLogin() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authAPI.login(credentials);
      const userData = res.data.data;

      if (userData.role !== 'doctor') {
        setError('Access denied. Please use a doctor account.');
        setLoading(false);
        return;
      }

      login(res.data.token, userData);
      navigate('/doctor');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid doctor credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '80px auto', padding: '32px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 14px 36px rgba(15, 46, 96, 0.08)' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: '#0f3460', margin: '0 0 8px 0' }}>Doctor Login</h2>
        <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Sign in to your MEDIGO doctor dashboard.</p>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '18px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>Doctor Email</label>
          <input
            type="email"
            name="email"
            placeholder="you@hospital.com"
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ background: '#0f3460', color: '#ffffff', padding: '14px', borderRadius: '10px', border: 'none', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Signing in...' : 'Sign in as Doctor'}
        </button>
      </form>

      <p style={{ marginTop: '18px', fontSize: '14px', color: '#475569', textAlign: 'center' }}>
        Not a doctor? <Link to="/login" style={{ color: '#0f3460', textDecoration: 'none', fontWeight: 600 }}>Go to standard login</Link>
      </p>
    </div>
  );
}
