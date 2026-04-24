import React, { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'

const STATUS_STYLES = {
  pending:  { bg: '#fff7ed', color: '#c2410c', activeBg: '#ea580c', label: 'Pending' },
  verified: { bg: '#f0fdf4', color: '#15803d', activeBg: '#16a34a', label: 'Verified' },
  rejected: { bg: '#fef2f2', color: '#b91c1c', activeBg: '#dc2626', label: 'Rejected' },
};

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getDoctors();
      if (res.data.success) {
        setDoctors(res.data.data);
      } else {
        setError('Failed to fetch doctors.');
      }
    } catch (err) {
      setError('Error loading doctors. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await adminAPI.updateDoctorStatus(id, newStatus);
      if (res.data.success) {
        setDoctors(prev => prev.map(d => d._id === id ? { ...d, status: newStatus } : d));
        if (selectedDoctor?._id === id) {
          setSelectedDoctor(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', minHeight: '100%', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '1.5rem' }}>Doctor Management</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Review and manage doctor verification status.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {Object.entries(STATUS_STYLES).map(([key, st]) => (
            <div key={key} style={{ backgroundColor: st.bg, color: st.color, padding: '6px 14px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700' }}>
              {st.label}: {doctors.filter(d => d.status === key).length}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', marginBottom: '20px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '8px', border: '1px solid #fca5a5' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading doctors...</div>
      ) : doctors.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          No doctors found in the system.
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={th}>Doctor</th>
                <th style={th}>Specialty</th>
                <th style={th}>Experience</th>
                <th style={th}>Fee</th>
                <th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map(doctor => {
                const st = STATUS_STYLES[doctor.status] || STATUS_STYLES.pending;
                return (
                  <tr
                    key={doctor._id}
                    onClick={() => setSelectedDoctor(doctor)}
                    style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem', flexShrink: 0 }}>
                          {doctor.fullName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.95rem' }}>{doctor.fullName}</div>
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{doctor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={td}>{doctor.specialty}</td>
                    <td style={td}>{doctor.experienceYears} yr{doctor.experienceYears !== 1 ? 's' : ''}</td>
                    <td style={td}>${doctor.consultationFee}</td>
                    <td style={td}>
                      <span style={{ backgroundColor: st.bg, color: st.color, padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>
                        {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Doctor Detail Modal */}
      {selectedDoctor && (
        <div
          onClick={() => setSelectedDoctor(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' }}
          >
            {/* 1. Modal Header & Top Section (Name, ID, Status, Bio) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 'bold', flexShrink: 0 }}>
                  {selectedDoctor.fullName?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                    <h3 style={{ margin: '0', color: '#0f172a', fontSize: '1.3rem' }}>{selectedDoctor.fullName}</h3>
                    <span style={{
                      backgroundColor: STATUS_STYLES[selectedDoctor.status]?.bg,
                      color: STATUS_STYLES[selectedDoctor.status]?.color,
                      padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700'
                    }}>
                      {STATUS_STYLES[selectedDoctor.status]?.label}
                    </span>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '6px' }}>
                    <strong>Doctor ID:</strong> {selectedDoctor.userId || selectedDoctor._id}
                  </div>
                  {selectedDoctor.bio && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: '#475569', lineHeight: '1.5', fontStyle: 'italic' }}>
                      "{selectedDoctor.bio}"
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedDoctor(null)} style={{ background: 'none', border: 'none', fontSize: '1.6rem', color: '#94a3b8', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
            </div>

            {/* 2. Inline Copyable Fields Row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
              <CopyableField label="Full Name" value={selectedDoctor.fullName} />
              <CopyableField label="NIC Number" value={selectedDoctor.nicNumber} />
              <CopyableField label="SLMC License" value={selectedDoctor.medicalLicenseNumber} />
              <CopyableField label="Specialty" value={selectedDoctor.specialty} />
              <CopyableField label="Category" value={selectedDoctor.category} />
            </div>

            {/* 3. Remaining Standard Fields Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <ModalField label="Email" value={selectedDoctor.email} />
              <ModalField label="Phone" value={selectedDoctor.phone} />
              <ModalField label="Qualifications" value={selectedDoctor.qualifications} />
              <ModalField label="Experience" value={`${selectedDoctor.experienceYears} years`} />
              <ModalField label="Consultation Fee" value={`$${selectedDoctor.consultationFee}`} />
              <ModalField label="Clinic Location" value={selectedDoctor.clinicLocation} />
              <ModalField label="Registered" value={new Date(selectedDoctor.createdAt).toLocaleDateString()} />
              <ModalField label="Last Updated" value={new Date(selectedDoctor.updatedAt).toLocaleDateString()} />
            </div>

            {/* 4. Status Toggle Section & Verification Link */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Verification Decision
                </p>
                <a 
                  href="https://slmc.gov.lk/en/public/registers" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4f46e5', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}
                >
                  Verify via Official SLMC Registry
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {Object.entries(STATUS_STYLES)
                  .filter(([key]) => key !== 'pending')
                  .map(([key, st]) => {
                    const isActive = selectedDoctor.status === key;
                    const isUpdating = updatingId === selectedDoctor._id;
                    return (
                      <button
                        key={key}
                        disabled={isActive || isUpdating}
                        onClick={() => handleStatusChange(selectedDoctor._id, key)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '10px',
                          border: `2px solid ${isActive ? st.activeBg : 'transparent'}`,
                          cursor: isActive || isUpdating ? 'not-allowed' : 'pointer',
                          fontWeight: '700',
                          fontSize: '0.9rem',
                          backgroundColor: isActive ? st.activeBg : st.bg,
                          color: isActive ? '#ffffff' : st.color,
                          opacity: !isActive && isUpdating ? 0.5 : 1,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isUpdating && !isActive ? 'Processing...' : st.label}
                      </button>
                    );
                })}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

const th = { padding: '14px 20px', color: '#475569', fontWeight: '600', fontSize: '0.85rem' };
const td = { padding: '14px 20px', color: '#64748b', fontSize: '0.9rem' };

function ModalField({ label, value }) {
  return (
    <div>
      <p style={{ margin: '0 0 4px 0', fontSize: '0.72rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.5px' }}>{label}</p>
      <p style={{ margin: 0, color: '#1e293b', fontWeight: '500', fontSize: '0.9rem' }}>{value || <span style={{ color: '#cbd5e1' }}>Not provided</span>}</p>
    </div>
  );
}

function CopyableField({ label, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ flex: '1 1 calc(20% - 16px)', minWidth: '120px' }}>
      <p style={{ margin: '0 0 4px 0', fontSize: '0.70rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.5px' }}>
        {label}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={handleCopy}
          title="Copy to clipboard"
          style={{ 
            background: 'none', border: 'none', cursor: value ? 'pointer' : 'default', 
            padding: 0, display: 'flex', alignItems: 'center',
            color: copied ? '#10b981' : '#cbd5e1', transition: 'color 0.2s ease' 
          }}
        >
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          )}
        </button>
        <p style={{ margin: 0, color: '#1e293b', fontWeight: '600', fontSize: '0.85rem', wordBreak: 'break-word' }}>
          {value || <span style={{ color: '#cbd5e1', fontWeight: '500' }}>N/A</span>}
        </p>
      </div>
    </div>
  );
}
