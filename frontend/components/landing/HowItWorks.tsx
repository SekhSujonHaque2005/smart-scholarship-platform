'use client';

import React, { useRef } from 'react';
import { UserPlus, Sparkles, Send, Activity, Zap } from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

const milestones = [
    {
        title: "Create Your Profile",
        description: "Fill in your academic and personal details once. We find everything you're eligible for.",
        icon: UserPlus,
        badge: "Step 01",
    },
    {
        title: "Smart AI Matching",
        description: "Our AI engine scans thousands of government and private scholarships for the best matches.",
        icon: Sparkles,
        badge: "Step 02",
    },
    {
        title: "Online Application",
        description: "Upload documents securely and apply to multiple scholarships with a single click.",
        icon: Send,
        badge: "Step 03",
    },
    {
        title: "Track Your Funds",
        description: "Get real-time updates and receive scholarship funds directly into your bank account.",
        icon: Activity,
        badge: "Step 04",
    }
];

export default function HowItWorks() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"]
    });

    const pathLength = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <section ref={containerRef} className="relative py-32 bg-background border-b border-border overflow-hidden">
            
            {/* THE "CHAI" PATH - Compact & Thick */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[600px] pointer-events-none z-0 opacity-10 md:opacity-100">
                <svg className="w-full h-full" viewBox="0 0 600 1200" fill="none" preserveAspectRatio="none">
                    <motion.path 
                        d="M 300 0 
                           C 500 150, 500 250, 300 350 
                           C 100 450, 100 550, 300 650 
                           C 500 750, 500 850, 300 950 
                           C 100 1050, 100 1150, 300 1250" 
                        stroke="#fbbf24" 
                        strokeWidth="5" 
                        strokeLinecap="round"
                        style={{ pathLength: pathLength }}
                        className="drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]"
                    />
                    
                    {[350, 650, 950, 1250].map((y, i) => (
                        <motion.circle 
                            key={i}
                            cx="300"
                            cy={y}
                            r="6"
                            fill="#fbbf24"
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: false }}
                        />
                    ))}
                </svg>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-24 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-[0.3em] italic mb-6">
                        Easy 4-Step Process
                    </div>
                    <h2 className="text-6xl md:text-8xl font-bold text-foreground tracking-tighter italic leading-[0.9] mb-8">
                        How It <br />
                        <span className="text-primary">Works.</span>
                    </h2>
                    <p className="text-muted-foreground text-lg italic leading-relaxed">
                        Getting funded shouldn't be a struggle. Follow our simple roadmap to secure your scholarship.
                    </p>
                </div>

                <div className="relative space-y-4">
                    {milestones.map((milestone, idx) => {
                        const isEven = idx % 2 === 0;

                        return (
                            <div key={idx} className="relative h-[250px] flex items-center justify-center">
                                <motion.div 
                                    initial={{ opacity: 0, x: isEven ? 100 : -100 }}
                                    whileInView={{ opacity: 1, x: isEven ? 260 : -260 }}
                                    viewport={{ once: false, margin: "-50px" }}
                                    transition={{ duration: 0.6, type: "spring", bounce: 0.2 }}
                                    className={cn(
                                        "absolute w-full max-w-[380px] p-6 bg-background/90 backdrop-blur-xl border border-border group",
                                        "hover:border-primary/50 transition-all duration-300"
                                    )}
                                >
                                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/40" />
                                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/40" />

                                    <div className="text-primary font-bold text-[8px] uppercase tracking-[0.4em] mb-4 italic">
                                        {milestone.badge}
                                    </div>

                                    <div className="flex items-start gap-5">
                                        <div className="w-10 h-10 border border-border bg-background flex items-center justify-center shrink-0">
                                            <milestone.icon className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                        <div className="space-y-3">
                                            <h3 className="text-xl font-bold text-foreground italic tracking-tight">
                                                {milestone.title}
                                            </h3>
                                            <p className="text-muted-foreground text-[13px] leading-relaxed italic">
                                                {milestone.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={cn(
                                        "absolute top-1/2 -translate-y-1/2 w-16 h-px bg-primary/20",
                                        isEven ? "-left-16" : "-right-16"
                                    )} />
                                </motion.div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Call to Action - Compact */}
                <div className="mt-24 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="p-8 border border-primary/20 bg-primary/5 inline-block"
                    >
                        <h4 className="text-3xl font-bold italic tracking-tighter mb-6">Start Your Journey</h4>
                        <button className="h-14 px-10 bg-primary text-primary-foreground font-bold italic hover:scale-105 transition-all text-sm uppercase tracking-widest">
                            Get Your Scholarship Match
                        </button>
                    </motion.div>
                </div>
            </div>

        </section>
    );
}
