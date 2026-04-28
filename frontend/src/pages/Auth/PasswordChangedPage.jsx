import { Link } from 'react-router-dom'
import { CheckCircle, LogIn } from 'lucide-react'
import { motion } from 'framer-motion'
import AuthLayout from '../../components/AuthLayout'
import Button from '../../components/ui/Button'

export default function PasswordChangedPage() {
  return (
    <AuthLayout
      title="Password Changed"
      subtitle="Your MediGo account password has been updated successfully."
      image="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1600&q=80&fit=crop"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle size={46} className="text-green-500" />
        </div>

        <h2 className="text-2xl font-extrabold text-slate-800">
          Password reset successful
        </h2>

        <p className="mt-3 text-sm text-slate-500 font-medium leading-6">
          You can now sign in to your MediGo account using your new password.
        </p>

        <Link to="/login" className="block mt-8">
          <Button className="w-full h-12">
            <LogIn size={18} className="mr-2" />
            Back to Login
          </Button>
        </Link>
      </motion.div>
    </AuthLayout>
  )
}