'use client';

import React, { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactPage() {
    const [result, setResult] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const onSubmit = async (event: any) => {
        event.preventDefault();
        setResult("TRANSMITTING PAYLOAD...");
        setStatus("loading");
        
        const formData = new FormData(event.target);
        formData.append("access_key", "8e7ccc74-dfe4-4562-b775-835d5015087f");

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setResult("TRANSMISSION SUCCESSFUL — PROTOCOL ESTABLISHED");
                setStatus("success");
                event.target.reset();
            } else {
                setResult("TRANSMISSION FAILED — SYSTEM ERROR");
                setStatus("error");
            }
        } catch (error) {
            setResult("NETWORK TIMEOUT — RETRY PROTOCOL");
            setStatus("error");
        }
    };

    return (
        <div className="bg-background min-h-screen">
            <Navbar />
            <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto relative z-10">
                
                {/* Header Section */}
                <div className="text-left mb-24 border-l border-primary/20 pl-10">
                    <h1 className="text-7xl md:text-9xl font-bold tracking-tighter text-foreground italic uppercase leading-none mb-8">
                        Get in <br />
                        <span className="text-primary">Touch.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground italic leading-relaxed max-w-2xl">
                        Have questions about scholarship matching or need technical protocol support? Our enclave is here to assist.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-0 border border-border">
                    
                    {/* Contact Info Bento */}
                    <div className="lg:col-span-1 border-r border-border divide-y divide-border">
                        <div className="p-12 space-y-4 hover:bg-secondary/10 transition-all group">
                            <div className="w-12 h-12 border border-border bg-background flex items-center justify-center group-hover:border-primary transition-all">
                                <Mail size={20} className="text-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2 italic">Direct Routing</p>
                                <h3 className="text-2xl font-bold text-foreground italic uppercase tracking-tight mb-2">Email</h3>
                                <a href="mailto:sksujonhaque@gmail.com" className="text-muted-foreground hover:text-foreground transition-colors italic break-all">
                                    sksujonhaque@gmail.com
                                </a>
                            </div>
                        </div>

                        <div className="p-12 space-y-4 hover:bg-secondary/10 transition-all group">
                            <div className="w-12 h-12 border border-border bg-background flex items-center justify-center group-hover:border-primary transition-all">
                                <Phone size={20} className="text-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2 italic">Live Voice</p>
                                <h3 className="text-2xl font-bold text-foreground italic uppercase tracking-tight mb-2">Phone</h3>
                                <p className="text-muted-foreground italic">7478860892</p>
                            </div>
                        </div>

                        <div className="p-12 space-y-4 hover:bg-secondary/10 transition-all group">
                            <div className="w-12 h-12 border border-border bg-background flex items-center justify-center group-hover:border-primary transition-all">
                                <MapPin size={20} className="text-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2 italic">Institutional Node</p>
                                <h3 className="text-2xl font-bold text-foreground italic uppercase tracking-tight mb-2">Office</h3>
                                <p className="text-muted-foreground italic leading-relaxed">
                                    Lovely Professional University, <br />
                                    Jalandhar - Delhi G.T. Road, <br />
                                    Phagwara, Punjab (India) - 144411
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form Bento */}
                    <div className="lg:col-span-2 p-12 md:p-20 bg-secondary/5 relative overflow-hidden group">
                        {/* Decorative Background Icon */}
                        <MessageSquare className="absolute -bottom-10 -right-10 w-64 h-64 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity" />
                        
                        <form onSubmit={onSubmit} className="relative z-10 space-y-10">
                            <div className="grid md:grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] italic">Identification</label>
                                    <input 
                                        name="first_name"
                                        required
                                        placeholder="FIRST NAME"
                                        className="w-full bg-background border border-border px-6 py-4 outline-none focus:border-primary transition-all font-bold italic uppercase tracking-widest placeholder:text-muted-foreground/30" 
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] italic">Lineage</label>
                                    <input 
                                        name="last_name"
                                        required
                                        placeholder="LAST NAME"
                                        className="w-full bg-background border border-border px-6 py-4 outline-none focus:border-primary transition-all font-bold italic uppercase tracking-widest placeholder:text-muted-foreground/30" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] italic">Communications Node</label>
                                <input 
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="EMAIL@PROTOCOL.COM"
                                    className="w-full bg-background border border-border px-6 py-4 outline-none focus:border-primary transition-all font-bold italic uppercase tracking-widest placeholder:text-muted-foreground/30" 
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] italic">Transmission Payload</label>
                                <textarea 
                                    name="message"
                                    required
                                    placeholder="ENTER MESSAGE PROTOCOL"
                                    className="w-full bg-background border border-border px-6 py-4 outline-none focus:border-primary transition-all font-bold italic uppercase tracking-widest placeholder:text-muted-foreground/30 h-48 resize-none" 
                                />
                            </div>

                            <div className="space-y-6">
                                <button 
                                    type="submit"
                                    disabled={status === "loading"}
                                    className="h-20 px-16 bg-primary text-primary-foreground font-bold text-xl hover:bg-primary/90 transition-all italic border border-primary relative group/btn overflow-hidden w-full sm:w-auto disabled:opacity-50"
                                >
                                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary-foreground/30" />
                                    {status === "loading" ? "ROUTING..." : "SEND TRANSMISSION"}
                                    <Send size={20} className="inline-block ml-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                </button>

                                <AnimatePresence>
                                    {result && (
                                        <motion.div 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0 }}
                                            className={`flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest italic ${
                                                status === "success" ? "text-emerald-500" : status === "error" ? "text-destructive" : "text-primary"
                                            }`}
                                        >
                                            {status === "success" && <CheckCircle2 size={14} />}
                                            {status === "error" && <XCircle size={14} />}
                                            {result}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Technical Footer Label */}
                <div className="mt-12 flex items-center justify-between opacity-20">
                    <div className="text-[10px] font-mono tracking-[0.4em] uppercase italic">Contact Interface v4.2</div>
                    <div className="flex gap-4">
                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-1.5 h-1.5 bg-border" />)}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
