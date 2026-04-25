'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, Bell, LogOut, ChevronRight, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/app/store/auth.store';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

export const ProfileDropdown = ({ 
  onClose, 
  onTabChange,
  customName,
  customRole,
  customAvatar,
  isProvider = false
}: { 
  onClose: () => void, 
  onTabChange?: (tab: string) => void,
  customName?: string,
  customRole?: string,
  customAvatar?: string,
  isProvider?: boolean
}) => {
  const { user, logout } = useAuthStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleLogout = () => {
    logout();
    signOut({ callbackUrl: '/login' });
  };

  const menuItems = [
    { icon: User, label: 'My Profile', tab: 'profile', color: 'text-blue-500' },
    { icon: Bell, label: 'Notifications', tab: 'notifications', color: 'text-purple-500' },
    { icon: Settings, label: 'Account Settings', tab: 'settings', color: 'text-slate-500' },
  ];

  return (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="w-72 bg-card/95 backdrop-blur-xl border border-border rounded-[24px] shadow-2xl z-[9999] overflow-hidden"
    >
      {/* User Info Header */}
      <div className="p-6 bg-secondary/30 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg ring-2 ring-white/10 overflow-hidden">
            {customAvatar || user?.profilePicture ? (
              <img src={customAvatar || user?.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              (customName || user?.name || (isProvider ? 'P' : 'S'))?.[0]?.toUpperCase()
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="text-xs font-black text-foreground truncate uppercase tracking-tight">
              {customName || user?.name || (isProvider ? 'Provider' : 'Scholar')}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
               <ShieldCheck size={10} className="text-emerald-500" />
               <span className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.1em]">
                 {customRole || (isProvider ? 'Verified Provider' : 'Verified Student')}
               </span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-2">
        {menuItems.map((item) => (
          <div
            key={item.tab}
            onClick={() => {
              onTabChange?.(item.tab);
              onClose();
            }}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/60 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg bg-secondary/50 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-sm", item.color)}>
                <item.icon size={16} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/70 group-hover:text-foreground">
                {item.label}
              </span>
            </div>
            <ChevronRight size={12} className="text-muted-foreground/30 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
          </div>
        ))}
      </div>

      {/* Logout Footer */}
      <div className="p-2 border-t border-border bg-secondary/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-500/10 text-rose-500 transition-all group"
        >
          <div className="p-2 rounded-lg bg-rose-500/10 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-sm">
            <LogOut size={16} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
        </button>
      </div>
    </motion.div>
  );
};
