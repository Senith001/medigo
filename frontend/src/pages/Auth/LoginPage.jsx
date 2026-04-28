import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, ChevronRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/AuthLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await authAPI.login(credentials)
      const data = res.data.data
      const tok = res.data.token


      login(tok, data)


      await new Promise(r => setTimeout(r, 50))

      const role = data?.role
      if (role === 'doctor') {
        navigate('/doctor', { replace: true })
      } else if (['admin', 'superadmin'].includes(role)) {
        navigate('/admin', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to manage your health and consultations."
      image="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&q=80&fit=crop"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-600"
            >
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}

          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="name@example.com"
            icon={Mail}
            value={credentials.email}
            onChange={handleChange}
            required
          />

          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Password
              </label>
              <Link to="/forgot-password" size="xs" className="text-xs font-bold text-medigo-blue hover:text-medigo-blue-dark">
                Forgot password?
              </Link>
            </div>
            <Input
              name="password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex items-center gap-2 px-1">
            <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-medigo-blue focus:ring-medigo-blue" />
            <label htmlFor="remember" className="text-sm text-slate-500 font-medium cursor-pointer select-none">
              Stay signed in for 30 days
            </label>
          </div>

          <Button
            type="submit"
            className="w-full h-12"
            loading={loading}
          >
            <LogIn size={18} className="mr-2" />
            Sign In to MediGo
          </Button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500 font-medium">
            New to MediGo?{' '}
            <Link to="/register" className="text-medigo-blue font-bold hover:underline inline-flex items-center">
              Create a patient account <ChevronRight size={16} />
            </Link>
          </p>

          <div className="mt-4">
            <Link to="/doctor-register" className="text-xs text-slate-400 font-bold hover:text-slate-600 transition-colors uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full">
              Are you a doctor? Join our network
            </Link>
          </div>
        </div>
      </motion.div>
    </AuthLayout>
  );
}