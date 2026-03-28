import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/common/Sidebar'
import { LayoutDashboard, Calendar, FileText, Clock, User } from 'lucide-react'

const nav = [
  { to:'/doctor',                label:'Dashboard',     icon:LayoutDashboard },
  { to:'/doctor/appointments',   label:'Appointments',  icon:Calendar },
  { to:'/doctor/prescriptions',  label:'Prescriptions', icon:FileText },
  { to:'/doctor/availability',   label:'Availability',  icon:Clock },
  { to:'/doctor/profile',        label:'Profile',       icon:User },
]

export default function DoctorLayout() {
  return (
    <div style={{display:'flex',minHeight:'100vh'}}>
      <Sidebar items={nav} />
      <main style={{marginLeft:'var(--sidebar-w)',flex:1,padding:32,overflowY:'auto'}}>
        <Outlet />
      </main>
    </div>
  )
}
