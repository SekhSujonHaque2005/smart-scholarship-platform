"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch — only render after client mount
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const themes = [
        { name: "light", icon: Sun, label: "Light" },
        { name: "dark", icon: Moon, label: "Dark" },
        { name: "system", icon: Monitor, label: "System" },
    ] as const;

    return (
        <div
            className={cn(
                "flex items-center rounded-full border border-slate-700 bg-slate-900/60 p-1 gap-0.5",
                className
            )}
        >
            {themes.map(({ name, icon: Icon, label }) => (
                <button
                    key={name}
                    title={label}
                    aria-label={`Switch to ${label} theme`}
                    onClick={() => setTheme(name)}
                    className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200",
                        theme === name
                            ? "bg-blue-600 text-white shadow"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/60"
                    )}
                >
                    <Icon size={14} />
                </button>
            ))}
        </div>
    );
}
