import React from 'react';
import Link from 'next/link';
import { NeonButton } from '@/components/ui/neon-button';
import { Rocket, ShieldCheck, Mail } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-24 relative overflow-hidden bg-blue-600">
      {/* Background Graphic Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-white/10 blur-[100px] rounded-full mix-blend-overlay pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-black/20 blur-[80px] rounded-full mix-blend-overlay pointer-events-none" />
      
      {/* Subtle Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] opacity-30 mix-blend-overlay pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="bg-slate-950/40 backdrop-blur-md border border-white/20 rounded-[2.5rem] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wide mb-6">
              <Rocket size={14} className="text-white" />
              Your Future Starts Here
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
              Ready to fund <br className="hidden md:block" />
              your education?
            </h2>
            <p className="text-blue-100 text-lg md:text-xl font-medium mb-8 max-w-xl mx-auto md:mx-0">
              Join thousands of students already using ScholarHub to discover and secure their dream scholarships.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/register" className="w-full sm:w-auto">
                {/* Using the physical NeonButton from the neon-button.tsx file */}
                <NeonButton className="w-full sm:w-auto px-10 h-14 text-lg">
                  Get Started For Free
                </NeonButton>
              </Link>
              <Link href="/contact" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 h-14 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold transition-all flex items-center justify-center gap-2">
                  <Mail size={18} />
                  Contact Sales
                </button>
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex w-72 h-72 rounded-full border-[10px] border-white/10 bg-gradient-to-br from-blue-400 to-indigo-600 shadow-[0_0_50px_rgba(255,255,255,0.3)] items-center justify-center relative flex-shrink-0 animate-[float_6s_ease-in-out_infinite]">
            <ShieldCheck size={100} className="text-white drop-shadow-xl" />
            <div className="absolute -bottom-6 -right-6 bg-slate-950 p-4 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-3 animate-[float_5s_ease-in-out_1s_infinite]">
                 <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <ShieldCheck size={20} className="text-emerald-400" />
                 </div>
                 <div>
                    <p className="text-white font-bold text-sm">100% Safe</p>
                    <p className="text-slate-400 text-xs">Verified Matches</p>
                 </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
