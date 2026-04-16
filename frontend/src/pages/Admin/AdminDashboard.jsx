import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';

const STATUS_STYLES = {
  pending:  { bg: '#fff7ed', color: '#c2410c', activeBg: '#ea580c', label: 'Pending' },
  verified: { bg: '#f0fdf4', color: '#15803d', activeBg: '#16a34a', label: 'Verified' },
  rejected: { bg: '#fef2f2', color: '#b91c1c', activeBg: '#dc2626', label: 'Rejected' },
};

export default function AdminDashboard() {
  const [patientCount, setPatientCount] = useState(null);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    adminAPI.getPatients()
      .then(res => { if (res.data.success) setPatientCount(res.data.data.length); })
      .catch(err => console.error('Failed to fetch patient count', err));

    adminAPI.getDoctors()
      .then(res => {
        if (res.data.success) {
          setPendingDoctors(res.data.data.filter(d => d.status === 'pending'));
        }
      })
      .catch(err => console.error('Failed to fetch doctors', err));
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await adminAPI.updateDoctorStatus(id, newStatus);
      if (res.data.success) {
        // If we changed away from pending, remove from pending list
        if (newStatus !== 'pending') {
          setPendingDoctors(prev => prev.filter(d => d._id !== id));
          setSelectedDoctor(null);
        } else {
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
    <div style={{ display: 'flex', gap: '20px' }}>
      
      {/* Left Column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          
          {/* Card 1 - Patient Count */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#efecff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontSize: '1.2rem' }}>
                  👥
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Patient Count</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Track total patients</p>
                </div>
              </div>
              <Link to="/admin/patients" style={{ color: '#4f46e5', textDecoration: 'none', fontSize: '1.2rem', lineHeight: 1, cursor: 'pointer' }} title="View all patients">↗</Link>
            </div>
            <h2 style={{ margin: 0, fontSize: '2rem', color: '#1e293b' }}>{patientCount === null ? '...' : patientCount}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
              <span style={{ backgroundColor: '#e0e7ff', color: '#4f46e5', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>Total Registered</span>
              <span style={{ color: '#64748b' }}>Active system patients</span>
            </div>
          </div>

          {/* Card 2 - Monthly Revenue */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9', fontSize: '1.2rem' }}>
                  💼
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Monthly Revenue</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Monitor revenue</p>
                </div>
              </div>
              <div style={{ color: '#94a3b8', cursor: 'pointer' }}>↗</div>
            </div>
            <h2 style={{ margin: 0, fontSize: '2rem', color: '#1e293b' }}>$10,653</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
              <span style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>↓ 22%</span>
              <span style={{ color: '#64748b' }}>Down from last month</span>
            </div>
          </div>

          {/* Card 3 - Appointments */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontSize: '1.2rem' }}>
                  📅
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Appointments</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Total appointments</p>
                </div>
              </div>
              <div style={{ color: '#94a3b8', cursor: 'pointer' }}>↗</div>
            </div>
            <h2 style={{ margin: 0, fontSize: '2rem', color: '#1e293b' }}>672</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
              <span style={{ backgroundColor: '#e0e7ff', color: '#4f46e5', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>↑ 10%</span>
              <span style={{ color: '#64748b' }}>Up from last month</span>
            </div>
          </div>

        </div>

        {/* New Doctors — live pending data */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              New Doctors{' '}
              <span style={{ backgroundColor: '#1e293b', color: 'white', borderRadius: '50%', width: '22px', height: '22px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {pendingDoctors.length}
              </span>
            </h3>
            <Link to="/admin/doctors" style={{ color: '#3b82f6', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>View all &gt;</Link>
          </div>

          {pendingDoctors.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0', fontSize: '0.9rem' }}>
              No pending doctor registrations 🎉
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {pendingDoctors.slice(0, 4).map(doctor => (
                <div key={doctor._id} style={{ border: '1px solid #f1f5f9', borderRadius: '12px', padding: '16px', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: '#fff7ed', color: '#c2410c', padding: '4px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '600' }}>
                    Pending
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.6rem', marginBottom: '8px' }}>
                      {doctor.fullName?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ fontWeight: 'bold', color: '#1e293b', textAlign: 'center' }}>{doctor.fullName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{doctor.specialty}</div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', margin: '0 0 16px 0', minHeight: '32px' }}>
                    {doctor.experienceYears} years experience · ${doctor.consultationFee} fee
                  </p>
                  <button
                    onClick={() => setSelectedDoctor(doctor)}
                    style={{ width: '100%', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '24px', padding: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Patients by Age Graph block */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>Patients by Age</h3>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></div> Male</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f97316' }}></div> Female</span>
              </div>
            </div>
            <select style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', outline: 'none' }}>
              <option>Months</option>
            </select>
          </div>

          <div style={{ height: '200px', width: '100%', position: 'relative' }}>
            <svg viewBox="0 0 800 200" style={{ width: '100%', height: '100%' }}>
              <path d="M 0 150 Q 100 150 200 100 T 400 100 T 600 50 T 800 150" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="5,5" />
              <path d="M 0 170 C 100 200, 150 180, 200 120 S 300 100, 400 110 S 550 50, 600 80 S 700 90, 800 50" fill="none" stroke="#3b82f6" strokeWidth="3" />
              <circle cx="400" cy="110" r="5" fill="#3b82f6" />
              <circle cx="400" cy="98" r="4" fill="#f97316" />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.8rem', color: '#94a3b8' }}>
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>July</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            </div>
          </div>
        </div>

      </div>

      {/* Right Column — Appointments */}
      <div style={{ width: '320px', backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#1e293b' }}>Appointment</h3>
          <span style={{ backgroundColor: '#f1f5f9', color: '#4f46e5', padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>Today &gt;</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
          {[
            { img: 'https://i.pravatar.cc/150?u=hay', name: 'Haylie Philips',   time: '10:00 AM - 10:30 AM' },
            { img: 'https://i.pravatar.cc/150?u=dar', name: 'Darrell Steward',  time: '11:00 AM - 11:30 AM' },
            { img: 'https://i.pravatar.cc/150?u=ali', name: 'Alia Rivera',      time: '12:00 PM - 12:30 PM' },
            { img: 'https://i.pravatar.cc/150?u=mar', name: 'Martha Smith',     time: '1:00 PM - 1:30 PM'  },
            { img: 'https://i.pravatar.cc/150?u=alb', name: 'Albert Flores',    time: '2:00 PM - 2:30 PM'  },
            { img: 'https://i.pravatar.cc/150?u=bes', name: 'Bessie Cooper',    time: '3:00 PM - 3:30 PM'  },
            { img: 'https://i.pravatar.cc/150?u=cou', name: 'Courtney Henry',   time: '4:00 PM - 4:30 PM'  },
            { img: 'https://i.pravatar.cc/150?u=emi', name: 'Emily Smith',      time: '5:00 PM - 5:30 PM'  },
          ].map((apt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={apt.img} alt={apt.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>{apt.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{apt.time}</div>
                </div>
              </div>
              <button style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>⋮</button>
            </div>
          ))}
        </div>
      </div>

      {/* Doctor Detail Modal */}
      {selectedDoctor && (
        <div
          onClick={() => setSelectedDoctor(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 'bold', flexShrink: 0 }}>
                  {selectedDoctor.fullName?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '1.3rem' }}>{selectedDoctor.fullName}</h3>
                  <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{selectedDoctor.specialty}</div>
                  <span style={{
                    display: 'inline-block', marginTop: '6px',
                    backgroundColor: STATUS_STYLES[selectedDoctor.status]?.bg,
                    color: STATUS_STYLES[selectedDoctor.status]?.color,
                    padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700'
                  }}>
                    {STATUS_STYLES[selectedDoctor.status]?.label}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedDoctor(null)} style={{ background: 'none', border: 'none', fontSize: '1.6rem', color: '#94a3b8', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
            </div>

            {/* Detail Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <ModalField label="Email"            value={selectedDoctor.email} />
              <ModalField label="Phone"            value={selectedDoctor.phone} />
              <ModalField label="Qualifications"   value={selectedDoctor.qualifications} />
              <ModalField label="Experience"       value={`${selectedDoctor.experienceYears} years`} />
              <ModalField label="Consultation Fee" value={`$${selectedDoctor.consultationFee}`} />
              <ModalField label="Clinic Location"  value={selectedDoctor.clinicLocation} />
              {selectedDoctor.bio && (
                <div style={{ gridColumn: 'span 2' }}>
                  <ModalField label="Bio" value={selectedDoctor.bio} />
                </div>
              )}
              <ModalField label="Registered"   value={new Date(selectedDoctor.createdAt).toLocaleDateString()} />
              <ModalField label="Last Updated" value={new Date(selectedDoctor.updatedAt).toLocaleDateString()} />
            </div>

            {/* Status Toggle */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Change Verification Status</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                {Object.entries(STATUS_STYLES).map(([key, st]) => {
                  const isActive = selectedDoctor.status === key;
                  const isUpdating = updatingId === selectedDoctor._id;
                  return (
                    <button
                      key={key}
                      disabled={isActive || isUpdating}
                      onClick={() => handleStatusChange(selectedDoctor._id, key)}
                      style={{
                        flex: 1, padding: '10px', borderRadius: '10px',
                        border: `2px solid ${isActive ? st.activeBg : 'transparent'}`,
                        cursor: isActive || isUpdating ? 'not-allowed' : 'pointer',
                        fontWeight: '700', fontSize: '0.9rem',
                        backgroundColor: isActive ? st.activeBg : st.bg,
                        color: isActive ? '#ffffff' : st.color,
                        opacity: !isActive && isUpdating ? 0.5 : 1,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {isUpdating && !isActive ? '...' : st.label}
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

function ModalField({ label, value }) {
  return (
    <div>
      <p style={{ margin: '0 0 4px 0', fontSize: '0.72rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.5px' }}>{label}</p>
      <p style={{ margin: 0, color: '#1e293b', fontWeight: '500', fontSize: '0.9rem' }}>{value || <span style={{ color: '#cbd5e1' }}>Not provided</span>}</p>
    </div>
  );
}