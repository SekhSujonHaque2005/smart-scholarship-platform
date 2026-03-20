'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, AlertCircle, Info, XCircle, Trash2, Check } from 'lucide-react';
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
  SUCCESS: { icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  ERROR: { icon: XCircle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  WARNING: { icon: AlertCircle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  INFO: { icon: Info, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
};

export const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent markAsRead trigger
    try {
      await api.delete(`notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      // Re-fetch count, or just dec if unread
      const removed = notifications.find(n => n.id === id);
      if (removed && !removed.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification');
    }
  };

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
            Notifications
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-4 text-muted-foreground font-mono text-[11px] uppercase tracking-widest"
          >
            <span>Stay informed</span>
            <div className="h-px w-8 bg-border/40" />
            <span className="text-blue-500 font-black">
              {unreadCount > 0 ? `${unreadCount} New Alerts` : 'All caught up'}
            </span>
          </motion.div>
        </div>
        
        {unreadCount > 0 && (
          <Button 
            onClick={markAllAsRead}
            className="h-14 px-8 bg-foreground text-background font-mono font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl"
          >
            <Check size={16} />
            Mark All As Read
          </Button>
        )}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[48px] border border-dashed border-border/60 bg-white/[0.01] p-12 shadow-2xl relative overflow-hidden min-h-[500px]"
      >
        {loading ? (
          <div className="space-y-8 relative z-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-white/5 border border-dashed border-border/40 rounded-[32px] animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 relative z-10 opacity-60 space-y-8">
            <div className="w-24 h-24 rounded-[32px] bg-white/[0.02] border border-dashed border-blue-500/30 flex items-center justify-center shadow-inner">
               <Bell size={40} className="text-blue-500 animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">Queue Empty</h3>
              <p className="text-muted-foreground font-mono font-black uppercase tracking-widest text-[10px]">No pending alerts in current node</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 relative z-10">
            <AnimatePresence mode="popLayout">
              {notifications.map((notif, i) => {
                const config = typeConfig[notif.type] || typeConfig.INFO;
                return (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98, height: 0, marginBottom: 0 }}
                    onClick={() => !notif.isRead && markAsRead(notif.id)}
                    className={cn(
                      "group relative p-8 rounded-[32px] border border-dashed backdrop-blur-md transition-all duration-500 flex flex-col sm:flex-row gap-8 items-start sm:items-center",
                      notif.isRead
                        ? 'bg-white/[0.01] border-border/40 opacity-70 grayscale'
                        : 'bg-white/[0.03] border-blue-500/30 shadow-2xl cursor-pointer hover:border-blue-500/60'
                    )}
                  >
                    {!notif.isRead && (
                      <div className="absolute right-8 top-8 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)] animate-pulse" />
                    )}
                    
                    <div className={cn(
                      "w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0 border border-dashed transition-all duration-500",
                      config.bg, config.color, config.border,
                      "group-hover:scale-110"
                    )}>
                      <config.icon size={28} strokeWidth={1} />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-4">
                        <h3 className={cn(
                          "font-black tracking-tight text-xl uppercase font-sans",
                          notif.isRead ? 'text-muted-foreground' : 'text-foreground group-hover:text-blue-500 transition-colors'
                        )}>
                          {notif.title}
                        </h3>
                      </div>
                      <p className={cn(
                        "text-sm tracking-tight leading-relaxed max-w-2xl font-mono",
                        notif.isRead ? 'text-muted-foreground/60' : 'text-muted-foreground'
                      )}>
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-4 pt-2">
                        <p className="text-[10px] font-mono font-black uppercase tracking-widest text-muted-foreground/40">
                          {new Date(notif.createdAt).toLocaleString(undefined, {
                            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                          })}
                        </p>
                        <div className="h-px w-8 bg-border/20" />
                        <span className="text-[9px] font-mono uppercase text-muted-foreground/30">Entry {notif.id.slice(0, 8)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => deleteNotification(notif.id, e)}
                        className="h-10 w-10 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
};
