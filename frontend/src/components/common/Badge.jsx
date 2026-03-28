const colors = {
  pending:   { bg:'#FEF3C7', color:'#92400E' },
  confirmed: { bg:'#D1FAE5', color:'#065F46' },
  completed: { bg:'#DBEAFE', color:'#1E40AF' },
  cancelled: { bg:'#FEE2E2', color:'#991B1B' },
  'no-show': { bg:'#F3F4F6', color:'#374151' },
  paid:      { bg:'#D1FAE5', color:'#065F46' },
  unpaid:    { bg:'#FEF3C7', color:'#92400E' },
  refunded:  { bg:'#DBEAFE', color:'#1E40AF' },
  active:    { bg:'#D1FAE5', color:'#065F46' },
  doctor:    { bg:'#EDE9FE', color:'#5B21B6' },
  patient:   { bg:'#DBEAFE', color:'#1E40AF' },
  admin:     { bg:'#FEE2E2', color:'#991B1B' },
  superadmin:{ bg:'#FDF4FF', color:'#701A75' },
}

const Badge = ({ label, style }) => {
  const c = colors[label?.toLowerCase()] || { bg:'var(--gray-100)', color:'var(--gray-700)' }
  return (
    <span style={{
      display:'inline-block', padding:'3px 10px', borderRadius:99,
      fontSize:12, fontWeight:500, background:c.bg, color:c.color, ...style
    }}>
      {label}
    </span>
  )
}
export default Badge
