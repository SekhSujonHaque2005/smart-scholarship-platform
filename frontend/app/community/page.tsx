'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, MessageSquare, Star, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const stories = [
    {
        name: "Rahul Sharma",
        role: "Undergraduate Student",
        story: "ScholarHub helped me find a private scholarship that covered my entire engineering tuition. The matching was spot on!",
        tag: "Success Story",
        scholarship: "Reliance Foundation Grant"
    },
    {
        name: "Priya Patel",
        role: "Research Scholar",
        story: "I was struggling to find funding for my PhD research. ScholarHub matched me with an international fellowship within days.",
        tag: "Research Funding",
        scholarship: "Global Excellence Fellowship"
    },
    {
        name: "Ananya Iyer",
        role: "High School Senior",
        story: "The step-by-step guides made the application process so much less stressful. I won two merit-based awards!",
        tag: "Merit Award",
        scholarship: "KVPY Scholarship"
    }
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="mb-24 text-left border-l border-primary/20 pl-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 text-primary font-bold text-[10px] uppercase tracking-[0.4em] mb-6"
          >
            <Users size={14} />
            Community Hub
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-serif font-black tracking-tighter leading-none mb-8 uppercase"
          >
            Student Stories <br />
            & <span className="text-primary italic">Success.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-xl max-w-2xl leading-relaxed"
          >
            Read how other students are funding their dreams and get tips on how to improve your own scholarship applications.
          </motion.p>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-border">
          {stories.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-12 border-r last:border-r-0 border-border hover:bg-secondary/5 transition-all group relative"
            >
              <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight size={20} />
              </div>
              <div className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest inline-block mb-8">
                {item.tag}
              </div>
              <div className="space-y-6">
                <p className="text-xl font-medium leading-relaxed italic text-foreground">
                  "{item.story}"
                </p>
                <div className="pt-8 border-t border-border mt-8">
                  <h4 className="font-bold text-foreground">{item.name}</h4>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-widest mt-1">{item.role}</p>
                </div>
                <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase mt-4">
                  <Star size={12} fill="currentColor" />
                  Won: {item.scholarship}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Community CTA */}
        <div className="mt-24 bg-secondary/5 border border-border p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
                <MessageSquare size={300} />
            </div>
            <div className="max-w-xl">
                <h2 className="text-4xl font-bold tracking-tighter mb-4 uppercase">Share Your Story</h2>
                <p className="text-muted-foreground">Won a scholarship via ScholarHub? Join our community and inspire other students to fund their education.</p>
            </div>
            <Button size="lg" className="h-16 px-10 rounded-none font-bold italic tracking-wider">
                JOIN THE COMMUNITY
            </Button>
        </div>

      </div>
    </div>
  );
}
