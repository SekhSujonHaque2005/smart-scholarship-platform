'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, XCircle, FileText, ChevronRight, Loader2, ShieldCheck, Star } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import api from '@/app/lib/api';
import { ReviewModal } from '../application/ReviewModal';

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'APPROVED': return <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={20} />;
    case 'REJECTED': return <XCircle className="text-rose-600 dark:text-rose-400" size={20} />;
    case 'UNDER_REVIEW': return <Clock className="text-amber-600 dark:text-amber-400" size={20} />;
    case 'SHORTLISTED': return <Clock className="text-indigo-600 dark:text-indigo-400" size={20} />;
    case 'INTERVIEWING': return <Clock className="text-purple-600 dark:text-purple-400" size={20} />;
    default: return <Clock className="text-blue-600 dark:text-blue-400" size={20} />;
  }
};

const STAGES = [
  { id: 'PENDING', label: 'Applied' },
  { id: 'UNDER_REVIEW', label: 'Review' },
  { id: 'SHORTLISTED', label: 'Shortlist' },
  { id: 'INTERVIEWING', label: 'Interview' },
  { id: 'APPROVED', label: 'Decision' }
];

const getStageIndex = (status: string) => {
  if (status === 'REJECTED') return 4;
  return STAGES.findIndex(s => s.id === status);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'APPROVED': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    case 'REJECTED': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    case 'UNDER_REVIEW': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    case 'SHORTLISTED': return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
    case 'INTERVIEWING': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
    default: return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
  }
};

const getProgress = (status: string) => {
  switch (status) {
    case 'APPROVED': return 100;
    case 'REJECTED': return 100;
    case 'INTERVIEWING': return 80;
    case 'SHORTLISTED': return 60;
    case 'UNDER_REVIEW': return 40;
    default: return 20;
  }
};

export const ApplicationTracker = ({ onDataLoaded }: { onDataLoaded?: (apps: any[]) => void }) => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<{id: string, name: string} | null>(null);

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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-2">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight text-foreground"
          >
            Applications
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 text-muted-foreground text-sm"
          >
            <span>My History</span>
            <div className="h-1 w-1 rounded-full bg-border" />
            <span className="text-blue-600 font-medium">Track your progress</span>
          </motion.div>
        </div>
      </div>

      <div className="space-y-12">
        {/* Filter Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
          <div className="flex flex-wrap gap-2">
            {['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                  filter === status 
                    ? "bg-foreground text-background border-foreground shadow-sm" 
                    : "bg-card text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground"
                )}
              >
                {status === 'ALL' ? 'Everything' : status.replace('_', ' ')}
                <span className={cn(
                  "ml-2 px-1.5 py-0.5 rounded-md text-xs",
                  filter === status ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
                )}>
                  {status === 'ALL' ? applications.length : applications.filter(a => a.status === status).length}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700">Live Sync</span>
          </div>
        </div>

        {/* Application List Container */}
        <div className="group relative rounded-2xl border border-border bg-card shadow-sm overflow-hidden min-h-[500px]">
          {/* Table Header */}
          <div className="px-8 py-5 border-b border-border flex justify-between items-center bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <h2 className="text-sm font-semibold text-foreground">
                Application Status
              </h2>
            </div>
          </div>
          
          {filtered.length === 0 ? (
            <div className="py-24 text-center space-y-4 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                <FileText size={32} className="text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground font-medium text-sm">No applications found.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((app, index) => (
                <motion.div
                  key={app.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 md:p-8 hover:bg-muted/30 transition-colors group/node cursor-pointer relative"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-6">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300",
                        app.status === 'APPROVED' 
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                          : 'bg-blue-50 border-blue-100 text-blue-600'
                      )}>
                        <FileText size={24} strokeWidth={1.5} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-foreground font-bold text-xl group-hover/node:text-blue-600 transition-colors">
                          {app.scholarship?.title || 'Unknown Scholarship'}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground font-medium text-sm">{app.scholarship?.provider?.orgName}</span>
                          <div className="h-4 w-px bg-border" />
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold">
                              <ShieldCheck size={12} /> {app.matchScore || 0}% Match
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 md:gap-12">
                      <div className="hidden lg:block w-64">
                         <div className="flex items-center justify-between gap-1 mb-2">
                            {STAGES.map((stage, sIdx) => {
                               const currentIdx = getStageIndex(app.status || 'PENDING');
                               const isActive = sIdx <= currentIdx;
                               return (
                                  <div key={stage.id} className="flex flex-col items-center gap-1">
                                     <div className={cn(
                                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors",
                                        isActive ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"
                                     )}>
                                        {isActive ? <CheckCircle2 size={12} /> : sIdx + 1}
                                     </div>
                                     <span className={cn(
                                        "text-[10px] font-semibold",
                                        isActive ? "text-foreground" : "text-muted-foreground"
                                     )}>{stage.label}</span>
                                  </div>
                               )
                            })}
                         </div>
                         <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${getProgress(app.status || 'PENDING')}%` }}
                              transition={{ duration: 1 }}
                              className={cn(
                                "h-full rounded-full",
                                app.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-blue-600'
                              )}
                            />
                         </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        {app.status === 'APPROVED' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProvider({
                                id: app.scholarship.providerId,
                                name: app.scholarship.provider?.orgName || 'Provider'
                              });
                              setIsReviewModalOpen(true);
                            }}
                            className="px-4 py-2 rounded-lg bg-amber-50 text-amber-600 text-sm font-semibold hover:bg-amber-100 transition-colors flex items-center gap-2"
                          >
                            <Star size={16} fill="currentColor" /> Rate Provider
                          </button>
                        )}
                        <div className={cn(
                          "px-4 py-2 rounded-lg font-semibold text-xs tracking-wide border",
                          getStatusColor(app.status || 'PENDING')
                        )}>
                          {(app.status || 'PENDING').replace('_', ' ')}
                        </div>
                        <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover/node:bg-muted group-hover/node:text-foreground text-muted-foreground transition-colors">
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

      {selectedProvider && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          providerId={selectedProvider.id}
          providerName={selectedProvider.name}
        />
      )}
    </div>
  );
};
