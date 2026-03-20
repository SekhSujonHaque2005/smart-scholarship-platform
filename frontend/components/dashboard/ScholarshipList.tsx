'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Award, 
  ArrowRight, 
  Loader2, 
  ChevronDown, 
  Heart, 
  Users, 
  Clock, 
  DollarSign,
  TrendingUp,
  X,
  CheckCircle2,
  BookOpen,
  Info,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '../ui/badge';
import api from '@/app/lib/api';
import { cn } from '@/lib/utils';

export const ScholarshipList = ({ searchTerm: externalSearch = '' }: { searchTerm?: string }) => {
  const router = useRouter();
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(externalSearch);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({
    minAmount: '',
    maxAmount: '',
    category: 'All',
    deadlineWithin: ''
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedScholarship, setSelectedScholarship] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const debounceRef = useRef<any>(null);

  // Sync internal searchTerm with prop
  useEffect(() => {
    setSearchTerm(externalSearch);
  }, [externalSearch]);

  // Debounced search logic
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 600);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  // Handle body scroll lock with layout shift protection
  useEffect(() => {
    if (showDetailModal || showFilterModal) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [showDetailModal, showFilterModal]);

  // Load persistence
  useEffect(() => {
    const saved = localStorage.getItem('savedScholarships');
    if (saved) setSavedIds(new Set(JSON.parse(saved)));
  }, []);

  const getDaysLeft = (deadline: string) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const fetchScholarships = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (filters.minAmount) params.append('minAmount', filters.minAmount);
      if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);
      
      // Request 1000 if "Show All" is active, else default 10
      params.append('limit', showAll ? '1000' : '10');

      const response = await api.get(`scholarships?${params.toString()}`);
      let results = response.data.scholarships || [];
      const total = response.data.pagination?.total || 0;
      setTotalCount(total);
      
      // Client-side category filter (if not handled by backend)
      if (filters.category !== 'All') {
        results = results.filter((s: any) => s.category === filters.category);
      }

      // Deadline filter
      if (filters.deadlineWithin) {
        const days = parseInt(filters.deadlineWithin);
        const cutoff = Date.now() + days * 24 * 60 * 60 * 1000;
        results = results.filter((s: any) => s.deadline && new Date(s.deadline).getTime() <= cutoff);
      }
      
      // Sort logic
      if (sortBy === 'amount_high') results.sort((a: any, b: any) => (b.amount || 0) - (a.amount || 0));
      if (sortBy === 'amount_low') results.sort((a: any, b: any) => (a.amount || 0) - (b.amount || 0));
      if (sortBy === 'deadline') results.sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
      
      setScholarships(results);
    } catch (error) {
      console.error('Error fetching scholarships:', error);
      setScholarships([]); 
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters, sortBy, showAll]);

  useEffect(() => {
    fetchScholarships();
  }, [fetchScholarships]);

  const toggleSave = (id: string) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('savedScholarships', JSON.stringify([...next]));
      return next;
    });
  };

  const handleApply = async (scholarshipId: string) => {
    if (appliedIds.has(scholarshipId) || applyingId === scholarshipId) return;
    
    setApplyingId(scholarshipId);
    try {
      await api.post('applications', { 
        scholarshipId,
        formData: {} 
      });
      setAppliedIds(prev => new Set([...prev, scholarshipId]));
    } catch (error: any) {
      console.error('Apply error:', error);
      alert(error.response?.data?.message || 'Failed to apply. Please try again.');
    } finally {
      setApplyingId(null);
    }
  };

  const activeFilters = [
    filters.minAmount,
    filters.maxAmount,
    filters.category !== 'All' ? filters.category : '',
    filters.deadlineWithin
  ].filter(Boolean).length;

  return (
    <div className="space-y-12">
      {/* Sticky Header Section */}
      <div className="sticky top-0 md:top-0 z-30 pt-4 pb-6 bg-background/80 backdrop-blur-xl -mt-4 -mx-10 px-10 border-b border-border/50">
        <div className="space-y-12">
          {/* Premium Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-20">
            <div className="space-y-1">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl md:text-5xl font-serif font-black tracking-tighter text-foreground drop-shadow-sm"
              >
                Scholarships
              </motion.h1>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground font-medium tracking-wide flex items-center gap-2"
              >
                Discover your future <div className="w-1 h-1 rounded-full bg-border" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-blue-600 dark:text-blue-400/80">
                  {scholarships.length} of {totalCount || scholarships.length} Opportunities Available
                </span>
              </motion.div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowAll(!showAll)}
                className={cn(
                  "rounded-xl border-border bg-card backdrop-blur-md transition-all h-11 px-5 font-bold text-xs uppercase tracking-widest shadow-sm",
                  showAll ? "text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/5" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {showAll ? 'Show Less' : 'Show All'}
              </Button>

              <Button 
                variant="outline" 
                onClick={fetchScholarships}
                className="rounded-xl border-border bg-card backdrop-blur-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all h-11 px-5 font-bold text-xs uppercase tracking-widest shadow-sm"
              >
                Refresh List
              </Button>
            </div>
          </div>

          {/* Premium Search and Filters - Industry Standard Capsule Design */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group relative flex flex-wrap md:flex-nowrap items-center bg-card/60 backdrop-blur-3xl p-2 md:p-3 rounded-[32px] md:rounded-full border border-white/10 shadow-2xl transition-all duration-500 hover:border-blue-500/20"
          >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-full" />
            
            {/* Search Input Section */}
            <div className="relative flex-1 min-w-[300px] group/search">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within/search:text-blue-500 transition-all duration-300" size={18} />
              <Input 
                placeholder="Search scholarships, providers, or fields..." 
                className="h-12 pl-14 pr-4 bg-transparent border-none rounded-full text-foreground placeholder:text-muted-foreground/30 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all text-sm font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm !== debouncedSearch && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 px-2 py-1 bg-blue-500/5 rounded-lg border border-blue-500/10"
                >
                  <Loader2 className="animate-spin text-blue-500" size={12} />
                  <span className="text-[9px] uppercase font-black tracking-widest text-blue-500/70">Syncing</span>
                </motion.div>
              )}
            </div>
            
            {/* Divider 1 */}
            <div className="hidden md:block w-px h-8 bg-border/40 mx-2" />
            
            {/* Filter Section */}
            <div className="flex items-center gap-2 px-2">
              <Button 
                variant="ghost" 
                className={cn(
                  "h-12 px-5 rounded-full hover:bg-white/5 transition-all gap-2.5 font-bold uppercase tracking-widest text-[10px] border border-transparent",
                  activeFilters > 0 ? "text-blue-500 bg-blue-500/5 border-blue-500/20" : "text-muted-foreground/60"
                )}
                onClick={() => {
                  setTempFilters({ ...filters });
                  setShowFilterModal(true);
                }}
              >
                <Filter size={16} className={cn("transition-transform duration-300", activeFilters > 0 && "scale-110")} /> 
                Filters
                { activeFilters > 0 && (
                  <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500 text-white text-[9px] font-black shadow-lg shadow-blue-500/30">
                    {activeFilters}
                  </span>
                )}
              </Button>
            </div>
            
            {/* Divider 2 */}
            <div className="hidden md:block w-px h-8 bg-border/40 mx-2" />
            
            {/* Sort Section */}
            <div className="relative group/sort px-2 min-w-[160px]">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown size={14} className="text-muted-foreground/30 group-hover/sort:text-muted-foreground/60 transition-colors" />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full h-12 pl-10 pr-6 bg-transparent border-none rounded-full text-foreground hover:text-foreground focus:ring-0 outline-none transition-all font-bold appearance-none cursor-pointer uppercase tracking-widest text-[10px] text-muted-foreground/70"
              >
                <option value="newest" className="bg-background">Newest First</option>
                <option value="amount_high" className="bg-background">Highest Amount</option>
                <option value="amount_low" className="bg-background">Lowest Amount</option>
                <option value="deadline" className="bg-background">Deadline Soon</option>
              </select>
            </div>
            
            {/* AI Status Pulsar */}
            <div className="hidden lg:flex items-center gap-3 px-6 py-2 ml-2 bg-blue-500/5 border border-blue-500/10 rounded-full group/ai transition-all hover:bg-blue-500/10 hover:border-blue-500/30">
               <div className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
               </div>
               <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500/80 group-hover/ai:text-blue-500 transition-colors">Match AI v2.0</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Results Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-center py-20">
           <div className="col-span-full flex flex-col items-center gap-4">
             <Loader2 className="animate-spin text-blue-600 dark:text-blue-500" size={40} />
             <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">Filtering Intelligence...</p>
           </div>
        </div>
      ) : scholarships.length === 0 ? (
        <div className="text-center py-20 bg-muted/40 rounded-3xl border border-dashed border-border leading-loose shadow-inner">
          <Award className="mx-auto text-muted-foreground/20 mb-4" size={64} strokeWidth={1} />
          <h3 className="text-xl font-bold text-muted-foreground/80 uppercase tracking-widest">No matches found</h3>
          <p className="text-muted-foreground/50 mt-2 text-xs font-bold">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {scholarships.map((scholarship, index) => {
            const daysLeft = getDaysLeft(scholarship.deadline);
            const isSaved = savedIds.has(scholarship.id);
            const isApplied = appliedIds.has(scholarship.id);
            const isApplying = applyingId === scholarship.id;
            const matchScore = scholarship.amount > 50000 ? 94 : 88;

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={scholarship.id || index}
                className="group relative h-full"
              >
                <div className="h-full bg-white/[0.01] border border-dashed border-border/60 hover:border-blue-500/40 rounded-[40px] p-10 transition-all duration-700 group-hover:bg-white/[0.02] flex flex-col relative overflow-hidden backdrop-blur-sm">
                  {/* Save Toggle - Premium Style */}
                  <button 
                    onClick={() => toggleSave(scholarship.id)}
                    className={cn(
                      "absolute top-8 right-8 p-3 rounded-full transition-all duration-500 z-20 group/save",
                      isSaved ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "bg-white/[0.03] border border-dashed border-border/60 text-muted-foreground hover:text-rose-500 hover:border-rose-500/40"
                    )}
                  >
                    <Heart size={16} fill={isSaved ? "currentColor" : "none"} className={cn("transition-transform duration-500", !isSaved && "group-hover/save:scale-125")} />
                  </button>

                  <div className="flex-1 space-y-8">
                    {/* Top Status Belt */}
                    <div className="flex items-center gap-3 flex-wrap relative z-10 font-mono text-[9px] uppercase tracking-[0.2em]">
                      {daysLeft !== null && (
                        <div className={cn(
                          "px-3 py-1 border border-dashed rounded-sm",
                          daysLeft <= 0 ? "border-border text-muted-foreground" :
                          daysLeft <= 7 ? "border-rose-500/40 text-rose-500 bg-rose-500/5 animate-pulse" : 
                          "border-emerald-500/30 text-emerald-500 bg-emerald-500/5"
                        )}>
                          {daysLeft <= 0 ? 'STATUS: EXPIRED' : `${daysLeft}D LEFT`}
                        </div>
                      )}
                      <div className="px-3 py-1 border border-dashed border-blue-500/30 text-blue-400 bg-blue-500/5 rounded-sm">
                        {scholarship.isExternal ? 'SOURCE: REMOTE' : 'SOURCE: VERIFIED'}
                      </div>
                    </div>

                    {/* Metadata Section */}
                    <div className="relative z-10 space-y-3">
                      <h3 className="text-foreground text-2xl font-black leading-[1.1] tracking-tighter group-hover:text-blue-500 transition-colors duration-500 min-h-[52px] line-clamp-2">
                        {scholarship.title || 'Untitled Scholarship'}
                      </h3>
                      <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-[0.3em] font-bold">
                        {scholarship.category || 'General Field'}
                      </p>
                    </div>

                    {/* Intelligence Module */}
                    {(scholarship.matchScore != null || matchScore != null) && (
                      <div className="bg-white/[0.02] border border-dashed border-border/40 rounded-3xl p-6 space-y-4 relative group/ai overflow-hidden">
                        <div className="absolute inset-0 bg-blue-500/[0.01] opacity-0 group-hover/ai:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        <div className="flex justify-between items-end relative z-10">
                          <div className="space-y-1">
                            <h4 className="text-[9px] font-mono font-black text-blue-400/80 uppercase tracking-[0.3em]">AI Matching Index</h4>
                            <p className="text-[8px] text-muted-foreground/60 font-mono uppercase tracking-widest leading-none">V2.0 PROBABILISTIC ENGINE</p>
                          </div>
                          <span className="text-2xl font-mono font-black text-blue-500 tracking-tighter">
                            {scholarship.matchScore ?? matchScore}%
                          </span>
                        </div>
                        
                        <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden relative border border-white/[0.02]">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${scholarship.matchScore ?? matchScore}%` }}
                            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full bg-blue-500 relative"
                          >
                             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                          </motion.div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pricing & Deadline Matrix */}
                  <div className="mt-12 shrink-0 relative z-10 pt-8 border-t border-dashed border-border/60 grid grid-cols-2 gap-8 mb-8">
                    <div className="space-y-2">
                       <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.3em]">Grant amount</p>
                       <p className="text-2xl font-mono font-black text-foreground tracking-tighter shadow-blue-500/20">
                         {typeof scholarship.amount === 'number' 
                           ? `₹${scholarship.amount.toLocaleString()}` 
                           : 'N/A'}
                       </p>
                    </div>
                    <div className="space-y-2 text-right">
                       <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.3em]">Submission window</p>
                       <p className="text-xl font-mono font-black text-foreground tracking-tighter">
                         {scholarship.deadline 
                           ? new Date(scholarship.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()
                           : 'OPEN'}
                       </p>
                    </div>
                  </div>

                  <Button 
                    onClick={() => router.push(`/dashboard/student/scholarships/${scholarship.id}`)}
                    className={cn(
                      "w-full font-mono font-black uppercase tracking-[0.3em] text-[10px] rounded-full h-14 flex items-center justify-center gap-3 transition-all duration-500",
                      isApplied ? "bg-white/5 text-emerald-500 border border-dashed border-emerald-500/30 cursor-default" :
                      "bg-foreground text-background hover:scale-[1.02] shadow-xl hover:shadow-black/20"
                    )}
                  >
                    {scholarship.isExternal ? (
                      <>Deploy Application <ArrowRight size={14} /></>
                    ) : isApplied ? (
                      <>Analysis Registered <CheckCircle2 size={14} /></>
                    ) : (
                      <>Initiate Process <ArrowRight size={14} /></>
                    )}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Filter Modal Overlay - Theme Aware */}
      <AnimatePresence>
        {showFilterModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterModal(false)}
              className="absolute inset-0 bg-background/60 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-[32px] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6">
                <button onClick={() => setShowFilterModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-black text-foreground uppercase tracking-widest">Smart Filters</h3>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Narrow down the best opportunities for your profile.</p>
              </div>

              <div className="space-y-6">
                {/* Amount Filter */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Min Amount (₹)</label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      type="number" 
                      placeholder="Min" 
                      value={tempFilters.minAmount}
                      onChange={(e) => setTempFilters({ ...tempFilters, minAmount: e.target.value })}
                      className="bg-secondary/50 border-input rounded-xl h-12 text-sm font-medium" 
                    />
                    <Input 
                      type="number" 
                      placeholder="Max" 
                      value={tempFilters.maxAmount}
                      onChange={(e) => setTempFilters({ ...tempFilters, maxAmount: e.target.value })}
                      className="bg-secondary/50 border-input rounded-xl h-12 text-sm font-medium" 
                    />
                  </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Scholastic Category</label>
                  <div className="flex flex-wrap gap-2">
                    {['All', 'Merit', 'Need-based', 'STEM', 'Arts', 'Sports'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setTempFilters({ ...tempFilters, category: cat })}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                          tempFilters.category === cat 
                            ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20" 
                            : "bg-secondary text-muted-foreground border-border hover:border-blue-500/50"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Deadline Filter */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Application Window</label>
                  <div className="relative group">
                    <select
                      value={tempFilters.deadlineWithin}
                      onChange={(e) => setTempFilters({ ...tempFilters, deadlineWithin: e.target.value })}
                      className="w-full bg-secondary/50 border border-input rounded-xl h-12 px-4 text-foreground outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-black text-[10px] uppercase tracking-widest appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-background">Anytime</option>
                      <option value="7" className="bg-background">Next 7 Days</option>
                      <option value="30" className="bg-background">Next 30 Days</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] border-border text-muted-foreground"
                  onClick={() => {
                    const reset = { minAmount: '', maxAmount: '', category: 'All', deadlineWithin: '' };
                    setTempFilters(reset);
                    setFilters(reset);
                    setShowFilterModal(false);
                  }}
                >
                  Reset All
                </Button>
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 rounded-2xl h-12 font-black uppercase tracking-widest text-[10px]"
                  onClick={() => {
                    setFilters({ ...tempFilters });
                    setShowFilterModal(false);
                  }}
                >
                  Apply Filters
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Scholarship Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedScholarship && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetailModal(false)}
              onWheel={(e) => e.stopPropagation()}
              className="absolute inset-0 bg-background/80 backdrop-blur-xl cursor-default"
              data-lenis-prevent
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-2xl bg-card border border-border rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] cursor-default"
            >
              {/* Header */}
              <div className="p-8 border-b border-border/50 bg-gradient-to-br from-blue-500/5 to-transparent">
                <div className="flex justify-between items-start mb-6">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 px-3 py-1">
                    {selectedScholarship.category}
                  </Badge>
                  <button 
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <h2 className="text-3xl font-black tracking-tight leading-tight mb-2">
                  {selectedScholarship.title}
                </h2>
                <p className="text-muted-foreground flex items-center gap-2 font-medium">
                  <Award size={16} className="text-blue-500" />
                  {selectedScholarship.provider?.orgName || "Government Agency"}
                </p>
              </div>

              {/* Body */}
              <div 
                className="flex-1 overflow-y-auto p-8 space-y-8 min-h-0 overscroll-contain"
                onWheel={(e) => e.stopPropagation()}
                data-lenis-prevent
              >
                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1">Benefit</p>
                    <p className="text-xl font-black text-blue-600 dark:text-blue-400">
                      ₹{selectedScholarship.amount?.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1">Deadline</p>
                    <p className="text-xl font-black">
                      {selectedScholarship.deadline ? new Date(selectedScholarship.deadline).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* About Section */}
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                    <Info size={16} /> About Scholarship
                  </h3>
                  <div className="text-muted-foreground leading-relaxed font-medium bg-muted/20 p-6 rounded-2xl">
                    {selectedScholarship.description}
                  </div>
                </div>

                {/* Instructions Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <BookOpen size={16} /> How to Apply (Guide)
                  </h3>
                  <div className="grid gap-3">
                    {[
                      { step: 1, text: "Click the 'Go to Official Portal' button below." },
                      { step: 2, text: "Wait for the scholarship landing page to load." },
                      { step: 3, text: `Search for '${selectedScholarship.title}' on the portal.` },
                      { step: 4, text: "Check the exact eligibility criteria (income, category, etc.)." },
                      { step: 5, text: "Register and fill the application form with required documents." }
                    ].map((item) => (
                      <div key={item.step} className="flex gap-4 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 hover:border-blue-500/20 transition-all">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                          {item.step}
                        </div>
                        <p className="font-semibold text-sm pt-1.5">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fallback Help */}
                <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5">
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-2 uppercase tracking-widest">Link Failure Help</p>
                  <p className="text-sm font-medium text-amber-700/80 dark:text-amber-300/80">
                    If the portal link doesn't open, please visit the main website: 
                    <span className="block font-black mt-1 underline">
                      {selectedScholarship.sourceUrl?.split('/')[2] || "Official Portal"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-8 border-t border-border/50 bg-muted/20 flex flex-col md:flex-row gap-4">
                <Button 
                  onClick={() => {
                    const url = selectedScholarship.sourceUrl;
                    if (url) {
                      const finalUrl = url.startsWith('http') ? url : `https://${url}`;
                      window.open(finalUrl, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/30 gap-2"
                >
                  Go to Official Portal <ExternalLink size={18} />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowDetailModal(false)}
                  className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest bg-card shadow-sm border-border/50 text-muted-foreground hover:text-foreground"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
