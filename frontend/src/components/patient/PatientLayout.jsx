import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/common/Sidebar'
import { LayoutDashboard, Stethoscope, Calendar, User, FileText, CreditCard } from 'lucide-react'

const nav = [
  { to:'/patient',             label:'Dashboard',    icon:LayoutDashboard },
  { to:'/patient/doctors',     label:'Find Doctors',  icon:Stethoscope },
  { to:'/patient/appointments',label:'Appointments', icon:Calendar },
  { to:'/patient/reports',     label:'My Reports',   icon:FileText },
  { to:'/patient/payments',    label:'Payments',     icon:CreditCard },
  { to:'/patient/profile',     label:'Profile',      icon:User },
]

export default function PatientLayout() {
  return (
    <div style={{display:'flex',minHeight:'100vh'}}>
      <Sidebar items={nav} />
      <main style={{marginLeft:'var(--sidebar-w)',flex:1,padding:32,overflowY:'auto'}}>
        <Outlet />
      </main>
    </div>
  )
}
