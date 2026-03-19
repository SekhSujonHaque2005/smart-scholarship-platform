'use client';

import React, { useState } from 'react';
import { BellRing, Mail, CheckCircle2 } from 'lucide-react';

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
    <section className="py-20 relative bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-white/[0.05] transition-colors duration-500">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-500/20 rounded-[2rem] p-8 md:p-12 relative overflow-hidden shadow-[0_0_40px_rgba(79,70,229,0.05)] dark:shadow-[0_0_40px_rgba(79,70,229,0.1)]">
          
          {/* Subtle glowing orb inside the card */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
            
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 mb-6 shadow-[0_0_15px_rgba(99,102,241,0.1)] dark:shadow-[0_0_15px_rgba(99,102,241,0.3)] border border-indigo-100 dark:border-indigo-500/30">
                <BellRing className="w-6 h-6 animate-[wiggle_2s_ease-in-out_infinite]" />
              </div>
              
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                Not ready to build a profile yet?
              </h3>
              <p className="text-slate-600 dark:text-indigo-100/70 text-base max-w-md mx-auto md:mx-0">
                Drop your email to get weekly alerts on the top 5 newest scholarships available for Indian students. No spam, ever.
              </p>
            </div>

            <div className="w-full md:w-[400px] shrink-0">
              {subscribed ? (
                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 dark:text-emerald-400 mb-3" />
                  <h4 className="text-emerald-700 dark:text-emerald-400 font-bold text-lg">You're on the list!</h4>
                  <p className="text-emerald-600 dark:text-emerald-400/70 text-sm">Keep an eye on your inbox for upcoming scholarship alerts.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="relative flex flex-col gap-3">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400 dark:text-indigo-400/50 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="block w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-indigo-500/30 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-indigo-200/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all shadow-sm dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] disabled:opacity-50"
                      disabled={loading}
                    />
                  </div>
                  
                  {error && (
                    <p className="text-red-500 dark:text-red-400 text-sm text-center font-medium animate-in fade-in">{error}</p>
                  )}

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 disabled:bg-indigo-400 dark:disabled:bg-indigo-500/50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-md dark:shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:shadow-none flex items-center justify-center gap-2 group"
                  >
                    {loading ? 'Subscribing...' : 'Subscribe to Alerts'}
                    {!loading && <BellRing className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
                  </button>
                  <p className="text-center text-[11px] text-slate-500 uppercase tracking-widest mt-2">
                    Unsubscribe at any time
                  </p>
                </form>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
