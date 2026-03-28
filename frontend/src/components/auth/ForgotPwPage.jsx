import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../../services/api'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'

export default function ForgotPwPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.forgotPw({ email })
      toast.success('OTP sent to your email!')
      navigate('/reset-password', { state: { email } })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--gray-50)',padding:24}}>
      <div style={{background:'var(--white)',borderRadius:'var(--radius-xl)',padding:'40px 36px',width:'100%',maxWidth:400,boxShadow:'var(--shadow-lg)'}}>
        <h1 style={{fontSize:22,fontWeight:700,color:'var(--gray-900)',fontFamily:'var(--font-serif)',marginBottom:8}}>Forgot password?</h1>
        <p style={{fontSize:13,color:'var(--gray-500)',marginBottom:24}}>Enter your email and we'll send you an OTP.</p>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
          <Input label="Email" type="email" placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)} icon={Mail} required />
          <Button type="submit" loading={loading} size="lg" style={{width:'100%',justifyContent:'center'}}>Send OTP</Button>
        </form>
        <p style={{textAlign:'center',fontSize:13,color:'var(--gray-500)',marginTop:20}}>
          <Link to="/login" style={{color:'var(--primary)',fontWeight:500}}>Back to login</Link>
        </p>
      </div>
    </div>
  )
}
