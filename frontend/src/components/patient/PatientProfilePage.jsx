import { useState, useEffect } from 'react'
import { Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import { patientAPI } from '../../services/api'
import Header from '../../components/common/Header'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Spinner from '../../components/common/Spinner'

export default function PatientProfilePage() {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    patientAPI.me().then(r => { setProfile(r.data.data); setForm(r.data.data) }).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await patientAPI.update(form)
      setProfile(res.data.data)
      toast.success('Profile updated!')
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed') }
    finally { setSaving(false) }
  }

  const handlePicUpload = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await patientAPI.uploadPic(file)
      setProfile(p => ({ ...p, profilePicture: res.data.profilePicture }))
      toast.success('Photo updated!')
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  if (loading) return <div style={{display:'flex',justifyContent:'center',paddingTop:80}}><Spinner size={36}/></div>

  return (
    <div>
      <Header title="My Profile" subtitle="Manage your personal information" />
      <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:24,alignItems:'start'}}>
        <Card style={{textAlign:'center'}}>
          <div style={{position:'relative',display:'inline-block',marginBottom:16}}>
            <div style={{width:90,height:90,borderRadius:'50%',background:'var(--primary-light)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,fontWeight:600,color:'var(--primary)',margin:'0 auto',overflow:'hidden'}}>
              {profile?.profilePicture
                ? <img src={`http://localhost:5001/${profile.profilePicture}`} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                : profile?.fullName?.[0]}
            </div>
            <label style={{position:'absolute',bottom:0,right:0,width:28,height:28,borderRadius:'50%',background:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',border:'2px solid var(--white)'}}>
              <Camera size={13} color="#fff" />
              <input type="file" accept="image/*" style={{display:'none'}} onChange={handlePicUpload} />
            </label>
          </div>
          <div style={{fontWeight:600,color:'var(--gray-800)'}}>{profile?.fullName}</div>
          <div style={{fontSize:13,color:'var(--gray-400)',marginTop:4}}>{profile?.userId}</div>
          <div style={{fontSize:13,color:'var(--gray-500)',marginTop:4,wordBreak:'break-all'}}>{profile?.email}</div>
          {uploading && <div style={{marginTop:8,fontSize:12,color:'var(--primary)'}}>Uploading…</div>}
        </Card>

        <Card>
          <h2 style={{fontSize:16,fontWeight:600,color:'var(--gray-800)',marginBottom:20}}>Personal Information</h2>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <Input label="Full Name" value={form.fullName||''} onChange={set('fullName')} />
            <Input label="Phone" value={form.phone||''} onChange={set('phone')} />
            <div>
              <label style={{fontSize:13,fontWeight:500,color:'var(--gray-700)',display:'block',marginBottom:6}}>Gender</label>
              <select value={form.gender||''} onChange={set('gender')} style={{width:'100%',padding:'10px 12px',border:'1.5px solid var(--gray-200)',borderRadius:'var(--radius)',fontSize:14,background:'var(--white)'}}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <Input label="Date of Birth" type="date" value={form.dateOfBirth||''} onChange={set('dateOfBirth')} />
            <Input label="Blood Group" value={form.bloodGroup||''} onChange={set('bloodGroup')} placeholder="e.g. A+" />
            <Input label="Address" value={form.address||''} onChange={set('address')} />
            <Input label="Emergency Contact Name" value={form.emergencyContactName||''} onChange={set('emergencyContactName')} />
            <Input label="Emergency Contact Phone" value={form.emergencyContactPhone||''} onChange={set('emergencyContactPhone')} />
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',marginTop:20}}>
            <Button loading={saving} onClick={handleSave}>Save Changes</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
