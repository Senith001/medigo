import { useState, useEffect } from 'react'
import { Upload, FileText, Trash2, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { reportAPI } from '../../services/api'
import Header from '../../components/common/Header'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'
import { format } from 'date-fns'

export default function ReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title:'', reportType:'other', description:'' })
  const [file, setFile] = useState(null)

  const fetchReports = async () => {
    setLoading(true)
    try { const r = await reportAPI.mine(); setReports(r.data.reports||[]) }
    catch {} finally { setLoading(false) }
  }
  useEffect(() => { fetchReports() }, [])

  const handleUpload = async () => {
    if (!file) return toast.error('Select a file')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('report', file)
      fd.append('title', form.title || file.name)
      fd.append('reportType', form.reportType)
      fd.append('description', form.description)
      await reportAPI.upload(fd)
      toast.success('Report uploaded!')
      setShowForm(false); setFile(null); setForm({ title:'', reportType:'other', description:'' })
      fetchReports()
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed') }
    finally { setUploading(false) }
  }

  const handleDelete = async id => {
    if (!window.confirm('Delete this report?')) return
    try { await reportAPI.delete(id); toast.success('Deleted'); fetchReports() }
    catch { toast.error('Delete failed') }
  }

  const reportTypes = ['blood_test','x_ray','mri','ct_scan','ecg','urine_test','other']

  return (
    <div>
      <Header title="Medical Reports" subtitle="Upload and manage your health documents"
        actions={<Button icon={Upload} onClick={()=>setShowForm(s=>!s)}>{showForm?'Cancel':'Upload Report'}</Button>} />

      {showForm && (
        <div style={{background:'var(--white)',borderRadius:'var(--radius-lg)',padding:24,border:'1px solid var(--gray-100)',marginBottom:20,display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          <div>
            <label style={{fontSize:13,fontWeight:500,color:'var(--gray-700)',display:'block',marginBottom:6}}>Title</label>
            <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Blood Test Results"
              style={{width:'100%',padding:'10px 12px',border:'1.5px solid var(--gray-200)',borderRadius:'var(--radius)',fontSize:14,outline:'none'}} />
          </div>
          <div>
            <label style={{fontSize:13,fontWeight:500,color:'var(--gray-700)',display:'block',marginBottom:6}}>Type</label>
            <select value={form.reportType} onChange={e=>setForm(f=>({...f,reportType:e.target.value}))}
              style={{width:'100%',padding:'10px 12px',border:'1.5px solid var(--gray-200)',borderRadius:'var(--radius)',fontSize:14,background:'var(--white)'}}>
              {reportTypes.map(t=><option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
            </select>
          </div>
          <div style={{gridColumn:'1/-1'}}>
            <label style={{fontSize:13,fontWeight:500,color:'var(--gray-700)',display:'block',marginBottom:6}}>File (PDF, JPG, PNG)</label>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e=>setFile(e.target.files?.[0]||null)}
              style={{fontSize:13,color:'var(--gray-600)'}} />
          </div>
          <div style={{gridColumn:'1/-1',display:'flex',justifyContent:'flex-end'}}>
            <Button icon={Upload} loading={uploading} onClick={handleUpload}>Upload</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{display:'flex',justifyContent:'center',paddingTop:60}}><Spinner size={36}/></div>
      ) : reports.length === 0 ? (
        <EmptyState icon={FileText} title="No reports yet" message="Upload your medical documents to keep them organized" />
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {reports.map(r => (
            <div key={r._id} style={{background:'var(--white)',borderRadius:'var(--radius-lg)',padding:18,border:'1px solid var(--gray-100)',display:'flex',alignItems:'center',justifyContent:'space-between',gap:16}}>
              <div style={{display:'flex',gap:14,alignItems:'center',flex:1,minWidth:0}}>
                <div style={{width:40,height:40,borderRadius:10,background:'var(--primary-light)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <FileText size={18} color="var(--primary)" />
                </div>
                <div style={{minWidth:0}}>
                  <div style={{fontWeight:500,color:'var(--gray-800)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{r.title}</div>
                  <div style={{fontSize:12,color:'var(--gray-400)',marginTop:2}}>{format(new Date(r.createdAt),'dd MMM yyyy')} · {r.mimeType} · {(r.fileSize/1024).toFixed(1)} KB</div>
                </div>
              </div>
              <div style={{display:'flex',gap:8,alignItems:'center',flexShrink:0}}>
                <Badge label={r.reportType?.replace(/_/g,' ')} />
                <button onClick={()=>handleDelete(r._id)} style={{width:32,height:32,borderRadius:'var(--radius-sm)',border:'1px solid var(--gray-200)',background:'var(--white)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'var(--danger)'}}>
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
