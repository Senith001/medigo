import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
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
      const res = await adminAPI.adminLogin(credentials);
      const userData = res.data.data;

      // Extra Guard: Ensure only admins can use this portal
      if (userData.role !== 'admin' && userData.role !== 'superadmin') {
        setError('Access denied. Admin credentials required.');
        setLoading(false);
        return;
      }

      login(res.data.token, userData);
      navigate('/admin'); // Redirect to the admin dashboard
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '30px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: '#0f3460', margin: '0 0 8px 0' }}>MEDIGO Admin Portal</h2>
        <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Authorized Personnel Only</p>
      </div>
      
      {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>Admin Email</label>
          <input type="email" name="email" onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>Password</label>
          <input type="password" name="password" onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
        </div>
        <button type="submit" disabled={loading} style={{ background: '#0f3460', color: 'white', padding: '12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px' }}>
          {loading ? 'Authenticating...' : 'Secure Login'}
        </button>
      </form>
    </div>
  );
}