'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, Activity, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustScoreBreakdownProps {
  score: number;
  verificationStatus: string;
  totalReviews: number;
  totalScholarships: number;
  className?: string;
}

export const TrustScoreBreakdown = ({
  score,
  verificationStatus,
  totalReviews,
  totalScholarships,
  className
}: TrustScoreBreakdownProps) => {
  // Derive component scores for visualization
  const verificationScore = verificationStatus === 'APPROVED' ? 100 : verificationStatus === 'PENDING' ? 50 : 20;
  const consensusScore = score; // Using the trust score as consensus for now
  const activityScore = Math.min(100, (totalScholarships * 10) + (totalReviews * 2));

  const components = [
    {
      label: "Platform Verification",
      score: verificationScore,
      icon: ShieldCheck,
      color: "text-indigo-500",
      description: verificationStatus === 'APPROVED' ? "Organization verified successfully." : "Identity verification in progress."
    },
    {
      label: "Student Reviews",
      score: consensusScore,
      icon: Users,
      color: "text-amber-500",
      description: `${totalReviews} verified student testimonials recorded.`
    },
    {
      label: "Platform Activity",
      score: activityScore,
      icon: Activity,
      color: "text-emerald-500",
      description: `${totalScholarships} scholarship initiatives deployed.`
    }
  ];

  return (
    <div className={cn("bg-card border shadow-sm rounded-2xl p-6 lg:p-8 space-y-8 relative overflow-hidden", className)}>
      <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
        <ShieldCheck size={120} />
      </div>

      <div className="flex flex-col xl:flex-row items-center gap-8 relative z-10">
        {/* Main Radar/Radial Indicator */}
        <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
           <svg className="w-full h-full transform -rotate-90">
             <circle 
              cx="50%" cy="50%" r="45%" fill="none" 
              stroke="currentColor" strokeWidth="2" 
              className="text-border/20" 
             />
             <motion.circle 
              cx="50%" cy="50%" r="45%" fill="none" 
              stroke="currentColor" strokeWidth="8" 
              strokeDasharray="283" 
              initial={{ strokeDashoffset: 283 }}
              animate={{ strokeDashoffset: 283 - (283 * score) / 100 }}
              transition={{ duration: 1.5, ease: "circOut" }}
              className="text-indigo-500"
              style={{ strokeLinecap: 'round' }}
             />
           </svg>
           <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground uppercase">Score</span>
              <span className="text-2xl font-bold text-foreground">{score}%</span>
           </div>
        </div>

        <div className="flex-1 space-y-4 w-full">
           <div>
              <h3 className="text-base font-semibold text-foreground">Trust Breakdown</h3>
              <p className="text-sm font-medium text-muted-foreground">Trust score overview</p>
           </div>
           
           <div className="space-y-4">
              {components.map((c, i) => (
                <div key={i} className="space-y-2">
                   <div className="flex justify-between items-center text-sm font-medium">
                      <div className="flex items-center gap-2">
                         <c.icon size={16} className={c.color} />
                         <span className="text-muted-foreground">{c.label}</span>
                      </div>
                      <span className="text-foreground">{c.score}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden border border-border/40">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${c.score}%` }}
                        transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                        className={cn("h-full rounded-full transition-all", c.color.replace('text', 'bg'))}
                      />
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-border">
         <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border">
            <div className="mt-0.5"><Info size={16} className="text-blue-500 shrink-0" /></div>
             <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                Scores are calculated based on verification status, student feedback, and platform engagement.
             </p>
         </div>
         <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border">
            <div className="mt-0.5"><CheckCircle2 size={16} className="text-emerald-500 shrink-0" /></div>
             <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                This organization has successfully passed our platform trust background checks.
             </p>
         </div>
      </div>
    </div>
  );
};
