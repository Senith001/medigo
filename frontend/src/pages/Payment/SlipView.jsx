import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, ArrowLeft, Download, Eye } from 'lucide-react'
import { paymentAPI } from '../../services/api'
import DashboardLayout from '../../components/DashboardLayout'

const SlipView = () => {
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
        setError(err.response?.data?.message || 'Failed to load payment')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [paymentId])

  if (loading) return (
    <DashboardLayout isPatient>
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-medigo-blue animate-spin" />
      </div>
    </DashboardLayout>
  )

  if (error || !payment?.paymentSlipUrl) return (
    <DashboardLayout isPatient>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>
        <div className="bg-white rounded-2xl p-12 text-center">
          <p className="text-lg font-semibold text-red-600">{error || 'No payment slip available'}</p>
          <button
            onClick={() => navigate('/payments')}
            className="mt-6 px-4 py-2 bg-medigo-navy text-white rounded-lg"
          >
            View All Payments
          </button>
        </div>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout isPatient>
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center text-slate-600 hover:text-slate-900 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Payments
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-black text-medigo-navy">Payment Slip</h1>
              <p className="text-sm text-slate-500 mt-1">Invoice: <strong>{payment.invoiceNumber || payment._id?.slice(-8)}</strong></p>
            </div>
            <a
              href={payment.paymentSlipUrl}
              download
              className="inline-flex items-center gap-2 px-4 py-2 bg-medigo-navy hover:bg-medigo-navy/90 text-white rounded-xl font-semibold transition-colors"
            >
              <Download className="w-4 h-4" /> Download
            </a>
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Amount</h3>
                <div className="text-2xl font-black text-medigo-navy">{payment.amount} {payment.currency}</div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Status</h3>
                <div className="text-sm font-semibold">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    payment.status === 'approved' ? 'bg-emerald-100 text-emerald-700'
                    : payment.status === 'pending' ? 'bg-amber-100 text-amber-700'
                    : payment.status === 'rejected' ? 'bg-red-100 text-red-700'
                    : 'bg-slate-100 text-slate-700'
                  }`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Submitted Date</h3>
                <div className="text-sm text-slate-700">
                  {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : '—'}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Transfer Reference</h3>
                <div className="text-sm text-slate-700 font-mono">
                  {payment.transferReference || '—'}
                </div>
              </div>
            </div>

            {payment.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <h4 className="font-semibold text-red-900 text-sm mb-1">Rejection Reason</h4>
                <p className="text-sm text-red-700">{payment.rejectionReason}</p>
              </div>
            )}

            {payment.verifiedAt && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <h4 className="font-semibold text-emerald-900 text-sm mb-1">Verified</h4>
                <p className="text-sm text-emerald-700">
                  {new Date(payment.verifiedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Payment Slip Preview</h3>
            <div className="bg-slate-50 rounded-2xl overflow-auto border border-slate-100">
              {payment.paymentSlipUrl.endsWith('.pdf') ? (
                <div className="p-8 flex flex-col items-center justify-center min-h-96 text-center">
                  <Eye className="w-12 h-12 text-slate-300 mb-3" />
                  <p className="text-slate-600 font-medium">PDF Preview Not Available</p>
                  <a
                    href={payment.paymentSlipUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 text-medigo-blue hover:underline font-semibold text-sm"
                  >
                    Open in New Tab →
                  </a>
                </div>
              ) : (
                <img
                  src={payment.paymentSlipUrl}
                  alt="Payment Slip"
                  className="w-full max-h-96 object-contain"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default SlipView
