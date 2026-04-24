'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, CheckCircle2, Star, Zap, Search, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const guides = [
    {
        title: "Winning Essay Tips",
        description: "How to write a scholarship essay that stands out to the selection committee.",
        icon: FileText,
        steps: ["Be Authentic", "Show Impact", "Proofread Twice"]
    },
    {
        title: "Application Checklist",
        description: "A complete list of documents you need for almost every major scholarship.",
        icon: CheckCircle2,
        steps: ["Aadhar Card", "Income Certificate", "Marksheets"]
    },
    {
        title: "Deadlines Master",
        description: "Never miss an application deadline again with our tracking system.",
        icon: Zap,
        steps: ["Set Alerts", "Early Submission", "Renewal Reminders"]
    }
];

export default function GuidesPage() {
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
            <GraduationCap size={14} />
            Resource Center
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-serif font-black tracking-tighter leading-none mb-8 uppercase"
          >
            How to Win <br />
            & <span className="text-primary italic">Succeed.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-xl max-w-2xl leading-relaxed"
          >
            Our expert guides provide step-by-step instructions on how to find, apply for, and win scholarships in India.
          </motion.p>
        </div>

        {/* Guides List */}
        <div className="space-y-0 border border-border">
          {guides.map((guide, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="group flex flex-col md:flex-row items-stretch border-b last:border-b-0 border-border hover:bg-secondary/5 transition-all"
            >
              <div className="w-full md:w-80 p-12 flex items-center justify-center border-b md:border-b-0 md:border-r border-border shrink-0">
                <div className="w-20 h-20 border border-border bg-background flex items-center justify-center group-hover:border-primary transition-all">
                  <guide.icon size={32} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
              
              <div className="flex-1 p-12 space-y-8">
                <div className="space-y-4">
                  <h3 className="text-4xl font-bold tracking-tighter uppercase">{guide.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">{guide.description}</p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  {guide.steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-2 border border-border bg-background text-[11px] font-bold uppercase tracking-widest text-foreground">
                      <div className="w-1 h-1 bg-primary rounded-full" />
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-12 flex items-center justify-center border-t md:border-t-0 md:border-l border-border shrink-0">
                <Button variant="outline" className="h-16 px-10 rounded-none font-bold border-border hover:border-primary transition-all">
                  READ GUIDE
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Expert Support CTA */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="p-12 border border-border bg-secondary/5 relative overflow-hidden">
                <Search size={40} className="text-primary mb-8" />
                <h4 className="text-2xl font-bold mb-4 uppercase tracking-tighter">Need more help?</h4>
                <p className="text-muted-foreground mb-8">Our expert advisors can help you with specific questions about your application.</p>
                <Button className="rounded-none font-bold italic h-12 px-8">CHAT WITH US</Button>
            </div>
            <div className="p-12 border border-border bg-primary text-primary-foreground relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Star size={100} />
                </div>
                <BookOpen size={40} className="mb-8" />
                <h4 className="text-2xl font-bold mb-4 uppercase tracking-tighter">Join the Academy</h4>
                <p className="opacity-80 mb-8">Get access to our premium video series on mastering the scholarship landscape.</p>
                <Button variant="secondary" className="rounded-none font-bold italic h-12 px-8">WATCH VIDEOS</Button>
            </div>
        </div>

      </div>
    </div>
  );
}
