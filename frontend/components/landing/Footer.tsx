'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ScholarHubLogo } from '@/components/ui/logo';
import { Github, Twitter, Linkedin, ArrowUpRight } from 'lucide-react';

const RotatingCurvedText = () => {
    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-[0.03] select-none">
            <motion.svg
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                viewBox="0 0 300 300"
                className="w-full h-full"
            >
                <path
                    id="circlePath"
                    d="M 150, 150 m -120, 0 a 120,120 0 0,1 240,0 a 120,120 0 0,1 -240,0"
                    fill="none"
                />
                <text className="fill-foreground font-bold italic uppercase text-[12px] tracking-[1.2em]">
                    <textPath href="#circlePath">
                        SCHOLARHUB — INDIA'S SMARTEST SCHOLARSHIP MARKETPLACE — DESIGNED FOR EXCELLENCE — 
                    </textPath>
                </text>
            </motion.svg>
        </div>
    );
};

export default function Footer() {
    return (
        <footer className="relative bg-background text-foreground overflow-hidden border-t border-border pt-32 pb-12">
            
            {/* Curved Animated Background Text */}
            <RotatingCurvedText />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-32">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center mb-10">
                            <ScholarHubLogo className="w-12 h-12" />
                        </div>
                        <p className="text-muted-foreground text-lg leading-relaxed italic max-w-xs border-l border-primary/20 pl-6">
                            Architecting the next generation of student funding. Zero-fault infrastructure for scholars.
                        </p>
                    </div>

                    <div>
                        <div className="text-primary font-bold mb-10 tracking-[0.4em] uppercase text-[10px] italic">RESOURCES</div>
                        <ul className="space-y-6">
                            {[
                                { name: "Scholarships", href: "/scholarships" },
                                { name: "Success Stories", href: "/stories" },
                                { name: "AI Matcher", href: "/matcher" }
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all text-base font-bold italic uppercase tracking-tighter">
                                        {link.name}
                                        <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <div className="text-primary font-bold mb-10 tracking-[0.4em] uppercase text-[10px] italic">ENTERPRISE</div>
                        <ul className="space-y-6">
                            {[
                                { name: "Provider Portal", href: "/login" },
                                { name: "Verification", href: "/verification" },
                                { name: "API Docs", href: "/docs" }
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all text-base font-bold italic uppercase tracking-tighter">
                                        {link.name}
                                        <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <div className="text-primary font-bold mb-10 tracking-[0.4em] uppercase text-[10px] italic">NETWORK</div>
                        <ul className="space-y-6">
                            {[
                                { name: "About Enclave", href: "/about" },
                                { name: "Privacy Node", href: "/privacy" },
                                { name: "Contact Support", href: "/contact" }
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all text-base font-bold italic uppercase tracking-tighter">
                                        {link.name}
                                        <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border pt-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <p className="text-muted-foreground text-[11px] font-bold italic tracking-wider">
                            © {new Date().getFullYear()} SCHOLARHUB ARCHITECTURE.
                        </p>
                        <div className="w-px h-4 bg-border hidden md:block" />
                        <p className="text-muted-foreground text-[11px] font-bold italic uppercase tracking-widest hidden md:block">
                            System Status: Active
                        </p>
                    </div>
                    
                    <div className="flex gap-10">
                        {[
                            { icon: Twitter, name: "Twitter" },
                            { icon: Github, name: "GitHub" },
                            { icon: Linkedin, name: "LinkedIn" }
                        ].map((social) => (
                            <Link key={social.name} href="#" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all font-bold text-[10px] uppercase tracking-[0.3em] italic group">
                                <social.icon size={14} className="group-hover:scale-110 transition-transform" />
                                <span className="hidden sm:inline">{social.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Final Background Accents */}
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </footer>
    );
}
