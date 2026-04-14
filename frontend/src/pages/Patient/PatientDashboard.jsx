import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { appointmentAPI } from '../../services/api'

const SPECIALTIES = [
  { name: 'Cardiology',       icon: '❤️',  color: '#fee2e2', border: '#fca5a5' },
  { name: 'Dermatology',      icon: '🧴',  color: '#fef3c7', border: '#fcd34d' },
  { name: 'Neurology',        icon: '🧠',  color: '#ede9fe', border: '#c4b5fd' },
  { name: 'Orthopedics',      icon: '🦴',  color: '#dbeafe', border: '#93c5fd' },
  { name: 'Pediatrics',       icon: '👶',  color: '#dcfce7', border: '#86efac' },
  { name: 'Psychiatry',       icon: '🧘',  color: '#e0f2fe', border: '#7dd3fc' },
  { name: 'Gynecology',       icon: '🌸',  color: '#fce7f3', border: '#f9a8d4' },
  { name: 'General Medicine', icon: '🩺',  color: '#ccfbf1', border: '#5eead4' },
  { name: 'Ophthalmology',    icon: '👁️', color: '#fef9c3', border: '#fde047' },
  { name: 'ENT',              icon: '👂',  color: '#ffedd5', border: '#fdba74' },
  { name: 'Urology',          icon: '🔬',  color: '#f0fdf4', border: '#86efac' },
  { name: 'Oncology',         icon: '🎗️', color: '#fdf2f8', border: '#f0abfc' },
]

export default function PatientDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [doctorName, setDoctorName] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [hospital, setHospital] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/search?specialty=${specialty}&name=${doctorName}`)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="page-wrapper">
      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, #1a4a8a 60%, #0f3460 100%)',
        padding: '30px 0 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', background:'rgba(20,184,166,.08)', top:-60, right:80, pointerEvents:'none' }}/>
        <div style={{ position:'absolute', width:180, height:180, borderRadius:'50%', background:'rgba(20,184,166,.05)', bottom:-40, left:60, pointerEvents:'none' }}/>

        <div className="container" style={{ position:'relative' }}>
          
          {/* Dashboard Header Controls */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '30px' }}>
            <button onClick={() => navigate('/appointments')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
              My Appointments
            </button>
            <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,100,100,0.5)', background: 'transparent', color: '#ffb3b3', cursor: 'pointer' }}>
              Log Out
            </button>
          </div>

          <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(20,184,166,.15)', border: '1px solid rgba(20,184,166,.3)',
              borderRadius: 99, padding: '5px 16px', marginBottom: 18,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal-400)', animation: 'pulse 2s infinite' }}/>
              <span style={{ fontSize: 12, color: 'var(--teal-300)', fontWeight: 600 }}>Patient Portal Active</span>
            </div>
            
            {/* Personalized Greeting */}
            <h1 style={{ fontSize: 40, color: '#fff', marginBottom: 14, fontFamily: 'var(--font-display)', fontWeight: 800 }}>
              Welcome back, <br/>
              <span style={{ color: 'var(--teal-400)' }}>{user?.name || 'Patient'}</span>
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,.6)', marginBottom: 36 }}>
              Find and book appointments with the best doctors across Sri Lanka
            </p>
          </div>

          {/* Search bar card */}
          <div className="card" style={{ padding: '24px 28px', maxWidth: 900, margin: '0 auto', borderRadius: 14, background: '#fff' }}>
            <form onSubmit={handleSearch}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>Doctor Name</label>
                  <input className="form-input" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} placeholder="Search doctor name..." value={doctorName} onChange={e => setDoctorName(e.target.value)}/>
                </div>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>Specialization</label>
                  <select className="form-input" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} value={specialty} onChange={e => setSpecialty(e.target.value)}>
                    <option value="">Select Specialization</option>
                    {SPECIALTIES.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>Hospital</label>
                  <input className="form-input" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} placeholder="Select Hospital..." value={hospital} onChange={e => setHospital(e.target.value)}/>
                </div>
                <button type="submit" className="btn btn-navy btn-lg" style={{ height: 42, padding: '0 28px', background: 'var(--navy)', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                  Search
                </button>
              </div>
            </form>
            <div style={{ marginTop: 12, borderTop: '1px solid var(--gray-100)', paddingTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Quick search:</span>
              {['Cardiology','Dermatology','Pediatrics','General Medicine'].map(s => (
                <button key={s} onClick={() => navigate(`/search?specialty=${s}`)} style={{
                  padding: '3px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                  background: 'var(--teal-50)', color: 'var(--teal-700)',
                  border: '1px solid var(--teal-200)', cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick access — specialty grid */}
      <div style={{ background: '#f5f7fa', padding: '40px 0 60px' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 className="section-title" style={{ marginBottom: 0, fontSize: '24px', fontWeight: 'bold' }}>Browse by Specialty</h2>
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--teal-600)', fontWeight: 700, border: 'none', background: 'transparent', cursor: 'pointer' }} onClick={() => navigate('/search')}>
              View All →
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {SPECIALTIES.map((s, i) => (
              <button
                key={s.name}
                onClick={() => navigate(`/search?specialty=${s.name}`)}
                className="card card-hover fade-up"
                style={{
                  padding: '22px 16px', textAlign: 'center', cursor: 'pointer',
                  border: `1.5px solid ${s.border}`,
                  borderRadius: '12px',
                  animationDelay: `${i * .04}s`,
                  background: '#fff',
                  fontFamily: 'var(--font-body)',
                  transition: 'transform 0.2s',
                }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: s.color, margin: '0 auto 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26,
                }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)' }}>{s.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background: 'var(--navy)', padding: '32px 0', backgroundColor: '#0f3460' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, textAlign: 'center' }}>
            {[
              { val: '500+', label: 'Verified Doctors' },
              { val: '20+',  label: 'Specializations'  },
              { val: '50K+', label: 'Appointments'     },
              { val: '4.9★', label: 'Average Rating'   },
            ].map((s, i) => (
              <div key={s.label} style={{ borderRight: i < 3 ? '1px solid rgba(255,255,255,.1)' : 'none', padding: '0 24px' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#2dd4bf', fontFamily: 'var(--font-display)' }}>{s.val}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.7)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}