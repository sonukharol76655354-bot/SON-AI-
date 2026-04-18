'use client';

import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  BarChart3,
  Facebook,
  Bot,
  History
} from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, limit, orderBy } from 'firebase/firestore';

export function Dashboard() {
  const [stats, setStats] = useState({
    automationStatus: 'Off',
    fbStatus: 'Disconnected',
    nextRun: 'N/A',
    lastRun: 'N/A',
    totalGenerated: 0,
    totalPublished: 0,
    failedAttempts: 0
  });

  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    // Listen to global settings
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setStats(prev => ({
          ...prev,
          automationStatus: data.isAutomationEnabled ? 'Active' : 'Paused',
          nextRun: data.nextRunAt || 'N/A',
          lastRun: data.lastRunAt || 'N/A'
        }));
      }
    });

    // Listen to logs
    const q = query(collection(db, 'logs'), orderBy('runAt', 'desc'), limit(5));
    const unsubLogs = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentLogs(logs);
    });

    return () => {
      unsubSettings();
      unsubLogs();
    };
  }, []);

  const statCards = [
    { label: 'Intelligence', value: stats.automationStatus, icon: Activity, color: stats.automationStatus === 'Active' ? 'text-emerald-500' : 'text-amber-500' },
    { label: 'Network', value: stats.fbStatus, icon: Facebook, color: 'text-indigo-400' },
    { label: 'Next Cycle', value: stats.nextRun, icon: Clock, color: 'text-indigo-300' },
    { label: 'System Health', value: '100%', icon: CheckCircle2, color: 'text-emerald-500' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-ink-muted mb-2 opacity-50">Operational Summary</p>
          <h1 className="text-5xl font-black tracking-tighter uppercase whitespace-nowrap">SONAI Core Engine</h1>
          <div className="flex items-center gap-2 mt-2 text-ink-muted/50 font-mono text-[10px] uppercase">
             <span>UTC-4 EST</span>
             <span className="w-1 h-1 rounded-full bg-white/20" />
             <span className="animate-pulse text-green-500/80">Synchronized</span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="status-pill bg-white/5 border-white/10 text-white flex items-center gap-2 px-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,1)] animate-pulse" />
            Active
          </div>
          <div className="status-pill bg-white/5 border-white/10 text-white flex items-center gap-2 px-6">
            v3.0 ENTERPRISE
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-[32px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group overflow-hidden relative shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity">
               <stat.icon className="w-32 h-32 scale-150 rotate-12" />
            </div>
            <div className="flex items-center justify-between mb-8">
              <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-[8px] font-black uppercase tracking-[0.2em] opacity-20">Real-time</div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ink-muted mb-1 opacity-50">{stat.label}</p>
            <p className="text-2xl font-black tracking-tight uppercase group-hover:text-blue-400 transition-colors">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 glass p-10 rounded-[40px] border-white/5">
          <h2 className="card-title">Live Intelligence Feed</h2>
          <div className="space-y-4">
            {recentLogs.length > 0 ? (
              recentLogs.map((log) => (
                <div key={log.id} className="flex items-center gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all cursor-default group">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/5 ${log.status === 'success' ? 'bg-green-500/5 text-green-500' : 'bg-red-500/5 text-red-500'}`}>
                    {log.status === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black uppercase tracking-widest group-hover:text-white transition-colors">{log.message}</p>
                    <p className="text-[9px] text-ink-muted/50 font-mono mt-1">{new Date(log.runAt).toLocaleString()}</p>
                  </div>
                  <div className="text-[8px] font-black uppercase tracking-[0.3em] opacity-0 group-hover:opacity-20 transition-opacity">Decrypted</div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center gap-4">
                 <History className="w-12 h-12" />
                 <p className="text-[10px] font-black uppercase tracking-widest">Awaiting system ignition</p>
              </div>
            )}
          </div>
        </section>

        <section className="glass p-10 rounded-[40px] border-white/5 flex flex-col items-center justify-center text-center gap-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <h2 className="card-title w-full text-left relative z-10">Active Pipeline</h2>
          <div className="w-24 h-24 rounded-[32px] bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center relative z-10 shadow-3xl group-hover:scale-110 transition-transform">
            <BarChart3 className="w-10 h-10 text-indigo-400 group-hover:text-white transition-colors" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-[0.2em] mb-3 text-indigo-400">Next Phase Ready</p>
            <p className="text-[10px] text-ink-muted font-medium leading-relaxed max-w-[200px] mx-auto opacity-50">
              The neural engine is synchronized with your Master Context and ready for the next 2-hour publishing cycle.
            </p>
          </div>
          <button className="btn-primary w-full relative z-10 flex items-center justify-center gap-3 py-5 uppercase group-hover:translate-y-[-2px] transition-all">
            <Bot className="w-4 h-4" />
            <span className="text-[10px] tracking-widest font-black">Open Neural Link</span>
          </button>
        </section>
      </div>
    </div>
  );
}
