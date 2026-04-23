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
        "group relative bg-card border rounded-xl p-6 transition-all duration-300 h-full flex flex-col",
        onClick ? "cursor-pointer hover:bg-muted/50 hover:shadow-sm" : ""
      )}
    >
      <div className="flex items-start gap-4 flex-1">
        <div className="w-10 h-10 rounded-lg bg-muted border flex items-center justify-center text-muted-foreground group-hover:text-blue-600 transition-colors shrink-0">
          <Icon size={20} />
        </div>

        <div className="flex-1 min-w-0 flex flex-col h-full">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {status && (
              <div className={cn(
                "px-2 py-0.5 rounded-md text-xs font-medium",
                status === 'ACTIVE' || status === 'SECURE' ? "bg-emerald-500/10 text-emerald-600" :
                status === 'PENDING' ? "bg-amber-500/10 text-amber-600" :
                "bg-muted text-muted-foreground"
              )}>
                {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>

          <div className="pt-4 flex items-center justify-between">
            <div className="flex-1">
              {children}
            </div>
            
            {type === 'ACTION' && onClick && (
              <button
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Manage <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {type === 'TOGGLE' && (
              <div className={cn(
                "w-11 h-6 rounded-full transition-colors relative p-1 cursor-pointer border",
                value ? "bg-blue-600 border-blue-600" : "bg-muted border-border"
              )}>
                <motion.div 
                  animate={{ x: value ? 20 : 0 }}
                  className="w-4 h-4 rounded-full bg-white shadow-sm"
                />
              </div>
            )}

            {type === 'DATA' && value && (
              <span className="text-sm font-semibold text-foreground">
                {value.toString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
