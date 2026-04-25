'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ClipboardList, 
  User, 
  Settings, 
  LogOut,
  ChevronRight,
  Bell,
  BookOpen,
  Users,
  Pin,
  PinOff,
  X,
  Wallet,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ScholarHubLogo } from '@/components/ui/logo';
import { useAuthStore } from '@/app/store/auth.store';
import api from '@/app/lib/api';

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
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 cursor-pointer mb-1 group relative",
        active 
          ? "bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-500/20" 
          : "text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-accent/50",
        collapsed && "justify-center px-0"
      )}
      onClick={onClick}
    >
      <Icon size={18} className={cn("transition-colors duration-300 shrink-0", active ? "text-indigo-600 dark:text-indigo-400" : "group-hover:text-indigo-600 dark:group-hover:text-indigo-400")} />
      
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            variants={navItemVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="font-medium text-[13px] whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      
      {active && !collapsed && (
        <motion.div 
          layoutId="active-indicator"
          className="absolute left-0 w-1 h-4 bg-indigo-500 rounded-r-full"
        />
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

export const ProviderSidebar = ({ 
  isOpen, 
  onClose,
  collapsed: externalCollapsed
}: { 
  isOpen?: boolean; 
  onClose?: () => void;
  collapsed?: boolean;
}) => {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('providers/me/profile');
        setProfile(res.data.profile);
      } catch (err) {
        console.error('Failed to fetch sidebar profile:', err);
      }
    };
    fetchProfile();
  }, []);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isExpanded = isMobile ? !!isOpen : (isPinned || isHovered);
  
  const userName = profile?.orgName || user?.name || 'Provider';
  const userEmail = user?.email || (profile as any)?.contactEmail || '';
  const initial = (userName[0] || 'P').toUpperCase();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const sidebarVariants: Variants = {
    expanded: { 
      width: 260, 
      x: 0,
      transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } 
    },
    collapsed: { 
      width: 80, 
      x: isMobile ? -260 : 0,
      transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } 
    },
  };

  const menuSections = [
    {
      title: "Overview",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/provider" },
      ]
    },
    {
      title: "Scholarships",
      items: [
        { icon: BookOpen, label: "My Programs", href: "/dashboard/provider/scholarships" },
        { icon: PlusCircle, label: "Launch New", href: "/dashboard/provider/scholarships/create" },
      ]
    },
    {
      title: "Management",
      items: [
        { icon: Users, label: "Applications", href: "/dashboard/provider/applications" },
        { icon: Star, label: "Reputation Ledger", href: "/dashboard/provider/reviews" },
        { icon: Bell, label: "Notifications", href: "/dashboard/provider/notifications" },
      ]
    },
    {
      title: "Standard",
      items: [
        { icon: User, label: "Profile", href: "/dashboard/provider/profile" },
        { icon: Wallet, label: "Billing & Escrow", href: "/dashboard/provider/billing" },
        { icon: Settings, label: "Settings", href: "/dashboard/provider/settings" },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={isExpanded ? 'expanded' : 'collapsed'}
        variants={sidebarVariants}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        className={cn(
          "h-[100dvh] sticky top-0 bg-background/80 dark:bg-black/40 backdrop-blur-xl border-r border-border flex flex-col z-50 overflow-hidden",
          "fixed lg:sticky lg:translate-x-0 transition-shadow duration-500",
          isExpanded ? "shadow-[20px_0_50px_rgba(0,0,0,0.05)] dark:shadow-[20px_0_50px_rgba(0,0,0,0.3)]" : "shadow-none"
        )}
      >
        {/* Header Decor */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-30" />
        
        {/* Mobile Close Button */}
        {isMobile && isOpen && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        )}

        {/* Pin Button */}
        {!isMobile && (
          <button
            onClick={() => setIsPinned(!isPinned)}
            className={cn(
              "absolute top-5 right-5 z-30 transition-all duration-300 p-1.5 rounded-lg border",
              isExpanded ? "opacity-100" : "opacity-0 pointer-events-none",
              isPinned 
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-500 shadow-sm" 
                : "bg-accent border-border text-muted-foreground hover:text-foreground hover:bg-accent/80"
            )}
            title={isPinned ? "Unquip Sidebar (Hover Mode)" : "Equip Sidebar (Fixed Mode)"}
          >
            {isPinned ? (
              <Pin size={14} className="rotate-45" />
            ) : (
              <PinOff size={14} />
            )}
          </button>
        )}

        {/* Logo Section */}
        <div className={cn(
          "flex h-20 items-center shrink-0 mb-6 relative",
          isExpanded ? "px-6" : "px-0 justify-center"
        )}>
          <Link href="/" className="block">
            <ScholarHubLogo showText={isExpanded} className="w-8 h-8" />
          </Link>
          {isExpanded && (
            <div className="ml-3 flex flex-col">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-tight leading-none mb-1">PROVIDER</span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 tracking-wider leading-none font-medium">Dashboard</span>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 min-h-0 px-3 space-y-8 overflow-y-auto no-scrollbar py-4">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="px-3 mb-3 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-[0.15em] flex items-center gap-2"
                  >
                    <span className="w-1.5 h-[2px] bg-indigo-500 rounded-full" />
                    {section.title}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="space-y-0.5">
                {section.items.map((item, itemIdx) => (
                  <SidebarItem
                    key={itemIdx}
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    active={pathname === item.href}
                    collapsed={!isExpanded}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile / Footer */}
        <div className="p-3 mt-auto border-t border-border dark:border-white/5 bg-accent/30 dark:bg-black/20">
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-xl border border-transparent transition-all duration-300",
            isExpanded ? "hover:bg-accent hover:border-border" : "justify-center"
          )}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px]">
              <div className="w-full h-full rounded-[7px] bg-zinc-900 flex items-center justify-center text-white font-mono text-xs overflow-hidden">
                {profile?.logo || user?.profilePicture ? (
                  <img src={profile?.logo || user?.profilePicture} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  initial
                )}
              </div>
            </div>
            
            {isExpanded && (
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[11px] font-bold text-foreground truncate">{userName}</span>
                <span className="text-[9px] font-mono text-muted-foreground truncate">{userEmail}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 mt-2 rounded-lg transition-all duration-200 text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 group font-medium",
              !isExpanded && "justify-center px-0"
            )}
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            {isExpanded && <span className="text-xs font-medium">Sign Out</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
};
