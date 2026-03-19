'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useAuthStore } from '@/app/store/auth.store';
import { Button } from '@/components/ui/button';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { ScholarshipList } from '@/components/dashboard/ScholarshipList';
import { ApplicationTracker } from '@/components/dashboard/ApplicationTracker';
import { Profile } from '@/components/dashboard/Profile';
import { Settings } from '@/components/dashboard/Settings';
import { Notifications } from '@/components/dashboard/Notifications';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Search, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Calendar,
  Layers,
  Zap,
  FileText,
  ChevronRight,
  PanelLeft,
  Award,
  GraduationCap,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from 'next-themes';
import api from '@/app/lib/api';
import { cn } from '@/lib/utils';
import { Spotlight } from '@/components/ui/spotlight';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';



export default function StudentDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [applications, setApplications] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [scholarshipCount, setScholarshipCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate stats from applications
  const stats = useMemo(() => {
    const apps = Array.isArray(applications) ? applications : [];
    const total = apps.length;
    const pending = apps.filter(a => ['PENDING', 'UNDER_REVIEW', 'Submitted'].includes(a?.status)).length;
    const approved = apps.filter(a => a?.status === 'APPROVED').length;
    const successRate = total > 0 ? Math.round((approved / total) * 100) : 0;
    return { total, pending, approved, successRate };
  }, [applications]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [scholarshipsRes, applicationsRes, profileRes] = await Promise.all([
          api.get('/scholarships'),
          api.get('/applications/my'),
          api.get('/auth/me')
        ]);
        
        setScholarshipCount(scholarshipsRes.data.scholarships?.length || 0);
        setApplications(applicationsRes.data.applications || []);
        setProfileData(profileRes.data.profile || null);
        
        // Update global store with latest profile info
        if (profileRes.data.profile) {
          updateUser({
            name: profileRes.data.profile.name,
            profilePicture: profileRes.data.profilePicture
          });
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const chartData = useMemo(() => {
    if (!applications.length) {
      return [
        { name: 'No Data', total: 0, fill: '#334155' }
      ];
    }

    // Group by month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts: Record<string, number> = {};
    
    applications.forEach(app => {
      const date = new Date(app.submittedAt || Date.now());
      const month = months[date.getMonth()];
      counts[month] = (counts[month] || 0) + 1;
    });

    return months
      .filter(m => counts[m])
      .map(m => ({
        name: m,
        total: counts[m],
        fill: '#3b82f6'
      }));
  }, [applications]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    signOut({ callbackUrl: '/login' });
  };

  if (!isAuthenticated) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'scholarships':
        return <ScholarshipList />;
      case 'applications':
        return <ApplicationTracker onDataLoaded={setApplications} />;
      case 'notifications':
        return <Notifications />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      case 'overview':
      default:
        return (
          <div className="space-y-8 pb-10">
            {/* Top Navigation Bar - Theme Aware */}
            <div className="flex items-center justify-between h-14 border-b border-border bg-background/50 backdrop-blur-md -mx-10 px-10 mb-8 sticky top-0 z-40">
              <div className="flex items-center gap-4 text-xs font-medium">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted lg:hidden"
                  onClick={() => setMobileSidebarOpen(true)}
                >
                  <PanelLeft size={16} />
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Dashboard</span>
                  <ChevronRight size={12} className="text-muted-foreground/30" />
                  <span className="text-foreground">Overview</span>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="relative group hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className="h-9 w-64 bg-secondary/50 border border-input rounded-lg pl-9 pr-12 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium text-foreground"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded border border-input bg-secondary/50 text-[10px] text-muted-foreground font-bold">
                    <span>⌘</span>
                    <span>K</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Theme Toggle */}
                  <div 
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="w-8 h-8 rounded-full bg-secondary/50 border border-input flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    {mounted && (theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />)}
                  </div>

                  <div className="w-8 h-8 rounded-full bg-pink-500 overflow-hidden flex items-center justify-center text-white font-bold text-xs ring-2 ring-border shadow-lg">
                    {user?.profilePicture ? (
                      <img src={user.profilePicture} alt={user?.name || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      (user?.name?.[0] || user?.email?.[0] || 'S').toUpperCase()
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer border border-input">
                    <Bell size={14} />
                  </div>
                </div>
              </div>
            </div>            {/* Welcome Header */}
            <div className="space-y-1 text-left">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Hi, {profileData?.name || user?.name || 'Scholar'} 👋</h1>
              <p className="text-xs text-muted-foreground font-medium">
                {profileData?.fieldOfStudy ? `${profileData.fieldOfStudy} Student` : "Keep track of your scholarship progress here."}
              </p>
            </div>

            {/* Academic Snapshot Card - Theme Aware */}
            <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/5 dark:to-indigo-600/5 border border-blue-500/20 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground tracking-tight">Academic Profile</h4>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mt-0.5">Verified Identity</p>
                </div>
              </div>
              
              <div className="flex items-center gap-12">
                <div className="space-y-1 text-right">
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">CGPA</p>
                  <p className="text-xl font-black text-foreground">{profileData?.cgpa || '---'}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Location</p>
                  <p className="text-xl font-black text-foreground">{profileData?.location || '---'}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Income Proof</p>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{profileData?.incomeLevel?.replace('_', ' ') || 'NOT SET'}</p>
                </div>
              </div>
            </div>

            {/* Summary Cards Grid - Theme Aware */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Scholarships Matched', value: scholarshipCount.toString(), sub: 'Scholarships available', footer: 'Updated live from database', icon: Award },
                { title: 'Applications Sent', value: stats.total.toString(), sub: 'Total submissions', footer: 'Tracked in Applications tab', icon: Layers },
                { title: 'Pending Review', value: stats.pending.toString(), sub: 'Awaiting response', footer: 'Updated by providers', icon: Clock },
                { title: 'Success Rate', value: `${stats.successRate}%`, sub: 'Approval progress', footer: 'Your current acceptance rate', icon: CheckCircle },
              ].map((card, i) => (
                <div key={i} className="bg-card border border-border p-6 rounded-xl hover:shadow-lg dark:hover:border-white/10 transition-all group overflow-hidden relative shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{card.title}</span>
                    <div className="p-2 rounded-lg bg-secondary text-muted-foreground group-hover:bg-blue-500/10 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      <card.icon size={14} />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-foreground mb-6 tracking-tight">{card.value}</div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-foreground font-medium flex items-center gap-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {card.sub}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-tight font-medium">
                      {card.footer}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Content: Chart + Activity */}
            {/* Main Content: Chart + Activity - Theme Aware */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Interactive Bar Chart */}
              <div className="lg:col-span-3 bg-card border border-border rounded-xl p-8 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Application Analysis</h3>
                    <p className="text-[10px] text-muted-foreground font-medium">Live distribution of your submitted requests</p>
                  </div>
                  <div className="flex items-center gap-8 text-right">
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Ongoing</p>
                      <p className="text-xl font-black text-blue-600 dark:text-blue-400">{stats.total}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Approved</p>
                      <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{stats.approved}</p>
                    </div>
                  </div>
                </div>

                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'currentColor', fontSize: 10 }} 
                        className="text-muted-foreground"
                        dy={10}
                      />
                      <YAxis hide />
                      <Tooltip 
                        cursor={{ fill: 'currentColor', radius: 4 }}
                        contentStyle={{ 
                          backgroundColor: 'var(--card)', 
                          border: '1px solid var(--border)', 
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: 'var(--foreground)'
                        }}
                      />
                      <Bar 
                        dataKey="total" 
                        radius={[4, 4, 0, 0]} 
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Applications */}
              <div className="lg:col-span-2 bg-card border border-border rounded-xl p-8 group shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-8 px-2 overflow-hidden flex justify-between items-end">
                  <div>
                    <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Recent Applications</h3>
                    <p className="text-[10px] text-muted-foreground mt-1 font-medium">Your latest scholarship submissions.</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[10px] font-black text-blue-600 dark:text-blue-400 px-0 h-auto uppercase tracking-widest hover:bg-transparent" onClick={() => setActiveTab('applications')}>View All</Button>
                </div>

                <div className="space-y-6">
                  {(!applications || applications.length === 0) ? (
                    <div className="py-10 text-center opacity-40">
                      <Layers size={32} className="mx-auto mb-2 text-muted-foreground" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">No Recent Activity</p>
                    </div>
                  ) : (
                    applications.slice(0, 5).map((app, i) => (
                      <div key={i} className="flex items-center justify-between group/item transition-all hover:translate-x-1">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-lg",
                            app.status === 'APPROVED' ? 'bg-emerald-500' : app.status === 'REJECTED' ? 'bg-rose-500' : 'bg-blue-500'
                          )}>
                            {app.scholarship?.title?.[0] || 'S'}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-black text-foreground group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors truncate w-32 md:w-48 leading-none mb-1">
                              {app.scholarship?.title || 'Scholarship'}
                            </span>
                            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                              {app.status === 'APPROVED' ? 'Grant Awarded' : app.status === 'REJECTED' ? 'Not Selected' : 'In Review'}
                            </span>
                          </div>
                        </div>
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                          app.status === 'APPROVED' ? 'text-emerald-600 border-emerald-500/20 bg-emerald-500/5' : 'text-muted-foreground border-border bg-muted/5'
                        )}>
                          {app.status || 'PENDING'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-background selection:bg-blue-500/30 text-foreground relative isolate">
      {/* Remove the large distracting spotlight and aurora for a cleaner look matches screenshot */}


      <DashboardSidebar 
        onLogout={handleLogout} 
        onTabChange={setActiveTab}
        activeTab={activeTab}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <main className="flex-1 p-6 md:p-10 relative z-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}