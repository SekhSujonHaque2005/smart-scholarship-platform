'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/app/lib/api';
import { useAuthStore } from '@/app/store/auth.store';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ApplicationForm from '@/components/application/ApplicationForm';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ApplyPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [scholarship, setScholarship] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    const fetch = async () => {
      try {
        const { data } = await api.get(`scholarships/${id}`);
        setScholarship(data);
      } catch {
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, router]);

  const handleSuccess = () => {
    setSuccess(true);
    setTimeout(() => {
      router.push('/dashboard/student/applications');
    }, 4000);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] space-y-8">
          <div className="relative">
            <Loader2 className="animate-spin text-blue-500" size={64} strokeWidth={1} />
            <div className="absolute inset-0 blur-2xl bg-blue-500/20 -z-10" />
          </div>
          <div className="space-y-2 text-center">
            <p className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-[0.5em] animate-pulse">Initializing Application Node</p>
            <p className="text-[9px] font-mono text-blue-500/60 uppercase tracking-widest">Secure Link Established...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (success) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-16 rounded-[48px] border border-dashed border-emerald-500/30 bg-white/[0.01] shadow-2xl relative overflow-hidden max-w-2xl w-full"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0" />
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-10"
            >
              <div className="w-24 h-24 rounded-[32px] bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-dashed border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <CheckCircle2 size={48} strokeWidth={1} />
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-center gap-4">
                 <div className="h-px w-8 bg-emerald-500/20" />
                 <h2 className="text-[10px] font-mono font-black text-emerald-500 uppercase tracking-[0.4em]">Submission Synchronized</h2>
                 <div className="h-px w-8 bg-emerald-500/20" />
              </div>
              <h2 className="text-5xl md:text-6xl font-sans font-black text-foreground tracking-tighter leading-[0.9]">Success.</h2>
              <p className="text-muted-foreground text-sm font-mono uppercase tracking-tight max-w-sm mx-auto leading-relaxed opacity-60">
                Application for <span className="text-foreground font-black">{scholarship?.title}</span> has been securely committed to the registry.
              </p>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 1 }}
               className="mt-16 flex flex-col items-center space-y-6"
            >
               <Button 
                onClick={() => router.push('/dashboard/student/applications')}
                className="bg-foreground text-background hover:scale-105 active:scale-95 px-16 h-16 rounded-2xl font-mono font-black text-[10px] uppercase tracking-[0.3em] transition-all border border-white/10"
               >
                 Go to Tracker →
               </Button>
               <div className="flex items-center gap-3 text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest bg-white/5 py-2 px-4 rounded-full border border-dashed border-border/40">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                 <span>Auto-Redirecting in 3 Seconds</span>
               </div>
            </motion.div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-16 py-12 px-6">
        {/* Vercel-Style Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-dashed border-border/60 pb-16">
          <div className="space-y-6">
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => router.back()}
              className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-all duration-300"
            >
              <div className="w-8 h-8 rounded-full border border-dashed border-border/60 flex items-center justify-center group-hover:border-blue-500/40 group-hover:text-blue-500 transition-all">
                <span className="text-sm font-mono font-black">←</span>
              </div>
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em]">Back</span>
            </motion.button>

            <div className="space-y-4">
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-8xl font-sans font-black tracking-tighter text-foreground leading-[0.85]"
              >
                Apply
              </motion.h1>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap items-center gap-6 text-muted-foreground font-mono text-[10px] uppercase tracking-widest"
              >
                <div className="flex items-center gap-3">
                  <span className="opacity-40">GRANT:</span>
                  <span className="text-blue-500 font-black">{scholarship?.title}</span>
                </div>
                <div className="h-px w-6 bg-border/40" />
                <div className="flex items-center gap-3">
                  <span className="opacity-40">ROLE:</span>
                  <span className="text-foreground font-black italic">Verified Scholar</span>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="hidden lg:block shrink-0">
            <div className="p-6 rounded-3xl border border-dashed border-border/40 bg-white/[0.01] space-y-4 min-w-[200px]">
              <div className="space-y-1">
                <p className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest">Status</p>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  <p className="text-[10px] font-mono font-black text-foreground uppercase tracking-widest">Session Active</p>
                </div>
              </div>
              <div className="h-px bg-border/40" />
              <div className="space-y-1">
                <p className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest">Protocol</p>
                <p className="text-[11px] font-mono font-black text-blue-500 uppercase tracking-widest">SECURE_FLOW_v2</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="relative pt-8">
          <ApplicationForm
            scholarshipId={id as string}
            scholarshipTitle={scholarship?.title || ''}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
