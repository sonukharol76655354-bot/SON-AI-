'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { CheckCircle2, AlertCircle, Clock, Search, Filter, History } from 'lucide-react';

export function Logs() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'logs'), orderBy('runAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-12 max-w-6xl mx-auto font-sans animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 mb-2">
            <History className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">System Audit</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-white uppercase leading-none">Activity Logs</h1>
          <p className="text-ink-muted font-medium mt-3 max-w-xl text-sm leading-relaxed">
            Real-time feed of SONAI&apos;s internal operations, neural cycles, and network interactions.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted opacity-40 group-focus-within:text-indigo-400 group-focus-within:opacity-100 transition-all" />
            <input 
              placeholder="Search audit trail..." 
              className="pl-12 pr-6 h-14 w-72 bg-white/5 border border-white/5 rounded-2xl text-[11px] font-bold uppercase tracking-widest focus:border-indigo-500/30 transition-all outline-none" 
            />
          </div>
        </div>
      </header>

      <div className="admin-card overflow-hidden p-0 border-white/5 shadow-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.03] text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/60 border-b border-white/5">
                <th className="px-8 py-6">Operation Status</th>
                <th className="px-8 py-6">Neural Narrative</th>
                <th className="px-8 py-6">Cycle Timestamp</th>
                <th className="px-8 py-6">Network Node</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-indigo-500/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 ${log.status === 'success' ? 'bg-emerald-500/5 text-emerald-500' : 'bg-red-500/5 text-red-500'}`}>
                        {log.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${log.status === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {log.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-[12px] font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                      {log.message}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-[10px] text-ink-muted/60 font-mono">
                      <Clock className="w-3.5 h-3.5 opacity-40" />
                      {new Date(log.runAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[9px] font-black uppercase tracking-widest p-2 bg-white/5 rounded-lg border border-white/5 text-ink-muted/40 group-hover:text-white transition-colors">
                      {log.contentId ? `Node-${log.contentId.slice(0, 6)}` : 'Internal Core'}
                    </span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <History className="w-12 h-12" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em]">No operational data available</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
