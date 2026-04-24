'use client';

import React from 'react';
import { ProviderLayout } from '@/components/provider/ProviderLayout';
import { ScholarshipForm } from '@/components/provider/ScholarshipForm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateScholarshipPage() {
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
              Create New Scholarship
            </h1>
            <p className="text-sm text-muted-foreground">
              Set up the details, eligibility, and funding for your new program.
            </p>
          </div>
        </header>

        <section>
          <ScholarshipForm />
        </section>
      </div>
    </ProviderLayout>
  );
}
