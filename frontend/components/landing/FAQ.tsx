'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Terminal, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
    {
        question: "IS SCHOLARHUB COMPLETELY FREE FOR STUDENTS?",
        answer: "Yes! ScholarHub is 100% free for all students. We are funded via direct institutional enclaves and partner organizations who prioritize talented student routing."
    },
    {
        question: "HOW DOES THE NEURAL MATCHING ALGORITHM WORK?",
        answer: "Our AI analyzes over 200 data points from your profile—including academic telemetry, extracurricular markers, and socio-economic enclaves—to find scholarships with the highest statistical probability of success."
    },
    {
        question: "ARE THE SCHOLARSHIPS ON THE PLATFORM VERIFIED?",
        answer: "Every scholarship listed on ScholarHub undergoes a rigorous verification protocol. We perform deep-vetted background checks on providers and verify fund availability before deployment."
    },
    {
        question: "DO I NEED TO FILL OUT A SEPARATE APPLICATION FOR EACH?",
        answer: "Many scholarships support 'One-Click Routing', which utilizes your master profile to automatically populate and submit the required documentation to institutional servers."
    },
    {
        question: "HOW LONG DOES IT TAKE TO HEAR BACK AFTER APPLYING?",
        answer: "Response times vary by institutional node, typically ranging from 2 to 8 weeks. However, our real-time telemetry ensures you receive instant notifications via secure pings."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-24 relative bg-background border-b border-border overflow-hidden">
            
            {/* Background Decorative Element */}
            <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] bg-primary/5 blur-[140px] rounded-full pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <div className="text-left mb-20">
                    <h2 className="text-6xl md:text-8xl font-bold text-foreground tracking-tighter italic leading-[0.85] mb-6 uppercase">
                        FREQUENTLY ASKED <br />
                        <span className="text-primary">QUESTIONS.</span>
                    </h2>
                    <p className="text-muted-foreground text-xl italic leading-relaxed border-l border-primary/20 pl-8 max-w-2xl">
                        A detailed breakdown of how our platform matches you with the right scholarship opportunities.
                    </p>
                </div>

                <div className="space-y-1">
                    {faqs.map((faq, idx) => {
                        const isOpen = openIndex === idx;
                        return (
                            <div 
                                key={idx} 
                                className={`border border-border transition-all duration-300 overflow-hidden ${
                                    isOpen ? 'bg-secondary/10' : 'bg-transparent'
                                }`}
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                                    className="w-full text-left px-10 py-8 flex items-center justify-between gap-8 focus:outline-none group"
                                >
                                    <span className={`text-2xl font-bold italic tracking-tighter transition-colors ${isOpen ? 'text-primary' : 'text-foreground/70 group-hover:text-foreground'}`}>
                                        {faq.question}
                                    </span>
                                    <ChevronDown 
                                        size={20} 
                                        className={`shrink-0 text-primary transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} 
                                    />
                                </button>
                                
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                            className="px-10 pb-10"
                                        >
                                            <p className="text-muted-foreground text-lg leading-relaxed italic border-t border-border pt-8">
                                                {faq.answer}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
                
                <div className="mt-12 text-center">
                    <p className="text-muted-foreground italic text-lg">
                        Still have questions? <a href="mailto:sksujonhaque@gmail.com" className="text-foreground font-bold underline underline-offset-[12px] decoration-primary/30 hover:decoration-primary transition-all uppercase">ROUTE TO SUPPORT ENCLAVE</a>
                    </p>
                </div>
            </div>
        </section>
    );
}
