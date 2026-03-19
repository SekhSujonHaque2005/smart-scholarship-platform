import React from 'react';

interface LogoProps {
    className?: string;
    showText?: boolean;
}

export function ScholarHubLogo({ className = "w-12 h-10", showText = true }: LogoProps) {
    return (
        <div className="flex items-center gap-2 group">
            {/* 
              This uses the exact PNG provided by the user as a CSS Mask!
              It allows the logo shape to be perfectly 1:1 with their design,
              while painting it with our theme's dynamic glowing gradients.
            */}
            <img 
                src="/sh-official-logo.png" 
                alt="ScholarHub Official Insignia" 
                className={`${className} object-contain transition-transform duration-500 group-hover:scale-110 dark:invert`} 
            />
            
            {showText && (
                <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white ml-0.5">
                    Scholar<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500">Hub</span>
                </span>
            )}
        </div>
    );
}
