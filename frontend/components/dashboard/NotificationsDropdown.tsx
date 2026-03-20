'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, AlertCircle, Info, XCircle, Trash2, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/app/lib/api';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  SUCCESS: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  ERROR: { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  WARNING: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  INFO: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
};

export const NotificationsDropdown = ({ onClose }: { onClose: () => void }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('notifications');
      setNotifications(data.notifications?.slice(0, 5) || []);
    } catch (error) {
      console.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read');
    }
  };

  return (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute top-12 right-0 w-80 md:w-96 bg-card/95 backdrop-blur-xl border border-border rounded-[24px] shadow-2xl z-50 overflow-hidden"
    >
      <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/30">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 flex items-center gap-2">
          <Bell size={12} className="text-blue-500" /> Notifications
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-[10px] uppercase font-black tracking-widest h-7 px-2 hover:bg-blue-500/10 hover:text-blue-500"
          onClick={() => { /* Logic to mark all as read if needed */ }}
        >
          View All
        </Button>
      </div>

      <div className="max-h-[400px] overflow-y-auto no-scrollbar py-2">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-secondary/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center space-y-2 opacity-50">
            <Bell size={32} className="mx-auto text-muted-foreground/30" />
            <p className="text-[10px] font-black uppercase tracking-widest">No new alerts</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {notifications.map((notif) => {
              const config = typeConfig[notif.type] || typeConfig.INFO;
              return (
                <div
                  key={notif.id}
                  onClick={() => !notif.isRead && markAsRead(notif.id)}
                  className={cn(
                    "p-4 flex gap-4 hover:bg-secondary/40 transition-colors cursor-pointer relative group",
                    !notif.isRead && "bg-blue-500/5"
                  )}
                >
                  {!notif.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                  )}
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border", config.bg, config.color, config.border)}>
                    <config.icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-xs font-black uppercase tracking-tight mb-0.5", !notif.isRead ? "text-foreground" : "text-muted-foreground")}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-bold">
                      {notif.message}
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mt-2">
                      {new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-3 bg-secondary/20 border-t border-border mt-auto">
        <Button 
          variant="ghost" 
          className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary flex items-center gap-2"
          onClick={() => { /* Navigation to full notifications page */ }}
        >
          Check all activity <ExternalLink size={12} />
        </Button>
      </div>
    </motion.div>
  );
};
