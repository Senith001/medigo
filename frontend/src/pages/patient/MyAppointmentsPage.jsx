import { useState, useEffect } from 'react'
import { Calendar, Clock, Video, User, MapPin, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { apptAPI } from '../../services/api'
import Header from '../../components/common/Header'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'
import { format } from 'date-fns'

export default function MyAppointmentsPage() {
  const [appts, setAppts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [cancelling, setCancelling] = useState(null)
  const [selectedTab, setSelectedTab] = useState('upcoming')

  const fetchAppts = async () => {
    setLoading(true)
    try { 
      const r = await apptAPI.mine({ status: filter || undefined, limit: 50 }); 
      setAppts(r.data.appointments || [])
    } catch (err) {
      toast.error('Failed to load appointments')
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { fetchAppts() }, [filter])

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return
    setCancelling(id)
    try { 
      await apptAPI.cancel(id, { reason: 'Patient cancelled' }); 
      toast.success('Appointment cancelled successfully')
      fetchAppts()
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Failed to cancel appointment') 
    } finally { 
      setCancelling(null) 
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#10b981',
      completed: '#6b7280',
      cancelled: '#ef4444'
    }
    return colors[status] || '#6b7280'
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'confirmed': return '✓'
      case 'pending': return '⏳'
      case 'completed': return '✔'
      case 'cancelled': return '✗'
      default: return '○'
    }
  }

  const filteredAppts = appts.filter(appt => {
    if (selectedTab === 'upcoming') {
      return ['pending', 'confirmed'].includes(appt.status)
    } else if (selectedTab === 'past') {
      return ['completed', 'cancelled'].includes(appt.status)
    }
    return true
  })

  const statuses = ['', 'pending', 'confirmed', 'completed', 'cancelled']

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
      <Header title="My Appointments" subtitle="Manage your upcoming and past appointments" />

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: 8, 
        marginBottom: 24,
        borderBottom: '2px solid var(--gray-100)',
        paddingBottom: 12
      }}>
        <button
          onClick={() => setSelectedTab('upcoming')}
          style={{
            padding: '8px 20px',
            borderRadius: 20,
            border: 'none',
            background: selectedTab === 'upcoming' ? 'var(--primary)' : 'transparent',
            color: selectedTab === 'upcoming' ? '#fff' : 'var(--gray-600)',
            fontSize: 14,
            fontWeight: selectedTab === 'upcoming' ? 600 : 500,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Upcoming
        </button>
        <button
          onClick={() => setSelectedTab('past')}
          style={{
            padding: '8px 20px',
            borderRadius: 20,
            border: 'none',
            background: selectedTab === 'past' ? 'var(--primary)' : 'transparent',
            color: selectedTab === 'past' ? '#fff' : 'var(--gray-600)',
            fontSize: 14,
            fontWeight: selectedTab === 'past' ? 600 : 500,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Past
        </button>
      </div>

      {/* Filter Chips */}
      <div style={{ 
        display: 'flex', 
        gap: 8, 
        marginBottom: 28,
        flexWrap: 'wrap'
      }}>
        {statuses.map(s => (
          <button 
            key={s} 
            onClick={() => setFilter(s)}
            style={{
              padding: '6px 16px',
              borderRadius: 99,
              border: `1.5px solid ${filter === s ? 'var(--primary)' : 'var(--gray-200)'}`,
              background: filter === s ? 'var(--primary)' : 'var(--white)',
              color: filter === s ? '#fff' : 'var(--gray-600)',
              fontSize: 13,
              cursor: 'pointer',
              fontWeight: filter === s ? 500 : 400,
              textTransform: 'capitalize',
              transition: 'all 0.2s ease'
            }}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
          <Spinner size={40} />
        </div>
      ) : filteredAppts.length === 0 ? (
        <EmptyState 
          icon={Calendar} 
          title="No appointments found" 
          message={selectedTab === 'upcoming' 
            ? "You don't have any upcoming appointments. Book one now!" 
            : "No past appointments to show here."}
          actionText={selectedTab === 'upcoming' ? "Book an Appointment" : undefined}
          onAction={() => window.location.href = '/book-appointment'}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredAppts.map(a => (
            <div 
              key={a._id} 
              style={{
                background: 'var(--white)',
                borderRadius: 16,
                padding: 20,
                border: '1px solid var(--gray-100)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ display: 'flex', gap: 16, flex: 1 }}>
                  {/* Doctor Avatar */}
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    background: `linear-gradient(135deg, ${getStatusColor(a.status)}20, ${getStatusColor(a.status)}40)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    fontWeight: 600,
                    color: getStatusColor(a.status),
                    flexShrink: 0
                  }}>
                    {a.doctorName?.[0]?.toUpperCase() || 'D'}
                  </div>

                  {/* Appointment Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontSize: 18, 
                      fontWeight: 600, 
                      color: 'var(--gray-800)',
                      marginBottom: 4
                    }}>
                      {a.doctorName}
                    </div>
                    <div style={{ 
                      fontSize: 14, 
                      color: 'var(--gray-500)',
                      marginBottom: 12
                    }}>
                      {a.specialty}
                    </div>
                    
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={14} color="var(--gray-400)" />
                        <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>
                          {format(new Date(a.appointmentDate), 'EEE, dd MMM yyyy')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={14} color="var(--gray-400)" />
                        <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>
                          {a.timeSlot}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <User size={14} color="var(--gray-400)" />
                        <span style={{ fontSize: 13, color: 'var(--gray-600)', textTransform: 'capitalize' }}>
                          {a.type}
                        </span>
                      </div>
                    </div>

                    {a.meetingLink && a.status === 'confirmed' && (
                      <a 
                        href={a.meetingLink} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 13,
                          color: 'var(--primary)',
                          marginTop: 8,
                          textDecoration: 'none',
                          fontWeight: 500
                        }}
                      >
                        <Video size={14} />
                        Join meeting →
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <Badge 
                      label={a.status} 
                      style={{
                        background: `${getStatusColor(a.status)}15`,
                        color: getStatusColor(a.status),
                        border: 'none',
                        padding: '4px 12px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 500
                      }}
                    />
                  </div>
                  
                  {['pending', 'confirmed'].includes(a.status) && (
                    <Button 
                      variant="danger" 
                      size="sm" 
                      loading={cancelling === a._id} 
                      onClick={() => handleCancel(a._id)}
                      style={{ padding: '6px 16px', fontSize: 13 }}
                    >
                      Cancel
                    </Button>
                  )}
                  
                  <ChevronRight size={18} color="var(--gray-300)" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {!loading && appts.length > 0 && (
        <div style={{
          marginTop: 32,
          padding: 20,
          background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--primary-lighter) 100%)',
          borderRadius: 16,
          display: 'flex',
          justifyContent: 'space-around',
          gap: 16,
          flexWrap: 'wrap'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)' }}>
              {appts.filter(a => a.status === 'confirmed').length}
            </div>
            <div style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 4 }}>Confirmed</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>
              {appts.filter(a => a.status === 'pending').length}
            </div>
            <div style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 4 }}>Pending</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#ef4444' }}>
              {appts.filter(a => a.status === 'cancelled').length}
            </div>
            <div style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 4 }}>Cancelled</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#6b7280' }}>
              {appts.filter(a => a.status === 'completed').length}
            </div>
            <div style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 4 }}>Completed</div>
          </div>
        </div>
      )}
    </div>
  )
}