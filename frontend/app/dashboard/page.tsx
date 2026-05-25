'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, clearAuth } from '@/lib/auth';
import { motion } from 'framer-motion';
import { 
  LogOut, 
  LayoutDashboard, 
  BarChart2, 
  ShieldCheck, 
  Landmark, 
  Banknote, 
  ChevronRight,
  Activity,
  Users
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = getUser();
    if (!userData) {
      router.push('/login');
      return;
    }

    if (userData.role === 'BORROWER') {
      router.push('/borrower/dashboard');
      return;
    }

    setUser(userData);
  }, [router]);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const handleModuleClick = (module: string) => {
    router.push(`/dashboard/${module}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const modules = [
    { id: 'sales', name: 'Sales Operations', description: 'Manage lead tracking and initial applicant screening.', roles: ['SALES', 'ADMIN'], color: 'from-purple-500 to-indigo-600', shadow: 'shadow-indigo-500/20', icon: BarChart2 },
    { id: 'sanction', name: 'Sanction & Underwriting', description: 'Review risk, verify documents, and approve applications.', roles: ['SANCTION', 'ADMIN'], color: 'from-blue-500 to-cyan-600', shadow: 'shadow-cyan-500/20', icon: ShieldCheck },
    { id: 'disbursement', name: 'Treasury & Disbursement', description: 'Execute fund transfers and generate repayment schedules.', roles: ['DISBURSEMENT', 'ADMIN'], color: 'from-emerald-400 to-teal-600', shadow: 'shadow-emerald-500/20', icon: Landmark },
    { id: 'collection', name: 'Collections & Recovery', description: 'Track EMIs, record payments, and manage active loans.', roles: ['COLLECTION', 'ADMIN'], color: 'from-orange-400 to-rose-500', shadow: 'shadow-rose-500/20', icon: Banknote },
    { id: 'admin', name: 'User Administration', description: 'Manage operational users and assign module access roles.', roles: ['ADMIN'], color: 'from-fuchsia-500 to-pink-600', shadow: 'shadow-pink-500/20', icon: Users }
  ];

  const accessibleModules = modules.filter(module => module.roles.includes(user.role));

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="h-screen bg-[#0f172a] relative overflow-hidden selection:bg-indigo-500/30 flex flex-col">
      {/* Premium Dark Mode Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} 
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/30 rounded-full blur-[150px] mix-blend-screen"
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/30 rounded-full blur-[150px] mix-blend-screen"
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
              <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30 border border-white/10">
                <LayoutDashboard className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Operations <span className="text-indigo-400">Hub</span>
              </h1>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-6"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-200">{user.fullName || user.email}</p>
                <div className="flex items-center justify-end gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse"></span>
                  <p className="text-xs text-indigo-300 font-bold tracking-widest uppercase">{user.role}</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="p-2 sm:px-4 sm:py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-xl transition-all duration-300 font-semibold text-sm backdrop-blur-md flex items-center gap-2 group"
                title="Logout"
              >
                <LogOut className="w-5 h-5 sm:w-4 sm:h-4 transition-colors" />
                <span className="hidden sm:inline">Logout</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto relative z-10 w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col no-scrollbar">
        <div className="max-w-7xl mx-auto space-y-8 flex-1 flex flex-col min-h-0">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-bold mb-6">
            <Activity className="w-4 h-4" />
            System Online & Secure
          </div>
          <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-gray-400 mb-6 tracking-tight">
            Welcome back, {user.fullName?.split(' ')[0] || 'Executive'}
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl font-medium leading-relaxed">
            Access your authorized operational modules below. Ensure all procedures align with current compliance protocols before approving or disbursing funds.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {accessibleModules.map((module) => {
            const Icon = module.icon;
            return (
              <motion.button
                key={module.id}
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleModuleClick(module.id)}
                className="group relative bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 text-left transition-all duration-500 hover:bg-white/10 hover:border-white/20 overflow-hidden flex flex-col h-full"
              >
                {/* Hover gradient effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-700`}></div>
                
                <div className={`w-14 h-14 bg-gradient-to-br ${module.color} rounded-2xl flex items-center justify-center mb-8 shadow-lg ${module.shadow} transform group-hover:scale-110 transition-transform duration-500 border border-white/20`}>
                  <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                  {module.name}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium mb-8">
                  {module.description}
                </p>

                <div className="mt-auto flex items-center text-sm font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors uppercase tracking-wider">
                  Access Module 
                  <ChevronRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {accessibleModules.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-md rounded-3xl border border-red-500/20 p-12 text-center shadow-2xl shadow-red-500/5 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-red-500/5"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 text-red-400 mb-6 border border-red-500/20">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Access Restricted</h3>
              <p className="text-gray-400 max-w-md mx-auto text-lg leading-relaxed">
                You don't have access to any operations modules. Please contact your system administrator if you believe this is an error.
              </p>
            </div>
          </motion.div>
        )}
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
