'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, XCircle, FileText, ChevronRight, Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import api from '@/app/lib/api';

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'APPROVED': return <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={20} />;
    case 'REJECTED': return <XCircle className="text-rose-600 dark:text-rose-400" size={20} />;
    case 'UNDER_REVIEW': return <Clock className="text-amber-600 dark:text-amber-400" size={20} />;
    default: return <Clock className="text-blue-600 dark:text-blue-400" size={20} />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'APPROVED': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    case 'REJECTED': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    case 'UNDER_REVIEW': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    default: return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
  }
};

const getProgress = (status: string) => {
  switch (status) {
    case 'APPROVED': return 100;
    case 'REJECTED': return 100;
    case 'UNDER_REVIEW': return 65;
    default: return 30;
  }
};

export const ApplicationTracker = ({ onDataLoaded }: { onDataLoaded?: (apps: any[]) => void }) => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.get('applications/my');
        const apps = response.data.applications || [];
        setApplications(apps);
        onDataLoaded?.(apps);
      } catch (error) {
        console.error('Error fetching applications:', error);
        setApplications([]);
        onDataLoaded?.([]);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
        <Loader2 className="animate-spin text-blue-600 dark:text-blue-500" size={40} />
        <p className="font-bold uppercase tracking-widest text-[10px]">Tracking your applications...</p>
      </div>
    );
  }

  const filtered = filter === 'ALL'
    ? applications
    : applications.filter((a) => a.status === filter);

  return (
    <div className="space-y-16 py-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-20 px-4">
        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-sans font-black tracking-tighter text-foreground leading-[0.9]"
          >
            Applications
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-4 text-muted-foreground font-mono text-[11px] uppercase tracking-widest"
          >
            <span>My History</span>
            <div className="h-px w-8 bg-border/40" />
            <span className="text-blue-500 font-black">Track your progress</span>
          </motion.div>
        </div>
      </div>

      <div className="space-y-12">
        {/* Filter Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-4">
          <div className="flex flex-wrap gap-3">
            {['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={cn(
                  "px-6 py-3 rounded-2xl text-[10px] font-mono font-black uppercase tracking-[0.2em] transition-all border border-dashed",
                  filter === status 
                    ? "bg-foreground text-background border-foreground shadow-[0_0_20px_rgba(255,255,255,0.1)] scale-105" 
                    : "bg-white/[0.02] text-muted-foreground border-border/40 hover:bg-white/10"
                )}
              >
                {status === 'ALL' ? 'Everything' : status.replace('_', ' ')}
                <span className={cn(
                  "ml-3 px-1.5 py-0.5 rounded-md text-[8px]",
                  filter === status ? "bg-background/20 text-background" : "bg-white/5 text-muted-foreground"
                )}>
                  {status === 'ALL' ? applications.length : applications.filter(a => a.status === status).length}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 px-6 py-3 bg-white/[0.01] border border-dashed border-emerald-500/20 rounded-2xl">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-emerald-500">Live Sync Active</span>
          </div>
        </div>

        {/* Application List Container */}
        <div className="group relative rounded-[48px] border border-dashed border-border/60 bg-white/[0.01] shadow-2xl overflow-hidden min-h-[500px]">
          {/* Table Header */}
          <div className="p-10 border-b border-dashed border-border/60 flex justify-between items-center bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
              <h2 className="text-sm font-mono font-black uppercase tracking-[0.3em] text-foreground">
                Application Matrix
              </h2>
            </div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Sync Level: v2.4.0
            </div>
          </div>
          
          {filtered.length === 0 ? (
            <div className="p-32 text-center space-y-4">
              <div className="w-16 h-16 rounded-full border border-dashed border-border/40 flex items-center justify-center mx-auto opacity-20">
                <FileText size={32} className="text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-mono font-black uppercase tracking-widest text-[10px]">No nodes found in current branch</p>
            </div>
          ) : (
            <div className="divide-y divide-dashed divide-border/40">
              {filtered.map((app, index) => (
                <motion.div
                  key={app.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-8 hover:bg-white/[0.02] transition-all group/node cursor-pointer relative"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-start gap-8">
                      <div className={cn(
                        "w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0 border border-dashed transition-all duration-500",
                        app.status === 'APPROVED' 
                          ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-500' 
                          : 'bg-blue-500/5 border-blue-500/30 text-blue-500'
                      )}>
                        <FileText size={28} strokeWidth={1} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-foreground font-black text-2xl tracking-tighter group-hover/node:text-blue-500 transition-colors">
                          {app.scholarship?.title || 'Unknown Scholarship'}
                        </h3>
                        <div className="flex items-center gap-4 font-mono">
                          <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-sm">
                            {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}
                          </span>
                          <div className="h-4 w-px bg-border/40 mx-1" />
                          <span className="text-muted-foreground/60 text-[11px] uppercase tracking-widest">{app.scholarship?.provider?.orgName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-16">
                      <div className="hidden lg:block w-64 space-y-4">
                        <div className="flex justify-between font-mono text-[9px] font-black uppercase tracking-[0.2em]">
                          <span className="text-muted-foreground">Progression</span>
                          <span className="text-foreground">{getProgress(app.status || 'PENDING')}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden border border-dashed border-border/40">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${getProgress(app.status || 'PENDING')}%` }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                            className={cn(
                              "h-full rounded-full",
                              app.status === 'APPROVED' 
                                ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                                : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                            )}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-8 shrink-0">
                        <div className={cn(
                          "px-6 py-3 rounded-full font-mono font-black text-[10px] uppercase tracking-widest border border-dashed",
                          getStatusColor(app.status || 'PENDING')
                        )}>
                          {(app.status || 'PENDING').replace('_', ' ')}
                        </div>
                        <div className="w-12 h-12 rounded-full border border-dashed border-border/60 flex items-center justify-center group-hover/node:border-blue-500/40 group-hover/node:text-blue-500 transition-all">
                          <ChevronRight size={20} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
