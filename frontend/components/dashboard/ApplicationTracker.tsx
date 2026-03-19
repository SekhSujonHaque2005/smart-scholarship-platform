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
        const response = await api.get('/applications/my');
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
    <div className="space-y-12">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-20">
        <div className="space-y-1">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-5xl font-serif font-black tracking-tighter text-foreground drop-shadow-sm"
          >
            My Applications
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground font-medium tracking-wide flex items-center gap-2"
          >
            Track your progress <div className="w-1 h-1 rounded-full bg-border" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-blue-600 dark:text-blue-400/80">{applications.length} Active Submissions</span>
          </motion.div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-500 animate-pulse shadow-sm" />
             <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Live Status Tracking</span>
          </div>
        </div>
      </div>

      {/* Premium Filter Tabs */}
      <div className="flex gap-3 mb-8 flex-wrap relative z-20">
        {['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map((status) => {
          const isActive = filter === status;
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border flex items-center gap-2",
                isActive
                  ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                  : "bg-secondary/50 hover:bg-secondary border-border text-muted-foreground hover:text-foreground backdrop-blur-md"
              )}
            >
              {status === 'ALL' ? 'All Applications' : status.replace('_', ' ')}
              <span className={cn(
                "ml-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px]",
                isActive ? "bg-white/20" : "bg-muted"
              )}>
                {status === 'ALL'
                  ? applications.length
                  : applications.filter((a) => a.status === status).length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="group relative rounded-[40px] border border-border bg-card backdrop-blur-3xl shadow-2xl dark:shadow-none overflow-hidden min-h-[400px]">
        {/* Glow Flare */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full -mr-40 -mt-40 pointer-events-none" />
        
        <div className="p-10 border-b border-border/50 flex justify-between items-center relative z-10">
          <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
            Active Applications
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-500 animate-pulse" />
          </h2>
          <Badge variant="outline" className="px-4 py-1 rounded-full border-border bg-secondary/50 text-muted-foreground font-black text-[10px] uppercase tracking-widest shadow-sm">
            {applications.length} Total
          </Badge>
        </div>
        
        {filtered.length === 0 ? (
          <div className="p-20 text-center">
            <FileText className="mx-auto text-muted-foreground/30 mb-4" size={48} />
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">No applications found matching this criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filtered.map((app, index) => (
              <motion.div
                key={app.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-secondary/30 transition-colors group cursor-pointer relative overflow-hidden"
              >
                {/* Active flare */}
                {app.status === 'UNDER_REVIEW' && (
                  <div className="absolute inset-0 bg-blue-500/[0.02] animate-pulse pointer-events-none" />
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-start gap-5">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500 shadow-lg",
                      app.status === 'APPROVED' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-500/10' 
                        : 'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-blue-500/10'
                    )}>
                      <FileText size={28} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-foreground font-black text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
                        {app.scholarship?.title || 'Unknown Scholarship'}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                          Applied {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="text-muted-foreground/80 text-[13px] font-bold tracking-tight">{app.scholarship?.provider?.orgName || 'Provider'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-10">
                    <div className="hidden lg:block w-56">
                      <div className="flex justify-between text-[10px] mb-2 font-black uppercase tracking-[0.15em]">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-foreground">{getProgress(app.status || 'PENDING')}%</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${getProgress(app.status || 'PENDING')}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            app.status === 'APPROVED' 
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-500 dark:to-teal-400 shadow-sm' 
                              : 'bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-500 dark:to-cyan-400 shadow-sm'
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <Badge className={cn(
                        "px-5 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest border shadow-lg transition-all duration-300",
                        getStatusColor(app.status || 'PENDING')
                      )}>
                        <div className="flex items-center gap-2">
                          <StatusIcon status={app.status || 'PENDING'} />
                          {(app.status || 'PENDING').replace('_', ' ')}
                        </div>
                      </Badge>
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-blue-600/10 group-hover:text-blue-600 dark:group-hover:bg-blue-500/20 dark:group-hover:text-blue-400 transition-all border border-border">
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
  );
};
