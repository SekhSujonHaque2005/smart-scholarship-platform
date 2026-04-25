'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, GraduationCap, Award, Building2 } from 'lucide-react';

interface PlatformStats {
    totalStudents: number;
    activeScholarships: number;
    verifiedProviders: number;
    totalAwarded: number;
}

export default function Stats() {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                const response = await fetch(`${apiUrl}/stats`);
                if (response.ok) {

                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const formatNumber = (num: number) => {
        if (num >= 10000000) return { val: (num / 10000000).toFixed(1), suffix: "CR" };
        if (num >= 100000) return { val: (num / 100000).toFixed(1), suffix: "LAKH" };
        if (num >= 1000) return { val: (num / 1000).toFixed(1), suffix: "K" };
        return { val: num.toString(), suffix: "" };
    };

    const statConfig = [
        { label: "Students", value: stats?.totalStudents || 0, icon: Users },
        { label: "Scholarships", value: stats?.activeScholarships || 0, icon: GraduationCap },
        { label: "Total Awarded", value: stats?.totalAwarded || 0, icon: Award, prefix: "₹" },
        { label: "Providers", value: stats?.verifiedProviders || 0, icon: Building2 }
    ];

    return (
        <section className="relative bg-background overflow-hidden border-b border-border">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border border-x border-border">
                    {statConfig.map((stat, idx) => {
                        const formatted = formatNumber(stat.value);
                        return (
                            <div 
                                key={idx} 
                                className="p-12 md:p-20 flex flex-col items-center text-center space-y-10 hover:bg-secondary/10 transition-all group relative overflow-hidden"
                            >
                                {/* Header Icon */}
                                <div className="w-12 h-12 border border-border flex items-center justify-center bg-background group-hover:border-primary transition-all duration-500 relative z-10">
                                    <stat.icon size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>

                                <div className="relative z-10 w-full">
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-start justify-center">
                                            {stat.prefix && (
                                                <span className="text-2xl md:text-3xl font-serif font-bold text-muted-foreground/50 mt-1 mr-1">
                                                    {stat.prefix}
                                                </span>
                                            )}
                                            <h2 className="text-6xl md:text-8xl font-serif font-black tracking-tighter text-foreground leading-none">
                                                {loading ? "0" : formatted.val}
                                            </h2>
                                        </div>
                                        {formatted.suffix && (
                                            <span className="text-[10px] font-bold text-primary tracking-[0.4em] uppercase mt-4 block italic">
                                                {formatted.suffix}+
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-8 pt-8 border-t border-border w-full">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground group-hover:text-foreground transition-colors">
                                            {stat.label}
                                        </p>
                                    </div>
                                </div>

                                {/* Background Watermark */}
                                <div className="absolute -bottom-4 -right-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-700 pointer-events-none grayscale">
                                    <stat.icon size={180} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
