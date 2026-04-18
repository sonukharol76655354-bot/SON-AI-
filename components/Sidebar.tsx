'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Terminal, 
  ImagePlus, 
  CalendarClock, 
  Facebook, 
  History, 
  Settings,
  LogOut,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import { useAuth } from './FirebaseProvider';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'master-prompt', label: 'Master Prompt', icon: Terminal },
  { id: 'content-studio', label: 'Content Studio', icon: ImagePlus },
  { id: 'scheduler', label: 'Scheduler', icon: CalendarClock },
  { id: 'facebook', label: 'Facebook Connect', icon: Facebook },
  { id: 'logs', label: 'Logs', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { user } = useAuth();

  return (
    <aside className="w-64 border-r border-white/5 h-screen flex flex-col bg-slate-900/50 backdrop-blur-md sticky top-0 transition-all duration-300">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Zap className="w-6 h-6 text-white fill-white/20" />
        </div>
        <div>
          <h2 className="text-xl font-black tracking-tight text-white uppercase">SONAI</h2>
          <p className="text-[10px] font-bold text-indigo-400 capitalize opacity-70">Automation Pro</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "sidebar-link w-full text-left group",
                activeTab === item.id && "active"
              )}
            >
              <item.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="pt-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted/40 px-4 mb-2">Systems</p>
          {menuItems.slice(4).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "sidebar-link w-full text-left group",
                activeTab === item.id && "active"
              )}
            >
              <item.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="p-6 border-t border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3 mb-2 px-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate text-white">SONAI Admin</p>
            <p className="text-[10px] text-indigo-400/50 font-medium">Enterprise Node</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
