'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  Users, 
  GraduationCap, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  UserCheck,
  Globe,
  Zap,
  RefreshCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/app/lib/api';

const StatCard = ({ title, value, subValue, icon: Icon, trend, color }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-card border rounded-2xl p-6 shadow-sm overflow-hidden"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={cn("w-12 h-12 rounded-xl border flex items-center justify-center bg-muted/50", color.replace('bg-', 'text-'))}>
        <Icon size={24} />
      </div>
      {trend && (
        <div className={cn("flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold", trend > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
          <ArrowUpRight size={14} className={cn(trend < 0 && "rotate-90")} />
          {trend > 0 ? '+' : ''}{trend}%
        </div>
      )}
    </div>

    <div className="space-y-1">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-foreground">{value}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{subValue}</p>
    </div>
  </motion.div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: '0',
    activeScholarships: '0',
    verifiedProviders: '0',
    fraudAlerts: '0',
    totalDisbursed: '₹0',
    matchingAccuracy: '94.2%', // Mocked as it comes from AI service
    applicationsPerDay: []
  });

  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          api.get('admin/stats'),
          api.get('admin/logs')
        ]);
        
        const data = statsRes.data;
        setStats({
          totalUsers: data.totalUsers.toLocaleString(),
          activeScholarships: data.totalScholarships.toLocaleString(),
          verifiedProviders: data.totalProviders.toLocaleString(),
          fraudAlerts: data.totalFraudAlerts.toLocaleString(),
          totalDisbursed: `₹${(data.totalDisbursed / 100000).toFixed(1)}L`,
          matchingAccuracy: 'Real-time',
          applicationsPerDay: data.applicationsPerDay || []
        });

        setRecentLogs(logsRes.data.slice(0, 5)); // Only show top 5
      } catch (err) {
        console.error('Error fetching admin data:', err);
      }
    };

    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        
        {/* Header Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold tracking-tight text-foreground"
            >
              Admin Overview
            </motion.h1>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span>System Administrator Console</span>
              <div className="h-1 w-1 rounded-full bg-border" />
              <span className="text-emerald-600 font-medium flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> All Systems Operational
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <Button 
                variant="outline" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                onClick={() => window.location.reload()}
             >
                <RefreshCcw size={16} />
                Refresh
             </Button>
          </div>
        </section>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <StatCard 
            title="Total Ecosystem Users" 
            value={stats.totalUsers} 
            subValue="vs last month" 
            icon={Users} 
            trend={12.5}
            color="bg-blue-500" 
          />
          <StatCard 
            title="Live Scholarships" 
            value={stats.activeScholarships} 
            subValue="active programs" 
            icon={GraduationCap} 
            trend={8.2}
            color="bg-purple-500" 
          />
          <StatCard 
            title="Verified Institutions" 
            value={stats.verifiedProviders} 
            subValue="trusted partners" 
            icon={ShieldCheck} 
            trend={4.1}
            color="bg-emerald-500" 
          />
          <StatCard 
            title="AI Fraud Alerts" 
            value={stats.fraudAlerts} 
            subValue="require attention" 
            icon={AlertTriangle} 
            trend={-25.0}
            color="bg-rose-500" 
          />
        </div>

        {/* Secondary Detailed Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart / Activity Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Chart Area */}
            <div className="p-6 rounded-2xl bg-card border shadow-sm">
               <div className="mb-6">
                  <h3 className="text-xl font-bold tracking-tight">Application Velocity</h3>
                  <p className="text-sm text-muted-foreground mt-1">Daily applications over the last 7 days</p>
               </div>
               <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.applicationsPerDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                      />
                      <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border shadow-sm flex flex-col gap-8">
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                     <h3 className="text-xl font-bold tracking-tight">Recent Activity</h3>
                     <p className="text-sm text-muted-foreground mt-1">Real-time Platform stream</p>
                  </div>
                  <Button 
                     variant="outline" 
                     size="sm" 
                     onClick={() => window.location.href = '/dashboard/admin/logs'}
                     className="rounded-lg text-sm font-medium"
                  >
                     View All
                  </Button>
               </div>

               <div className="space-y-4">
                  {recentLogs.map((log: any) => (
                    <div key={log.id} className="group flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                       <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm bg-blue-50 text-blue-600">
                          <Activity size={18} />
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                             <h4 className="text-sm font-semibold truncate">{log.actor?.email || 'System'}</h4>
                             <div className="w-1 h-1 rounded-full bg-border" />
                             <span className="text-xs font-medium text-muted-foreground">
                               {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{log.action.replace(/_/g, ' ')}</p>
                       </div>
                       <div className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-600">
                         LOGGED
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Right Sidebar - AI Insights */}
          <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-card border shadow-sm space-y-6">
                <h3 className="text-sm font-semibold text-foreground">Global Distribution</h3>
                <div className="space-y-4">
                   {[
                     { label: 'Engineering', value: 45, color: 'bg-blue-500' },
                     { label: 'Medicine', value: 25, color: 'bg-rose-500' },
                     { label: 'Arts', value: 20, color: 'bg-amber-500' },
                     { label: 'Research', value: 10, color: 'bg-emerald-500' },
                   ].map(cat => (
                     <div key={cat.label} className="space-y-2">
                        <div className="flex items-center justify-between text-sm font-medium">
                           <span>{cat.label}</span>
                           <span className="text-muted-foreground">{cat.value}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                           <div className={cn("h-full rounded-full transition-all duration-1000", cat.color)} style={{ width: `${cat.value}%` }} />
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
