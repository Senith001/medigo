import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Stethoscope, Mail, Phone, MapPin,
  CreditCard, BookOpen, User,
  CheckCircle2, AlertCircle, Sparkles,
  ChevronRight, ArrowRight, IdCard, BadgeCheck
} from 'lucide-react'
import { motion } from 'framer-motion'
import { doctorAPI } from '../../services/api'
import AuthLayout from '../../components/AuthLayout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const SPECIALTIES = [
  'General Medicine', 'Cardiology', 'Dermatology', 'Neurology',
  'Pediatrics', 'Psychiatry', 'Orthopedics', 'Gynecology', 'ENT'
]

const CATEGORIES = [
  'Section 39B (Specialist Medical Practitioners)',
  'Section 39B (Specialist Dental Practitioners)',
  'Section 29 (Medical Practitioners)',
  'Section 43 (Dental Surgeons)',
  'Act 15 (Medical Practitioners)',
  'Section 41 (Registered Medical Practitioners)',
  'SEC51 - MIDWIFE',
  'SEC56 - PHARMACIST',
  'SEC60A - RADIOGRAPHER (1) (a)',
  'SEC60B - MEDICAL LABORATORY TECHNOLOGIST (1)(b)',
  'SEC6OC - PHYSIOTHERAPIST (1) (c)',
  'SEC6OD - OCCUPATIONAL THERAPIST (1) (d)',
  'SEC60E - ELECTROCARDIOGRAPH RECORDIST (1) (e)',
  'SEC60F - AUDIOLOGIST (1) (f)',
  'SEC60G - CLINICAL PHYSIOLOGISTS (1) (g)',
  'SEC60H - SPEECH THERAPIST (1) (h)',
  'SEC60I - CHIROPODIST (1) (i)',
  'SEC60J - DIETITIAN (1) (j)',
  'SEC6OK - OPHTHALMIC AUXILIARY (1) (k)',
  'SEC60L - ELECTROENCEPHALOGRAPH RECORDIST (1) (I)',
  'SEC6OM - NUTRITIONIST (1) (m)',
  'SECON - CLINICAL PSYCHOLOGIST'
]

const validateDoctorForm = (data) => {
  const errors = {}

  if (!data.fullName.trim()) {
    errors.fullName = 'Full name is required'
  } else if (data.fullName.trim().length > 50) {
    errors.fullName = 'Full name must not exceed 50 characters'
  } else if (!/^[A-Za-z .]+$/.test(data.fullName.trim())) {
    errors.fullName = 'Name can only contain letters, spaces, dots'
  }

  if (!data.email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'Invalid email format'
  }

  if (!data.phone.trim()) {
    errors.phone = 'Phone number is required'
  } else if (!/^(0[0-9]{9}|(77|76|74|78|75|71|70)[0-9]{7})$/.test(data.phone.trim())) {
    errors.phone = 'Invalid Sri Lankan mobile number'
  }

  if (!data.category) {
    errors.category = 'Category is required'
  }

  if (!data.nicNumber.trim()) {
    errors.nicNumber = 'NIC number is required'
  } else if (!/^([0-9]{12}|[0-9]{9}[VvXx])$/.test(data.nicNumber.trim())) {
    errors.nicNumber = 'NIC must be like 199512304567 or 951234567V'
  }

  if (!data.medicalLicenseNumber.trim()) {
    errors.medicalLicenseNumber = 'Medical license number is required'
  } else if (!/^[A-Za-z0-9/-]{3,30}$/.test(data.medicalLicenseNumber.trim())) {
    errors.medicalLicenseNumber = 'License number can contain letters, numbers, / or -'
  }

  if (!data.specialty) {
    errors.specialty = 'Specialty is required'
  }

  if (!data.experienceYears.toString().trim()) {
    errors.experienceYears = 'Experience is required'
  } else if (Number(data.experienceYears) < 0 || Number(data.experienceYears) > 60) {
    errors.experienceYears = 'Experience must be between 0 and 60 years'
  }

  if (!data.qualifications.trim()) {
    errors.qualifications = 'Qualifications are required'
  } else if (data.qualifications.trim().length < 3) {
    errors.qualifications = 'Qualifications are too short'
  }

  if (!data.clinicLocation.trim()) {
    errors.clinicLocation = 'Clinic location is required'
  }

  if (!data.consultationFee.toString().trim()) {
    errors.consultationFee = 'Consultation fee is required'
  } else if (Number(data.consultationFee) <= 0) {
    errors.consultationFee = 'Consultation fee must be greater than 0'
  }

  if (data.bio && data.bio.length > 500) {
    errors.bio = 'Bio must not exceed 500 characters'
  }

  return errors
}

export default function DoctorRegistration() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    category: CATEGORIES[0],
    nicNumber: '',
    medicalLicenseNumber: '',
    specialty: 'General Medicine',
    qualifications: '',
    experienceYears: '',
    clinicLocation: '',
    consultationFee: '',
    bio: ''
  })

  const [fieldErrors, setFieldErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleChange = (name, value) => {
    const updated = { ...form, [name]: value }
    setForm(updated)
    setFieldErrors(validateDoctorForm(updated))
    setError('')
  }

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }))
  }

  const shouldShowError = (field) => {
    return (touched[field] || submitted) && fieldErrors[field]
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)

    const errors = validateDoctorForm(form)
    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      setError('Please fix the validation errors before submitting.')
      return
    }

    setError('')
    setLoading(true)

    const payload = {
      ...form,
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      nicNumber: form.nicNumber.trim(),
      medicalLicenseNumber: form.medicalLicenseNumber.trim(),
      qualifications: form.qualifications.trim(),
      clinicLocation: form.clinicLocation.trim(),
      experienceYears: Number(form.experienceYears),
      consultationFee: Number(form.consultationFee),
      status: 'pending'
    }

    try {
      await doctorAPI.register(payload)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 5000)
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please check your professional details.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-slate-200 rounded-3xl p-10 max-w-lg shadow-premium text-center"
        >
          <div className="w-20 h-20 bg-medigo-mint/10 text-medigo-mint rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>

          <h1 className="text-3xl font-black text-medigo-navy mb-4 tracking-tight">
            Application Received!
          </h1>

          <p className="text-slate-500 leading-relaxed mb-8">
            Thank you, Dr.{' '}
            <span className="text-medigo-navy font-bold">
              {form.fullName.split(' ').pop()}
            </span>
            . Our medical board will review your credentials and clinical experience.
            Check your email for status updates—this typically takes 24-48 hours.
          </p>

          <div className="flex items-center justify-center gap-2 text-medigo-blue font-bold text-sm">
            <div className="w-4 h-4 border-2 border-medigo-blue/30 border-t-medigo-blue rounded-full animate-spin" />
            Redirecting to login...
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <AuthLayout
      isWide={true}
      title="Practitioner Application"
      subtitle="Join the Next Generation of Care. Join thousands of verified professionals globally."
      image="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=1600&q=80&fit=crop"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleSubmit} className="space-y-6 pb-12">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Input
                label="Full Name"
                required
                placeholder="Dr. Alexander Maxwell"
                icon={User}
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
              />
              {shouldShowError('fullName') && (
                <p className="mt-1 text-xs font-medium text-red-500">{fieldErrors.fullName}</p>
              )}
            </div>

            <div>
              <Input
                label="Work Email"
                type="email"
                required
                placeholder="alex@hospital.com"
                icon={Mail}
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
              />
              {shouldShowError('email') && (
                <p className="mt-1 text-xs font-medium text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <Input
                label="Phone Number"
                type="tel"
                required
                placeholder="07XXXXXXXX"
                icon={Phone}
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                onBlur={() => handleBlur('phone')}
              />
              {shouldShowError('phone') && (
                <p className="mt-1 text-xs font-medium text-red-500">{fieldErrors.phone}</p>
              )}
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                Category
              </label>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-medigo-blue">
                  <BadgeCheck size={18} />
                </div>

                <select
                  required
                  value={form.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  onBlur={() => handleBlur('category')}
                  className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/10 appearance-none font-medium text-slate-900 transition-all font-inter"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronRight size={14} className="rotate-90" />
                </div>
              </div>

              {shouldShowError('category') && (
                <p className="mt-1 text-xs font-medium text-red-500">{fieldErrors.category}</p>
              )}
            </div>

            <div>
              <Input
                label="NIC Number"
                required
                placeholder="199512304567 or 951234567V"
                icon={IdCard}
                value={form.nicNumber}
                onChange={(e) => handleChange('nicNumber', e.target.value)}
                onBlur={() => handleBlur('nicNumber')}
              />
              {shouldShowError('nicNumber') && (
                <p className="mt-1 text-xs font-medium text-red-500">{fieldErrors.nicNumber}</p>
              )}
            </div>

            <div>
              <Input
                label="Medical License Number"
                required
                placeholder="12345 or XXXXX"
                icon={BadgeCheck}
                value={form.medicalLicenseNumber}
                onChange={(e) => handleChange('medicalLicenseNumber', e.target.value)}
                onBlur={() => handleBlur('medicalLicenseNumber')}
              />
              {shouldShowError('medicalLicenseNumber') && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {fieldErrors.medicalLicenseNumber}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                Specialty
              </label>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-medigo-blue">
                  <Stethoscope size={18} />
                </div>

                <select
                  required
                  value={form.specialty}
                  onChange={(e) => handleChange('specialty', e.target.value)}
                  onBlur={() => handleBlur('specialty')}
                  className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/10 appearance-none font-medium text-slate-900 transition-all font-inter"
                >
                  {SPECIALTIES.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>

                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronRight size={14} className="rotate-90" />
                </div>
              </div>

              {shouldShowError('specialty') && (
                <p className="mt-1 text-xs font-medium text-red-500">{fieldErrors.specialty}</p>
              )}
            </div>

            <div>
              <Input
                label="Experience (Years)"
                type="number"
                required
                placeholder="8"
                icon={Sparkles}
                value={form.experienceYears}
                onChange={(e) => handleChange('experienceYears', e.target.value)}
                onBlur={() => handleBlur('experienceYears')}
              />
              {shouldShowError('experienceYears') && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {fieldErrors.experienceYears}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <Input
                label="Qualifications"
                required
                placeholder="MBBS, MD Cardiology"
                icon={BookOpen}
                value={form.qualifications}
                onChange={(e) => handleChange('qualifications', e.target.value)}
                onBlur={() => handleBlur('qualifications')}
              />
              {shouldShowError('qualifications') && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {fieldErrors.qualifications}
                </p>
              )}
            </div>

            <div>
              <Input
                label="Primary Clinic Location"
                required
                placeholder="Central Hospital, Colombo 07"
                icon={MapPin}
                value={form.clinicLocation}
                onChange={(e) => handleChange('clinicLocation', e.target.value)}
                onBlur={() => handleBlur('clinicLocation')}
              />
              {shouldShowError('clinicLocation') && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {fieldErrors.clinicLocation}
                </p>
              )}
            </div>

            <div>
              <Input
                label="Consultation Fee (LKR)"
                type="number"
                required
                placeholder="2500"
                icon={CreditCard}
                value={form.consultationFee}
                onChange={(e) => handleChange('consultationFee', e.target.value)}
                onBlur={() => handleBlur('consultationFee')}
              />
              {shouldShowError('consultationFee') && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {fieldErrors.consultationFee}
                </p>
              )}
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                Professional Bio
              </label>

              <textarea
                rows="4"
                placeholder="Briefly describe your clinical focus and patient philosophy..."
                value={form.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                onBlur={() => handleBlur('bio')}
                className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-slate-900 outline-none focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/10 transition-all font-medium resize-none font-inter"
              />

              {shouldShowError('bio') && (
                <p className="mt-1 text-xs font-medium text-red-500">{fieldErrors.bio}</p>
              )}
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              loading={loading}
              className="w-full h-14 text-lg"
              disabled={loading}
            >
              Submit Professional Records
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <CheckCircle2 size={12} className="text-medigo-mint" />
              Secure HIPAA-compliant medical application
            </p>
          </div>
        </form>

        <div className="mt-4 text-center">
          <Link
            to="/login"
            className="text-sm text-slate-500 font-medium hover:text-medigo-blue transition-colors"
          >
            Already registered? <span className="font-bold">Log in to Doctor Portal</span>
          </Link>
        </div>
      </motion.div>
    </AuthLayout>
  )
}