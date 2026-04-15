import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';

export default function AdminDashboard() {
  const [patientCount, setPatientCount] = useState(null);

  useEffect(() => {
    adminAPI.getPatients()
      .then(res => { if (res.data.success) setPatientCount(res.data.data.length); })
      .catch(err => console.error('Failed to fetch patient count', err));
  }, []);
  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      
      {/* Left Column (Stats + Graph + New Patients) */}
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
            <h2 style={{ margin: 0, fontSize: '2rem', color: '#1e293b' }}>
              {patientCount === null ? '...' : patientCount}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
              <span style={{ backgroundColor: '#e0e7ff', color: '#4f46e5', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>Total Registered</span>
              <span style={{ color: '#64748b' }}>Active system patients</span>
            </div>
          </div>

          {/* Card 2 */}
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

          {/* Card 3 */}
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

        {/* Middle Section: New Doctors */}
        <div style={{ display: 'flex', gap: '20px' }}>
          
          {/* New Doctors */}
          <div style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                New Doctors <span style={{ backgroundColor: '#1e293b', color: 'white', borderRadius: '50%', width: '20px', height: '20px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</span>
              </h3>
              <span style={{ color: '#3b82f6', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' }}>View all &gt;</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              
              <div style={{ border: '1px solid #f1f5f9', borderRadius: '12px', padding: '16px', position: 'relative' }}>
                <span style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: '#e6f4ea', color: '#16a34a', padding: '4px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '600' }}>Available</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '12px' }}>
                  <img src="https://i.pravatar.cc/150?u=drjames" alt="Dr. James" style={{ width: '60px', height: '60px', borderRadius: '50%', marginBottom: '8px', objectFit: 'cover' }} />
                  <div style={{ fontWeight: 'bold', color: '#1e293b' }}>Dr. James Carter</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Cardiologist</div>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', margin: '0 0 16px 0', minHeight: '40px' }}>8 years of experience in cardiovascular surgery and diagnostics.</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ flex: 1, backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '24px', padding: '8px', cursor: 'pointer', fontWeight: '600' }}>Accept</button>
                  <button style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>⋮</button>
                </div>
              </div>

              <div style={{ border: '1px solid #f1f5f9', borderRadius: '12px', padding: '16px', position: 'relative' }}>
                <span style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: '#fff7ed', color: '#ea580c', padding: '4px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '600' }}>Pending Review</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '12px' }}>
                  <img src="https://i.pravatar.cc/150?u=drsofia" alt="Dr. Sofia" style={{ width: '60px', height: '60px', borderRadius: '50%', marginBottom: '8px', objectFit: 'cover' }} />
                  <div style={{ fontWeight: 'bold', color: '#1e293b' }}>Dr. Sofia Nguyen</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Neurologist</div>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', margin: '0 0 16px 0', minHeight: '40px' }}>Specializes in neurological disorders and brain imaging techniques.</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ flex: 1, backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '24px', padding: '8px', cursor: 'pointer', fontWeight: '600' }}>Accept</button>
                  <button style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>⋮</button>
                </div>
              </div>

            </div>
          </div>
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
            {/* Extremely simple mockup of a graph using SVG */}
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

      {/* Right Column (Appointments) */}
      <div style={{ width: '320px', backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#1e293b' }}>Appointment</h3>
          <span style={{ backgroundColor: '#f1f5f9', color: '#4f46e5', padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>Today &gt;</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
          
          {[
            { img: 'https://i.pravatar.cc/150?u=hay', name: 'Haylie Philips', time: '10:00 AM - 10:30 AM' },
            { img: 'https://i.pravatar.cc/150?u=dar', name: 'Darrell Steward', time: '11:00 AM - 11:30 AM' },
            { img: 'https://i.pravatar.cc/150?u=ali', name: 'Alia Rivera', time: '12:00 PM - 12:30 PM' },
            { img: 'https://i.pravatar.cc/150?u=mar', name: 'Martha Smith', time: '1:00 PM - 1:30 PM' },
            { img: 'https://i.pravatar.cc/150?u=alb', name: 'Albert Flores', time: '2:00 PM - 2:30 PM' },
            { img: 'https://i.pravatar.cc/150?u=bes', name: 'Bessie Cooper', time: '3:00 PM - 3:30 PM' },
            { img: 'https://i.pravatar.cc/150?u=cou', name: 'Courtney Henry', time: '4:00 PM - 4:30 PM' },
            { img: 'https://i.pravatar.cc/150?u=emi', name: 'Emily Smith', time: '5:00 PM - 5:30 PM' },
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

    </div>
  );
}