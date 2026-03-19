"use client";
import {
    Navbar,
    NavBody,
    NavItems,
    MobileNav,
    NavbarLogo,
    NavbarButton,
    MobileNavHeader,
    MobileNavToggle,
    MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import Link from "next/link";
import {
    BookOpen,
    GraduationCap,
    Search,
    Star,
    Building2,
    ShieldCheck,
    Zap,
    Bell,
    BarChart3,
    PenSquare,
    FileText,
    Megaphone,
    BookMarked,
    ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { NeonButton } from "@/components/ui/neon-button";

export default function ResizableNavbar() {
    const navItems = [
        {
            name: "Scholarships",
            link: "/scholarships",
            children: [
                {
                    name: "Browse All",
                    link: "/scholarships",
                    description: "Explore thousands of scholarships from top providers",
                    icon: <Search size={16} />,
                },
                {
                    name: "Recommended For You",
                    link: "/scholarships/recommended",
                    description: "AI-matched scholarships based on your profile",
                    icon: <Star size={16} />,
                },
                {
                    name: "By Category",
                    link: "/scholarships/categories",
                    description: "Merit, need-based, STEM, arts, and more",
                    icon: <BookMarked size={16} />,
                },
                {
                    name: "Apply Now",
                    link: "/scholarships/apply",
                    description: "Start or continue your scholarship application",
                    icon: <GraduationCap size={16} />,
                },
            ],
        },
        {
            name: "Providers",
            link: "/providers",
            children: [
                {
                    name: "All Providers",
                    link: "/providers",
                    description: "Discover verified scholarship providers",
                    icon: <Building2 size={16} />,
                },
                {
                    name: "Verified Providers",
                    link: "/providers/verified",
                    description: "Only legitimate, background-checked organizations",
                    icon: <ShieldCheck size={16} />,
                },
                {
                    name: "Provider Dashboard",
                    link: "/providers/dashboard",
                    description: "Manage your scholarships and applicants",
                    icon: <BarChart3 size={16} />,
                },
            ],
        },
        {
            name: "Features",
            link: "/#features",
            children: [
                {
                    name: "AI Matching",
                    link: "/#features",
                    description: "Smart algorithm that finds your best scholarship fit",
                    icon: <Zap size={16} />,
                },
                {
                    name: "Real-Time Tracking",
                    link: "/#features",
                    description: "Track application status and get instant updates",
                    icon: <Bell size={16} />,
                },
                {
                    name: "Analytics Dashboard",
                    link: "/#features",
                    description: "Deep insights on your applications and progress",
                    icon: <BarChart3 size={16} />,
                },
            ],
        },
        {
            name: "Blogs",
            link: "/blogs",
            children: [
                {
                    name: "Write a Blog",
                    link: "/blogs/new",
                    description: "Share your scholarship journey and tips",
                    icon: <PenSquare size={16} />,
                },
                {
                    name: "Documentation",
                    link: "/blogs/docs",
                    description: "Guides, how-tos, and platform documentation",
                    icon: <FileText size={16} />,
                },
                {
                    name: "Announcements",
                    link: "/blogs/announcements",
                    description: "Latest updates and news from ScholarHub",
                    icon: <Megaphone size={16} />,
                },
                {
                    name: "All Articles",
                    link: "/blogs",
                    description: "Browse all community articles and posts",
                    icon: <BookOpen size={16} />,
                },
            ],
        },
    ];

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="relative w-full">
            <Navbar>
                {/* Desktop Navigation */}
                <NavBody>
                    <NavbarLogo />
                    <NavItems items={navItems} />
                    <div className="flex shrink-0 items-center justify-center gap-2 whitespace-nowrap">
                        <AnimatedThemeToggler />
                        <NavbarButton as={Link} href="/login" variant="ghost">Sign In</NavbarButton>
                        <Link href="/register">
                            <NeonButton className="px-5 py-2 w-auto h-[38px] rounded-xl text-sm shadow-[1px_1px_5px_rgba(0,0,0,0.5),-1px_-1px_5px_rgba(255,255,255,0.05)]">
                                Get Started
                            </NeonButton>
                        </Link>
                    </div>
                </NavBody>

                {/* Mobile Navigation */}
                <MobileNav>
                    <MobileNavHeader>
                        <NavbarLogo />
                        <MobileNavToggle
                            isOpen={isMobileMenuOpen}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        />
                    </MobileNavHeader>

                    <MobileNavMenu
                        isOpen={isMobileMenuOpen}
                        onClose={() => setIsMobileMenuOpen(false)}
                    >
                        {navItems.map((item, idx) => (
                            <div key={`mobile-section-${idx}`} className="w-full">
                                {item.children && item.children.length > 0 ? (
                                    <MobileDropdownSection
                                        item={item}
                                        onClose={() => setIsMobileMenuOpen(false)}
                                    />
                                ) : (
                                    <a
                                        href={item.link}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="relative text-slate-300 hover:text-white py-2 block"
                                    >
                                        {item.name}
                                    </a>
                                )}
                            </div>
                        ))}
                        <div className="flex w-full items-center justify-between mt-2 py-2 border-t border-slate-700">
                            <span className="text-sm text-slate-400">Theme</span>
                            <AnimatedThemeToggler />
                        </div>
                        <div className="flex w-full flex-col gap-4 mt-2">
                            <NavbarButton
                                as={Link}
                                href="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                variant="ghost"
                                className="w-full border border-slate-700"
                            >
                                Sign In
                            </NavbarButton>
                            <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                                <NeonButton className="w-full py-3 h-auto rounded-xl shadow-[1px_1px_5px_rgba(0,0,0,0.5),-1px_-1px_5px_rgba(255,255,255,0.05)] text-sm">
                                    Get Started
                                </NeonButton>
                            </Link>
                        </div>
                    </MobileNavMenu>
                </MobileNav>
            </Navbar>
        </div>
    );
}

// Mobile accordion dropdown section
function MobileDropdownSection({
    item,
    onClose,
}: {
    item: { name: string; link: string; children?: { name: string; link: string; description?: string; icon?: React.ReactNode }[] };
    onClose: () => void;
}) {
    const [open, setOpen] = useState(false);
    return (
        <div className="w-full">
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between py-2 text-slate-300 hover:text-white transition-colors"
            >
                <span className="font-medium">{item.name}</span>
                <ChevronDown
                    size={16}
                    className={cn("transition-transform duration-200", open && "rotate-180")}
                />
            </button>
            {open && (
                <div className="ml-3 mt-1 border-l border-slate-700 pl-3 flex flex-col gap-1">
                    {item.children?.map((child, cidx) => (
                        <Link
                            key={cidx}
                            href={child.link}
                            onClick={onClose}
                            className="flex items-center gap-2 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            {child.icon && <span className="text-blue-400">{child.icon}</span>}
                            {child.name}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
