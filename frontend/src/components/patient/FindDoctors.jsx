import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { doctorAPI } from '../../services/api'
import { Search, Star, MapPin, Stethoscope } from 'lucide-react'

export default function FindDoctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState('')
  const navigate = useNavigate()

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (specialty) params.specialty = specialty
      const r = search
        ? await doctorAPI.search({ specialty: search, name: search })
        : await doctorAPI.getAll(params)
      setDoctors(r.data.doctors || [])
    } catch { setDoctors([]) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [specialty])

  const specialties = ['Cardiology','Dermatology','General','Neurology','Orthopedics','Pediatrics','Psychiatry']

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Find a Doctor</h1>
        <p className="page-subtitle">Browse verified healthcare professionals</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
          <input className="form-input" placeholder="Search by name or specialty..." style={{ paddingLeft: 38, width: '100%' }}
            value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} />
        </div>
        <button className="btn btn-primary" onClick={load}>Search</button>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        <button className={`btn btn-sm ${!specialty ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSpecialty('')}>All</button>
        {specialties.map(s => (
          <button key={s} className={`btn btn-sm ${specialty === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSpecialty(s)}>{s}</button>
        ))}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        : doctors.length === 0 ? <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-400)' }}><Stethoscope size={40} style={{ margin: '0 auto 12px' }} /><p>No doctors found</p></div>
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {doctors.map(doc => (
              <div key={doc._id} className="card" style={{ cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'none' }}
                onClick={() => navigate(`/patient/book/${doc._id}`)}>
                <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--blue-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'var(--blue-700)', flexShrink: 0 }}>
                    {doc.fullName?.[0] || 'D'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>Dr. {doc.fullName}</div>
                    <div style={{ fontSize: 13, color: 'var(--blue-600)', marginTop: 2 }}>{doc.specialty}</div>
                    {doc.hospital && <div style={{ fontSize: 12, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}><MapPin size={12} />{doc.hospital}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--gray-600)' }}>
                    <Star size={13} color="#f59e0b" fill="#f59e0b" />{doc.rating?.toFixed(1) || '0.0'} · {doc.experience || 0} yrs exp
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--blue-700)', fontSize: 15 }}>LKR {doc.fee || 0}</div>
                </div>
                <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                  {doc.consultationType?.map(t => <span key={t} className="badge badge-blue" style={{ fontSize: 11 }}>{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  )
}
