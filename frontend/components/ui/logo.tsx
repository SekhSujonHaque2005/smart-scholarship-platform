import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
    showText?: boolean;
    mode?: 'light' | 'dark';
}

export function ScholarHubLogo({ className = "w-10 h-10", showText = true, mode }: LogoProps) {
    return (
        <div className="flex items-center gap-3 group">
            <img 
                src="/sh-official-logo.png" 
                alt="ScholarHub Official Logo" 
                className={cn(className, "object-contain transition-transform duration-500 group-hover:scale-110 shrink-0")} 
            />
            
            <AnimatePresence>
                {showText && (
                    <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className={cn(
                            "font-serif font-black text-2xl tracking-tighter ml-0.5 drop-shadow-sm whitespace-nowrap overflow-hidden transition-colors",
                            mode === 'dark' ? "text-white" : "text-foreground"
                        )}
                    >
                        Scholar<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Hub</span>
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
    );
}
