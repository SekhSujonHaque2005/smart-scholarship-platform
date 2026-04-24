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
            <div className={cn(className, "relative shrink-0 flex items-center justify-center")}>
                <img 
                    src="/sh-official-logo.png" 
                    alt="ScholarHub Official Logo" 
                    className="object-contain transition-transform duration-500 group-hover:scale-110 grayscale brightness-200" 
                />
            </div>
            
            <AnimatePresence>
                {showText && (
                    <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className={cn(
                            "font-serif font-bold text-2xl tracking-tighter ml-0.5 whitespace-nowrap overflow-hidden transition-colors italic",
                            mode === 'dark' ? "text-white" : "text-foreground"
                        )}
                    >
                        Scholar<span className="text-primary">Hub</span>
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
    );
}
