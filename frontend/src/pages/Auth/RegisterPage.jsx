import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  User,
  Mail,
  Lock,
  Phone,
  UserPlus,
  ChevronRight,
  AlertCircle,
  ShieldCheck
} from 'lucide-react'
import { motion } from 'framer-motion'
import { authAPI } from '../../services/api'
import AuthLayout from '../../components/AuthLayout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const validatePassword = (password) => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password)
}

const validateRegisterForm = (data) => {
  const errors = {}

  if (!data.fullName.trim()) {
    errors.fullName = 'Name is required'
  } else if (data.fullName.trim().length > 30) {
    errors.fullName = 'Name must not exceed 30 characters'
  } else if (!/^[A-Za-z ]+$/.test(data.fullName.trim())) {
    errors.fullName = 'Name cannot contain special characters or digits'
  }

  if (!data.email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'Invalid email format'
  }

  if (!data.phone.trim()) {
    errors.phone = 'Mobile number is required'
  } else if (!/^(0[0-9]{9}|(77|76|74|78|75|71|70)[0-9]{7})$/.test(data.phone.trim())) {
    errors.phone = 'Invalid mobile number'
  }

  if (!data.password) {
    errors.password = 'Password is required'
  } else if (!validatePassword(data.password)) {
    errors.password =
      'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character'
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  return errors
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  const [fieldErrors, setFieldErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleChange = (e) => {
    const updated = {
      ...formData,
      [e.target.name]: e.target.value
    }

    setFormData(updated)
    setFieldErrors(validateRegisterForm(updated))
    setError('')
  }

  const handleBlur = (e) => {
    setTouched((prev) => ({
      ...prev,
      [e.target.name]: true
    }))
  }

  const shouldShowError = (field) => {
    return (touched[field] || submitted) && fieldErrors[field]
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)

    const errors = validateRegisterForm(formData)
    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      setError('Please fix the validation errors before continuing.')
      return
    }

    setError('')
    setLoading(true)

    const registerPayload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password
    }

    try {
      await authAPI.register(registerPayload)

      navigate('/verify-otp', {
        state: { email: registerPayload.email }
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details and try again.')
    } finally {
      setLoading(false)
    }
  }

  const hasValidationErrors =
    submitted && Object.keys(fieldErrors).some((key) => fieldErrors[key])

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join Medigo today. Quality healthcare is just a few clicks away."
      image="https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1600&q=80&fit=crop"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <Input
              label="Full Name"
              name="fullName"
              placeholder="John Doe"
              icon={User}
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {shouldShowError('fullName') && (
              <p className="mt-1 text-xs font-medium text-red-500">{fieldErrors.fullName}</p>
            )}
          </div>

          <div>
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="john@example.com"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {shouldShowError('email') && (
              <p className="mt-1 text-xs font-medium text-red-500">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="0771234567"
              icon={Phone}
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {shouldShowError('phone') && (
              <p className="mt-1 text-xs font-medium text-red-500">{fieldErrors.phone}</p>
            )}
          </div>

          <div>
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {shouldShowError('password') && (
              <p className="mt-1 text-xs font-medium text-red-500">{fieldErrors.password}</p>
            )}
          </div>

          <div>
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              icon={Lock}
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {shouldShowError('confirmPassword') && (
              <p className="mt-1 text-xs font-medium text-red-500">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <div className="flex items-start gap-2 px-1 py-1">
            <input
              type="checkbox"
              id="terms"
              className="mt-1 w-4 h-4 rounded border-slate-300 text-medigo-blue focus:ring-medigo-blue"
              required
            />
            <label
              htmlFor="terms"
              className="text-[13px] text-slate-500 font-medium cursor-pointer select-none leading-tight"
            >
              I agree to the{' '}
              <Link to="/terms" className="text-medigo-blue hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-medigo-blue hover:underline">
                Privacy Policy
              </Link>
              .
            </label>
          </div>

          <Button
            type="submit"
            className="w-full h-12 mt-2"
            loading={loading}
            disabled={loading || hasValidationErrors}
          >
            <UserPlus size={18} className="mr-2" />
            Create Patient Account
          </Button>

        
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-medigo-blue font-bold hover:underline inline-flex items-center"
            >
              Log in here <ChevronRight size={16} />
            </Link>
          </p>
        </div>
      </motion.div>
    </AuthLayout>
  )
}