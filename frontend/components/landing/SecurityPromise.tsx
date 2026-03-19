import React from 'react';
import { Lock, FileKey, ShieldAlert, Fingerprint } from 'lucide-react';

export default function SecurityPromise() {
  return (
    <section className="py-24 relative overflow-hidden bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-white/[0.05] transition-colors duration-500">
      {/* Background Graphic */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-100/50 dark:from-emerald-500/5 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16">
        
        <div className="lg:w-1/2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Lock size={14} />
            Enterprise-Grade Security
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
            Your data is strictly <br />
            yours. Always.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 leading-relaxed">
            Applying for scholarships requires sensitive personal and financial data. We built ScholarHub with bank-level encryption to ensure your profile is 100% secure. We never sell your data, and it is only shared with the specific scholarship providers you choose to apply to.
          </p>

          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <div className="mt-1 w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                <FileKey size={18} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="text-slate-900 dark:text-white font-bold mb-1">End-to-End Encryption</h4>
                <p className="text-slate-600 dark:text-slate-500 text-sm">All uploaded documents (income certificates, IDs) are encrypted at rest using AES-256 standards.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                <ShieldAlert size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="text-slate-900 dark:text-white font-bold mb-1">No Data Brokers</h4>
                <p className="text-slate-600 dark:text-slate-500 text-sm">We are funded by institutional partners. Your inbox won't be flooded with college spam or third-party marketing.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Trust Graphic */}
        <div className="lg:w-1/2 w-full relative">
          <div className="aspect-square max-w-md mx-auto relative flex items-center justify-center">
            {/* Pulsing rings */}
            <div className="absolute inset-0 rounded-full border border-emerald-300 dark:border-emerald-500/20 animate-ping opacity-20 dark:opacity-20" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-8 rounded-full border border-emerald-300 dark:border-emerald-500/30 animate-[spin_10s_linear_infinite]" />
            <div className="absolute inset-16 rounded-full border border-dashed border-emerald-300 dark:border-emerald-500/30 animate-[spin_15s_linear_infinite_reverse]" />
            
            {/* Central Shield */}
            <div className="w-32 h-32 rounded-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 shadow-[0_0_50px_rgba(16,185,129,0.1)] dark:shadow-[0_0_50px_rgba(16,185,129,0.2)] flex items-center justify-center relative z-20 group">
               <div className="absolute inset-0 rounded-full bg-emerald-100/50 dark:bg-emerald-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <Fingerprint size={50} className="text-emerald-500 dark:text-emerald-400" />
            </div>

            {/* Floating badges */}
            <div className="absolute top-[20%] right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 animate-[float_4s_ease-in-out_infinite]">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">SSL Secure</span>
            </div>
            <div className="absolute bottom-[20%] left-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 animate-[float_5s_ease-in-out_1s_infinite]">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">ISO Compliant</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
