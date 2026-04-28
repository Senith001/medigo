import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, User, Mail, Phone, MapPin, Calendar, Heart,
  Droplet, AlertCircle, Loader2, RefreshCw, X, Trash2,
  ShieldCheck, Activity, ChevronRight, UserCircle
} from 'lucide-react'
import { adminAPI } from '../../services/api'
import Button from '../../components/ui/Button'

export default function PatientManagement() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getPatients()
      if (response.data.success) {
        setPatients(response.data.data)
      } else {
        setError('Failed to fetch patients list.')
      }
    } catch (err) {
      console.error("Fetch Patients Error:", err)
      setError('Error loading patients. ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const openPatientModal = async (id) => {
    setShowModal(true)
    setModalLoading(true)
    setModalError('')
    setSelectedPatient(null)
    try {
      const res = await adminAPI.getPatientById(id)
      if (res.data.success) {
        setSelectedPatient(res.data.data)
      } else {
        setModalError('Failed to fetch detailed profile.')
      }
    } catch (err) {
      setModalError('Failed to load. ' + (err.response?.data?.message || err.message))
    } finally {
      setModalLoading(false)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedPatient(null)
  }

  const handleDelete = async (id, name, e) => {
    e.stopPropagation()

    if (!window.confirm(`Are you sure you want to permanently delete patient ${name}?`)) {
      return
    }

    try {
      setLoading(true)
      await adminAPI.deletePatient(id)
      setPatients(prev => prev.filter(p => (p._id !== id && p.userId !== id)))
      alert('Patient account deleted successfully.')
    } catch (err) {
      console.error("Delete Patient Error:", err)
      alert('Failed to delete patient. ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-black text-[#008080] uppercase tracking-widest mb-1">Management</p>
          <h1 className="text-3xl font-black text-medigo-navy tracking-tight">
            Patient <span className="text-[#008080]">Management</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">
            View and manage registered patient accounts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-2xl"
          >
            <Users size={18} className="text-blue-600" />
            <span className="text-sm font-black text-blue-600">{patients.length} Patient{patients.length !== 1 ? 's' : ''}</span>
          </motion.div>
          <button
            onClick={fetchPatients}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-[#008080] hover:border-[#008080]/30 transition-all shadow-sm text-sm font-bold"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
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

      {/* Patients Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 size={32} className="animate-spin text-[#008080] mr-3" />
            <span className="text-sm font-bold">Loading patients...</span>
          </div>
        ) : patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <UserCircle size={48} className="mb-4 text-slate-200" />
            <p className="text-sm font-bold">No patients found in the system.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User ID</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {patients.map((patient) => (
                  <tr
                    key={patient._id}
                    onClick={() => openPatientModal(patient.userId)}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                          {patient.fullName?.[0]?.toUpperCase() || <User size={16} />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-medigo-navy">{patient.fullName}</p>
                          <p className="text-[10px] text-slate-400">{patient.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-mono">
                        {patient.userId}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-500">
                      {patient.phone || <span className="text-slate-300 font-normal italic">Not provided</span>}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-500">
                      {new Date(patient.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => handleDelete(patient._id, patient.fullName, e)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Patient Detail Modal */}
      <AnimatePresence>
        {showModal && (
          <div
            onClick={closeModal}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header - Fixed */}
              <div className="p-8 border-b border-slate-100 shrink-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#008080] text-white flex items-center justify-center text-2xl font-black">
                      {selectedPatient?.fullName?.[0]?.toUpperCase() || <User size={28} />}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-medigo-navy">
                        {modalLoading ? 'Loading...' : selectedPatient?.fullName || 'Patient Profile'}
                      </h3>
                      {!modalLoading && selectedPatient && (
                        <p className="text-sm text-slate-500">ID: {selectedPatient.patientId || selectedPatient.userId || 'N/A'}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <div className="p-8">
                  {modalLoading ? (
                    <div className="flex items-center justify-center py-12 text-slate-400">
                      <Loader2 size={32} className="animate-spin text-[#008080] mr-3" />
                      <span className="text-sm font-bold">Retrieving profile...</span>
                    </div>
                  ) : modalError ? (
                    <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-center font-semibold">
                      {modalError}
                    </div>
                  ) : selectedPatient ? (
                    <div className="space-y-6">
                      {/* Status Badge */}
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                          <Activity size={12} />
                          Active Member
                        </span>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <DetailField icon={User} label="Full Name" value={selectedPatient.fullName} />
                        <DetailField icon={Mail} label="Email Address" value={selectedPatient.email} />
                        <DetailField icon={Phone} label="Phone Number" value={selectedPatient.phone} />
                        <DetailField icon={Calendar} label="Date of Birth" value={selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString() : null} />
                        <DetailField icon={UserCircle} label="Gender" value={selectedPatient.gender} />
                        <DetailField icon={Droplet} label="Blood Group" value={selectedPatient.bloodGroup} />
                        <div className="sm:col-span-2">
                          <DetailField icon={MapPin} label="Address" value={selectedPatient.address} />
                        </div>
                      </div>

                      {/* Emergency Contacts */}
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                        <div className="flex items-center gap-2 mb-4">
                          <Heart size={16} className="text-red-500" />
                          <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Emergency Contacts</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <DetailField icon={User} label="Contact Name" value={selectedPatient.emergencyContactName} />
                          <DetailField icon={Phone} label="Contact Phone" value={selectedPatient.emergencyContactPhone} />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Detail Field Component
function DetailField({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-sm font-bold text-medigo-navy">{value || <span className="text-slate-400 font-normal">Not specified</span>}</p>
      </div>
    </div>
  )
}
