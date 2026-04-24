'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronRight, ShieldCheck, BarChart3, Users, PieChart, Activity, Crosshair } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TypewriterText = ({ text, delay = 0, speed = 0.05 }: { text: string; delay?: number; speed?: number }) => {
  const characters = text.split("");
  
  return (
    <motion.span
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 1 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: delay,
            staggerChildren: speed,
          },
        },
      }}
    >
      {characters.map((char, index) => (
        <motion.span
          key={index}
          variants={{
            hidden: { opacity: 0, display: "none" },
            visible: { opacity: 1, display: "inline" },
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

const BackgroundFlipGrid = () => {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.03]">
            <div className="grid grid-cols-6 md:grid-cols-12 gap-1 w-full h-full">
                {Array.from({ length: 144 }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ rotateY: 0 }}
                        animate={{ 
                            rotateY: [0, 180, 0],
                            backgroundColor: ["rgba(251,191,36,0)", "rgba(251,191,36,1)", "rgba(251,191,36,0)"]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            delay: Math.random() * 10,
                            ease: "easeInOut"
                        }}
                        className="aspect-square border border-primary/20"
                    />
                ))}
            </div>
        </div>
    );
};

export default function Hero() {
  return (
    <section className="relative w-full bg-background overflow-hidden border-b border-border">
      
      {/* Cool Background Card Flip Animation */}
      <BackgroundFlipGrid />

      {/* Floating Amber Orbs - Refined blur */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center w-full pt-16 pb-24">
        
        {/* Top Decorative Line */}
        <div className="flex items-center justify-center gap-4 mb-12 opacity-40">
            <div className="h-px w-20 bg-border" />
            <Crosshair className="w-4 h-4 text-primary animate-pulse" />
            <div className="h-px w-20 bg-border" />
        </div>

        <motion.h1 
          className="text-6xl md:text-[140px] font-bold text-foreground tracking-[-0.05em] italic leading-[0.8] mb-12 block"
        >
          <TypewriterText text="FIND & APPLY FOR" delay={0.2} speed={0.03} /> <br />
          <span className="text-primary">
            <TypewriterText text="INDIA'S BEST" delay={0.8} speed={0.05} />
          </span> <br />
          <TypewriterText text="SCHOLARSHIPS." delay={1.5} speed={0.04} />
          <motion.span 
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="inline-block w-1.5 h-12 md:h-24 bg-primary ml-4 translate-y-1 md:translate-y-2"
          />
        </motion.h1>

        <motion.p 
          className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-16 px-4 border-l border-r border-primary/20"
        >
          <TypewriterText 
            text="ScholarHub connects you with verified government and private scholarships using smart AI matching." 
            delay={2.5} 
            speed={0.01} 
          />
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.5, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-0 mb-32"
        >
          <Link href="/register" className="w-full sm:w-auto">
            <button className="h-20 px-16 bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all italic border border-primary relative group overflow-hidden w-full">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary-foreground/30" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary-foreground/30" />
              APPLY NOW — FREE
              <ChevronRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link href="/scholarships" className="w-full sm:w-auto">
            <button className="h-20 px-16 bg-background text-foreground border border-border font-bold text-lg hover:bg-secondary transition-all italic relative group w-full">
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-border/50" />
              BROWSE DIRECTORY
            </button>
          </Link>
        </motion.div>

        {/* Dashboard Preview - More Architectural */}
        <div className="relative w-full max-w-6xl mx-auto">
            {/* Background Grid Accent */}
            <div className="absolute -inset-8 border border-primary/5 pointer-events-none" />
            
            <div className="relative bg-background border border-border p-4 md:p-10 shadow-2xl overflow-hidden min-h-[600px]">
                
                {/* Header of Mockup */}
                <div className="flex items-center justify-between border-b border-border pb-8 mb-12">
                    <div className="flex items-center gap-6">
                        <div className="w-10 h-10 border border-border bg-background flex items-center justify-center">
                            <Activity className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-left">
                            <p className="text-lg font-bold italic uppercase tracking-tighter">Dashboard Interface</p>
                        </div>
                    </div>
                </div>

                {/* Dashboard Grid Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                    <div className="md:col-span-2 space-y-8">
                        <div className="border border-border p-8 bg-secondary/5 h-full relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <BarChart3 className="w-24 h-24" />
                            </div>
                            
                            <div className="flex justify-between items-start mb-12 relative z-10">
                                <div>
                                    <h4 className="text-4xl font-bold tracking-tighter mb-2 uppercase">Success Rate</h4>
                                    <p className="text-[11px] text-muted-foreground uppercase tracking-[0.2em] italic">Searching for scholarships...</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-4xl font-bold text-primary leading-none">98.4%</p>
                                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Match Score</p>
                                </div>
                            </div>
                            
                            <div className="space-y-6 relative z-10">
                                {[
                                    { label: "Government Funding", width: "88%", color: "primary" },
                                    { label: "Institutional Grants", width: "72%", color: "border" },
                                    { label: "Private Foundations", width: "94%", color: "primary" }
                                ].map((bar, i) => (
                                    <div key={i} className="space-y-3">
                                        <div className="flex justify-between text-[11px] font-bold italic uppercase tracking-widest">
                                            <span>{bar.label}</span>
                                            <span className="text-primary">{bar.width}</span>
                                        </div>
                                        <div className="h-1 bg-border w-full">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                whileInView={{ width: bar.width }}
                                                transition={{ duration: 1.5, delay: i * 0.2 }}
                                                className={`h-full ${bar.color === 'primary' ? 'bg-primary' : 'bg-foreground/40'}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="border border-border p-8 bg-secondary/5">
                            <Users className="w-8 h-8 text-primary mb-6" />
                            <p className="text-5xl font-bold tracking-tighter leading-none mb-2">25K+</p>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-[0.2em]">Students Joined</p>
                        </div>
                        <div className="border border-border p-8 bg-primary text-primary-foreground relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10">
                                <ShieldCheck className="w-24 h-24" />
                            </div>
                            <ShieldCheck className="w-8 h-8 mb-6" />
                            <p className="text-5xl font-bold italic tracking-tighter leading-none mb-2">100%</p>
                            <p className="text-[11px] uppercase tracking-[0.2em] italic opacity-80">Security Audit Pass</p>
                        </div>
                    </div>
                </div>

                <div className="mt-16 flex flex-wrap gap-6 border-t border-border pt-10">
                    {[
                        { icon: BarChart3, label: "Real-time Stats" },
                        { icon: PieChart, label: "Fund Management" },
                        { icon: Activity, label: "Direct Apply" }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 border border-border px-5 py-2 bg-secondary/5 group hover:border-primary transition-colors cursor-default">
                            <item.icon className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">{item.label}</span>
                        </div>
                    ))}
                </div>

                {/* Bottom Architectural Overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-20 pointer-events-none" />
            </div>
        </div>

      </div>

    </section>
  );
}
