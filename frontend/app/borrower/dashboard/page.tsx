'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getUser, clearAuth } from '@/lib/auth';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, 
  Rocket, 
  FileText, 
  CheckCircle, 
  Banknote, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Wallet, 
  Landmark,
  AlertCircle,
  ArrowRight,
  Edit2,
  Trash2,
  History,
  ArrowLeft,
  Info,
  Copy,
  User,
  X
} from 'lucide-react';

export default function BorrowerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [personalDetails, setPersonalDetails] = useState<any>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLoan, setEditingLoan] = useState<any>(null);
  const [editForm, setEditForm] = useState({ loanAmount: 50000, tenure: 30 });
  const [actionLoading, setActionLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLoans, setTotalLoans] = useState(0);

  const [showLedgerFor, setShowLedgerFor] = useState<string | null>(null);

  useEffect(() => {
    const userData = getUser();
    if (!userData || userData.role !== 'BORROWER') {
      router.push('/login');
      return;
    }
    setUser(userData);
    fetchData();
  }, [router, page]);

  const fetchData = async () => {
    try {
      const [detailsRes, loansRes] = await Promise.all([
        api.get('/borrower/personal-details'),
        api.get(`/borrower/my-loans?page=${page}&limit=9`)
      ]);

      setPersonalDetails(detailsRes.data.personalDetails);
      setLoans(loansRes.data.loans);
      setTotalPages(loansRes.data.totalPages || 1);
      setTotalLoans(loansRes.data.totalLoans || 0);

      if (detailsRes.data.personalDetails) {
        const hasActiveLoan = loansRes.data.loans.some((loan: any) =>
          ['APPLIED', 'SANCTIONED', 'DISBURSED'].includes(loan.status)
        );
        if (hasActiveLoan) {
          setCurrentStep(4);
        } else {
          setCurrentStep(2);
        }
      }
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const handleDelete = async (loanId: string) => {
    if (!window.confirm('Are you sure you want to cancel this application?')) return;
    
    try {
      await api.delete(`/borrower/loans/${loanId}`);
      toast.success('Application cancelled successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel application');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLoan) return;

    setActionLoading(true);
    try {
      await api.put(`/borrower/loans/${editingLoan._id}`, editForm);
      toast.success('Application updated successfully');
      setEditingLoan(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update application');
    } finally {
      setActionLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Sign Up', icon: <CheckCircle className="w-5 h-5" />, color: 'from-purple-500 to-indigo-600' },
    { number: 2, title: 'Personal Details', icon: <FileText className="w-5 h-5" />, color: 'from-indigo-500 to-blue-600' },
    { number: 3, title: 'Documents', icon: <FileText className="w-5 h-5" />, color: 'from-blue-500 to-cyan-600' },
    { number: 4, title: 'Application', icon: <Banknote className="w-5 h-5" />, color: 'from-cyan-500 to-teal-600' }
  ];

  const getStatusColor = (status: string) => {
    const colors: any = {
      'APPLIED': 'from-amber-400 to-orange-500',
      'SANCTIONED': 'from-blue-400 to-indigo-500',
      'DISBURSED': 'from-emerald-400 to-green-500',
      'REJECTED': 'from-rose-400 to-red-500',
      'CLOSED': 'from-gray-400 to-slate-500'
    };
    return colors[status] || 'from-gray-400 to-slate-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

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
                <Landmark className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Borrower <span className="text-purple-400">Portal</span>
              </h1>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 sm:gap-6"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-white">{user?.fullName || 'User'}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              {personalDetails && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/borrower/personal-details')}
                  className="p-2 sm:px-4 sm:py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 rounded-xl transition-all duration-300 font-semibold text-sm backdrop-blur-md flex items-center gap-2 group"
                  title="Edit Profile"
                >
                  <User className="w-5 h-5 sm:w-4 sm:h-4 transition-colors" />
                  <span className="hidden sm:inline">Edit Profile</span>
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="p-2 sm:px-4 sm:py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-xl transition-all duration-300 font-semibold text-sm backdrop-blur-md flex items-center gap-2 group"
                title="Logout"
              >
                <LogOut className="w-5 h-5 sm:w-4 sm:h-4 transition-colors" />
                <span className="hidden sm:inline">Logout</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto md:overflow-hidden relative z-10 w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col">
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-0">
        
        {/* Progress Tracker */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 shrink-0 bg-white/5 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-white/10 shadow-2xl"
        >
          <h2 className="text-xl font-bold text-white mb-8 text-center tracking-tight">Application Journey</h2>
          <div className="relative max-w-4xl mx-auto px-0 sm:px-4 py-6">
            <div className="relative w-full pt-2">
              {/* Line Track Container */}
              <div className="absolute top-[16px] sm:top-[18px] left-[12.5%] right-[12.5%] h-1 -translate-y-1/2 z-0">
                <div className="absolute inset-0 bg-white/10 rounded-full"></div>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                />
              </div>
              
              {/* Steps Grid */}
              <div className="relative z-10 grid grid-cols-4">
                {steps.map((step, index) => (
                  <div key={index} className="flex flex-col items-center text-center">
                    <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center transition-all duration-500 relative z-10 ${
                      currentStep > step.number 
                        ? `bg-gradient-to-r ${step.color} text-white scale-100 shadow-lg` 
                        : currentStep === step.number
                        ? `bg-gradient-to-r ${step.color} text-white scale-125 ring-4 ring-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.6)]`
                        : 'bg-[#1e293b] border-2 border-gray-600'
                    }`}>
                    </div>
                    <span className={`mt-3 sm:mt-4 text-[9px] sm:text-xs font-bold uppercase tracking-wider text-center leading-tight px-1 ${
                      currentStep >= step.number ? 'text-white' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Cards */}
        <AnimatePresence mode="wait">
          {!personalDetails && (
            <motion.div 
              key="onboarding"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-purple-500/30 rounded-[2rem] shadow-2xl p-10 mb-8 backdrop-blur-xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                  <div className="p-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/30">
                    <Rocket className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white mb-3">Ready to Get Started?</h3>
                    <p className="text-gray-300 text-lg max-w-xl">Complete your personal profile and upload required documents to unlock access to premium loan offers.</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/borrower/personal-details')}
                  className="px-8 py-4 bg-white text-purple-600 rounded-xl hover:bg-gray-100 transition-all duration-300 font-bold shadow-xl flex items-center gap-2 whitespace-nowrap"
                >
                  Complete Profile
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {personalDetails && loans.length === 0 && (
            <motion.div 
              key="apply"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-[2rem] shadow-2xl p-10 mb-8 backdrop-blur-xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                  <div className="p-5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/30">
                    <Wallet className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white mb-3">Profile Verified</h3>
                    <p className="text-gray-300 text-lg max-w-xl">Your documents are in order. You are now eligible to configure and apply for your first loan.</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/borrower/apply')}
                  className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all duration-300 font-bold shadow-xl flex items-center gap-2 whitespace-nowrap"
                >
                  Apply for Loan
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Loans */}
        {loans.length > 0 && (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-3 mb-2 shrink-0">
              <Banknote className="w-7 h-7 text-purple-400" />
              <h3 className="text-2xl font-bold text-white tracking-tight">My Loan Portfolio</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-2 overflow-y-auto no-scrollbar pr-2 flex-1">
              {loans.map((loan) => {
                const progressPercentage = Math.min(100, Math.max(0, ((loan.totalPaid || 0) / (loan.totalRepayment || 1)) * 100));

                return (
                <motion.div 
                  variants={itemVariants}
                  key={loan._id} 
                  className="bg-white/5 rounded-2xl border border-white/10 hover:border-purple-500/30 overflow-hidden shadow-2xl backdrop-blur-xl relative flex flex-col justify-between p-5"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getStatusColor(loan.status)}`}></div>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Requested Amount</p>
                        <p className="text-3xl font-black text-white tracking-tight">
                          ₹{loan.loanAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black text-white bg-gradient-to-r ${getStatusColor(loan.status)} shadow-lg uppercase tracking-wider text-center`}>
                        {loan.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex flex-col justify-center">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Tenure</p>
                        <p className="text-sm font-bold text-white">{loan.tenure} days</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex flex-col justify-center">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Expected Repayment</p>
                        <p className="text-sm font-bold text-emerald-400">₹{loan.totalRepayment.toLocaleString()}</p>
                      </div>
                    </div>

                    {loan.status === 'APPLIED' && (
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => {
                            setEditingLoan(loan);
                            setEditForm({ loanAmount: loan.loanAmount, tenure: loan.tenure });
                          }}
                          className="flex-1 p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors border border-indigo-500/20 text-xs font-bold flex items-center justify-center gap-2"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(loan._id)}
                          className="flex-1 p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors border border-rose-500/20 text-xs font-bold flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </div>
                    )}

                    {loan.rejectionReason && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex gap-2 items-start shadow-inner mt-2">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-0.5">Rejected</p>
                          <p className="text-xs text-gray-300 font-medium">{loan.rejectionReason}</p>
                        </div>
                      </div>
                    )}

                    {loan.status === 'DISBURSED' && (
                       <div className="mt-2 bg-black/30 p-3 rounded-lg border border-white/5 shadow-inner">
                         <div className="flex justify-between items-center mb-2">
                           <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Repayment Progress</span>
                           <span className="text-xs font-black text-emerald-400">{progressPercentage.toFixed(1)}%</span>
                         </div>
                         <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden shadow-inner">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${progressPercentage}%` }}
                             transition={{ duration: 1.5, ease: "easeOut" }}
                             className="bg-gradient-to-r from-emerald-400 to-green-500 h-full rounded-full shadow-[0_0_15px_rgba(52,211,153,0.4)]"
                           />
                         </div>
                         <div className="flex justify-between mt-2 text-[10px]">
                           <span className="text-gray-400">Paid: <span className="text-white font-bold">₹{(loan.totalPaid || 0).toLocaleString()}</span></span>
                           <span className="text-gray-400">Remaining: <span className="text-white font-bold">₹{(loan.outstandingBalance || 0).toLocaleString()}</span></span>
                         </div>
                       </div>
                    )}

                    {loan.status === 'DISBURSED' && loan.payments && loan.payments.length > 0 && (
                      <div className="mt-2 flex-1">
                        <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-white/5 shadow-inner">
                          <h3 className="text-[10px] font-bold text-gray-300 flex items-center gap-1 uppercase tracking-wider">
                            <History className="w-3 h-3 text-emerald-400" />
                            Payment Ledger
                          </h3>
                          <button 
                            onClick={() => setShowLedgerFor(loan._id)}
                            className="px-3 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-colors text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider"
                            title="View Transactions"
                          >
                            <Info className="w-3.5 h-3.5" /> View
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )})}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6 pb-2 shrink-0">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">{page}</span>
                  <span className="text-gray-500">/</span>
                  <span className="text-gray-400">{totalPages}</span>
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </motion.div>
        )}

        {personalDetails && !loans.some((loan: any) => ['APPLIED', 'SANCTIONED', 'DISBURSED'].includes(loan.status)) && loans.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <button
              onClick={() => router.push('/borrower/apply')}
              className="px-10 py-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-bold text-lg shadow-xl shadow-purple-500/20 flex items-center gap-3 mx-auto"
            >
              <Rocket className="w-6 h-6" />
              Apply for a New Loan
            </button>
          </motion.div>
        )}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingLoan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">Edit Loan Parameters</h3>
                  <button onClick={() => setEditingLoan(null)} className="text-gray-400 hover:text-white p-1">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <form onSubmit={handleEditSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Loan Amount (₹)</label>
                    <input 
                      type="number"
                      min="50000"
                      max="500000"
                      value={editForm.loanAmount}
                      onChange={(e) => setEditForm({ ...editForm, loanAmount: Number(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">₹50,000 - ₹5,00,000</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Tenure (Days)</label>
                    <input 
                      type="number"
                      min="30"
                      max="365"
                      value={editForm.tenure}
                      onChange={(e) => setEditForm({ ...editForm, tenure: Number(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">30 - 365 Days</p>
                  </div>
                  
                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingLoan(null)}
                      className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
                    >
                      {actionLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Ledger Modal */}
      <AnimatePresence>
        {showLedgerFor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md relative overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col flex-1 min-h-0">
                <div className="flex justify-between items-center mb-6 shrink-0">
                  <div className="flex items-center gap-2">
                    <History className="w-6 h-6 text-emerald-400" />
                    <h3 className="text-xl font-bold text-white">Payment Ledger</h3>
                  </div>
                  <button onClick={() => setShowLedgerFor(null)} className="text-gray-400 hover:text-white p-1">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="overflow-y-auto custom-scrollbar pr-2 flex-1 space-y-3">
                  {loans.find((l: any) => l._id === showLedgerFor)?.payments?.map((payment: any) => (
                    <div key={payment._id} className="bg-black/40 border border-white/10 rounded-xl p-4 flex justify-between items-center group hover:border-emerald-500/30 transition-all">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-300 font-mono text-xs tracking-wide">UTR: {payment.utrNumber}</p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(payment.utrNumber);
                              toast.success('UTR copied to clipboard!');
                            }}
                            className="text-gray-500 hover:text-emerald-400 transition-colors p-1 bg-white/5 rounded-md opacity-0 group-hover:opacity-100"
                            title="Copy UTR"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                          {new Date(payment.paymentDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-emerald-400 tracking-tight">+₹{payment.amount.toLocaleString()}</p>
                        <p className="text-[9px] text-emerald-500/50 font-bold uppercase tracking-widest mt-0.5">Credited</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 shrink-0">
                  <button
                    onClick={() => setShowLedgerFor(null)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-all bg-white/5"
                  >
                    Close Ledger
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
