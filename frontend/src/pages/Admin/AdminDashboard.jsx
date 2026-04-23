import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, Users, Stethoscope, CreditCard,
  Calendar, ArrowUpRight, ArrowDownRight,
  Clock, CheckCircle2, XCircle, Loader2,
  Activity, BarChart3, DollarSign, RefreshCw,
  AlertCircle, BadgeCheck
} from 'lucide-react'
import { paymentAPI, adminAPI, appointmentAPI } from '../../services/api'

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString()
const now = new Date()
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// ── Inline SVG Bar Chart ───────────────────────────────────────────────────────
function BarChart({ data, color = '#008080', height = 140 }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data.map(d => d.value), 1)
  const w = 100 / data.length

  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      {data.map((d, i) => {
        const barH = (d.value / max) * (height - 24)
        const x = i * w + w * 0.15
        const barW = w * 0.7
        const y = height - 20 - barH
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx="2" fill={color} opacity="0.85" />
            <text
              x={x + barW / 2} y={height - 4}
              textAnchor="middle"
              fontSize="5"
              fill="#94a3b8"
              fontFamily="sans-serif"
            >
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Inline SVG Line Chart ──────────────────────────────────────────────────────
function LineChart({ data, color = '#008080', height = 120 }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data.map(d => d.value), 1)
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 92 + 4
    const y = height - 20 - (d.value / max) * (height - 30)
    return `${x},${y}`
  })
  const fillPts = [`4,${height - 20}`, ...pts, `96,${height - 20}`].join(' ')

  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill="url(#lineGrad)" />
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * 92 + 4
        const y = height - 20 - (d.value / max) * (height - 30)
        return <circle key={i} cx={x} cy={y} r="1.4" fill={color} />
      })}
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * 92 + 4
        return (
          <text key={i} x={x} y={height - 4} textAnchor="middle" fontSize="5" fill="#94a3b8" fontFamily="sans-serif">
            {d.label}
          </text>
        )
      })}
    </svg>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, trend, delay = 0 }) {
  const isUp = trend >= 0
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-[2rem] border border-slate-100 p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-all group"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${color}`}>
        <Icon size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-medigo-navy tracking-tighter leading-none mt-1">{value}</p>
        {sub && <p className="text-[11px] text-slate-400 font-medium mt-1">{sub}</p>}
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-[11px] font-black ${isUp ? 'text-emerald-500' : 'text-red-400'}`}>
          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </div>
      )}
    </motion.div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [payments, setPayments] = useState([])
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [pmtRes, apptRes, docRes, patRes] = await Promise.allSettled([
        paymentAPI.getPendingTransfers(),
        appointmentAPI.getAllAdmin(),
        adminAPI.getDoctors(),
        adminAPI.getPatients(),
      ])

      if (pmtRes.status === 'fulfilled') {
        setPayments(pmtRes.value.data.payments || [])
      }
      if (apptRes.status === 'fulfilled') {
        setAppointments(apptRes.value.data.appointments || [])
      }
      if (docRes.status === 'fulfilled') {
        setDoctors(docRes.value.data.doctors || docRes.value.data.data || [])
      }
      if (patRes.status === 'fulfilled') {
        setPatients(patRes.value.data.patients || patRes.value.data.data || [])
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalIncome = useMemo(() =>
    appointments
      .filter(a => a.paymentStatus === 'paid')
      .reduce((sum, a) => sum + (a.fee || 0), 0),
    [appointments]
  )

  const pendingIncome = useMemo(() =>
    payments.reduce((sum, p) => sum + (p.amount || 0), 0),
    [payments]
  )

  const confirmedAppts = appointments.filter(a => a.status === 'confirmed').length
  const completedAppts = appointments.filter(a => a.status === 'completed').length
  const cancelledAppts = appointments.filter(a => a.status === 'cancelled').length
  const verifiedDoctors = doctors.filter(d => d.isVerified || d.status === 'active').length

  // ── Monthly income bar chart (last 6 months) ───────────────────────────────
  const monthlyIncome = useMemo(() => {
    const buckets = {}
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      buckets[`${d.getFullYear()}-${d.getMonth()}`] = { label: MONTHS[d.getMonth()], value: 0 }
    }
    appointments
      .filter(a => a.paymentStatus === 'paid' && a.appointmentDate)
      .forEach(a => {
        const d = new Date(a.appointmentDate)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        if (buckets[key]) buckets[key].value += a.fee || 0
      })
    return Object.values(buckets)
  }, [appointments])

  // ── Daily appointments line chart (last 7 days) ────────────────────────────
  const weeklyAppts = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i))
      return {
        label: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2),
        dateStr: d.toISOString().split('T')[0],
        value: 0,
      }
    })
    appointments.forEach(a => {
      const dateStr = (a.appointmentDate || '').split('T')[0]
      const day = days.find(d => d.dateStr === dateStr)
      if (day) day.value++
    })
    return days
  }, [appointments])

  // ── Appointment status donut data ──────────────────────────────────────────
  const statusBreakdown = [
    { label: 'Confirmed', value: confirmedAppts, color: '#3b82f6' },
    { label: 'Completed', value: completedAppts, color: '#10b981' },
    { label: 'Cancelled', value: cancelledAppts, color: '#ef4444' },
    { label: 'Pending', value: appointments.filter(a => a.status === 'pending').length, color: '#f59e0b' },
  ]
  const totalAppts = Math.max(statusBreakdown.reduce((s, d) => s + d.value, 0), 1)

  // ── Recent appointments ────────────────────────────────────────────────────
  const recentAppts = useMemo(() =>
    [...appointments]
      .sort((a, b) => new Date(b.createdAt || b.appointmentDate) - new Date(a.createdAt || a.appointmentDate))
      .slice(0, 6),
    [appointments]
  )

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-300">
        <Loader2 size={48} className="animate-spin text-[#008080]" />
        <p className="text-xs font-black uppercase tracking-widest">Loading Analytics…</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-black text-[#008080] uppercase tracking-widest mb-1">Overview</p>
          <h1 className="text-3xl font-black text-medigo-navy tracking-tight">
            Admin <span className="text-[#008080]">Dashboard</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">
            Platform analytics and operational overview
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="self-start sm:self-auto flex items-center gap-2 px-5 py-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-[#008080] hover:border-[#008080]/30 transition-all shadow-sm text-sm font-bold"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── KPI Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`LKR ${fmt(totalIncome)}`}
          sub={`+LKR ${fmt(pendingIncome)} pending`}
          color="text-emerald-600 bg-emerald-50 border-emerald-100"
          trend={12}
          delay={0}
        />
        <StatCard
          icon={Calendar}
          label="Total Appointments"
          value={fmt(appointments.length)}
          sub={`${confirmedAppts} confirmed`}
          color="text-medigo-blue bg-blue-50 border-blue-100"
          trend={8}
          delay={0.05}
        />
        <StatCard
          icon={Stethoscope}
          label="Active Doctors"
          value={fmt(verifiedDoctors)}
          sub={`${fmt(doctors.length)} registered`}
          color="text-indigo-600 bg-indigo-50 border-indigo-100"
          trend={2}
          delay={0.1}
        />
        <StatCard
          icon={Users}
          label="Total Patients"
          value={fmt(patients.length)}
          sub="Registered on platform"
          color="text-teal-600 bg-teal-50 border-teal-100"
          trend={15}
          delay={0.15}
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Monthly Income Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 p-7 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue</p>
              <h3 className="text-lg font-black text-medigo-navy">Monthly Income</h3>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <BarChart3 size={14} className="text-emerald-600" />
              <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Last 6 months</span>
            </div>
          </div>

          {/* Value labels above bars */}
          <div className="flex justify-around mb-1">
            {monthlyIncome.map((d, i) => (
              <div key={i} className="text-center">
                <p className="text-[9px] font-black text-slate-400">
                  {d.value > 0 ? `${Math.round(d.value / 1000)}k` : '–'}
                </p>
              </div>
            ))}
          </div>

          <BarChart data={monthlyIncome} color="#008080" height={160} />

          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-3">
            <TrendingUp size={14} className="text-emerald-500" />
            <p className="text-xs text-slate-400 font-bold">
              Total collected revenue: <span className="text-medigo-navy font-black">LKR {fmt(totalIncome)}</span>
            </p>
          </div>
        </motion.div>

        {/* Appointment Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white rounded-[2rem] border border-slate-100 p-7 shadow-sm"
        >
          <div className="mb-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Breakdown</p>
            <h3 className="text-lg font-black text-medigo-navy">Appointment Status</h3>
          </div>

          {/* Stacked progress bar */}
          <div className="flex h-4 rounded-full overflow-hidden gap-0.5 mb-6">
            {statusBreakdown.map((s, i) => (
              <div
                key={i}
                title={s.label}
                style={{ width: `${(s.value / totalAppts) * 100}%`, background: s.color }}
              />
            ))}
          </div>

          <div className="space-y-4">
            {statusBreakdown.map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="text-sm font-bold text-slate-500">{s.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-medigo-navy">{s.value}</span>
                  <span className="text-[10px] text-slate-400 ml-1.5">
                    ({Math.round((s.value / totalAppts) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-2">
            <Activity size={13} className="text-slate-300" />
            <p className="text-[11px] text-slate-400 font-bold">
              {completedAppts} completed · {cancelledAppts} cancelled
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Second Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Weekly Appointments Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-[2rem] border border-slate-100 p-7 shadow-sm"
        >
          <div className="mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Activity</p>
            <h3 className="text-lg font-black text-medigo-navy">This Week</h3>
          </div>
          <LineChart data={weeklyAppts} color="#3b82f6" height={130} />
          <p className="text-[11px] text-slate-400 font-bold mt-3 flex items-center gap-1.5">
            <Calendar size={11} /> Daily appointment bookings
          </p>
        </motion.div>

        {/* Platform Health */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }}
          className="bg-white rounded-[2rem] border border-slate-100 p-7 shadow-sm"
        >
          <div className="mb-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Health</p>
            <h3 className="text-lg font-black text-medigo-navy">Platform Metrics</h3>
          </div>
          <div className="space-y-5">
            {[
              { label: 'Appointment Fill Rate', value: Math.min(100, Math.round((confirmedAppts / Math.max(appointments.length, 1)) * 100)), color: '#3b82f6' },
              { label: 'Completion Rate', value: Math.min(100, Math.round((completedAppts / Math.max(appointments.length, 1)) * 100)), color: '#10b981' },
              { label: 'Doctor Verified Rate', value: Math.min(100, Math.round((verifiedDoctors / Math.max(doctors.length, 1)) * 100)), color: '#8b5cf6' },
              { label: 'Pending Approvals', value: Math.min(100, payments.length * 5), color: '#f59e0b', raw: payments.length },
            ].map(m => (
              <div key={m.label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-500">{m.label}</span>
                  <span className="text-[11px] font-black text-medigo-navy">
                    {m.raw !== undefined ? m.raw : `${m.value}%`}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${m.value}%`, background: m.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pending Transfers Alert */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}
          className={`rounded-[2rem] border p-7 shadow-sm ${payments.length > 0
            ? 'bg-amber-50 border-amber-100'
            : 'bg-emerald-50 border-emerald-100'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            {payments.length > 0
              ? <AlertCircle size={22} className="text-amber-500" />
              : <BadgeCheck size={22} className="text-emerald-500" />
            }
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">{payments.length > 0 ? 'Action Required' : 'All Clear'}</p>
              <h3 className="text-lg font-black text-medigo-navy">
                {payments.length > 0 ? 'Pending Approvals' : 'No Pending'}
              </h3>
            </div>
          </div>

          {payments.length > 0 ? (
            <div className="space-y-3">
              {payments.slice(0, 4).map(p => (
                <div key={p._id} className="flex items-center justify-between bg-white/70 rounded-2xl px-4 py-3">
                  <div>
                    <p className="text-sm font-black text-medigo-navy truncate max-w-[120px]">{p.patientName}</p>
                    <p className="text-[10px] text-amber-600 font-bold">
                      <Clock size={9} className="inline mr-1" />{new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm font-black text-medigo-navy">LKR {fmt(p.amount)}</span>
                </div>
              ))}
              {payments.length > 4 && (
                <p className="text-[10px] text-amber-600 font-black text-center pt-1">
                  +{payments.length - 4} more awaiting review
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-emerald-600 font-bold mt-2">
              All bank transfers have been reviewed and processed.
            </p>
          )}
        </motion.div>
      </div>

      {/* ── Recent Appointments Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="p-7 pb-0 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Latest</p>
            <h3 className="text-lg font-black text-medigo-navy">Recent Appointments</h3>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {['Patient', 'Doctor', 'Date', 'Type', 'Status', 'Fee'].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentAppts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-300 font-bold text-sm">No appointments yet</td>
                </tr>
              ) : recentAppts.map(a => (
                <tr key={a._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-medigo-navy">{a.patientName || '—'}</p>
                    <p className="text-[10px] text-slate-400">{a.patientEmail || ''}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-600">{a.doctorName || '—'}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-500">
                    {a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                      a.type === 'telemedicine'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {a.type === 'telemedicine' ? 'Video' : 'In-person'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${{
                      confirmed: 'bg-blue-50 text-blue-600',
                      completed: 'bg-emerald-50 text-emerald-600',
                      cancelled: 'bg-red-50 text-red-500',
                      pending:   'bg-amber-50 text-amber-600',
                    }[a.status] || 'bg-slate-50 text-slate-400'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-medigo-navy">
                    LKR {fmt(a.fee)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}