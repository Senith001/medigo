const variants = {
  primary: { background:'var(--primary)', color:'#fff', border:'none' },
  secondary: { background:'var(--white)', color:'var(--primary)', border:'1.5px solid var(--primary)' },
  danger: { background:'var(--danger)', color:'#fff', border:'none' },
  ghost: { background:'transparent', color:'var(--gray-600)', border:'1.5px solid var(--gray-200)' },
}

const Button = ({ children, variant='primary', loading, icon: Icon, size='md', ...props }) => {
  const pad = size === 'sm' ? '7px 14px' : size === 'lg' ? '13px 28px' : '10px 20px'
  const fs  = size === 'sm' ? 13 : size === 'lg' ? 16 : 14
  return (
    <button {...props} disabled={loading || props.disabled} style={{
      display:'inline-flex', alignItems:'center', gap:7, padding:pad, fontSize:fs,
      fontWeight:500, borderRadius:'var(--radius)', cursor:'pointer', transition:'opacity .15s, transform .1s',
      opacity: (loading || props.disabled) ? 0.6 : 1,
      ...variants[variant], ...props.style
    }}
    onMouseEnter={e => { if (!loading && !props.disabled) e.target.style.opacity = 0.88 }}
    onMouseLeave={e => { if (!loading && !props.disabled) e.target.style.opacity = 1 }}
    >
      {Icon && <Icon size={16} />}
      {loading ? 'Loading…' : children}
    </button>
  )
}
export default Button
