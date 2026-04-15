import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminManagement() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAPI.getAdminsList();
      setAdmins(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError(null);
    setCreateLoading(true);

    try {
      await adminAPI.createAdmin(formData);
      setShowModal(false);
      setFormData({ fullName: '', email: '', phone: '', password: '' });
      fetchAdmins(); // Refresh list
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create admin');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleToggleStatus = async (adminId) => {
    try {
      await adminAPI.toggleAdminStatus(adminId);
      fetchAdmins(); // Refresh list to get new status
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle admin status');
    }
  };

  const isPasswordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(formData.password);

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#1e293b', margin: '0 0 8px 0' }}>Admin Management</h1>
          <p style={{ color: '#64748b', margin: 0 }}>View and manage platform administrators.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{
            backgroundColor: '#1a1a1a', color: 'white', border: 'none', borderRadius: '8px',
            padding: '10px 20px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>+</span> Create Admin
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading admins...</div>
      ) : error ? (
        <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '16px', borderRadius: '8px' }}>{error}</div>
      ) : (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Name</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Email</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Phone</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Created At</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No admins found.</td>
                </tr>
              ) : (
                admins.map(admin => (
                  <tr key={admin._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px', color: '#1e293b', fontWeight: '500' }}>{admin.fullName}</td>
                    <td style={{ padding: '16px', color: '#64748b' }}>{admin.email}</td>
                    <td style={{ padding: '16px', color: '#64748b' }}>{admin.phone}</td>
                    <td style={{ padding: '16px', color: '#64748b' }}>{new Date(admin.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        padding: '4px 10px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: '600',
                        backgroundColor: admin.isActive ? '#dcfce7' : '#fef2f2',
                        color: admin.isActive ? '#166534' : '#991b1b'
                      }}>
                        {admin.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <button 
                        onClick={() => handleToggleStatus(admin._id)}
                        style={{
                          padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc',
                          color: '#475569', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer'
                        }}
                      >
                        {admin.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Creation Modal Overlay */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '450px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>Create New Admin</h2>

            {createError && (
              <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>
                {createError}
              </div>
            )}

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#475569', fontWeight: '500' }}>Full Name</label>
                <input 
                  type="text" required 
                  value={formData.fullName} 
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#475569', fontWeight: '500' }}>Email</label>
                <input 
                  type="email" required 
                  value={formData.email} 
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#475569', fontWeight: '500' }}>Phone</label>
                <input 
                  type="text" required 
                  value={formData.phone} 
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#475569', fontWeight: '500' }}>Password</label>
                <input 
                  type="password" required 
                  value={formData.password} 
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
                {formData.password && !isPasswordValid && (
                  <div style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '4px' }}>
                    Must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character.
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={createLoading || (formData.password && !isPasswordValid)}
                  style={{ 
                    padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#0ea5e9', color: 'white', fontWeight: '600', 
                    cursor: (createLoading || (formData.password && !isPasswordValid)) ? 'not-allowed' : 'pointer',
                    opacity: (createLoading || (formData.password && !isPasswordValid)) ? 0.7 : 1
                  }}
                >
                  {createLoading ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
