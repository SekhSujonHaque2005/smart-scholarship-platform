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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-20">
        <div className="space-y-1">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight text-foreground"
          >
            Settings
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 text-sm text-muted-foreground"
          >
            <span>Account Controls</span>
            <div className="h-px w-8 bg-border" />
            <span className="text-blue-600 font-medium">Privacy & Security</span>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Security Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border bg-card p-8 shadow-sm space-y-8 h-fit"
        >
          <div className="flex items-center gap-5 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <Shield size={24} strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">Security</h2>
              <p className="text-sm text-muted-foreground">Update your password</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Current Password</label>
              <div className="relative group/field">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
                <Input 
                  {...register('currentPassword')}
                  type={showCurrentPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  className="pl-10 pr-10 bg-background" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.currentPassword && <p className="text-rose-500 text-xs mt-1">{errors.currentPassword.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">New Password</label>
              <div className="relative group/field">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
                <Input 
                  {...register('newPassword')}
                  type={showNewPassword ? 'text' : 'password'} 
                  placeholder="Min 8 characters" 
                  className="pl-10 pr-10 bg-background" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.newPassword && <p className="text-rose-500 text-xs mt-1">{errors.newPassword.message}</p>}
              {passwordError && <p className="text-rose-500 text-xs mt-1">{passwordError}</p>}
            </div>

            <div className="pt-2 space-y-4">
               {passwordSaved && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 justify-center py-3 rounded-lg bg-emerald-50 border border-emerald-100"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-semibold text-emerald-600">Password Updated Successfully</span>
                  </motion.div>
               )}
              <Button 
                type="submit"
                disabled={savingPassword}
                className="w-full"
              >
                {savingPassword ? 'Saving...' : 'Change Password'}
              </Button>
            </div>
          </form>

          {/* 2FA Toggle */}
          <div className="pt-6 border-t">
            <div 
              onClick={!toggling2FA ? onToggle2FA : undefined}
              className={cn(
                "flex items-center justify-between p-5 rounded-xl border bg-muted/20 group hover:border-blue-500/40 transition-all cursor-pointer",
                toggling2FA && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                  is2FAEnabled ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-muted text-muted-foreground border border-border"
                )}>
                  <Shield size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-foreground font-semibold text-sm">Two-Factor Auth</h4>
                  <p className="text-xs text-muted-foreground">Secure your login</p>
                </div>
              </div>
              <div className={cn(
                "w-12 h-6 rounded-full relative transition-all duration-300 border",
                is2FAEnabled ? "bg-emerald-500 border-emerald-600" : "bg-muted-foreground/30 border-transparent"
              )}>
                <div className={cn(
                  "absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 bg-white shadow-sm",
                  is2FAEnabled ? "left-[22px]" : "left-0.5"
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
          className="rounded-2xl border bg-card p-8 shadow-sm space-y-8 h-fit"
        >
          <div className="flex items-center gap-5 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <Bell size={24} strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">Preferences</h2>
              <p className="text-sm text-muted-foreground">Notifications and privacy</p>
            </div>
          </div>

          <div className="space-y-4">
            {preferenceItems.map((pref) => {
              const status = preferences[pref.key];
              return (
                <div 
                  key={pref.key} 
                  onClick={() => togglePreference(pref.key)}
                  className="flex items-center justify-between p-5 rounded-xl border bg-muted/20 group hover:border-blue-500/40 transition-all cursor-pointer"
                >
                  <div className="space-y-1">
                    <h4 className="text-foreground font-semibold text-sm">{pref.label}</h4>
                    <p className="text-xs text-muted-foreground">{pref.info}</p>
                  </div>
                  <div className={cn(
                    "w-12 h-6 rounded-full relative transition-all duration-300 border",
                    status ? "bg-blue-500 border-blue-600" : "bg-muted-foreground/30 border-transparent"
                  )}>
                    <div className={cn(
                      "absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 bg-white shadow-sm",
                      status ? "left-[22px]" : "left-0.5"
                    )} />
                  </div>
                </div>
              )
            })}

            <div className="pt-6 flex items-center justify-between border-t mt-6">
              <span className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Globe size={16} className="text-blue-500" /> System Language
              </span>
              <span className="text-foreground text-xs font-semibold bg-muted px-2 py-1 rounded-md border">English (US)</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
