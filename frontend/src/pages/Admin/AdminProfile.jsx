import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User, Lock, ShieldCheck, Mail, Phone, BadgeCheck,
  Loader2, ArrowRight, CheckCircle2, AlertCircle,
  RefreshCw, KeyRound
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../services/api'
import Button from '../../components/ui/Button'

export default function AdminProfile() {
  const { user } = useAuth()

  // Profile State
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Password State
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwdLoading, setPwdLoading] = useState(false)
  const [pwdMessage, setPwdMessage] = useState('')
  const [pwdError, setPwdError] = useState(false)

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const res = await authAPI.getMe()
        if (res.data.success) {
          setProfile(res.data.data)
        }
      } catch (err) {
        console.error("Failed to load admin profile", err)
      } finally {
        setLoading(false)
      }
    }
    fetchAdminProfile()
  }, [])

  const handlePasswordChange = async (e) => {
    e.preventDefault()

    if (!newPasswordValid) {
      setPwdError(true)
      setPwdMessage('❌ New password does not meet requirements.')
      return
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPwdError(true)
      setPwdMessage('❌ Passwords do not match.')
      return
    }

    setPwdLoading(true)
    setPwdMessage('')
    setPwdError(false)

    try {
      const res = await authAPI.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      })
      if (res.data.success) {
        setPwdMessage('✅ Password updated successfully.')
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      }
    } catch (err) {
      setPwdError(true)
      setPwdMessage('❌ ' + (err.response?.data?.message || err.message))
    } finally {
      setPwdLoading(false)
    }
  }

  const handlePwdInput = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value })
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
  const newPasswordValid = passwordRegex.test(passwords.newPassword)
  const passwordsMatch = passwords.newPassword === passwords.confirmPassword
  const canSubmit = passwords.currentPassword && passwords.newPassword && passwords.confirmPassword && newPasswordValid && passwordsMatch && !pwdLoading

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-black text-[#008080] uppercase tracking-widest mb-1">Settings</p>
          <h1 className="text-3xl font-black text-medigo-navy tracking-tight">
            Admin <span className="text-[#008080]">Profile</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">
            Manage your account details and security settings
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="self-start sm:self-auto flex items-center gap-2 px-5 py-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-[#008080] hover:border-[#008080]/30 transition-all shadow-sm text-sm font-bold"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] border border-slate-100 p-7 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <User size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity</p>
              <h3 className="text-lg font-black text-medigo-navy">Profile Information</h3>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={32} className="animate-spin text-[#008080] mr-3" />
              <span className="text-sm font-bold">Loading profile...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Avatar & Name */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-16 h-16 rounded-full bg-medigo-navy text-white flex items-center justify-center text-2xl font-black">
                  {(profile?.fullName?.[0] || user?.name?.[0] || 'A').toUpperCase()}
                </div>
                <div>
                  <h4 className="text-lg font-black text-medigo-navy">{profile?.fullName || user?.name || 'Admin User'}</h4>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#008080]/10 text-[#008080] rounded-full text-[10px] font-black uppercase tracking-wider">
                    <BadgeCheck size={12} />
                    {profile?.role || user?.role || 'Admin'}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <DetailRow
                  icon={BadgeCheck}
                  label="Admin ID"
                  value={profile?.userId || user?.userId || '—'}
                />
                <DetailRow
                  icon={Mail}
                  label="Email Address"
                  value={profile?.email || user?.email || '—'}
                />
                <DetailRow
                  icon={Phone}
                  label="Phone Number"
                  value={profile?.phone || user?.phone || '—'}
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Security Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[2rem] border border-slate-100 p-7 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security</p>
              <h3 className="text-lg font-black text-medigo-navy">Change Password</h3>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Current Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <KeyRound size={18} />
                </div>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handlePwdInput}
                  required
                  placeholder="Enter current password"
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 text-medigo-navy outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 transition-all text-sm font-semibold placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">New Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePwdInput}
                  required
                  placeholder="Create new password"
                  className={`w-full h-12 bg-slate-50 border rounded-xl pl-12 pr-4 text-medigo-navy outline-none focus:ring-2 transition-all text-sm font-semibold placeholder:text-slate-400 ${
                    passwords.newPassword && !newPasswordValid
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-[#008080] focus:ring-[#008080]/10'
                  }`}
                />
              </div>
              {passwords.newPassword && !newPasswordValid && (
                <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                  <AlertCircle size={12} />
                  Must be 8+ chars with uppercase, lowercase, number, and special character.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Confirm New Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <ShieldCheck size={18} />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handlePwdInput}
                  required
                  placeholder="Re-enter new password"
                  className={`w-full h-12 bg-slate-50 border rounded-xl pl-12 pr-4 text-medigo-navy outline-none focus:ring-2 transition-all text-sm font-semibold placeholder:text-slate-400 ${
                    passwords.confirmPassword && !passwordsMatch
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : passwords.confirmPassword && passwordsMatch
                      ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100'
                      : 'border-slate-200 focus:border-[#008080] focus:ring-[#008080]/10'
                  }`}
                />
              </div>
              {passwords.confirmPassword && (
                <p className={`text-xs font-medium flex items-center gap-1 ${
                  passwordsMatch ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {passwordsMatch ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </p>
              )}
            </div>

            <Button
              loading={pwdLoading}
              disabled={!canSubmit}
              className="w-full h-12 bg-[#008080] hover:bg-[#006666] text-white font-semibold rounded-xl shadow-lg shadow-[#008080]/20 disabled:opacity-50"
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
          </form>
        </motion.div>
      </div>

      {/* Security Status */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-6 flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
          <ShieldCheck size={24} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-black text-medigo-navy">Account Security Active</p>
          <p className="text-xs text-emerald-600 font-medium">Your account is protected with secure authentication.</p>
        </div>
        <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider">
          Protected
        </span>
      </motion.div>
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
      <span className="text-sm font-black text-medigo-navy">{value}</span>
    </div>
  )
}
