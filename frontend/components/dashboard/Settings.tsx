'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Bell, Eye, EyeOff, Lock, Globe, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/app/lib/api';
import { useAuthStore } from '@/app/store/auth.store';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

type PasswordForm = z.infer<typeof passwordSchema>;

export const Settings = () => {
  const { user } = useAuthStore();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [toggling2FA, setToggling2FA] = useState(false);

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingCommunications: false,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema)
  });

  useEffect(() => {
    // Fetch initial preferences
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('auth/me');
        if (data.preferences) {
          setPreferences({
             emailNotifications: data.preferences.emailNotifications ?? true,
             pushNotifications: data.preferences.pushNotifications ?? false,
             marketingCommunications: data.preferences.marketingCommunications ?? false,
          });
        }
        if (data.is2FAEnabled !== undefined) {
          setIs2FAEnabled(data.is2FAEnabled);
        }
      } catch (error) {
        console.error('Failed to fetch settings', error);
      }
    };
    fetchSettings();
  }, [user]);

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      setSavingPassword(true);
      setPasswordError('');
      await api.put('auth/me/password', data);
      
      setPasswordSaved(true);
      reset(); // clear form
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (error: any) {
      setPasswordError(error.response?.data?.message || 'Failed to update password');
      console.error('Failed to update password', error);
    } finally {
      setSavingPassword(false);
    }
  };

  const togglePreference = async (key: keyof typeof preferences) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);
    try {
      await api.put('auth/me/preferences', newPrefs);
    } catch (error) {
      console.error('Failed to update preferences', error);
      // Revert on failure
      setPreferences(preferences);
    }
  };

  const onToggle2FA = async () => {
    try {
      setToggling2FA(true);
      const newState = !is2FAEnabled;
      await api.put('auth/me/2fa', { enable: newState });
      setIs2FAEnabled(newState);
    } catch (error) {
      console.error('Failed to update 2FA settings', error);
    } finally {
      setToggling2FA(false);
    }
  };

  // Preference details array for iteration
  const preferenceItems = [
    { key: 'emailNotifications', label: 'Email Notifications', info: 'Application status and match updates' },
    { key: 'pushNotifications', label: 'Push Notifications', info: 'Browser-based instant alerts' },
    { key: 'marketingCommunications', label: 'Marketing Communications', info: 'New scholarships and news' },
  ] as const;

  return (
    <div className="space-y-16 py-8">
      {/* Vercel-Style Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-20">
        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-sans font-black tracking-tighter text-foreground leading-[0.9]"
          >
            Settings
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-4 text-muted-foreground font-mono text-[11px] uppercase tracking-widest"
          >
            <span>Account Controls</span>
            <div className="h-px w-8 bg-border/40" />
            <span className="text-blue-500 font-black">Privacy & Security</span>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Security Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[48px] border border-dashed border-border/60 bg-white/[0.01] p-12 shadow-2xl space-y-10 h-fit"
        >
          <div className="flex items-center gap-6 mb-4">
            <div className="w-14 h-14 rounded-[20px] bg-blue-500/10 border border-dashed border-blue-500/30 text-blue-500 flex items-center justify-center">
              <Shield size={28} />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-foreground uppercase tracking-widest leading-none">Security</h2>
              <p className="text-muted-foreground text-[10px] font-mono font-black uppercase tracking-widest">Update your password</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-10">
            <div className="space-y-3">
              <label className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest ml-1">Current Password</label>
              <div className="relative group/field">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within/field:text-blue-500 transition-colors" size={18} />
                <Input 
                  {...register('currentPassword')}
                  type={showCurrentPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  className="h-14 pl-14 pr-14 bg-white/[0.03] border-dashed border-border/60 rounded-xl text-foreground focus:border-blue-500/40 transition-all font-mono text-sm" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.currentPassword && <p className="text-rose-500 text-[9px] font-mono mt-2 ml-1 uppercase tracking-widest">{errors.currentPassword.message}</p>}
            </div>

            <div className="space-y-3">
              <label className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest ml-1">New Password</label>
              <div className="relative group/field">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within/field:text-blue-500 transition-colors" size={18} />
                <Input 
                  {...register('newPassword')}
                  type={showNewPassword ? 'text' : 'password'} 
                  placeholder="MIN 8 CHARS" 
                  className="h-14 pl-14 pr-14 bg-white/[0.03] border-dashed border-border/60 rounded-xl text-foreground focus:border-blue-500/40 transition-all font-mono text-sm uppercase" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.newPassword && <p className="text-rose-500 text-[9px] font-mono mt-2 ml-1 uppercase tracking-widest">{errors.newPassword.message}</p>}
              {passwordError && <p className="text-rose-500 text-[9px] font-mono mt-2 ml-1 uppercase tracking-widest">{passwordError}</p>}
            </div>

            <div className="pt-4 space-y-4">
               {passwordSaved && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 justify-center py-4 rounded-xl bg-emerald-500/5 border border-dashed border-emerald-500/20"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-mono font-black text-emerald-500 uppercase tracking-[0.2em]">Password Updated Successfully</span>
                  </motion.div>
               )}
              <Button 
                type="submit"
                disabled={savingPassword}
                className="w-full h-16 bg-foreground text-background font-mono font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {savingPassword ? 'SAVING...' : 'CHANGE PASSWORD →'}
              </Button>
            </div>
          </form>

          {/* 2FA Toggle */}
          <div className="pt-10 border-t border-dashed border-border/60">
            <div 
              onClick={!toggling2FA ? onToggle2FA : undefined}
              className={cn(
                "flex items-center justify-between p-6 rounded-[32px] bg-white/[0.02] border border-dashed border-border/60 group hover:border-blue-500/40 transition-all cursor-pointer",
                toggling2FA && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-6">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                  is2FAEnabled ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30" : "bg-white/5 text-muted-foreground border border-border/40"
                )}>
                  <Shield size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-foreground font-black text-sm uppercase tracking-tight font-mono">Two-Factor Auth</h4>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-mono font-black">Secure your login</p>
                </div>
              </div>
              <div className={cn(
                "w-14 h-7 rounded-full relative transition-all duration-500 border",
                is2FAEnabled ? "bg-emerald-500 border-emerald-600" : "bg-white/10 border-border/40"
              )}>
                <div className={cn(
                  "absolute top-1 w-[18px] h-[18px] rounded-full transition-all duration-500",
                  is2FAEnabled ? "left-[32px] bg-background" : "left-1 bg-muted-foreground"
                )} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Preferences Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-[48px] border border-dashed border-border/60 bg-white/[0.01] p-12 shadow-2xl space-y-10 h-fit"
        >
          <div className="flex items-center gap-6 mb-4">
            <div className="w-14 h-14 rounded-[20px] bg-emerald-500/10 border border-dashed border-emerald-500/30 text-emerald-500 flex items-center justify-center">
              <Bell size={28} />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-foreground uppercase tracking-widest leading-none">Preferences</h2>
              <p className="text-muted-foreground text-[10px] font-mono font-black uppercase tracking-widest">Notifications and privacy</p>
            </div>
          </div>

          <div className="space-y-6">
            {preferenceItems.map((pref) => {
              const status = preferences[pref.key];
              return (
                <div 
                  key={pref.key} 
                  onClick={() => togglePreference(pref.key)}
                  className="flex items-center justify-between p-7 rounded-[32px] bg-white/[0.02] border border-dashed border-border/60 group hover:border-blue-500/40 transition-all cursor-pointer"
                >
                  <div className="space-y-1">
                    <h4 className="text-foreground font-black text-sm uppercase tracking-tight font-mono">{pref.label}</h4>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-mono font-black">{pref.info}</p>
                  </div>
                  <div className={cn(
                    "w-14 h-7 rounded-full relative transition-all duration-500 border",
                    status ? "bg-blue-500 border-blue-600" : "bg-white/10 border-border/40"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-[18px] h-[18px] rounded-full transition-all duration-500",
                      status ? "left-[32px] bg-background" : "left-1 bg-muted-foreground"
                    )} />
                  </div>
                </div>
              )
            })}

            <div className="pt-10 flex items-center justify-between px-4 border-t border-dashed border-border/60 mt-10">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest flex items-center gap-3 text-muted-foreground">
                <Globe size={16} className="text-blue-500" /> System Language
              </span>
              <span className="text-foreground font-mono font-black uppercase tracking-widest text-[10px] bg-white/5 px-3 py-1 rounded-sm border border-dashed border-border/40">English (US)</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
