'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getUser, clearAuth } from '@/lib/auth';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  Users,
  ShieldCheck,
  Plus,
  X,
  Mail,
  Lock,
  User as UserIcon,
  Shield,
  Clock,
  Ban,
  Unlock
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'SALES'
  });

  useEffect(() => {
    const userData = getUser();
    if (!userData || userData.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    setUser(userData);
    fetchUsers();
  }, [router, page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/users?page=${page}&limit=9`);
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
      setTotalUsers(response.data.totalUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await api.post('/admin/users', formData);
      toast.success('User created successfully');
      setIsAddModalOpen(false);
      setFormData({ fullName: '', email: '', password: '', role: 'SALES' });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleBlock = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/block`, { isBlocked: !currentStatus });
      toast.success(`User ${!currentStatus ? 'blocked' : 'unblocked'} successfully`);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'from-fuchsia-500 to-pink-600 shadow-pink-500/20';
      case 'SALES': return 'from-purple-500 to-indigo-600 shadow-indigo-500/20';
      case 'SANCTION': return 'from-blue-500 to-cyan-600 shadow-cyan-500/20';
      case 'DISBURSEMENT': return 'from-emerald-400 to-teal-600 shadow-emerald-500/20';
      case 'COLLECTION': return 'from-orange-400 to-rose-500 shadow-rose-500/20';
      default: return 'from-gray-500 to-slate-600 shadow-slate-500/20';
    }
  };

  if (!user || loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0f172a] relative overflow-hidden flex flex-col selection:bg-fuchsia-500/30">
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }} 
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-fuchsia-600/20 rounded-full blur-[150px] mix-blend-screen"
        />
      </div>

      <nav className="relative z-20 bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 shadow-2xl shadow-black/50 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-fuchsia-500 to-pink-600 rounded-xl shadow-lg shadow-pink-500/30 border border-white/10">
                <Users className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                User <span className="text-fuchsia-400">Administration</span>
              </h1>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
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
        <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 min-h-0">
          <div className="py-6 shrink-0 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
              <div>
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-fuchsia-400" />
                  Operational Staff
                </h2>
                <p className="text-gray-400 mt-3 font-medium text-lg max-w-xl">
                  Manage platform users, assign specific module access, and control operational roles.
                </p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsAddModalOpen(true)}
                className="px-6 py-4 bg-gradient-to-r from-fuchsia-500 to-pink-600 rounded-2xl text-white font-bold shadow-lg shadow-pink-500/20 flex items-center gap-2 hover:from-fuchsia-600 hover:to-pink-700 transition-all border border-white/10"
              >
                <Plus className="w-5 h-5" />
                Add New User
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
            {users.map((u) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={u._id} 
                className={`p-6 bg-white/5 rounded-3xl border ${u.isBlocked ? 'border-red-500/30 opacity-75 grayscale' : 'border-white/10 hover:border-fuchsia-500/30'} shadow-2xl transition-all flex flex-col justify-between backdrop-blur-xl relative overflow-hidden`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${u.isBlocked ? 'from-red-500 to-red-800' : getRoleColor(u.role)}`}></div>
                
                <div className="flex flex-col gap-4 flex-1">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 bg-gradient-to-br ${u.isBlocked ? 'from-red-500 to-red-700' : getRoleColor(u.role)} rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg border border-white/20 shrink-0`}>
                      {u.fullName?.charAt(0).toUpperCase() || u.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xl font-black text-white truncate flex items-center gap-2">
                        {u.fullName || 'No Name Provided'}
                      </p>
                      <p className="text-sm font-medium text-gray-400 truncate flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        {u.email}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 p-4 bg-black/20 rounded-2xl border border-white/5 shadow-inner">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Assigned Role</p>
                    <div className={`inline-flex px-4 py-1.5 rounded-full text-xs font-black text-white bg-gradient-to-r ${getRoleColor(u.role)} shadow-lg uppercase tracking-wider`}>
                      {u.role}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs font-medium text-gray-500 mt-auto px-2 pt-2">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Joined {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Top Right Block Button for active users */}
                {!u.isBlocked && user._id !== u._id && (
                  <button 
                    onClick={() => handleToggleBlock(u._id, u.isBlocked)}
                    className="absolute top-4 right-4 flex items-center justify-center p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all group"
                    title="Block User"
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                )}

                {/* Center Unblock Overlay for blocked users */}
                {u.isBlocked && (
                  <div className="absolute inset-0 z-20 bg-[#0f172a]/80 backdrop-blur-sm flex items-center justify-center">
                    <button 
                      onClick={() => handleToggleBlock(u._id, u.isBlocked)}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all shadow-lg"
                    >
                      <Unlock className="w-5 h-5" />
                      Unblock Access
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
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
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
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
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 to-pink-500/10 pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-fuchsia-400" />
                    Create New User
                  </h3>
                  <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white p-1">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input 
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all placeholder-gray-600"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input 
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all placeholder-gray-600"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Temporary Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input 
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all placeholder-gray-600"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Module Access (Role)</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all appearance-none cursor-pointer"
                      required
                    >
                      <option value="SALES">Sales Operations</option>
                      <option value="SANCTION">Sanction & Underwriting</option>
                      <option value="DISBURSEMENT">Treasury & Disbursement</option>
                      <option value="COLLECTION">Collections & Recovery</option>
                      <option value="ADMIN">System Administrator</option>
                    </select>
                  </div>
                  
                  <div className="pt-4 flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white font-semibold shadow-lg hover:shadow-pink-500/25 transition-all disabled:opacity-50"
                    >
                      {actionLoading ? 'Creating...' : 'Create User'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
