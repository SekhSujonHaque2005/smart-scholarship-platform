'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  X, 
  Command, 
  BookOpen, 
  Users, 
  ArrowRight,
  Loader2,
  Calendar,
  IndianRupee,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/app/lib/api';
import Link from 'next/link';
import { useAuthStore } from '@/app/store/auth.store';

interface SearchResult {
  id: string;
  type: 'scholarship' | 'application' | 'vault';
  title: string;
  subtitle: string;
  href: string;
  status?: string;
}

export const GlobalSearch = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();
  const isProvider = user?.role === 'PROVIDER';

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const [scholarshipsRes, applicationsRes] = await Promise.all([
          api.get(`/scholarships?search=${query}&limit=5`),
          isProvider ? api.get('/applications/provider/my') : api.get('/applications/my')
        ]);

        const scholarshipResults: SearchResult[] = scholarshipsRes.data.scholarships.map((s: any) => ({
          id: s.id,
          type: 'scholarship',
          title: s.title,
          subtitle: `Budget: ₹${s.amount?.toLocaleString() || 'N/A'}`,
          href: isProvider ? `/dashboard/provider/scholarships` : `/scholarships/${s.id}`,
          status: s.status
        }));

        const appData = isProvider ? applicationsRes.data.applications : applicationsRes.data.applications;
        
        const applicationResults: SearchResult[] = (appData || [])
          .filter((a: any) => {
            const searchTarget = isProvider ? a.student?.name : a.scholarship?.title;
            return searchTarget?.toLowerCase().includes(query.toLowerCase());
          })
          .slice(0, 5)
          .map((a: any) => ({
            id: a.id,
            type: 'application',
            title: isProvider ? a.student?.name : a.scholarship?.title,
            subtitle: isProvider ? `Applying for: ${a.scholarship?.title}` : `Status: ${a.status}`,
            href: isProvider ? `/dashboard/provider/applications` : `/dashboard/student/applications`,
            status: a.status
          }));

        setResults([...scholarshipResults, ...applicationResults]);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="relative w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 p-6 border-b border-border">
              <Search className="text-muted-foreground" size={20} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search protocols, candidates, or system commands..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-foreground font-mono text-sm placeholder:text-muted-foreground"
              />
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-accent border border-border text-[9px] font-mono text-muted-foreground uppercase font-black">
                <Command size={10} /> Esc
              </div>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto p-4 no-scrollbar">
              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="animate-spin text-indigo-500" size={32} />
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest animate-pulse">Scanning Neural Network...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-6 pb-4">
                  {/* Categorized Results */}
                  {['scholarship', 'application'].map((type) => {
                    const categoryResults = results.filter(r => r.type === type);
                    if (categoryResults.length === 0) return null;

                    return (
                      <div key={type} className="space-y-2">
                        <div className="px-3 text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em] font-black opacity-60">
                          {type === 'scholarship' ? 'Programs & Protocols' : 'Candidate Submissions'}
                        </div>
                        <div className="space-y-1">
                          {categoryResults.map((result) => (
                            <Link
                              key={result.id}
                              href={result.href}
                              onClick={onClose}
                              className="group flex items-center justify-between p-3 rounded-2xl hover:bg-accent transition-all border border-transparent hover:border-border"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-accent border border-border flex items-center justify-center text-muted-foreground group-hover:text-indigo-500 transition-colors">
                                  {type === 'scholarship' ? <BookOpen size={18} /> : <Users size={18} />}
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-foreground group-hover:text-indigo-500 transition-colors uppercase tracking-tight">
                                    {result.title}
                                  </div>
                                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                                    {result.subtitle}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {result.status && (
                                  <div className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] font-mono uppercase tracking-widest font-black">
                                    {result.status}
                                  </div>
                                )}
                                <ArrowRight className="text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" size={16} />
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : query ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-accent border border-border flex items-center justify-center mx-auto text-muted-foreground/30">
                    <FileText size={32} />
                  </div>
                  <div>
                    <p className="text-xs font-mono text-foreground uppercase tracking-widest font-black">No matches found</p>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-1">Try adjusting your search parameters</p>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center space-y-6">
                  <div className="flex justify-center gap-8 translate-x-4">
                    <div className="text-center space-y-2 opacity-40">
                      <div className="p-4 rounded-3xl bg-accent border border-border">
                        <Command size={24} />
                      </div>
                      <p className="text-[8px] font-mono uppercase tracking-widest">K: Search</p>
                    </div>
                    <div className="text-center space-y-2 opacity-40">
                      <div className="p-4 rounded-3xl bg-accent border border-border">
                        <ArrowRight size={24} />
                      </div>
                      <p className="text-[8px] font-mono uppercase tracking-widest">Tab: Filter</p>
                    </div>
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] font-black">
                    Quickly navigate through organization data
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-accent/30 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                  <span className="px-1 py-0.5 rounded bg-card border border-border">↑↓</span>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                  <span className="px-1 py-0.5 rounded bg-card border border-border">Enter</span>
                  <span>Select</span>
                </div>
              </div>
              <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest opacity-50">
                ScholarHub Console Search v1.0
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
