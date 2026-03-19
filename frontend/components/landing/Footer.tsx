'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ScholarHubLogo } from '@/components/ui/logo';

export default function Footer() {
    const containerRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end end"]
    });

    // Animate the text sliding along the curve
    const textOffset = useTransform(scrollYProgress, [0, 1], ["40%", "50%"]);
    // Parallax the whole SVG up slightly
    const yOffset = useTransform(scrollYProgress, [0, 1], [50, 0]);

    return (
        <footer ref={containerRef} className="relative bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 overflow-hidden border-t border-slate-200 dark:border-white/10 pt-16">
            {/* Massive Brand Typography with Curved SVG textPath */}
            <motion.div style={{ y: yOffset }} className="w-full flex justify-center px-4 md:px-8 mb-12 relative z-10 group pb-4">
                {/* SVG ensures the text scales perfectly edge-to-edge across all screen sizes. Expanded viewBox prevents cutoff. */}
                <svg className="w-full h-auto" viewBox="0 0 1400 300" preserveAspectRatio="xMidYMid meet">
                    {/* Define the curve explicitly to fit inside the 1400px box. */}
                    <path id="footerCurve" d="M 50 250 Q 700 80 1350 250" fill="transparent" />
                    
                    <motion.text 
                        className="text-[170px] font-black font-sans tracking-tighter fill-transparent stroke-slate-300 dark:stroke-white/20 stroke-[3px] group-hover:fill-slate-200 dark:group-hover:fill-white/10 transition-colors duration-1000 ease-out pointer-events-none uppercase"
                    >
                        <motion.textPath href="#footerCurve" textAnchor="middle" style={{ startOffset: textOffset } as any}>
                            ScholarHub
                        </motion.textPath>
                    </motion.text>
                    
                    <motion.text 
                        className="text-[170px] font-black font-sans tracking-tighter fill-slate-900 dark:fill-white group-hover:fill-blue-600 dark:group-hover:fill-blue-500 transition-colors duration-1000 ease-out pointer-events-none uppercase [clip-path:polygon(0_50%,100%_50%,100%_100%,0_100%)]"
                    >
                        <motion.textPath href="#footerCurve" textAnchor="middle" style={{ startOffset: textOffset } as any}>
                            ScholarHub
                        </motion.textPath>
                    </motion.text>
                </svg>
            </motion.div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center mb-6">
                            <ScholarHubLogo className="w-8 h-8 md:w-10 md:h-10" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs">
                            India's smartest scholarship marketplace. Connecting ambitious students with verified institutional funding.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-slate-900 dark:text-white font-bold mb-6 tracking-wide">Students</h4>
                        <ul className="space-y-4">
                            <li><Link href="/scholarships" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium">Browse Scholarships</Link></li>
                            <li><Link href="/register" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium">Create Account</Link></li>
                            <li><Link href="/login" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium">Sign In</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-slate-900 dark:text-white font-bold mb-6 tracking-wide">Providers</h4>
                        <ul className="space-y-4">
                            <li><Link href="/register" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium">Post a Scholarship</Link></li>
                            <li><Link href="/login" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium">Provider Portal</Link></li>
                            <li><Link href="/verification" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium">Verification Process</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-slate-900 dark:text-white font-bold mb-6 tracking-wide">Legal & Company</h4>
                        <ul className="space-y-4">
                            <li><Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium">About Us</Link></li>
                            <li><Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium">Privacy Policy</Link></li>
                            <li><Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-white/10 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-slate-500 text-sm font-medium">
                        © {new Date().getFullYear()} ScholarHub. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link href="#" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Twitter</Link>
                        <Link href="#" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">LinkedIn</Link>
                        <Link href="#" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Instagram</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
