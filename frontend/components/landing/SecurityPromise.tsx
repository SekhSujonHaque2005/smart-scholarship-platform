'use client';

import React from 'react';
import { Lock, FileKey, ShieldAlert, Fingerprint, Terminal, Zap, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SecurityPromise() {
  return (
    <section className="py-20 relative overflow-hidden bg-background border-b border-border">
      
      {/* Background Grid Accent */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-primary/5 -translate-y-1/2" />
      <div className="absolute top-0 left-1/2 w-px h-full bg-primary/5 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16 md:gap-24">
        
        <div className="lg:w-1/2 text-left">
          <h2 className="text-5xl md:text-8xl font-bold text-foreground tracking-tighter italic leading-[0.85] mb-10 uppercase">
            Your data is <br />
            strictly <span className="text-primary">yours.</span>
          </h2>
          <p className="text-muted-foreground text-xl leading-relaxed max-w-xl mb-12 border-l border-primary/20 pl-8">
            Your privacy comes first. We use industry-standard security to keep your personal information safe, private, and protected.
          </p>

          <div className="grid sm:grid-cols-2 gap-0 border border-border">
            <div className="p-10 space-y-6 border-b sm:border-b-0 sm:border-r border-border group hover:bg-secondary/10 transition-all">
              <div className="w-12 h-12 border border-border bg-background flex items-center justify-center group-hover:border-primary transition-all">
                <FileKey size={20} className="text-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-foreground tracking-tight uppercase mb-2">Secure Storage</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">All your uploaded documents are encrypted and stored safely.</p>
              </div>
            </div>
            <div className="p-10 space-y-6 group hover:bg-secondary/10 transition-all">
              <div className="w-12 h-12 border border-border bg-background flex items-center justify-center group-hover:border-primary transition-all">
                <ShieldAlert size={20} className="text-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-foreground tracking-tight uppercase mb-2">100% Private</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">We never sell your data. It is used only to help you apply for scholarships.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-1/2 w-full">
          <div className="aspect-square max-w-md mx-auto relative flex items-center justify-center border border-border bg-secondary/5 group overflow-hidden">
            
            {/* Architectural Accent Grid */}
            <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-10">
                {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className="border border-border/20" />
                ))}
            </div>

            {/* Visual focus element */}
            <div className="relative w-48 h-48 bg-background border border-border flex items-center justify-center group">
               <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               <Fingerprint size={80} className="text-foreground opacity-30 group-hover:text-primary group-hover:opacity-100 transition-all" />
               
               {/* Corner Markers */}
               <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/40" />
               <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/40" />
            </div>
            
            {/* Status indicators simplified */}
            <div className="absolute top-10 right-10 bg-background border border-border px-4 py-2 flex items-center gap-3">
                <div className="w-2 h-2 bg-primary animate-pulse" />
                <span className="text-foreground text-[10px] font-bold uppercase tracking-widest">Secure Storage</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
