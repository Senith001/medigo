// Shared reusable UI components

export const Spinner = ({ size = 'md' }) => {
  const s = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size]
  return <div className={`${s} border-4 border-teal/20 border-t-teal rounded-full animate-spin`}/>
}

export const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Spinner size="lg"/>
  </div>
)

export const Badge = ({ status }) => {
  const map = {
    pending:   'badge-pending',
    confirmed: 'badge-confirmed',
    completed: 'badge-completed',
    cancelled: 'badge-cancelled',
    paid:      'badge-paid',
    unpaid:    'badge-unpaid',
    active:    'badge-confirmed',
    expired:   'badge-cancelled',
  }
  return <span className={map[status] || 'badge-pending'}>{status}</span>
}

export const StatCard = ({ icon, label, value, color = 'blue', trend }) => {
  const colors = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-emerald-50 text-emerald-600',
    amber:  'bg-amber-50 text-amber-600',
    red:    'bg-red-50 text-red-600',
    teal:   'bg-teal-lighter text-teal',
    navy:   'bg-navy/10 text-navy',
  }
  return (
    <div className="card p-6 relative overflow-hidden">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${colors[color]}`}>
        {icon}
      </div>
      <div className="text-3xl font-display font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
      {trend && <div className="text-xs text-emerald-500 font-semibold mt-1">{trend}</div>}
    </div>
  )
}

export const EmptyState = ({ icon = '📭', title, message, action }) => (
  <div className="text-center py-16">
    <div className="text-5xl mb-4 opacity-40">{icon}</div>
    <h3 className="text-lg font-display font-semibold text-gray-500 mb-2">{title}</h3>
    <p className="text-sm text-gray-400 mb-4">{message}</p>
    {action}
  </div>
)

export const Alert = ({ type = 'error', message }) => {
  const styles = {
    error:   'bg-red-50 border-red-200 text-red-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    info:    'bg-teal-lighter border-teal/30 text-teal',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
  }
  const icons = { error: '⚠️', success: '✅', info: 'ℹ️', warning: '⚡' }
  return (
    <div className={`flex items-start gap-2 p-3 rounded-lg border text-sm ${styles[type]}`}>
      <span>{icons[type]}</span>
      <span>{message}</span>
    </div>
  )
}

export const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-center justify-between mb-6">
    <div>
      <h2 className="text-xl font-display font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
)
