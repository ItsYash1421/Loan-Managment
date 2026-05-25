'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { setAuth, getUser, isAuthenticated } from '@/lib/auth';
import toast from 'react-hot-toast';
import { 
  ShieldCheck, User, BarChart, CheckCircle, Wallet, 
  CreditCard, Lock, Mail, ArrowRight, UserPlus, Fingerprint 
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Protect route - prevent logged-in users from seeing login page
  useEffect(() => {
    if (isAuthenticated()) {
      const user = getUser();
      if (user?.role === 'BORROWER') {
        router.replace('/borrower/dashboard');
      } else if (user) {
        router.replace('/dashboard');
      } else {
        setIsCheckingAuth(false);
      }
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  const executeSubmit = async (submitData: any, isLoginMode: boolean) => {
    setLoading(true);
    try {
      const endpoint = isLoginMode ? '/auth/login' : '/auth/signup';
      const response = await api.post(endpoint, submitData);

      setAuth(response.data.token, response.data.user);
      toast.success(isLoginMode ? '🎉 Welcome back!' : '✨ Account created successfully!');

      if (response.data.user.role === 'BORROWER') {
        router.replace('/borrower/dashboard');
      } else {
        router.replace('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeSubmit(formData, isLogin);
  };

  const quickLogin = (email: string, password: string) => {
    setIsLogin(true);
    const newFormData = { ...formData, email, password };
    setFormData(newFormData);
    executeSubmit(newFormData, true);
  };

  const testAccounts = [
    { role: 'Admin', email: 'admin@lms.com', password: 'admin123', icon: ShieldCheck, color: 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border-rose-200 shadow-rose-500/20' },
    { role: 'Borrower', email: 'borrower@lms.com', password: 'borrower123', icon: User, color: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white border-blue-200 shadow-blue-500/20' },
    { role: 'Sales', email: 'sales@lms.com', password: 'sales123', icon: BarChart, color: 'bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white border-purple-200 shadow-purple-500/20' },
    { role: 'Sanction', email: 'sanction@lms.com', password: 'sanction123', icon: CheckCircle, color: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white border-orange-200 shadow-orange-500/20' },
    { role: 'Disburse', email: 'disbursement@lms.com', password: 'disbursement123', icon: Wallet, color: 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border-emerald-200 shadow-emerald-500/20' },
    { role: 'Collect', email: 'collection@lms.com', password: 'collection123', icon: CreditCard, color: 'bg-teal-500/10 text-teal-500 hover:bg-teal-500 hover:text-white border-teal-200 shadow-teal-500/20' }
  ];

  if (isCheckingAuth) {
    return (
      <div className="h-screen w-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#0f172a] overflow-hidden flex items-center justify-center p-4 sm:p-8 relative selection:bg-indigo-500/30">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} 
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/30 rounded-full blur-[150px] mix-blend-screen"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }} 
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[150px] mix-blend-screen"
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }} 
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-pink-600/20 rounded-full blur-[120px] mix-blend-screen"
        />
      </div>

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-6xl h-[90vh] min-h-[600px] max-h-[800px] bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_rgba(79,70,229,0.15)] flex overflow-hidden"
      >
        
        {/* Left Side - Branding (Hidden on mobile) */}
        <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-r border-white/5">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative z-10"
          >
            <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl shadow-indigo-500/30 mb-8 border border-white/10">
              <ShieldCheck className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-5xl font-black text-white leading-tight tracking-tight">
              Next-Gen <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
                Loan Management
              </span>
            </h1>
            <p className="mt-6 text-lg text-indigo-200/80 max-w-md font-medium leading-relaxed">
              Streamline your lending operations from application to disbursement with our intelligent, automated platform.
            </p>
          </motion.div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 bg-white flex flex-col relative overflow-hidden h-full">
          <div className="h-full overflow-y-auto custom-scrollbar p-8 sm:p-12">
            <div className="max-w-md w-full mx-auto flex flex-col min-h-full">
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-center lg:text-left mb-8 mt-auto"
              >
                <div className="lg:hidden inline-flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg mb-6">
                  <ShieldCheck className="w-8 h-8 text-white" strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3 justify-center lg:justify-start">
                  {isLogin ? 'Welcome back' : 'Create account'}
                </h2>
                <p className="text-gray-500 mt-2 font-medium">
                  {isLogin ? 'Please enter your details to sign in.' : 'Enter your details to get started.'}
                </p>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div
                      key="fullName"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-indigo-500" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 outline-none text-gray-900 font-medium shadow-sm"
                        placeholder="John Doe"
                        required={!isLogin}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-500" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 outline-none text-gray-900 font-medium shadow-sm"
                    placeholder="you@example.com"
                    required
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                      <Lock className="w-4 h-4 text-indigo-500" />
                      Password
                    </label>
                  </div>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 outline-none text-gray-900 font-medium shadow-sm"
                    placeholder="••••••••"
                    required
                  />
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.01, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white py-4 rounded-xl hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm tracking-wide shadow-lg shadow-gray-900/20 mt-2 flex items-center justify-center gap-2 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Authenticating...
                    </>
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </form>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="mt-8 text-center"
              >
                <p className="text-sm font-medium text-gray-600">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setFormData({ email: '', password: '', fullName: '' });
                    }}
                    className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline decoration-2 underline-offset-4 transition-all"
                  >
                    {isLogin ? 'Sign up' : 'Log in'}
                  </button>
                </p>
              </motion.div>

              {/* Quick Access Badges */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="mt-auto pt-8 pb-4 border-t border-gray-100"
              >
                <div className="flex items-center gap-2 justify-center mb-4 text-gray-400">
                  <Fingerprint className="w-4 h-4" />
                  <p className="text-xs font-bold uppercase tracking-wider text-center">Quick Test Access</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {testAccounts.map((acc, idx) => {
                    const Icon = acc.icon;
                    return (
                      <motion.button
                        key={acc.email}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => quickLogin(acc.email, acc.password)}
                        className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 rounded-xl border-2 text-xs font-bold transition-all duration-300 hover:shadow-lg ${acc.color}`}
                        title={`Login as ${acc.role}`}
                      >
                        <Icon className="w-4 h-4" strokeWidth={2.5} />
                        <span className="hidden sm:inline">{acc.role}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
      `}</style>
    </div>
  );
}
