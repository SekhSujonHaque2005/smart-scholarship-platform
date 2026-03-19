'use client';

import { BrainCircuit, ShieldCheck, Activity, Lock, Smartphone, Star } from 'lucide-react';
import { FeatureCard } from '@/components/ui/card-17';

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
        accent: 'from-purple-500 to-violet-400',
        glowColor: 'rgba(139, 92, 246, 0.25)',
        iconColor: 'text-violet-400',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80',
    },
    {
        Icon: Lock,
        title: 'Secure & Private',
        tagline: 'Data Protection',
        description:
            'Your data is encrypted end-to-end and never shared with third parties. Apply with confidence knowing your personal information is safe and secure.',
        accent: 'from-amber-500 to-yellow-400',
        glowColor: 'rgba(245, 158, 11, 0.25)',
        iconColor: 'text-amber-400',
        imageUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=600&fit=crop&q=80',
    },
    {
        Icon: Smartphone,
        title: 'Mobile Friendly',
        tagline: 'Apply Anywhere',
        description:
            'Apply for scholarships on the go. Our platform works seamlessly on all devices — phone, tablet, or desktop. Your opportunity is always in your pocket.',
        accent: 'from-pink-500 to-rose-400',
        glowColor: 'rgba(236, 72, 153, 0.25)',
        iconColor: 'text-pink-400',
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
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Section header */}
                <div className="text-center mb-16">
                    <p className="text-blue-600 dark:text-sky-400 font-semibold mb-3 tracking-wide uppercase text-sm">
                        Why ScholarHub?
                    </p>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
                        Everything you need to
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
                            {' '}succeed
                        </span>
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-light">
                        From discovery to disbursement, ScholarHub handles every step of your scholarship journey with unparalleled precision.
                    </p>
                </div>

                {/* 3D Tilt Feature Cards Grid */}
                <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                    style={{ perspective: "1200px" }}
                >
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={feature.title}
                            title={feature.title}
                            tagline={feature.tagline}
                            description={feature.description}
                            Icon={feature.Icon}
                            accent={feature.accent}
                            glowColor={feature.glowColor}
                            iconColor={feature.iconColor}
                            imageUrl={feature.imageUrl}
                            index={index}
                            total={features.length}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
