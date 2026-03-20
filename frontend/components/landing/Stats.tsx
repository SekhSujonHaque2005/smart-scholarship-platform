'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import api from '@/app/lib/api';

gsap.registerPlugin(ScrollTrigger);

interface PlatformStats {
    totalStudents: number;
    activeScholarships: number;
    verifiedProviders: number;
    totalAwarded: number;
}

function formatNumber(num: number): string {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr+`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L+`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K+`;
    return num.toString();
}

function formatCurrency(num: number): string {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Crore+`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} Lakh+`;
    if (num >= 1000) return `₹${num.toLocaleString('en-IN')}`;
    if (num === 0) return '₹0';
    return `₹${num}`;
}

export default function Stats() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [stats, setStats] = useState<PlatformStats | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('stats');
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };
        fetchStats();
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.stat-item',
                { opacity: 0, scale: 0.8 },
                {
                    opacity: 1, scale: 1, duration: 0.5, stagger: 0.15, ease: 'back.out(1.7)',
                    scrollTrigger: { trigger: '.stats-container', start: 'top 80%' }
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [stats]);

    const statItems = stats
        ? [
            { value: stats.totalStudents.toString(), label: 'Students Registered' },
            { value: stats.activeScholarships.toString(), label: 'Active Scholarships' },
            { value: formatCurrency(stats.totalAwarded), label: 'Total Awarded' },
            { value: stats.verifiedProviders.toString(), label: 'Verified Providers' },
        ]
        : [
            { value: '—', label: 'Students Registered' },
            { value: '—', label: 'Active Scholarships' },
            { value: '—', label: 'Total Awarded' },
            { value: '—', label: 'Verified Providers' },
        ];

    return (
        <section
            ref={containerRef}
            className="py-20 bg-white/40 dark:bg-transparent border-y border-slate-200 dark:border-slate-800/50 backdrop-blur-sm"
        >
            <div className="max-w-7xl mx-auto px-6">
                <div className="stats-container grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {statItems.map((stat) => (
                        <div key={stat.label} className="stat-item">
                            <p className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">{stat.value}</p>
                            <p className="text-blue-600 dark:text-blue-300">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
