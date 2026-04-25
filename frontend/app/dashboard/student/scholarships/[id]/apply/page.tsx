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
        <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <div className="relative">
            <Loader2 className="animate-spin text-blue-500" size={48} strokeWidth={2} />
          </div>
          <div className="space-y-1 text-center">
            <p className="text-sm font-semibold text-muted-foreground animate-pulse">Initializing Application Node</p>
            <p className="text-xs font-medium text-blue-500 mt-1">Secure Link Established...</p>
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
            className="text-center p-8 md:p-12 border bg-card shadow-lg rounded-2xl relative overflow-hidden max-w-2xl w-full"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0" />
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-8"
            >
              <div className="w-20 h-20 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 size={40} strokeWidth={2} />
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center gap-4">
                 <div className="h-px w-8 bg-border" />
                 <h2 className="text-sm font-semibold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">Submission Synchronized</h2>
                 <div className="h-px w-8 bg-border" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Success.</h2>
              <p className="text-muted-foreground text-base max-w-sm mx-auto leading-relaxed">
                Application for <span className="text-foreground font-semibold">{scholarship?.title}</span> has been securely committed to the registry.
              </p>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 1 }}
               className="mt-10 flex flex-col items-center space-y-4"
            >
               <Button 
                onClick={() => router.push('/dashboard/student/applications')}
                className="bg-blue-600 text-white hover:bg-blue-700 px-8 h-12 rounded-xl text-sm font-semibold transition-colors"
               >
                 Go to Tracker →
               </Button>
               <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
      <div className="max-w-4xl mx-auto space-y-10 py-10 px-6">
        {/* Vercel-Style Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-8">
          <div className="space-y-6">
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => router.back()}
              className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Return
            </motion.button>

            <div className="space-y-2">
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl font-bold tracking-tight text-foreground"
              >
                Apply
              </motion.h1>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <span className="opacity-70">Grant:</span>
                  <span className="text-blue-600 dark:text-blue-500 font-semibold">{scholarship?.title}</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <span className="opacity-70">Role:</span>
                  <span className="font-medium text-foreground">Verified Scholar</span>
                </div>
              </motion.div>
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
