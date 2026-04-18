'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Timer, Calendar, Globe, Power, Play, Pause, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { format } from 'date-fns';

const timeSlots = [
  '12 AM', '2 AM', '4 AM', '6 AM', '8 AM', '10 AM',
  '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'
];

export function Scheduler() {
  const [globalSettings, setGlobalSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testTime, setTestTime] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) setGlobalSettings(doc.data());
    });
    return unsub;
  }, []);

  const updateAutomation = async (updates: any) => {
    setLoading(true);
    await setDoc(doc(db, 'settings', 'global'), { 
      ...globalSettings, 
      ...updates,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    setLoading(false);
  };

  const handleManualTest = async () => {
    alert(`System scheduled for manual test at ${testTime}. In production, this would bypass the 2-hour loop once.`);
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto font-sans">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">Scheduler</h1>
          <p className="text-ink-muted font-medium mt-1">Manage continuous automation and manual posting tests.</p>
        </div>
        <div className="glass px-4 py-2 rounded-xl flex items-center gap-3 text-xs border-indigo-500/10">
          <Globe className="w-4 h-4 text-indigo-400" />
          <span className="text-ink-muted">Timezone:</span>
          <span className="font-bold text-white">America/New_York (Default)</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <section className="admin-card space-y-8">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                globalSettings?.isAutomationEnabled ? "bg-indigo-500 shadow-lg shadow-indigo-500/40 text-white" : "bg-white/5 text-ink-muted"
              )}>
                <Power className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Continuous Automation</h3>
                <p className="text-[10px] text-ink-muted font-bold uppercase tracking-widest mt-0.5">2-Hour Recurring Loop</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => updateAutomation({ isAutomationEnabled: true, status: 'active' })}
                disabled={loading || globalSettings?.isAutomationEnabled}
                className={cn(
                  "p-4 rounded-xl font-bold flex items-center justify-between border transition-all",
                  globalSettings?.isAutomationEnabled ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" : "bg-white/5 border-white/5 hover:border-indigo-500/30 text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <Play className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-widest">Start Automation</span>
                </div>
                {globalSettings?.isAutomationEnabled && <CheckCircle2 className="w-4 h-4" />}
              </button>

              <button 
                onClick={() => updateAutomation({ isAutomationEnabled: false, status: 'stopped' })}
                disabled={loading || !globalSettings?.isAutomationEnabled}
                className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-red-500/30 hover:bg-red-500/5 text-ink-muted hover:text-red-400 font-bold flex items-center gap-3 transition-all"
              >
                <Pause className="w-4 h-4" />
                <span className="text-xs uppercase tracking-widest">Stop / Pause Engine</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-4">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                <span className="text-ink-muted">Next Run (Auto)</span>
                <span className="text-indigo-400">12:00 PM EST</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: '0%' }}
                  animate={{ width: '65%' }}
                  className="h-full bg-indigo-500"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="admin-card space-y-8 h-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-ink-muted border border-white/10">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Manual Test Schedule</h3>
                <p className="text-[10px] text-ink-muted font-bold uppercase tracking-widest mt-0.5">One-Time Posting Event</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-ink-muted/60 uppercase tracking-widest">Select Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={testTime}
                  onChange={(e) => setTestTime(e.target.value)}
                  className="w-full bg-slate-950/50 border-white/10 rounded-xl px-4 py-4 text-white font-mono text-sm"
                />
              </div>
              <button 
                onClick={handleManualTest}
                className="btn-secondary w-full py-4 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
              >
                <Timer className="w-4 h-4 text-indigo-400 underline" />
                <span className="text-xs font-bold uppercase tracking-widest">Schedule Manual Test</span>
              </button>
            </div>

            <div className="mt-auto space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-white/5 text-[10px] font-bold uppercase tracking-widest">
                <span className="text-ink-muted">Last Success:</span>
                <span className="text-white">2026-04-18 04:00 AM</span>
              </div>
              <div className="flex justify-between items-center py-2 text-[10px] font-bold uppercase tracking-widest">
                <span className="text-ink-muted">System Uptime:</span>
                <span className="text-green-400">99.9% Reliable</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
