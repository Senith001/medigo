import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { authAPI } from '../../services/api'
import AuthLayout from '../../components/AuthLayout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function VerifyResetOtpPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const email = location.state?.email || sessionStorage.getItem('resetEmail')

  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Email not found. Please request a new OTP.')
      return
    }

    if (!otp.trim()) {
      setError('Please enter the OTP.')
      return
    }

    setLoading(true)

    try {
      await authAPI.verifyResetOtp({
        email,
        otp
      })

      sessionStorage.setItem('resetOtp', otp)

      navigate('/reset-password', {
        state: { email, otp },
        replace: true
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Verify OTP"
      subtitle={`Enter the OTP sent to ${email || 'your email address'}.`}
      image="https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=1600&q=80&fit=crop"
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-600"
            >
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}

          <Input
            label="Reset OTP"
            type="text"
            placeholder="Enter OTP"
            icon={ShieldCheck}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <Button type="submit" className="w-full h-12" loading={loading}>
            Verify OTP
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/forgot-password"
            className="text-sm font-bold text-medigo-blue inline-flex items-center"
          >
            <ArrowLeft size={16} className="mr-1" />
            Request New OTP
          </Link>
        </div>
      </motion.div>
    </AuthLayout>
  )
}