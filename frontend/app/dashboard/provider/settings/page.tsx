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
  Cpu, 
  Activity, 
  Wifi, 
  Trash2,
  ChevronRight,
  Fingerprint,
  Zap,
  Globe,
  Eye,
  EyeOff,
  X,
  Loader2
} from 'lucide-react';
import { SettingCard } from '@/components/provider/SettingCard';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import api from '@/app/lib/api';

function ChangePasswordModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (form.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await api.put('auth/me/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password updated successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update password. Check your current password.');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, field, placeholder }: { label: string; field: 'current' | 'new' | 'confirm'; placeholder: string }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        <input
          type={show[field] ? 'text' : 'password'}
          value={form[field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword']}
          onChange={e => setForm(prev => ({ ...prev, [field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword']: e.target.value }))}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 rounded-lg bg-muted border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
          required
        />
        <button
          type="button"
          onClick={() => setShow(prev => ({ ...prev, [field]: !prev[field] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show[field] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border rounded-2xl shadow-xl z-[101] p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Lock size={18} />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Change Password</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Current Password" field="current" placeholder="Enter current password" />
              <Field label="New Password" field="new" placeholder="Min. 8 characters" />
              <Field label="Confirm New Password" field="confirm" placeholder="Re-enter new password" />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-lg border text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function ProviderSettingsPage() {
  const [showChangePassword, setShowChangePassword] = useState(false);
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
      <ChangePasswordModal isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />
      <div className="w-full space-y-12 pb-32">
        {/* Settings Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
               <Cpu size={20} />
             </div>
             <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Dashboard Settings
             </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your account security, notifications, and display preferences.
          </p>
          <div className="h-[1px] w-full bg-border" />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Controls Overlay */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* --- SECURITY & ACCESS --- */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={18} className="text-muted-foreground" />
                <h2 className="text-base font-semibold text-foreground">Security & Access</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingCard 
                  icon={Lock}
                  title="Change Password"
                  description="Update your primary login credentials. Requires current password verification."
                  status="SECURE"
                  onClick={() => setShowChangePassword(true)}
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

            {/* --- NOTIFICATIONS --- */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell size={18} className="text-muted-foreground" />
                <h2 className="text-base font-semibold text-foreground">Notification Preferences</h2>
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

            {/* --- DISPLAY SETTINGS --- */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Monitor size={18} className="text-muted-foreground" />
                <h2 className="text-base font-semibold text-foreground">Display & Experience</h2>
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

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card border rounded-2xl p-8 shadow-sm space-y-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Globe size={120} className="text-muted-foreground" />
               </div>
               
               <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4">System Health</h3>
                  <div className="space-y-4">
                    {[
                      { label: "Connection", value: "Online", color: "text-emerald-600" },
                      { label: "Response Time", value: "14ms", color: "text-foreground" },
                      { label: "Server Location", value: "Asia South", color: "text-foreground" },
                      { label: "Encryption", value: "Secure", color: "text-blue-600" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border/50">
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                        <span className={cn("text-sm font-medium", item.color)}>{item.value}</span>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="pt-4">
                  <h3 className="text-sm font-semibold text-rose-500 mb-4 flex items-center gap-2">
                    <Trash2 size={16} /> Account Actions
                  </h3>
                  <button className="w-full flex items-center justify-between p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 transition-all group dark:bg-rose-500/10 dark:border-rose-500/20">
                    <div className="flex flex-col items-start transition-colors">
                      <span className="text-sm font-medium">Close Account</span>
                      <span className="text-xs opacity-80">Permanently remove all data</span>
                    </div>
                    <ChevronRight size={16} />
                  </button>
               </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border shadow-sm relative overflow-hidden group">
               <div className="relative z-10 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 border flex items-center justify-center text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20">
                    <Database size={24} />
                  </div>
                  <h3 className="text-base font-semibold tracking-tight text-foreground">Export My Data</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Download a complete copy of your organization records, scholarships, and candidate history.
                  </p>
                  <button className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors mt-2">
                    Download CSV
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
}

