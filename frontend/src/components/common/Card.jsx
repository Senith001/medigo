const Card = ({ children, style, ...props }) => (
  <div style={{
    background:'var(--white)', borderRadius:'var(--radius-lg)',
    boxShadow:'var(--shadow-sm)', border:'1px solid var(--gray-100)',
    padding:24, ...style
  }} {...props}>
    {children}
  </div>
)
export default Card
