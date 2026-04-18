'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Globe, Shield, Zap, Database, Lock, Settings as SettingsIcon } from 'lucide-react';

export function Settings() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data());
      } else {
        const initial = {
          timezone: 'America/New_York',
          manualApproval: true,
          contentVariation: 'Medium',
          duplicatePrevention: true,
          updatedAt: new Date().toISOString()
        };
        setSettings(initial);
        setDoc(doc(db, 'settings', 'global'), initial);
      }
    });
    return () => unsub();
  }, []);

  const updateSettings = async (updates: any) => {
    await setDoc(doc(db, 'settings', 'global'), { ...updates, updatedAt: new Date().toISOString() }, { merge: true });
  };

  if (!settings) return null;

  return (
    <div className="space-y-12 max-w-6xl mx-auto font-sans animate-in fade-in duration-700">
      <header>
        <div className="flex items-center gap-2 text-indigo-400 mb-2">
          <SettingsIcon className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">System Configuration</span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-white uppercase leading-none">Settings</h1>
        <p className="text-ink-muted font-medium mt-3 max-w-xl text-sm leading-relaxed">
          Fine-tune the SONAI core architecture, safety protocols, and synchronization parameters.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="admin-card space-y-8 bg-slate-900/60 transition-all border-white/5 hover:border-indigo-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">Localization Core</h2>
              <p className="text-[10px] font-bold text-indigo-400/50 uppercase tracking-widest">Geo-Sync Tuning</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-ink-muted/60">Standardized Timezone</label>
              <select 
                value={settings.timezone}
                onChange={e => updateSettings({ timezone: e.target.value })}
                className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-xs font-bold transition-all outline-none focus:border-indigo-500/30"
              >
                <option value="America/New_York">America/New_York (UTC-5)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (UTC+5:30)</option>
                <option value="Europe/London">Europe/London (UTC+0)</option>
              </select>
            </div>
            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
               <p className="text-[10px] text-indigo-300 font-medium leading-relaxed">
                 SONAI is currently fine-tuned for <span className="text-white font-bold">USA / North American</span> contexts by default. 
                 This timezone anchors all 2-hour neural loops.
               </p>
            </div>
          </div>
        </section>

        <section className="admin-card space-y-8 bg-slate-900/60 transition-all border-white/5 hover:border-indigo-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">Safety Protocols</h2>
              <p className="text-[10px] font-bold text-emerald-500/50 uppercase tracking-widest">Filter & Approval</p>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => updateSettings({ manualApproval: !settings.manualApproval })}
              className={cn(
                "w-full flex items-center justify-between p-5 rounded-2xl border transition-all",
                settings.manualApproval ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/5 border-white/5"
              )}
            >
              <div className="text-left">
                <p className="text-[11px] font-black text-white uppercase tracking-widest">Manual Approval Shield</p>
                <p className="text-[9px] text-ink-muted font-bold uppercase tracking-widest mt-1">Review content before post</p>
              </div>
              <div className={cn("w-10 h-5 rounded-full relative transition-all", settings.manualApproval ? "bg-emerald-500" : "bg-slate-700")}>
                 <div className={cn("w-3 h-3 rounded-full bg-white absolute top-1 transition-all", settings.manualApproval ? "right-1" : "left-1")} />
              </div>
            </button>

            <button 
              onClick={() => updateSettings({ duplicatePrevention: !settings.duplicatePrevention })}
              className={cn(
                "w-full flex items-center justify-between p-5 rounded-2xl border transition-all",
                settings.duplicatePrevention ? "bg-indigo-500/10 border-indigo-500/30" : "bg-white/5 border-white/5"
              )}
            >
              <div className="text-left">
                <p className="text-[11px] font-black text-white uppercase tracking-widest">Duplicate Neural Guard</p>
                <p className="text-[9px] text-ink-muted font-bold uppercase tracking-widest mt-1">Vector check previous output</p>
              </div>
              <div className={cn("w-10 h-5 rounded-full relative transition-all", settings.duplicatePrevention ? "bg-indigo-500" : "bg-slate-700")}>
                 <div className={cn("w-3 h-3 rounded-full bg-white absolute top-1 transition-all", settings.duplicatePrevention ? "right-1" : "left-1")} />
              </div>
            </button>
          </div>
        </section>

        <section className="admin-card space-y-8 bg-slate-900/60 transition-all border-white/5 hover:border-indigo-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">Engine Intensity</h2>
              <p className="text-[10px] font-bold text-indigo-400/50 uppercase tracking-widest">Variation Parameters</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-ink-muted/60">Content Variation Level</label>
            <select 
              value={settings.contentVariation}
              onChange={e => updateSettings({ contentVariation: e.target.value })}
              className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-xs font-bold transition-all outline-none focus:border-indigo-500/30"
            >
               <option>Low</option>
               <option>Medium</option>
               <option>High</option>
               <option>Extreme</option>
            </select>
          </div>
        </section>

        <section className="admin-card space-y-8 bg-slate-900/60 transition-all border-white/5 hover:border-indigo-500/20 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">Storage Node</h2>
              <p className="text-[10px] font-bold text-indigo-400/50 uppercase tracking-widest">Cloud Health Status</p>
            </div>
          </div>
          <div className="space-y-3">
             <div className="flex items-center justify-between p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl hover:bg-indigo-500/10 transition-colors">
                <div className="flex items-center gap-3">
                   <Lock className="w-4 h-4 text-emerald-500" />
                   <span className="text-[11px] font-black uppercase tracking-widest text-emerald-500">Database Ready</span>
                </div>
                <div className="text-[8px] font-mono opacity-40">node-alpha-01</div>
             </div>
             <div className="flex items-center justify-between p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl hover:bg-indigo-500/10 transition-colors">
                <div className="flex items-center gap-3">
                   <Shield className="w-4 h-4 text-indigo-400" />
                   <span className="text-[11px] font-black uppercase tracking-widest text-indigo-400">Security Gate: Active</span>
                </div>
                <div className="text-[8px] font-mono opacity-40">tls-1.3-v2</div>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
}
