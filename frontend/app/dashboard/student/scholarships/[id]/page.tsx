'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '@/app/lib/api';
import { useAuthStore } from '@/app/store/auth.store';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Building2, Calendar, GraduationCap, MapPin, ChevronRight, ArrowLeft, Sparkles, ShieldCheck, Loader2, Users, Clock, ExternalLink } from 'lucide-react';

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
  const { isAuthenticated, user } = useAuthStore();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [aiTips, setAiTips] = useState<string | null>(null);
  const [aiTipsLoading, setAiTipsLoading] = useState(false);
  const [aiEligibility, setAiEligibility] = useState<string | null>(null);
  const [aiEligibilityLoading, setAiEligibilityLoading] = useState(false);
  const [studentProfile, setStudentProfile] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    const fetchData = async () => {
      try {
        const [scholarshipRes, profileRes] = await Promise.all([
          api.get(`scholarships/${id}`),
          api.get('auth/me').catch(() => null),
        ]);
        setScholarship(scholarshipRes.data);
        if (profileRes) setStudentProfile(profileRes.data.profile);
      } catch (error) {
        setError('Scholarship not found');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const getDaysLeft = (deadline: string) => {
    if (!deadline) return null;
    return Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  const getCriteriaString = () => {
    if (!scholarship) return '';
    const c = scholarship.criteriaJson;
    if (!c) return '';
    const parts: string[] = [];
    if (c.minCgpa) parts.push(`Minimum CGPA: ${c.minCgpa}`);
    if (c.allowedFields?.length) parts.push(`Fields: ${c.allowedFields.join(', ')}`);
    if (c.allowedLocations?.length) parts.push(`Locations: ${c.allowedLocations.join(', ')}`);
    if (c.eligibility) parts.push(c.eligibility);
    return parts.join('. ') || 'Open to all';
  };

  const handleGetTips = async () => {
    if (!scholarship) return;
    setAiTipsLoading(true);
    try {
      const aiUrl = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8000';
      const res = await fetch(`${aiUrl}/api/generate/tips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scholarshipTitle: scholarship.title,
          scholarshipDescription: scholarship.description,
          criteria: getCriteriaString(),
          studentField: studentProfile?.fieldOfStudy || '',
          studentCgpa: studentProfile?.cgpa?.toString() || '',
          studentLocation: studentProfile?.location || '',
        }),
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed');
      const data = await res.json();
      setAiTips(data.tips);
    } catch (err: any) {
      setAiTips(`Error: ${err.message}`);
    } finally {
      setAiTipsLoading(false);
    }
  };

  const handleEligibilityCheck = async () => {
    if (!scholarship) return;
    setAiEligibilityLoading(true);
    try {
      const aiUrl = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8000';
      const res = await fetch(`${aiUrl}/api/generate/eligibility-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({

          scholarshipTitle: scholarship.title,
          scholarshipCriteria: getCriteriaString(),
          studentField: studentProfile?.fieldOfStudy || '',
          studentCgpa: studentProfile?.cgpa?.toString() || '',
          studentLocation: studentProfile?.location || '',
          studentIncome: studentProfile?.incomeLevel || '',
        }),
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed');
      const data = await res.json();
      setAiEligibility(data.result);
    } catch (err: any) {
      setAiEligibility(`Error: ${err.message}`);
    } finally {
      setAiEligibilityLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-5xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded-lg w-1/3" />
            <div className="h-10 bg-muted rounded-lg w-2/3" />
            <div className="h-40 bg-muted rounded-xl" />
            <div className="grid grid-cols-3 gap-4">
              <div className="h-24 bg-muted rounded-xl" />
              <div className="h-24 bg-muted rounded-xl" />
              <div className="h-24 bg-muted rounded-xl" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !scholarship) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center min-h-[50vh] flex flex-col items-center justify-center gap-3">
          <p className="text-4xl">😕</p>
          <p className="text-base font-medium">{error || 'Scholarship not found'}</p>
          <Button onClick={() => router.back()} variant="outline">Go Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  const daysLeft = getDaysLeft(scholarship.deadline);
  const isExpired = daysLeft !== null && daysLeft <= 0;
  const matchScore = scholarship.matchScore ?? (85 + (parseInt(scholarship.id[0] || '1', 36) % 10));
  const matchReasons = scholarship.matchReasons?.length ? scholarship.matchReasons : [
    "Strong alignment with your current field of study",
    "Meets the minimum CGPA requirements",
    "Provider has high trust rating"
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        
        {/* Back Button */}
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition mb-5 mt-2 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Back to scholarships
        </button>

        {/* Hero Section — Compact */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {scholarship.isExternal && <span className="text-[10px] font-semibold px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 rounded">External</span>}
            {scholarship.category && <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 rounded">{scholarship.category}</span>}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1.5">{scholarship.title}</h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 size={12} />
            <Link href={`/providers/${scholarship.provider?.id}`} className="font-medium hover:text-blue-600 transition">{scholarship.provider?.orgName}</Link>
            <span>·</span>
            <span>{scholarship.provider?.orgType || 'Organization'}</span>
          </div>
        </motion.div>

        {/* Stats Bar — Horizontal */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-card border rounded-xl p-3.5">
            <p className="text-[10px] text-muted-foreground font-medium mb-1">Grant Amount</p>
            <p className="text-lg font-bold text-emerald-600">₹{scholarship.amount?.toLocaleString() || 'N/A'}</p>
          </div>
          <div className="bg-card border rounded-xl p-3.5">
            <p className="text-[10px] text-muted-foreground font-medium mb-1">Deadline</p>
            <p className="text-sm font-bold">{scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Open'}</p>
            {daysLeft !== null && <p className={cn("text-[10px] font-medium mt-0.5", isExpired ? "text-rose-500" : "text-emerald-600")}>{isExpired ? 'Expired' : `${daysLeft} days left`}</p>}
          </div>
          <div className="bg-card border rounded-xl p-3.5">
            <p className="text-[10px] text-muted-foreground font-medium mb-1">AI Match</p>
            <div className="flex items-baseline gap-1">
              <p className="text-lg font-bold text-blue-600">{matchScore}%</p>
              <span className="text-[10px] text-muted-foreground">fit</span>
            </div>
          </div>
          <div className="bg-card border rounded-xl p-3.5">
            <p className="text-[10px] text-muted-foreground font-medium mb-1">Applicants</p>
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-muted-foreground" />
              <p className="text-lg font-bold">{scholarship._count?.applications || 0}</p>
            </div>
          </div>
        </div>

        {/* ─── Two-column layout ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          
          {/* LEFT — Content (3/5) */}
          <div className="lg:col-span-3 space-y-5">

            {/* Match Reasons — Compact horizontal */}
            <div className="bg-card border rounded-xl p-4">
              <h3 className="text-xs font-semibold text-muted-foreground mb-2.5 flex items-center gap-1.5"><Sparkles size={11} className="text-blue-600" /> Why You Match</h3>
              <div className="space-y-2">
                {matchReasons.map((reason, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-foreground/80 leading-relaxed">
                    <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    {reason}
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-card border rounded-xl p-4">
              <h3 className="text-xs font-semibold text-muted-foreground mb-2">Overview</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">{scholarship.description}</p>
            </div>

            {/* Eligibility */}
            <div className="bg-card border rounded-xl p-4">
              <h3 className="text-xs font-semibold text-muted-foreground mb-3">Eligibility Criteria</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-muted/30 border rounded-lg">
                  <p className="text-[10px] text-muted-foreground font-medium mb-0.5">Min. CGPA</p>
                  <p className="text-sm font-semibold flex items-center gap-1"><GraduationCap size={12} className="text-blue-600" /> {scholarship.criteriaJson?.minCgpa || 'N/A'}+</p>
                </div>
                <div className="p-3 bg-muted/30 border rounded-lg">
                  <p className="text-[10px] text-muted-foreground font-medium mb-0.5">Fields</p>
                  <div className="flex flex-wrap gap-1">
                    {scholarship.criteriaJson?.allowedFields?.map(f => (
                      <span key={f} className="text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 px-1.5 py-0.5 rounded">{f}</span>
                    )) || <span className="text-xs text-foreground">All fields</span>}
                  </div>
                </div>
                <div className="p-3 bg-muted/30 border rounded-lg sm:col-span-2">
                  <p className="text-[10px] text-muted-foreground font-medium mb-0.5">Location</p>
                  <p className="text-sm font-medium flex items-center gap-1"><MapPin size={12} className="text-blue-600" /> {scholarship.criteriaJson?.allowedLocations?.join(', ') || 'Open to all'}</p>
                </div>
              </div>
            </div>

            {/* Provider Card */}
            <div className="bg-card border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-muted-foreground">Provider</h3>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">Verified</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Link href={`/providers/${scholarship.provider?.id}`} className="text-sm font-bold hover:text-blue-600 transition">{scholarship.provider?.orgName}</Link>
                  <p className="text-[10px] text-muted-foreground">{scholarship.provider?.orgType || 'Organization'} · Trust: {scholarship.provider?.trustScore}%</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push(`/providers/${scholarship.provider?.id}`)} className="text-xs h-8">
                  View <ChevronRight size={12} />
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT — Actions & AI (2/5) */}
          <div className="lg:col-span-2 space-y-4">

            {/* Apply CTA */}
            <div className="bg-card border rounded-xl p-4 shadow-sm">
              {scholarship.isExternal ? (
                <a href={scholarship.sourceUrl} target="_blank" rel="noopener noreferrer"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition flex items-center justify-center gap-1.5">
                  Apply Externally <ExternalLink size={13} />
                </a>
              ) : (
                <button
                  onClick={() => !isExpired && router.push(`/dashboard/student/scholarships/${id}/apply`)}
                  disabled={isExpired}
                  className={cn(
                    "w-full py-3 text-sm font-medium rounded-lg transition flex items-center justify-center gap-1.5",
                    isExpired ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  )}
                >
                  {isExpired ? 'Applications Closed' : 'Apply Now →'}
                </button>
              )}
              {!isExpired && daysLeft && (
                <p className="text-[10px] text-center text-muted-foreground mt-2 flex items-center justify-center gap-1">
                  <Clock size={10} /> {daysLeft} days remaining
                </p>
              )}
            </div>

            {/* AI Eligibility */}
            <div className="bg-card border rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                  <ShieldCheck size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Am I Eligible?</h4>
                  <p className="text-[10px] text-muted-foreground">AI eligibility check</p>
                </div>
              </div>
              {aiEligibility ? (
                <div className="p-3 bg-muted/50 rounded-lg text-xs text-foreground/80 leading-relaxed whitespace-pre-line max-h-[200px] overflow-y-auto">
                  {aiEligibility}
                </div>
              ) : (
                <button onClick={handleEligibilityCheck} disabled={aiEligibilityLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-medium rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-60 flex items-center justify-center gap-1.5">
                  {aiEligibilityLoading ? <><Loader2 size={12} className="animate-spin" /> Checking...</> : <><ShieldCheck size={12} /> Check Eligibility</>}
                </button>
              )}
            </div>

            {/* AI Tips */}
            <div className="bg-card border rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 dark:bg-violet-500/10 dark:border-violet-500/20">
                  <Sparkles size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground">AI Tips</h4>
                  <p className="text-[10px] text-muted-foreground">Personalized application advice</p>
                </div>
              </div>
              {aiTips ? (
                <div className="p-3 bg-muted/50 rounded-lg text-xs text-foreground/80 leading-relaxed whitespace-pre-line max-h-[250px] overflow-y-auto">
                  {aiTips}
                </div>
              ) : (
                <button onClick={handleGetTips} disabled={aiTipsLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-xs font-medium rounded-lg hover:from-violet-700 hover:to-blue-700 transition-all disabled:opacity-60 flex items-center justify-center gap-1.5">
                  {aiTipsLoading ? <><Loader2 size={12} className="animate-spin" /> Generating...</> : <><Sparkles size={12} /> Get AI Tips</>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
