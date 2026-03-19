import React from 'react';
import { Sparkles, GraduationCap, Briefcase, BookOpen, UserCircle, Globe } from 'lucide-react';

export default function TargetAudience() {
  return (
    <section className="py-24 relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-500/5 dark:bg-blue-600/10 blur-[150px] rounded-[100%] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles size={14} />
            Who Is ScholarHub For?
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            Built for every step of <br className="hidden md:block" />
            your academic journey
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Whether you're just starting college or funding advanced research, our AI matches you with the right opportunities.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 auto-rows-[minmax(180px,auto)]">
          
          {/* Bento Cell 1: Undergraduates (Large span) */}
          <div className="md:col-span-2 relative group rounded-3xl p-8 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all duration-500 shadow-sm hover:shadow-xl dark:shadow-xl hover:dark:shadow-[0_0_40px_rgba(59,130,246,0.15)] flex flex-col justify-end min-h-[250px] cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 dark:from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-duration-500" />
            
            <div className="absolute top-8 right-8 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
               <GraduationCap className="w-8 h-8 text-white" />
            </div>

            <div className="relative z-10 w-3/4">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Undergraduates & High School Seniors</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Secure funding for tuitions, housing, and books before university begins. Our largest pool of scholarships targets immediate undergraduate needs.</p>
            </div>
          </div>

          {/* Bento Cell 2: STEM & Research */}
          <div className="relative group rounded-3xl p-8 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 hover:border-purple-300 dark:hover:border-purple-500/30 transition-all duration-500 shadow-sm hover:shadow-xl dark:shadow-xl hover:dark:shadow-[0_0_40px_rgba(168,85,247,0.15)] flex flex-col justify-end min-h-[250px] cursor-default">
             <div className="absolute inset-0 bg-gradient-to-bl from-purple-50 dark:from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-duration-500" />
            
            <div className="absolute top-8 right-8 w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center shadow-lg group-hover:-translate-y-2 transition-transform duration-500">
               <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>

            <div className="relative z-10">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 tracking-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Women in STEM</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Exclusive grants and fellowships designed to close the gender gap in tech, science, and engineering fields.</p>
            </div>
          </div>

          {/* Bento Cell 3: Postgrads */}
          <div className="relative group rounded-3xl p-8 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all duration-500 shadow-sm hover:shadow-xl dark:shadow-xl hover:dark:shadow-[0_0_40px_rgba(16,185,129,0.15)] flex flex-col justify-end min-h-[250px] cursor-default">
             <div className="absolute inset-0 bg-gradient-to-tr from-emerald-50 dark:from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-duration-500" />
            
            <div className="absolute top-8 right-8 w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
               <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div className="relative z-10">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Postgrad & Masters</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">High-value fellowships and research grants for specialized studies, overseas education, and PhDs.</p>
            </div>
          </div>

          {/* Bento Cell 4: Minorities & Needs (Large span) */}
          <div className="md:col-span-2 relative group rounded-3xl p-8 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 hover:border-orange-300 dark:hover:border-orange-500/30 transition-all duration-500 shadow-sm hover:shadow-xl dark:shadow-xl hover:dark:shadow-[0_0_40px_rgba(249,115,22,0.15)] flex flex-col md:flex-row items-start md:items-end justify-between min-h-[250px] cursor-default">
            <div className="absolute inset-0 bg-gradient-to-t from-orange-50 dark:from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-duration-500" />
            
            <div className="relative z-10 md:w-2/3 mb-6 md:mb-0">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Needs-Based & Merit Scholarships</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">From financial hardship grants to academic excellence awards, we categorize and match utilizing 50+ diverse demographic markers including income, region, and caste.</p>
            </div>

            <div className="relative z-10 w-20 h-20 rounded-full border-[6px] border-white dark:border-slate-950 bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500 md:ml-6">
               <UserCircle className="w-10 h-10 text-white" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
