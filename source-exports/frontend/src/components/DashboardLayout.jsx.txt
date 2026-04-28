import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Menu, X, User } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ children, isPatient, isDoctor, isAdmin }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex font-inter">
      {/* Sidebar - Desktop */}
      <Sidebar isPatient={isPatient} isDoctor={isDoctor} isAdmin={isAdmin} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-100 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-4 lg:hidden">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-xl"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-medigo-blue rounded-lg flex items-center justify-center text-white font-black text-xs">M</div>
              <span className="font-black text-medigo-navy text-sm">MediGo</span>
            </div>
          </div>

          {/* Search (Optional for top bar) */}
          <div className="hidden sm:flex flex-1 max-w-md ml-4 mr-8">
            <div className="relative w-full group">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-medigo-blue transition-colors" />
              <input 
                type="text" 
                placeholder="Search resources, doctors, or reports..." 
                className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:bg-white focus:border-medigo-blue focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notification Bell */}
            <button className="relative p-2 text-slate-400 hover:bg-slate-50 hover:text-medigo-blue rounded-xl transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            <div className="h-8 w-px bg-slate-100 mx-1 hidden sm:block" />

            {/* Mobile/Default User Chip */}
            <div className="flex items-center gap-3 pl-3 pr-1 py-1 rounded-full bg-slate-50 border border-slate-100">
               <div className="text-right hidden sm:block">
                  <p className="text-[12px] font-bold text-medigo-navy leading-none">{user?.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{user?.role}</p>
               </div>
               <div className="w-8 h-8 rounded-full bg-medigo-blue text-white flex items-center justify-center text-xs font-black shadow-sm">
                  {user?.name?.[0].toUpperCase()}
               </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 animate-fade-in">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-medigo-navy/40 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 lg:hidden shadow-2xl overflow-y-auto"
            >
              <div className="p-6 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-medigo-blue rounded-lg flex items-center justify-center text-white font-black text-xs">M</div>
                  <span className="font-black text-medigo-navy text-lg tracking-tight">MediGo</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <Sidebar isPatient={isPatient} isDoctor={isDoctor} isAdmin={isAdmin} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardLayout;
