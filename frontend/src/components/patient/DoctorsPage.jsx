import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Star, MapPin, Stethoscope } from 'lucide-react'
import { doctorAPI } from '../../services/api'
import Header from '../../components/common/Header'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState({ specialty:'', name:'' })
  const navigate = useNavigate()

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const res = await doctorAPI.search({ specialty: search.specialty, name: search.name })
      setDoctors(res.data.doctors || [])
    } catch { setDoctors([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchDoctors() }, [])

  const specialties = [...new Set(doctors.map(d => d.specialty).filter(Boolean))]

  return (
    <div>
      <Header title="Find a Doctor" subtitle="Browse verified healthcare professionals" />

      <div style={{display:'flex',gap:12,marginBottom:24}}>
        <Input placeholder="Search by name..." value={search.name} onChange={e=>setSearch(s=>({...s,name:e.target.value}))} icon={Search} style={{flex:1}} />
        <select value={search.specialty} onChange={e=>setSearch(s=>({...s,specialty:e.target.value}))}
          style={{padding:'10px 14px',border:'1.5px solid var(--gray-200)',borderRadius:'var(--radius)',fontSize:14,background:'var(--white)',color:'var(--gray-700)',minWidth:180}}>
          <option value="">All Specialties</option>
          {specialties.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <Button onClick={fetchDoctors} icon={Search}>Search</Button>
      </div>

      {loading ? (
        <div style={{display:'flex',justifyContent:'center',paddingTop:60}}><Spinner size={36}/></div>
      ) : doctors.length === 0 ? (
        <EmptyState icon={Stethoscope} title="No doctors found" message="Try adjusting your search filters" />
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
          {doctors.map(d => (
            <div key={d._id} style={{background:'var(--white)',borderRadius:'var(--radius-lg)',padding:20,border:'1px solid var(--gray-100)',boxShadow:'var(--shadow-sm)',transition:'box-shadow .2s'}}
              onMouseEnter={e=>e.currentTarget.style.boxShadow='var(--shadow)'}
              onMouseLeave={e=>e.currentTarget.style.boxShadow='var(--shadow-sm)'}
            >
              <div style={{display:'flex',gap:14,alignItems:'flex-start',marginBottom:14}}>
                <div style={{width:52,height:52,borderRadius:'50%',background:'var(--primary-light)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:600,color:'var(--primary)',flexShrink:0}}>
                  {d.fullName?.[0] || 'D'}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,color:'var(--gray-800)',fontSize:15,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>Dr. {d.fullName}</div>
                  <div style={{fontSize:13,color:'var(--primary)',marginTop:2}}>{d.specialty}</div>
                  {d.hospital && <div style={{fontSize:12,color:'var(--gray-400)',marginTop:2,display:'flex',alignItems:'center',gap:4}}><MapPin size={11}/>{d.hospital}</div>}
                </div>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,padding:'10px 0',borderTop:'1px solid var(--gray-100)',borderBottom:'1px solid var(--gray-100)'}}>
                <div style={{display:'flex',alignItems:'center',gap:4,fontSize:13,color:'var(--warning)'}}>
                  <Star size={13} fill="currentColor"/><span style={{color:'var(--gray-600)'}}>{d.rating?.toFixed(1) || '0.0'}</span>
                </div>
                <div style={{fontSize:13,color:'var(--gray-500)'}}>{d.experience || 0} yrs exp</div>
                <div style={{fontSize:14,fontWeight:600,color:'var(--primary)'}}>LKR {d.fee?.toLocaleString() || 0}</div>
              </div>
              {d.bio && <p style={{fontSize:12,color:'var(--gray-500)',lineHeight:1.6,marginBottom:14,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{d.bio}</p>}
              <Button style={{width:'100%',justifyContent:'center'}} size="sm" onClick={()=>navigate(`/patient/doctors/${d._id}/book`)}>
                Book Appointment
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
