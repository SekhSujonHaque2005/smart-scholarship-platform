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
  IndianRupee,
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

export const ScholarshipList = ({ searchTerm: externalSearch = '', onlySaved = false }: { searchTerm?: string; onlySaved?: boolean }) => {
  const router = useRouter();
  const [rawScholarships, setRawScholarships] = useState<any[]>([]);
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
  
  // Memoized filtered scholarships for instant UI updates (Wishlist/Category/Sort)
  const filteredScholarships = React.useMemo(() => {
    let results = [...rawScholarships];

    // Client-side category filter
    if (filters.category !== 'All') {
      results = results.filter((s: any) => s.category === filters.category);
    }

    // Client-side deadline filter
    if (filters.deadlineWithin) {
      const days = parseInt(filters.deadlineWithin);
      const cutoff = Date.now() + days * 24 * 60 * 60 * 1000;
      results = results.filter((s: any) => s.deadline && new Date(s.deadline).getTime() <= cutoff);
    }

    // Client-side saved/wishlist filter
    if (onlySaved) {
      results = results.filter((s: any) => savedIds.has(s.id));
    }

    // Client-side sort logic
    if (sortBy === 'amount_high') results.sort((a: any, b: any) => (b.amount || 0) - (a.amount || 0));
    else if (sortBy === 'amount_low') results.sort((a: any, b: any) => (a.amount || 0) - (b.amount || 0));
    else if (sortBy === 'deadline') results.sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    else if (sortBy === 'newest') results.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return results;
  }, [rawScholarships, filters.category, filters.deadlineWithin, onlySaved, savedIds, sortBy]);

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
      const results = response.data.scholarships || [];
      const total = response.data.pagination?.total || 0;
      setTotalCount(total);
      
      setRawScholarships(results);
    } catch (error) {
      console.error('Error fetching scholarships:', error);
      setRawScholarships([]); 
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.minAmount, filters.maxAmount, showAll]);

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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            {onlySaved ? 'Wishlist' : 'Scholarships'}
          </h1>
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            Discover your future <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-blue-600 dark:text-blue-500 font-semibold">
              {filteredScholarships.length} of {totalCount || filteredScholarships.length} Opportunities
            </span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowAll(!showAll)}
            className={cn(
              "rounded-lg font-medium transition-colors shadow-sm",
              showAll ? "text-blue-600 border-blue-200 bg-blue-50" : "text-muted-foreground"
            )}
          >
            {showAll ? 'Show Less' : 'Show All'}
          </Button>

          <Button 
            variant="outline" 
            onClick={fetchScholarships}
            className="rounded-lg font-medium text-muted-foreground shadow-sm"
          >
            Refresh List
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-card border rounded-2xl p-2 md:p-3 shadow-sm">
        
        {/* Search Input Section */}
        <div className="relative flex-1 min-w-[300px] w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search scholarships, providers, or fields..." 
            className="h-10 pl-12 pr-4 bg-transparent border-none text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm !== debouncedSearch && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Loader2 className="animate-spin text-muted-foreground" size={14} />
            </div>
          )}
        </div>
        
        {/* Divider */}
        <div className="hidden md:block w-px h-6 bg-border mx-2" />
        
        {/* Actions (Filter, Sort, AI) */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
          {/* Filter */}
          <Button 
            variant="ghost" 
            className={cn(
              "h-10 px-4 rounded-xl gap-2 font-medium text-sm",
              activeFilters > 0 ? "text-blue-600 bg-blue-50" : "text-muted-foreground"
            )}
            onClick={() => {
              setTempFilters({ ...filters });
              setShowFilterModal(true);
            }}
          >
            <Filter size={16} /> 
            Filters
            {activeFilters > 0 && (
              <span className="flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-md bg-blue-600 text-white text-xs font-semibold">
                {activeFilters}
              </span>
            )}
          </Button>
          
          {/* Divider */}
          <div className="hidden md:block w-px h-6 bg-border mx-2" />
          
          {/* Sort */}
          <div className="relative min-w-[140px]">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-10 pl-4 pr-8 bg-transparent border border-border rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground focus:ring-0 outline-none appearance-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="amount_high">Highest Amount</option>
              <option value="amount_low">Lowest Amount</option>
              <option value="deadline">Deadline Soon</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
          
          {/* AI Status */}
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 ml-2 bg-blue-50 text-blue-600 rounded-xl">
             <div className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
             </div>
             <span className="text-xs font-semibold">Match AI</span>
          </div>
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
      ) : filteredScholarships.length === 0 ? (
        <div className="text-center py-20 bg-muted/40 rounded-2xl border border-border leading-loose shadow-sm">
          <Award className="mx-auto text-muted-foreground/50 mb-4" size={48} strokeWidth={1.5} />
          <h3 className="text-lg font-semibold text-foreground">No matches found</h3>
          <p className="text-muted-foreground mt-2 text-sm">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredScholarships.map((scholarship, index) => {
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
                className="group relative h-full flex flex-col"
              >
                <div className="h-full bg-card border border-border hover:border-blue-500/50 rounded-2xl p-6 md:p-8 transition-all duration-300 flex flex-col relative overflow-hidden shadow-sm hover:shadow-md">
                  {/* Save Toggle - Premium Style */}
                  <button 
                    onClick={() => toggleSave(scholarship.id)}
                    className={cn(
                      "absolute top-6 right-6 p-2 rounded-full transition-all duration-300 z-20 group/save",
                      isSaved ? "bg-rose-50 text-rose-500" : "bg-muted text-muted-foreground hover:text-rose-500 hover:bg-rose-50"
                    )}
                  >
                    <Heart size={16} fill={isSaved ? "currentColor" : "none"} className={cn("transition-transform duration-500", !isSaved && "group-hover/save:scale-125")} />
                  </button>

                  <div className="flex-1 space-y-8">
                    {/* Top Status Belt */}
                    <div className="flex items-center gap-2 flex-wrap relative z-10 text-xs font-medium">
                      {daysLeft !== null && (
                        <div className={cn(
                          "px-2.5 py-1 rounded-md border",
                          daysLeft <= 0 ? "border-border text-muted-foreground bg-muted/50" :
                          daysLeft <= 7 ? "border-rose-200 text-rose-600 bg-rose-50" : 
                          "border-emerald-200 text-emerald-700 bg-emerald-50"
                        )}>
                          {daysLeft <= 0 ? 'Expired' : `${daysLeft} Days Left`}
                        </div>
                      )}
                      <div className="px-2.5 py-1 border border-blue-200 text-blue-700 bg-blue-50 rounded-md">
                        {scholarship.isExternal ? 'Remote' : 'Verified'}
                      </div>
                    </div>

                    {/* Metadata Section */}
                    <div className="relative z-10 space-y-2 pr-8">
                      <h3 className="text-foreground text-xl font-bold leading-tight group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 min-h-[56px]">
                        {scholarship.title || 'Untitled Scholarship'}
                      </h3>
                      <p className="text-muted-foreground text-sm font-medium">
                        {scholarship.category || 'General Field'}
                      </p>
                    </div>

                    {/* Intelligence Module */}
                    {(scholarship.matchScore != null || matchScore != null) && (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3 relative overflow-hidden">
                        <div className="flex justify-between items-center relative z-10">
                          <h4 className="text-sm font-semibold text-blue-700">Matching Index</h4>
                          <span className="text-sm font-bold text-blue-700">
                            {scholarship.matchScore ?? matchScore}%
                          </span>
                        </div>
                        
                        <div className="w-full bg-blue-100 h-2 rounded-full overflow-hidden relative">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${scholarship.matchScore ?? matchScore}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-blue-600 rounded-full"
                          />
                        </div>
                      </div>
                    )}
                    </div>

                    {/* Pricing & Deadline Matrix */}
                    <div className="mt-8 shrink-0 relative z-10 pt-6 border-t border-border grid grid-cols-2 gap-4 mb-6">
                      <div className="space-y-1">
                         <p className="text-xs font-medium text-muted-foreground">Grant Amount</p>
                         <p className="text-lg font-bold text-foreground">
                           {typeof scholarship.amount === 'number' 
                             ? `₹${scholarship.amount.toLocaleString()}` 
                             : 'N/A'}
                         </p>
                      </div>
                      <div className="space-y-1 text-right">
                         <p className="text-xs font-medium text-muted-foreground">Deadline</p>
                         <p className="text-lg font-semibold text-foreground">
                           {scholarship.deadline 
                             ? new Date(scholarship.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                             : 'Open'}
                         </p>
                      </div>
                    </div>

                  <Button 
                    onClick={() => router.push(`/dashboard/student/scholarships/${scholarship.id}`)}
                    className={cn(
                      "w-full text-sm font-semibold rounded-lg h-12 flex items-center justify-center gap-2 transition-all",
                      isApplied ? "bg-muted text-emerald-600 border border-emerald-200 hover:bg-muted cursor-default" :
                      "bg-foreground text-background hover:bg-foreground/90"
                    )}
                  >
                    {scholarship.isExternal ? (
                      <>Apply Remote <ArrowRight size={16} /></>
                    ) : isApplied ? (
                      <>Application Sent <CheckCircle2 size={16} /></>
                    ) : (
                      <>View Details <ArrowRight size={16} /></>
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