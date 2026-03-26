import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { paymentAPI } from '../services/api'

export function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [payment, setPayment] = useState(null)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (sessionId) {
      // Call payment success endpoint
      fetch(`/api/payments/success?session_id=${sessionId}`)
        .then(r => r.json())
        .then(data => { setPayment(data.payment); setLoading(false) })
        .catch(() => setLoading(false))
    } else {
      setLoading(false)
    }
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => navigate('/patient/appointments'), 5000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="card p-12 text-center max-w-md w-full">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-teal/20 border-t-teal rounded-full animate-spin"/>
            <p className="text-gray-500">Processing payment…</p>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 animate-bounce">✓</div>
            <h1 className="font-display font-black text-3xl text-gray-900 mb-3">Payment Successful!</h1>
            <p className="text-gray-500 mb-2">Your appointment has been confirmed.</p>
            {payment && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <div className="flex justify-between text-sm py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Invoice</span>
                  <strong className="text-gray-800">{payment.invoiceNumber}</strong>
                </div>
                <div className="flex justify-between text-sm py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Amount Paid</span>
                  <strong className="text-emerald-600">Rs. {payment.amount?.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between text-sm py-1.5">
                  <span className="text-gray-500">Doctor</span>
                  <strong className="text-gray-800">{payment.doctorName}</strong>
                </div>
              </div>
            )}
            <p className="text-xs text-gray-400 mb-6">📧 Confirmation email sent. Redirecting in 5 seconds…</p>
            <button className="btn-primary w-full justify-center py-3" onClick={() => navigate('/patient/appointments')}>
              View My Appointments →
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export function PaymentCancel() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (sessionId) {
      fetch(`/api/payments/cancel?session_id=${sessionId}`).catch(() => {})
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="card p-12 text-center max-w-md w-full">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✕</div>
        <h1 className="font-display font-black text-3xl text-gray-900 mb-3">Payment Cancelled</h1>
        <p className="text-gray-500 mb-8">Your payment was cancelled. Your appointment is still pending — you can pay later or cancel it.</p>
        <div className="flex flex-col gap-3">
          <button className="btn-primary w-full justify-center" onClick={() => navigate('/patient/appointments')}>
            View My Appointments
          </button>
          <button className="btn-ghost w-full justify-center" onClick={() => navigate('/search')}>
            Book Another Doctor
          </button>
        </div>
      </div>
    </div>
  )
}
