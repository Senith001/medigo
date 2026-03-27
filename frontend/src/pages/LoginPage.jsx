import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await authAPI.login({ email, password })
      login(res.data.token, res.data.data)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', display: 'flex', flexDirection: 'column' }}>
      {/* Mini navbar */}
      <div style={{ background: 'var(--navy)', height: 60, display: 'flex', alignItems: 'center', padding: '0 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#fff' }}>
          <div style={{ width: 30, height: 30, background: 'var(--teal-500)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><rect x="11" y="3" width="2" height="18"/><rect x="3" y="11" width="18" height="2"/></svg>
          </div>
          MEDI<span style={{ color: 'var(--teal-400)' }}>GO</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, maxWidth: 880, width: '100%', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
          {/* Left — navy banner */}
          <div style={{
            background: 'linear-gradient(160deg, var(--navy) 0%, #0d2240 100%)',
            padding: '48px 40px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: 'rgba(20,184,166,.1)', top: -60, right: -60 }}/>
            <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', background: 'rgba(20,184,166,.06)', bottom: 20, left: -40 }}/>
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🏥</div>
              <h1 style={{ fontSize: 28, color: '#fff', marginBottom: 12, fontFamily: 'var(--font-display)' }}>
                Welcome to<br/>
                <span style={{ color: 'var(--teal-400)' }}>MEDIGO</span>
              </h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', lineHeight: 1.7, marginBottom: 32 }}>
                Sri Lanka's smart healthcare platform. Book appointments with verified doctors easily.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Book appointments instantly', 'Video & in-person consultations', 'Email & SMS notifications'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--teal-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,.7)' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — login form */}
          <div style={{ background: '#fff', padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ fontSize: 22, marginBottom: 4, fontFamily: 'var(--font-display)' }}>Sign In</h2>
            <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 28 }}>Enter your MEDIGO credentials</p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required/>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: 44 }}/>
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: 15 }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

              <button type="submit" className="btn btn-teal btn-lg" style={{ width: '100%', justifyContent: 'center', marginBottom: 20 }} disabled={loading}>
                {loading ? <><span className="spinner"/> Signing in…</> : 'Sign In →'}
              </button>
            </form>

            {/* Test credentials */}
            <div style={{ padding: '14px 16px', background: 'var(--teal-50)', borderRadius: 10, border: '1px solid var(--teal-100)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--teal-700)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>🧪 Test Account</p>
              <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 2 }}><span style={{ color: 'var(--gray-400)' }}>Email: </span><strong>prabashmihiranga@gmail.com</strong></p>
              <p style={{ fontSize: 13, color: 'var(--gray-600)' }}><span style={{ color: 'var(--gray-400)' }}>Password: </span><strong>Prabaa@123</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
