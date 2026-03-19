import React from 'react';
import { Building2, Landmark, GraduationCap, Building, Library } from 'lucide-react';

const partners = [
  { name: 'National Scholarship Portal', icon: Landmark },
  { name: 'Tata Trusts', icon: Building2 },
  { name: 'Reliance Foundation', icon: Building },
  { name: 'Vidyasaarathi', icon: GraduationCap },
  { name: 'HDFC Bank Parivartan', icon: Library },
  { name: 'Buddy4Study', icon: GraduationCap },
];

export default function TrustedPartners() {
  return (
    <section className="py-12 border-y border-white/[0.05] bg-slate-950/20 backdrop-blur-sm overflow-hidden flex flex-col items-center">
      <p className="text-sm font-semibold text-slate-400 tracking-widest uppercase mb-8">
        Trusted by leading scholarship providers & foundations
      </p>
      
      {/* Marquee Container */}
      <div className="relative w-full max-w-7xl flex overflow-hidden group">
        
        {/* Left/Right Fade Masks */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-950/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-950/80 to-transparent z-10 pointer-events-none" />

        {/* Marquee Content - Duplicate for infinite scroll */}
        <div className="flex animate-[marquee_40s_linear_infinite] group-hover:[animation-play-state:paused] w-max" style={{ '--gap': '4rem' } as React.CSSProperties}>
          {[...partners, ...partners].map((partner, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-3 px-8 mx-4 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 cursor-pointer"
            >
              <partner.icon className="w-8 h-8 text-blue-400" />
              <span className="text-xl font-bold text-slate-300 whitespace-nowrap">{partner.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
