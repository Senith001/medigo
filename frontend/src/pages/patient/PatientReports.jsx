import { useState, useEffect } from 'react'
import { reportAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { Upload, FileText, Trash2, Download } from 'lucide-react'
import { format } from 'date-fns'

export default function PatientReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ title: '', reportType: 'other', description: '' })
  const [file, setFile] = useState(null)

  const load = () => reportAPI.getMy().then(r => setReports(r.data.reports || [])).catch(() => {}).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return toast.error('Please select a file')
    setUploading(true)
    const fd = new FormData()
    fd.append('report', file)
    fd.append('title', form.title || file.name)
    fd.append('reportType', form.reportType)
    fd.append('description', form.description)
    try {
      await reportAPI.upload(fd)
      toast.success('Report uploaded!')
      setForm({ title: '', reportType: 'other', description: '' })
      setFile(null)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed') } finally { setUploading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this report?')) return
    try { await reportAPI.delete(id); toast.success('Deleted'); load() } catch { toast.error('Failed') }
  }

  const reportTypes = ['blood_test','x_ray','mri','ct_scan','ecg','urine_test','other']

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Medical Reports</h1></div>
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24 }}>
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Upload size={16} /> Upload Report</h3>
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">File (PDF/JPG/PNG)</label>
              <input className="form-input" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files?.[0])} required />
            </div>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" type="text" placeholder="Report title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-input" value={form.reportType} onChange={e => setForm(f => ({ ...f, reportType: e.target.value }))}>
                {reportTypes.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={uploading}>{uploading ? <span className="spinner" /> : 'Upload'}</button>
          </form>
        </div>
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>My Reports</h3>
          {loading ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
            : reports.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}><FileText size={40} style={{ margin: '0 auto 12px' }} /><p>No reports uploaded</p></div>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {reports.map(r => (
                  <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 10, border: '1px solid var(--gray-200)' }}>
                    <FileText size={20} color="var(--blue-600)" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{r.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{r.reportType.replace('_',' ')} · {format(new Date(r.createdAt), 'dd MMM yyyy')}</div>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => window.open(`/api/reports/${r._id}/download`)}><Download size={13} /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r._id)}><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
