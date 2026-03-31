import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth(); // Using teammate's context!
  
  const email = location.state?.email;

  if (!email) return <Navigate to="/register" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authAPI.verifyOtp({ email, otp });
      // Pass the token and user data into your teammate's login function
      login(res.data.token, res.data.data);
      navigate('/dashboard'); 
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2>Verify Your Email</h2>
      <p>Enter the code sent to <strong>{email}</strong></p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input type="text" placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify & Login'}</button>
      </form>
    </div>
  );
}