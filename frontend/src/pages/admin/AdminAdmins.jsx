import { useState, useEffect } from 'react'
import { Shield, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminAPI } from '../../services/api'
import Header from '../../components/common/Header'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Spinner from '../../components/common/Spinner'

export default function AdminAdmins() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ fullName:'', email:'', password:'', phone:'' })
  const [creating, setCreating] = useState(false)
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}))

  const fetchAdmins = async () => {
    setLoading(true)
    try { const r = await adminAPI.listAdmins(); setAdmins(r.data.data||[]) }
    catch {} finally { setLoading(false) }
  }
  useEffect(()=>{ fetchAdmins() },[])

  const handleCreate = async () => {
    setCreating(true)
    try { await adminAPI.createAdmin(form); toast.success('Admin created!'); setShowForm(false); setForm({fullName:'',email:'',password:'',phone:''}); fetchAdmins() }
    catch (err) { toast.error(err.response?.data?.message||'Failed') }
    finally { setCreating(false) }
  }

  const handleDelete = async id => {
    if (!window.confirm('Delete this admin?')) return
    try { await adminAPI.deleteAdmin(id); toast.success('Deleted'); fetchAdmins() }
    catch (err) { toast.error(err.response?.data?.message||'Failed') }
  }

  return (
    <div>
      <Header title="Admins" subtitle="Manage admin accounts"
        actions={<Button icon={Plus} onClick={()=>setShowForm(s=>!s)}>{showForm?'Cancel':'Add Admin'}</Button>} />

      {showForm && (
        <div style={{background:'var(--white)',borderRadius:'var(--radius-lg)',padding:24,border:'1px solid var(--gray-100)',marginBottom:20,display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          <Input label="Full Name" value={form.fullName} onChange={set('fullName')} />
          <Input label="Email" type="email" value={form.email} onChange={set('email')} />
          <Input label="Password" type="password" value={form.password} onChange={set('password')} />
          <Input label="Phone" value={form.phone} onChange={set('phone')} />
          <div style={{gridColumn:'1/-1',display:'flex',justifyContent:'flex-end'}}>
            <Button loading={creating} onClick={handleCreate}>Create Admin</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{display:'flex',justifyContent:'center',paddingTop:60}}><Spinner size={36}/></div>
      ) : (
        <div style={{background:'var(--white)',borderRadius:'var(--radius-lg)',border:'1px solid var(--gray-100)',overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'var(--gray-50)',borderBottom:'1px solid var(--gray-100)'}}>
                {['Admin','Email','Role',''].map(h=>(
                  <th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:12,fontWeight:600,color:'var(--gray-500)',textTransform:'uppercase',letterSpacing:.5}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {admins.map(a=>(
                <tr key={a._id} style={{borderBottom:'1px solid var(--gray-100)'}}>
                  <td style={{padding:'14px 16px'}}>
                    <div style={{fontWeight:500,color:'var(--gray-800)'}}>{a.fullName}</div>
                    <div style={{fontSize:12,color:'var(--gray-400)'}}>{a.userId}</div>
                  </td>
                  <td style={{padding:'14px 16px',fontSize:13,color:'var(--gray-600)'}}>{a.email}</td>
                  <td style={{padding:'14px 16px'}}><Badge label={a.role}/></td>
                  <td style={{padding:'14px 16px'}}>
                    {a.role!=='superadmin'&&(
                      <button onClick={()=>handleDelete(a._id)} style={{width:32,height:32,borderRadius:'var(--radius-sm)',border:'1px solid var(--gray-200)',background:'var(--white)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'var(--danger)'}}>
                        <Trash2 size={14}/>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
