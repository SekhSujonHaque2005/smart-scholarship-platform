'use client';

import React from 'react';
import { BrainCircuit, ShieldCheck, Activity, Lock, Smartphone, Star, Terminal, Cpu, Network, Fingerprint, Search, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
    {
        Icon: BrainCircuit,
        title: 'AI Matching',
        description: 'Our smart AI finds the best scholarships for you automatically based on your profile.',
        stat: '98% Match Rate',
        span: 'md:col-span-2',
        accent: <Cpu className="w-16 h-16 absolute -bottom-2 -right-2 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity" />
    },
    {
        Icon: Activity,
        title: 'Live Tracking',
        description: 'Track your application status in real-time and get instant updates.',
        stat: 'Instant Updates',
        span: 'md:col-span-1',
        accent: <Network className="w-10 h-10 absolute top-2 right-2 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity" />
    },
    {
        Icon: Star,
        title: 'Verified Sources',
        description: 'We only list scholarships from trusted and verified government and private providers.',
        stat: '100% Trusted',
        span: 'md:col-span-1',
    },
    {
        Icon: ShieldCheck,
        title: 'Safe & Secure',
        description: 'We screen every scholarship to keep you safe from scams and predatory patterns.',
        stat: 'Scam-Free',
        span: 'md:col-span-1',
        accent: <Fingerprint className="w-10 h-10 absolute bottom-2 right-2 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity" />
    },
    {
        Icon: Smartphone,
        title: 'Mobile Friendly',
        description: 'Apply for scholarships on the go with our easy-to-use mobile platform.',
        stat: 'Use Anywhere',
        span: 'md:col-span-1',
    },
    {
        Icon: Lock,
        title: 'Private Data',
        description: 'Your personal information is always kept private and secure with us.',
        stat: 'Secure Storage',
        span: 'md:col-span-1',
    },
    {
        Icon: Search,
        title: 'Auto-Scan',
        description: 'We scan thousands of sources daily to find the latest scholarships for you.',
        stat: '24/7 Scanning',
        span: 'md:col-span-1',
    },
    {
        Icon: Zap,
        title: 'Direct Funding',
        description: 'Receive scholarship funds directly to your account safely and quickly.',
        stat: 'Fast-Track',
        span: 'md:col-span-1',
    },
];

export default function Features() {
    return (
        <section id="features" className="py-12 bg-background border-b border-border overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                
                <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-16">
                    <div className="max-w-3xl text-left">
                        <h2 className="text-5xl md:text-7xl font-bold text-foreground tracking-tighter leading-[0.9] mb-4 uppercase">
                            EVERYTHING YOU NEED <br />
                            TO <span className="text-primary">SUCCEED.</span>
                        </h2>
                    </div>
                    <div className="max-w-xs border-l border-primary/20 pl-6 mt-4">
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            A simple and secure way to manage your scholarship journey.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-border relative">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                            className={`group relative bg-background border-r border-b border-border p-8 flex flex-col hover:bg-secondary/10 transition-all overflow-hidden ${feature.span}`}
                        >
                            {feature.accent}

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 border border-border bg-background flex items-center justify-center group-hover:border-primary transition-all group-hover:bg-primary/5 shrink-0">
                                    <feature.Icon className="w-4 h-4 text-foreground group-hover:text-primary transition-colors" />
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="text-[10px] font-bold text-primary uppercase tracking-[0.1em]">
                                    {feature.stat}
                                </div>
                                <h3 className="text-xl font-bold text-foreground tracking-tight uppercase">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground text-[13px] leading-snug">
                                    {feature.description}
                                </p>
                            </div>

                            <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
