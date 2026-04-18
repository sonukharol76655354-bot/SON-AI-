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
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authLoading, setAuthLoading] = useState(false);

  const handleLogin = async () => {
    setAuthLoading(true);
    try {
      await signIn();
    } catch (error) {
      console.error('Login Error:', error);
      alert('Login failed. Please check if your popup is blocked or the domain is authorized in Firebase.');
    } finally {
      setAuthLoading(false);
    }
  };

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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a] p-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-cyan-500/5" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass max-w-md w-full rounded-[32px] p-12 text-center space-y-10 shadow-3xl relative z-10"
        >
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/40">
              <Zap className="w-10 h-10 text-white fill-white/20" />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter text-white uppercase">SONAI</h1>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400/80 mt-1">Media Automation Pro</p>
            </div>
            <p className="text-sm text-ink-muted leading-relaxed font-medium">
              Revolutionize your Facebook presence with the world&apos;s most elite AI automation engine.
            </p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleLogin}
              disabled={authLoading}
              className="btn-primary w-full h-16 flex items-center justify-center gap-4 text-sm tracking-widest uppercase shadow-indigo-500/40"
            >
              {authLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Image src="https://www.google.com/favicon.ico" width={20} height={20} className="w-5 h-5 grayscale-0 rounded-full" alt="Google" referrerPolicy="no-referrer" />
              )}
              <span>{authLoading ? 'Authorizing...' : 'Connect Administration'}</span>
            </button>
            <p className="text-[10px] text-ink-muted/40 font-bold uppercase tracking-widest pt-4">Secured by Cloud Node 01</p>
          </div>
        </motion.div>
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
