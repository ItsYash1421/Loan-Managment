'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Check, 
  X, 
  FileText, 
  AlertCircle, 
  ChevronDown,
  User,
  Clock,
  Search
} from 'lucide-react';

export default function SanctionPage() {
  const router = useRouter();
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLoans, setTotalLoans] = useState(0);

  useEffect(() => {
    const user = getUser();
    if (!user || !['SANCTION', 'ADMIN'].includes(user.role)) {
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

  // Reset page to 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const fetchLoans = async () => {
    try {
      const response = await api.get(`/dashboard/sanction/loans?page=${page}&limit=9&search=${encodeURIComponent(searchQuery)}`);
      setLoans(response.data.loans);
      setTotalPages(response.data.totalPages || 1);
      setTotalLoans(response.data.totalLoans || 0);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (loanId: string, action: 'approve' | 'reject') => {
    if (action === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/dashboard/sanction/loans/${loanId}`, {
        action,
        rejectionReason: action === 'reject' ? rejectionReason : undefined
      });

      toast.success(`Loan ${action === 'approve' ? 'sanctioned' : 'rejected'} successfully!`);
      setSelectedLoan(null);
      setRejectionReason('');
      setShowRejectReason(false);
      fetchLoans();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDocument = async (loanId: string) => {
    try {
      const toastId = toast.loading('Loading document...');
      const response = await api.get(`/dashboard/sanction/loans/${loanId}/document`, {
        responseType: 'blob'
      });
      toast.dismiss(toastId);
      
      const contentType = (response.headers['content-type'] as string) || 'application/pdf';
      const url = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to load document');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
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
    <div className="h-screen bg-[#0f172a] relative overflow-hidden selection:bg-indigo-500/30 flex flex-col no-scrollbar">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[150px] mix-blend-screen"
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }} 
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/20 rounded-full blur-[150px] mix-blend-screen"
        />
      </div>

      <nav className="relative z-20 bg-white/5 backdrop-blur-xl border-b border-white/10 shrink-0 shadow-2xl shadow-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg shadow-cyan-500/30 border border-white/10">
                <ShieldCheck className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Sanction <span className="text-cyan-400">Module</span>
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
                  <Clock className="w-8 h-8 text-cyan-400" />
                  Pending Applications
                </h2>
                <p className="text-gray-400 mt-3 font-medium text-lg max-w-xl">
                  Carefully review applicant details, documents, and risk profiles before approving or rejecting loan requests.
                </p>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/20 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-inner">
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
                </span>
                <div className="flex flex-col items-end">
                <span className="text-3xl text-cyan-400 font-black tracking-tighter leading-none">{totalLoans}</span>
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Actionable</span>
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
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all shadow-inner font-medium text-sm"
              />
            </div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4"
          >
            {loans.map((loan, index) => (
              <motion.div 
                variants={itemVariants}
                key={loan._id} 
                className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-cyan-500/30 shadow-2xl transition-all flex flex-col justify-between"
              >
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-cyan-500/20 border border-white/10">
                      {loan.personalDetailsId?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold tracking-widest text-cyan-400 uppercase mb-0.5">
                        Applicant <span className="text-cyan-400/50 ml-1">#{(page - 1) * 9 + index + 1}</span>
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
                  <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 py-3 px-4 rounded-xl border border-cyan-500/20 w-full shadow-inner flex flex-col justify-center items-center mt-2">
                    <p className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase mb-1">Requested Amount</p>
                    <p className="text-2xl font-black text-white tracking-tight">₹{loan.loanAmount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex flex-col justify-center">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Tenure</p>
                    <p className="text-base font-bold text-white">{loan.tenure} <span className="text-[10px] font-medium text-gray-500">days</span></p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex flex-col justify-center">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Interest Rate</p>
                    <p className="text-base font-bold text-white">{loan.interestRate}% <span className="text-[10px] font-medium text-gray-500">p.a.</span></p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex flex-col justify-center">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Simple Interest</p>
                    <p className="text-base font-bold text-cyan-400">+₹{loan.simpleInterest.toLocaleString()}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 p-3 rounded-lg border border-cyan-500/30 flex flex-col justify-center shadow-inner">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-cyan-300 mb-1">Total Repayment</p>
                    <p className="text-lg font-black text-white">₹{loan.totalRepayment.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mb-4 flex-1">
                  <h3 className="text-xs font-bold text-gray-300 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    Applicant Details
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-[11px] bg-black/20 p-4 rounded-lg border border-white/5 shadow-inner">
                    <div>
                      <span className="text-gray-500 font-bold text-[9px] uppercase tracking-wider block mb-1">PAN Number</span>
                      <span className="font-mono text-white bg-white/10 px-2 py-0.5 rounded font-medium border border-white/10 shadow-sm">{loan.personalDetailsId?.pan}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold text-[9px] uppercase tracking-wider block mb-1">Monthly Salary</span>
                      <span className="font-bold text-green-400 text-sm">₹{loan.personalDetailsId?.monthlySalary.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold text-[9px] uppercase tracking-wider block mb-1">Employment</span>
                      <span className="text-white capitalize font-medium">{loan.personalDetailsId?.employmentMode?.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold text-[9px] uppercase tracking-wider block mb-1">Date of Birth</span>
                      <span className="text-white font-medium">
                        {new Date(loan.personalDetailsId?.dateOfBirth).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center bg-cyan-950/30 p-2.5 rounded-lg border border-cyan-500/20">
                    <FileText className="w-4 h-4 text-cyan-500" />
                    <button onClick={() => handleViewDocument(loan._id)} className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-bold flex items-center gap-1 ml-2">
                      View Original PDF
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {selectedLoan?._id === loan._id ? (
                    <motion.div 
                      key="action-panel"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-black/40 p-4 rounded-xl border border-white/10 shadow-inner mt-3 overflow-hidden"
                    >
                      <AnimatePresence>
                        {showRejectReason && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6"
                          >
                            <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-rose-400" />
                              Rejection Reason <span className="text-rose-400/70 text-xs font-normal ml-1">(Required)</span>
                            </label>
                            <textarea
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              rows={3}
                              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white text-sm rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all resize-none font-medium shadow-inner"
                              placeholder="Reason for rejection..."
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div className="flex flex-col gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAction(loan._id, 'approve')}
                          disabled={actionLoading}
                          className="flex-1 px-4 py-2 text-sm bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                        >
                          {actionLoading ? 'Processing...' : 'Sanction Loan'}
                        </motion.button>

                        {showRejectReason ? (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAction(loan._id, 'reject')}
                            disabled={actionLoading}
                            className="flex-1 px-4 py-2 text-sm bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-lg hover:from-rose-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
                          >
                            {actionLoading ? 'Processing...' : 'Confirm Rejection'}
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowRejectReason(true)}
                            disabled={actionLoading}
                            className="flex-1 px-4 py-2 text-sm bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-lg hover:from-rose-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
                          >
                            Reject Application
                          </motion.button>
                        )}
                        
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedLoan(null);
                            setRejectionReason('');
                            setShowRejectReason(false);
                          }}
                          className="px-4 py-2 text-sm bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all duration-300 font-bold border border-white/10"
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedLoan(loan);
                        setRejectionReason('');
                        setShowRejectReason(false);
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 text-sm bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-300 font-bold border border-white/10 flex items-center justify-center gap-2 shadow-sm"
                    >
                      Evaluate Application
                      <ChevronDown className="w-3.5 h-3.5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>

          {loans.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-24"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cyan-500/10 text-cyan-400 mb-6 border border-cyan-500/20 shadow-inner">
                <ShieldCheck className="w-10 h-10" strokeWidth={1.5} />
              </div>
              <p className="text-gray-400 text-xl font-medium">
                {searchQuery ? 'No applications match your search.' : 'All caught up! No pending applications.'}
              </p>
              {!searchQuery && <p className="text-gray-500 mt-2">New loan requests will appear here automatically.</p>}
            </motion.div>
          )}

          {/* Pagination Controls */}
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
                          ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' 
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
