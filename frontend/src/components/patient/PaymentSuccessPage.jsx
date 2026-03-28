import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { paymentAPI } from '../../services/api'
import Button from '../../components/common/Button'

export default function PaymentSuccessPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [done, setDone] = useState(false)

  useEffect(() => {
    const sid = params.get('session_id')
    if (sid) paymentAPI.success(sid).finally(()=>setDone(true))
    else setDone(true)
  }, [])

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--gray-50)'}}>
      <div style={{background:'var(--white)',borderRadius:'var(--radius-xl)',padding:48,textAlign:'center',maxWidth:400,boxShadow:'var(--shadow-lg)'}}>
        <CheckCircle size={56} color="var(--success)" style={{marginBottom:16}} />
        <h1 style={{fontSize:24,fontWeight:700,color:'var(--gray-900)',fontFamily:'var(--font-serif)',marginBottom:8}}>Payment Successful!</h1>
        <p style={{color:'var(--gray-500)',fontSize:14,marginBottom:28}}>Your appointment is confirmed. Check your email for details.</p>
        <Button onClick={()=>navigate('/patient/appointments')} size="lg" style={{width:'100%',justifyContent:'center'}}>View Appointments</Button>
      </div>
    </div>
  )
}
