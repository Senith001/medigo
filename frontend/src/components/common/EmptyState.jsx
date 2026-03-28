import { Inbox } from 'lucide-react'
const EmptyState = ({ icon: Icon = Inbox, title, message, action }) => (
  <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12,padding:'60px 24px',color:'var(--gray-400)'}}>
    <Icon size={40} strokeWidth={1.2} />
    <div style={{textAlign:'center'}}>
      <p style={{fontWeight:500,color:'var(--gray-600)',marginBottom:4}}>{title}</p>
      {message && <p style={{fontSize:13}}>{message}</p>}
    </div>
    {action}
  </div>
)
export default EmptyState
