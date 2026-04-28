import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Lock, AlertCircle, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { authAPI } from '../../services/api'
import AuthLayout from '../../components/AuthLayout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function ResetPasswordPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const email = location.state?.email || sessionStorage.getItem('resetEmail')
  const otp = location.state?.otp || sessionStorage.getItem('resetOtp')

  const [form, setForm] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !otp) {
      setError('Reset session expired. Please request a new OTP.')
      return
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      await authAPI.resetPassword({
        email,
        otp,
        newPassword: form.newPassword
      })

      sessionStorage.removeItem('resetEmail')
      sessionStorage.removeItem('resetOtp')

      navigate('/password-changed', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Create a new secure password for your MediGo account."
      image="https://images.unsplash.com/photo-1551076805-e1869033e561?w=1600&q=80&fit=crop"
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-600">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <Input
            label="New Password"
            name="newPassword"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            value={form.newPassword}
            onChange={handleChange}
            required
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          <p className="text-xs text-slate-400 font-medium px-1">
            Password must contain uppercase, lowercase, number, special character, and at least 8 characters.
          </p>

          <Button type="submit" className="w-full h-12" loading={loading}>
            Change Password
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm font-bold text-medigo-blue inline-flex items-center">
            <ArrowLeft size={16} className="mr-1" />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </AuthLayout>
  )
}