const Spinner = ({ size = 24, color = 'var(--primary)' }) => (
  <div style={{
    width:size, height:size, border:`2px solid var(--gray-200)`,
    borderTopColor:color, borderRadius:'50%',
    animation:'spin .7s linear infinite'
  }} />
)

// Inject keyframes once
if (!document.getElementById('medigo-spinner-style')) {
  const s = document.createElement('style')
  s.id = 'medigo-spinner-style'
  s.textContent = '@keyframes spin { to { transform: rotate(360deg) } }'
  document.head.appendChild(s)
}

export default Spinner
