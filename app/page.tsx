'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/FirebaseProvider';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { MasterPrompt } from '@/components/MasterPrompt';
import { ContentStudio } from '@/components/ContentStudio';
import { Scheduler } from '@/components/Scheduler';
import { FacebookConnect } from '@/components/FacebookConnect';
import { Logs } from '@/components/Logs';
import { Settings } from '@/components/Settings';
import { signIn } from '@/lib/firebase';
import Image from 'next/image';
import { Facebook, Zap, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AutomationEngine } from '@/components/AutomationEngine';

export default function Page() {
  const { loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
        <div className="flex flex-col items-center gap-6">
          <Zap className="w-12 h-12 text-indigo-500 animate-pulse fill-indigo-500/20" />
          <p className="text-indigo-200/40 font-bold text-xs tracking-[0.4em] uppercase animate-pulse">SONAI Initializing</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'master-prompt': return <MasterPrompt />;
      case 'content-studio': return <ContentStudio />;
      case 'scheduler': return <Scheduler />;
      case 'facebook': return <FacebookConnect />;
      case 'logs': return <Logs />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      <AutomationEngine />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto max-h-screen font-sans">
        <div className="max-w-7xl mx-auto p-8 lg:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
