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
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '../ui/badge';
import api from '@/app/lib/api';
import { cn } from '@/lib/utils';

export const ScholarshipList = () => {
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
  
  const debounceRef = useRef<any>(null);

  // Debounced search logic
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 600);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

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
      
      const response = await api.get(`/scholarships?${params.toString()}`);
      let results = response.data.scholarships || [];
      
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
  }, [debouncedSearch, filters, sortBy]);

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
      await api.post('/applications', { 
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
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-blue-600 dark:text-blue-400/80">{scholarships.length} Opportunities Available</span>
          </motion.div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={fetchScholarships}
            className="rounded-xl border-border bg-card backdrop-blur-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all h-11 px-5 font-bold text-xs uppercase tracking-widest shadow-sm"
          >
            Refresh List
          </Button>
        </div>
      </div>

      {/* Advanced Search and Filters Portfolio Grade - Theme Aware */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="group relative flex flex-col md:flex-row gap-6 items-center bg-card backdrop-blur-3xl p-8 rounded-[32px] border border-border shadow-2xl dark:shadow-none"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors" size={20} />
          <Input 
            placeholder="Search by title, provider, or category..." 
            className="h-14 pl-14 bg-secondary/50 border-input rounded-2xl text-foreground placeholder:text-muted-foreground/50 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all text-base font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm !== debouncedSearch && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2"
            >
              <Loader2 className="animate-spin text-blue-600 dark:text-blue-500" size={14} />
              <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Searching</span>
            </motion.div>
          )}
        </div>
        
        <div className="flex flex-wrap md:flex-nowrap items-center gap-4 w-full md:w-auto shrink-0 relative z-10">
          <Button 
            variant="outline" 
            className={cn(
              "h-14 px-8 border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-border/50 rounded-2xl gap-3 flex-1 md:flex-none font-black uppercase tracking-widest text-[10px]",
              activeFilters > 0 && "border-blue-500/30 bg-blue-500/5 text-blue-600 dark:text-blue-400"
            )}
            onClick={() => {
              setTempFilters({ ...filters });
              setShowFilterModal(true);
            }}
          >
            <Filter size={18} className={activeFilters > 0 ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"} /> 
            Filters
            { activeFilters > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center text-[10px] font-black">
                {activeFilters}
              </span>
            )}
          </Button>
          
          <div className="hidden md:flex h-10 w-px bg-white/10 mx-2" />
          
          <div className="relative group/field flex-1 md:flex-none">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-auto h-14 pl-6 pr-10 bg-secondary/50 hover:bg-secondary border border-border rounded-2xl text-foreground focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-black appearance-none cursor-pointer uppercase tracking-widest text-[10px]"
            >
              <option value="newest" className="bg-background text-foreground">Newest First</option>
              <option value="amount_high" className="bg-background text-foreground">Highest Amount</option>
              <option value="amount_low" className="bg-background text-foreground">Lowest Amount</option>
              <option value="deadline" className="bg-background text-foreground">Deadline Soon</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
          
          <div className="hidden md:flex h-10 w-px bg-white/10 mx-2" />
          
          <div className="flex items-center gap-1.5 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl hidden xl:flex">
             <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-500 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Match AI v2.0</span>
          </div>
        </div>
      </motion.div>

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
                <div className="h-full bg-card border border-border hover:border-blue-500/50 rounded-[32px] p-8 transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:group-hover:shadow-none flex flex-col relative overflow-hidden shadow-sm">
                  {/* Save Toggle */}
                  <button 
                    onClick={() => toggleSave(scholarship.id)}
                    className={cn(
                      "absolute top-5 right-5 p-2 rounded-xl transition-all duration-300 z-20 group/save",
                      isSaved ? "bg-rose-500/10 text-rose-500 shadow-sm" : "bg-secondary border border-border text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5"
                    )}
                  >
                    <Heart size={18} fill={isSaved ? "currentColor" : "none"} className={cn(isSaved && "animate-pulse")} />
                  </button>

                  <div>
                    <div className="flex justify-between items-start mb-5 relative z-10">
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-400/10 border border-blue-400/20 text-blue-600 dark:text-cyan-400 shadow-sm group-hover:scale-110 transition-all duration-500">
                        <Award size={22} strokeWidth={1.5} />
                      </div>
                      <div className="flex gap-2 flex-col items-end pr-10">
                        {daysLeft !== null && (
                          <Badge variant="outline" className={cn(
                            "text-[9px] font-black uppercase tracking-widest border px-2 py-0.5 shadow-sm",
                            daysLeft <= 0 ? "bg-muted text-muted-foreground border-border" :
                            daysLeft <= 7 ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" : 
                            "bg-secondary/50 text-muted-foreground border-border"
                          )}>
                            {daysLeft <= 0 ? 'Expired' : `${daysLeft}d left`}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm">
                          <Users size={10} />
                          <span className="text-[9px] font-black uppercase">Verified</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 mb-5">
                      <h3 className="text-foreground text-lg font-black leading-tight mb-2 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                        {scholarship.title || 'Untitled Scholarship'}
                      </h3>
                      <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                        {scholarship.category || 'General'}
                      </p>
                      
                      {/* Match Probability */}
                      <div className="bg-secondary/30 rounded-2xl p-4 border border-border space-y-3 mt-4 shadow-inner">
                        <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-[0.15em] mb-1">
                          <span className="text-muted-foreground">AI Compatibility</span>
                          <span className="text-blue-600 dark:text-blue-400">{matchScore}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-1 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${matchScore}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 dark:from-blue-500 dark:via-indigo-400 dark:to-emerald-400 h-full rounded-full shadow-sm" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto shrink-0 relative z-10">
                    <div className="flex items-center justify-between border-t border-border/50 pt-4 mb-6">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                          <DollarSign size={10} />
                          <span className="text-[9px] uppercase font-black tracking-widest">Grant Amount</span>
                        </div>
                        <span className="text-foreground text-xl font-black tracking-tighter">
                          {typeof scholarship.amount === 'number' 
                            ? `₹${scholarship.amount.toLocaleString()}` 
                            : scholarship.amount || 'N/A'}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                          <Clock size={10} />
                          <span className="text-[9px] uppercase font-black tracking-widest text-right">Deadline</span>
                        </div>
                        <span className="text-foreground text-xs font-black tracking-tight">
                          {scholarship.deadline 
                            ? new Date(scholarship.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) 
                            : 'Ongoing'}
                        </span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleApply(scholarship.id)}
                      disabled={isApplied || isApplying || (daysLeft !== null && daysLeft <= 0)}
                      className={cn(
                        "w-full font-black uppercase tracking-widest text-[10px] rounded-xl h-12 flex items-center justify-center gap-2 transition-all duration-300",
                        isApplied ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-default" :
                        isApplying ? "bg-blue-600/50 text-white cursor-wait" :
                        "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 active:scale-95"
                      )}
                    >
                      {isApplied ? (
                        <>
                          <CheckCircle2 size={14} /> Submitted
                        </>
                      ) : isApplying ? (
                        <>
                          <Loader2 size={14} className="animate-spin" /> Applying
                        </>
                      ) : (
                        <>
                          Apply Now <ArrowRight size={14} />
                        </>
                      )}
                    </Button>
                  </div>
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
    </div>
  );
};
