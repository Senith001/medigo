import { useState, useEffect } from 'react'
import { doctorAPI, authAPI } from '../../services/api'
import { motion, AnimatePresence } from 'framer-motion'

export default function DoctorsManagement() {
  const [tab, setTab] = useState('active') // 'active' | 'pending'
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)
  const [error, setError] = useState('')

  const fetchDoctors = async () => {
    setLoading(true); setError('')
    try {
      const res = tab === 'active' 
        ? await doctorAPI.getProfiles({ status: 'verified' })
        : await doctorAPI.getPending()
      setDoctors(res.data.data || [])
    } catch (err) {
      setError('Failed to fetch personnel records.')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchDoctors() }, [tab])

  const handleApprove = async (doc) => {
    if (!window.confirm(`Approve Dr. ${doc.fullName} and create their professional account?`)) return
    
    setProcessing(doc._id); setError('')
    try {
      // 1. Create Auth Identity
      const authRes = await authAPI.createInternalUser({
        fullName: doc.fullName,
        email: doc.email,
        phone: doc.phone,
        password: 'Medigo@123', // Default professional password
        role: 'doctor'
      })

      const { userId, _id: authUserId } = authRes.data.data

      // 2. Update Doctor Profile Status
      await doctorAPI.approve(doc._id, {
        status: 'verified',
        userId,
        authUserId
      })

      // 3. Refresh list
      fetchDoctors()
      alert(`Staff Verified: Dr. ${doc.fullName} has been assigned ID ${userId}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Approval orchestration failed.')
    } finally { setProcessing(null) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Terminate this professional profile? This action is permanent.')) return
    try {
      await doctorAPI.delete(id)
      fetchDoctors()
    } catch { setError('Termination failed.') }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-black text-white text-2xl">Clinical Personnel</h1>
          <p className="text-gray-500 text-xs mt-0.5">Manage staff identities and professional credentials</p>
        </div>

        <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800">
          <button onClick={() => setTab('active')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === 'active' ? 'bg-teal-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
            }`}>
            Verified Staff
          </button>
          <button onClick={() => setTab('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              tab === 'pending' ? 'bg-amber-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
            }`}>
            Pending Approvals
            {tab !== 'pending' && doctors.length > 0 && tab === 'active' && (
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
          ⚠️ {error}
        </div>
      )}

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-800" />
                <div className="flex-1 h-12 bg-gray-800 rounded-xl" />
              </div>
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="p-20 text-center">
            <div className="text-5xl mb-4 opacity-20">📂</div>
            <p className="text-gray-500 font-medium">No {tab} clinical profiles found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800/30 text-left border-b border-gray-800">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Practitioner</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Specialty & Fee</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Qualifications</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Experience</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                <AnimatePresence mode="popLayout">
                  {doctors.map(doc => (
                    <motion.tr key={doc._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 font-display font-black flex items-center justify-center border border-teal-500/20">
                            {doc.fullName[0]}
                          </div>
                          <div>
                            <div className="text-white font-bold text-sm">{doc.fullName}</div>
                            <div className="text-gray-500 text-xs">{doc.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-teal-400 text-sm font-bold">{doc.specialty}</div>
                        <div className="text-gray-500 text-xs">Rs. {doc.consultationFee?.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-gray-300 text-xs font-medium max-w-[200px] truncate" title={doc.qualifications}>
                          {doc.qualifications}
                        </div>
                        <div className="text-gray-500 text-[10px] mt-0.5 uppercase tracking-wide">{doc.clinicLocation}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-white text-sm font-bold">{doc.experienceYears}+ Years</div>
                        <div className="text-gray-600 text-[10px] uppercase">Clinical Practice</div>
                      </td>
                      <td className="px-6 py-5">
                        {tab === 'pending' ? (
                          <button onClick={() => handleApprove(doc)} disabled={processing === doc._id}
                            className="btn btn-sm bg-teal-500 text-white hover:bg-teal-400 disabled:opacity-50">
                            {processing === doc._id ? 'Verifying...' : 'Approve Staff'}
                          </button>
                        ) : (
                          <div className="flex items-center gap-4">
                             <div className="text-gray-400 text-[10px] font-mono bg-gray-800 px-2 py-1 rounded border border-gray-700">
                              {doc.userId || 'N/A'}
                            </div>
                            <button onClick={() => handleDelete(doc._id)}
                              className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 italic text-xs font-bold">
                              Terminate
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
