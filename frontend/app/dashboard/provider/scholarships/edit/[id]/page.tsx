'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProviderLayout } from '@/components/provider/ProviderLayout';
import { ScholarshipForm } from '@/components/provider/ScholarshipForm';
import { motion } from 'framer-motion';
import { ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import api from '@/app/lib/api';

export default function EditScholarshipPage() {
  const { id } = useParams();
  const router = useRouter();
  const [scholarship, setScholarship] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScholarship = async () => {
      try {
        setLoading(true);
        const res = await api.get(`scholarships/${id}`);
        setScholarship(res.data);
      } catch (err: any) {
        console.error('Failed to fetch scholarship:', err);
        setError(err.response?.data?.message || 'PROTOCOL_FETCH_FAILURE');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchScholarship();
  }, [id]);

  if (loading) {
    return (
      <ProviderLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-indigo-500" size={40} />
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] font-black">Decrypting Protocol Ledger...</p>
        </div>
      </ProviderLayout>
    );
  }

  if (error || !scholarship) {
    return (
      <ProviderLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center">
          <AlertCircle size={64} className="text-rose-500/20" />
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter">Access Denied</h2>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{error || 'Protocol node not found in current branch.'}</p>
          </div>
          <button 
            onClick={() => router.back()}
            className="px-6 py-3 rounded-2xl bg-accent border border-border text-[10px] font-mono font-black uppercase tracking-widest hover:text-foreground transition-all"
          >
            Return to Registry
          </button>
        </div>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout>
      <div className="space-y-12 pb-20">
        {/* Navigation Header */}
        <header className="space-y-6">
          <Link 
            href="/dashboard/provider/scholarships"
            className="inline-flex items-center gap-2 text-[10px] font-mono text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors font-black"
          >
            <ChevronLeft size={14} /> Back to Registry
          </Link>
          
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tighter leading-none uppercase">
              Modify <span className="text-indigo-500">Initiative</span>
            </h1>
            <div className="flex items-center gap-4">
              <div className="h-[1px] w-12 bg-indigo-500" />
              <p className="text-muted-foreground text-sm font-mono uppercase tracking-[0.1em] font-black opacity-60">
                Updating {scholarship.title} • ID: {scholarship.id.slice(0, 8)}
              </p>
            </div>
          </div>
        </header>

        <section>
          <ScholarshipForm mode="edit" initialData={scholarship} />
        </section>
      </div>
    </ProviderLayout>
  );
}
