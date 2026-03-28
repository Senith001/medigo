const Header = ({ title, subtitle, actions }) => (
  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:28}}>
    <div>
      <h1 style={{fontSize:22,fontWeight:600,color:'var(--gray-900)',fontFamily:'var(--font-serif)'}}>{title}</h1>
      {subtitle && <p style={{fontSize:13,color:'var(--gray-500)',marginTop:2}}>{subtitle}</p>}
    </div>
    {actions && <div style={{display:'flex',gap:10,alignItems:'center'}}>{actions}</div>}
  </div>
)
export default Header
