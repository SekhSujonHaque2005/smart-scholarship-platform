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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-20">
        <div className="space-y-1">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight text-foreground"
          >
            Notifications
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 text-sm text-muted-foreground"
          >
            <span>Stay informed</span>
            <div className="h-px w-8 bg-border" />
            <span className="text-blue-600 font-medium">
              {unreadCount > 0 ? `${unreadCount} New Alerts` : 'All caught up'}
            </span>
          </motion.div>
        </div>
        
        {unreadCount > 0 && (
          <Button 
            onClick={markAllAsRead}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Check size={16} />
            Mark All As Read
          </Button>
        )}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border bg-card p-8 shadow-sm relative overflow-hidden min-h-[500px]"
      >
        {loading ? (
          <div className="space-y-4 relative z-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 relative z-10 opacity-80 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-muted border flex items-center justify-center shadow-sm">
               <Bell size={32} className="text-muted-foreground/60" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-foreground">No Notifications</h3>
              <p className="text-sm text-muted-foreground">You're all caught up for now.</p>
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
                      "group relative p-5 rounded-xl border transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start sm:items-center",
                      notif.isRead
                        ? 'bg-card border-border shadow-sm opacity-70 grayscale'
                        : 'bg-card border-blue-500/30 shadow-md cursor-pointer hover:border-blue-500/60'
                    )}
                  >
                    {!notif.isRead && (
                      <div className="absolute right-5 top-5 w-2 h-2 rounded-full bg-blue-500" />
                    )}
                    
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-300",
                      config.bg, config.color, config.border,
                      "group-hover:scale-105"
                    )}>
                      <config.icon size={20} strokeWidth={2} />
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-4">
                        <h3 className={cn(
                          "font-bold text-base",
                          notif.isRead ? 'text-muted-foreground' : 'text-foreground group-hover:text-blue-600 transition-colors'
                        )}>
                          {notif.title}
                        </h3>
                      </div>
                      <p className={cn(
                        "text-sm max-w-2xl",
                        notif.isRead ? 'text-muted-foreground/60' : 'text-muted-foreground'
                      )}>
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-3 pt-1">
                        <p className="text-xs font-medium text-muted-foreground/60">
                          {new Date(notif.createdAt).toLocaleString(undefined, {
                            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                          })}
                        </p>
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
