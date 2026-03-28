import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LogOut } from 'lucide-react'
import toast from 'react-hot-toast'

const Sidebar = ({ items, role }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  const roleColors = { patient:'var(--primary)', doctor:'#7C3AED', admin:'#DC2626', superadmin:'#DC2626' }
  const roleColor = roleColors[user?.role] || 'var(--primary)'

  return (
    <aside style={{
      width:'var(--sidebar-w)', height:'100vh', position:'fixed', left:0, top:0,
      background:'var(--white)', borderRight:'1px solid var(--gray-100)',
      display:'flex', flexDirection:'column', zIndex:100
    }}>
      {/* Logo */}
      <div style={{padding:'20px 24px', borderBottom:'1px solid var(--gray-100)'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:roleColor,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{color:'#fff',fontFamily:'var(--font-serif)',fontSize:18,fontWeight:400}}>M</span>
          </div>
          <div>
            <div style={{fontFamily:'var(--font-serif)',fontSize:17,color:'var(--gray-900)'}}>MEDIGO</div>
            <div style={{fontSize:11,color:'var(--gray-400)',textTransform:'capitalize'}}>{user?.role}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{flex:1,padding:'12px 12px',overflowY:'auto',display:'flex',flexDirection:'column',gap:2}}>
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to.split('/').length === 2}
            style={({ isActive }) => ({
              display:'flex', alignItems:'center', gap:10, padding:'9px 12px',
              borderRadius:'var(--radius)', fontSize:14, fontWeight: isActive ? 500 : 400,
              color: isActive ? roleColor : 'var(--gray-600)',
              background: isActive ? (roleColor === 'var(--primary)' ? 'var(--primary-light)' : `${roleColor}15`) : 'transparent',
              transition:'all .15s'
            })}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div style={{padding:'16px 12px',borderTop:'1px solid var(--gray-100)'}}>
        <div style={{padding:'0 4px 12px',display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:32,height:32,borderRadius:'50%',background:'var(--primary-muted)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:600,color:'var(--primary)',flexShrink:0}}>
            {user?.fullName?.[0] || user?.email?.[0] || '?'}
          </div>
          <div style={{overflow:'hidden'}}>
            <div style={{fontSize:13,fontWeight:500,color:'var(--gray-800)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user?.fullName || user?.email}</div>
            <div style={{fontSize:11,color:'var(--gray-400)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          display:'flex',alignItems:'center',gap:8,width:'100%',padding:'9px 12px',
          border:'none',borderRadius:'var(--radius)',background:'transparent',
          fontSize:13,color:'var(--gray-500)',cursor:'pointer',transition:'background .15s'
        }}
        onMouseEnter={e=>e.currentTarget.style.background='var(--gray-50)'}
        onMouseLeave={e=>e.currentTarget.style.background='transparent'}
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  )
}
export default Sidebar
