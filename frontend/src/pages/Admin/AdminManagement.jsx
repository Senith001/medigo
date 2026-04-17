import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminManagement() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create admin modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Admin detail popup
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState(null);
  const [resendError, setResendError] = useState(null);

  useEffect(() => { fetchAdmins(); }, []);

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
      setFormData({ fullName: '', email: '', phone: '' });
      fetchAdmins();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create admin');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleToggleStatus = async (adminId, e) => {
    e.stopPropagation();
    try {
      await adminAPI.toggleAdminStatus(adminId);
      fetchAdmins();
      // Update selected admin if popup is open
      if (selectedAdmin?._id === adminId) {
        setSelectedAdmin(prev => ({ ...prev, isActive: !prev.isActive }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle admin status');
    }
  };

  const handleResendInvitation = async () => {
    setResendLoading(true);
    setResendMsg(null);
    setResendError(null);
    try {
      const res = await adminAPI.resendInvitation(selectedAdmin._id);
      setResendMsg(res.data.message);
    } catch (err) {
      setResendError(err.response?.data?.message || 'Failed to resend invitation.');
    } finally {
      setResendLoading(false);
    }
  };

  const openDetail = (admin) => {
    setSelectedAdmin(admin);
    setResendMsg(null);
    setResendError(null);
  };

  const closeDetail = () => setSelectedAdmin(null);

  // An admin needs resend if they are NOT active and NOT verified (still pending setup)
  const needsResend = selectedAdmin && !selectedAdmin.isActive;

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#1e293b', margin: '0 0 8px 0' }}>Admin Management</h1>
          <p style={{ color: '#64748b', margin: 0 }}>View and manage platform administrators.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ backgroundColor: '#1a1a1a', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <span style={{ fontSize: '1.2rem' }}>+</span> Create Admin
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading admins...</div>
      ) : error ? (
        <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '16px', borderRadius: '8px' }}>{error}</div>
      ) : (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Name', 'Email', 'Phone', 'Created At', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No admins found.</td></tr>
              ) : admins.map(admin => (
                <tr
                  key={admin._id}
                  onClick={() => openDetail(admin)}
                  style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background-color 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '16px', color: '#1e293b', fontWeight: '500' }}>{admin.fullName}</td>
                  <td style={{ padding: '16px', color: '#64748b' }}>{admin.email}</td>
                  <td style={{ padding: '16px', color: '#64748b' }}>{admin.phone || '—'}</td>
                  <td style={{ padding: '16px', color: '#64748b' }}>{new Date(admin.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: '600',
                      backgroundColor: admin.isActive ? '#dcfce7' : '#fef2f2',
                      color: admin.isActive ? '#166534' : '#991b1b'
                    }}>
                      {admin.isActive ? 'Active' : 'Pending / Disabled'}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button
                      onClick={(e) => handleToggleStatus(admin._id, e)}
                      style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#475569', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      {admin.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Admin Detail Popup ── */}
      {selectedAdmin && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={closeDetail}>
          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
            onClick={e => e.stopPropagation()}>

            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  {selectedAdmin.fullName?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>{selectedAdmin.fullName}</h2>
                  <span style={{
                    fontSize: '0.78rem', fontWeight: '600', padding: '2px 8px', borderRadius: '99px',
                    backgroundColor: selectedAdmin.isActive ? '#dcfce7' : '#fef2f2',
                    color: selectedAdmin.isActive ? '#166534' : '#991b1b'
                  }}>
                    {selectedAdmin.isActive ? 'Active' : 'Pending / Disabled'}
                  </span>
                </div>
              </div>
              <button onClick={closeDetail} style={{ background: 'none', border: 'none', fontSize: '1.4rem', color: '#94a3b8', cursor: 'pointer', lineHeight: 1 }}>✕</button>
            </div>

            {/* Info rows */}
            {[
              { label: 'Email', value: selectedAdmin.email },
              { label: 'Phone', value: selectedAdmin.phone || '—' },
              { label: 'Admin ID', value: selectedAdmin.userId },
              { label: 'Joined', value: new Date(selectedAdmin.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{label}</span>
                <span style={{ color: '#1e293b', fontWeight: '500', fontSize: '0.9rem' }}>{value}</span>
              </div>
            ))}

            {/* Actions */}
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

              {/* Resend invitation — only shown when admin is NOT active */}
              {needsResend && (
                <div>
                  <button
                    onClick={handleResendInvitation}
                    disabled={resendLoading}
                    style={{
                      width: '100%', padding: '10px', borderRadius: '8px', border: '1px dashed #0ea5e9',
                      backgroundColor: '#f0f9ff', color: '#0369a1', fontWeight: '600', cursor: resendLoading ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem', opacity: resendLoading ? 0.7 : 1
                    }}
                  >
                    {resendLoading ? 'Sending...' : '📧 Resend Invitation Email'}
                  </button>
                  {resendMsg && <p style={{ margin: '6px 0 0', color: '#15803d', fontSize: '0.85rem' }}>✓ {resendMsg}</p>}
                  {resendError && <p style={{ margin: '6px 0 0', color: '#b91c1c', fontSize: '0.85rem' }}>✕ {resendError}</p>}
                </div>
              )}

              {/* Toggle status */}
              <button
                onClick={(e) => handleToggleStatus(selectedAdmin._id, e)}
                style={{
                  width: '100%', padding: '10px', borderRadius: '8px', border: 'none',
                  backgroundColor: selectedAdmin.isActive ? '#fef2f2' : '#f0fdf4',
                  color: selectedAdmin.isActive ? '#b91c1c' : '#15803d',
                  fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem'
                }}
              >
                {selectedAdmin.isActive ? '🔒 Disable Account' : '✅ Enable Account'}
              </button>

              <button
                onClick={closeDetail}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#64748b', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Admin Modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>Create New Admin</h2>

            {createError && (
              <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>
                {createError}
              </div>
            )}

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Full Name', key: 'fullName', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Phone', key: 'phone', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#475569', fontWeight: '500' }}>{label}</label>
                  <input
                    type={type} required
                    value={formData[key]}
                    onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}

              <p style={{ fontSize: '0.85rem', color: '#64748b', backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', margin: 0 }}>
                📧 An invitation email will be sent to this address with a link to set up their password.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '4px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={createLoading} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#0ea5e9', color: 'white', fontWeight: '600', cursor: createLoading ? 'not-allowed' : 'pointer', opacity: createLoading ? 0.7 : 1 }}>
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
