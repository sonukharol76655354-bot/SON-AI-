'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Save, Plus, Trash2, Eye, Sparkles, Terminal } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, where } from 'firebase/firestore';
import { generateContentFromMaster } from '@/lib/automation';
import { motion } from 'motion/react';

export function MasterPrompt() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewContent, setPreviewContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    brandName: 'SONAI',
    masterPrompt: '', // Combined knowledge and directions
    isActive: true
  });

  const fetchPrompts = useCallback(async () => {
    const q = collection(db, 'masterPrompts');
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPrompts(data);
    return data;
  }, []);

  useEffect(() => {
    const init = async () => {
      const data = await fetchPrompts();
      if (data.length > 0 && !selectedPrompt) {
        setSelectedPrompt(data[0]);
        setFormData(data[0] as any);
      }
    };
    init();
  }, [fetchPrompts, selectedPrompt]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (selectedPrompt?.id) {
        await updateDoc(doc(db, 'masterPrompts', selectedPrompt.id), formData);
      } else {
        const docRef = await addDoc(collection(db, 'masterPrompts'), formData);
        setSelectedPrompt({ id: docRef.id, ...formData });
      }
      await fetchPrompts();
      alert('Master Configuration Saved.');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">SONAI Intelligence</h1>
          <p className="text-ink-muted font-medium mt-1">Set one Master Prompt to anchor your entire automation engine.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handlePreview}
            disabled={loading}
            className="btn-secondary flex items-center gap-2 group border-indigo-500/20 hover:border-indigo-500/50"
          >
            <Sparkles className="w-4 h-4 group-hover:text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Output Test</span>
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">{loading ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-10">
        <div className="space-y-8">
          <div className="admin-card space-y-8 bg-slate-900/60 shadow-2xl">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-400">Master Prompt System</label>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${formData.isActive ? 'bg-green-500 animate-pulse' : 'bg-white/10'}`} />
                  <span className="text-[10px] font-bold uppercase text-ink-muted/60">{formData.isActive ? 'Active Engine' : 'Engine Idle'}</span>
                </div>
              </div>
              
              <textarea 
                value={formData.masterPrompt}
                onChange={e => setFormData({...formData, masterPrompt: e.target.value})}
                placeholder="Enter your comprehensive brand guidelines, niche depth, audience insights, and style preferences here... This is the only input the system needs." 
                className="w-full h-80 text-sm leading-relaxed scrollbar-hide"
              />
              
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
            </div>

            <div className="pt-4 flex items-center gap-6">
              <button 
                onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                className="flex items-center gap-3 group"
              >
                <div className={`w-12 h-6 rounded-full transition-all relative flex items-center px-1 ${formData.isActive ? 'bg-indigo-500' : 'bg-slate-800 border border-white/5'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-all ${formData.isActive ? 'ml-6' : 'ml-0'}`} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                  {formData.isActive ? 'System Activated' : 'System Deactivated'}
                </span>
              </button>
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
