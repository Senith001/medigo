import { useState, useEffect } from 'react'
import { CreditCard } from 'lucide-react'
import { paymentAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import Header from '../../components/common/Header'
import Badge from '../../components/common/Badge'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'
import { format } from 'date-fns'

export default function PaymentsPage() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    paymentAPI.mine(user?.userId).then(r=>setPayments(r.data.payments||[])).catch(()=>{}).finally(()=>setLoading(false))
  }, [user])

  return (
    <div>
      <Header title="Payment History" subtitle="Your billing records" />
      {loading ? (
        <div style={{display:'flex',justifyContent:'center',paddingTop:60}}><Spinner size={36}/></div>
      ) : payments.length === 0 ? (
        <EmptyState icon={CreditCard} title="No payments yet" message="Your payment history will appear here" />
      ) : (
        <div style={{background:'var(--white)',borderRadius:'var(--radius-lg)',border:'1px solid var(--gray-100)',overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'var(--gray-50)',borderBottom:'1px solid var(--gray-100)'}}>
                {['Invoice','Doctor','Amount','Date','Status'].map(h=>(
                  <th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:12,fontWeight:600,color:'var(--gray-500)',textTransform:'uppercase',letterSpacing:.5}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map(p=>(
                <tr key={p._id} style={{borderBottom:'1px solid var(--gray-100)'}}>
                  <td style={{padding:'14px 16px',fontSize:13,color:'var(--gray-600)',fontFamily:'monospace'}}>{p.invoiceNumber}</td>
                  <td style={{padding:'14px 16px',fontSize:14,color:'var(--gray-800)',fontWeight:500}}>{p.doctorName}</td>
                  <td style={{padding:'14px 16px',fontSize:14,fontWeight:600,color:'var(--gray-800)'}}>{p.currency} {p.amount?.toLocaleString()}</td>
                  <td style={{padding:'14px 16px',fontSize:13,color:'var(--gray-500)'}}>{format(new Date(p.createdAt),'dd MMM yyyy')}</td>
                  <td style={{padding:'14px 16px'}}><Badge label={p.status}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
