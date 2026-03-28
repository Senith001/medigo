import { useState, useEffect } from 'react'
import { paymentAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { CreditCard } from 'lucide-react'
import { format } from 'date-fns'

export default function PatientPayments() {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    paymentAPI.getByPatient(user?.userId).then(r => setPayments(r.data.payments || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const statusBadge = (s) => {
    const m = { paid: 'badge-green', pending: 'badge-amber', failed: 'badge-red', cancelled: 'badge-red', refunded: 'badge-blue' }
    return <span className={`badge ${m[s] || 'badge-gray'}`}>{s}</span>
  }

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Payment History</h1></div>
      <div className="card">
        {loading ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          : payments.length === 0 ? <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-400)' }}><CreditCard size={40} style={{ margin: '0 auto 12px' }} /><p>No payments yet</p></div>
          : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Invoice</th><th>Doctor</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p._id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.invoiceNumber}</td>
                      <td>{p.doctorName}</td>
                      <td style={{ fontWeight: 600 }}>{p.currency} {p.amount.toLocaleString()}</td>
                      <td><span className="badge badge-gray">{p.paymentMethod}</span></td>
                      <td>{format(new Date(p.createdAt), 'dd MMM yyyy')}</td>
                      <td>{statusBadge(p.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  )
}
