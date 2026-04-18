'use client';

import React, { useState, useEffect } from 'react';
import { 
  Facebook, 
  CheckCircle2, 
  RefreshCw, 
  Layers, 
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, addDoc, getDocs, deleteDoc } from 'firebase/firestore';

export function FacebookConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [pages, setPages] = useState<any[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubAccount = onSnapshot(doc(db, 'facebookAccounts', 'primary'), (doc) => {
      setIsConnected(doc.exists());
    });

    const unsubPages = onSnapshot(collection(db, 'facebookPages'), (snapshot) => {
      setPages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setSelectedPageId(doc.data().selectedPageId || null);
      }
    });

    return () => {
      unsubAccount();
      unsubPages();
      unsubSettings();
    };
  }, []);

  const simulateLogin = async () => {
    setLoading(true);
    setTimeout(async () => {
      await setDoc(doc(db, 'facebookAccounts', 'primary'), {
        userId: 'fb_user_12345',
        name: 'SONAI Administrator',
        connectedAt: new Date().toISOString()
      });

      const oldPages = await getDocs(collection(db, 'facebookPages'));
      for (const p of oldPages.docs) {
        await deleteDoc(doc(db, 'facebookPages', p.id));
      }

      const mockPages = [
        { pageId: 'page_001', name: 'Elite Marketing Pro', category: 'Business' },
        { pageId: 'page_002', name: 'AI News Daily', category: 'Media' },
        { pageId: 'page_003', name: 'The SONAI Community', category: 'Community' },
      ];

      for (const mp of mockPages) {
        await addDoc(collection(db, 'facebookPages'), mp);
      }

      setLoading(false);
    }, 1500);
  };

  const selectPage = async (pageId: string) => {
    await setDoc(doc(db, 'settings', 'global'), { selectedPageId: pageId }, { merge: true });
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto font-sans">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-white uppercase">Facebook Bridge</h1>
        <p className="text-ink-muted font-medium mt-1">Establish a direct session link between SONAI and your Facebook environment.</p>
      </header>

      {!isConnected ? (
        <div className="admin-card p-20 flex flex-col items-center text-center space-y-8 bg-slate-900/60 shadow-3xl">
          <div className="w-24 h-24 bg-indigo-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-indigo-600/30">
            <Facebook className="w-12 h-12 text-white" />
          </div>
          <div className="max-w-md space-y-4">
            <h2 className="text-3xl font-black text-white">No Active Connection</h2>
            <p className="text-sm text-ink-muted leading-relaxed font-medium">
              SONAI requires a secure session link to discover and manage your pages. 
              Login below to synchronize your digital assets.
            </p>
          </div>
          <button 
            onClick={simulateLogin}
            disabled={loading}
            className="btn-primary flex items-center gap-4 px-10 h-16 shadow-indigo-500/40 group overflow-hidden relative"
          >
            <Facebook className="w-5 h-5 fill-white" />
            <span className="text-xs font-bold uppercase tracking-widest">{loading ? 'Synchronizing Session...' : 'Connect to Facebook'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <section className="admin-card space-y-8 relative overflow-hidden bg-slate-900/60">
              <div className="absolute -top-4 -right-4 p-8 opacity-5">
                <ShieldCheck className="w-32 h-32" />
              </div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">Bridge Status</h2>
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Facebook className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-black text-white">Administrator</p>
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-0.5">Verified Session</p>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                {['Authentication Active', 'Session Token Fresh', 'System Node Linked'].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-emerald-400/80">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={simulateLogin}
                className="w-full btn-secondary text-[10px] font-bold uppercase tracking-widest py-4 border-white/5 active:scale-[0.98]"
              >
                Refresh Connection
              </button>
            </section>
          </div>

          <div className="md:col-span-2 space-y-6">
            <section className="admin-card space-y-8 bg-slate-900/60">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-black text-white">Available Pages</h2>
                </div>
                <span className="text-[10px] font-bold text-ink-muted/40 uppercase tracking-widest">{pages.length} Pages Found</span>
              </div>

              <div className="space-y-3">
                {pages.map((page) => (
                  <div 
                    key={page.id}
                    onClick={() => selectPage(page.pageId)}
                    className={cn(
                      "flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition-all",
                      selectedPageId === page.pageId 
                        ? 'bg-indigo-500/10 border-indigo-500/30' 
                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-black text-indigo-400 shadow-inner">
                        {page.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white leading-none">{page.name}</p>
                        <p className="text-[10px] text-ink-muted font-bold uppercase tracking-widest mt-1.5">{page.category}</p>
                      </div>
                    </div>
                    {selectedPageId === page.pageId ? (
                      <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
                        <Zap className="w-3 h-3 fill-indigo-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Active Target</span>
                      </div>
                    ) : (
                      <div className="text-[10px] font-bold uppercase tracking-widest text-ink-muted/40 group-hover:text-white">Connect</div>
                    )}
                  </div>
                ))}
                {pages.length === 0 && (
                  <div className="text-center py-20 text-ink-muted/40 bg-white/5 rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center gap-4">
                    <RefreshCw className="w-8 h-8 opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest">No pages discovered. Reconnect your session.</p>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-4">
                <ExternalLink className="w-4 h-4 text-indigo-400 shrink-0" />
                <p className="text-[10px] text-ink-muted/80 leading-relaxed font-medium capitalize">
                  SONAI uses direct-access logic to synchronize with your chosen target. 
                  Automation cycles will only execute for the &quot;Active Target&quot; above.
                </p>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
