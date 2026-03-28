import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { notifAPI } from '../../services/api'
import Header from '../../components/common/Header'
import Badge from '../../components/common/Badge'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'
import { format } from 'date-fns'

export default function AdminNotifications() {
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(()=>{
    notifAPI.all({ status:filter||undefined, limit:100 }).then(r=>setNotifs(r.data.notifications||[])).catch(()=>{}).finally(()=>setLoading(false))
  },[filter])

  return (
    <div>
      <Header title="Notification Logs" subtitle="Email and SMS delivery records" />
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {['','sent','failed'].map(s=>(
          <button key={s} onClick={()=>setFilter(s)}
            style={{padding:'7px 16px',borderRadius:99,border:`1.5px solid ${filter===s?'var(--primary)':'var(--gray-200)'}`,background:filter===s?'var(--primary)':'var(--white)',color:filter===s?'#fff':'var(--gray-600)',fontSize:13,cursor:'pointer',textTransform:'capitalize'}}>
            {s||'All'}
          </button>
        ))}
      </div>
      {loading ? (
        <div style={{display:'flex',justifyContent:'center',paddingTop:60}}><Spinner size={36}/></div>
      ) : notifs.length===0 ? (
        <EmptyState icon={Bell} title="No notification logs" />
      ) : (
        <div style={{background:'var(--white)',borderRadius:'var(--radius-lg)',border:'1px solid var(--gray-100)',overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'var(--gray-50)',borderBottom:'1px solid var(--gray-100)'}}>
                {['Recipient','Type','Channel','Status','Date'].map(h=>(
                  <th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:12,fontWeight:600,color:'var(--gray-500)',textTransform:'uppercase',letterSpacing:.5}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {notifs.map(n=>(
                <tr key={n._id} style={{borderBottom:'1px solid var(--gray-100)'}}>
                  <td style={{padding:'14px 16px'}}>
                    <div style={{fontWeight:500,color:'var(--gray-800)',fontSize:13}}>{n.recipientName||'—'}</div>
                    <div style={{fontSize:12,color:'var(--gray-400)'}}>{n.recipientEmail}</div>
                  </td>
                  <td style={{padding:'14px 16px',fontSize:12,color:'var(--gray-600)'}}>{n.type?.replace(/_/g,' ')}</td>
                  <td style={{padding:'14px 16px'}}><Badge label={n.channel}/></td>
                  <td style={{padding:'14px 16px'}}><Badge label={n.status}/></td>
                  <td style={{padding:'14px 16px',fontSize:12,color:'var(--gray-500)'}}>{n.createdAt?format(new Date(n.createdAt),'dd MMM yyyy HH:mm'):'—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
