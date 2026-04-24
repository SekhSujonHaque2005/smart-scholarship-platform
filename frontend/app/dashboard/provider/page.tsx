'use client';

import React, { useState, useEffect } from 'react';
import { ProviderLayout } from '@/components/provider/ProviderLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Award, 
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Clock,
  ExternalLink,
  PlusCircle, 
  Loader2,
  RefreshCcw,
  AlertCircle,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/app/lib/api';
import { useAuthStore } from '@/app/store/auth.store';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrustScoreBreakdown } from '@/components/provider/TrustScoreBreakdown';

const StatCard = ({ label, value, description, icon: Icon, trend, loading }: any) => (
  <motion.div 
    variants={{
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0 }
    }}
    className="bg-card border rounded-2xl p-6 shadow-sm overflow-hidden"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="w-12 h-12 rounded-xl bg-muted border flex items-center justify-center text-muted-foreground">
        <Icon size={24} />
      </div>
      {trend && (
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
          <ArrowUpRight size={14} />
          {trend}
        </div>
      )}
    </div>

    <div className="space-y-1">
      <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
      <div className="flex items-baseline gap-2">
        {loading ? (
          <div className="h-8 w-24 bg-muted animate-pulse rounded-md" />
        ) : (
          <span className="text-2xl font-bold text-foreground">{value}</span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-2">{description}</p>
    </div>
  </motion.div>
);

const ActivityItem = ({ title, time, type, status, id, onClick }: any) => (
  <div 
    onClick={onClick}
    className="flex items-center justify-between py-4 border-b last:border-0 hover:bg-muted/50 px-4 -mx-4 rounded-lg transition-colors cursor-pointer"
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-muted border flex items-center justify-center text-muted-foreground">
        <Clock size={16} />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-0.5">{title}</h4>
        <p className="text-xs text-muted-foreground">{type} • {time}</p>
      </div>
    </div>
    <div className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize",
      status === 'APPROVED' || status === 'Active' || status === 'Completed' ? "bg-emerald-50 text-emerald-600" :
      status === 'PENDING' || status === 'Pending' ? "bg-amber-50 text-amber-600" :
      "bg-blue-50 text-blue-600"
    )}>
      {status?.toLowerCase()}
    </div>
  </div>
);

export default function ProviderDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<any>(null);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, appRes, notifRes] = await Promise.all([
        api.get('stats/provider'),
        api.get('applications/provider/my'),
        api.get('notifications?limit=5')
      ]);

      const stats = statsRes.data;
      const apps = appRes.data.applications;
      const notifs = notifRes.data.notifications;

      setStatsData(stats);
      setStats({
        programs: stats.totalPrograms || 0,
        applications: stats.totalApplications || 0,
        funds: stats.totalFunds || 0,
        trustScore: stats.trustScore || 0,
        funnel: stats.funnel || []
      });

      // Mix notifications and recent applications for a rich activity log
      const mergedActivities = [
        ...notifs.map((n: any) => ({
          id: n.id,
          title: n.title,
          time: new Date(n.createdAt).toLocaleDateString(),
          type: 'SYSTEM',
          status: n.isRead ? 'Reviewed' : 'New'
        })),
        ...apps.slice(0, 3).map((app: any) => ({
          id: app.id,
          title: `New Candidate: ${app.student.name}`,
          time: new Date(app.submittedAt).toLocaleDateString(),
          type: 'SUBMISSION',
          status: app.status,
          targetUrl: `/dashboard/provider/applications/${app.id}`
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

      setActivities(mergedActivities);
      setChartData(stats.trend || []);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('System connection failure. Neural link unstable.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!activities.length) return;
    
    // Simple CSV conversion
    const headers = ['ID', 'Title', 'Date', 'Type', 'Status'];
    const rows = activities.map(a => [a.id, a.title, a.time, a.type, a.status]);
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scholarhub-activity-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  useEffect(() => {
    fetchDashboardData();
  }, [refreshKey]);

  return (
    <ProviderLayout>
      <div className="space-y-8 pb-20">
        {/* Hero Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold tracking-tight text-foreground"
            >
              Provider Overview
            </motion.h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Welcome back. Here is a summary of your scholarship programs and student activity.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExport}
              disabled={loading || activities.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
            >
              <Download size={16} />
              Export
            </button>
            <button 
              onClick={() => setRefreshKey(prev => prev + 1)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCcw size={16} className={cn(loading && "animate-spin")} />
              Refresh
            </button>
          </div>
        </section>

        {error ? (
          <div className="p-12 bg-rose-50 border border-rose-100 rounded-2xl text-center space-y-4 dark:bg-rose-500/5 dark:border-rose-500/10">
            <AlertCircle className="mx-auto text-rose-500" size={40} />
            <h3 className="text-lg font-semibold text-rose-600">{error}</h3>
            <button 
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="px-6 py-2.5 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Vital Stats Grid */}
            <motion.section 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <StatCard 
                label="Total Programs" 
                value={stats?.programs ?? '0'} 
                description="Active scholarship initiatives currently in circulation."
                icon={Award}
                loading={loading}
              />
              <StatCard 
                label="Applications" 
                value={stats?.applications ?? '0'} 
                description="Total candidates processed across all active programs."
                icon={Users}
                loading={loading}
              />
              <StatCard 
                label="Funds Deployed" 
                value={`₹${(stats?.funds || 0).toLocaleString('en-IN')}`} 
                description="Aggregated scholarship capital disbursed to date."
                icon={TrendingUp}
                loading={loading}
              />
              <StatCard 
                label="Trust Ledger" 
                value={stats?.trustScore ?? '0'} 
                description="Organization credibility index based on verification."
                icon={ShieldCheck}
                loading={loading}
              />
            </motion.section>

            <div className="grid grid-cols-12 gap-8">
              {/* Main Feed */}
              <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">

                {/* --- TRENDS ANALYTICS CHART --- */}
                <div className="bg-card border rounded-2xl p-6 shadow-sm overflow-hidden">
                  <div className="mb-6">
                     <h3 className="text-lg font-bold text-foreground">Candidate Acquisition</h3>
                     <p className="text-sm text-muted-foreground mt-1">Influx over last 7 days</p>
                  </div>
                  
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis 
                           dataKey="date" 
                           axisLine={false} 
                           tickLine={false} 
                           tick={{ fill: '#888888', fontSize: 10, fontFamily: '"Times New Roman", Times, serif' }} 
                           dy={10}
                        />
                        <YAxis 
                           axisLine={false} 
                           tickLine={false} 
                           tick={{ fill: '#888888', fontSize: 10, fontFamily: '"Times New Roman", Times, serif' }} 
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(9, 9, 11, 0.9)', 
                            border: '1px solid rgba(99,102,241,0.2)', 
                            borderRadius: '16px',
                            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
                            fontFamily: '"Times New Roman", Times, serif'
                          }}
                          itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                          labelStyle={{ color: '#888', fontSize: '12px' }}
                        />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <Area 
                          type="monotone" 
                          dataKey="submissions" 
                          stroke="#6366f1" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorSubmissions)" 
                          animationDuration={1500}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-card border rounded-2xl p-6 shadow-sm flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Recent Activity</h3>
                      <p className="text-sm text-muted-foreground mt-1">System events & submissions</p>
                    </div>
                    <Link href="/dashboard/provider/applications" className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                      View All <ExternalLink size={14} />
                    </Link>
                  </div>

                  <div className="space-y-2 flex-1">
                    {activities.length > 0 ? (
                      activities.map((activity) => (
                        <ActivityItem 
                          key={activity.id} 
                          {...activity} 
                          onClick={() => {
                            if (activity.targetUrl) {
                              window.location.href = activity.targetUrl;
                            } else if (activity.type === 'SYSTEM') {
                              window.location.href = '/dashboard/provider/notifications';
                            }
                          }}
                        />
                      ))
                    ) : (
                      <div className="py-10 text-center space-y-4">
                        <Activity className="mx-auto text-muted-foreground opacity-50" size={32} />
                        <p className="text-muted-foreground text-sm font-medium">No recent activity detected</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Side Panels */}
              <div className="col-span-12 lg:col-span-4 space-y-6 lg:sticky lg:top-32 h-fit">
                {/* Candidate Funnel */}
                <div className="bg-card border rounded-2xl p-6 shadow-sm">
                   <h3 className="text-base font-semibold mb-4 text-foreground">Application Funnel</h3>
                   <div className="space-y-4">
                      {stats?.funnel?.map((item: any) => (
                         <div key={item.status} className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                               <span className="text-muted-foreground capitalize">{item.status.toLowerCase().replace('_', ' ')}</span>
                               <span className="text-foreground">{item.count}</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                               <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: stats.applications > 0 ? `${(item.count / stats.applications) * 100}%` : '0%' }}
                                  className={cn(
                                     "h-full rounded-full transition-all",
                                     item.status === 'APPROVED' ? 'bg-emerald-500' :
                                     item.status === 'REJECTED' ? 'bg-rose-500' :
                                     'bg-blue-600'
                                  )}
                               />
                            </div>
                         </div>
                      ))}
                   </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-card border rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-semibold mb-4 text-foreground">Quick Actions</h3>
                  
                  <div className="space-y-2">
                    <Link href="/dashboard/provider/scholarships/create" className="w-full flex items-center justify-between p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors group">
                      <span className="text-sm font-medium">Create New Program</span>
                      <PlusCircle size={18} className="group-hover:rotate-90 transition-transform" />
                    </Link>
                    <Link href="/dashboard/provider/applications" className="w-full flex items-center justify-between p-3 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
                      <span className="text-sm font-medium">Review Applications</span>
                      <Activity size={18} />
                    </Link>
                    <Link href="/dashboard/provider/profile" className="w-full flex items-center justify-between p-3 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
                      <span className="text-sm font-medium">Profile & Settings</span>
                      <ShieldCheck size={18} />
                    </Link>
                  </div>
                </div>

                {/* Performance Breakdown */}
                <TrustScoreBreakdown 
                  score={statsData?.trustScore || 0}
                  verificationStatus={statsData?.verificationStatus || 'PENDING'}
                  totalReviews={statsData?.reviewsCount || statsData?._count?.reviews || 0}
                  totalScholarships={statsData?.totalPrograms || statsData?._count?.scholarships || 0}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </ProviderLayout>
  );
}

