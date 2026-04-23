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
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-[90%] max-w-sm bg-card border rounded-2xl p-8 shadow-2xl"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                <Trash2 size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">Delete Program?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed px-2">
                  Are you entirely sure you want to delete <strong className="text-foreground">{scholarshipTitle}</strong>? This action cannot be undone.
                </p>
              </div>
              <div className="flex w-full gap-3 mt-6 pt-2">
                <button 
                  onClick={onCancel}
                  className="flex-1 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-muted font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={onConfirm}
                  className="flex-1 px-4 py-2 rounded-lg bg-rose-500 text-white font-medium text-sm hover:bg-rose-600 transition-colors"
                >
                  Delete
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
      className="break-inside-avoid mb-6 group bg-card border rounded-2xl p-6 hover:shadow-md transition-all shadow-sm"
    >
      <div className="flex justify-between items-start mb-6">
        <div className={cn(
          "px-2.5 py-0.5 rounded-full text-xs font-semibold",
          status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-500" :
          status === 'DRAFT' ? "bg-zinc-500/10 text-zinc-500" :
          status === 'PENDING_REVIEW' ? "bg-amber-500/10 text-amber-500" :
          "bg-rose-500/10 text-rose-500"
        )}>
          {status.replace('_', ' ')}
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

      <h3 className="text-xl font-bold text-foreground mb-2 leading-tight line-clamp-2 min-h-[56px]">
        {title}
      </h3>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Applicants</span>
          <div className="flex items-center gap-2 text-foreground font-bold">
            <Users size={14} className="text-indigo-500" />
            <span className="text-sm font-bold">{_count?.applications || 0}</span>
          </div>
        </div>
        <div className="space-y-1 text-right">
          <span className="text-xs font-medium text-muted-foreground">Total Budget</span>
          <div className="flex items-center gap-2 text-foreground font-bold justify-end">
            <span className="text-sm font-semibold">₹{amount?.toLocaleString() || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar size={14} />
          <span className="text-sm">
            {deadline ? new Date(deadline).toLocaleDateString() : 'No Deadline'}
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
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold">Active Programs</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              My Scholarships
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Manage your published scholarship programs and funding status.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search programs..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-card border rounded-lg py-2 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-64"
              />
            </div>
            <Link href="/dashboard/provider/scholarships/create" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors">
              <Plus size={16} />
              Create Program
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
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  filter === f ? "bg-foreground text-background dark:bg-white dark:text-black" : "text-muted-foreground hover:bg-muted"
                )}
              >
                {f === 'ALL' ? 'All Programs' : f.replace('_', ' ')}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors font-medium text-sm">
            <Filter size={16} />
            <span>Filters</span>
          </button>
        </section>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode='popLayout'>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-[280px] bg-muted animate-pulse rounded-2xl" />
              ))
            ) : scholarships.length > 0 ? (
              scholarships.map((s) => (
                <ScholarshipCard key={s.id} {...s} onDelete={handleOpenDeleteModal} />
              ))
            ) : null}

            {!loading && (
              <Link 
                href="/dashboard/provider/scholarships/create"
                className="group flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-border hover:border-blue-500 hover:bg-blue-500/5 transition-all text-center space-y-4 min-h-[280px] h-full"
              >
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500/10 transition-all">
                  <Plus size={28} className="text-muted-foreground group-hover:text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-blue-500 transition-colors">Create New Program</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-[200px] mx-auto">
                    Publish a new scholarship application portal
                  </p>
                </div>
              </Link>
            )}
          </AnimatePresence>
        </div>

        {!loading && scholarships.length === 0 && filter !== 'ALL' && (
          <div className="py-20 text-center space-y-4">
            <PackageSearch className="mx-auto text-muted-foreground/20" size={64} />
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">No Results Found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or search terms</p>
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

