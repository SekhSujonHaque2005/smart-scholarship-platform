import React from 'react';
import { NeonButton } from '@/components/ui/neon-button';
import { MapPin, Clock, Award, ShieldCheck, ArrowRight } from 'lucide-react';

const scholarships = [
  {
    title: "Women in Tech Leadership Grant",
    provider: "Global STEM Foundation",
    amount: "₹2,50,000",
    deadline: "15 Oct 2026",
    location: "Pan India",
    tags: ["Female Only", "Engineering"],
    color: "from-pink-500 to-rose-400"
  },
  {
    title: "National Merit Scholarship 2026",
    provider: "Ministry of Education",
    amount: "₹50,000 / yr",
    deadline: "30 Nov 2026",
    location: "All States",
    tags: ["Merit Based", "Undergrad"],
    color: "from-blue-500 to-cyan-400"
  },
  {
    title: "Rural Innovators Fellowship",
    provider: "Tata Trusts",
    amount: "₹1,00,000",
    deadline: "10 Dec 2026",
    location: "Rural Domicile",
    tags: ["Innovation", "Postgrad"],
    color: "from-emerald-400 to-teal-500"
  }
];

export default function FeaturedScholarships() {
  return (
    <section className="py-24 relative overflow-hidden bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
              Featured Scholarships
            </h2>
            <p className="text-slate-400 text-lg">
              Explore some of the highest-value opportunities currently active on our platform. 
              Our AI can match you with thousands more based on your unique profile.
            </p>
          </div>
          <button className="hidden md:flex items-center gap-2 text-blue-400 font-semibold hover:text-blue-300 transition-colors group">
            View all 5,000+ scholarships
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {scholarships.map((sch, idx) => (
            <div 
              key={idx} 
              className="group relative bg-slate-900 border border-white/10 rounded-[2rem] p-8 hover:border-white/20 transition-all duration-300 hover:shadow-2xl overflow-hidden flex flex-col h-full"
            >
              {/* Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex-1">
                {/* Header / Verified Badge */}
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${sch.color} shadow-lg shadow-black/50`}>
                    <Award className="text-white w-6 h-6" />
                  </div>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wide">
                    <ShieldCheck size={14} />
                    Verified
                  </span>
                </div>

                {/* Title & Provider */}
                <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-blue-400 transition-colors">
                  {sch.title}
                </h3>
                <p className="text-slate-400 text-sm font-medium mb-6">
                  by {sch.provider}
                </p>

                {/* Key Details */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 uppercase font-semibold">Amount</span>
                    <p className="text-white font-bold">{sch.amount}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 uppercase font-semibold">Deadline</span>
                    <p className="text-white font-bold flex items-center gap-1.5">
                      <Clock size={14} className="text-blue-400" />
                      {sch.deadline}
                    </p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <span className="text-xs text-slate-500 uppercase font-semibold">Location</span>
                    <p className="text-slate-300 text-sm flex items-center gap-1.5">
                      <MapPin size={14} className="text-blue-400" />
                      {sch.location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags & Action */}
              <div className="relative z-10 mt-auto pt-6 border-t border-white/5">
                <div className="flex flex-wrap gap-2 mb-6">
                  {sch.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white/5 rounded-lg text-xs font-medium text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
                
                {/* Reuse the NeonButton from the previous request! */}
                <NeonButton className="w-full py-3 h-12 rounded-xl text-sm justify-center">
                  Check Eligibility
                </NeonButton>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View All Button */}
        <button className="mt-8 mx-auto flex md:hidden items-center justify-center gap-2 text-blue-400 font-semibold w-full py-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
          View all 5,000+ scholarships
          <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}
