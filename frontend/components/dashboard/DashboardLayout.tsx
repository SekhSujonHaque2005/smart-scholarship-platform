'use client';

import { useState, useEffect } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { NotificationsDropdown } from './NotificationsDropdown';
import { ProfileDropdown } from './ProfileDropdown';
import { useAuthStore } from '@/app/store/auth.store';
import { signOut } from 'next-auth/react';
import { PanelLeft, Search, Bell, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import api from '@/app/lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Guard: Don't render dashboard elements on auth pages
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/reset-password';
  
  if (isAuthPage) return <>{children}</>;

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    // Initial unread count fetch
    const fetchUnread = async () => {
      try {
        const { data } = await api.get('notifications');
        setUnreadCount(data.unreadCount || 0);
      } catch (err) { }
    };
    fetchUnread();
  }, []);

  const handleLogout = () => {
    logout();
    signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="flex min-h-screen bg-background selection:bg-blue-500/30 text-foreground relative isolate font-sans">
      <DashboardSidebar 
        onLogout={handleLogout} 
        onTabChange={() => {}} // Managed via file routes
        activeTab="" 
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <main className="flex-1 p-6 md:p-10 relative z-10 w-full min-h-screen">
        {/* Simple Top Nav for new pages */}
        <div className="flex items-center justify-between h-14 border-b border-sidebar-border bg-background/50 backdrop-blur-md -mx-10 px-10 mb-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-foreground lg:hidden"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <PanelLeft size={16} />
            </Button>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              ScholarHub <div className="w-1 h-1 rounded-full bg-border" /> <span className="text-foreground">System Active</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-8 h-8 rounded-full bg-secondary/50 border border-sidebar-border flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-all hover:bg-secondary"
            >
              {mounted && (theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />)}
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <div 
                onClick={() => setShowNotifications(!showNotifications)}
                className={cn(
                  "w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer transition-all hover:bg-secondary relative",
                  showNotifications ? "bg-secondary border-blue-500/30 text-blue-500" : "bg-secondary/50 border-sidebar-border text-muted-foreground hover:text-foreground"
                )}
              >
                <Bell size={14} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-background animate-bounce-slow">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <AnimatePresence>
                {showNotifications && (
                   <div className="absolute right-0 top-full pt-2">
                     <NotificationsDropdown onClose={() => setShowNotifications(false)} />
                   </div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <div 
                onClick={() => setShowProfile(!showProfile)}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-500/20 group cursor-pointer hover:scale-105 transition-transform ring-2 ring-white/10"
              >
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.[0]?.toUpperCase() || 'S'
                )}
              </div>
              <AnimatePresence>
                {showProfile && (
                   <div className="absolute right-0 top-full pt-2">
                     <ProfileDropdown onClose={() => setShowProfile(false)} />
                   </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
