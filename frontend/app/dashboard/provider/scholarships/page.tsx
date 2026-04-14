'use client';

import React, { useState, useEffect } from 'react';
import { ProviderLayout } from '@/components/provider/ProviderLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  ExternalLink, 
  Edit3, 
  Trash2,
  Users,
  Calendar,
  IndianRupee,
  Loader2,
  PackageSearch
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import api from '@/app/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const DeleteModal = ({ isOpen, onConfirm, onCancel, scholarshipTitle }: { isOpen: boolean, onConfirm: () => void, onCancel: () => void, scholarshipTitle?: string }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-[90%] max-w-sm bg-card border border-border rounded-[32px] p-8 shadow-2xl"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                <Trash2 size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Delete Program?</h3>
                <p className="text-sm text-muted-foreground font-mono leading-relaxed px-2">
                  Are you entirely sure you want to decommission <strong className="text-foreground">{scholarshipTitle}</strong>? This action is <span className="text-rose-500 font-bold">permanent</span> and cannot be undone.
                </p>
              </div>
              <div className="flex w-full gap-3 mt-6 pt-2">
                <button 
                  onClick={onCancel}
                  className="flex-1 px-4 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground font-black text-xs uppercase tracking-widest hover:bg-accent transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={onConfirm}
                  className="flex-1 px-4 py-3 rounded-xl bg-rose-500 text-white font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 dark:shadow-none"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const ScholarshipCard = ({ id, title, status, _count, amount, deadline, onDelete }: any) => {
  const router = useRouter();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-card border border-border rounded-[32px] p-6 hover:border-indigo-500/30 transition-all shadow-sm shadow-indigo-500/5 dark:shadow-none"
    >
      <div className="flex justify-between items-start mb-6">
        <div className={cn(
          "px-2 py-0.5 rounded-full border text-[9px] font-mono uppercase tracking-widest",
          status === 'ACTIVE' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
          status === 'DRAFT' ? "bg-zinc-500/10 border-zinc-500/20 text-zinc-400" :
          status === 'PENDING_REVIEW' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
          "bg-rose-500/10 border-rose-500/20 text-rose-400"
        )}>
          ● {status.replace('_', ' ')}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onDelete(id, title)}
            className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <h3 className="text-xl font-black text-foreground mb-2 group-hover:text-indigo-500 transition-colors leading-tight line-clamp-2 min-h-[56px]">
        {title}
      </h3>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-muted-foreground uppercase font-black opacity-80 dark:opacity-60">Applicants</span>
          <div className="flex items-center gap-2 text-foreground font-bold">
            <Users size={14} className="text-indigo-500" />
            <span className="text-sm font-bold">{_count?.applications || 0}</span>
          </div>
        </div>
        <div className="space-y-1 text-right">
          <span className="text-[10px] font-mono text-muted-foreground uppercase font-black opacity-80 dark:opacity-60">Total Budget</span>
          <div className="flex items-center gap-2 text-foreground font-bold justify-end">
            <IndianRupee size={14} className="text-emerald-500" />
            <span className="text-sm font-bold">₹{amount?.toLocaleString() || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground font-bold opacity-60">
          <Calendar size={12} />
          <span className="text-[10px] font-mono uppercase tracking-wider">
            {deadline ? new Date(deadline).toLocaleDateString() : 'NO DEADLINE'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link 
            href={`/dashboard/provider/scholarships/edit/${id}`}
            className="p-2 rounded-lg bg-accent/50 border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            <Edit3 size={14} />
          </Link>
          <Link 
            href={`/dashboard/provider/applications?programId=${id}`} 
            className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 hover:bg-indigo-600 hover:text-white transition-all"
          >
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default function ManagedScholarshipsPage() {
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deletingItem, setDeletingItem] = useState<{id: string, title: string} | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        setLoading(true);
        // Get provider profile first to get ID
        const profileRes = await api.get('providers/me/profile');
        const providerId = profileRes.data.id;

        // Fetch scholarships for this provider
        const res = await api.get('scholarships', { 
          params: { 
            providerId: providerId,
            status: filter === 'ALL' ? undefined : filter,
            search: debouncedSearch || undefined
          } 
        });
        setScholarships(res.data.scholarships);
      } catch (error) {
        console.error('Failed to fetch scholarships:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScholarships();
  }, [filter, debouncedSearch]);

  const handleExecuteDelete = async () => {
    if (!deletingItem) return;
    try {
      await api.delete(`scholarships/${deletingItem.id}`);
      setScholarships(prev => prev.filter(s => s.id !== deletingItem.id));
      toast.success('Program successfully decommissioned.');
    } catch (err: any) {
      console.error('Failed to delete protocol:', err);
      toast.error(err.response?.data?.message || 'Failed to decommission program. Please try again.');
    } finally {
      setDeletingItem(null);
    }
  };

  const handleOpenDeleteModal = (id: string, title: string) => {
    setDeletingItem({ id, title });
  };

  return (
    <ProviderLayout>
      <div className="space-y-8 pb-20">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase tracking-widest">Active Programs</span>
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tighter">
              My <span className="text-indigo-500">Scholarships</span>
            </h1>
            <p className="text-muted-foreground text-sm font-mono max-w-xl uppercase font-black tracking-tight opacity-70">
              Manage your published scholarship programs and funding status.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="SEARCH REGISTRY..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-accent/50 border border-border rounded-xl py-2.5 pl-10 pr-4 text-[11px] font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all w-64 uppercase font-bold"
              />
            </div>
            <Link href="/dashboard/provider/scholarships/create" className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-foreground text-background dark:bg-white dark:text-black font-black text-[11px] uppercase tracking-widest hover:opacity-90 transition-all">
              <Plus size={16} />
              Init New Program
            </Link>
          </div>
        </section>

        {/* Filters & Controls */}
        <section className="flex items-center justify-between p-2 rounded-2xl bg-accent border border-border mt-4 shadow-sm">
          <div className="flex items-center gap-1">
            {['ALL', 'ACTIVE', 'PENDING_REVIEW', 'DRAFT', 'CLOSED'].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-mono tracking-widest uppercase transition-all font-black",
                  filter === f ? "bg-foreground text-background dark:bg-white dark:text-black" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f === 'ALL' ? 'ALL PROGRAMS' : f}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors font-black">
            <Filter size={14} />
            <span className="text-[10px] font-mono uppercase tracking-widest">Advanced Filters</span>
          </button>
        </section>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode='popLayout'>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-[280px] bg-white/5 animate-pulse rounded-[32px]" />
              ))
            ) : scholarships.length > 0 ? (
              scholarships.map((s) => (
                <ScholarshipCard key={s.id} {...s} onDelete={handleOpenDeleteModal} />
              ))
            ) : null}

            {!loading && (
              <Link 
                href="/dashboard/provider/scholarships/create"
                className="group flex flex-col items-center justify-center p-8 rounded-[32px] border-2 border-dashed border-border hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-center space-y-4 min-h-[280px]"
              >
                <div className="w-16 h-16 rounded-full bg-accent border border-border flex items-center justify-center text-muted-foreground group-hover:text-indigo-600 group-hover:scale-110 transition-all duration-500 shadow-sm">
                  <Plus size={32} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-foreground uppercase tracking-widest">Deploy New Initiative</h4>
                  <p className="text-[10px] font-mono text-muted-foreground mt-1 uppercase tracking-tighter font-bold">Allocate capital for new scholars</p>
                </div>
              </Link>
            )}
          </AnimatePresence>
        </div>

        {!loading && scholarships.length === 0 && filter !== 'ALL' && (
          <div className="py-20 text-center space-y-4">
            <PackageSearch className="mx-auto text-muted-foreground/20" size={64} />
            <div className="space-y-1">
              <h3 className="text-lg font-black text-foreground uppercase tracking-tight">No Results Found</h3>
              <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest font-bold">Try adjusting your filters or registry search</p>
            </div>
          </div>
        )}
      </div>

      <DeleteModal 
        isOpen={!!deletingItem} 
        scholarshipTitle={deletingItem?.title} 
        onConfirm={handleExecuteDelete} 
        onCancel={() => setDeletingItem(null)} 
      />
    </ProviderLayout>
  );
}

