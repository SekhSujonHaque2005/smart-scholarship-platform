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
    Building2,
    ShieldCheck,
    Zap,
    ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export default function ResizableNavbar() {
    const navItems = [
        {
            name: "Scholarships",
            link: "/scholarships",
            children: [
                {
                    name: "Browse All",
                    link: "/scholarships",
                    description: "Explore all verified grants",
                    icon: <Search size={16} />,
                },
                {
                    name: "AI Matched",
                    link: "/scholarships/recommended",
                    description: "Tailored to your profile",
                    icon: <Zap size={16} />,
                },
            ],
        },
        {
            name: "Providers",
            link: "/providers",
            children: [
                {
                    name: "Verified",
                    link: "/providers/verified",
                    description: "Trusted organizations only",
                    icon: <ShieldCheck size={16} />,
                },
                {
                    name: "Submit Award",
                    link: "/providers/dashboard",
                    description: "Post a new scholarship",
                    icon: <Building2 size={16} />,
                },
            ],
        },
        {
            name: "Resources",
            link: "/community",
            children: [
                {
                    name: "Community",
                    link: "/community",
                    description: "Student stories and tips",
                    icon: <BookOpen size={16} />,
                },
                {
                    name: "Guides",
                    link: "/guides",
                    description: "How to win awards",
                    icon: <GraduationCap size={16} />,
                },
            ],
        },
    ];

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="relative w-full z-[100]">
            <Navbar>
                <NavBody className="rounded-none">
                    <NavbarLogo />
                    <NavItems items={navItems} />
                    <div className="flex shrink-0 items-center justify-center gap-3">
                        <AnimatedThemeToggler />
                        <NavbarButton as={Link} href="/login" variant="ghost" className="italic rounded-none">Sign In</NavbarButton>
                        <Link href="/register">
                            <button className="px-6 py-2 bg-foreground text-background font-bold rounded-none text-sm italic hover:bg-foreground/90 transition-all">
                                Get Started
                            </button>
                        </Link>
                    </div>
                </NavBody>

                <MobileNav>
                    <MobileNavHeader className="rounded-none">
                        <NavbarLogo />
                        <MobileNavToggle
                            isOpen={isMobileMenuOpen}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        />
                    </MobileNavHeader>

                    <MobileNavMenu
                        isOpen={isMobileMenuOpen}
                        onClose={() => setIsMobileMenuOpen(false)}
                        className="rounded-none"
                    >
                        {navItems.map((item, idx) => (
                            <div key={`mobile-section-${idx}`} className="w-full">
                                <MobileDropdownSection
                                    item={item}
                                    onClose={() => setIsMobileMenuOpen(false)}
                                />
                            </div>
                        ))}
                        <div className="flex w-full flex-col gap-4 mt-6 pt-6 border-t border-border">
                            <NavbarButton
                                as={Link}
                                href="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                variant="ghost"
                                className="w-full italic rounded-none"
                            >
                                Sign In
                            </NavbarButton>
                            <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                                <button className="w-full py-3 bg-foreground text-background font-bold rounded-none text-sm italic">
                                    Get Started
                                </button>
                            </Link>
                        </div>
                    </MobileNavMenu>
                </MobileNav>
            </Navbar>
        </div>
    );
}

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
                className="flex w-full items-center justify-between py-3 text-foreground hover:opacity-70 transition-all"
            >
                <span className="font-bold italic">{item.name}</span>
                <ChevronDown
                    size={16}
                    className={cn("transition-transform duration-200", open && "rotate-180")}
                />
            </button>
            {open && (
                <div className="ml-4 flex flex-col gap-2">
                    {item.children?.map((child, cidx) => (
                        <Link
                            key={cidx}
                            href={child.link}
                            onClick={onClose}
                            className="flex items-center gap-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-all italic"
                        >
                            {child.name}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
