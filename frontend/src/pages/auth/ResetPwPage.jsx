import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../../services/api'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'

export default function ResetPwPage() {
  const [form, setForm] = useState({ otp:'', newPassword:'' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { state } = useLocation()
  const email = state?.email || ''
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.resetPw({ email, ...form })
      toast.success('Password reset!')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--gray-50)',padding:24}}>
      <div style={{background:'var(--white)',borderRadius:'var(--radius-xl)',padding:'40px 36px',width:'100%',maxWidth:400,boxShadow:'var(--shadow-lg)'}}>
        <h1 style={{fontSize:22,fontWeight:700,color:'var(--gray-900)',fontFamily:'var(--font-serif)',marginBottom:8}}>Reset password</h1>
        <p style={{fontSize:13,color:'var(--gray-500)',marginBottom:24}}>Enter the OTP sent to <strong>{email}</strong></p>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
          <Input label="OTP Code" placeholder="123456" value={form.otp} onChange={set('otp')} maxLength={6} required />
          <Input label="New Password" type="password" placeholder="New password" value={form.newPassword} onChange={set('newPassword')} icon={Lock} required />
          <Button type="submit" loading={loading} size="lg" style={{width:'100%',justifyContent:'center'}}>Reset Password</Button>
        </form>
      </div>
    </div>
  )
}
