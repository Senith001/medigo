import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Stethoscope, CheckCircle2, XCircle, Clock, Loader2,
  Mail, Phone, MapPin, GraduationCap, Briefcase, DollarSign,
  Copy, Check, ExternalLink, X, RefreshCw, Search,
  User, ShieldCheck, AlertCircle
} from 'lucide-react'
import { adminAPI } from '../../services/api'
import Button from '../../components/ui/Button'

const STATUS_CONFIG = {
  pending:  { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', label: 'Pending', icon: Clock },
  verified: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', label: 'Verified', icon: CheckCircle2 },
  rejected: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', label: 'Rejected', icon: XCircle },
}

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal state
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const res = await adminAPI.getDoctors()
      if (res.data.success) {
        setDoctors(res.data.data)
      } else {
        setError('Failed to fetch doctors.')
      }
    } catch (err) {
      setError('Error loading doctors. ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDoctors() }, [])

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id)
    try {
      const res = await adminAPI.updateDoctorStatus(id, newStatus)
      if (res.data.success) {
        setDoctors(prev => prev.map(d => d._id === id ? { ...d, status: newStatus } : d))
        if (selectedDoctor?._id === id) {
          setSelectedDoctor(prev => ({ ...prev, status: newStatus }))
        }
      }
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message))
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${config.bg} ${config.text} border ${config.border}`}>
        <Icon size={12} />
        {config.label}
      </span>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-black text-[#008080] uppercase tracking-widest mb-1">Management</p>
          <h1 className="text-3xl font-black text-medigo-navy tracking-tight">
            Doctor <span className="text-[#008080]">Management</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">
            Review and manage doctor verification status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDoctors}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-[#008080] hover:border-[#008080]/30 transition-all shadow-sm text-sm font-bold"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Status Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.entries(STATUS_CONFIG).map(([key, config], i) => {
          const Icon = config.icon
          const count = doctors.filter(d => d.status === key).length
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white rounded-2xl border ${config.border} p-5 shadow-sm flex items-center justify-between`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center ${config.text}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-2xl font-black text-medigo-navy">{count}</p>
                  <p className={`text-[10px] font-black uppercase tracking-wider ${config.text}`}>{config.label}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
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

      {/* Doctors Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 size={32} className="animate-spin text-[#008080] mr-3" />
            <span className="text-sm font-bold">Loading doctors...</span>
          </div>
        ) : doctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Stethoscope size={48} className="mb-4 text-slate-200" />
            <p className="text-sm font-bold">No doctors found in the system.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctor</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialty</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {doctors.map(doctor => (
                  <tr
                    key={doctor._id}
                    onClick={() => setSelectedDoctor(doctor)}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                          {doctor.fullName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-black text-medigo-navy">{doctor.fullName}</p>
                          <p className="text-[10px] text-slate-400">{doctor.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-600">{doctor.specialty}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-500">{doctor.experienceYears} yr{doctor.experienceYears !== 1 ? 's' : ''}</td>
                    <td className="px-6 py-4 text-sm font-black text-medigo-navy">LKR {doctor.consultationFee}</td>
                    <td className="px-6 py-4">{getStatusBadge(doctor.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Doctor Detail Modal */}
      <AnimatePresence>
        {selectedDoctor && (
          <div
            onClick={() => setSelectedDoctor(null)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[2rem] w-full max-w-3xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header - Fixed */}
              <div className="p-8 border-b border-slate-100 shrink-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#008080] text-white flex items-center justify-center text-2xl font-black">
                      {selectedDoctor.fullName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-black text-medigo-navy">{selectedDoctor.fullName}</h3>
                        {getStatusBadge(selectedDoctor.status)}
                      </div>
                      <p className="text-sm text-slate-500">ID: {selectedDoctor.userId || selectedDoctor._id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDoctor(null)}
                    className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                {selectedDoctor.bio && (
                  <p className="mt-4 text-sm text-slate-600 italic bg-slate-50 rounded-xl p-4 border border-slate-100">
                    "{selectedDoctor.bio}"
                  </p>
                )}
              </div>

              {/* Modal Body - Scrollable */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <div className="p-8 space-y-6">
                  {/* Copyable Fields */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Quick Copy Fields</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <CopyableField label="Full Name" value={selectedDoctor.fullName} />
                      <CopyableField label="NIC Number" value={selectedDoctor.nicNumber} />
                      <CopyableField label="SLMC License" value={selectedDoctor.medicalLicenseNumber} />
                      <CopyableField label="Specialty" value={selectedDoctor.specialty} />
                      <CopyableField label="Category" value={selectedDoctor.category} />
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DetailField icon={Mail} label="Email" value={selectedDoctor.email} />
                    <DetailField icon={Phone} label="Phone" value={selectedDoctor.phone} />
                    <DetailField icon={GraduationCap} label="Qualifications" value={selectedDoctor.qualifications} />
                    <DetailField icon={Briefcase} label="Experience" value={`${selectedDoctor.experienceYears} years`} />
                    <DetailField icon={DollarSign} label="Consultation Fee" value={`LKR ${selectedDoctor.consultationFee}`} />
                    <DetailField icon={MapPin} label="Clinic Location" value={selectedDoctor.clinicLocation} />
                  </div>

                  {/* Verification Section */}
                  <div className="border-t border-slate-100 pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Verification Decision</p>
                      <a
                        href="https://slmc.gov.lk/en/public/registers"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[#008080] text-sm font-semibold hover:underline"
                      >
                        Verify via SLMC Registry
                        <ExternalLink size={14} />
                      </a>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(STATUS_CONFIG)
                        .filter(([key]) => key !== 'pending')
                        .map(([key, config]) => {
                          const isActive = selectedDoctor.status === key
                          const isUpdating = updatingId === selectedDoctor._id
                          const Icon = config.icon
                          return (
                            <button
                              key={key}
                              disabled={isActive || isUpdating}
                              onClick={() => handleStatusChange(selectedDoctor._id, key)}
                              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                                isActive
                                  ? `${config.bg} ${config.text} border-2 ${config.border}`
                                  : `bg-white border border-slate-200 text-slate-600 hover:border-${config.text.split('-')[1]}-300 hover:bg-${config.bg.split('-')[1]}-50`
                              } ${isActive || isUpdating ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              {isUpdating && !isActive ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Icon size={16} />
                              )}
                              {isUpdating && !isActive ? 'Processing...' : config.label}
                            </button>
                          )
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DetailField({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-sm font-bold text-medigo-navy">{value || <span className="text-slate-400 font-normal">Not provided</span>}</p>
      </div>
    </div>
  )
}

function CopyableField({ label, value }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopy}
          disabled={!value}
          className={`flex items-center justify-center w-7 h-7 rounded-lg border transition-colors ${
            copied
              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
              : 'bg-white border-slate-200 text-slate-400 hover:border-[#008080] hover:text-[#008080]'
          } ${!value && 'opacity-50 cursor-not-allowed'}`}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
        <p className="text-sm font-bold text-medigo-navy truncate max-w-[120px]">
          {value || <span className="text-slate-400 font-normal">N/A</span>}
        </p>
      </div>
    </div>
  )
}
