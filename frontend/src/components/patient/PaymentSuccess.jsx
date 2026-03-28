import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { paymentAPI } from '../../services/api'
import { CheckCircle } from 'lucide-react'

export default function PaymentSuccess() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [done, setDone] = useState(false)

  useEffect(() => {
    const sessionId = params.get('session_id')
    if (sessionId) paymentAPI.handleSuccess(sessionId).finally(() => setDone(true))
    else setDone(true)
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--green-50)' }}>
      <div className="card" style={{ textAlign: 'center', maxWidth: 400 }}>
        <CheckCircle size={56} color="var(--green-600)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, marginBottom: 8 }}>Payment Successful!</h2>
        <p style={{ color: 'var(--gray-500)', marginBottom: 24 }}>Your appointment has been confirmed and a confirmation email has been sent.</p>
        <button className="btn btn-primary" onClick={() => navigate('/patient/appointments')}>View Appointments</button>
      </div>
    </div>
  )
}
