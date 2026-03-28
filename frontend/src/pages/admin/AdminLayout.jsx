import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/common/Sidebar'
import { LayoutDashboard, Stethoscope, Users, Shield, Bell } from 'lucide-react'

const nav = [
  { to:'/admin',                label:'Dashboard',     icon:LayoutDashboard },
  { to:'/admin/doctors',        label:'Doctors',       icon:Stethoscope },
  { to:'/admin/patients',       label:'Patients',      icon:Users },
  { to:'/admin/admins',         label:'Admins',        icon:Shield },
  { to:'/admin/notifications',  label:'Notifications', icon:Bell },
]

export default function AdminLayout() {
  return (
    <div style={{display:'flex',minHeight:'100vh'}}>
      <Sidebar items={nav} />
      <main style={{marginLeft:'var(--sidebar-w)',flex:1,padding:32,overflowY:'auto'}}>
        <Outlet />
      </main>
    </div>
  )
}
