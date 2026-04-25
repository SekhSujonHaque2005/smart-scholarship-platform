'use client';

import React, { useState } from 'react';
import { ProviderSidebar } from './ProviderSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Search, 
  Menu, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Command
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/app/store/auth.store';
import { NotificationsDropdown } from '../dashboard/NotificationsDropdown';
import { ProfileDropdown } from '../dashboard/ProfileDropdown';
import { ThemeToggle } from '../ui/theme-toggle';
import { GlobalSearch } from './GlobalSearch';
import { useRouter } from 'next/navigation';
import api from '@/app/lib/api';
import { TourGuide } from '../ui/TourGuide';

interface ProviderLayoutProps {
  children: React.ReactNode;
}

export const ProviderLayout = ({ children }: ProviderLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const { user } = useAuthStore();
  const router = useRouter();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('providers/me/profile');
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to fetch provider profile:', err);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 selection:bg-indigo-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full opacity-50 dark:opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full opacity-50 dark:opacity-50" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 dark:opacity-100" />
      </div>

      <div className="flex relative z-10">
        <div id="tour-sidebar">
          <ProviderSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </div>

        <main className="flex-1 flex flex-col min-w-0 min-h-screen">
          {/* Header */}
          <header id="tour-header" className="h-16 sticky top-0 bg-background/60 backdrop-blur-xl border-b border-border px-4 lg:px-8 flex items-center justify-between z-30">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Menu size={20} />
              </button>
              
              <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                <Command size={14} className="text-muted-foreground/60" />
                <span>Provider</span>
                <ChevronRight size={12} className="text-muted-foreground/40" />
                <span className="text-foreground/80">Console</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Trust Score Badge */}
              <div id="tour-trust" className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/50 dark:bg-white/5 border border-border">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-tight font-black">Trust Score: {profile?.trustScore || 0}/100</span>
              </div>

              {/* Utility Actions */}
              <div className="flex items-center bg-accent/50 dark:bg-zinc-900/50 rounded-lg p-0.5 border border-border">
                <button 
                  onClick={() => setShowSearch(true)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-all hover:bg-accent rounded-md"
                >
                  <Search size={18} />
                </button>
                <div className="w-[1px] h-4 bg-border mx-0.5" />
                
                <div className="relative z-50">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-muted-foreground hover:text-foreground transition-all hover:bg-accent rounded-md relative"
                  >
                    <Bell size={18} />
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-500 rounded-full border border-background" />
                  </button>
                  <AnimatePresence>
                    {showNotifications && (
                      <div className="absolute right-0 top-full pt-2 w-80">
                        <NotificationsDropdown 
                          onClose={() => setShowNotifications(false)} 
                          onViewAll={() => router.push('/dashboard/provider/notifications')}
                        />
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="w-[1px] h-4 bg-border mx-0.5" />
                <ThemeToggle />
              </div>

              {/* User Avatar Short with Dropdown */}
              <div className="relative z-50">
                <button 
                  onClick={() => setShowProfile(!showProfile)}
                  className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground hover:border-foreground/20 transition-all font-black overflow-hidden"
                >
                  {profile?.logo ? (
                    <img src={profile.logo} alt={profile.orgName} className="w-full h-full object-cover" />
                  ) : (
                    (profile?.orgName || user?.name || 'P')[0].toUpperCase()
                  )}
                </button>
                <AnimatePresence>
                  {showProfile && (
                    <div className="absolute right-0 top-full pt-2">
                      <ProfileDropdown 
                        onClose={() => setShowProfile(false)} 
                        isProvider={true}
                        customName={profile?.orgName || user?.name}
                        customAvatar={profile?.logo || user?.profilePicture}
                        customRole={profile?.verificationStatus === 'APPROVED' ? "Verified Provider" : "System Provider"}
                        onTabChange={(tab) => {
                          if (tab === 'profile') router.push('/dashboard/provider/profile');
                          if (tab === 'notifications') router.push('/dashboard/provider/notifications');
                          if (tab === 'settings') router.push('/dashboard/provider/settings');
                        }}
                      />
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar relative">
            {/* Ambient Top Light */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
            
            <div className="w-full px-6 lg:px-12 py-8">
              {children}
            </div>
          </div>
          
          {/* Footer Decor */}
          <footer className="h-10 border-t border-border bg-accent/5 backdrop-blur-md flex items-center justify-between px-8">
            <div className="flex items-center gap-4">
              <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Status: All Systems Operational</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-[9px] font-mono text-muted-foreground/40 font-bold">
              © {new Date().getFullYear()} SCHOLARHUB ENTERPRISE. PROPRIETARY SYSTEM.
            </div>
          </footer>
        </main>
      </div>

      <GlobalSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
      <TourGuide />
    </div>
  );
};
