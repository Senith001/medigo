import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, User, Mail, Phone, BadgeCheck, Shield, ShieldCheck,
  Plus, X, Loader2, RefreshCw, AlertCircle, CheckCircle2,
  UserCog, Lock, Send, Calendar
} from 'lucide-react'
import { adminAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'

export default function AdminManagement() {
  const { user } = useAuth()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Create admin modal
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '' })
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState(null)

  // Admin detail popup
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMsg, setResendMsg] = useState(null)
  const [resendError, setResendError] = useState(null)

  useEffect(() => { fetchAdmins() }, [])

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await adminAPI.getAdminsList()
      setAdmins(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch admins')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreateError(null)
    setCreateLoading(true)
    try {
      await adminAPI.createAdmin(formData)
      setShowModal(false)
      setFormData({ fullName: '', email: '', phone: '' })
      fetchAdmins()
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create admin')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleToggleStatus = async (adminId, e) => {
    e.stopPropagation()
    try {
      await adminAPI.toggleAdminStatus(adminId)
      fetchAdmins()
      if (selectedAdmin?._id === adminId) {
        setSelectedAdmin(prev => ({ ...prev, isActive: !prev.isActive }))
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle admin status')
    }
  }

  const handleResendInvitation = async () => {
    setResendLoading(true)
    setResendMsg(null)
    setResendError(null)
    try {
      const res = await adminAPI.resendInvitation(selectedAdmin._id)
      setResendMsg(res.data.message)
    } catch (err) {
      setResendError(err.response?.data?.message || 'Failed to resend invitation.')
    } finally {
      setResendLoading(false)
    }
  }

  const openDetail = (admin) => {
    setSelectedAdmin(admin)
    setResendMsg(null)
    setResendError(null)
  }

  const closeDetail = () => setSelectedAdmin(null)

  const needsResend = selectedAdmin && !selectedAdmin.isActive

  const getStatusBadge = (isActive) => (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
      isActive
        ? 'bg-emerald-50 border border-emerald-100 text-emerald-600'
        : 'bg-amber-50 border border-amber-100 text-amber-600'
    }`}>
      {isActive ? <ShieldCheck size={12} /> : <Shield size={12} />}
      {isActive ? 'Active' : 'Pending / Disabled'}
    </span>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-black text-[#008080] uppercase tracking-widest mb-1">Management</p>
          <h1 className="text-3xl font-black text-medigo-navy tracking-tight">
            Admin <span className="text-[#008080]">Management</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">
            View and manage platform administrators
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#008080] hover:bg-[#006666] text-white font-bold rounded-2xl shadow-lg shadow-[#008080]/20 transition-all"
        >
          <Plus size={20} />
          Create Admin
        </button>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-semibold"
        >
          <AlertCircle size={18} />
          {error}
        </motion.div>
      )}

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 size={32} className="animate-spin text-[#008080] mr-3" />
            <span className="text-sm font-bold">Loading admins...</span>
          </div>
        ) : admins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <UserCog size={48} className="mb-4 text-slate-200" />
            <p className="text-sm font-bold">No admins found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Created</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {admins.map(admin => (
                  <tr
                    key={admin._id}
                    onClick={() => openDetail(admin)}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
                          {admin.fullName?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-black text-medigo-navy">{admin.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-500">{admin.email}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-400">{admin.phone || <span className="italic">—</span>}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-400">{new Date(admin.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{getStatusBadge(admin.isActive)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => handleToggleStatus(admin._id, e)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                          admin.isActive
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {admin.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Admin Detail Modal */}
      <AnimatePresence>
        {selectedAdmin && (
          <div
            onClick={closeDetail}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-slate-800 text-white flex items-center justify-center text-xl font-black">
                      {selectedAdmin.fullName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-medigo-navy">{selectedAdmin.fullName}</h3>
                      {getStatusBadge(selectedAdmin.isActive)}
                    </div>
                  </div>
                  <button
                    onClick={closeDetail}
                    className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-6 space-y-1">
                <DetailRow icon={Mail} label="Email" value={selectedAdmin.email} />
                <DetailRow icon={Phone} label="Phone" value={selectedAdmin.phone} />
                <DetailRow icon={BadgeCheck} label="Admin ID" value={selectedAdmin.userId} />
                <DetailRow icon={Calendar} label="Joined" value={new Date(selectedAdmin.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
              </div>

              {/* Actions */}
              <div className="p-6 pt-0 space-y-3">
                {needsResend && (
                  <>
                    <Button
                      onClick={handleResendInvitation}
                      loading={resendLoading}
                      className="w-full h-11 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 font-semibold rounded-xl"
                    >
                      <Send size={16} className="mr-2" />
                      Resend Invitation Email
                    </Button>
                    {resendMsg && (
                      <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold bg-emerald-50 p-3 rounded-xl">
                        <CheckCircle2 size={16} />
                        {resendMsg}
                      </div>
                    )}
                    {resendError && (
                      <div className="flex items-center gap-2 text-red-600 text-sm font-semibold bg-red-50 p-3 rounded-xl">
                        <AlertCircle size={16} />
                        {resendError}
                      </div>
                    )}
                  </>
                )}

                <Button
                  onClick={(e) => handleToggleStatus(selectedAdmin._id, e)}
                  className={`w-full h-11 font-semibold rounded-xl ${
                    selectedAdmin.isActive
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                      : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <Lock size={16} className="mr-2" />
                  {selectedAdmin.isActive ? 'Disable Account' : 'Enable Account'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Admin Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#008080]/10 flex items-center justify-center text-[#008080]">
                      <Plus size={24} />
                    </div>
                    <h2 className="text-xl font-black text-medigo-navy">Create New Admin</h2>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleCreate} className="p-6 space-y-5">
                {createError && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-semibold flex items-center gap-2">
                    <AlertCircle size={16} />
                    {createError}
                  </div>
                )}

                <FormField
                  label="Full Name"
                  icon={User}
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
                <FormField
                  label="Email"
                  icon={Mail}
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <FormField
                  label="Phone"
                  icon={Phone}
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                  <Send size={16} className="text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-blue-600 font-medium">
                    An invitation email will be sent with a link to set up their password.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 h-11 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:border-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    loading={createLoading}
                    className="flex-1 h-11 bg-[#008080] hover:bg-[#006666] text-white font-bold rounded-xl"
                  >
                    Create Admin
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Detail Row Component
function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
          <Icon size={16} />
        </div>
        <span className="text-sm font-bold text-slate-500">{label}</span>
      </div>
      <span className="text-sm font-black text-medigo-navy">{value || <span className="text-slate-400 font-normal">—</span>}</span>
    </div>
  )
}

// Form Field Component
function FormField({ label, icon: Icon, type, required, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon size={18} />
        </div>
        <input
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 text-medigo-navy outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 transition-all text-sm font-semibold placeholder:text-slate-400"
        />
      </div>
    </div>
  )
}
