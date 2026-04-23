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
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

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

interface MobileNavHeaderProps {
    children: React.ReactNode;
    className?: string;
}

interface MobileNavMenuProps {
    children: React.ReactNode;
    className?: string;
    isOpen: boolean;
    onClose: () => void;
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
                width: visible ? "90%" : "100%",
                y: visible ? 20 : 0,
            }}
            transition={{
                duration: 0.2,
                ease: "easeOut",
            }}
            style={{
                minWidth: "800px",
            }}
            className={cn(
                "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-full bg-transparent px-4 py-2 lg:flex dark:bg-transparent backdrop-blur-md transition-[backdrop-filter,box-shadow,background-color] duration-300 ease-out",
                visible && "bg-white/60 dark:bg-neutral-950/60 backdrop-blur-xl shadow-[0_0_24px_rgba(34,42,53,0.06),0_1px_1px_rgba(0,0,0,0.05),0_0_0_1px_rgba(34,42,53,0.04),0_0_4px_rgba(34,42,53,0.08),0_16px_68px_rgba(47,48,55,0.05),0_1px_0_rgba(255,255,255,0.1)_inset]",
                className,
            )}
        >
            {children}
        </motion.div>
    );
};

import Link from "next/link";

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Render a lightweight placeholder during SSR to prevent hydration mismatch
    // from Radix NavigationMenu's auto-generated IDs
    if (!mounted) {
        return (
            <div
                className={cn(
                    "hidden flex-1 flex-row items-center justify-center lg:flex",
                    className,
                )}
            >
                <div className="flex space-x-1">
                    {items.map((item, idx) => (
                        <span
                            key={`placeholder-${idx}`}
                            className="inline-flex h-9 items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                            {item.name}
                        </span>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "hidden flex-1 flex-row items-center justify-center lg:flex",
                className,
            )}
        >
            <NavigationMenu viewport={false}>
                <NavigationMenuList className="flex space-x-1">
                    {items.map((item, idx) => (
                        <React.Fragment key={`link-${idx}`}>
                            {item.children && item.children.length > 0 ? (
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger
                                        className={cn(
                                            "bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 rounded-full data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-800/50 data-[state=open]:text-slate-900 dark:data-[state=open]:text-white"
                                        )}
                                    >
                                        {item.name}
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <ul className="min-w-[220px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2 shadow-2xl">
                                            {item.children.map((child, cidx) => (
                                                <li key={cidx}>
                                                    <NavigationMenuLink asChild>
                                                        <Link
                                                            href={child.link}
                                                            onClick={onItemClick}
                                                            className="flex items-start gap-3 rounded-lg p-3 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors group"
                                                        >
                                                            {child.icon && (
                                                                <span className="mt-0.5 text-blue-400 group-hover:text-blue-300 transition-colors">
                                                                    {child.icon}
                                                                </span>
                                                            )}
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">{child.name}</p>
                                                                {child.description && (
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{child.description}</p>
                                                                )}
                                                            </div>
                                                        </Link>
                                                    </NavigationMenuLink>
                                                </li>
                                            ))}
                                        </ul>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                            ) : (
                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild>
                                        <Link
                                            href={item.link}
                                            onClick={onItemClick}
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                "bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 rounded-full"
                                            )}
                                        >
                                            {item.name}
                                        </Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            )}
                        </React.Fragment>
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
                width: visible ? "90%" : "100%",
                y: visible ? 20 : 0,
            }}
            transition={{
                duration: 0.2,
                ease: "easeOut",
            }}
            className={cn(
                "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent backdrop-blur-md px-0 py-2 lg:hidden transition-[backdrop-filter,box-shadow,background-color,padding,border-radius] duration-300 ease-out",
                visible && "bg-white/60 dark:bg-neutral-950/60 backdrop-blur-xl px-3 rounded-sm shadow-[0_0_24px_rgba(34,42,53,0.06),0_1px_1px_rgba(0,0,0,0.05),0_0_0_1px_rgba(34,42,53,0.04),0_0_4px_rgba(34,42,53,0.08),0_16px_68px_rgba(47,48,55,0.05),0_1px_0_rgba(255,255,255,0.1)_inset]",
                !visible && "rounded-[2rem]",
                className,
            )}
        >
            {children}
        </motion.div>
    );
};

export const MobileNavHeader = ({
    children,
    className,
}: MobileNavHeaderProps) => {
    return (
        <div
            className={cn(
                "flex w-full flex-row items-center justify-between",
                className,
            )}
        >
            {children}
        </div>
    );
};

export const MobileNavMenu = ({
    children,
    className,
    isOpen,
    onClose,
}: MobileNavMenuProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                        "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-8 shadow-2xl",
                        className,
                    )}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export const MobileNavToggle = ({
    isOpen,
    onClick,
}: {
    isOpen: boolean;
    onClick: () => void;
}) => {
    return isOpen ? (
        <IconX className="text-slate-700 dark:text-white cursor-pointer" onClick={onClick} />
    ) : (
        <IconMenu2 className="text-slate-700 dark:text-white cursor-pointer" onClick={onClick} />
    );
};

export const NavbarLogo = () => {
    return (
        <a
            href="/"
            className="relative z-20 mr-4 flex items-center px-2 py-1 transition-opacity hover:opacity-90 scale-90 sm:scale-100 origin-left"
        >
            <ScholarHubLogo className="w-8 h-8 md:w-9 md:h-9" showText={true} />
        </a>
    );
};

export const NavbarButton = ({
    href,
    as: Tag = "a",
    children,
    className,
    variant = "primary",
    ...props
}: {
    href?: string;
    as?: React.ElementType;
    children: React.ReactNode;
    className?: string;
    variant?: "primary" | "secondary" | "dark" | "gradient" | "ghost";
} & (
        | React.ComponentPropsWithoutRef<"a">
        | React.ComponentPropsWithoutRef<"button">
    )) => {
    const baseStyles =
        "px-4 py-2 rounded-md button text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center";

    const variantStyles = {
        primary:
            "bg-blue-600 hover:bg-blue-700 text-white shadow-lg",
        secondary: "bg-transparent shadow-none text-slate-300 hover:text-white",
        dark: "bg-black text-white shadow-lg",
        gradient:
            "bg-gradient-to-b from-blue-500 to-blue-700 text-white",
        ghost: "bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
    };

    return (
        <Tag
            href={href || undefined}
            className={cn(baseStyles, variantStyles[variant], className)}
            {...props}
        >
            {children}
        </Tag>
    );
};
