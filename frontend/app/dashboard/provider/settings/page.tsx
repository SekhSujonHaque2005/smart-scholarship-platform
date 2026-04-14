'use client';

import React, { useState } from 'react';
import { ProviderLayout } from '@/components/provider/ProviderLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Bell, 
  Monitor, 
  Database, 
  Lock, 
  UserCircle, 
  Cpu, 
  Activity, 
  Wifi, 
  Trash2,
  ChevronRight,
  Fingerprint,
  Zap,
  Globe
} from 'lucide-react';
import { SettingCard } from '@/components/provider/SettingCard';
import { cn } from '@/lib/utils';

export default function ProviderSettingsPage() {
  const [notifs, setNotifs] = useState({
    applications: true,
    reviews: true,
    security: true,
    marketing: false
  });

  const [display, setDisplay] = useState({
    compactMode: false,
    aiAssist: true,
    realtimeSync: true
  });

  return (
    <ProviderLayout>
      <div className="w-full space-y-12 pb-32">
        {/* Settings Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
               <Cpu size={20} />
             </div>
             <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">
                Dashboard <span className="text-indigo-500">Settings</span>
             </h1>
          </div>
          <p className="text-[12px] font-mono text-muted-foreground uppercase tracking-[0.2em] font-black opacity-60">
            Manage your account security, notifications, and display preferences.
          </p>
          <div className="h-[1px] w-full bg-gradient-to-r from-indigo-500/30 via-transparent to-transparent" />
        </header>

        <div className="grid grid-cols-12 gap-10">
          {/* Main Controls Overlay */}
          <div className="col-span-12 lg:col-span-8 space-y-12">
            
            {/* --- SECURITY TERMINAL --- */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={16} className="text-indigo-500" />
                <h2 className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-foreground">Security & Access</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingCard 
                  icon={Lock}
                  title="Change Password"
                  description="Update your primary login credentials. Requires current password verification."
                  status="SECURE"
                  onClick={() => {}}
                />
                <SettingCard 
                  icon={Fingerprint}
                  title="Two-Factor Auth"
                  description="Add an extra layer of security to your account using an authenticator app."
                  status="ACTIVE"
                  type="TOGGLE"
                  value={true}
                />
              </div>
            </section>

            {/* --- NEURAL NOTIFICATIONS --- */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell size={16} className="text-indigo-500" />
                <h2 className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-foreground">Notification Preferences</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingCard 
                  icon={Zap}
                  title="New Applications"
                  description="Get notified immediately when a student applies to your scholarships."
                  type="TOGGLE"
                  value={notifs.applications}
                  onClick={() => setNotifs({...notifs, applications: !notifs.applications})}
                />
                <SettingCard 
                  icon={Activity}
                  title="Review Alerts"
                  description="Get notified when students leave feedback or rate your programs."
                  type="TOGGLE"
                  value={notifs.reviews}
                  onClick={() => setNotifs({...notifs, reviews: !notifs.reviews})}
                />
                <SettingCard 
                  icon={Wifi}
                  title="Weekly Summaries"
                  description="Email summaries of your scholarship performance and activities."
                  type="TOGGLE"
                  value={notifs.security}
                  onClick={() => setNotifs({...notifs, security: !notifs.security})}
                />
              </div>
            </section>

            {/* --- DISPLAY INTERFACE --- */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Monitor size={16} className="text-indigo-500" />
                <h2 className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-foreground">Display & Experience</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingCard 
                  icon={Monitor}
                  title="High-Density Mode"
                  description="Condense dashboard metrics for expert-level system monitoring."
                  type="TOGGLE"
                  value={display.compactMode}
                  onClick={() => setDisplay({...display, compactMode: !display.compactMode})}
                />
                <SettingCard 
                  icon={Cpu}
                  title="AI Oversight"
                  description="Enable autonomous auditing suggestions across the application terminal."
                  type="TOGGLE"
                  value={display.aiAssist}
                  onClick={() => setDisplay({...display, aiAssist: !display.aiAssist})}
                />
              </div>
            </section>
          </div>

          {/* Sidebar: System Info & Danger Zone */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="bg-card border border-border rounded-[48px] p-8 shadow-sm space-y-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Globe size={120} />
               </div>
               
               <div>
                  <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] font-black text-muted-foreground mb-6">System Health</h3>
                  <div className="space-y-4">
                    {[
                      { label: "Connection", value: "ONLINE", color: "text-emerald-500" },
                      { label: "Response Time", value: "14ms", color: "text-foreground" },
                      { label: "Server Location", value: "ASIA_SOUTH", color: "text-foreground" },
                      { label: "Encryption", value: "SECURE (AES-256)", color: "text-indigo-400" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border/50">
                        <span className="text-[9px] font-mono uppercase font-black text-muted-foreground">{item.label}</span>
                        <span className={cn("text-[10px] font-mono font-black uppercase", item.color)}>{item.value}</span>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="pt-4">
                  <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] font-black text-rose-500 mb-6 flex items-center gap-2">
                    <Trash2 size={12} /> Account Actions
                  </h3>
                  <button className="w-full flex items-center justify-between p-4 rounded-3xl bg-rose-500/5 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all group">
                    <div className="flex flex-col items-start transition-colors">
                      <span className="text-[10px] font-mono uppercase font-black">Close Account</span>
                      <span className="text-[8px] font-mono uppercase opacity-60">Permanently remove all data</span>
                    </div>
                    <ChevronRight size={14} />
                  </button>
               </div>
            </div>

            <div className="p-8 rounded-[48px] bg-gradient-to-br from-indigo-500 to-purple-600 text-white relative overflow-hidden group shadow-xl">
               <div className="relative z-10 space-y-4">
                  <Database size={32} />
                  <h3 className="text-xl font-black uppercase tracking-tight">Export My Data</h3>
                  <p className="text-[10px] font-mono uppercase tracking-widest font-black opacity-80 leading-relaxed">
                    Download a complete copy of your organization records, scholarships, and candidate history.
                  </p>
                  <button className="w-full py-3 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-colors">
                    DOWNLOAD DATA (CSV)
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
}

