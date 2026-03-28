const StatCard = ({ label, value, icon: Icon, color = 'var(--primary)', sub }) => (
  <div style={{background:'var(--white)',borderRadius:'var(--radius-lg)',padding:20,border:'1px solid var(--gray-100)',boxShadow:'var(--shadow-sm)',display:'flex',alignItems:'flex-start',gap:16}}>
    <div style={{width:44,height:44,borderRadius:12,background:`${color}15`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
      <Icon size={20} color={color} />
    </div>
    <div>
      <div style={{fontSize:26,fontWeight:700,color:'var(--gray-900)',lineHeight:1.1}}>{value}</div>
      <div style={{fontSize:13,color:'var(--gray-500)',marginTop:3}}>{label}</div>
      {sub && <div style={{fontSize:12,color:'var(--gray-400)',marginTop:2}}>{sub}</div>}
    </div>
  </div>
)
export default StatCard
