import React from 'react';
import { UserPlus, Sparkles, Send, Activity } from 'lucide-react';

const steps = [
    {
        title: "Create Profile",
        description: "Tell us about your academics, background, and goals in less than 5 minutes.",
        icon: UserPlus,
        color: "from-blue-500 to-cyan-400",
        shadow: "shadow-cyan-500/20",
    },
    {
        title: "AI Finds Matches",
        description: "Our algorithm scans thousands of verified scholarships to find your perfect fit.",
        icon: Sparkles,
        color: "from-purple-500 to-pink-500",
        shadow: "shadow-purple-500/20",
    },
    {
        title: "One-Click Apply",
        description: "Auto-fill applications and submit your documents securely through our portal.",
        icon: Send,
        color: "from-orange-500 to-rose-400",
        shadow: "shadow-orange-500/20",
    },
    {
        title: "Track Progress",
        description: "Get real-time updates on your application status until the funds reach you.",
        icon: Activity,
        color: "from-emerald-400 to-teal-500",
        shadow: "shadow-emerald-500/20",
    }
];

export default function HowItWorks() {
    return (
        <section className="py-24 relative overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-500">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-600/5 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-20">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                        How ScholarHub Works
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                        We've simplified the scholarship process so you can focus on your education, not paperwork.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                    {/* Connecting dashed line (visible on desktop) */}
                    <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-slate-300 dark:via-white/10 to-transparent border-t-2 border-dashed border-slate-300 dark:border-white/20 -z-10" />

                    {steps.map((step, idx) => (
                        <div key={idx} className="relative group perspective-1000">
                            {/* Step Number Badge */}
                            <div className="absolute -top-4 -left-4 w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center font-black text-slate-900 dark:text-white text-lg z-20 shadow-xl group-hover:scale-110 transition-transform duration-300">
                                {idx + 1}
                            </div>

                            <div className="h-full bg-slate-50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-white/5 rounded-3xl p-8 hover:bg-white dark:hover:bg-slate-800/50 transition-colors duration-500 relative overflow-hidden shadow-sm dark:shadow-none hover:shadow-lg dark:hover:shadow-none">
                                {/* Hover Gradient Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-500 ${step.color} opacity-0 group-hover:opacity-[0.03] dark:group-hover:opacity-5`} />
                                
                                {/* Icon container */}
                                <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center bg-gradient-to-br transition-transform duration-500 shadow-sm border border-slate-200 dark:border-white/10 group-hover:scale-110 group-hover:-rotate-3 ${step.color} bg-opacity-10 dark:shadow-lg dark:${step.shadow}`}>
                                    <step.icon className="w-8 h-8 text-slate-700 dark:text-white mix-blend-overlay dark:mix-blend-normal opacity-80 dark:opacity-100" />
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                                    {step.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
