import { useNavigate, useSearchParams } from 'react-router-dom'
import { paymentAPI } from '../../services/api'
import { useEffect } from 'react'
import { XCircle } from 'lucide-react'

export default function PaymentCancel() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const sessionId = params.get('session_id')
    if (sessionId) paymentAPI.handleCancel(sessionId)
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--red-50)' }}>
      <div className="card" style={{ textAlign: 'center', maxWidth: 400 }}>
        <XCircle size={56} color="var(--red-600)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, marginBottom: 8 }}>Payment Cancelled</h2>
        <p style={{ color: 'var(--gray-500)', marginBottom: 24 }}>Your payment was not completed. Your appointment is still pending.</p>
        <button className="btn btn-secondary" onClick={() => navigate('/patient/appointments')}>Back to Appointments</button>
      </div>
    </div>
  )
}
