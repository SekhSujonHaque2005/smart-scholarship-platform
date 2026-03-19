'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
    {
        question: "Is ScholarHub completely free for students?",
        answer: "Yes! ScholarHub is 100% free for all students. We are funded by educational institutions and partner organizations who want to connect with talented students like you."
    },
    {
        question: "How does the AI matching algorithm work?",
        answer: "Our AI analyzes over 50 data points from your profile—including academics, extracurriculars, location, and family income—to find scholarships where you have the highest statistical probability of success, saving you hundreds of hours of manual searching."
    },
    {
        question: "Are the scholarships on the platform verified?",
        answer: "Absolutely. Every scholarship listed on ScholarHub undergoes a strict verification process. We background-check the provider and ensure the funds exist before they are allowed on our platform. No scams, guaranteed."
    },
    {
        question: "Do I need to fill out a separate application for each scholarship?",
        answer: "Many scholarships on our platform support 'One-Click Apply', which uses your master profile to automatically fill out and submit the application. Some external scholarships may still require you to visit their portal, but we'll guide you through the process."
    },
    {
        question: "How long does it take to hear back after applying?",
        answer: "Response times vary by provider, typically ranging from 2 to 8 weeks after the deadline. However, with our Real-Time Tracking, you'll get instant notifications when your application is reviewed or shortlisted."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-24 relative bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-white/[0.05] transition-colors duration-500">
            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                        Everything you need to know about how ScholarHub works.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => {
                        const isOpen = openIndex === idx;
                        return (
                            <div 
                                key={idx} 
                                className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                                    isOpen 
                                        ? 'bg-white dark:bg-slate-800/80 border-blue-200 dark:border-blue-500/30 shadow-[0_10px_30px_rgba(59,130,246,0.05)] dark:shadow-[0_10px_30px_rgba(59,130,246,0.1)]' 
                                        : 'bg-transparent dark:bg-slate-950/50 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-white/50 dark:hover:bg-slate-900'
                                }`}
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus:outline-none"
                                >
                                    <span className={`font-semibold text-lg transition-colors ${isOpen ? 'text-blue-600 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {faq.question}
                                    </span>
                                    <ChevronDown 
                                        size={20} 
                                        className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} 
                                    />
                                </button>
                                
                                <div 
                                    className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                                        isOpen ? 'max-h-48 opacity-100 pb-6' : 'max-h-0 opacity-0 pb-0'
                                    }`}
                                >
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                <div className="mt-12 text-center">
                    <p className="text-slate-600 dark:text-slate-500">
                        Still have questions? <a href="mailto:support@scholarhub.in" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium underline underline-offset-4">Contact our support team</a>.
                    </p>
                </div>
            </div>
        </section>
    );
}
