'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Banknote, 
  ArrowLeft, 
  Settings, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Rocket, 
  FileText,
  Clock,
  TrendingUp,
  Wallet
} from 'lucide-react';

export default function ApplyLoanPage() {
  const router = useRouter();
  const [loanAmount, setLoanAmount] = useState(50000);
  const [tenure, setTenure] = useState(30);
  const [salarySlipFile, setSalarySlipFile] = useState<File | null>(null);
  const [salarySlipUrl, setSalarySlipUrl] = useState('');
  const [loanDetails, setLoanDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== 'BORROWER') {
      router.push('/login');
      return;
    }

    calculateLoan();
  }, [loanAmount, tenure, router]);

  const calculateLoan = async () => {
    try {
      const response = await api.post('/borrower/calculate-loan', {
        loanAmount,
        tenure
      });
      setLoanDetails(response.data);
    } catch (error) {
      console.error('Calculate loan error:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF, JPG, JPEG, and PNG files are allowed');
        return;
      }

      setSalarySlipFile(file);
    }
  };

  const handleUpload = async () => {
    if (!salarySlipFile) {
      toast.error('Please select a file');
      return;
    }

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('salarySlip', salarySlipFile);

      const response = await api.post('/borrower/upload-salary-slip', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSalarySlipUrl(response.data.salarySlipUrl);
      toast.success('🎉 Salary slip uploaded successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploadLoading(false);
    }
  };


  const handleApply = async () => {
    if (!salarySlipUrl) {
      toast.error('Please upload salary slip first');
      return;
    }

    setLoading(true);
    try {
      await api.post('/borrower/apply-loan', {
        loanAmount,
        tenure
      });

      toast.success('🚀 Loan application submitted successfully!');
      router.push('/borrower/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Application failed');
    } finally {
      setLoading(false);
    }
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
                <Banknote className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Configure <span className="text-purple-400">Loan</span>
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
                className="p-2 sm:px-4 sm:py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all duration-300 backdrop-blur-md flex items-center justify-center gap-2 group hover:border-white/20"
                title="Back to Portal"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                <span className="hidden sm:inline font-semibold text-sm">Back to Portal</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto lg:overflow-hidden relative z-10 p-4 py-4 w-full flex flex-col">
        <div className="max-w-6xl mx-auto w-full lg:flex-1 flex flex-col lg:min-h-0">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:flex-1 lg:min-h-0"
          >
            
            {/* Configuration Panel */}
            <div className="lg:col-span-3 bg-white/5 backdrop-blur-xl rounded-[2rem] shadow-2xl p-6 sm:p-8 lg:p-5 xl:p-6 border border-white/10 flex flex-col relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none"></div>
              
              <div className="flex items-center gap-4 mb-6 lg:mb-5 shrink-0 relative z-10">
                <div className="p-3 lg:p-2.5 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-xl border border-purple-500/30 shadow-inner">
                  <Settings className="w-6 h-6 lg:w-5 lg:h-5 text-purple-400" />
                </div>
                <h2 className="text-2xl lg:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 tracking-wide">
                  Loan Configuration
                </h2>
              </div>

              <div className="space-y-6 lg:space-y-4 relative z-10 pr-1">
                <div className="relative p-6 lg:p-4 xl:p-5 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all duration-300 shadow-inner group/item overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none"></div>
                  <div className="flex justify-between items-end mb-6 lg:mb-4 relative z-10">
                    <label className="block text-sm lg:text-[10px] xl:text-xs font-bold text-purple-300/80 uppercase tracking-widest flex items-center gap-2">
                      <Banknote className="w-5 h-5 lg:w-3.5 lg:h-3.5 text-purple-400" />
                      Desired Loan Amount
                    </label>
                    <span className="text-3xl lg:text-xl xl:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200 bg-white/5 px-4 lg:px-3 xl:px-4 py-1.5 lg:py-1 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                      ₹{loanAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="relative z-10">
                    <input
                      type="range"
                      min="50000"
                      max="500000"
                      step="10000"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(parseInt(e.target.value))}
                      className="w-full h-2 lg:h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-inner"
                    />
                    <div className="flex justify-between text-xs lg:text-[10px] font-bold text-gray-500 mt-4 lg:mt-3 uppercase tracking-wider">
                      <span>₹50,000</span>
                      <span>₹5,00,000</span>
                    </div>
                  </div>
                </div>

                <div className="relative p-6 lg:p-4 xl:p-5 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all duration-300 shadow-inner group/item overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none"></div>
                  <div className="flex justify-between items-end mb-6 lg:mb-4 relative z-10">
                    <label className="block text-sm lg:text-[10px] xl:text-xs font-bold text-indigo-300/80 uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-5 h-5 lg:w-3.5 lg:h-3.5 text-indigo-400" />
                      Repayment Tenure
                    </label>
                    <span className="text-3xl lg:text-xl xl:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200 bg-white/5 px-4 lg:px-3 xl:px-4 py-1.5 lg:py-1 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                      {tenure} <span className="text-lg lg:text-xs xl:text-sm font-medium text-indigo-200/50">days</span>
                    </span>
                  </div>
                  <div className="relative z-10">
                    <input
                      type="range"
                      min="30"
                      max="365"
                      step="1"
                      value={tenure}
                      onChange={(e) => setTenure(parseInt(e.target.value))}
                      className="w-full h-2 lg:h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner"
                    />
                    <div className="flex justify-between text-xs lg:text-[10px] font-bold text-gray-500 mt-4 lg:mt-3 uppercase tracking-wider">
                      <span>30 days</span>
                      <span>365 days</span>
                    </div>
                  </div>
                </div>

                <div className="relative p-6 lg:p-4 xl:p-5 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all duration-300 shadow-inner group/item overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none"></div>
                  <h3 className="text-sm lg:text-[10px] xl:text-xs font-bold text-emerald-300/80 mb-5 lg:mb-3 flex items-center gap-2 uppercase tracking-widest relative z-10">
                    <FileText className="w-5 h-5 lg:w-3.5 lg:h-3.5 text-emerald-400" />
                    Income Verification
                  </h3>
                  
                  <div className="relative flex flex-col items-center justify-center w-full z-10">
                    <label className="flex flex-col items-center justify-center w-full h-40 lg:h-24 border-2 border-dashed border-emerald-500/30 hover:border-emerald-500/60 rounded-xl cursor-pointer bg-white/[0.02] hover:bg-emerald-500/[0.05] transition-all duration-300 group-hover/item:shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 lg:pt-4 lg:pb-4">
                        <Upload className="w-8 h-8 lg:w-5 lg:h-5 xl:w-6 xl:h-6 mb-3 lg:mb-2 text-emerald-400 group-hover/item:-translate-y-1 transition-transform duration-300" />
                        <p className="mb-2 lg:mb-1 text-sm lg:text-[10px] xl:text-xs text-gray-400"><span className="font-bold text-emerald-400">Click to upload</span> or drag and drop</p>
                        <p className="text-xs lg:text-[9px] xl:text-[10px] text-gray-500 font-medium uppercase tracking-wider">PDF, JPG, PNG (Max. 5MB)</p>
                      </div>
                      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
                    </label>
                  </div>

                  <AnimatePresence>
                    {salarySlipFile && !salarySlipUrl && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-5 lg:mt-4 flex flex-col sm:flex-row items-center gap-4 bg-black/40 p-4 lg:p-3 xl:p-4 rounded-xl border border-white/10 shadow-inner relative z-10"
                      >
                        <div className="flex-1 w-full truncate text-sm lg:text-xs xl:text-sm text-gray-300 font-medium pl-2 flex items-center gap-2">
                          <FileText className="w-5 h-5 lg:w-4 lg:h-4 text-emerald-400 shrink-0" />
                          <span className="truncate">{salarySlipFile.name}</span>
                        </div>
                        <button
                          onClick={handleUpload}
                          disabled={uploadLoading}
                          className="w-full sm:w-auto px-6 lg:px-5 py-3 lg:py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2 text-sm lg:text-xs xl:text-sm"
                        >
                          {uploadLoading ? (
                            <>
                              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Uploading...
                            </>
                          ) : 'Verify Document'}
                        </button>
                      </motion.div>
                    )}

                    {salarySlipUrl && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-5 lg:mt-4 flex items-center gap-3 p-5 lg:p-3 xl:p-4 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shadow-inner relative z-10"
                      >
                        <div className="p-2 lg:p-1.5 bg-emerald-500/20 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                          <CheckCircle2 className="w-5 h-5 lg:w-4 lg:h-4 xl:w-5 xl:h-5" strokeWidth={2.5} />
                        </div>
                        <p className="font-bold text-sm lg:text-xs xl:text-sm tracking-wide">Document successfully verified</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Summary Panel */}
            <div className="lg:col-span-2 flex flex-col lg:min-h-0">
              <div className="bg-gradient-to-b from-gray-900 to-black rounded-[2rem] shadow-2xl p-6 sm:p-8 lg:p-5 xl:p-6 text-white border border-white/10 lg:flex-1 flex flex-col lg:min-h-0 relative group">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none rounded-[2rem]"></div>
                <div className="flex items-center gap-4 mb-6 lg:mb-5 shrink-0 relative z-10">
                  <div className="p-3 lg:p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/30 shadow-inner">
                    <Wallet className="w-6 h-6 lg:w-5 lg:h-5 text-indigo-400" />
                  </div>
                  <h2 className="text-2xl lg:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 tracking-wide">
                    Application Summary
                  </h2>
                </div>

                {loanDetails ? (
                  <div className="space-y-6 lg:space-y-4 lg:flex-1 flex flex-col">
                    <div className="flex justify-between items-center pb-4 lg:pb-3 border-b border-white/10">
                      <span className="text-gray-400 font-bold uppercase tracking-wider text-xs lg:text-[10px] xl:text-xs">Principal Amount</span>
                      <span className="text-xl lg:text-lg font-black text-white">
                        ₹{loanDetails.loanAmount.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pb-4 lg:pb-3 border-b border-white/10">
                      <span className="text-gray-400 font-bold uppercase tracking-wider text-xs lg:text-[10px] xl:text-xs flex items-center gap-2"><Clock className="w-3.5 h-3.5 lg:w-3 lg:h-3" /> Duration</span>
                      <span className="text-xl lg:text-lg font-bold text-white">
                        {loanDetails.tenure} days
                      </span>
                    </div>

                    <div className="flex justify-between items-center pb-4 lg:pb-3 border-b border-white/10">
                      <span className="text-gray-400 font-bold uppercase tracking-wider text-xs lg:text-[10px] xl:text-xs flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5 lg:w-3 lg:h-3" /> Interest Rate</span>
                      <span className="text-xl lg:text-lg font-bold text-white">
                        {loanDetails.interestRate}% p.a.
                      </span>
                    </div>

                    <div className="flex justify-between items-center pb-4 lg:pb-3 border-b border-white/10">
                      <span className="text-gray-400 font-bold uppercase tracking-wider text-xs lg:text-[10px] xl:text-xs">Simple Interest</span>
                      <span className="text-xl lg:text-lg font-bold text-purple-400">
                        + ₹{loanDetails.simpleInterest.toLocaleString()}
                      </span>
                    </div>

                    <div className="mt-8 lg:mt-4 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 rounded-2xl p-6 lg:p-4 border border-purple-500/30 shadow-inner shrink-0">
                      <p className="text-purple-300 font-bold mb-2 lg:mb-1 text-xs lg:text-[10px] xl:text-xs uppercase tracking-widest">Total Repayment</p>
                      <p className="text-4xl lg:text-3xl font-black text-white tracking-tight">
                        ₹{loanDetails.totalRepayment.toLocaleString()}
                      </p>
                    </div>

                    <div className="pt-6 lg:pt-4 mt-auto">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleApply}
                        disabled={loading || !salarySlipUrl}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 lg:py-3 xl:py-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg lg:text-base xl:text-lg shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            Submit Application
                            <Rocket className="w-5 h-5" />
                          </>
                        )}
                      </motion.button>
                      
                      {!salarySlipUrl && (
                        <div className="mt-5 lg:mt-4 p-4 lg:p-3 xl:p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 lg:gap-2 xl:gap-3 shadow-inner">
                          <AlertCircle className="w-5 h-5 lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-rose-400 shrink-0 mt-0.5 lg:mt-0" />
                          <p className="text-sm lg:text-xs xl:text-sm text-gray-300 font-medium leading-relaxed">
                            Please <span className="text-rose-400 font-bold">upload your salary slip</span> to proceed.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                )}
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
