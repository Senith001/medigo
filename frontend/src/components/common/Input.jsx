const Input = ({ label, error, icon: Icon, ...props }) => (
  <div style={{display:'flex',flexDirection:'column',gap:6}}>
    {label && <label style={{fontSize:13,fontWeight:500,color:'var(--gray-700)'}}>{label}</label>}
    <div style={{position:'relative'}}>
      {Icon && <Icon size={16} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--gray-400)',pointerEvents:'none'}} />}
      <input {...props} style={{
        width:'100%', padding: Icon ? '10px 12px 10px 38px' : '10px 12px',
        border: `1.5px solid ${error ? 'var(--danger)' : 'var(--gray-200)'}`,
        borderRadius:'var(--radius)', fontSize:14, outline:'none', background:'var(--white)',
        transition:'border-color .15s',
        ...props.style
      }}
      onFocus={e => e.target.style.borderColor = error ? 'var(--danger)' : 'var(--primary)'}
      onBlur={e => e.target.style.borderColor = error ? 'var(--danger)' : 'var(--gray-200)'}
      />
    </div>
    {error && <span style={{fontSize:12,color:'var(--danger)'}}>{error}</span>}
  </div>
)
export default Input
