'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import { NeonButton } from '@/components/ui/neon-button';
import { ArrowRight, Sparkles, Zap, ShieldCheck, GraduationCap } from 'lucide-react';
import api from '@/app/lib/api';

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

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [stats, setStats] = useState<PlatformStats | null>(null);

    useEffect(() => {
        api.get('stats')
            .then((res) => setStats(res.data))
            .catch((err) => console.error('Failed to fetch stats:', err));
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();
            tl.fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
                .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.2')
                .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
                .fromTo('.hero-buttons', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2')
                .fromTo('.hero-image', { opacity: 0, scale: 0.95, y: 40 }, { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'power3.out' }, '-=0.1')
                .fromTo('.hero-stats', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }, '-=0.4');
        }, containerRef);
        return () => ctx.revert();
    }, []);

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
        <section
            ref={containerRef}
            className="relative flex flex-col items-center justify-start px-6 pt-32 pb-20 md:pt-40 overflow-hidden min-h-screen"
        >
            {/* Cinematic Aurora Background — CSS only, no parallax */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-blue-600/15 blur-[140px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute top-[30%] right-[-5%] w-[600px] h-[600px] bg-purple-600/15 blur-[160px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
                <div className="absolute bottom-[-10%] left-[30%] w-[700px] h-[700px] bg-cyan-600/10 blur-[150px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
                
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_30%,transparent_100%)] opacity-40 mix-blend-overlay" />
            </div>

            {/* Template Badge Style */}
            <aside className="hero-badge mb-10 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md shadow-sm transition-all hover:bg-slate-100 dark:hover:bg-white/10 max-w-full z-10 cursor-pointer group">
                <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse relative">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping"></span>
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 text-center whitespace-nowrap">
                    Introducing AI Matching 2.0
                </span>
                <ArrowRight size={14} className="text-blue-500 group-hover:translate-x-1 transition-transform" />
            </aside>

            {/* Template Title Style */}
            <h1
                className="hero-title text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold text-center max-w-5xl px-2 leading-[1.1] tracking-tighter mb-8 text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-br dark:from-white dark:via-white/95 dark:to-white/40 z-10"
            >
                Find scholarships <br className="hidden md:block" />
                matched to your profile
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle text-lg md:text-xl text-center max-w-2xl px-6 mb-12 text-slate-600 dark:text-slate-400 font-light tracking-wide z-10">
                ScholarHub uses AI to match students with verified scholarships across India. <br className="hidden lg:block" />
                Apply in minutes, track your status in real-time, and fund your education.
            </p>

            {/* Buttons */}
            <div className="hero-buttons flex items-center justify-center gap-4 relative z-20 mb-24 w-full sm:w-auto flex-col sm:flex-row">
                <Link href="/register" className="w-full sm:w-auto">
                    <NeonButton className="w-full h-[3.5rem] text-base group z-20">
                        Get started free
                        {/* <Sparkles size={18} className="ml-1 group-hover:rotate-12 group-hover:text-[#ffdf4e] transition-all" /> */}
                    </NeonButton>
                </Link>
                <Link href="/scholarships" className="w-full sm:w-auto">
                    <Button
                        size="lg"
                        variant="ghost"
                        className="group w-full h-[3.5rem] px-8 text-base font-semibold text-slate-700 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/10 dark:hover:text-white rounded-xl border border-transparent dark:hover:border-white/10 transition-all"
                    >
                        Browse Scholarships
                        <ArrowRight size={18} className="ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Button>
                </Link>
            </div>

            {/* Premium Dynamic Hero Visual — CSS animations only */}
            <div className="hero-image w-full max-w-6xl relative pb-20 min-h-[450px] md:min-h-[550px] flex items-center justify-center z-10">
                
                {/* Central AI matching Hub */}
                <div className="relative z-20 w-56 h-56 md:w-72 md:h-72 rounded-full border border-white/10 bg-slate-950/40 backdrop-blur-2xl flex items-center justify-center shadow-[inset_0_0_60px_rgba(255,255,255,0.05),0_0_100px_rgba(59,130,246,0.2)] group animate-[float_6s_ease-in-out_infinite]">
                    {/* Rotating Orbital Rings */}
                    <div className="absolute inset-[-20px] rounded-full border border-blue-500/10 animate-[spin_24s_linear_infinite]" />
                    <div className="absolute inset-3 md:inset-5 rounded-full border border-purple-500/20 animate-[spin_30s_linear_infinite_reverse] opacity-80" />
                    <div className="absolute inset-8 md:inset-10 rounded-full border-2 border-emerald-400/20 border-dashed animate-[spin_24s_linear_infinite]" />
                    
                    {/* Glowing Core Orbiting Dot */}
                    <div className="absolute inset-[-20px] animate-[spin_24s_linear_infinite]">
                        <div className="w-2 h-2 rounded-full bg-blue-400 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(96,165,250,1)]" />
                    </div>

                    {/* Core Icon Platform */}
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_0_60px_rgba(59,130,246,0.6)] relative overflow-hidden group-hover:scale-105 transition-transform duration-700">
                        {/* High-end 3D glossy reflection */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent opacity-60 rounded-full" />
                        
                        <Zap className="w-12 h-12 md:w-16 md:h-16 text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.6)]" strokeWidth={1.5} fill="currentColor" fillOpacity={0.2} />
                    </div>

                    {/* Laser Connecting Lines (SVG) */}
                    <svg className="absolute w-[900px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 opacity-40 pointer-events-none hidden md:block" viewBox="0 0 900 500">
                        <path d="M 450 250 Q 250 100 120 280" fill="none" stroke="url(#blue-laser)" strokeWidth="3" strokeDasharray="8 8" className="animate-[dash_15s_linear_infinite]" />
                        <path d="M 450 250 Q 650 350 780 180" fill="none" stroke="url(#purple-laser)" strokeWidth="3" strokeDasharray="8 8" className="animate-[dash_15s_linear_infinite_reverse]" />
                        <defs>
                            <linearGradient id="blue-laser"><stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="transparent" /></linearGradient>
                            <linearGradient id="purple-laser"><stop offset="0%" stopColor="#a78bfa" /><stop offset="100%" stopColor="transparent" /></linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Left Floating Card: Realistic Student Profile */}
                <div className="absolute top-[0%] md:top-[10%] left-[2%] md:left-[8%] w-64 md:w-72 p-5 rounded-[24px] border border-white/[0.12] bg-slate-950/70 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] -rotate-6 md:-rotate-12 group hover:rotate-0 hover:scale-105 transition-all duration-700 hidden sm:block z-30 animate-[float_5s_ease-in-out_1s_infinite]">
                    {/* Gloss highlight */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    
                    <div className="flex items-center gap-4 mb-5">
                        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 p-[2px] shadow-[0_0_25px_rgba(236,72,153,0.4)]">
                            <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center overflow-hidden">
                               <img src="https://i.pravatar.cc/150?img=47" alt="Profile" className="w-full h-full object-cover opacity-90" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-white text-[15px] font-semibold tracking-tight leading-none group-hover:text-pink-400 transition-colors">Sarah Jenkins</p>
                            <p className="text-slate-400 text-[11px] font-medium uppercase tracking-widest break-words leading-tight">Computer Science</p>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[10px] text-slate-500 font-mono">GPA: 3.9</span>
                                <span className="w-1 h-1 rounded-full bg-slate-600" />
                                <span className="text-[10px] text-slate-500 font-mono">B.Tech</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5 space-y-2 mb-4">
                        <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider mb-1">
                            <span className="text-slate-400">Match Probability</span>
                            <span className="text-emerald-400">98%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full w-[98%] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <span className="flex-1 text-center py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">Verified</span>
                        <span className="flex-1 text-center py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">Eligible</span>
                    </div>
                </div>

                {/* Right Floating Card: Realistic Scholarship */}
                <div className="absolute bottom-[2%] md:bottom-[10%] right-[2%] md:right-[8%] w-64 md:w-80 p-6 rounded-[24px] border border-white/[0.12] bg-slate-950/70 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] rotate-6 md:rotate-12 group hover:rotate-0 hover:scale-105 transition-all duration-700 hidden sm:block z-30 animate-[float_7s_ease-in-out_0.5s_infinite]">
                     {/* Gloss highlight */}
                     <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                     
                    <div className="flex justify-between items-start mb-5 relative">
                        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-400/10 border border-blue-400/20 text-cyan-400 shadow-[inset_0_0_15px_rgba(56,189,248,0.1),0_0_20px_rgba(56,189,248,0.2)] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(56,189,248,0.4)] transition-all duration-500">
                            <GraduationCap className="w-6 h-6 md:w-7 md:h-7" strokeWidth={1.5} />
                        </div>
                        <span className="px-3 py-1.5 rounded-full bg-purple-500/15 text-purple-300 text-[9px] font-bold uppercase tracking-widest border border-purple-500/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-400"></span>
                            </span>
                            Just Added
                        </span>
                    </div>
                    
                    <div className="mb-5">
                        <h4 className="text-white text-base md:text-lg font-bold leading-tight mb-2 tracking-tight group-hover:text-blue-400 transition-colors">Women in STEM Excellence Grant</h4>
                        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">Supporting aspiring female engineers leading innovation in technology and computer science.</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 font-medium border-t border-white/[0.08] pt-4">
                        <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span className="text-[10px] uppercase tracking-wider text-slate-300">Trusted</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] uppercase tracking-widest text-slate-500 mb-0.5">Prize Pool</span>
                            <span className="text-white text-[15px] font-black tracking-tight drop-shadow-[0_2px_10px_rgba(56,189,248,0.5)]">₹5,00,000</span>
                        </div>
                    </div>
                </div>

                {/* Decorative floating particles — CSS animations */}
                <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-cyan-400 blur-[1px] pointer-events-none hidden md:block shadow-[0_0_10px_rgba(34,211,238,1)] animate-[float_3s_ease-in-out_infinite]" />
                <div className="absolute bottom-1/4 right-[28%] w-3 h-3 rounded-full bg-purple-500 blur-[2px] pointer-events-none hidden md:block shadow-[0_0_15px_rgba(168,85,247,0.8)] animate-[float_5s_ease-in-out_1s_infinite]" />
                <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-blue-400 pointer-events-none hidden md:block shadow-[0_0_8px_rgba(96,165,250,1)] animate-[float_4s_ease-in-out_infinite]" />
                <div className="absolute bottom-1/3 left-1/3 w-1 h-1 rounded-full bg-emerald-400 pointer-events-none hidden md:block shadow-[0_0_8px_rgba(52,211,153,1)] animate-[float_4s_ease-in-out_0.5s_infinite]" />
            </div>

            {/* Stats — fetched from backend */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-12 max-w-4xl mx-auto relative z-20 w-full px-4 mt-12 md:mt-2">
                {statItems.map((stat) => (
                    <div key={stat.label} className="hero-stats group relative text-center p-6 sm:p-8 rounded-[24px] border border-white/[0.05] bg-slate-900/40 backdrop-blur-xl hover:bg-slate-800/40 hover:border-white/[0.1] transition-all duration-500 overflow-hidden">
                        {/* Hover flare */}
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                        
                        <p className="relative text-4xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 tracking-tighter mb-2 drop-shadow-sm group-hover:scale-110 transition-transform duration-500 ease-out">{stat.value}</p>
                        <p className="relative text-blue-400/80 text-xs sm:text-sm font-bold tracking-[0.2em] uppercase group-hover:text-blue-400 transition-colors">{stat.label}</p>
                    </div>
                ))}
            </div>
            {/* Very bottom gradient fade for smooth transition to next section */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-slate-50/80 dark:via-slate-950/80 to-transparent pointer-events-none z-20 transition-colors duration-500" />
        </section>
    );
}
