import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, ArrowLeft, Download } from 'lucide-react'
import { paymentAPI } from '../../services/api'

const InvoiceView = () => {
  const { paymentId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [payment, setPayment] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await paymentAPI.getById(paymentId)
        setPayment(data.payment || data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load invoice')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [paymentId])

  const downloadHtml = () => {
    if (!payment) return
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${payment.invoiceNumber}</title><style>body{font-family:Arial,Helvetica,sans-serif;padding:24px;color:#111}header{display:flex;justify-content:space-between;align-items:center}h1{margin:0}table{width:100%;border-collapse:collapse;margin-top:16px}td,th{padding:8px;border:1px solid #eee;text-align:left}footer{margin-top:24px;color:#666;font-size:13px}</style></head><body><header><div><h1>MEDIGO</h1><div>Invoice: ${payment.invoiceNumber}</div></div><div><strong>Paid</strong><div>${new Date(payment.paidAt).toLocaleString()}</div></div></header><section><h2>Payment Details</h2><table><tr><th>Invoice</th><td>${payment.invoiceNumber}</td></tr><tr><th>Amount</th><td>${payment.amount} ${payment.currency}</td></tr><tr><th>Patient</th><td>${payment.patientName} (${payment.patientEmail})</td></tr><tr><th>Doctor</th><td>${payment.doctorName}</td></tr><tr><th>Method</th><td>${payment.paymentMethod}</td></tr><tr><th>Appointment</th><td>${payment.appointmentId}</td></tr></table></section><footer>This is a system generated receipt for your consultation payment.</footer></body></html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${payment.invoiceNumber}.html`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow p-8 text-center">
        <h2 className="text-lg font-bold">{error}</h2>
        <button onClick={() => navigate(-1)} className="mt-6 px-4 py-2 bg-slate-900 text-white rounded">Go Back</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>

        <div className="bg-white rounded-3xl p-8 shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Invoice</h1>
              <div className="text-sm text-slate-500">Invoice No: {payment.invoiceNumber || 'N/A'}</div>
            </div>
            <div className="space-x-3">
              <button onClick={downloadHtml} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded">
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm text-slate-500">Patient</h3>
              <div className="font-semibold">{payment.patientName}</div>
              <div className="text-sm text-slate-500">{payment.patientEmail}</div>
            </div>
            <div>
              <h3 className="text-sm text-slate-500">Doctor</h3>
              <div className="font-semibold">{payment.doctorName}</div>
              <div className="text-sm text-slate-500">Appointment: {payment.appointmentId}</div>
            </div>
          </div>

          <div className="mt-8 bg-slate-50 rounded-lg p-4">
            <div className="flex justify-between text-sm text-slate-500"><span>Amount</span><span className="font-bold">{payment.amount} {payment.currency}</span></div>
            <div className="flex justify-between text-sm text-slate-500 mt-2"><span>Payment Method</span><span className="font-medium">{payment.paymentMethod}</span></div>
            <div className="flex justify-between text-sm text-slate-500 mt-2"><span>Paid At</span><span className="font-medium">{payment.paidAt ? new Date(payment.paidAt).toLocaleString() : '—'}</span></div>
          </div>

          {payment.paymentSlipUrl && (
            <div className="mt-6">
              <h4 className="text-sm text-slate-500 mb-2">Payment Slip</h4>
              <button onClick={() => navigate(`/payment/slip/${payment._id}`)} className="px-4 py-2 bg-white border rounded">View Slip</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InvoiceView
