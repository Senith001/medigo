import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { appointmentAPI } from '../services/api'

const MOCK_DOCTORS = [
  { _id:'69c434b9046be23bd4589732', fullName:'Dr. Kamal Perera',    email:'doctor@healthcare.lk', specialty:'Cardiology',      hospital:'Colombo General Hospital', fee:2500, rating:4.9, reviews:128, experience:14, available:true  },
  { _id:'d2', fullName:'Dr. Nisha Fernando',  email:'nisha@hospital.lk',   specialty:'Dermatology',     hospital:'Nawaloka Hospital',         fee:2000, rating:4.7, reviews:94,  experience:8,  available:true  },
  { _id:'d3', fullName:'Dr. Rohan Silva',     email:'rohan@hospital.lk',   specialty:'Neurology',       hospital:'Lanka Hospitals',           fee:3000, rating:4.8, reviews:211, experience:19, available:false },
  { _id:'d4', fullName:'Dr. Priya Rajapaksa', email:'priya@hospital.lk',  specialty:'Pediatrics',      hospital:'Asiri Hospital',            fee:1800, rating:4.9, reviews:305, experience:11, available:true  },
  { _id:'d5', fullName:'Dr. Ashan Wickrama',  email:'ashan@hospital.lk',  specialty:'Orthopedics',     hospital:'Colombo General Hospital',  fee:2800, rating:4.6, reviews:76,  experience:16, available:true  },
  { _id:'d6', fullName:'Dr. Samanthi Dias',   email:'sam@hospital.lk',    specialty:'Gynecology',      hospital:'Durdans Hospital',          fee:2200, rating:4.8, reviews:189, experience:13, available:true  },
  { _id:'d7', fullName:'Dr. Thilina Mendis',  email:'thilina@hospital.lk',specialty:'General Medicine',hospital:'Nawaloka Hospital',         fee:1500, rating:4.5, reviews:412, experience:9,  available:true  },
  { _id:'d8', fullName:'Dr. Asha Gunawardena',email:'asha@hospital.lk',   specialty:'Psychiatry',      hospital:'Lanka Hospitals',           fee:3500, rating:4.9, reviews:87,  experience:22, available:true  },
]

const SPECIALTIES = ['Cardiology','Dermatology','Neurology','Orthopedics','Pediatrics','Psychiatry','Gynecology','General Medicine','Ophthalmology','ENT','Urology','Oncology']

export default function SearchDoctors() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [doctors, setDoctors] = useState(MOCK_DOCTORS)
  const [loading, setLoading] = useState(false)
  const [nameFilter, setNameFilter] = useState(searchParams.get('name') || '')
  const [specFilter, setSpecFilter] = useState(searchParams.get('specialty') || '')

  useEffect(() => {
    const sp = searchParams.get('specialty')
    if (sp) {
      setSpecFilter(sp)
      setDoctors(MOCK_DOCTORS.filter(d => d.specialty === sp))
    }
  }, [])

  const handleSearch = (e) => {
    e?.preventDefault()
    setLoading(true)
    setTimeout(() => {
      let result = MOCK_DOCTORS
      if (nameFilter) result = result.filter(d => d.fullName.toLowerCase().includes(nameFilter.toLowerCase()))
      if (specFilter) result = result.filter(d => d.specialty === specFilter)
      setDoctors(result)
      setLoading(false)
    }, 400)
  }

  return (
    <div className="page-wrapper" style={{ padding: '28px 0 60px' }}>
      <div className="container">
        {/* Search filters */}
        <div className="card" style={{ padding: '20px 24px', marginBottom: 24 }}>
          <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
            <div>
              <label className="form-label">Doctor Name</label>
              <input className="form-input" placeholder="Search by name..." value={nameFilter} onChange={e => setNameFilter(e.target.value)}/>
            </div>
            <div>
              <label className="form-label">Specialization</label>
              <select className="form-input" value={specFilter} onChange={e => setSpecFilter(e.target.value)}>
                <option value="">All Specializations</option>
                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-navy" style={{ height: 42 }} disabled={loading}>
              {loading ? <span className="spinner"/> : 'Search'}
            </button>
          </form>
        </div>

        {/* Results count */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--gray-500)', fontWeight: 600 }}>
            {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} found
            {specFilter && <span style={{ color: 'var(--teal-600)' }}> · {specFilter}</span>}
          </p>
        </div>

        {/* Doctor cards */}
        {doctors.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No doctors found</h3>
            <p>Try a different name or specialization</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {doctors.map((doc, i) => (
              <DoctorRow key={doc._id} doctor={doc} index={i} onBook={() => navigate('/book', { state: { doctor: doc } })} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DoctorRow({ doctor, index, onBook }) {
  const initials = doctor.fullName.replace('Dr. ','').split(' ').map(n=>n[0]).join('').slice(0,2)
  const avatarColors = ['#dbeafe','#dcfce7','#fce7f3','#e0e7ff','#fef3c7','#ccfbf1']
  const textColors   = ['#1d4ed8','#166534','#9d174d','#3730a3','#92400e','#0f766e']
  const ci = index % avatarColors.length

  return (
    <div className="card card-hover fade-up" style={{ padding: '20px 24px', animationDelay: `${index*.05}s` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        {/* Avatar */}
        <div style={{
          width: 60, height: 60, borderRadius: 12, flexShrink: 0,
          background: avatarColors[ci], color: textColors[ci],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800,
        }}>
          {initials}
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
            <span style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{doctor.fullName}</span>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 99,
              background: 'var(--teal-50)', color: 'var(--teal-700)',
              border: '1px solid var(--teal-200)',
            }}>
              {doctor.specialty}
            </span>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: doctor.available ? 'var(--green-500)' : 'var(--gray-300)',
              display: 'inline-block',
            }} title={doctor.available ? 'Available' : 'Not Available'}/>
          </div>
          <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--gray-500)', flexWrap: 'wrap' }}>
            <span>🏥 {doctor.hospital}</span>
            <span>⭐ {doctor.rating} ({doctor.reviews} reviews)</span>
            <span>🎓 {doctor.experience} years experience</span>
            <span>📹 Video consultation</span>
          </div>
        </div>

        {/* Fee + action */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 2 }}>Consultation Fee</div>
          <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--gray-900)', marginBottom: 10 }}>
            Rs. {doctor.fee?.toLocaleString()}
          </div>
          <button
            className={`btn ${doctor.available ? 'btn-teal' : 'btn-ghost'}`}
            disabled={!doctor.available}
            onClick={onBook}
            style={{ fontSize: 13 }}
          >
            {doctor.available ? 'Book Appointment' : 'Not Available'}
          </button>
        </div>
      </div>
    </div>
  )
}
