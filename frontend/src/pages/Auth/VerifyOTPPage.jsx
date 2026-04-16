import { useState } from 'react';
import { useLocation, useNavigate, Navigate, Link } from 'react-router-dom';
import { ShieldCheck, MessageSquare, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/AuthLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const email = location.state?.email;

  if (!email) return <Navigate to="/register" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError('Please enter the full verification code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await authAPI.verifyOtp({ email, otp });
      login(res.data.token, res.data.data);
      navigate('/dashboard'); 
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    // Future implementation for resend logic
    setTimeout(() => {
      setResending(false);
      // In a real app, you'd call an API here
    }, 1500);
  };

  return (
    <AuthLayout 
      title="Verify Your Email" 
      subtitle={`We've sent a 6-digit verification code to ${email}. Please enter it below to secure your account.`}
      image="https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=1600&q=80&fit=crop"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-600"
            >
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}

          <div className="space-y-4">
            <Input 
              label="Verification Code" 
              placeholder="e.g. 123456" 
              maxLength={6}
              className="text-center text-3xl font-black tracking-[0.5em] h-16 placeholder:text-slate-200 placeholder:tracking-normal"
              icon={ShieldCheck} 
              value={otp} 
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
              required 
            />
            
            <div className="flex items-center justify-between px-1">
               <span className="text-xs text-slate-400 font-medium font-inter">Didn't receive the code?</span>
               <button 
                 type="button" 
                 onClick={handleResend}
                 disabled={resending}
                 className="text-xs font-bold text-medigo-blue hover:text-medigo-blue-dark flex items-center gap-1.5 transition-colors disabled:opacity-50"
               >
                 {resending ? <RefreshCw size={12} className="animate-spin" /> : <MessageSquare size={12} />}
                 {resending ? 'Sending...' : 'Resend Code'}
               </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12" 
            loading={loading}
          >
            Verify & Create Account <ArrowRight size={18} className="ml-2" />
          </Button>
        </form>

        <div className="mt-10 pt-10 border-t border-slate-100 text-center">
           <Link to="/register" className="text-sm text-slate-400 font-medium hover:text-slate-600 transition-colors uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full">
             Back to registration
           </Link>
        </div>
      </motion.div>
    </AuthLayout>
  );
}