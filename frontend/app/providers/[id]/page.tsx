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
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <p className="text-sm font-medium text-muted-foreground">Syncing with Provider Node...</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Provider Not Found</h1>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-indigo-500/30">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-24 pb-12 space-y-12">
        {/* Breadcrumb / Back */}
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Return to Registry
        </button>

        {/* Hero Header */}
        <section className="flex flex-col md:flex-row items-center gap-8 bg-card border shadow-sm rounded-2xl p-8 md:p-10 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
              <Building2 size={200} />
           </div>
           
           <div className="w-32 h-32 rounded-2xl bg-muted border shadow-sm shrink-0">
              <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center text-4xl font-bold text-muted-foreground overflow-hidden">
                 {provider.logo ? (
                   <img src={provider.logo} alt={provider.orgName} className="w-full h-full object-cover" />
                 ) : (
                   provider.orgName?.[0]?.toUpperCase() || 'P'
                 )}
              </div>
           </div>

           <div className="flex-1 text-center md:text-left space-y-4">
              <div className="space-y-2">
                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                       {provider.orgName}
                    </h1>
                    {provider.verificationStatus === 'APPROVED' && (
                       <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                          <ShieldCheck size={14} /> Verified Entity
                       </span>
                    )}
                 </div>
                 <p className="text-muted-foreground text-base max-w-2xl leading-relaxed">
                    Registered {provider.orgType} within the ScholarHub ecosystem. Committed to academic mobility and accessible grants.
                 </p>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2">
                 <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <MapPin size={16} className="text-blue-500" /> Global Operations
                 </div>
                 <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Award size={16} className="text-blue-500" /> {provider._count?.scholarships || 0} Programs
                 </div>
                 <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Users size={16} className="text-blue-500" /> {provider._count?.reviews || 0} Endorsements
                 </div>
              </div>
           </div>
        </section>

        <div className="space-y-16">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-stretch">
              {/* Left Column: Trust Analysis */}
              <div className="lg:col-span-2 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <h2 className="text-lg font-semibold text-foreground">Audit & Credibility</h2>
                 </div>
                 <TrustScoreBreakdown 
                    score={provider.trustScore} 
                    verificationStatus={provider.verificationStatus}
                    totalReviews={provider._count?.reviews || 0}
                    totalScholarships={provider._count?.scholarships || 0}
                 />
              </div>

              {/* Right Column: Testimonials */}
              <div className="space-y-6 h-full flex flex-col">
                 <div className="flex items-center gap-3 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <h2 className="text-lg font-semibold text-foreground">Student Consensus</h2>
                 </div>

                 <div className="space-y-4 flex-1 flex flex-col">
                    {reviews.length > 0 ? reviews.map((r, i) => (
                       <motion.div 
                         key={i}
                         initial={{ opacity: 0, x: 20 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: i * 0.1 }}
                         className="p-5 bg-card border shadow-sm rounded-xl space-y-4"
                       >
                          <div className="flex items-center justify-between">
                             <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} size={12} className={cn(s <= r.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20")} />
                                ))}
                             </div>
                             <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-foreground/80 leading-relaxed">
                             "{r.comment || 'Outstanding experience.'}"
                          </p>
                          <div className="pt-2 flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-medium">{r.student?.name?.[0] || 'S'}</div>
                             <span className="text-xs text-muted-foreground font-medium">Verified Scholar</span>
                          </div>
                       </motion.div>
                    )) : (
                       <div className="p-8 bg-muted/30 border border-dashed rounded-xl flex flex-col items-center justify-center text-center space-y-3 flex-1 h-full">
                          <MessageSquare className="mx-auto text-muted-foreground/40" size={32} />
                          <p className="text-sm font-medium text-muted-foreground">Zero feedback entries recorded in registry.</p>
                       </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Full Width Bottom: Active Scholarships */}
           <section className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
                 <h2 className="text-lg font-semibold text-foreground">Active Initiatives</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {provider.scholarships?.map((s: any) => (
                   <motion.div 
                     key={s.id}
                     whileHover={{ y: -4 }}
                     className="p-5 bg-card border shadow-sm rounded-xl flex flex-col space-y-4 hover:border-blue-500/50 transition-colors group"
                   >
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[56px]">
                         {s.title}
                      </h3>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border flex-1">
                         <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Grant Value</p>
                            <p className="flex items-center gap-1 text-emerald-600 dark:text-emerald-500 font-semibold text-sm">
                               <IndianRupee size={14} /> {s.amount?.toLocaleString()}
                            </p>
                         </div>
                         <div className="text-right">
                            <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Deadline</p>
                            <p className="flex items-center justify-end gap-1 text-foreground font-medium text-sm">
                               <Calendar size={14} /> {new Date(s.deadline).toLocaleDateString()}
                            </p>
                         </div>
                      </div>
                      <Button 
                        onClick={() => router.push(`/dashboard/student/scholarships/${s.id}`)}
                        className="w-full mt-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg py-2 text-sm font-medium transition-colors"
                      >
                         Inspect Protocol <ChevronRight size={16} className="ml-2" />
                      </Button>
                   </motion.div>
                 ))}
              </div>
           </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
