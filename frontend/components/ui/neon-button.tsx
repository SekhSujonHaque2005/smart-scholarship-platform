import React from 'react';
import { cn } from "@/lib/utils";

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
    activeColor?: string; // Default: amber-400 / #ffdf4e
}

export const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(
    ({ children, className, activeColor = "peer-checked:bg-[#ffdf4e] group-hover:bg-[#ffdf4e]", ...props }, ref) => {
        return (
            <div className="relative inline-block group w-full sm:w-auto">
                {/* 
                    We use a hidden checkbox to maintain the 'active' state if we want, 
                    but for a standard button we'll just trigger the neon glowing effects on hover/active 
                */}
                <button
                    ref={ref}
                    className={cn(
                        "relative z-10 w-full px-8 py-3.5 rounded-2xl bg-neutral-900 border border-neutral-800",
                        "shadow-[2px_2px_10px_rgba(0,0,0,0.5),-2px_-2px_10px_rgba(255,255,255,0.05)]",
                        "active:shadow-[inset_2px_2px_10px_rgba(0,0,0,0.5),inset_-2px_-2px_10px_rgba(255,255,255,0.05)]",
                        "hover:shadow-[inset_2px_2px_10px_rgba(0,0,0,0.5),inset_-2px_-2px_10px_rgba(255,255,255,0.05)]",
                        "cursor-pointer overflow-hidden transition-all flex items-center justify-center gap-2",
                        "text-slate-400 font-bold tracking-wide hover:text-[#ffdf4e] active:text-[#ffdf4e]",
                        className
                    )}
                    {...props}
                >
                    {/* Inner corner rounding */}
                    <div className="absolute inset-0 rounded-2xl pointer-events-none" />
                    
                    {/* Content */}
                    <div className="relative z-20 flex items-center justify-center w-full h-full">
                        {children}
                    </div>

                    {/* LED Indicator - Top Right */}
                    <div className="absolute top-2 right-3 w-1.5 h-1.5 rounded-full bg-neutral-800 transition-all group-hover:bg-[#ffdf4e] group-hover:shadow-[0_0_10px_rgba(255,223,78,0.8),inset_0_1px_2px_white] group-active:bg-[#ffdf4e]" />
                    
                    {/* Background Neon Shines */}
                    <div className="absolute inset-0 z-0 bg-neutral-950 rounded-2xl opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#ffdf4e]/15 to-transparent rounded-2xl" />
                        <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-[#ffdf4e]/5 to-transparent rounded-2xl text-transparent" />
                    </div>
                </button>
                
                {/* External Ambient Glow */}
                <div className="absolute -inset-2 bg-[#ffdf4e]/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-[-1] pointer-events-none" />
            </div>
        );
    }
);
NeonButton.displayName = "NeonButton";
