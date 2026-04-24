import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

export default function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPatients();
      if (response.data.success) {
        setPatients(response.data.data);
      } else {
        setError('Failed to fetch patients list.');
      }
    } catch (err) {
      console.error("Fetch Patients Error:", err);
      setError('Error loading patients. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const openPatientModal = async (id) => {
    setShowModal(true);
    setModalLoading(true);
    setModalError('');
    setSelectedPatient(null);
    try {
      const res = await adminAPI.getPatientById(id);
      if (res.data.success) {
        setSelectedPatient(res.data.data);
      } else {
        setModalError('Failed to fetch detailed profile.');
      }
    } catch (err) {
      setModalError('Failed to load. ' + (err.response?.data?.message || err.message));
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPatient(null);
  };

  const handleDelete = async (id, name, e) => {
    e.stopPropagation(); // prevent modal opening

    if (!window.confirm(`Are you sure you want to permanently delete patient ${name}?`)) {
      return;
    }

    try {
      setLoading(true);
      await adminAPI.deletePatient(id);
      
      // Remove from UI
      setPatients(prev => prev.filter(p => (p._id !== id && p.userId !== id)));
      alert('Patient account deleted successfully.');
    } catch (err) {
      console.error("Delete Patient Error:", err);
      alert('Failed to delete patient. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      
      {/* Maint Content View */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', minHeight: '100%', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '1.5rem' }}>Patient Management</h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>View and manage registered patient accounts.</p>
          </div>
          <div style={{ backgroundColor: '#e0e7ff', color: '#4f46e5', padding: '6px 12px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.85rem' }}>
            Total Access: {patients.length} Patient{patients.length !== 1 ? 's' : ''}
          </div>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', marginBottom: '20px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '8px', border: '1px solid #fca5a5' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading patients...</div>
        ) : patients.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            No patients found in the system.
          </div>
        ) : (
          <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '14px 20px', color: '#475569', fontWeight: '600', fontSize: '0.85rem' }}>Patient</th>
                  <th style={{ padding: '14px 20px', color: '#475569', fontWeight: '600', fontSize: '0.85rem' }}>User ID</th>
                  <th style={{ padding: '14px 20px', color: '#475569', fontWeight: '600', fontSize: '0.85rem' }}>Phone</th>
                  <th style={{ padding: '14px 20px', color: '#475569', fontWeight: '600', fontSize: '0.85rem' }}>Registered At</th>
                  <th style={{ padding: '14px 20px', color: '#475569', fontWeight: '600', fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr 
                    key={patient._id} 
                    onClick={() => openPatientModal(patient.userId)}
                    style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e0f2fe', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {patient.fullName?.[0]?.toUpperCase() || '👤'}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.95rem' }}>{patient.fullName}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{patient.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#64748b', fontSize: '0.9rem' }}>
                      <span style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontFamily: 'monospace' }}>
                        {patient.userId}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#64748b', fontSize: '0.9rem' }}>
                      {patient.phone || <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>Not provided</span>}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#64748b', fontSize: '0.9rem' }}>
                      {new Date(patient.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <button 
                        onClick={(e) => handleDelete(patient._id, patient.fullName, e)}
                        style={{ 
                          backgroundColor: '#fee2e2', 
                          color: '#b91c1c', 
                          border: 'none', 
                          borderRadius: '6px', 
                          padding: '6px 12px', 
                          cursor: 'pointer', 
                          fontSize: '0.8rem', 
                          fontWeight: '600',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Profile Details Modal Overlay */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={closeModal}>
          
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }} onClick={(e) => e.stopPropagation()}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>Patient Profile View</h3>
              <button 
                onClick={closeModal} 
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
              >
                &times;
              </button>
            </div>

            {modalLoading ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>Retrieving complete profile...</div>
            ) : modalError ? (
              <div style={{ padding: '20px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '12px', textAlign: 'center' }}>{modalError}</div>
            ) : selectedPatient ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Header Profile Snippet */}
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
                   <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>
                      {selectedPatient?.fullName?.[0]?.toUpperCase()}
                   </div>
                   <div>
                      <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.4rem' }}>{selectedPatient.fullName}</h2>
                      <div style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0' }}>Patient ID: <span style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{selectedPatient.patientId || 'N/A'}</span></div>
                      <div style={{ color: '#0ea5e9', fontSize: '0.85rem', fontWeight: '600' }}>Active Member</div>
                   </div>
                </div>

                {/* Grid Format Profile Display */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <DetailBox label="Full Name" value={selectedPatient.fullName} />
                  <DetailBox label="Email Address" value={selectedPatient.email} />
                  <DetailBox label="Phone Number" value={selectedPatient.phone} />
                  <DetailBox label="Date of Birth" value={selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString() : 'N/A'} />
                  <DetailBox label="Gender" value={selectedPatient.gender} />
                  <DetailBox label="Blood Group" value={selectedPatient.bloodGroup} />
                  <div style={{ gridColumn: 'span 2' }}>
                    <DetailBox label="Address" value={selectedPatient.address} />
                  </div>
                  
                  {/* Emergency Contracts specific section */}
                  <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#1e293b' }}>Emergency Contacts</h4>
                    <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <DetailBox label="Contact Name" value={selectedPatient.emergencyContactName} />
                      <DetailBox label="Contact Phone" value={selectedPatient.emergencyContactPhone} />
                    </div>
                  </div>
                </div>

              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

// Simple internal helper component for rendering profile stats
function DetailBox({ label, value }) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.5px' }}>{label}</p>
      <p style={{ margin: '4px 0 0 0', color: '#334155', fontWeight: value ? '500' : '400', fontSize: '0.95rem' }}>{value || <span style={{ color: '#cbd5e1' }}>Not specified</span>}</p>
    </div>
  );
}
