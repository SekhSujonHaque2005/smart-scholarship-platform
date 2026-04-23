'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useAuthStore } from '@/app/store/auth.store';
import { Button } from '@/components/ui/button';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { ScholarshipList } from '@/components/dashboard/ScholarshipList';
import { ApplicationTracker } from '@/components/dashboard/ApplicationTracker';
import { Profile } from '@/components/dashboard/Profile';
import { Settings } from '@/components/dashboard/Settings';
import { Notifications } from '@/components/dashboard/Notifications';
import { NotificationsDropdown } from '@/components/dashboard/NotificationsDropdown';
import { ProfileDropdown } from '@/components/dashboard/ProfileDropdown';
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
import { DocumentVault } from '@/components/dashboard/DocumentVault';
import { HardDrive } from 'lucide-react';



export default function StudentDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated, logout, updateUser } = useAuthStore();
  const { data: session, status: sessionStatus } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  const [applications, setApplications] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [scholarshipCount, setScholarshipCount] = useState(0);
  const [profileStrength, setProfileStrength] = useState(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isWindows, setIsWindows] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsWindows(navigator.platform.toUpperCase().indexOf('WIN') > -1);
  }, []);

  // Handle Keyboard Shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

        // Fetch profile and scholarships first (no role restriction)
        const [scholarshipsRes, profileRes] = await Promise.all([
          api.get('scholarships'),
          api.get('auth/me')
        ]);
        
        setScholarshipCount(scholarshipsRes.data.scholarships?.length || 0);
        setProfileData(profileRes.data.profile || null);
        setProfileStrength(profileRes.data.profileStrength || 0);
        setMissingFields(profileRes.data.missingFields || []);
        
        // Update global store with latest profile info
        if (profileRes.data.profile) {
          updateUser({
            name: profileRes.data.profile.name,
            profilePicture: profileRes.data.profilePicture
          });
        }

        // Fetch student-specific data separately (requires STUDENT role)
        try {
          const applicationsRes = await api.get('applications/my');
          setApplications(applicationsRes.data.applications || []);
        } catch (appErr: any) {
          // 403 means the user isn't a STUDENT — they'll be redirected shortly
          if (appErr?.response?.status !== 403) {
            console.error('Failed to fetch applications:', appErr);
          }
        }

        // Fetch unread notifications
        try {
          const notifRes = await api.get('notifications');
          setUnreadCount(notifRes.data.unreadCount || 0);
        } catch {
          // Non-critical — silently ignore
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && user?.role === 'STUDENT') {
      fetchData();
    }
  }, [isAuthenticated, user?.role]);

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

  // Redirect if not authenticated or not a student
  useEffect(() => {
    // Wait for hydration AND next-auth session to be determined
    if (!isHydrated || sessionStatus === 'loading') return;

    // Only redirect to login if BOTH stores say we are unauthenticated
    if (!isAuthenticated && sessionStatus === 'unauthenticated') {
      router.push('/login');
    } else if (isAuthenticated && user?.role && user.role !== 'STUDENT') {
      // Redirect to correct dashboard based on role
      const dashboardPath = `/dashboard/${user.role.toLowerCase()}`;
      router.push(dashboardPath);
    }
  }, [isAuthenticated, user?.role, router, isHydrated, sessionStatus]);

  const handleLogout = () => {
    logout();
    signOut({ callbackUrl: '/login' });
  };

  if (!isAuthenticated) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'scholarships':
        return <ScholarshipList searchTerm={globalSearch} />;
      case 'wishlist':
        return <ScholarshipList searchTerm={globalSearch} onlySaved={true} />;
      case 'applications':
        return <ApplicationTracker onDataLoaded={setApplications} />;
      case 'notifications':
        return <Notifications />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      case 'vault':
        return <DocumentVault />;
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
                    ref={searchInputRef}
                    type="text" 
                    placeholder="Search scholarships..." 
                    value={globalSearch}
                    onChange={(e) => {
                      setGlobalSearch(e.target.value);
                      if (activeTab !== 'scholarships' && e.target.value.length > 0) {
                        setActiveTab('scholarships');
                      }
                    }}
                    className="h-9 w-64 bg-secondary/50 border border-input rounded-lg pl-9 pr-12 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium text-foreground"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded border border-input bg-secondary/50 text-[10px] text-muted-foreground font-bold pointer-events-none">
                    <span>{isWindows ? 'Ctrl' : '⌘'}</span>
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

                    <div className="relative">
                      <div 
                        onClick={() => setShowProfile(!showProfile)}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden flex items-center justify-center text-white font-black text-xs ring-2 ring-border shadow-lg cursor-pointer hover:scale-105 transition-transform"
                      >
                        {user?.profilePicture ? (
                          <img src={user.profilePicture} alt={user?.name || 'User'} className="w-full h-full object-cover" />
                        ) : (
                          (user?.name?.[0] || user?.email?.[0] || 'S').toUpperCase()
                        )}
                      </div>
                      <AnimatePresence>
                        {showProfile && (
                          <div className="absolute right-0 top-full pt-2 z-[100]">
                            <ProfileDropdown 
                              onClose={() => setShowProfile(false)} 
                              onTabChange={(tab) => {
                                setActiveTab(tab);
                                setShowProfile(false);
                              }}
                            />
                          </div>
                        )}
                      </AnimatePresence>
                    </div>

                  <div className="relative">
                    <div 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className={cn(
                        "w-8 h-8 rounded-full bg-secondary/50 border flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 group relative",
                        showNotifications ? "bg-secondary border-blue-500/30 text-blue-500" : "border-input text-muted-foreground hover:text-foreground hover:bg-secondary"
                      )}
                    >
                      <Bell size={14} className={cn(showNotifications && "animate-none")} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-background animate-bounce-slow">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <AnimatePresence>
                      {showNotifications && (
                        <div className="absolute right-0 top-full pt-2 z-[100]">
                          <NotificationsDropdown onClose={() => setShowNotifications(false)} />
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
            {/* Welcome Header */}
            <div className="space-y-2 text-left">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Overview
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <span>Welcome back, {profileData?.name || user?.name}</span>
                <div className="h-1 w-1 rounded-full bg-border" />
                <span className="text-blue-600 font-medium">{profileData?.fieldOfStudy ? profileData.fieldOfStudy : "Student"}</span>
              </div>
            </div>
            {/* Profile Strength Meter */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="lg:col-span-2 bg-card border shadow-sm rounded-2xl p-8 relative overflow-hidden group">
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                             <Zap size={20} />
                          </div>
                          <div>
                             <h3 className="text-lg font-semibold">Profile Strength</h3>
                             <p className="text-sm text-muted-foreground">Complete your profile to increase matches</p>
                          </div>
                       </div>
                       <div className="text-3xl font-bold">{profileStrength}%</div>
                    </div>

                    <div className="space-y-2">
                       <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${profileStrength}%` }}
                             transition={{ duration: 1 }}
                             className="h-full bg-blue-600 rounded-full"
                          />
                       </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                       {profileStrength < 100 ? (
                         <div className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => setActiveTab('profile')}>
                            Next step: Add {missingFields[0]} (+10%) <ChevronRight size={16} />
                         </div>
                       ) : (
                         <div className="flex items-center gap-2 text-sm bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg font-medium">
                            <CheckCircle size={16} /> Profile Fully Optimized
                         </div>
                       )}
                    </div>
                  </div>
               </div>

               <div className="bg-card border rounded-2xl p-8 flex flex-col justify-center items-center text-center space-y-4 shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                    <Award size={32} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground">Status Badge</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                       {profileStrength >= 80 ? "Premium Candidate" : "Growing Profile"}
                    </p>
                  </div>
               </div>
            </div>

            {/* Academic Snapshot Card */}
            <div className="bg-card border rounded-2xl p-8 flex flex-wrap items-center justify-between gap-8 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-foreground">Academic Profile</h4>
                  <p className="text-sm text-muted-foreground">Verified Details</p>
                </div>
              </div>
              
              <div className="flex items-center gap-12">
                <div className="space-y-1 text-right">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">CGPA</p>
                  <p className="text-2xl font-bold text-foreground">{profileData?.cgpa || '0.00'}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Location</p>
                  <p className="text-lg font-semibold text-foreground">{profileData?.location || '---'}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Income Level</p>
                  <p className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md">
                    {profileData?.incomeLevel ? profileData.incomeLevel.replace('_', ' ') : 'Not Specified'}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Scholarships Matched', value: scholarshipCount.toString(), sub: 'Available for you', footer: 'Updated live', icon: Award, color: 'blue' },
                { title: 'Applications Sent', value: stats.total.toString(), sub: 'Total submissions', footer: 'Tracked in Apps', icon: Layers, color: 'indigo' },
                { title: 'Pending Review', value: stats.pending.toString(), sub: 'Awaiting response', footer: 'By providers', icon: Clock, color: 'purple' },
                { title: 'Success Rate', value: `${stats.successRate}%`, sub: 'Approval progress', footer: 'Your performance', icon: CheckCircle, color: 'emerald' },
              ].map((card, i) => (
                <div key={i} className="bg-card border p-6 rounded-2xl hover:border-blue-500/30 transition-all group relative overflow-hidden shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-sm font-medium text-muted-foreground">{card.title}</span>
                    <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <card.icon size={18} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-4">{card.value}</div>
                  <div className="space-y-1">
                    <p className="text-sm text-foreground font-medium flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {card.sub}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {card.footer}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Content: Chart + Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
              {/* Interactive Bar Chart */}
              <div className="lg:col-span-3 bg-card border rounded-2xl p-8 relative overflow-hidden shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-foreground">Application Analysis</h3>
                    <p className="text-sm text-muted-foreground">Distribution of your submissions</p>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="space-y-1 text-right">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="space-y-1 text-right">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Approved</p>
                      <p className="text-2xl font-bold text-emerald-600">{stats.approved}</p>
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
                        tick={{ fill: 'currentColor', fontSize: 12 }} 
                        className="text-muted-foreground"
                        dy={10}
                      />
                      <YAxis hide />
                      <Tooltip 
                        cursor={{ fill: 'var(--muted)', opacity: '0.5' }}
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
                      >
                        {chartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.total > 0 ? '#2563eb' : '#e2e8f0'} className="hover:opacity-80 transition-all duration-300" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Applications */}
              <div className="lg:col-span-2 bg-card border rounded-2xl p-8 flex flex-col shadow-sm">
                <div className="mb-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Recent Applications</h3>
                    <p className="text-sm text-muted-foreground">Your latest scholarship submissions</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => setActiveTab('applications')}>View All</Button>
                </div>

                <div className="space-y-4 flex-1">
                  {(!applications || applications.length === 0) ? (
                    <div className="py-12 text-center h-full flex flex-col items-center justify-center text-muted-foreground">
                      <Layers size={32} className="mx-auto mb-3 opacity-50" />
                      <p className="text-sm font-medium">No Recent Activity</p>
                    </div>
                  ) : (
                    applications.slice(0, 5).map((app, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold",
                            app.status === 'APPROVED' ? 'bg-emerald-500' : app.status === 'REJECTED' ? 'bg-rose-500' : 'bg-blue-500'
                          )}>
                            {app.scholarship?.title?.[0] || 'S'}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-foreground truncate w-32 md:w-48">
                              {app.scholarship?.title || 'Scholarship'}
                            </span>
                            <span className="text-xs text-muted-foreground font-medium">
                              {app.status === 'APPROVED' ? 'Grant Awarded' : app.status === 'REJECTED' ? 'Not Selected' : 'In Review'}
                            </span>
                          </div>
                        </div>
                        <span className={cn(
                          "text-xs font-medium px-2.5 py-1 rounded-md",
                          app.status === 'APPROVED' ? 'text-emerald-700 bg-emerald-50' : 'text-muted-foreground bg-muted'
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

      <main className="flex-1 p-6 md:p-10 relative z-10">
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