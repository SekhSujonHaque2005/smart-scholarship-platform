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
        const { data } = await api.get('/auth/me');
        if (data.preferences) {
          setPreferences({
             emailNotifications: data.preferences.emailNotifications ?? true,
             pushNotifications: data.preferences.pushNotifications ?? false,
             marketingCommunications: data.preferences.marketingCommunications ?? false,
          });
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
      await api.put('/auth/me/password', data);
      
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
      await api.put('/auth/me/preferences', newPrefs);
    } catch (error) {
      console.error('Failed to update preferences', error);
      // Revert on failure
      setPreferences(preferences);
    }
  };

  // Preference details array for iteration
  const preferenceItems = [
    { key: 'emailNotifications', label: 'Email Notifications', info: 'Application status and match updates' },
    { key: 'pushNotifications', label: 'Push Notifications', info: 'Browser-based instant alerts' },
    { key: 'marketingCommunications', label: 'Marketing Communications', info: 'New scholarships and news' },
  ] as const;

  return (
    <div className="space-y-12">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-20">
        <div className="space-y-1">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-5xl font-serif font-black tracking-tighter text-foreground drop-shadow-sm"
          >
            Settings
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground font-medium tracking-wide flex items-center gap-2"
          >
            Power and privacy <div className="w-1 h-1 rounded-full bg-border" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-blue-600 dark:text-blue-400/80">Account secured via 2FA</span>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Security Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[40px] border border-border bg-card backdrop-blur-3xl p-10 shadow-2xl dark:shadow-none space-y-8 h-fit"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground uppercase tracking-wider">Security</h2>
              <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Update your security credentials</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-2">Current Password</label>
              <div className="relative group/field">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/field:text-blue-600 dark:group-focus-within/field:text-blue-400 transition-colors" size={18} />
                <Input 
                  {...register('currentPassword')}
                  type={showCurrentPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  className="h-14 pl-12 pr-12 bg-secondary/50 border-input rounded-2xl text-foreground focus:ring-blue-500/20 transition-all font-bold tracking-tight" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.currentPassword && <p className="text-rose-600 dark:text-rose-400 text-[10px] mt-1 ml-2 font-black uppercase tracking-widest">{errors.currentPassword.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-2">New Password</label>
              <div className="relative group/field">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/field:text-blue-600 dark:group-focus-within/field:text-blue-400 transition-colors" size={18} />
                <Input 
                  {...register('newPassword')}
                  type={showNewPassword ? 'text' : 'password'} 
                  placeholder="Minimum 8 characters" 
                  className="h-14 pl-12 pr-12 bg-secondary/50 border-input rounded-2xl text-foreground focus:ring-blue-500/20 transition-all font-bold tracking-tight" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.newPassword && <p className="text-rose-600 dark:text-rose-400 text-[10px] mt-1 ml-2 font-black uppercase tracking-widest">{errors.newPassword.message}</p>}
              {passwordError && <p className="text-rose-600 dark:text-rose-400 text-[10px] mt-1 ml-2 font-black uppercase tracking-widest">{passwordError}</p>}
            </div>

            <div className="pt-2 flex flex-col gap-3">
               {passwordSaved && (
                  <motion.span 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] font-black tracking-widest text-emerald-600 dark:text-emerald-400 uppercase flex items-center justify-center gap-2 mb-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
                    Password Updated
                  </motion.span>
               )}
              <Button 
                type="submit"
                disabled={savingPassword}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl transition-all shadow-lg shadow-blue-500/20 border border-blue-500/20"
              >
                {savingPassword ? 'Updating...' : 'Change Secret Key'}
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Preferences Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[40px] border border-border bg-card backdrop-blur-3xl p-10 shadow-2xl dark:shadow-none space-y-8 h-fit"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Bell size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground uppercase tracking-wider">Preferences</h2>
              <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Communication and display settings</p>
            </div>
          </div>

          <div className="space-y-4">
            {preferenceItems.map((pref) => {
              const status = preferences[pref.key];
              return (
                <div 
                  key={pref.key} 
                  onClick={() => togglePreference(pref.key)}
                  className="flex items-center justify-between p-5 rounded-[24px] bg-secondary/30 border border-border group hover:bg-secondary/50 transition-all cursor-pointer"
                >
                  <div>
                    <h4 className="text-foreground font-black text-sm tracking-tight">{pref.label}</h4>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mt-0.5">{pref.info}</p>
                  </div>
                  <div className={cn(
                    "w-12 h-6 rounded-full relative transition-colors shadow-inner",
                    status ? "bg-blue-600" : "bg-muted"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all",
                      status ? "right-1" : "left-1"
                    )} />
                  </div>
                </div>
              )
            })}

            <div className="pt-4 flex items-center justify-between px-2">
              <span className="text-muted-foreground text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Globe size={16} className="text-blue-600 dark:text-blue-400" /> Language
              </span>
              <span className="text-foreground font-black uppercase tracking-widest text-[10px]">English (US)</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
