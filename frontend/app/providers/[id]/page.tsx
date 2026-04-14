'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Globe, 
  Mail, 
  ShieldCheck, 
  Award,
  ChevronRight,
  Loader2,
  ExternalLink,
  MessageSquare,
  Star,
  ArrowLeft,
  Calendar,
  IndianRupee,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/app/lib/api';
import { TrustScoreBreakdown } from '@/components/provider/TrustScoreBreakdown';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';

export default function PublicProviderProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    fetchProviderData();
  }, [id]);

  const fetchProviderData = async () => {
    try {
      setLoading(true);
      const [provRes, revRes] = await Promise.all([
        api.get(`providers/${id}`),
        api.get(`reviews/provider/${id}`, { params: { limit: 10 } })
      ]);
      setProvider(provRes.data);
      setReviews(revRes.data.reviews);
    } catch (error) {
      console.error('Failed to fetch provider:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] font-black">Syncing with Provider Node...</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-black uppercase">Provider Not Found</h1>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-indigo-500/30">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-32 space-y-20">
        {/* Breadcrumb / Back */}
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all font-mono text-[10px] uppercase tracking-[0.2em]"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
          Return to Registry
        </button>

        {/* Hero Header */}
        <section className="flex flex-col md:flex-row items-center gap-10 bg-card border border-border rounded-[64px] p-12 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Building2 size={240} />
           </div>
           
           <div className="w-40 h-40 rounded-[48px] bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px] shadow-2xl shrink-0">
              <div className="w-full h-full rounded-[47px] bg-card flex items-center justify-center text-5xl font-black text-foreground overflow-hidden">
                 {provider.logo ? (
                   <img src={provider.logo} alt={provider.orgName} className="w-full h-full object-cover" />
                 ) : (
                   provider.orgName?.[0]?.toUpperCase() || 'P'
                 )}
              </div>
           </div>

           <div className="flex-1 text-center md:text-left space-y-6">
              <div className="space-y-2">
                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter uppercase leading-none">
                       {provider.orgName}
                    </h1>
                    {provider.verificationStatus === 'APPROVED' && (
                       <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-mono uppercase tracking-[0.2em] flex items-center gap-2 font-black">
                          <ShieldCheck size={12} /> Verified Entity
                       </span>
                    )}
                 </div>
                 <p className="text-muted-foreground text-sm font-mono max-w-2xl uppercase font-black tracking-tight opacity-70">
                    Registered {provider.orgType} within the ScholarHub ecosystem. Committed to academic mobility and accessible grants.
                 </p>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-8">
                 <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase font-black">
                    <MapPin size={14} className="text-indigo-500" /> Global Operations
                 </div>
                 <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase font-black">
                    <Award size={14} className="text-indigo-500" /> {provider._count?.scholarships || 0} Programs
                 </div>
                 <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase font-black">
                    <Users size={14} className="text-indigo-500" /> {provider._count?.reviews || 0} Endorsements
                 </div>
              </div>
           </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           {/* Left Column: Trust Analysis */}
           <div className="lg:col-span-2 space-y-12">
              <section className="space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                    <h2 className="text-[10px] font-mono font-black text-indigo-400 uppercase tracking-[0.4em]">Audit & Credibility</h2>
                 </div>
                 <TrustScoreBreakdown 
                    score={provider.trustScore} 
                    verificationStatus={provider.verificationStatus}
                    totalReviews={provider._count?.reviews || 0}
                    totalScholarships={provider._count?.scholarships || 0}
                 />
              </section>

              {/* Active Scholarships */}
              <section className="space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                    <h2 className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-[0.4em]">Active Initiatives</h2>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {provider.scholarships?.map((s: any) => (
                      <motion.div 
                        key={s.id}
                        whileHover={{ y: -5 }}
                        className="p-6 bg-card border border-border rounded-[32px] space-y-6 hover:border-indigo-500/30 transition-all group"
                      >
                         <h3 className="text-xl font-black text-foreground tracking-tight group-hover:text-indigo-500 transition-colors line-clamp-2 min-h-[56px] uppercase leading-none">
                            {s.title}
                         </h3>
                         <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed border-border/40">
                            <div>
                               <p className="text-[9px] font-mono text-muted-foreground uppercase font-black mb-1">Grant Value</p>
                               <p className="flex items-center gap-1 text-emerald-500 font-mono font-black text-sm">
                                  <IndianRupee size={12} /> {s.amount?.toLocaleString()}
                               </p>
                            </div>
                            <div className="text-right">
                               <p className="text-[9px] font-mono text-muted-foreground uppercase font-black mb-1">Deadline</p>
                               <p className="flex items-center justify-end gap-1 text-foreground font-mono font-black text-sm uppercase">
                                  <Calendar size={12} /> {new Date(s.deadline).toLocaleDateString()}
                               </p>
                            </div>
                         </div>
                         <Button 
                           onClick={() => router.push(`/dashboard/student/scholarships/${s.id}`)}
                           className="w-full bg-accent hover:bg-indigo-500 hover:text-white rounded-2xl text-[10px] uppercase font-black tracking-widest transition-all"
                         >
                            Inspect Protocol <ChevronRight size={14} className="ml-2" />
                         </Button>
                      </motion.div>
                    ))}
                 </div>
              </section>
           </div>

           {/* Right Column: Testimonials */}
           <div className="space-y-8">
              <div className="flex items-center gap-4">
                 <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                 <h2 className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-[0.4em]">Student Consensus</h2>
              </div>

              <div className="space-y-4">
                 {reviews.length > 0 ? reviews.map((r, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-6 bg-card border border-border rounded-3xl space-y-4"
                    >
                       <div className="flex items-center justify-between">
                          <div className="flex items-center">
                             {[1, 2, 3, 4, 5].map((s) => (
                               <Star key={s} size={10} className={cn(s <= r.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20")} />
                             ))}
                          </div>
                          <span className="text-[9px] font-mono text-muted-foreground font-bold">{new Date(r.createdAt).toLocaleDateString()}</span>
                       </div>
                       <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                          "{r.comment || 'Outstanding experience.'}"
                       </p>
                       <div className="pt-2 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-accent flex items-center justify-center text-[10px] font-black">{r.student?.name?.[0] || 'S'}</div>
                          <span className="text-[9px] font-mono text-muted-foreground uppercase font-black opacity-60">Verified Scholar</span>
                       </div>
                    </motion.div>
                 )) : (
                    <div className="p-12 bg-accent/20 border border-dashed border-border rounded-[48px] text-center space-y-4">
                       <MessageSquare className="mx-auto text-muted-foreground/20" size={40} />
                       <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest font-black">Zero feedback entries recorded in registry.</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
