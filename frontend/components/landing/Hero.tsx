'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, CheckCircle2, Search, SlidersHorizontal, ChevronRight, ShieldCheck, GraduationCap } from 'lucide-react';
import api from '@/app/lib/api';
import TextType from '@/components/TextType';
import { SpotlightBackground } from '@/components/ui/spotlight-background';
import VariableProximity from '@/components/VariableProximity';

interface PlatformStats {
    totalStudents: number;
    activeScholarships: number;
    totalAwarded: number;
}

function formatStat(num: number): string {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr+`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(0)}L+`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K+`;
    if (num === 0) return '0';
    return num.toString();
}

function formatAwarded(num: number): string {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr+`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(0)}L+`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K+`;
    if (num === 0) return '₹0';
    return `₹${num}`;
}

// Custom snapy easing for Vercel/Linear feel
const SNAP_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function Hero() {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Mouse tracking for 3D card tilt
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);

    const springConfig = { damping: 30, stiffness: 200, mass: 0.5 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    const rotateX = useTransform(springY, [0, 1], [5, -5]);
    const rotateY = useTransform(springX, [0, 1], [-5, 5]);

    useEffect(() => {
        api.get('stats')
            .then((res) => setStats(res.data))
            .catch((err) => console.error('Failed to fetch stats:', err));
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const xPos = (e.clientX - rect.left) / rect.width;
        const yPos = (e.clientY - rect.top) / rect.height;
        mouseX.set(xPos);
        mouseY.set(yPos);
    };

    const handleMouseLeave = () => {
        mouseX.set(0.5);
        mouseY.set(0.5);
    };

    const statItems = stats
        ? [
            { value: formatStat(stats.totalStudents), label: 'Students' },
            { value: stats.activeScholarships.toString(), label: 'Scholarships' },
            { value: formatAwarded(stats.totalAwarded), label: 'Awarded' },
        ]
        : [
            { value: '—', label: 'Students' },
            { value: '—', label: 'Scholarships' },
            { value: '—', label: 'Awarded' },
        ];

    return (
        <SpotlightBackground>
            <section 
                ref={containerRef}
                className="relative flex flex-col items-center justify-start px-6 pt-32 pb-20 md:pt-40 overflow-hidden min-h-screen"
            >


            <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
                
                {/* 1. Snappy Staggered Entrance Container */}
                <motion.div 
                    initial="hidden" 
                    animate="visible" 
                    variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
                    }}
                    className="flex flex-col items-center text-center max-w-4xl"
                >
                    {/* Badge */}
                    <motion.div 
                        variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
                        transition={{ duration: 0.5, ease: SNAP_EASE }}
                        className="mb-8"
                    >
                        <Link href="/matching-engine" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-background hover:bg-muted transition-colors group cursor-pointer shadow-sm">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20">
                                <Sparkles className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                            </span>
                            <span className="text-xs font-medium text-muted-foreground tracking-wide group-hover:text-foreground transition-colors">Introducing AI Matching 2.0</span>
                            <ArrowRight size={14} className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                        </Link>
                    </motion.div>

                    {/* Title */}
                    <div className="relative" ref={useRef(null)}>
                        <motion.h1 
                            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                            transition={{ duration: 0.6, ease: SNAP_EASE }}
                            className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-[-0.03em] leading-[1.05] text-foreground mb-6 drop-shadow-sm min-h-[2.1em] md:min-h-[auto]"
                        >
                            <VariableProximity
                                label="Find scholarships matching"
                                containerRef={containerRef}
                                radius={150}
                                fromScale={1}
                                toScale={1.2}
                                fromWeight={700}
                                toWeight={900}
                                className="block"
                            />
                            <br className="hidden md:block" />
                            <TextType
                                text={[
                                    "your exact profile.",
                                    "your academic journey.",
                                    "your future success.",
                                    "your dream career."
                                ]}
                                className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400"
                                cursorClassName="bg-emerald-500 w-[4px] md:w-[6px] h-[0.9em] translate-y-[0.1em]"
                                typingSpeed={80}
                                deletingSpeed={50}
                                pauseDuration={3000}
                                loop={true}
                            />
                        </motion.h1>
                    </div>

                    {/* Subtitle */}
                    <motion.div 
                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                        transition={{ duration: 0.6, ease: SNAP_EASE }}
                        className="mb-10"
                    >
                        <TextType 
                            text="ScholarHub uses a data-driven engine to connect verified students with premium educational grants across India. Apply instantly."
                            className="text-lg md:text-xl text-muted-foreground font-normal tracking-tight max-w-2xl leading-relaxed"
                            typingSpeed={20}
                            showCursor={true}
                            cursorClassName="bg-muted-foreground/30 w-[2px] h-[1.1em] translate-y-[0.15em]"
                            loop={false}
                            startOnVisible={true}
                        />
                    </motion.div>

                    {/* Buttons */}
                    <motion.div 
                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                        transition={{ duration: 0.6, ease: SNAP_EASE }}
                        className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
                    >
                        <Link href="/register" className="w-full sm:w-auto">
                            <Button className="w-full sm:w-auto h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm rounded-lg transition-all shadow-lg dark:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                                Start Building Profile
                            </Button>
                        </Link>
                        <Link href="/scholarships" className="w-full sm:w-auto">
                            <Button variant="outline" className="w-full sm:w-auto h-12 px-8 bg-transparent text-foreground border-border hover:bg-accent hover:border-accent-foreground/20 font-semibold text-sm rounded-lg transition-all">
                                View Scholarships <ChevronRight className="ml-1 w-4 h-4 text-muted-foreground" />
                            </Button>
                        </Link>
                    </motion.div>
                </motion.div>

                {/* 2. Advanced 3D Interactive Dashboard Mockup (Linear/Vercel Aesthetic) */}
                <motion.div 
                    initial={{ opacity: 0, y: 60, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.9, delay: 0.2, ease: SNAP_EASE }}
                    className="w-full mt-24 relative perspective-[2000px]"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    {/* Underlying Subtle Glow - Purely structured, no AI-blob look */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[50%] bg-blue-500/10 blur-[100px] pointer-events-none rounded-[100%]" />

                    {/* The 3D Rotatable Stack */}
                    <motion.div
                        style={{
                            rotateX,
                            rotateY,
                            transformStyle: "preserve-3d",
                        }}
                        className="relative w-full max-w-5xl mx-auto rounded-[20px] bg-card border border-border shadow-2xl dark:shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] flex flex-col will-change-transform overflow-hidden"
                    >
                        {/* Fake Browser/App Header */}
                        <div className="h-12 w-full border-b border-border flex items-center px-4 bg-muted/30">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-[#333]" />
                                <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-[#333]" />
                                <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-[#333]" />
                            </div>
                            <div className="mx-auto flex items-center gap-2 px-3 py-1.5 rounded-md bg-background border border-border w-64 shadow-sm">
                                <Search className="w-3 h-3 text-muted-foreground" />
                                <span className="text-[11px] text-muted-foreground font-mono tracking-tight">scholarhub.in/discover</span>
                            </div>
                        </div>

                        {/* Interactive Hero Content Area */}
                        <div className="p-8 md:p-12 flex flex-col lg:flex-row gap-10">
                            
                            {/* Left: The "Quick Eligibility" Interactive Module */}
                            <div className="w-full lg:w-1/3 flex flex-col gap-6" style={{ transform: "translateZ(30px)" }}>
                                <div className="space-y-2">
                                    <h3 className="text-foreground font-medium text-lg">Quick Eligibility</h3>
                                    <p className="text-muted-foreground text-sm">Find exactly what you qualify for.</p>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">Field of Study</label>
                                        <div className="h-10 w-full bg-background border border-border rounded-md flex items-center px-3 cursor-pointer hover:bg-accent transition-colors shadow-sm">
                                            <span className="text-foreground text-sm">Computer Science</span>
                                            <SlidersHorizontal className="w-4 h-4 text-muted-foreground ml-auto" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">Current Degree</label>
                                        <div className="h-10 w-full bg-background border border-border rounded-md flex items-center px-3 cursor-pointer hover:bg-accent transition-colors shadow-sm">
                                            <span className="text-foreground text-sm">B.Tech (Year 3)</span>
                                            <SlidersHorizontal className="w-4 h-4 text-muted-foreground ml-auto" />
                                        </div>
                                    </div>
                                    
                                    {/* Action button in the mockup */}
                                    <button className="w-full h-10 mt-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-md shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-colors flex items-center justify-center gap-2">
                                        Scan Library 
                                        <span className="flex h-1.5 w-1.5 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Right: Feed of highly structured result cards */}
                            <div className="w-full lg:w-2/3 flex flex-col gap-3" style={{ transform: "translateZ(10px)" }}>
                                <div className="flex items-center justify-between pb-2 border-b border-border mb-2">
                                    <span className="text-muted-foreground text-xs font-mono uppercase">Results (1,204)</span>
                                    <div className="flex gap-2">
                                        <span className="text-[10px] px-2 py-1 bg-accent text-accent-foreground rounded border border-border shadow-sm">Relevance</span>
                                    </div>
                                </div>

                                {/* Mock Card 1 */}
                                <motion.div 
                                    whileHover={{ scale: 1.01 }}
                                    className="p-4 bg-background border border-border rounded-xl flex items-start gap-4 cursor-pointer transition-colors hover:bg-accent/50 shadow-sm"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                                        <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-foreground text-sm font-semibold truncate">Women in STEM Grant 2024</h4>
                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase">Match 98%</span>
                                        </div>
                                        <p className="text-muted-foreground text-xs line-clamp-1 mb-3">Supporting female tech leaders focused on cloud infrastructure and AI.</p>
                                        
                                        <div className="flex items-center gap-4 text-[11px]">
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" /> Verified
                                            </div>
                                            <div className="text-blue-600 dark:text-blue-400 font-mono">₹5,00,000</div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Mock Card 2 */}
                                <motion.div 
                                    whileHover={{ scale: 1.01 }}
                                    className="p-4 bg-background border border-border rounded-xl flex items-start gap-4 cursor-pointer transition-colors hover:bg-accent/50 shadow-sm"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                                        <Sparkles className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-foreground text-sm font-semibold truncate">National Merit Engineering Scholarship</h4>
                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase">Match 92%</span>
                                        </div>
                                        <p className="text-muted-foreground text-xs line-clamp-1 mb-3">Awarded to top performers in core engineering disciplines nation-wide.</p>
                                        
                                        <div className="flex items-center gap-4 text-[11px]">
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" /> Verified
                                            </div>
                                            <div className="text-blue-600 dark:text-blue-400 font-mono">₹2,50,000</div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Fade Out Bottom */}
                                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent pointer-events-none rounded-b-[20px]" />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Optional: Status Text below Dashboard */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 1 }}
                    className="mt-8 flex items-center gap-2 text-muted-foreground text-[11px] font-mono tracking-tight"
                >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-500" /> System Operational. Engine running at 60ms latency.
                </motion.div>
                
            </div>

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background/80 to-transparent pointer-events-none z-20" />
        </section>
        </SpotlightBackground>
    );
}

