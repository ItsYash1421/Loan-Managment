'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  Users, 
  ArrowLeft, 
  Mail, 
  Calendar, 
  FileText, 
  CheckCircle, 
  Clock,
  BarChart2,
  Search
} from 'lucide-react';

export default function SalesPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);

  useEffect(() => {
    const user = getUser();
    if (!user || !['SALES', 'ADMIN'].includes(user.role)) {
      router.push('/dashboard');
      return;
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, page]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const fetchLeads = async () => {
    try {
      const response = await api.get(`/dashboard/sales/leads?page=${page}&limit=9&search=${encodeURIComponent(searchQuery)}`);
      setLeads(response.data.leads);
      setTotalPages(response.data.totalPages || 1);
      setTotalLeads(response.data.totalLeads || 0);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
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
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="h-screen bg-[#0f172a] relative overflow-hidden selection:bg-indigo-500/30 flex flex-col">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} 
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[150px] mix-blend-screen"
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[150px] mix-blend-screen"
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
              <div className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/30 border border-white/10">
                <BarChart2 className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Sales <span className="text-purple-400">Operations</span>
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
                  <Users className="w-8 h-8 text-purple-400" />
                  Registered Leads
                </h2>
                <p className="text-gray-400 mt-3 font-medium text-lg max-w-xl">
                  Monitor user registrations and track their progress towards completing a loan application.
                </p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-inner">
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500"></span>
                </span>
                <div className="flex flex-col items-end">
                <span className="text-3xl text-purple-400 font-black tracking-tighter leading-none">{totalLeads}</span>
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Total Leads</span>
              </div>
              </div>
            </div>
            
            <div className="relative max-w-md w-full">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-inner font-medium text-sm"
              />
            </div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4"
          >
            {leads.map((lead, index) => (
              <motion.div 
                variants={itemVariants}
                key={lead.user.id} 
                className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-purple-500/30 shadow-2xl transition-all flex flex-col justify-between"
              >
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-purple-500/20 border border-white/10">
                      {(lead.user.fullName || lead.user.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold tracking-widest text-purple-400 uppercase mb-0.5">
                        Lead <span className="text-purple-400/50 ml-1">#{(page - 1) * 9 + index + 1}</span>
                      </p>
                      <p className="text-lg font-black text-white leading-tight truncate max-w-[200px]">
                        {lead.user.fullName || 'N/A'}
                      </p>
                      <p className="text-xs font-medium text-gray-400 mt-1 flex items-center gap-1.5 truncate max-w-[200px]">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        {lead.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 py-3 px-4 rounded-xl border border-purple-500/20 w-full shadow-inner flex flex-col justify-center items-center mt-2">
                    <p className="text-[10px] font-bold tracking-widest text-purple-400 uppercase mb-1">Registration Date</p>
                    <p className="text-xl font-black text-white tracking-tight">
                      {new Date(lead.user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex flex-col justify-center">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Profile Setup</p>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                        lead.hasPersonalDetails ? 'text-emerald-400' : 'text-yellow-400'
                    }`}>
                      {lead.hasPersonalDetails ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      {lead.hasPersonalDetails ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex flex-col justify-center">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Total Applications</p>
                    <div className="text-base font-bold text-white flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-purple-400" />
                      {lead.totalApplications}
                    </div>
                  </div>
                </div>
                
                <div className={`p-3 rounded-lg border flex flex-col justify-center shadow-inner ${
                  lead.hasApplied
                    ? 'bg-purple-500/10 border-purple-500/20'
                    : 'bg-white/5 border-white/10'
                }`}>
                  <p className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${
                    lead.hasApplied ? 'text-purple-300' : 'text-gray-400'
                  }`}>Application Status</p>
                  <p className="text-lg font-black text-white">{lead.hasApplied ? 'Applied' : 'Not Applied'}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {leads.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-24"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-500/10 text-purple-400 mb-6 border border-purple-500/20 shadow-inner">
                <Users className="w-10 h-10" strokeWidth={1.5} />
              </div>
              <p className="text-gray-400 text-xl font-medium">
                {searchQuery ? 'No leads match your search.' : 'No leads found at the moment.'}
              </p>
              {!searchQuery && <p className="text-gray-500 mt-2">New registrations will appear here automatically.</p>}
            </motion.div>
          )}

          {totalPages > 1 && (
            <div className="py-6 shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm font-medium">
                Showing <span className="text-white font-bold">{(page - 1) * 9 + 1}</span> to <span className="text-white font-bold">{Math.min(page * 9, totalLeads)}</span> of <span className="text-white font-bold">{totalLeads}</span> results
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
                          ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' 
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
