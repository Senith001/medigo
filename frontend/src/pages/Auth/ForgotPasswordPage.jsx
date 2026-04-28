import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, AlertCircle, ArrowLeft, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import { authAPI } from '../../services/api'
import AuthLayout from '../../components/AuthLayout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authAPI.forgotPassword({ email })

      sessionStorage.setItem('resetEmail', email)

      navigate('/verify-reset-otp', {
        state: { email },
        replace: true
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset OTP.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email address and we will send you a password reset OTP."
      image="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&q=80&fit=crop"
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
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button type="submit" className="w-full h-12" loading={loading}>
            <Send size={18} className="mr-2" />
            Send Reset OTP
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