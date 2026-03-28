import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Shield, Plus, Trash2 } from 'lucide-react'

export default function AdminManage() {
  const { user } = useAuth()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' })
  const [saving, setSaving] = useState(false)

  const isSuperAdmin = user?.role === 'superadmin'

  const load = () => {
    if (isSuperAdmin) adminAPI.getAdmins().then(r => setAdmins(r.data.data || [])).catch(() => {}).finally(() => setLoading(false))
    else setLoading(false)
  }
  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await adminAPI.createAdmin(form)
      toast.success('Admin created!')
      setForm({ fullName: '', email: '', password: '', phone: '' })
      setShowForm(false)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this admin account?')) return
    try { await adminAPI.deleteAdmin(id); toast.success('Admin deleted'); load() } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div><h1 className="page-title">Admin Users</h1><p className="page-subtitle">Manage admin accounts</p></div>
        {isSuperAdmin && <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={16} /> Create Admin</button>}
      </div>

      {showForm && isSuperAdmin && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>New Admin</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { label: 'Full Name', key: 'fullName', type: 'text' },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'Password', key: 'password', type: 'password' },
              { label: 'Phone', key: 'phone', type: 'tel' },
            ].map(({ label, key, type }) => (
              <div key={key} className="form-group">
                <label className="form-label">{label}</label>
                <input className="form-input" type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required={key !== 'phone'} />
              </div>
            ))}
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? <span className="spinner" /> : 'Create Admin'}</button>
              <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Shield size={18} color="var(--blue-600)" />
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>Admin Accounts</h3>
        </div>
        {!isSuperAdmin ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>
            <Shield size={40} style={{ margin: '0 auto 12px' }} />
            <p>Only Super Admins can view and manage admin accounts</p>
          </div>
        ) : loading ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          : admins.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}><p>No admin accounts</p></div>
          : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Created</th><th>Actions</th></tr></thead>
                <tbody>
                  {admins.map(a => (
                    <tr key={a._id}>
                      <td style={{ fontWeight: 500 }}>{a.fullName}</td>
                      <td>{a.email}</td>
                      <td><span className={`badge ${a.role === 'superadmin' ? 'badge-blue' : 'badge-gray'}`}>{a.role}</span></td>
                      <td style={{ fontSize: 13 }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                      <td>
                        {a.role !== 'superadmin' && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.userId || a._id)}><Trash2 size={13} /> Delete</button>
                        )}
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
