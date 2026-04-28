import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { patientAPI, authAPI } from '../../services/api'
import { useNavigate } from 'react-router-dom'

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
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>
  }

  if (error) {
    return <div style={{ padding: '2rem', color: 'red', textAlign: 'center' }}>{error}</div>
  }

  const tabs = [
    { id: 'profile', label: 'My Profile' },
    { id: 'emergency_contacts', label: 'Emergency Contact Numbers' },
    { id: 'password', label: 'Change Password' }
  ]

  const hasValidationErrors = Object.values(fieldErrors).some(Boolean)

  const isPasswordInvalid =
    !pwdForm.newPassword ||
    !passwordRegex.test(pwdForm.newPassword) ||
    pwdForm.confirmPassword !== pwdForm.newPassword

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '2rem' }}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={avatarStyle}>
              {profileData?.fullName?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'P'}
            </div>

            <div>
              <h2 style={nameStyle}>{profileData?.fullName || user?.name || 'Patient'}</h2>
              <p style={mutedTextStyle}>Member ID : {profileData?.userId || 'Loading...'}</p>
              <p style={mutedTextStyle}>
                Registered :{' '}
                {new Date(profileData?.createdAt || Date.now()).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button style={outlineButtonStyle} onClick={() => navigate('/appointments')}>
              My Appointment
            </button>

            <button style={primaryButtonStyle} onClick={() => navigate('/book')}>
              Make An Appointment
            </button>
          </div>
        </div>

        <div style={tabWrapperStyle}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...tabButtonStyle,
                color: activeTab === tab.id ? '#3b82f6' : '#64748b',
                borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                fontWeight: activeTab === tab.id ? '500' : '400'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(100px, 1fr) 3fr 3fr', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Title</label>
                <select name="title" value={formData.title} onChange={handleInputChange} style={inputStyle}>
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Miss">Miss</option>
                  <option value="Dr">Dr</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
                {fieldErrors.fullName && <div style={errorStyle}>{fieldErrors.fullName}</div>}
              </div>

              <div>
                <label style={labelStyle}>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="0771234567"
                  style={inputStyle}
                />
                {fieldErrors.phone && <div style={errorStyle}>{fieldErrors.phone}</div>}
              </div>

              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" name="email" value={formData.email} style={disabledInputStyle} disabled />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                style={inputStyle}
              />
              {fieldErrors.address && <div style={errorStyle}>{fieldErrors.address}</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} style={inputStyle}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Blood Group</label>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} style={inputStyle}>
                  <option value="">Select</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <button style={dangerButtonStyle} onClick={() => setShowDeleteConfirm(true)}>
                Account Delete
              </button>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button style={secondaryButtonStyle} onClick={handleReset} disabled={updating}>
                  Reset
                </button>

                <button
                  style={{
                    ...saveButtonStyle,
                    opacity: hasValidationErrors || updating ? 0.6 : 1,
                    cursor: hasValidationErrors || updating ? 'not-allowed' : 'pointer'
                  }}
                  onClick={handleUpdate}
                  disabled={hasValidationErrors || updating}
                >
                  {updating ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'emergency_contacts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Contact Name</label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
                {fieldErrors.emergencyContactName && (
                  <div style={errorStyle}>{fieldErrors.emergencyContactName}</div>
                )}
              </div>

              <div>
                <label style={labelStyle}>Contact Phone</label>
                <input
                  type="text"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleInputChange}
                  placeholder="0771234567"
                  style={inputStyle}
                />
                {fieldErrors.emergencyContactPhone && (
                  <div style={errorStyle}>{fieldErrors.emergencyContactPhone}</div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                style={{
                  ...saveButtonStyle,
                  opacity: hasValidationErrors || updating ? 0.6 : 1,
                  cursor: hasValidationErrors || updating ? 'not-allowed' : 'pointer'
                }}
                onClick={handleUpdate}
                disabled={hasValidationErrors || updating}
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'password' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
            <form onSubmit={handlePasswordChange} style={passwordFormStyle}>
              <div>
                <label style={labelStyle}>Current Password</label>
                <input
                  type="password"
                  value={pwdForm.currentPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>New Password</label>
                <input
                  type="password"
                  value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                  required
                  style={inputStyle}
                />
                {pwdForm.newPassword && !passwordRegex.test(pwdForm.newPassword) && (
                  <div style={errorStyle}>
                    Must be at least 8 characters and contain uppercase, lowercase, number, and special character.
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>Confirm New Password</label>
                <input
                  type="password"
                  value={pwdForm.confirmPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                  required
                  style={inputStyle}
                />
                {pwdForm.confirmPassword && pwdForm.confirmPassword !== pwdForm.newPassword && (
                  <div style={errorStyle}>Passwords do not match.</div>
                )}
              </div>

              {pwdMessage && (
                <div
                  style={{
                    padding: '10px',
                    borderRadius: '6px',
                    backgroundColor: pwdError ? '#fef2f2' : '#f0fdf4',
                    color: pwdError ? '#b91c1c' : '#15803d',
                    fontSize: '0.85rem'
                  }}
                >
                  {pwdMessage}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={pwdLoading || isPasswordInvalid}
                  style={{
                    ...saveButtonStyle,
                    opacity: pwdLoading || isPasswordInvalid ? 0.6 : 1,
                    cursor: pwdLoading || isPasswordInvalid ? 'not-allowed' : 'pointer'
                  }}
                >
                  {pwdLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        )}

        {showDeleteConfirm && (
          <div style={modalOverlayStyle}>
            <div style={modalBoxStyle}>
              <h3 style={modalTitleStyle}>Delete Account</h3>
              <p style={modalTextStyle}>
                Are you sure you want to permanently delete your account? This action cannot be undone.
              </p>

              {deleteError && <p style={deleteErrorStyle}>{deleteError}</p>}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteError('')
                  }}
                  disabled={deleteLoading}
                  style={modalCancelButtonStyle}
                >
                  Cancel
                </button>

                <button
                  onClick={requestDeletion}
                  disabled={deleteLoading}
                  style={{
                    ...modalDangerButtonStyle,
                    opacity: deleteLoading ? 0.7 : 1
                  }}
                >
                  {deleteLoading ? 'Sending OTP...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteOtp && (
          <div style={modalOverlayStyle}>
            <div style={modalBoxStyle}>
              <h3 style={modalTitleStyle}>Verify Deletion</h3>
              <p style={modalTextStyle}>We've sent a 6-digit code to your email. Enter it below to confirm.</p>

              <input
                type="text"
                maxLength="6"
                value={deleteOtp}
                onChange={(e) => setDeleteOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                style={otpInputStyle}
              />

              {deleteError && <p style={deleteErrorStyle}>{deleteError}</p>}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => {
                    setShowDeleteOtp(false)
                    setDeleteOtp('')
                    setDeleteError('')
                  }}
                  disabled={deleteLoading}
                  style={modalCancelButtonStyle}
                >
                  Cancel
                </button>

                <button
                  onClick={confirmDeletion}
                  disabled={deleteLoading || deleteOtp.length !== 6}
                  style={{
                    ...modalDangerButtonStyle,
                    opacity: deleteLoading || deleteOtp.length !== 6 ? 0.7 : 1
                  }}
                >
                  {deleteLoading ? 'Verifying...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
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