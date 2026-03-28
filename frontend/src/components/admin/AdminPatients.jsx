import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { Users, Trash2, Search } from 'lucide-react'

export default function AdminPatients() {
  const [patients, setPatients] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = () => adminAPI.getPatients().then(r => { const d = r.data.data || []; setPatients(d); setFiltered(d) }).catch(() => {}).finally(() => setLoading(false))
  useEffect(() => { load() }, [])
  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(patients.filter(p => p.fullName?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q) || p.userId?.toLowerCase().includes(q)))
  }, [search, patients])

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this patient account?')) return
    try { await adminAPI.deletePatient(id); toast.success('Patient deleted'); load() } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Patients</h1>
        <p className="page-subtitle">{patients.length} registered patients</p>
      </div>
      <div style={{ marginBottom: 16, position: 'relative', maxWidth: 360 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
        <input className="form-input" placeholder="Search patients..." style={{ paddingLeft: 38, width: '100%' }} value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="card">
        {loading ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          : filtered.length === 0 ? <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-400)' }}><Users size={40} style={{ margin: '0 auto 12px' }} /><p>No patients found</p></div>
          : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Patient</th><th>ID</th><th>Phone</th><th>Blood Group</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p._id}>
                      <td><div style={{ fontWeight: 500 }}>{p.fullName}</div><div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{p.email}</div></td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.userId}</td>
                      <td>{p.phone || '—'}</td>
                      <td>{p.bloodGroup || '—'}</td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.userId || p._id)}><Trash2 size={13} /> Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  )
}
