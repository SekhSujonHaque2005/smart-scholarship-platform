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
      className="group border-b border-border/50 hover:bg-accent/30 transition-colors cursor-pointer"
    >
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent border border-border flex items-center justify-center text-[10px] font-black text-muted-foreground group-hover:bg-indigo-500/10 group-hover:text-indigo-500 group-hover:border-indigo-500/20 transition-all">
            {student?.name?.[0] || 'S'}
          </div>
          <div>
            <div className="text-[12px] font-bold text-foreground mb-0.5">{student?.name || 'Unknown Student'}</div>
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-tighter font-bold opacity-60">{student?.email || 'N/A'}</div>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-tight truncate max-w-[200px] font-bold opacity-60">
          {scholarship?.title || 'N/A'}
        </div>
      </td>
      <td className="py-4 px-4">
        <div className={cn(
          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-mono uppercase tracking-widest",
          status === 'APPROVED' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
          status === 'REJECTED' ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
          "bg-amber-500/10 border-amber-500/20 text-amber-400"
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
            "text-[10px] font-mono font-bold",
            score > 80 ? "text-emerald-400" : score > 50 ? "text-amber-400" : "text-rose-400"
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
      <div className="space-y-10 pb-20">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-mono uppercase tracking-[0.2em] animate-pulse">
                System Awaiting Review: {pendingCount} New
              </span>
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase">
              Application <span className="text-indigo-500">Manager</span>
            </h1>
            <p className="text-muted-foreground text-sm font-mono max-w-xl uppercase font-black tracking-tight opacity-70">
              Review and manage your current scholarship candidates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="BY NAME, PROGRAM..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-accent/50 border border-border rounded-xl py-2.5 pl-10 pr-4 text-[11px] font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-indigo-500/50 transition-all w-64 uppercase font-bold"
              />
            </div>

            <div className="flex bg-accent/50 p-1 rounded-xl border border-border">
              <button 
                onClick={() => setViewMode('TABLE')}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-widest transition-all",
                  viewMode === 'TABLE' ? "bg-white text-black shadow-lg" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List size={14} /> List View
              </button>
              <button 
                onClick={() => setViewMode('KANBAN')}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-widest transition-all",
                  viewMode === 'KANBAN' ? "bg-white text-black shadow-lg" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid size={14} /> Kanban View
              </button>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-accent border border-border shadow-sm">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-mono tracking-widest uppercase transition-all whitespace-nowrap font-black",
                  filter === f ? "bg-foreground text-background dark:bg-white dark:text-black" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setShowProgramFilter(!showProgramFilter)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/50 border border-border text-[10px] font-mono hover:text-foreground transition-all font-black",
                  programFilter !== 'ALL' ? "text-indigo-500 border-indigo-500/30 bg-indigo-500/5" : "text-muted-foreground"
                )}
              >
                <Filter size={14} /> 
                {programFilter === 'ALL' ? 'FILTER BY PROGRAM' : programs.find(p => p.id === programFilter)?.title || 'PROTOCOLO FILTERED'}
                <ChevronDown size={12} className={cn("transition-transform", showProgramFilter && "rotate-180")} />
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
                      <div className="p-2 space-y-1">
                        <button 
                          onClick={() => { setProgramFilter('ALL'); setShowProgramFilter(false); }}
                          className="w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-mono uppercase tracking-widest font-black hover:bg-accent transition-colors"
                        >
                          All Programs
                        </button>
                        <div className="h-[1px] bg-border mx-2 my-1" />
                        {programs.map((p, idx) => (
                          <button 
                            key={p.id || `prog-${idx}`}
                            onClick={() => { setProgramFilter(p.id); setShowProgramFilter(false); }}
                            className={cn(
                              "w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-mono uppercase tracking-widest font-black hover:bg-accent transition-colors truncate",
                              programFilter === p.id ? "text-indigo-500 bg-indigo-500/5" : "text-muted-foreground"
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
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white border border-indigo-500/20 text-[10px] font-mono hover:bg-indigo-600 transition-all font-black disabled:opacity-50"
            >
              <Download size={14} /> EXPORT DATA
            </button>
          </div>
        </section>

        {/* View Content */}
        <div className="min-h-[400px]">
          {viewMode === 'TABLE' ? (
            <div className="bg-card border border-border rounded-[48px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-accent/30">
                      <th className="py-4 px-6 text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-bold">Candidate Info</th>
                      <th className="py-4 px-4 text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-bold">Scholarship Program</th>
                      <th className="py-4 px-4 text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-bold">Current Status</th>
                      <th className="py-4 px-4 text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-bold">Match Score</th>
                      <th className="py-4 px-4 text-right"></th>
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
                          <td colSpan={5} className="py-20 text-center">
                            <Inbox className="mx-auto text-muted-foreground/20 mb-4" size={64} />
                            <h3 className="text-sm font-black text-foreground uppercase tracking-widest">No Applications Detected</h3>
                            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-1 font-bold opacity-60">Try adjusting your filters or wait for submissions</p>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              
              {/* Pagination/Controls Footer */}
              <div className="p-6 bg-accent/30 border-t border-border flex items-center justify-between">
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-bold">
                  Showing <span className="text-foreground">{filteredApps.length}</span> entries
                </div>
                <div className="flex items-center gap-2">
                  <button disabled className="px-3 py-1 rounded-lg border border-border text-muted-foreground/40 cursor-not-allowed text-xs font-black">«</button>
                  <button className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-[0_10px_20px_rgba(99,102,241,0.3)]">1</button>
                  <button disabled className="px-3 py-1 rounded-lg border border-border text-muted-foreground/40 cursor-not-allowed text-xs font-black">»</button>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-gradient-to-br from-indigo-500/10 via-accent/30 to-transparent border border-border rounded-[48px] p-8 relative overflow-hidden group shadow-sm">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldAlert size={120} className="text-foreground" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 flex items-center justify-center animate-[spin_3s_linear_infinite]">
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 animate-[spin_2s_linear_infinite_reverse]">
                  <Cpu size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground tracking-tight mb-2 uppercase">AI Candidate Audit</h3>
                <p className="text-[11px] font-mono text-muted-foreground leading-relaxed uppercase tracking-wider max-w-lg mb-4 font-bold opacity-70">
                  Our system is currently checking academic credentials and identity documents to ensure application quality.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Identity Sync</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-50">
                    <div className="w-2 h-2 rounded-full bg-zinc-600" />
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Fraud Cache</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-[48px] p-8 flex flex-col justify-center text-center space-y-4 shadow-sm">
             <div className="text-muted-foreground text-[10px] font-mono uppercase tracking-[0.3em] font-black opacity-60">Total Processed</div>
             <div className="text-5xl font-black text-foreground tracking-tighter">
               {applications.filter(a => a.status !== 'PENDING').length}
               <span className="text-xs text-muted-foreground font-mono font-bold"> UNITS</span>
             </div>
             <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest leading-relaxed font-bold opacity-60">
               Historical throughput for your current organization profile.
             </p>
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
}

