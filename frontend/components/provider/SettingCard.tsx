'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
  status?: 'ACTIVE' | 'DISABLED' | 'PENDING' | 'SECURE';
  value?: string | boolean;
  type?: 'TOGGLE' | 'ACTION' | 'DATA';
  children?: React.ReactNode;
}

export const SettingCard = ({ 
  icon: Icon, 
  title, 
  description, 
  onClick, 
  status, 
  value, 
  type = 'ACTION',
  children 
}: SettingCardProps) => {
  return (
    <motion.div 
      whileHover={{ scale: 0.995 }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className={cn(
        "group relative bg-card border border-border rounded-[32px] p-6 transition-all duration-300",
        onClick ? "cursor-pointer hover:border-indigo-500/30 hover:bg-accent/30 shadow-sm hover:shadow-indigo-500/5" : ""
      )}
    >
      <div className="flex items-start gap-6">
        <div className="w-12 h-12 rounded-2xl bg-accent border border-border flex items-center justify-center text-muted-foreground group-hover:text-indigo-500 transition-colors shrink-0">
          <Icon size={20} />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-black text-foreground uppercase tracking-tight">{title}</h3>
            {status && (
              <div className={cn(
                "px-2 py-0.5 rounded-full border text-[8px] font-mono uppercase tracking-[0.2em] font-black",
                status === 'ACTIVE' || status === 'SECURE' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                status === 'PENDING' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                "bg-zinc-500/10 border-zinc-500/20 text-zinc-400"
              )}>
                {status}
              </div>
            )}
          </div>
          <p className="text-[10px] font-mono text-muted-foreground uppercase leading-relaxed tracking-wider font-bold opacity-70 group-hover:opacity-100 transition-opacity">
            {description}
          </p>

          <div className="pt-4 flex items-center justify-between">
            <div className="flex-1">
              {children}
            </div>
            
            {type === 'ACTION' && onClick && (
              <div className="flex items-center gap-2 text-[10px] font-mono text-indigo-500 uppercase tracking-widest font-black">
                Execute Protocol <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            )}

            {type === 'TOGGLE' && (
              <div className={cn(
                "w-12 h-6 rounded-full border transition-all duration-300 relative p-1 cursor-pointer",
                value ? "bg-indigo-500 border-indigo-500" : "bg-accent border-border"
              )}>
                <motion.div 
                  animate={{ x: value ? 24 : 0 }}
                  className="w-4 h-4 rounded-full bg-white shadow-sm"
                />
              </div>
            )}

            {type === 'DATA' && value && (
              <span className="text-[11px] font-mono text-foreground font-black uppercase tracking-tighter">
                {value.toString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-10 transition-opacity">
        <Icon size={80} />
      </div>
    </motion.div>
  );
};
