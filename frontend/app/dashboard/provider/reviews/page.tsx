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
  <div className="bg-card border rounded-2xl p-6 relative overflow-hidden group shadow-sm">
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
      <Icon size={48} />
    </div>
    <div className="space-y-1 relative z-10">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-bold text-foreground">{value}</h3>
        {trend && (
          <span className={cn(
            "text-xs font-semibold",
            trend > 0 ? "text-emerald-500" : "text-rose-500"
          )}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

const ReviewCard = ({ review }: any) => {
  const date = new Date(review.createdAt).toLocaleDateString();
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 bg-card border rounded-2xl space-y-4 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
            <User size={18} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">{review.student?.name || 'Anonymous Student'}</h4>
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
              <span className="text-xs text-muted-foreground">{date}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 text-muted-foreground hover:text-blue-500 transition-colors"><ThumbsUp size={14} /></button>
          <button className="p-2 text-muted-foreground hover:text-rose-500 transition-colors"><Flag size={14} /></button>
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors"><MoreVertical size={14} /></button>
        </div>
      </div>
      
      <p className="text-sm text-foreground/80 leading-relaxed pl-14">
        "{review.comment || 'No comment provided.'}"
      </p>

      <div className="pl-14 pt-2 flex items-center gap-3">
         <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium">Verified Payout</span>
         <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium">Active Scholar</span>
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
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-semibold">Prestige Ledger</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Student Feedback
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Track your student success rates and program reviews.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Search reviews..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-card border rounded-lg py-2 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-64"
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
           <div className="lg:col-span-1 space-y-6">
              <div className="bg-card border rounded-2xl p-6 space-y-6 shadow-sm">
                 <div className="flex items-center gap-2">
                    <Filter size={16} className="text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">Protocol Filters</h3>
                 </div>
                 <div className="space-y-2">
                    {['ALL', '5', '4', '3', '2', '1'].map((val) => (
                      <button 
                        key={val}
                        onClick={() => setFilter(val)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-all",
                          filter === val 
                            ? "bg-blue-600 text-white" 
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        <span>{val === 'ALL' ? 'Everything' : `${val} Stars`}</span>
                      </button>
                    ))}
                 </div>
              </div>

              <div className="bg-card border rounded-2xl p-6 relative overflow-hidden group shadow-sm">
                 <div className="absolute top-0 right-0 p-4 opacity-5 transition-transform">
                    <TrendingUp size={64} />
                 </div>
                 <h4 className="text-sm font-semibold text-foreground mb-1">Prestige Goal</h4>
                 <div className="text-2xl font-bold mb-2">PLATINUM</div>
                 <p className="text-sm text-muted-foreground leading-relaxed">
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
                <div className="bg-card border border-dashed rounded-2xl p-20 text-center space-y-4 shadow-sm">
                  <MessageSquare className="mx-auto text-muted-foreground/50" size={48} />
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Platform Prestige</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto mb-4">
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
