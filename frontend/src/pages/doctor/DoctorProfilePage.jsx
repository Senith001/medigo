import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { doctorAPI } from '../../services/api'
import Header from '../../components/common/Header'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Spinner from '../../components/common/Spinner'

export default function DoctorProfilePage() {
  const [doctor, setDoctor] = useState(null)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  useEffect(()=>{
    doctorAPI.me().then(r=>{ setDoctor(r.data.doctor); setForm(r.data.doctor) }).catch(()=>{}).finally(()=>setLoading(false))
  },[])

  const handleSave = async () => {
    setSaving(true)
    try {
      const r = await doctorAPI.updateMe(form)
      setDoctor(r.data.doctor)
      toast.success('Profile updated!')
    } catch (err) { toast.error(err.response?.data?.message||'Failed') }
    finally { setSaving(false) }
  }

  if (loading) return <div style={{display:'flex',justifyContent:'center',paddingTop:80}}><Spinner size={36}/></div>

  return (
    <div>
      <Header title="My Profile" subtitle="Manage your professional information" />
      <Card>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <Input label="Full Name" value={form.fullName||''} onChange={set('fullName')} />
          <Input label="Phone" value={form.phone||''} onChange={set('phone')} />
          <Input label="Specialty" value={form.specialty||''} onChange={set('specialty')} />
          <Input label="Hospital" value={form.hospital||''} onChange={set('hospital')} />
          <Input label="Experience (years)" type="number" value={form.experience||0} onChange={set('experience')} />
          <Input label="Consultation Fee (LKR)" type="number" value={form.fee||0} onChange={set('fee')} />
          <Input label="SLMC Number" value={form.slmcNumber||''} onChange={set('slmcNumber')} />
          <Input label="Qualifications" value={form.qualifications||''} onChange={set('qualifications')} />
          <div style={{gridColumn:'1/-1'}}>
            <label style={{fontSize:13,fontWeight:500,color:'var(--gray-700)',display:'block',marginBottom:6}}>Bio</label>
            <textarea value={form.bio||''} onChange={set('bio')} rows={3}
              style={{width:'100%',padding:'10px 12px',border:'1.5px solid var(--gray-200)',borderRadius:'var(--radius)',fontSize:14,resize:'vertical',fontFamily:'var(--font)',outline:'none'}} />
          </div>
        </div>
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:20}}>
          <Button loading={saving} onClick={handleSave}>Save Changes</Button>
        </div>
      </Card>
    </div>
  )
}
