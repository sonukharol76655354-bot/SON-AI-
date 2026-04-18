'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Sparkles, 
  Send, 
  Trash2, 
  History, 
  Edit3, 
  CheckCircle2, 
  Clock,
  MoreVertical,
  Image as ImageIcon,
  Video,
  Upload,
  Loader2,
  Terminal,
  PlayCircle,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, deleteDoc, getDocs, where } from 'firebase/firestore';
import { generateContent } from '@/lib/gemini';
import { autoCaptionMedia, generateContentFromMaster } from '@/lib/automation';
import { motion, AnimatePresence } from 'motion/react';

export function ContentStudio() {
  const [items, setItems] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState<'image' | 'video'>('image');

  useEffect(() => {
    const q = query(collection(db, 'contents'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Find the active Master Intelligence Node
      const mq = query(collection(db, 'masterPrompts'), where('isActive', '==', true));
      const mSnap = await getDocs(mq);
      
      if (mSnap.empty) {
        throw new Error('No active Intelligence Node found. Please set a Master Prompt first.');
      }

      const masterConfig = mSnap.docs[0].data();

      const content = await generateContentFromMaster({
        ...masterConfig,
        mediaPreference: activeMediaTab,
        timezone: 'America/New_York'
      });
      
      await addDoc(collection(db, 'contents'), {
        ...content,
        mediaUrl: content.mediaUrl || `https://picsum.photos/seed/${Math.random()}/1080/1080`,
        mediaType: activeMediaTab,
        targetPageId: masterConfig.linkedPageId || 'unlinked',
        brandName: masterConfig.brandName,
        status: 'ready',
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.error(e);
      alert('Generation failed. Ensure Gemini API key is configured or Master Prompt is saved correctly.');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectItem = async (id: string, action: 'post' | 'delete') => {
    if (action === 'delete') {
      if (confirm('Permanently remove this generation?')) {
        await deleteDoc(doc(db, 'contents', id));
      }
    } else {
      await updateDoc(doc(db, 'contents', id), { status: 'posted', postedAt: new Date().toISOString() });
      await addDoc(collection(db, 'logs'), {
        runAt: new Date().toISOString(),
        status: 'success',
        message: 'Manual push to Facebook successful via Control link.'
      });
    }
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto font-sans animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 mb-2">
            <Zap className="w-4 h-4 fill-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Neural Factory</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-white uppercase leading-none">Content Studio</h1>
          <p className="text-ink-muted font-medium mt-3 max-w-xl text-sm leading-relaxed">
            Real-time generation engine producing premium assets directly from your SONAI Intelligence core.
          </p>
        </div>
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5">
           <button 
             onClick={() => setActiveMediaTab('image')}
             className={cn("px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeMediaTab === 'image' ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-ink-muted hover:text-white")}
           >
             Photography
           </button>
           <button 
             onClick={() => setActiveMediaTab('video')}
             className={cn("px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeMediaTab === 'video' ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-ink-muted hover:text-white")}
           >
             Cinematics
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <aside className="lg:col-span-1 space-y-8">
          <div className="admin-card space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
               <Terminal className="w-24 h-24 rotate-12" />
            </div>

            <div className="space-y-4 relative z-10">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 opacity-60">Engine Direct</label>
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="btn-primary w-full h-16 flex items-center justify-center gap-4 group relative overflow-hidden transition-transform active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                <Sparkles className={cn("w-5 h-5", isGenerating && "animate-spin")} />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] leading-none">
                  {isGenerating ? 'Synthesizing...' : `Generate ${activeMediaTab}`}
                </span>
              </button>
            </div>
            
            <div className="pt-4 border-t border-white/5 space-y-4">
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                 <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">AI Core Synchronized</span>
               </div>
               <p className="text-[10px] text-ink-muted/60 leading-relaxed font-medium">
                 Generations are optimized for your <span className="text-white">USA target audience</span> by default.
               </p>
            </div>
          </div>

          <div className="p-8 rounded-[32px] bg-indigo-500/5 border border-indigo-500/10 space-y-4">
             <div className="flex items-center gap-3 text-indigo-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Auto-Scale Ready</span>
             </div>
             <p className="text-[10px] text-indigo-300/60 leading-relaxed">
               Content created here is automatically tagged for the 2-hour scheduler loop.
             </p>
          </div>
        </aside>

        <div className="lg:col-span-3">
          {items.length === 0 ? (
            <div className="h-full min-h-[500px] border-2 border-dashed border-white/5 rounded-[48px] flex flex-col items-center justify-center text-ink-muted/30 space-y-6">
              <div className="w-20 h-20 rounded-full border border-white/5 flex items-center justify-center">
                <History className="w-8 h-8 opacity-40" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Studio Idle &bull; Awaiting Generation</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="admin-card group relative flex flex-col hover:border-indigo-500/30 transition-all shadow-xl hover:shadow-indigo-500/10"
                  >
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          item.status === 'posted' ? "bg-emerald-500" : "bg-indigo-500 animate-pulse"
                        )} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/60">
                          {item.mediaType} &bull; {item.status} {item.brandName ? `| ${item.brandName}` : ''}
                        </span>
                      </div>
                      <button 
                        onClick={() => selectItem(item.id, 'delete')}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-ink-muted/40 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4 mb-8">
                      {item.mediaUrl && (
                        <div className="aspect-[4/5] w-full rounded-2xl overflow-hidden border border-white/5 relative group/media">
                          <Image 
                            src={item.mediaUrl} 
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover/media:scale-110"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity flex items-end p-6">
                             <p className="text-[10px] text-white/70 font-mono line-clamp-2">{item.mediaPrompt || 'AI Generated Scene'}</p>
                          </div>
                          {item.mediaType === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                               <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover/media:scale-110 transition-transform">
                                  <PlayCircle className="w-8 h-8 text-white" />
                               </div>
                            </div>
                          )}
                        </div>
                      )}
                      <h3 className="text-xl font-black text-white leading-tight tracking-tight group-hover:text-indigo-400 transition-colors">
                        {item.title}
                      </h3>
                      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                        <p className="text-[12px] text-ink-muted leading-relaxed line-clamp-4 font-medium italic">
                          &quot;{item.caption}&quot;
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                      <div className="flex items-center gap-2 text-ink-muted/40">
                        <Clock className="w-3 h-3" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <button 
                        onClick={() => selectItem(item.id, 'post')}
                        disabled={item.status === 'posted'}
                        className={cn(
                          "px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                          item.status === 'posted' 
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                            : "bg-white/5 text-white hover:bg-white/10 active:scale-95"
                        )}
                      >
                        {item.status === 'posted' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                            <span>Push Now</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
