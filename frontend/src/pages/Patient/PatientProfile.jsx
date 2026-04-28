import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  User, Mail, Phone, MapPin, Calendar, Heart, ShieldCheck,
  KeyRound, Lock, AlertCircle, CheckCircle2, Loader2, ArrowRight,
  CalendarDays, Stethoscope, Trash2, X, ChevronRight, BadgeCheck,
  Droplet, Users, Activity
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { patientAPI, authAPI } from '../../services/api'
import Button from '../../components/ui/Button'

const phoneRegex = /^(0[0-9]{9}|(77|76|74|78|75|71|70)[0-9]{7})$/
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

const validatePatientProfileFields = (data) => {
  const errors = {}

  if (!data.fullName || data.fullName.trim() === '') {
    errors.fullName = 'Name is required'
  } else if (data.fullName.trim().length > 30) {
    errors.fullName = 'Name must not exceed 30 characters'
  } else if (!/^[A-Za-z ]+$/.test(data.fullName.trim())) {
    errors.fullName = 'Name cannot contain special characters or digits'
  }

  if (!data.phone || data.phone.trim() === '') {
    errors.phone = 'Mobile number is required'
  } else if (!phoneRegex.test(data.phone.trim())) {
    errors.phone = 'Invalid mobile number'
  }

  if (data.address && data.address.trim() !== '') {
    if (!/^[A-Za-z0-9/.,\- ]+$/.test(data.address.trim())) {
      errors.address = "Address can only contain letters, numbers, '/', '.', ',' and '-'"
    } else if (data.address.trim().length > 100) {
      errors.address = 'Address must not exceed 100 characters'
    }
  }

  if (data.emergencyContactName && data.emergencyContactName.trim() !== '') {
    if (data.emergencyContactName.trim().length > 30) {
      errors.emergencyContactName = 'Name must not exceed 30 characters'
    } else if (!/^[A-Za-z ]+$/.test(data.emergencyContactName.trim())) {
      errors.emergencyContactName = 'Name cannot contain special characters or digits'
    }
  }

  if (data.emergencyContactPhone && data.emergencyContactPhone.trim() !== '') {
    if (!phoneRegex.test(data.emergencyContactPhone.trim())) {
      errors.emergencyContactPhone = 'Invalid mobile number'
    }
  }

  return errors
}

export default function PatientProfile() {
  const { user, logout } = useAuth() || {}
  const navigate = useNavigate()

  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('profile')

  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [pwdLoading, setPwdLoading] = useState(false)
  const [pwdMessage, setPwdMessage] = useState('')
  const [pwdError, setPwdError] = useState(false)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDeleteOtp, setShowDeleteOtp] = useState(false)
  const [deleteOtp, setDeleteOtp] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const [formData, setFormData] = useState({
    title: 'Mr',
    firstName: '',
    lastName: '',
    fullName: '',
    phone: '',
    email: '',
    gender: '',
    address: '',
    bloodGroup: '',
    dateOfBirth: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    nic: ''
  })

  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    setFieldErrors(validatePatientProfileFields(formData))
  }, [formData])

  const newPasswordValid = passwordRegex.test(pwdForm.newPassword)
  const passwordsMatch = pwdForm.newPassword === pwdForm.confirmPassword
  const canSubmitPassword = pwdForm.currentPassword && pwdForm.newPassword && pwdForm.confirmPassword && newPasswordValid && passwordsMatch && !pwdLoading

  const splitName = (fullName = '') => {
    const parts = fullName.trim().split(/\s+/)
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || ''
    }
  }

  const buildFullName = (firstName, lastName) => {
    return `${firstName || ''} ${lastName || ''}`.trim()
  }

  const mapProfileToForm = (data) => {
    const { firstName, lastName } = splitName(data.fullName || '')

    return {
      title: data.title || 'Mr',
      firstName,
      lastName,
      fullName: data.fullName || '',
      phone: data.phone || '',
      email: data.email || '',
      gender: data.gender || '',
      address: data.address || '',
      bloodGroup: data.bloodGroup || '',
      dateOfBirth: data.dateOfBirth ? String(data.dateOfBirth).split('T')[0] : '',
      emergencyContactName: data.emergencyContactName || '',
      emergencyContactPhone: data.emergencyContactPhone || '',
      nic: data.nic || ''
    }
  }

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await patientAPI.getMyProfile()

      if (response.data?.success) {
        const data = response.data.data
        setProfileData(data)
        setFormData(mapProfileToForm(data))
      } else {
        setError('Failed to fetch profile details.')
      }
    } catch (err) {
      setError('Error loading profile. ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value
      }

      if (name === 'firstName' || name === 'lastName') {
        updated.fullName = buildFullName(
          name === 'firstName' ? value : prev.firstName,
          name === 'lastName' ? value : prev.lastName
        )
      }

      return updated
    })
  }

  const handleUpdate = async () => {
    const errors = validatePatientProfileFields(formData)
    setFieldErrors(errors)

    if (Object.values(errors).some(Boolean)) {
      alert('Please fix validation errors before updating.')
      return
    }

    const updatePayload = {
      title: formData.title,
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      gender: formData.gender,
      address: formData.address.trim(),
      bloodGroup: formData.bloodGroup,
      dateOfBirth: formData.dateOfBirth,
      emergencyContactName: formData.emergencyContactName.trim(),
      emergencyContactPhone: formData.emergencyContactPhone.trim(),
      nic: formData.nic
    }

    try {
      setUpdating(true)

      await patientAPI.updateMyProfile(updatePayload)

      const res = await patientAPI.getMyProfile()
      const updatedProfile = res.data.data

      setProfileData(updatedProfile)
      setFormData(mapProfileToForm(updatedProfile))

      alert('Profile updated successfully!')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Unknown error'
      alert(`Failed to update profile: ${msg}`)
    } finally {
      setUpdating(false)
    }
  }

  const handleReset = () => {
    if (!profileData) return
    setFormData(mapProfileToForm(profileData))
  }

  const requestDeletion = async () => {
    setDeleteLoading(true)
    setDeleteError('')

    try {
      const res = await authAPI.requestDeleteOtp()

      if (res.data.success) {
        setShowDeleteConfirm(false)
        setShowDeleteOtp(true)
      }
    } catch (err) {
      setDeleteError(err.response?.data?.message || err.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  const confirmDeletion = async () => {
    if (!deleteOtp || deleteOtp.length !== 6) return

    setDeleteLoading(true)
    setDeleteError('')

    try {
      const res = await authAPI.deleteMyAccount({ otp: deleteOtp })

      if (res.data.success) {
        logout?.()
        navigate('/login', { replace: true })
      }
    } catch (err) {
      setDeleteError(err.response?.data?.message || err.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()

    setPwdMessage('')
    setPwdError(false)

    if (!passwordRegex.test(pwdForm.newPassword)) {
      setPwdError(true)
      setPwdMessage(
        '❌ Password must be at least 8 characters and contain uppercase, lowercase, number, and special character.'
      )
      return
    }

    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError(true)
      setPwdMessage('❌ New passwords do not match.')
      return
    }

    setPwdLoading(true)

    try {
      const res = await authAPI.changePassword({
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword
      })

      if (res.data.success) {
        setPwdMessage('✅ Password changed successfully.')
        setPwdForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    } catch (err) {
      setPwdError(true)
      setPwdMessage('❌ ' + (err.response?.data?.message || err.message))
    } finally {
      setPwdLoading(false)
    }
  }

  if (loading && !profileData) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-20 text-slate-400">
        <Loader2 size={32} className="animate-spin text-medigo-blue mr-3" />
        <span className="text-sm font-bold">Loading profile...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-center">
        <AlertCircle size={24} className="mx-auto mb-2" />
        {error}
      </div>
    )
  }

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'emergency_contacts', label: 'Emergency Contact', icon: Users },
    { id: 'password', label: 'Change Password', icon: Lock }
  ]

  const hasValidationErrors = Object.values(fieldErrors).some(Boolean)

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 pt-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-400 to-medigo-blue flex items-center justify-center text-white text-3xl font-black shadow-lg">
              {profileData?.fullName?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'P'}
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient Profile</p>
              <h2 className="text-2xl font-black text-medigo-navy">{profileData?.fullName || user?.name || 'Patient'}</h2>
              <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <BadgeCheck size={14} className="text-medigo-blue" />
                  ID: {profileData?.userId || 'Loading...'}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={14} className="text-slate-400" />
                  Joined {new Date(profileData?.createdAt || Date.now()).toLocaleDateString('en-GB', {
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-slate-200 text-slate-600 bg-white shadow-sm h-11"
              onClick={() => navigate('/appointments')}
            >
              <CalendarDays size={18} className="mr-2" /> My Appointments
            </Button>
            <Button
              onClick={() => navigate('/book')}
              className="bg-medigo-blue hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 h-11"
            >
              <Stethoscope size={18} className="mr-2" /> Book Appointment
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'text-medigo-blue border-medigo-blue'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Title */}
              <div className="md:col-span-2">
                <FormLabel>Title</FormLabel>
                <select
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-medigo-navy outline-none focus:border-medigo-blue focus:ring-2 focus:ring-blue-100 transition-all text-sm font-semibold"
                >
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Miss">Miss</option>
                  <option value="Dr">Dr</option>
                </select>
              </div>

              {/* First Name */}
              <div className="md:col-span-5">
                <FormLabel icon={User}>First Name</FormLabel>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-medigo-navy outline-none focus:border-medigo-blue focus:ring-2 focus:ring-blue-100 transition-all text-sm font-semibold"
                />
                {fieldErrors.fullName && <FieldError>{fieldErrors.fullName}</FieldError>}
              </div>

              {/* Last Name */}
              <div className="md:col-span-5">
                <FormLabel>Last Name</FormLabel>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-medigo-navy outline-none focus:border-medigo-blue focus:ring-2 focus:ring-blue-100 transition-all text-sm font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Phone */}
              <div>
                <FormLabel icon={Phone}>Phone</FormLabel>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="0771234567"
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-medigo-navy outline-none focus:border-medigo-blue focus:ring-2 focus:ring-blue-100 transition-all text-sm font-semibold"
                />
                {fieldErrors.phone && <FieldError>{fieldErrors.phone}</FieldError>}
              </div>

              {/* Email */}
              <div>
                <FormLabel icon={Mail}>Email</FormLabel>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full h-12 bg-slate-100 border border-slate-200 rounded-xl px-4 text-slate-400 outline-none cursor-not-allowed text-sm font-semibold"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <FormLabel icon={MapPin}>Address</FormLabel>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-medigo-navy outline-none focus:border-medigo-blue focus:ring-2 focus:ring-blue-100 transition-all text-sm font-semibold"
              />
              {fieldErrors.address && <FieldError>{fieldErrors.address}</FieldError>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Gender */}
              <div>
                <FormLabel>Gender</FormLabel>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-medigo-navy outline-none focus:border-medigo-blue focus:ring-2 focus:ring-blue-100 transition-all text-sm font-semibold"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div>
                <FormLabel icon={Calendar}>Date of Birth</FormLabel>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-medigo-navy outline-none focus:border-medigo-blue focus:ring-2 focus:ring-blue-100 transition-all text-sm font-semibold"
                />
              </div>

              {/* Blood Group */}
              <div>
                <FormLabel icon={Droplet}>Blood Group</FormLabel>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-medigo-navy outline-none focus:border-medigo-blue focus:ring-2 focus:ring-blue-100 transition-all text-sm font-semibold"
                >
                  <option value="">Select</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-100 transition-colors"
              >
                <Trash2 size={16} /> Delete Account
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleReset}
                  disabled={updating}
                  className="h-11 px-6 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Reset
                </button>
                <Button
                  onClick={handleUpdate}
                  disabled={hasValidationErrors || updating}
                  loading={updating}
                  className="h-11 px-6 bg-medigo-blue hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  <CheckCircle2 size={18} className="mr-2" />
                  Update Profile
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'emergency_contacts' && (
          <motion.div
            key="emergency"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FormLabel icon={User}>Contact Name</FormLabel>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-medigo-navy outline-none focus:border-medigo-blue focus:ring-2 focus:ring-blue-100 transition-all text-sm font-semibold"
                />
                {fieldErrors.emergencyContactName && <FieldError>{fieldErrors.emergencyContactName}</FieldError>}
              </div>

              <div>
                <FormLabel icon={Phone}>Contact Phone</FormLabel>
                <input
                  type="text"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleInputChange}
                  placeholder="0771234567"
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-medigo-navy outline-none focus:border-medigo-blue focus:ring-2 focus:ring-blue-100 transition-all text-sm font-semibold"
                />
                {fieldErrors.emergencyContactPhone && <FieldError>{fieldErrors.emergencyContactPhone}</FieldError>}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button
                onClick={handleUpdate}
                disabled={hasValidationErrors || updating}
                loading={updating}
                className="h-11 px-6 bg-medigo-blue hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                <CheckCircle2 size={18} className="mr-2" />
                Save Changes
              </Button>
            </div>
          </motion.div>
        )}

        {activeTab === 'password' && (
          <motion.div
            key="password"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm"
          >
            <form onSubmit={handlePasswordChange} className="max-w-md space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-medigo-blue">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security</p>
                  <h3 className="text-lg font-black text-medigo-navy">Change Password</h3>
                </div>
              </div>

              <PasswordField
                label="Current Password"
                icon={KeyRound}
                value={pwdForm.currentPassword}
                onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
              />

              <PasswordField
                label="New Password"
                icon={Lock}
                value={pwdForm.newPassword}
                onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                error={pwdForm.newPassword && !newPasswordValid}
                helperText={pwdForm.newPassword && !newPasswordValid ? 'Must be 8+ chars with uppercase, lowercase, number, and special char.' : null}
              />

              <PasswordField
                label="Confirm New Password"
                icon={ShieldCheck}
                value={pwdForm.confirmPassword}
                onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                error={pwdForm.confirmPassword && !passwordsMatch}
                success={pwdForm.confirmPassword && passwordsMatch}
                helperText={pwdForm.confirmPassword ? (passwordsMatch ? 'Passwords match' : 'Passwords do not match') : null}
              />

              {pwdMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl flex items-center gap-3 text-sm font-semibold ${
                    pwdError
                      ? 'bg-red-50 border border-red-100 text-red-600'
                      : 'bg-emerald-50 border border-emerald-100 text-emerald-600'
                  }`}
                >
                  {pwdError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                  {pwdMessage}
                </motion.div>
              )}

              <Button
                type="submit"
                loading={pwdLoading}
                disabled={!canSubmitPassword}
                className="w-full h-12 bg-medigo-blue hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {pwdLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    Updating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Update Password
                    <ArrowRight size={18} />
                  </span>
                )}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div
            onClick={() => setShowDeleteConfirm(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-black text-medigo-navy mb-2">Delete Account</h3>
              <p className="text-slate-500 font-medium mb-6">
                Are you sure you want to permanently delete your account? This action cannot be undone.
              </p>

              {deleteError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-semibold mb-4">
                  {deleteError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteError('')
                  }}
                  disabled={deleteLoading}
                  className="flex-1 h-12 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={requestDeletion}
                  disabled={deleteLoading}
                  className="flex-1 h-12 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {deleteLoading ? 'Sending OTP...' : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showDeleteOtp && (
          <div
            onClick={() => setShowDeleteOtp(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mb-4">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-black text-medigo-navy mb-2">Verify Deletion</h3>
              <p className="text-slate-500 font-medium mb-6">
                We've sent a 6-digit code to your email. Enter it below to confirm.
              </p>

              <input
                type="text"
                maxLength="6"
                value={deleteOtp}
                onChange={(e) => setDeleteOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full h-16 bg-slate-50 border border-slate-200 rounded-xl text-center text-2xl font-black tracking-[0.5em] text-medigo-navy outline-none focus:border-medigo-blue focus:ring-2 focus:ring-blue-100 transition-all mb-4"
              />

              {deleteError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-semibold mb-4">
                  {deleteError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteOtp(false)
                    setDeleteOtp('')
                    setDeleteError('')
                  }}
                  disabled={deleteLoading}
                  className="flex-1 h-12 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeletion}
                  disabled={deleteLoading || deleteOtp.length !== 6}
                  className="flex-1 h-12 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {deleteLoading ? 'Verifying...' : 'Confirm Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Helper Components
function FormLabel({ children, icon: Icon }) {
  return (
    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
      <span className="flex items-center gap-2">
        {Icon && <Icon size={14} className="text-slate-400" />}
        {children}
      </span>
    </label>
  )
}

function FieldError({ children }) {
  return (
    <p className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1">
      <AlertCircle size={12} />
      {children}
    </p>
  )
}

function PasswordField({ label, icon: Icon, value, onChange, error, success, helperText }) {
  return (
    <div className="space-y-2">
      <FormLabel icon={Icon}>{label}</FormLabel>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon size={18} />
        </div>
        <input
          type="password"
          value={value}
          onChange={onChange}
          required
          className={`w-full h-12 bg-slate-50 border rounded-xl pl-12 pr-4 text-medigo-navy outline-none focus:ring-2 transition-all text-sm font-semibold ${
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
              : success
              ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100'
              : 'border-slate-200 focus:border-medigo-blue focus:ring-blue-100'
          }`}
        />
      </div>
      {helperText && (
        <p className={`text-xs font-medium flex items-center gap-1 ${
          error ? 'text-red-500' : success ? 'text-emerald-600' : 'text-slate-400'
        }`}>
          {error ? <AlertCircle size={12} /> : success ? <CheckCircle2 size={12} /> : null}
          {helperText}
        </p>
      )}
    </div>
  )
}

const containerStyle = {
  maxWidth: '1100px',
  margin: '0 auto',
  background: '#ffffff',
  padding: '3rem',
  borderRadius: '12px',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
}

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '2.5rem'
}

const avatarStyle = {
  width: '100px',
  height: '100px',
  borderRadius: '50%',
  backgroundColor: '#3b82f6',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '3rem',
  fontWeight: '500'
}

const nameStyle = {
  margin: 0,
  textTransform: 'uppercase',
  color: '#1e293b',
  fontSize: '1.5rem',
  fontWeight: '600',
  letterSpacing: '0.5px'
}

const mutedTextStyle = {
  margin: '0.4rem 0',
  color: '#94a3b8',
  fontSize: '0.9rem'
}

const tabWrapperStyle = {
  display: 'flex',
  borderBottom: '1px solid #e2e8f0',
  marginBottom: '2.5rem',
  gap: '2rem'
}

const tabButtonStyle = {
  padding: '0 0 1rem 0',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '0.95rem',
  marginBottom: '-1px',
  transition: 'all 0.2s ease'
}

const labelStyle = {
  display: 'block',
  fontSize: '0.85rem',
  color: '#64748b',
  marginBottom: '0.4rem',
  fontWeight: '400'
}

const inputStyle = {
  boxSizing: 'border-box',
  width: '100%',
  borderRadius: '6px',
  padding: '0.6rem 0.8rem',
  color: '#334155',
  border: '1px solid #e2e8f0',
  backgroundColor: '#ffffff',
  outline: 'none',
  fontSize: '0.95rem'
}

const disabledInputStyle = {
  ...inputStyle,
  backgroundColor: '#f8fafc',
  color: '#94a3b8',
  cursor: 'not-allowed'
}

const errorStyle = {
  color: '#ef4444',
  fontSize: '0.8rem',
  marginTop: '0.3rem'
}

const outlineButtonStyle = {
  background: '#ffffff',
  color: '#3b82f6',
  border: '1px solid #3b82f6',
  borderRadius: '6px',
  padding: '0.6rem 1.2rem',
  fontSize: '0.9rem',
  cursor: 'pointer'
}

const primaryButtonStyle = {
  background: '#3b82f6',
  color: '#ffffff',
  border: 'none',
  borderRadius: '6px',
  padding: '0.6rem 1.2rem',
  fontSize: '0.9rem',
  cursor: 'pointer'
}

const dangerButtonStyle = {
  background: '#b4534f',
  color: '#ffffff',
  borderRadius: '6px',
  padding: '0.6rem 1.5rem',
  border: 'none',
  cursor: 'pointer'
}

const secondaryButtonStyle = {
  background: '#9ca3af',
  color: '#ffffff',
  borderRadius: '6px',
  padding: '0.6rem 2rem',
  border: 'none',
  cursor: 'pointer'
}

const saveButtonStyle = {
  background: '#4fa3e4',
  color: '#ffffff',
  borderRadius: '6px',
  padding: '0.6rem 2rem',
  border: 'none'
}

const passwordFormStyle = {
  maxWidth: '500px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem'
}

const modalOverlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(15,23,42,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
}

const modalBoxStyle = {
  background: '#fff',
  padding: '2rem',
  borderRadius: '12px',
  maxWidth: '400px',
  width: '100%',
  textAlign: 'center'
}

const modalTitleStyle = {
  margin: '0 0 1rem 0',
  color: '#1e293b'
}

const modalTextStyle = {
  margin: '0 0 1.5rem 0',
  color: '#64748b',
  fontSize: '0.95rem'
}

const deleteErrorStyle = {
  color: '#ef4444',
  fontSize: '0.85rem',
  marginBottom: '1rem'
}

const modalCancelButtonStyle = {
  flex: 1,
  padding: '0.75rem',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#475569',
  cursor: 'pointer'
}

const modalDangerButtonStyle = {
  flex: 1,
  padding: '0.75rem',
  borderRadius: '6px',
  border: 'none',
  background: '#ef4444',
  color: '#fff',
  cursor: 'pointer'
}

const otpInputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '0.75rem',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  fontSize: '1.5rem',
  textAlign: 'center',
  letterSpacing: '0.5rem',
  marginBottom: '1rem',
  outline: 'none'
}