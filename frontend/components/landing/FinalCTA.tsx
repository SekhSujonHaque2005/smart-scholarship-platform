'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';

export default function FinalCTA() {
    return (
        <section className="py-32 md:py-48 relative bg-background overflow-hidden border-b border-border">
            {/* Background Grid Accent */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div className="h-full w-full grid grid-cols-6 divide-x divide-foreground" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                <div className="mb-20 space-y-6">
                    <h2 className="text-[12vw] md:text-[8vw] font-serif font-extrabold tracking-tighter leading-[0.85] uppercase text-foreground">
                        Ready to fund <br />
                        <span className="text-primary italic">Your Future?</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        Join 7 million+ students already navigating the scholarship landscape with precision.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-0 border border-border inline-flex shadow-2xl">
                    <Link 
                        href="/register"
                        className="h-24 px-12 md:px-20 bg-primary text-primary-foreground font-bold text-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-4 group min-w-[280px]"
                    >
                        GET STARTED NOW — FREE
                        <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                    
                    <Link 
                        href="/contact"
                        className="h-24 px-12 md:px-20 bg-background text-foreground font-bold text-xl hover:bg-secondary/50 transition-all flex items-center justify-center gap-4 border-l border-border group min-w-[280px]"
                    >
                        SUPPORT ENCLAVE
                        <Mail size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                </div>

                {/* Technical Corner Markers */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/20" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/20" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/20" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/20" />
            </div>
        </section>
    );
}
