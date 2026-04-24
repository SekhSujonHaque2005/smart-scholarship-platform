'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProviderLayout } from '@/components/provider/ProviderLayout';
import { ScholarshipForm } from '@/components/provider/ScholarshipForm';
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
        setError(err.response?.data?.message || 'Failed to load scholarship data.');
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
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-sm text-muted-foreground">Loading scholarship details...</p>
        </div>
      </ProviderLayout>
    );
  }

  if (error || !scholarship) {
    return (
      <ProviderLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center">
          <AlertCircle size={48} className="text-rose-400" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Scholarship Not Found</h2>
            <p className="text-sm text-muted-foreground">{error || 'The requested scholarship could not be loaded.'}</p>
          </div>
          <button 
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-lg bg-muted border text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
          >
            Go Back
          </button>
        </div>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout>
      <div className="space-y-8 pb-20">
        {/* Navigation Header */}
        <header className="space-y-4">
          <Link 
            href="/dashboard/provider/scholarships"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <ChevronLeft size={16} /> Back to Programs
          </Link>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Edit Scholarship
            </h1>
            <p className="text-sm text-muted-foreground">
              Updating "{scholarship.title}"
            </p>
          </div>
        </header>

        <section>
          <ScholarshipForm mode="edit" initialData={scholarship} />
        </section>
      </div>
    </ProviderLayout>
  );
}
