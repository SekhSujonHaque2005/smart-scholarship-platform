'use client';

import { BrainCircuit, ShieldCheck, Activity, Lock, Smartphone, Star } from 'lucide-react';
import { BentoGridShowcase } from '@/components/bento-product-features';
import SpotlightCard from '@/components/SpotlightCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Helper component for simple bento items
const BentoItem = ({ feature, className }: { feature: typeof features[0], className?: string }) => (
    <SpotlightCard 
        className={cn("h-full border-slate-200 bg-white/60 dark:border-white/10 dark:bg-neutral-900/40 backdrop-blur-md overflow-hidden p-0", className)}
        spotlightColor="rgba(16, 185, 129, 0.12)"
    >
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity", feature.accent)} />
        <CardHeader className="relative z-10 pb-2">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center border mb-3", feature.iconColor, "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-neutral-800/50")}>
                <feature.Icon size={20} />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{feature.title}</CardTitle>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{feature.tagline}</p>
        </CardHeader>
        <CardContent className="relative z-10">
            <CardDescription className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {feature.description}
            </CardDescription>
        </CardContent>
    </SpotlightCard>
);

const features = [
    {
        Icon: BrainCircuit,
        title: 'AI-Powered Matching',
        tagline: 'Smart Discovery',
        description:
            'Our ML algorithm analyzes your profile and matches you with the most relevant scholarships instantly. No more endless searching — let AI do the heavy lifting.',
        accent: 'from-blue-500 to-cyan-400',
        glowColor: 'rgba(56, 189, 248, 0.25)',
        iconColor: 'text-cyan-400',
        imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop&q=80',
    },
    {
        Icon: ShieldCheck,
        title: 'Verified Providers',
        tagline: 'Trust & Safety',
        description:
            'Every scholarship provider is verified by our team. No scams, no fake scholarships — guaranteed. Apply with complete confidence and peace of mind.',
        accent: 'from-emerald-500 to-green-400',
        glowColor: 'rgba(16, 185, 129, 0.25)',
        iconColor: 'text-emerald-400',
        imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop&q=80',
    },
    {
        Icon: Activity,
        title: 'Real-Time Tracking',
        tagline: 'Stay Updated',
        description:
            'Track your application status in real-time. Get instant notifications when providers respond. Never miss a deadline or an opportunity again.',
        accent: 'from-blue-500 to-indigo-400',
        glowColor: 'rgba(56, 189, 248, 0.25)',
        iconColor: 'text-blue-500 dark:text-blue-400',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80',
    },
    {
        Icon: Lock,
        title: 'Secure & Private',
        tagline: 'Data Protection',
        description:
            'Your data is encrypted end-to-end and never shared with third parties. Apply with confidence knowing your personal information is safe and secure.',
        accent: 'from-slate-500 to-slate-400',
        glowColor: 'rgba(71, 85, 105, 0.25)',
        iconColor: 'text-slate-600 dark:text-slate-400',
        imageUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=600&fit=crop&q=80',
    },
    {
        Icon: Smartphone,
        title: 'Mobile Friendly',
        tagline: 'Apply Anywhere',
        description:
            'Apply for scholarships on the go. Our platform works seamlessly on all devices — phone, tablet, or desktop. Your opportunity is always in your pocket.',
        accent: 'from-teal-500 to-emerald-400',
        glowColor: 'rgba(20, 184, 166, 0.25)',
        iconColor: 'text-teal-600 dark:text-teal-400',
        imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop&q=80',
    },
    {
        Icon: Star,
        title: 'Trust Scores',
        tagline: 'Community Driven',
        description:
            'Provider trust scores based on real student reviews help you identify the best opportunities. Make informed decisions backed by community wisdom.',
        accent: 'from-cyan-500 to-teal-400',
        glowColor: 'rgba(6, 182, 212, 0.25)',
        iconColor: 'text-cyan-400',
        imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&q=80',
    },
];

export default function Features() {
    return (
        <section id="features" className="py-24 bg-transparent relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Section header */}
                <div className="text-center mb-16">
                    <p className="text-blue-600 dark:text-sky-400 font-semibold mb-3 tracking-wide uppercase text-sm">
                        Why ScholarHub?
                    </p>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
                        Everything you need to
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500">
                            {' '}succeed
                        </span>
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-light">
                        From discovery to disbursement, ScholarHub handles every step of your scholarship journey with unparalleled precision.
                    </p>
                </div>

                {/* Bento Grid Features */}
                <BentoGridShowcase
                    integration={<BentoItem feature={features[0]} className="h-full" />}
                    trackers={<BentoItem feature={features[2]} />}
                    statistic={<BentoItem feature={features[5]} />}
                    focus={<BentoItem feature={features[1]} />}
                    productivity={<BentoItem feature={features[4]} />}
                    shortcuts={<BentoItem feature={features[3]} className="bg-gradient-to-r" />}
                />
            </div>
        </section>
    );
}
