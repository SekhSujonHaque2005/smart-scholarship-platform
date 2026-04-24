'use client';

import React from 'react';
import { Sparkles, GraduationCap, BookOpen, UserCircle, Globe, Zap, ShieldCheck, Microscope } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TargetAudience() {
  const audiences = [
    {
      title: "Undergraduates",
      description: "Get help with tuition, books, and living costs for your college degree.",
      icon: GraduationCap,
      span: "md:col-span-1"
    },
    {
      title: "Specialized Grants",
      description: "Scholarships for women and underrepresented groups in tech and science.",
      icon: Globe,
      span: "md:col-span-1"
    },
    {
      title: "Research & Masters",
      description: "Find funding for your Masters or PhD research projects and fellowships.",
      icon: Microscope,
      span: "md:col-span-1"
    },
    {
      title: "Need-Based Aid",
      description: "Financial help for students who need it most, regardless of their background.",
      icon: UserCircle,
      span: "md:col-span-1"
    },
    {
      title: "Merit Scholarships",
      description: "Get rewarded for your high grades and outstanding achievements in school.",
      icon: Sparkles,
      span: "md:col-span-1"
    },
    {
      title: "Study Abroad",
      description: "Find scholarships to help you study at top universities around the world.",
      icon: Zap,
      span: "md:col-span-1"
    }
  ];

  return (
    <section className="py-6 relative overflow-hidden bg-background border-b border-border">
      
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="flex flex-col md:flex-row items-end justify-between gap-12 mb-12">
          <div className="max-w-3xl text-left">
            <h2 className="text-6xl md:text-8xl font-bold text-foreground tracking-tighter leading-[0.85] mb-4">
              Built for every <br />
              step of <span className="text-primary">your journey.</span>
            </h2>
          </div>
          <div className="max-w-md pb-4 border-l border-primary/20 pl-8">
            <p className="text-muted-foreground text-xl leading-relaxed">
              From your first year in college to advanced research, we help you find the money you need.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-border">
          {audiences.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className={`group relative border-r border-b border-border bg-secondary/5 p-12 flex flex-col min-h-[320px] hover:bg-secondary/10 transition-all ${item.span}`}
            >
              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="mb-10">
                <div className="w-14 h-14 border border-border bg-background flex items-center justify-center group-hover:border-primary transition-all group-hover:bg-primary/5">
                  <item.icon className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
              
              <div className="mt-auto space-y-6">
                <div>
                  <h3 className="text-3xl font-bold text-foreground tracking-tight uppercase">
                    {item.title}
                  </h3>
                </div>
                <p className="text-muted-foreground text-base leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>


      </div>
    </section>
  );
}
