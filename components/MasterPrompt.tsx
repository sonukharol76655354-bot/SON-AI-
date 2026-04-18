'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Save, Plus, Trash2, Eye, Sparkles, Terminal, Zap } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';
import { generateContentFromMaster } from '@/lib/automation';
import { motion } from 'motion/react';

export function MasterPrompt() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewContent, setPreviewContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    brandName: 'SONAI',
    masterPrompt: '', 
    linkedPageId: '', // Linking logic
    isActive: true
  });

  useEffect(() => {
    const unsubPrompts = onSnapshot(collection(db, 'masterPrompts'), (snapshot) => {
      setPrompts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubPages = onSnapshot(collection(db, 'facebookPages'), (snapshot) => {
      setPages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubPrompts();
      unsubPages();
    };
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (selectedPrompt?.id) {
        await updateDoc(doc(db, 'masterPrompts', selectedPrompt.id), formData);
      } else {
        const docRef = await addDoc(collection(db, 'masterPrompts'), formData);
        setSelectedPrompt({ id: docRef.id, ...formData });
      }
      alert('Node Intelligence Saved.');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const createNew = () => {
    setSelectedPrompt(null);
    setFormData({
      brandName: 'New Page Admin',
      masterPrompt: '',
      linkedPageId: '',
      isActive: true
    });
  };

  const selectNode = (prompt: any) => {
    setSelectedPrompt(prompt);
    setFormData(prompt);
  };

  const handlePreview = async () => {
    setLoading(true);
    try {
      // Create a full config object for the automation lib
      const fullConfig = {
        ...formData,
        brandName: 'SONAI',
        niche: 'Auto-detected',
        contentGoal: 'Maximum Engagement',
        tone: 'Professional Premium',
        language: 'English',
        postStyle: 'Elite'
      };
      const content = await generateContentFromMaster(fullConfig);
      setPreviewContent(content);
      setIsPreviewing(true);
    } catch (e) {
      console.error(e);
      alert('Preview failed. Check API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">Neural Node Manager</h1>
          <p className="text-ink-muted font-medium mt-1">Multi-Page Architecture: Connect separate prompts to separate target pages.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={createNew}
            className="btn-secondary flex items-center gap-2 group border-indigo-500/20 hover:border-indigo-500/50"
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">New Node</span>
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">{loading ? 'Saving...' : 'Deploy Intel'}</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <aside className="lg:col-span-1 space-y-4">
          <label className="text-[10px] font-bold uppercase tracking-widest text-ink-muted/40">Active Intelligence Nodes</label>
          <div className="space-y-2">
            {prompts.map(p => (
              <button
                key={p.id}
                onClick={() => selectNode(p)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
                  selectedPrompt?.id === p.id 
                    ? 'bg-white border-white text-black shadow-2xl shadow-white/10 scale-[1.02]' 
                    : 'bg-white/[0.03] border-white/5 text-white/50 hover:border-white/20 hover:text-white'
                }`}
              >
                <p className="text-[11px] font-black uppercase tracking-tight truncate">{p.brandName}</p>
                <div className={cn(
                  "flex items-center gap-1.5 mt-2",
                  selectedPrompt?.id === p.id ? "text-black/60" : "text-indigo-400"
                )}>
                  <Zap className="w-3 h-3 fill-current" />
                  <p className="text-[9px] font-bold uppercase tracking-widest truncate">
                    {p.linkedPageId ? 'Synced' : 'No Link'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <div className="lg:col-span-3 space-y-8">
          <div className="admin-card space-y-8 bg-slate-900/60 shadow-2xl">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Node Branding</label>
                <input 
                  value={formData.brandName}
                  onChange={e => setFormData({...formData, brandName: e.target.value})}
                  className="w-full bg-white/5 border-white/5 rounded-xl px-4 py-3 text-sm font-bold focus:border-indigo-500/40"
                  placeholder="e.g. Health Daily"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Target Page Link</label>
                <select 
                  value={formData.linkedPageId}
                  onChange={e => setFormData({...formData, linkedPageId: e.target.value})}
                  className="w-full bg-white/5 border-white/5 rounded-xl px-4 py-3 text-sm font-bold focus:border-indigo-500/40"
                >
                  <option value="">Select Target Page...</option>
                  {pages.map(page => (
                    <option key={page.pageId} value={page.pageId}>{page.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-400">Neural Master Prompt</label>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${formData.isActive ? 'bg-green-500 animate-pulse' : 'bg-white/10'}`} />
                  <span className="text-[10px] font-bold uppercase text-ink-muted/60">{formData.isActive ? 'Node Online' : 'Node Idle'}</span>
                </div>
              </div>
              
              <textarea 
                value={formData.masterPrompt}
                onChange={e => setFormData({...formData, masterPrompt: e.target.value})}
                placeholder="Enter guidelines for this specific page..."
                className="w-full h-80 text-sm leading-relaxed scrollbar-hide bg-black/20 border-white/5 rounded-2xl p-6"
              />
            </div>
            
            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                <Terminal className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Automated Context Sync</p>
                <p className="text-[10px] text-ink-muted/80 leading-relaxed">
                  Once saved, SONAI will use this prompt to automatically determine all titles, captions, image styles, 
                  and posting logic across the entire dashboard. No further manual filling is required.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full transition-all duration-500 ${formData.isActive ? 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]' : 'bg-white/10'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                    {formData.isActive ? 'Neural Engine Online' : 'Node Hibernating'}
                  </span>
                </div>
                <button 
                  onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                  className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${
                    formData.isActive 
                      ? 'bg-white text-black border-white' 
                      : 'bg-transparent text-white border-white/20 hover:border-white/50'
                  }`}
                >
                  {formData.isActive ? 'Stop Automation' : 'Start Automation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isPreviewing && previewContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-3xl p-8 shadow-2xl space-y-6"
          >
            <div className="flex justify-between items-center border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-accent" />
                <h3 className="text-xl font-bold">AI Generation Preview</h3>
              </div>
              <button 
                onClick={() => setIsPreviewing(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10"
              >
                &times;
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-accent">Title</label>
                <p className="text-lg font-bold">{previewContent.title}</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-accent">Caption</label>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{previewContent.caption}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-border">
                  <label className="text-xs font-bold uppercase opacity-50 block mb-2">Image Prompt</label>
                  <p className="text-xs text-ink-muted">{previewContent.image_prompt}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-border">
                  <label className="text-xs font-bold uppercase opacity-50 block mb-2">Video Prompt</label>
                  <p className="text-xs text-ink-muted">{previewContent.video_prompt}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {previewContent.hashtags?.map((tag: string) => (
                  <span key={tag} className="px-2 py-1 rounded-md bg-accent/10 border border-accent/20 text-accent text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button onClick={() => setIsPreviewing(false)} className="btn-secondary">Close</button>
              <button className="btn-primary">Apply Configuration</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
