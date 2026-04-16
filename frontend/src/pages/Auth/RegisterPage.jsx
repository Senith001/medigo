import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, UserPlus, ChevronRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { authAPI } from '../../services/api';
import AuthLayout from '../../components/AuthLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await authAPI.register(formData);
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join Medigo today. Quality healthcare is just a few clicks away."
      image="https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1600&q=80&fit=crop"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
            label="Full Name" 
            name="fullName" 
            placeholder="John Doe" 
            icon={User} 
            value={formData.fullName}
            onChange={handleChange}
            required 
          />

          <Input 
            label="Email Address" 
            name="email" 
            type="email" 
            placeholder="john@example.com" 
            icon={Mail} 
            value={formData.email}
            onChange={handleChange}
            required 
          />

          <Input 
            label="Phone Number" 
            name="phone" 
            type="tel" 
            placeholder="+94 77 123 4567" 
            icon={Phone} 
            value={formData.phone}
            onChange={handleChange}
            required 
          />

          <Input 
            label="Password" 
            name="password" 
            type="password" 
            placeholder="Min. 8 characters" 
            icon={Lock} 
            value={formData.password}
            onChange={handleChange}
            required 
          />

          <div className="flex items-start gap-2 px-1 py-1">
             <input type="checkbox" id="terms" className="mt-1 w-4 h-4 rounded border-slate-300 text-medigo-blue focus:ring-medigo-blue" required />
             <label htmlFor="terms" className="text-[13px] text-slate-500 font-medium cursor-pointer select-none leading-tight">
                I agree to the <Link to="/terms" className="text-medigo-blue hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-medigo-blue hover:underline">Privacy Policy</Link>.
             </label>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 mt-2" 
            loading={loading}
          >
            <UserPlus size={18} className="mr-2" />
            Create Patient Account
          </Button>

          <div className="flex items-center justify-center gap-2 py-2 text-slate-400">
             <ShieldCheck size={14} />
             <span className="text-[11px] font-bold uppercase tracking-widest">Secure HIPAA-compliant registration</span>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-medigo-blue font-bold hover:underline inline-flex items-center">
              Log in here <ChevronRight size={16} />
            </Link>
          </p>
        </div>
      </motion.div>
    </AuthLayout>
  );
}