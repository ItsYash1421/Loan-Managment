'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  User, 
  ArrowLeft, 
  CreditCard, 
  Briefcase, 
  Calendar, 
  ChevronDown, 
  Check,
  BadgeIndianRupee
} from 'lucide-react';

export default function PersonalDetailsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    pan: '',
    dateOfBirth: '',
    monthlySalary: '',
    employmentMode: 'SALARIED'
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== 'BORROWER') {
      router.push('/login');
      return;
    }

    fetchPersonalDetails();
  }, [router]);

  const fetchPersonalDetails = async () => {
    try {
      const response = await api.get('/borrower/personal-details');
      if (response.data.personalDetails) {
        const pd = response.data.personalDetails;
        setFormData({
          fullName: pd.fullName,
          pan: pd.pan,
          monthlySalary: pd.monthlySalary.toString(),
          dateOfBirth: new Date(pd.dateOfBirth).toISOString().split('T')[0],
          employmentMode: pd.employmentMode
        });
      }
    } catch (error: any) {
      // It's okay if not found (new borrower)
      if (error.response?.status !== 404) {
        toast.error('Failed to load personal details');
      }
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/borrower/personal-details', {
        ...formData,
        monthlySalary: parseFloat(formData.monthlySalary)
      });

      toast.success('🎉 Personal details submitted successfully!');
      router.push('/borrower/dashboard');
    } catch (error: any) {
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err: string) => toast.error(err));
      } else {
        toast.error(error.response?.data?.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0f172a] relative overflow-hidden selection:bg-purple-500/30 flex flex-col">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[150px] mix-blend-screen"
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }} 
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[150px] mix-blend-screen"
        />
      </div>

      <nav className="relative z-20 bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 shadow-2xl shadow-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/30 border border-white/10">
                <User className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Personal <span className="text-purple-400">Details</span>
              </h1>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/borrower/dashboard')}
                className="p-2 sm:p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all duration-300 backdrop-blur-md flex items-center justify-center group hover:border-white/20"
                title="Back to Portal"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto relative z-10 flex items-start sm:items-center justify-center p-4 py-8 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl my-auto"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-white/10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight mb-3">
                Complete Your Profile
              </h2>
              <p className="text-gray-400 font-medium">
                Please provide accurate details to determine your loan eligibility and finalize your registration.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full pl-11 pr-5 py-4 bg-gray-900/50 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-medium shadow-inner"
                      placeholder="As per PAN card"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                    PAN Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <CreditCard className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={formData.pan}
                      onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      className="w-full pl-11 pr-5 py-4 bg-gray-900/50 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all uppercase font-mono shadow-inner tracking-wider"
                      required
                    />
                  </div>
                  <p className="text-xs text-purple-400/80 mt-2 font-medium">Format: 5 Letters, 4 Digits, 1 Letter</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                    Date of Birth <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                    </div>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full pl-11 pr-5 py-4 bg-gray-900/50 border border-gray-700 text-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all shadow-inner font-medium cursor-pointer"
                      required
                    />
                  </div>
                  <p className="text-xs text-purple-400/80 mt-2 font-medium">Must be between 23 - 50 years</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                    Monthly Salary (₹) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <BadgeIndianRupee className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                    </div>
                    <input
                      type="number"
                      value={formData.monthlySalary}
                      onChange={(e) => setFormData({ ...formData, monthlySalary: e.target.value })}
                      min="0"
                      step="1"
                      className="w-full pl-11 pr-5 py-4 bg-gray-900/50 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-bold shadow-inner"
                      placeholder="50000"
                      required
                    />
                  </div>
                  <p className="text-xs text-purple-400/80 mt-2 font-medium">Minimum ₹25,000 required</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                    Employment Mode <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <Briefcase className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                    </div>
                    <select
                      value={formData.employmentMode}
                      onChange={(e) => setFormData({ ...formData, employmentMode: e.target.value })}
                      className="w-full pl-11 pr-12 py-4 bg-gray-900/50 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all appearance-none font-medium cursor-pointer shadow-inner relative"
                      required
                    >
                      <option value="SALARIED" className="bg-gray-800">Salaried Employee</option>
                      <option value="SELF_EMPLOYED" className="bg-gray-800">Self-Employed / Business</option>
                      <option value="UNEMPLOYED" className="bg-gray-800">Unemployed</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 mt-4 border-t border-white/10">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-xl shadow-purple-500/20 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Validating Eligibility...
                    </>
                  ) : (
                    <>
                      <Check className="w-6 h-6" strokeWidth={2.5} />
                      Verify & Continue
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
