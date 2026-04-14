'use client';

import React from 'react';
import { ProviderLayout } from '@/components/provider/ProviderLayout';
import { ScholarshipForm } from '@/components/provider/ScholarshipForm';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateScholarshipPage() {
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
              Deploy <span className="text-indigo-500">Initiative</span>
            </h1>
            <div className="flex items-center gap-4">
              <div className="h-[1px] w-12 bg-indigo-500" />
              <p className="text-muted-foreground text-sm font-mono uppercase tracking-[0.1em] font-black opacity-60">
                Scholarship Protocol Initialization Wizard v2.4
              </p>
            </div>
          </div>
        </header>

        <section>
          <ScholarshipForm />
        </section>
      </div>
    </ProviderLayout>
  );
}
