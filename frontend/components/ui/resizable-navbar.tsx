"use client";
import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
    motion,
    AnimatePresence,
    useScroll,
    useMotionValueEvent,
} from "motion/react";

import React, { useEffect, useRef, useState } from "react";
import { ScholarHubLogo } from "@/components/ui/logo";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import Link from "next/link";

interface NavbarProps {
    children: React.ReactNode;
    className?: string;
}

interface NavBodyProps {
    children: React.ReactNode;
    className?: string;
    visible?: boolean;
}

interface NavSubItem {
    name: string;
    link: string;
    description?: string;
    icon?: React.ReactNode;
}

interface NavItemsProps {
    items: {
        name: string;
        link: string;
        children?: NavSubItem[];
    }[];
    className?: string;
    onItemClick?: () => void;
}

interface MobileNavProps {
    children: React.ReactNode;
    className?: string;
    visible?: boolean;
}

export const Navbar = ({ children, className }: NavbarProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });
    const [visible, setVisible] = useState<boolean>(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > 100) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    });

    return (
        <motion.div
            ref={ref}
            className={cn("fixed inset-x-0 top-0 z-40 w-full", className)}
        >
            {React.Children.map(children, (child) =>
                React.isValidElement(child)
                    ? React.cloneElement(
                        child as React.ReactElement<{ visible?: boolean }>,
                        { visible },
                    )
                    : child,
            )}
        </motion.div>
    );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
    return (
        <motion.div
            animate={{
                width: visible ? "95%" : "100%",
                y: visible ? 15 : 0,
            }}
            className={cn(
                "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between bg-transparent px-8 py-4 lg:flex backdrop-blur-md transition-all duration-300 italic",
                visible && "bg-background border border-border shadow-2xl rounded-none",
                className,
            )}
        >
            {children}
        </motion.div>
    );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="hidden lg:flex flex-1" />;

    return (
        <div className={cn("hidden flex-1 flex-row items-center justify-center lg:flex", className)}>
            <NavigationMenu viewport={false}>
                <NavigationMenuList className="flex space-x-2">
                    {items.map((item, idx) => (
                        <NavigationMenuItem key={idx}>
                            {item.children ? (
                                <>
                                    <NavigationMenuTrigger className="bg-transparent text-foreground hover:bg-secondary font-bold text-sm italic rounded-none px-4 h-10 transition-all">
                                        {item.name}
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <ul className="w-[400px] grid grid-cols-2 gap-2 p-4 bg-background border border-border rounded-none shadow-2xl">
                                            {item.children.map((child, cidx) => (
                                                <li key={cidx}>
                                                    <NavigationMenuLink asChild>
                                                        <Link
                                                            href={child.link}
                                                            onClick={onItemClick}
                                                            className="flex flex-col gap-1 rounded-none p-3 hover:bg-secondary transition-all"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-primary">{child.icon}</span>
                                                                <p className="text-sm font-bold italic">{child.name}</p>
                                                            </div>
                                                            <p className="text-[11px] text-muted-foreground italic leading-tight">{child.description}</p>
                                                        </Link>
                                                    </NavigationMenuLink>
                                                </li>
                                            ))}
                                        </ul>
                                    </NavigationMenuContent>
                                </>
                            ) : (
                                <NavigationMenuLink asChild>
                                    <Link href={item.link} className="px-4 py-2 text-sm font-bold italic hover:bg-secondary rounded-none transition-all">
                                        {item.name}
                                    </Link>
                                </NavigationMenuLink>
                            )}
                        </NavigationMenuItem>
                    ))}
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
    return (
        <motion.div
            animate={{
                width: visible ? "95%" : "100%",
                y: visible ? 15 : 0,
            }}
            className={cn(
                "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent backdrop-blur-md px-6 py-3 lg:hidden transition-all duration-300 italic",
                visible && "bg-background border border-border shadow-2xl rounded-none",
                className,
            )}
        >
            {children}
        </motion.div>
    );
};

export const MobileNavHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn("flex w-full flex-row items-center justify-between", className)}>{children}</div>
);

export const MobileNavMenu = ({ children, isOpen, className }: { children: React.ReactNode; isOpen: boolean; onClose: () => void; className?: string }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn("absolute inset-x-0 top-20 z-50 flex w-full flex-col items-start gap-4 rounded-none bg-background border border-border p-6 shadow-2xl", className)}
            >
                {children}
            </motion.div>
        )}
    </AnimatePresence>
);

export const MobileNavToggle = ({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) => (
    <div onClick={onClick} className="cursor-pointer">
        {isOpen ? <IconX className="text-foreground" /> : <IconMenu2 className="text-foreground" />}
    </div>
);

export const NavbarLogo = () => (
    <a href="/" className="relative z-20 flex items-center transition-opacity hover:opacity-90">
        <ScholarHubLogo className="w-8 h-8" showText={true} />
    </a>
);

export const NavbarButton = ({ href, children, className, variant = "primary", as: Tag = "a", ...props }: any) => {
    const base = "px-4 py-2 rounded-none text-sm font-bold italic transition-all text-center";
    const variants: any = {
        primary: "bg-foreground text-background hover:bg-foreground/90",
        ghost: "bg-transparent text-foreground hover:bg-secondary",
    };
    return (
        <Tag href={href} className={cn(base, variants[variant], className)} {...props}>
            {children}
        </Tag>
    );
};
