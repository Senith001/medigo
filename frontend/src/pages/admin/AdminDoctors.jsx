import { useState, useEffect } from 'react'
import { doctorAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { Stethoscope, CheckCircle, ToggleLeft, ToggleRight, Search } from 'lucide-react'

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterVerified, setFilterVerified] = useState('')

  const load = () => doctorAPI.adminGetAll().then(r => { const d = r.data.doctors || []; setDoctors(d); setFiltered(d) }).catch(() => {}).finally(() => setLoading(false))
  useEffect(() => { load() }, [])
  useEffect(() => {
    let d = doctors
    if (search) d = d.filter(doc => doc.fullName?.toLowerCase().includes(search.toLowerCase()) || doc.specialty?.toLowerCase().includes(search.toLowerCase()))
    if (filterVerified !== '') d = d.filter(doc => doc.isVerified === (filterVerified === 'true'))
    setFiltered(d)
  }, [search, filterVerified, doctors])

  const handleVerify = async (id) => {
    try { await doctorAPI.verify(id); toast.success('Doctor verified!'); load() } catch { toast.error('Failed') }
  }
  const handleToggle = async (id) => {
    try { await doctorAPI.toggle(id); load() } catch { toast.error('Failed') }
  }

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Doctors</h1><p className="page-subtitle">{doctors.length} registered doctors</p></div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
          <input className="form-input" placeholder="Search doctors..." style={{ paddingLeft: 38, width: '100%' }} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input" style={{ width: 160 }} value={filterVerified} onChange={e => setFilterVerified(e.target.value)}>
          <option value="">All Doctors</option>
          <option value="true">Verified</option>
          <option value="false">Pending</option>
        </select>
      </div>
      <div className="card">
        {loading ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          : filtered.length === 0 ? <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-400)' }}><Stethoscope size={40} style={{ margin: '0 auto 12px' }} /><p>No doctors found</p></div>
          : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Doctor</th><th>Specialty</th><th>Hospital</th><th>Fee</th><th>Verified</th><th>Active</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(d => (
                    <tr key={d._id}>
                      <td><div style={{ fontWeight: 500 }}>Dr. {d.fullName}</div><div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{d.email}</div></td>
                      <td>{d.specialty}</td>
                      <td style={{ fontSize: 13 }}>{d.hospital || '—'}</td>
                      <td style={{ fontWeight: 600 }}>LKR {d.fee}</td>
                      <td><span className={`badge ${d.isVerified ? 'badge-green' : 'badge-amber'}`}>{d.isVerified ? 'Yes' : 'Pending'}</span></td>
                      <td><span className={`badge ${d.isActive ? 'badge-blue' : 'badge-gray'}`}>{d.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {!d.isVerified && <button className="btn btn-success btn-sm" onClick={() => handleVerify(d._id)}><CheckCircle size={13} /> Verify</button>}
                          <button className="btn btn-secondary btn-sm" onClick={() => handleToggle(d._id)}>
                            {d.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />} {d.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
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
