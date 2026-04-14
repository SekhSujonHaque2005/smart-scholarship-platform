'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  LayoutDashboard, 
  Search, 
  ClipboardList, 
  User, 
  Settings, 
  LogOut,
  ChevronRight,
  Bell,
  LayoutGrid,
  Database,
  PanelLeft,
  Pin,
  PinOff,
  Menu,
  X,
  HardDrive,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ScholarHubLogo } from '@/components/ui/logo';
import { useAuthStore } from '@/app/store/auth.store';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon: Icon, label, href, active, collapsed, onClick }: SidebarItemProps) => {
  const navItemVariants = {
    expanded: { opacity: 1, x: 0, transition: { duration: 0.2, delay: 0.1 } },
    collapsed: { opacity: 0, x: -10, transition: { duration: 0.1 } },
  };

  const content = (
    <motion.div
      whileHover={{ backgroundColor: 'var(--sidebar-accent)' }}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 cursor-pointer mb-1 group relative",
        active 
          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
          : "text-sidebar-foreground/60 hover:text-sidebar-foreground",
        collapsed && "justify-center px-0"
      )}
      onClick={onClick}
    >
      <Icon size={20} className={cn("transition-colors duration-300 shrink-0", active ? "text-blue-500 dark:text-blue-400" : "group-hover:text-sidebar-foreground")} />
      
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            variants={navItemVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="font-bold text-sm tracking-tight whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      {!collapsed && (active || label === 'Scholarships' || label === 'Applications' || label === 'Vault') && (
        <div className="ml-auto flex items-center gap-1.5">
          {label === 'Vault' && <div className="px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 text-[8px] font-black uppercase">Secure</div>}
          {(label === 'Scholarships' || label === 'Applications') && <div className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase">Updated</div>}
        </div>
      )}
    </motion.div>
  );

  if (onClick) return content;

  return (
    <Link href={href}>
      {content}
    </Link>
  );
};

export const DashboardSidebar = ({ 
  onLogout, 
  onTabChange, 
  activeTab, 
  isOpen, 
  onClose 
}: { 
  onLogout: () => void;
  onTabChange?: (tab: string) => void;
  activeTab?: string;
  isOpen?: boolean;
  onClose?: () => void;
}) => {
  const { user } = useAuthStore();
  const pathname = usePathname();
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Guard: Don't render sidebar on auth pages
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/reset-password';
  
  if (isAuthPage) return null;

  // On mobile, expanded state is tied strictly to isOpen
  // On desktop, it's tied to hover or pin
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isExpanded = isMobile ? !!isOpen : (isPinned || isHovered);
  
  const userName = user?.name || 'Scholar';
  const userEmail = user?.email || '';
  const initial = (userName[0] || 'S').toUpperCase();

  const sidebarVariants: Variants = {
    expanded: { 
      width: 280, 
      x: 0,
      transition: { duration: 0.3, ease: 'easeInOut' as const } 
    },
    collapsed: { 
      width: 80, 
      x: isMobile ? -280 : 0,
      transition: { duration: 0.3, ease: 'easeInOut' as const } 
    },
  };

  return (
    <motion.aside
      initial={false}
      animate={isExpanded ? 'expanded' : 'collapsed'}
      variants={sidebarVariants}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "h-screen sticky top-0 bg-sidebar backdrop-blur-[32px] border-r border-sidebar-border flex flex-col p-4 z-50 overflow-hidden",
        "shadow-[10px_0_30px_rgba(0,0,0,0.05)] dark:shadow-[20px_0_50px_rgba(0,0,0,0.5)]",
        "fixed lg:sticky lg:translate-x-0"
      )}
    >
      {/* Mobile Close Button */}
      {isOpen && (
        <button 
          onClick={onClose}
          className="lg:hidden absolute top-4 -right-12 w-10 h-10 bg-sidebar border border-sidebar-border rounded-xl flex items-center justify-center text-sidebar-foreground shadow-2xl"
        >
          <X size={20} />
        </button>
      )}

      {/* Pine/Unpin Feature (Equip/Unquip) */}
      <div className="absolute top-4 right-4 z-30">
        <button
          onClick={() => setIsPinned(!isPinned)}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 border",
            isPinned 
              ? "bg-blue-600/10 border-blue-500/20 text-blue-600 dark:text-blue-400 shadow-sm" 
              : "bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          )}
          title={isPinned ? "Unquip Sidebar (Hover Mode)" : "Equip Sidebar (Fixed Mode)"}
        >
          {isPinned ? <Pin size={16} /> : <PinOff size={16} />}
        </button>
      </div>
      {/* Logo Section - Top */}
      <div className={cn("flex h-16 items-center shrink-0 border-b border-sidebar-border mb-6", isExpanded ? "px-6" : "px-0 justify-center")}>
        <Link href="/" className="block group">
          <ScholarHubLogo showText={isExpanded} className="w-8 h-8" mode={isMobile ? 'dark' : undefined} />
        </Link>
      </div>

      {/* Main Menu Sections */}
      <nav className="flex-1 space-y-6 overflow-y-auto no-scrollbar">
        {/* Overview Section */}
        <div className="space-y-1">
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 mb-2 text-[10px] font-black text-sidebar-foreground/40 uppercase tracking-widest overflow-hidden"
              >
                Overview
              </motion.div>
            )}
          </AnimatePresence>
          <SidebarItem
            icon={LayoutDashboard}
            label="Dashboard"
            href="#"
            active={activeTab === 'overview'}
            collapsed={!isExpanded}
            onClick={() => onTabChange?.('overview')}
          />
        </div>

        {/* Workspaces Section */}
        <div className="space-y-1">
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 mb-2 text-[10px] font-black text-sidebar-foreground/40 uppercase tracking-widest overflow-hidden"
              >
                Workspaces
              </motion.div>
            )}
          </AnimatePresence>
          <SidebarItem
            icon={LayoutGrid}
            label="Scholarships"
            href="#"
            active={activeTab === 'scholarships'}
            collapsed={!isExpanded}
            onClick={() => onTabChange?.('scholarships')}
          />
          <SidebarItem
            icon={Database}
            label="Applications"
            href="#"
            active={activeTab === 'applications'}
            collapsed={!isExpanded}
            onClick={() => onTabChange?.('applications')}
          />
          <SidebarItem
            icon={HardDrive}
            label="Vault"
            href="#"
            active={activeTab === 'vault'}
            collapsed={!isExpanded}
            onClick={() => onTabChange?.('vault')}
          />
          <SidebarItem
            icon={Heart}
            label="Wishlist"
            href="#"
            active={activeTab === 'wishlist'}
            collapsed={!isExpanded}
            onClick={() => onTabChange?.('wishlist')}
          />
        </div>



        {/* Account Section */}
        <div className="space-y-1">
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 mb-2 text-[10px] font-black text-sidebar-foreground/40 uppercase tracking-widest overflow-hidden"
              >
                Account
              </motion.div>
            )}
          </AnimatePresence>
          <SidebarItem
            icon={User}
            label="Profile"
            href="#"
            active={activeTab === 'profile'}
            collapsed={!isExpanded}
            onClick={() => onTabChange?.('profile')}
          />
          <SidebarItem
            icon={Settings}
            label="Settings"
            href="#"
            active={activeTab === 'settings'}
            collapsed={!isExpanded}
            onClick={() => onTabChange?.('settings')}
          />
          <SidebarItem
            icon={Bell}
            label="Notifications"
            href="#"
            active={activeTab === 'notifications'}
            collapsed={!isExpanded}
            onClick={() => onTabChange?.('notifications')}
          />
        </div>
      </nav>

      <div className="mt-auto pt-4 border-t border-sidebar-border">
        {isExpanded && (
          <div 
            onClick={() => onTabChange?.('profile')}
            className="flex items-center gap-3 p-2 rounded-xl bg-sidebar-accent/50 mb-4 group cursor-pointer hover:bg-sidebar-accent transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-pink-500 overflow-hidden flex items-center justify-center text-white font-bold text-xs ring-1 ring-white/20">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={userName} className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-xs font-black text-sidebar-foreground truncate">{userName}</span>
              <span className="text-[10px] text-sidebar-foreground/60 font-bold truncate tracking-tight">{userEmail}</span>
            </div>
            <ChevronRight size={14} className="text-sidebar-foreground/30 group-hover:text-sidebar-foreground transition-colors" />
          </div>
        )}
        
        {!isExpanded && (
          <div 
            onClick={() => onTabChange?.('profile')}
            className="w-10 h-10 rounded-lg bg-pink-500 overflow-hidden flex items-center justify-center text-white font-bold text-xs mx-auto mb-4 cursor-pointer"
          >
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={userName} className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </div>
        )}

        <button
          onClick={onLogout}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent group",
          )}
        >
          <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
          {isExpanded && <span className="text-xs font-bold uppercase tracking-widest">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
};
