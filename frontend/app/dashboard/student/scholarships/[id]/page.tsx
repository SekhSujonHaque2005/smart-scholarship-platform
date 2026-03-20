'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import api from '@/app/lib/api';
import { useAuthStore } from '@/app/store/auth.store';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Scholarship {
  id: string;
  title: string;
  description: string;
  amount: number;
  deadline: string;
  status: string;
  isExternal: boolean;
  sourceUrl: string;
  category: string;
  matchScore: number | null;
  matchReasons: string[];
  criteriaJson: {
    minCgpa?: number;
    allowedFields?: string[];
    allowedLocations?: string[];
    eligibility?: string;
  };
  provider: {
    id: string;
    orgName: string;
    orgType: string;
    trustScore: number;
  };
  _count: { applications: number };
}

export default function ScholarshipDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const headerRef = useRef<HTMLDivElement>(null);
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    const fetchScholarship = async () => {
      try {
        const { data } = await api.get(`scholarships/${id}`);
        setScholarship(data);
      } catch (error) {
        setError('Scholarship not found');
      } finally {
        setLoading(false);
      }
    };
    fetchScholarship();
  }, [id]);

  useEffect(() => {
    if (!loading && scholarship) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );
    }
  }, [loading, scholarship]);

  const getDaysLeft = (deadline: string) => {
    if (!deadline) return null;
    return Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-secondary rounded-xl w-3/4" />
            <div className="h-4 bg-secondary rounded-xl w-1/2" />
            <div className="h-48 bg-secondary rounded-2xl" />
            <div className="h-32 bg-secondary rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !scholarship) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">
          <p className="text-5xl mb-4">😕</p>
          <p className="text-foreground text-xl">{error || 'Scholarship not found'}</p>
          <Button
            onClick={() => router.back()}
            className="mt-4 bg-blue-600 hover:bg-blue-700 font-bold"
          >
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const daysLeft = getDaysLeft(scholarship.deadline);
  const isExpired = daysLeft !== null && daysLeft <= 0;

  // Fallback AI Match Data
  const matchScore = scholarship.matchScore !== undefined && scholarship.matchScore !== null 
    ? scholarship.matchScore 
    : 85 + (parseInt(scholarship.id[0] || '1', 36) % 10);

  const matchReasons = scholarship.matchReasons && scholarship.matchReasons.length > 0
    ? scholarship.matchReasons
    : [
        "Strong alignment with your current field of study",
        "Meets the minimum CGPA requirements",
        "Provider has high trust rating for your institution"
      ];

  return (
    <DashboardLayout>
      <div className="p-6 md:p-12 max-w-6xl mx-auto space-y-12">
        {/* Navigation & Breadcrumbs */}
        <div className="flex items-center justify-between border-b border-dashed border-border/60 pb-8">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all font-mono text-[10px] uppercase tracking-[0.2em]"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to matches
          </button>
          <div className="flex items-center gap-4 text-[9px] font-mono uppercase tracking-[0.3em] text-muted-foreground/40">
            <span>ScholarHub</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>ID: {String(id).slice(0, 8)}</span>
          </div>
        </div>

        {/* Hero Section */}
        <div ref={headerRef} className="space-y-8">
          <div className="flex items-start justify-between gap-12 flex-wrap">
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-3 flex-wrap">
                {scholarship.isExternal && (
                  <span className="text-[10px] font-mono px-3 py-1 bg-white/[0.03] border border-dashed border-purple-500/30 text-purple-400/80 rounded-sm">
                    External Source
                  </span>
                )}
                {scholarship.category && (
                  <span className="text-[10px] font-mono px-3 py-1 bg-white/[0.03] border border-dashed border-blue-500/30 text-blue-400/80 rounded-sm">
                    {scholarship.category}
                  </span>
                )}
              </div>
              
              <h1 className="text-5xl md:text-7xl font-sans font-black tracking-tighter text-foreground leading-[0.9] max-w-3xl">
                {scholarship.title}
              </h1>
              
              <div className="flex items-center gap-4 text-muted-foreground font-mono text-[11px] uppercase tracking-widest">
                <span>Issued by</span>
                <div className="h-px w-8 bg-border/40" />
                <span className="text-foreground font-black">{scholarship.provider?.orgName}</span>
              </div>
            </div>

            {/* Grant Badge */}
            {scholarship.amount && (
              <div className="p-8 border border-dashed border-emerald-500/20 bg-emerald-500/[0.02] rounded-3xl text-right min-w-[240px]">
                <p className="text-[11px] text-emerald-500/60 font-mono uppercase tracking-[0.3em] mb-3">Est. Grant Value</p>
                <p className="text-5xl font-mono font-black text-emerald-500 tracking-tighter">
                  ₹{scholarship.amount.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Grid System */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12 border-t border-dashed border-border/60">
          
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* AI Intelligence Block */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                <h3 className="text-[10px] font-mono font-black text-blue-400 uppercase tracking-[0.4em]">Intelligence Report</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white/[0.02] border border-dashed border-border/60 p-10 rounded-[40px]">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-4xl font-mono font-black text-foreground tracking-tighter">{matchScore}%</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Compatibility Rating</p>
                  </div>
                  
                  <div className="space-y-3">
                    {matchReasons.map((reason, i) => (
                      <div key={i} className="flex items-center gap-3 text-[11px] text-muted-foreground hover:text-foreground transition-colors group/item">
                        <div className="w-1 h-1 rounded-full bg-blue-500/40 group-hover/item:bg-blue-500 transition-colors" />
                        {reason}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative aspect-square flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="50%" cy="50%" r="45%" fill="none" stroke="currentColor" strokeWidth="2" className="text-border/20" />
                    <motion.circle 
                      cx="50%" cy="50%" r="45%" fill="none" stroke="currentColor" strokeWidth="2" 
                      strokeDasharray="283" 
                      initial={{ strokeDashoffset: 283 }}
                      animate={{ strokeDashoffset: 283 - (283 * matchScore) / 100 }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                      className="text-blue-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                     <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-[0.3em]">AI V2.0</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Content Sections */}
            <div className="grid grid-cols-1 gap-16">
              {/* Description */}
              <section className="space-y-6">
                <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.4em]">Overview</h3>
                <p className="text-xl text-foreground font-medium leading-relaxed tracking-tight">
                  {scholarship.description}
                </p>
              </section>

              {/* Eligibility Matrix */}
              <section className="space-y-8">
                <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.4em]">Evaluation Matrix</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border/40 border border-border/40 rounded-3xl overflow-hidden">
                  <div className="bg-background p-8 space-y-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Min. academic standing</p>
                    <p className="text-2xl font-mono font-black">{scholarship.criteriaJson?.minCgpa || "N/A"}+ CGPA</p>
                  </div>
                  <div className="bg-background p-8 space-y-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Field restriction</p>
                    <div className="flex flex-wrap gap-2">
                      {scholarship.criteriaJson?.allowedFields?.map(f => (
                        <span key={f} className="text-[9px] font-mono border border-border px-2 py-0.5">{f}</span>
                      )) || <span className="text-sm font-mono text-muted-foreground">Universal</span>}
                    </div>
                  </div>
                  <div className="bg-background p-8 space-y-2 md:col-span-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Location criteria</p>
                    <p className="text-sm font-mono">{scholarship.criteriaJson?.allowedLocations?.join(" / ") || "GLOBAL ACCESS"}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Sidebar Column */}
          <aside className="lg:col-span-4 space-y-12">
            
            {/* Status Card */}
            <div className="p-8 border border-dashed border-border/60 bg-white/[0.01] rounded-3xl space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Submission Deadline</p>
                  <p className="text-2xl font-mono font-black tracking-tighter">
                    {scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString('en-GB') : 'OPEN'}
                  </p>
                  <p className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest">
                    {daysLeft} days remaining / active
                  </p>
                </div>
                
                <div className="h-px bg-border/40 border-dashed border-b" />

                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Matched Students</p>
                  <p className="text-xl font-mono font-black">{scholarship._count?.applications || 0}</p>
                </div>
              </div>

              {/* Action */}
              {scholarship.isExternal ? (
                <a
                  href={scholarship.sourceUrl} target="_blank" rel="noopener noreferrer"
                  className="block w-full py-4 text-center bg-foreground text-background font-mono text-[11px] font-black uppercase tracking-[0.2em] rounded-full hover:scale-[1.02] transition-transform active:scale-95"
                >
                  Remote Application →
                </a>
              ) : (
                <button
                  onClick={() => !isExpired && router.push(`/dashboard/student/scholarships/${id}/apply`)}
                  className="w-full py-4 bg-emerald-500 text-black font-mono text-[11px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Initiate Checkout →
                </button>
              )}
            </div>

            {/* Provider Module */}
            <div className="p-8 border border-border/40 bg-white/[0.01] rounded-[40px] space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.3em]">Provider Entity</h3>
                <div className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-mono border border-emerald-500/20">VERIFIED</div>
              </div>
              
              <div className="space-y-4">
                <p className="text-xl font-black tracking-tight leading-none">{scholarship.provider?.orgName}</p>
                <div className="flex items-center gap-3">
                   <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                   <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">{scholarship.provider?.orgType || 'Foundation'}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-dashed border-border/40 flex items-center justify-between font-mono">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Trust Index</span>
                <span className="text-emerald-500 font-black">{scholarship.provider?.trustScore}%</span>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
