'use client';

import React, { useState } from 'react';
import { BellRing, Mail, CheckCircle2, Send, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NewsletterAlerts() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubscribed(true);
        setEmail('');
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-32 relative bg-background border-b border-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="border border-border p-12 md:p-24 relative overflow-hidden bg-secondary/5">
          
          <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
            <Zap size={200} />
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-20 relative z-10 text-left">
            
            <div className="flex-1">
              <div className="w-12 h-12 border border-border bg-background flex items-center justify-center mb-10 group-hover:border-primary transition-all">
                <BellRing className="w-5 h-5 text-primary" />
              </div>
              
              <h3 className="text-6xl md:text-7xl font-serif font-extrabold text-foreground tracking-tighter mb-8 leading-none">
                Get new <br /> 
                <span className="text-primary italic">scholarship alerts.</span>
              </h3>
              <p className="text-muted-foreground text-xl leading-relaxed max-w-lg border-l border-primary/20 pl-8 font-sans">
                Join thousands of students who receive the best scholarship matches directly in their inbox every week.
              </p>
            </div>

            <div className="w-full lg:w-[450px] shrink-0">
              {subscribed ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border border-primary/20 bg-primary/5 p-12 flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="w-16 h-16 border border-primary flex items-center justify-center bg-background">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="text-foreground font-bold text-2xl uppercase tracking-tighter">You're Subscribed!</h4>
                  <p className="text-muted-foreground text-lg leading-snug">We'll send the latest scholarships to your email soon.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-0 border border-border shadow-2xl">
                  <div className="relative border-b border-border">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full h-24 px-10 bg-background text-foreground font-bold text-lg placeholder:text-muted-foreground/30 focus:outline-none focus:bg-secondary/50 transition-all tracking-wide"
                      disabled={loading}
                    />
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20">
                        <Mail size={24} />
                    </div>
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={loading}
                    className="h-24 bg-primary text-primary-foreground font-bold text-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-4 relative group overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary-foreground/30" />
                    {loading ? 'SENDING...' : 'JOIN NEWSLETTER'}
                    <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>

                  {error && (
                    <div className="p-4 bg-destructive/10 text-destructive text-[11px] font-bold border-t border-destructive/20 text-center uppercase tracking-widest">
                        {error}
                    </div>
                  )}
                </form>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
