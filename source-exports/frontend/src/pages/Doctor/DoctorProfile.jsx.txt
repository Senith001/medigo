import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { doctorAPI } from '../../services/api'

export default function DoctorProfile() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await doctorAPI.getMyProfile()
        setDoctor(res.data.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load your profile.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center text-slate-600">Loading doctor profile...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-lg p-8 text-center border border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Profile Error</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/doctor')}
            className="btn btn-primary"
          >Back to Dashboard</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-sky-600 p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black tracking-tight">Doctor Profile</h1>
                <p className="text-slate-100/80 mt-2">Manage your professional details and account settings.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="btn btn-white" onClick={() => navigate('/doctor')}>Back to Dashboard</button>
                <button className="btn btn-white/10 border border-white/20" onClick={() => { logout(); navigate('/login') }}>Sign out</button>
              </div>
            </div>
          </div>

          <div className="p-8 grid gap-8 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 flex flex-col justify-between gap-6">
              <div>
                <div className="w-24 h-24 rounded-3xl bg-teal-500 text-white flex items-center justify-center text-4xl font-black mb-4">{doctor.fullName?.[0]?.toUpperCase() || 'D'}</div>
                <h2 className="text-xl font-bold text-slate-900">Dr. {doctor.fullName}</h2>
                <p className="text-sm text-slate-500 mt-1">{doctor.specialty || 'General Medicine'}</p>
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                <div><span className="font-semibold text-slate-900">Status:</span> {doctor.status || 'Pending'}</div>
                <div><span className="font-semibold text-slate-900">Joined:</span> {new Date(doctor.createdAt || Date.now()).toLocaleDateString()}</div>
                <div><span className="font-semibold text-slate-900">Doctor ID:</span> {doctor.userId || 'N/A'}</div>
              </div>
            </div>

            <div className="md:col-span-2 grid gap-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Email</p>
                    <p className="text-slate-900 font-medium">{doctor.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Phone</p>
                    <p className="text-slate-900 font-medium">{doctor.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Clinic / Hospital</p>
                    <p className="text-slate-900 font-medium">{doctor.clinicLocation || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Specialty</p>
                    <p className="text-slate-900 font-medium">{doctor.specialty || 'General Medicine'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Professional Summary</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Qualifications</p>
                    <p className="text-slate-900 font-medium">{doctor.qualifications || 'Not available'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Experience</p>
                    <p className="text-slate-900 font-medium">{doctor.experienceYears ? `${doctor.experienceYears} years` : 'Not specified'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-slate-500 text-sm mb-1">Consultation fee</p>
                    <p className="text-slate-900 font-medium">{doctor.consultationFee ? `Rs. ${doctor.consultationFee}` : 'Not specified'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-slate-500 text-sm mb-1">About</p>
                    <p className="text-slate-900 whitespace-pre-line">{doctor.bio || 'No biography provided yet.'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
