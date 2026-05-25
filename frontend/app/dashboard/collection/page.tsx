'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Banknote, 
  ArrowLeft, 
  User, 
  History, 
  Plus, 
  CheckCircle, 
  TrendingUp,
  CreditCard,
  Clock,
  Search
} from 'lucide-react';

export default function CollectionPage() {
  const router = useRouter();
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [paymentData, setPaymentData] = useState({
    utrNumber: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLoans, setTotalLoans] = useState(0);

  useEffect(() => {
    const user = getUser();
    if (!user || !['COLLECTION', 'ADMIN'].includes(user.role)) {
      router.push('/dashboard');
      return;
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLoans();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, page]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const fetchLoans = async () => {
    try {
      const response = await api.get(`/dashboard/collection/loans?page=${page}&limit=9&search=${encodeURIComponent(searchQuery)}`);
      setLoans(response.data.loans);
      setTotalPages(response.data.totalPages || 1);
      setTotalLoans(response.data.totalLoans || 0);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (loanId: string) => {
    if (!paymentData.utrNumber.trim() || !paymentData.amount || !paymentData.paymentDate) {
      toast.error('All fields are required');
      return;
    }

    const amount = parseFloat(paymentData.amount);
    if (amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/dashboard/collection/loans/${loanId}/payment`, {
        ...paymentData,
        amount
      });

      toast.success('🎉 Payment recorded successfully!');
      setSelectedLoan(null);
      setPaymentData({
        utrNumber: '',
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0]
      });
      fetchLoans();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
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
    <div className="h-screen bg-[#0f172a] relative overflow-hidden selection:bg-orange-500/30 flex flex-col">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/20 rounded-full blur-[150px] mix-blend-screen"
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }} 
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-rose-600/20 rounded-full blur-[150px] mix-blend-screen"
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
              <div className="p-2.5 bg-gradient-to-br from-orange-400 to-rose-500 rounded-xl shadow-lg shadow-orange-500/30 border border-white/10">
                <Banknote className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Collection <span className="text-orange-400">Module</span>
              </h1>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard')}
                className="p-2 sm:p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all duration-300 backdrop-blur-md flex items-center justify-center group hover:border-white/20"
                title="Back to Hub"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto relative z-10 w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col no-scrollbar">
        <div className="max-w-7xl mx-auto w-full flex flex-col">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col flex-1"
        >
          <div className="py-6 shrink-0 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
              <div>
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-orange-400" />
                  Active Loans Portfolio
                </h2>
                <p className="text-gray-400 mt-3 font-medium text-lg max-w-xl">
                  Monitor outstanding balances, track EMI schedules, and securely record borrower payments.
                </p>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-inner">
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500"></span>
                </span>
                <div className="flex flex-col items-end">
                  <span className="text-3xl text-orange-400 font-black tracking-tighter leading-none">{totalLoans}</span>
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Active</span>
                </div>
              </div>
            </div>

            <div className="relative max-w-md w-full">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or PAN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-inner font-medium text-sm"
              />
            </div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4"
          >
            {loans.map((loan, index) => {
              const progressPercentage = Math.min(100, Math.max(0, (loan.totalPaid / loan.totalRepayment) * 100));
              
              return (
              <motion.div 
                variants={itemVariants}
                key={loan._id} 
                className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-orange-500/30 shadow-2xl transition-all flex flex-col justify-between"
              >
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-orange-400 to-rose-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-orange-500/20 border border-white/10">
                      {loan.personalDetailsId?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold tracking-widest text-orange-400 uppercase mb-0.5">
                        Borrower <span className="text-orange-400/50 ml-1">#{(page - 1) * 9 + index + 1}</span>
                      </p>
                      <p className="text-lg font-black text-white leading-tight">
                        {loan.personalDetailsId?.fullName || 'N/A'}
                      </p>
                      <p className="text-xs font-medium text-gray-400 mt-1 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        {loan.userId?.email}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500/10 to-rose-500/10 py-3 px-4 rounded-xl border border-orange-500/20 w-full shadow-inner flex flex-col justify-center items-center mt-2">
                    <p className="text-[10px] font-bold tracking-widest text-orange-400 uppercase mb-1">Outstanding Balance</p>
                    <p className="text-2xl font-black text-white tracking-tight">₹{loan.outstandingBalance.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex flex-col justify-center">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Principal</p>
                    <p className="text-base font-bold text-white">₹{loan.loanAmount.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex flex-col justify-center">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Expected</p>
                    <p className="text-base font-bold text-white">₹{loan.totalRepayment.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex flex-col justify-center">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Total Paid</p>
                    <p className="text-base font-bold text-emerald-400">₹{loan.totalPaid.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex flex-col justify-center">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Disbursed On</p>
                    <p className="text-sm font-bold text-white flex items-center gap-1">
                      {new Date(loan.disbursedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mb-4 bg-black/30 p-3 rounded-lg border border-white/5 shadow-inner">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Repayment Progress</span>
                    <span className="text-xs font-black text-orange-400">{progressPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="bg-gradient-to-r from-orange-500 to-emerald-500 h-full rounded-full shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                    />
                  </div>
                </div>

                {loan.payments && loan.payments.length > 0 && (
                  <div className="mb-4 flex-1">
                    <h3 className="text-[10px] font-bold text-gray-300 mb-2 flex items-center gap-1 uppercase tracking-wider">
                      <History className="w-3 h-3 text-orange-400" />
                      Payment Ledger
                    </h3>
                    <div className="bg-white/5 rounded-lg border border-white/10 p-2 max-h-32 overflow-y-auto no-scrollbar shadow-inner flex flex-col gap-1">
                      <AnimatePresence>
                        {loan.payments.map((payment: any, idx: number) => (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={payment._id} 
                            className="flex justify-between items-center p-2 bg-black/20 rounded-md border border-white/5"
                          >
                            <div>
                              <p className="font-bold text-gray-300 font-mono text-[10px] tracking-wide">UTR: {payment.utrNumber}</p>
                              <p className="text-[9px] text-gray-500 font-medium">
                                {new Date(payment.paymentDate).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="text-sm font-black text-emerald-400 tracking-tight">+₹{payment.amount.toLocaleString()}</p>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {selectedLoan?._id === loan._id ? (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-xl border border-orange-500/20 shadow-inner mt-2 overflow-hidden flex flex-col gap-3"
                    >
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">
                          UTR Number <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={paymentData.utrNumber}
                          onChange={(e) => setPaymentData({ ...paymentData, utrNumber: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 text-white text-sm rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all font-mono"
                          placeholder="e.g. UTR123456789"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">
                          Amount (₹) <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          value={paymentData.amount}
                          onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                          max={loan.outstandingBalance}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 text-white text-sm rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">
                          Payment Date <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="date"
                          value={paymentData.paymentDate}
                          onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 text-gray-300 text-sm rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all font-medium"
                        />
                      </div>
                      <div className="flex flex-col gap-2 mt-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleRecordPayment(loan._id)}
                          disabled={actionLoading}
                          className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-600 text-white text-sm rounded-lg hover:from-orange-600 hover:to-rose-700 transition-all duration-300 disabled:opacity-50 font-bold shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                        >
                          {actionLoading ? 'Saving...' : 'Save Payment'}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedLoan(null);
                            setPaymentData({
                              utrNumber: '',
                              amount: '',
                              paymentDate: new Date().toISOString().split('T')[0]
                            });
                          }}
                          className="w-full px-4 py-2 bg-white/5 text-white text-sm rounded-lg hover:bg-white/10 transition-all duration-300 font-bold border border-white/10"
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedLoan(loan)}
                      className="w-full px-4 py-2.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-sm rounded-lg transition-all duration-300 font-bold border border-orange-500/20 flex items-center justify-center gap-2 mt-auto shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Record New Payment
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            );
            })}
          </motion.div>

          {loans.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-24"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-500/10 text-orange-400 mb-6 border border-orange-500/20 shadow-inner">
                <CheckCircle className="w-10 h-10" strokeWidth={1.5} />
              </div>
              <p className="text-gray-400 text-xl font-medium">
                {searchQuery ? 'No active loans match your search.' : 'No active loans found in the portfolio.'}
              </p>
            </motion.div>
          )}

          {totalPages > 1 && (
            <div className="py-6 shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm font-medium">
                Showing <span className="text-white font-bold">{(page - 1) * 9 + 1}</span> to <span className="text-white font-bold">{Math.min(page * 9, totalLoans)}</span> of <span className="text-white font-bold">{totalLoans}</span> results
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-medium hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                        page === i + 1 
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-medium hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </motion.div>
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
