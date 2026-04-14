'use client';

import React, { useState, useEffect } from 'react';
import { ProviderLayout } from '@/components/provider/ProviderLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Search, 
  Filter, 
  MoreVertical, 
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Award,
  Calendar,
  Loader2,
  TrendingDown,
  User,
  ThumbsUp,
  Flag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/app/lib/api';
import { toast } from 'sonner';

const StatCard = ({ label, value, description, icon: Icon, trend }: any) => (
  <div className="bg-card border border-border rounded-[32px] p-6 relative overflow-hidden group shadow-sm">
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
      <Icon size={48} />
    </div>
    <div className="space-y-1 relative z-10">
      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-black">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-black text-foreground tracking-tighter">{value}</h3>
        {trend && (
          <span className={cn(
            "text-[10px] font-mono font-bold",
            trend > 0 ? "text-emerald-500" : "text-rose-500"
          )}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-[10px] font-mono text-muted-foreground uppercase font-bold opacity-60">{description}</p>
    </div>
  </div>
);

const ReviewCard = ({ review }: any) => {
  const date = new Date(review.createdAt).toLocaleDateString();
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 bg-card border border-border rounded-3xl space-y-4 hover:border-indigo-500/30 transition-all group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent border border-border flex items-center justify-center text-muted-foreground group-hover:bg-indigo-500/10 group-hover:text-indigo-500 transition-colors">
            <User size={18} />
          </div>
          <div>
            <h4 className="text-sm font-black text-foreground uppercase tracking-tight">{review.student?.name || 'Anonymous Student'}</h4>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star 
                    key={s} 
                    size={10} 
                    className={cn(s <= review.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20")} 
                  />
                ))}
              </div>
              <span className="text-[9px] font-mono text-muted-foreground uppercase font-bold">{date}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 text-muted-foreground hover:text-indigo-500 transition-colors"><ThumbsUp size={14} /></button>
          <button className="p-2 text-muted-foreground hover:text-rose-500 transition-colors"><Flag size={14} /></button>
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors"><MoreVertical size={14} /></button>
        </div>
      </div>
      
      <p className="text-sm text-foreground/80 leading-relaxed font-medium pl-14">
        "{review.comment || 'No comment provided.'}"
      </p>

      <div className="pl-14 pt-2 flex items-center gap-3">
         <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-mono font-black uppercase tracking-widest">Verified Payout</span>
         <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-[8px] font-mono font-black uppercase tracking-widest">Active Scholar</span>
      </div>
    </motion.div>
  );
};

export default function ReputationLedgerPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const profileRes = await api.get('providers/me/profile');
      const providerId = profileRes.data.id;
      
      const reviewsRes = await api.get(`reviews/provider/${providerId}`, {
        params: { limit: 50 }
      });
      
      setReviews(reviewsRes.data.reviews);
      setStats({
        avgRating: reviewsRes.data.avgRating,
        total: reviewsRes.data.pagination.total,
        trustScore: profileRes.data.trustScore
      });
    } catch (error) {
      console.error('Failed to fetch reputation data:', error);
      toast.error('Failed to sync prestige ledger');
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(r => {
    if (filter === 'ALL') return true;
    return r.rating === parseInt(filter);
  });

  return (
    <ProviderLayout>
      <div className="space-y-10 pb-20">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-mono uppercase tracking-widest">Prestige Ledger</span>
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">
              Student <span className="text-indigo-500">Feedback</span>
            </h1>
            <p className="text-muted-foreground text-sm font-mono max-w-xl uppercase font-black tracking-tight opacity-70">
              Track your student success rates and program reviews.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="SEARCH REVIEWS..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-accent/50 border border-border rounded-xl py-2.5 pl-10 pr-4 text-[11px] font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-indigo-500/50 transition-all w-64 uppercase font-bold"
                />
             </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            label="Average Sentiment" 
            value={stats?.avgRating?.toFixed(1) || '0.0'} 
            description="Mean rating across all student nodes."
            icon={Star}
            trend={2.4}
          />
          <StatCard 
            label="Total Testimonials" 
            value={stats?.total || '0'} 
            description="Active consensus records in ledger."
            icon={MessageSquare}
          />
          <StatCard 
            label="Trust Index" 
            value={`${stats?.trustScore || 0}%`} 
            description="Aggregated platform credibility score."
            icon={ShieldCheck}
            trend={5.1}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           {/* Sidebar Filters */}
           <div className="lg:col-span-1 space-y-6">
              <div className="bg-card border border-border rounded-[32px] p-6 space-y-6">
                 <div className="flex items-center gap-2">
                    <Filter size={16} className="text-indigo-500" />
                    <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Protocol Filters</h3>
                 </div>
                 <div className="space-y-2">
                    {['ALL', '5', '4', '3', '2', '1'].map((val) => (
                      <button 
                        key={val}
                        onClick={() => setFilter(val)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-2xl text-[10px] font-mono uppercase tracking-widest transition-all font-black border",
                          filter === val 
                            ? "bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20" 
                            : "bg-accent/50 border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                      >
                        <span>{val === 'ALL' ? 'Everything' : `${val} Stars`}</span>
                        {filter === val && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[32px] p-6 text-white relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                    <TrendingUp size={64} />
                 </div>
                 <h4 className="text-[10px] font-mono uppercase tracking-widest opacity-80 mb-4 font-black">Prestige Goal</h4>
                 <div className="text-3xl font-black tracking-tighter mb-2">PLATINUM</div>
                 <p className="text-[10px] font-mono opacity-80 leading-relaxed font-bold">
                    Maintain a 4.5+ average to unlock featured placement in student matrices.
                 </p>
              </div>
           </div>

           {/* Feed */}
           <div className="lg:col-span-3 space-y-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="animate-spin text-indigo-500" size={40} />
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-black">Decrypting feedback ledger...</p>
                </div>
              ) : filteredReviews.length > 0 ? (
                <div className="space-y-4">
                  {filteredReviews.map((r, i) => (
                    <ReviewCard key={r.id || i} review={r} />
                  ))}
                </div>
              ) : (
                <div className="bg-card border border-border border-dashed rounded-[48px] p-20 text-center space-y-4">
                  <MessageSquare className="mx-auto text-muted-foreground/20" size={64} />
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-foreground tracking-tight mb-2 uppercase">Platform Prestige</h3>
                    <p className="text-[11px] font-mono text-muted-foreground leading-relaxed uppercase tracking-wider max-w-lg mb-4 font-bold opacity-70">
                      Your reputation is calculated based on verified student payouts and positive endorsements.
                    </p>
                  </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </ProviderLayout>
  );
}
