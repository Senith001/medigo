import { useSearchParams, useNavigate } from 'react-router-dom'
import { XCircle } from 'lucide-react'
import Button from '../../components/common/Button'

export default function PaymentCancelPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--gray-50)'}}>
      <div style={{background:'var(--white)',borderRadius:'var(--radius-xl)',padding:48,textAlign:'center',maxWidth:400,boxShadow:'var(--shadow-lg)'}}>
        <XCircle size={56} color="var(--danger)" style={{marginBottom:16}} />
        <h1 style={{fontSize:24,fontWeight:700,color:'var(--gray-900)',fontFamily:'var(--font-serif)',marginBottom:8}}>Payment Cancelled</h1>
        <p style={{color:'var(--gray-500)',fontSize:14,marginBottom:28}}>Your payment was cancelled. Your appointment is still pending.</p>
        <Button onClick={()=>navigate('/patient/appointments')} size="lg" style={{width:'100%',justifyContent:'center'}}>Back to Appointments</Button>
      </div>
    </div>
  )
}
