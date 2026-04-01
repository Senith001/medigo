import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  return (
    <div style={{ padding: '40px', background: '#f1f5f9', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '20px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', color: '#0f3460' }}>System Administration</h1>
            <p style={{ margin: 0, color: '#64748b' }}>Logged in as: {user?.name} ({user?.role})</p>
          </div>
          <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            Log Out
          </button>
        </div>
        
        <p>Welcome to the MEDIGO Admin Control Panel. System modules will be populated here.</p>
      </div>
    </div>
  );
}