'use client';

import React, { useState, useEffect } from 'react';
import { ProviderLayout } from '@/components/provider/ProviderLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText,
  User,
  GraduationCap,
  ArrowUpRight,
  ShieldAlert,
  Cpu,
  Loader2,
  Inbox,
  Download,
  Terminal,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/app/lib/api';
import { useSearchParams } from 'next/navigation';
import { KanbanBoard } from '@/components/provider/KanbanBoard';
import { LayoutGrid, List } from 'lucide-react';

const ApplicationTableRow = ({ id, student, scholarship, status, fraudFlag, submittedAt, onOpen }: any) => {
  const score = fraudFlag ? Math.round(100 - (fraudFlag.fraudScore * 100)) : 100; // Inverse of fraud score for compatibility
  
  return (
    <tr 
      onClick={() => onOpen(id)}
      className="group border-b hover:bg-muted/50 transition-colors cursor-pointer"
    >
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent border flex items-center justify-center text-sm font-semibold text-muted-foreground group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200 dark:group-hover:bg-blue-500/10 dark:group-hover:border-blue-500/20 transition-colors">
            {student?.name?.[0] || 'S'}
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">{student?.name || 'Unknown Student'}</div>
            <div className="text-xs text-muted-foreground">{student?.email || 'N/A'}</div>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="text-sm text-foreground truncate max-w-[200px]">
          {scholarship?.title || 'N/A'}
        </div>
      </td>
      <td className="py-4 px-4">
        <div className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium",
          status === 'APPROVED' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" :
          status === 'REJECTED' ? "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400" :
          "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
        )}>
          {status === 'APPROVED' ? <CheckCircle2 size={10} /> : status === 'REJECTED' ? <XCircle size={10} /> : <Clock size={10} />}
          {status}
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <div className="w-full bg-accent h-1 rounded-full overflow-hidden shrink-0 hidden sm:block w-12">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                score > 80 ? "bg-emerald-500" : score > 50 ? "bg-amber-500" : "bg-rose-500"
              )}
              style={{ width: `${score}%` }}
            />
          </div>
          <span className={cn(
            "text-sm font-medium",
            score > 80 ? "text-emerald-600 dark:text-emerald-400" : score > 50 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"
          )}>{score}%</span>
        </div>
      </td>
      <td className="py-4 px-4 text-right">
        <button className="text-muted-foreground group-hover:text-foreground transition-colors">
          <ChevronRight size={18} />
        </button>
      </td>
    </tr>
  );
};

export default function ApplicationReviewPage() {
  const searchParams = useSearchParams();
  const initialProgramId = searchParams.get('programId') || 'ALL';

  const [filter, setFilter] = useState('ALL');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState(initialProgramId);
  const [programs, setPrograms] = useState<any[]>([]);
  const [showProgramFilter, setShowProgramFilter] = useState(false);
  const [viewMode, setViewMode] = useState<'TABLE' | 'KANBAN'>('TABLE');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const res = await api.get('applications/provider/my');
        const apps = res.data.applications;
        setApplications(apps);
        
        // Extract unique programs
        const uniquePrograms = Array.from(new Set(apps.map((a: any) => JSON.stringify({
          id: a.scholarship?.id,
          title: a.scholarship?.title
        })))).map((s: any) => JSON.parse(s));
        setPrograms(uniquePrograms);
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [refreshKey]);

  const filteredApps = applications.filter(app => {
    const matchesStatus = filter === 'ALL' || app.status === filter;
    const matchesProgram = programFilter === 'ALL' || app.scholarship?.id === programFilter;
    const matchesSearch = search === '' || 
      app.student?.name?.toLowerCase().includes(search.toLowerCase()) || 
      app.scholarship?.title?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesProgram && matchesSearch;
  });

  const handleExport = () => {
    if (!filteredApps.length) return;
    const headers = ['ID', 'Candidate', 'Email', 'Program', 'Status', 'Score', 'Submitted At'];
    const rows = filteredApps.map(app => [
      app.id,
      app.student?.name,
      app.student?.email,
      app.scholarship?.title,
      app.status,
      app.fraudFlag ? Math.round(100 - (app.fraudFlag.fraudScore * 100)) : 100,
      new Date(app.submittedAt).toLocaleDateString()
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scholarhub-candidates-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const pendingCount = applications.filter(a => a.status === 'PENDING').length;

  return (
    <ProviderLayout>
      <div className="space-y-8 pb-20 max-w-7xl mx-auto pt-6">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 text-xs font-semibold">
                {pendingCount} Awaiting Review
              </span>
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Application Manager
            </h1>
            <p className="text-muted-foreground text-base max-w-xl">
              Review and manage your current scholarship candidates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                type="text" 
                placeholder="Search candidates..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-background border rounded-xl py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow w-64"
              />
            </div>

            <div className="flex bg-muted/50 p-1 rounded-xl border">
              <button 
                onClick={() => setViewMode('TABLE')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  viewMode === 'TABLE' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List size={16} /> List
              </button>
              <button 
                onClick={() => setViewMode('KANBAN')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  viewMode === 'KANBAN' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid size={16} /> Kanban
              </button>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-2xl bg-card border shadow-sm">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap capitalize",
                  filter === f ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"
                )}
              >
                {f.toLowerCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setShowProgramFilter(!showProgramFilter)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium hover:bg-muted transition-colors",
                  programFilter !== 'ALL' ? "text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-500/10 dark:border-blue-500/20" : "bg-background text-muted-foreground"
                )}
              >
                <Filter size={16} /> 
                {programFilter === 'ALL' ? 'Filter by Program' : programs.find(p => p.id === programFilter)?.title || 'Filtered'}
                <ChevronDown size={14} className={cn("transition-transform", showProgramFilter && "rotate-180")} />
              </button>
              
              <AnimatePresence>
                {showProgramFilter && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProgramFilter(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-1 space-y-0.5">
                        <button 
                          onClick={() => { setProgramFilter('ALL'); setShowProgramFilter(false); }}
                          className="w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors"
                        >
                          All Programs
                        </button>
                        <div className="h-[1px] bg-border mx-2 my-1" />
                        {programs.map((p, idx) => (
                          <button 
                            key={p.id || `prog-${idx}`}
                            onClick={() => { setProgramFilter(p.id); setShowProgramFilter(false); }}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors truncate",
                              programFilter === p.id ? "text-blue-600 bg-blue-50 dark:bg-blue-500/10" : "text-muted-foreground"
                            )}
                          >
                            {p.title}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="w-[1px] h-6 bg-border" />
            <button 
              onClick={handleExport}
              disabled={filteredApps.length === 0}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Download size={16} /> Export Data
            </button>
          </div>
        </section>

        {/* View Content */}
        <div className="min-h-[400px]">
          {viewMode === 'TABLE' ? (
            <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Candidate Info</th>
                      <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Scholarship Program</th>
                      <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Status</th>
                      <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Match Score</th>
                      <th className="py-3 px-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence mode='popLayout'>
                      {loading ? (
                        [...Array(5)].map((_, i) => (
                          <tr key={`skeleton-${i}`} className="border-b border-white/5">
                            <td colSpan={5} className="p-4">
                              <div className="h-10 bg-white/5 animate-pulse rounded-xl" />
                            </td>
                          </tr>
                        ))
                      ) : filteredApps.length > 0 ? (
                        filteredApps.map((app) => (
                          <ApplicationTableRow 
                            key={app.id} 
                            {...app} 
                            onOpen={(id: string) => window.location.href = `/dashboard/provider/applications/${id}`}
                          />
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-16 text-center">
                            <Inbox className="mx-auto text-muted-foreground/30 mb-3" size={48} />
                            <h3 className="text-sm font-semibold text-foreground">No Applications Found</h3>
                            <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or wait for submissions</p>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              
              {/* Pagination/Controls Footer */}
              <div className="p-4 bg-muted/10 border-t flex items-center justify-between">
                <div className="text-sm text-muted-foreground font-medium">
                  Showing <span className="text-foreground">{filteredApps.length}</span> entries
                </div>
                <div className="flex items-center gap-1">
                  <button disabled className="px-2 py-1 rounded border text-muted-foreground/40 cursor-not-allowed text-sm">Previous</button>
                  <button className="px-3 py-1 rounded bg-blue-600 text-white text-sm font-medium">1</button>
                  <button disabled className="px-2 py-1 rounded border text-muted-foreground/40 cursor-not-allowed text-sm">Next</button>
                </div>
              </div>
            </div>
          ) : (
            <KanbanBoard 
              initialApplications={filteredApps} 
              onStatusUpdate={() => {
                // Refresh data if needed, though Kanban handles it optimistically
                setRefreshKey((prev: number) => prev + 1);
              }} 
            />
          )}
        </div>

        {/* Intelligence Sidebar / Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-br from-blue-500/5 to-transparent border rounded-2xl p-6 relative overflow-hidden group shadow-sm flex flex-col md:flex-row items-center gap-6">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <ShieldAlert size={100} className="text-foreground" />
            </div>
            <div className="w-20 h-20 rounded-full border-4 border-blue-100 dark:border-blue-500/20 border-t-blue-500 flex items-center justify-center animate-spin shrink-0">
              <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 animate-[spin_2s_linear_infinite_reverse]">
                <Cpu size={20} />
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold tracking-tight mb-1">AI Candidate Audit</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg mb-4">
                Our system is currently checking academic credentials and identity documents to ensure application quality.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-500">Identity Sync</span>
                </div>
                <div className="flex items-center gap-2 opacity-60">
                  <div className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                  <span className="text-xs font-medium text-muted-foreground">Fraud Cache</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-6 flex flex-col justify-center text-center space-y-2 shadow-sm">
             <div className="text-sm font-semibold text-muted-foreground">Total Processed</div>
             <div className="text-4xl font-bold tracking-tight">
               {applications.filter(a => a.status !== 'PENDING').length}
             </div>
             <p className="text-sm text-muted-foreground">
               Historical throughput for your current organization profile.
             </p>
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
}

