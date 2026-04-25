'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProviderLayout } from '@/components/provider/ProviderLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  User, 
  GraduationCap, 
  ShieldAlert, 
  Loader2, 
  ExternalLink,
  MessageSquare,
  AlertCircle,
  MapPin,
  BookOpen,
  X,
  Send,
  Sparkles,
  Calendar,
  BadgeCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/app/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/app/store/auth.store';
import { MessageHistory } from '@/components/application/MessageHistory';

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);

  const [viewingDoc, setViewingDoc] = useState<string | null>(null);
  const [isMessaging, setIsMessaging] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        const res = await api.get(`applications/${id}`);
        setApplication(res.data);
        setRemarks(res.data.remarks || '');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load application.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [id]);

  const handleReview = async (status: string) => {
    try {
      setReviewing(true);
      await api.patch(`applications/${id}/review`, { status, remarks });
      setApplication({ ...application, status, remarks });
      toast.success(`Application ${status.toLowerCase().replace('_', ' ')}`);
    } catch (err) {
      toast.error('Failed to update application status');
    } finally {
      setReviewing(false);
    }
  };

  const handleSendMessage = async () => {
    try {
      setSendingMessage(true);
      await api.post('messages', {
        applicationId: id,
        receiverId: application.student.userId || application.student.id,
        content: messageContent
      });
      toast.success('Message sent.');
      setIsMessaging(false);
      setMessageContent('');
    } catch (err) {
      toast.error('Failed to send message.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleGenerateReview = async (mode: string = 'review') => {
    if (!application) return;
    setAiGenerating(true);
    try {
      const criteriaStr = typeof application.scholarship?.criteriaJson === 'object'
        ? JSON.stringify(application.scholarship.criteriaJson) : '';
      const aiUrl = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8000';
      const res = await fetch(`${aiUrl}/api/generate/review-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({
          studentName: application.student?.name || '',
          studentField: application.student?.fieldOfStudy || '',
          studentCgpa: application.student?.cgpa?.toString() || '',
          studentLocation: application.student?.location || '',
          scholarshipTitle: application.scholarship?.title || '',
          scholarshipCriteria: criteriaStr,
          mode,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed');
      const data = await res.json();
      setRemarks(data.summary);
      toast.success('AI review generated!');
    } catch (err: any) {
      toast.error(err.message || 'AI generation failed.');
    } finally {
      setAiGenerating(false);
    }
  };

  if (loading) {
    return (
      <ProviderLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-blue-600" size={24} />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </ProviderLayout>
    );
  }

  if (error || !application) {
    return (
      <ProviderLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
          <AlertCircle size={36} className="text-rose-400" />
          <h2 className="text-base font-semibold">Application Not Found</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button onClick={() => router.back()} className="px-4 py-2 rounded-lg bg-muted border text-sm font-medium">Go Back</button>
        </div>
      </ProviderLayout>
    );
  }

  const score = application.fraudFlag ? Math.round(100 - (application.fraudFlag.fraudScore * 100)) : 100;
  const status = application.status;
  const isDecided = status === 'APPROVED' || status === 'REJECTED';

  return (
    <ProviderLayout>
      <div className="max-w-5xl mx-auto pb-12">

        {/* ─── Header Bar ─── */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => router.back()} className="w-8 h-8 rounded-lg bg-muted border flex items-center justify-center text-muted-foreground hover:text-foreground transition shrink-0">
              <ArrowLeft size={15} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-foreground truncate">{application.student?.name}</h1>
                <span className={cn(
                  "px-1.5 py-px rounded text-[10px] font-semibold shrink-0",
                  status === 'APPROVED' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" :
                  status === 'REJECTED' ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400" :
                  "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
                )}>{status.replace('_', ' ')}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                <span className="text-blue-600 font-medium">{application.scholarship?.title}</span>
                <span className="mx-1">·</span>
                {new Date(application.submittedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button onClick={() => setIsMessaging(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition shrink-0">
            <Send size={11} /> Message
          </button>
        </div>

        {/* ─── Two-Column Dashboard ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          
          {/* ─── LEFT COLUMN (3/5) ─── */}
          <div className="lg:col-span-3 space-y-4">

            {/* Student Profile — Horizontal compact card */}
            <div className="bg-card border rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-1.5 mb-3">
                <User size={12} className="text-blue-600" />
                <span className="text-[11px] font-semibold text-muted-foreground">Student Profile</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Field</p>
                  <p className="text-xs font-medium text-foreground flex items-center gap-1">
                    <GraduationCap size={11} className="text-blue-600 shrink-0" />
                    <span className="truncate">{application.student?.fieldOfStudy || '—'}</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">CGPA</p>
                  <p className="text-xs font-medium text-foreground flex items-center gap-1">
                    <BookOpen size={11} className="text-blue-600 shrink-0" />
                    {application.student?.cgpa || 'N/A'} / 10
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Location</p>
                  <p className="text-xs font-medium text-foreground flex items-center gap-1">
                    <MapPin size={11} className="text-blue-600 shrink-0" />
                    <span className="truncate">{application.student?.location || '—'}</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Status</p>
                  <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                    <BadgeCheck size={11} /> Verified
                  </p>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-card border rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-1.5 mb-3">
                <FileText size={12} className="text-blue-600" />
                <span className="text-[11px] font-semibold text-muted-foreground">Documents</span>
              </div>
              {application.documents?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {application.documents.map((doc: any) => (
                    <button
                      key={doc.id}
                      onClick={() => setViewingDoc(doc.url)}
                      className="flex items-center gap-2.5 p-2.5 bg-muted/30 border rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-left group w-full"
                    >
                      <div className="w-8 h-8 rounded-md bg-muted border flex items-center justify-center text-muted-foreground group-hover:text-blue-600 transition shrink-0">
                        <FileText size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground truncate">{doc.name || 'Document'}</p>
                        <p className="text-[10px] text-muted-foreground">PDF · Click to view</p>
                      </div>
                      <ExternalLink size={12} className="text-muted-foreground group-hover:text-blue-600 shrink-0" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-6 bg-muted/20 border border-dashed rounded-lg text-center">
                  <FileText size={20} className="mx-auto text-muted-foreground/20 mb-1" />
                  <p className="text-xs text-muted-foreground">No documents uploaded</p>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="h-[320px]">
              <MessageHistory
                applicationId={id}
                receiverId={application.student.userId || application.student.id}
                currentUserId={user?.id}
              />
            </div>
          </div>

          {/* ─── RIGHT COLUMN (2/5) ─── */}
          <div className="lg:col-span-2 space-y-4">

            {/* AI Trust Score */}
            <div className="bg-card border rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20">
                  <ShieldAlert size={13} />
                </div>
                <span className="text-[11px] font-semibold text-foreground">AI Trust Score</span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-3xl font-bold tracking-tight">{score}%</span>
                <span className="text-[10px] text-muted-foreground">trust</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                {score >= 80 ? 'All checks passed. No fraud indicators.' : 'Needs manual review.'}
              </p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-medium px-2.5 py-1.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <span>Identity</span><span>✓ Verified</span>
                </div>
                <div className="flex justify-between text-[10px] font-medium px-2.5 py-1.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                  <span>Academics</span><span>✓ Trusted</span>
                </div>
              </div>
            </div>

            {/* Review & Decision */}
            <div className="bg-card border rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md bg-muted border flex items-center justify-center text-muted-foreground">
                  <MessageSquare size={13} />
                </div>
                <span className="text-[11px] font-semibold text-foreground">Review Application</span>
              </div>

              {/* Current Status Banner */}
              {isDecided && (
                <div className={cn(
                  "mb-3 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2",
                  status === 'APPROVED' ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" :
                  "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                )}>
                  {status === 'APPROVED' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  Application has been {status.toLowerCase()}
                </div>
              )}

              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-medium text-muted-foreground">Remarks</label>
                  {!isDecided && (
                    <button
                      type="button"
                      disabled={aiGenerating}
                      onClick={() => handleGenerateReview('review')}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-gradient-to-r from-violet-600 to-blue-600 text-white text-[10px] font-medium hover:from-violet-700 hover:to-blue-700 transition-all disabled:opacity-60"
                    >
                      {aiGenerating ? <><Loader2 size={9} className="animate-spin" /> Generating...</> : <><Sparkles size={9} /> AI Summary</>}
                    </button>
                  )}
                </div>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter review remarks..."
                  readOnly={isDecided}
                  className={cn(
                    "w-full bg-muted/50 border rounded-lg p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[80px] resize-none placeholder:text-muted-foreground/40",
                    isDecided && "opacity-70 cursor-default"
                  )}
                />
              </div>

              {/* Action Buttons — only show if not decided */}
              {!isDecided ? (
                <div className="space-y-2">
                  <button
                    onClick={() => handleReview('APPROVED')}
                    disabled={reviewing}
                    className="w-full py-2 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    {reviewing ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={13} />}
                    Approve Application
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleReview('UNDER_REVIEW')}
                      disabled={reviewing}
                      className="py-2 rounded-lg text-xs font-medium bg-muted border text-muted-foreground hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition flex items-center justify-center gap-1 disabled:opacity-60 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"
                    >
                      <Clock size={11} /> Defer
                    </button>
                    <button
                      onClick={() => handleReview('REJECTED')}
                      disabled={reviewing}
                      className="py-2 rounded-lg text-xs font-medium bg-muted border text-muted-foreground hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition flex items-center justify-center gap-1 disabled:opacity-60 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                    >
                      <XCircle size={11} /> Reject
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setApplication({ ...application, status: 'PENDING' }); }}
                  className="w-full py-2 rounded-lg text-xs font-medium bg-muted border text-muted-foreground hover:text-foreground transition flex items-center justify-center gap-1.5"
                >
                  <Clock size={11} /> Change Decision
                </button>
              )}
            </div>

            {/* Scholarship Info Mini Card */}
            <div className="bg-card border rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-1.5 mb-3">
                <Calendar size={12} className="text-blue-600" />
                <span className="text-[11px] font-semibold text-muted-foreground">Application Info</span>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Program</span>
                  <span className="font-medium text-foreground text-right truncate ml-2 max-w-[60%]">{application.scholarship?.title}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Applied</span>
                  <span className="font-medium">{new Date(application.submittedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">App ID</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{String(application.id).slice(0, 12)}...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Viewer Drawer */}
      <AnimatePresence>
        {viewingDoc && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingDoc(null)} className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 z-[70] w-full max-w-3xl h-full bg-card border-l shadow-2xl flex flex-col">
              <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-blue-600" />
                  <span className="text-sm font-semibold">Document Preview</span>
                </div>
                <button onClick={() => setViewingDoc(null)} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground"><X size={14} /></button>
              </div>
              <div className="flex-1 bg-zinc-900 relative">
                <iframe src={viewingDoc} className="w-full h-full border-none" title="Document" />
                <button onClick={() => window.open(viewingDoc, '_blank')} className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-medium shadow-lg hover:scale-105 transition-transform">
                  <ExternalLink size={11} /> New Tab
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Messaging Modal */}
      <AnimatePresence>
        {isMessaging && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setIsMessaging(false)} />
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-card border rounded-xl p-5 shadow-2xl z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Send size={14} className="text-blue-600" />
                  <div>
                    <h3 className="text-sm font-semibold">Message {application?.student?.name}</h3>
                  </div>
                </div>
                <button onClick={() => setIsMessaging(false)} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground"><X size={14} /></button>
              </div>
              <textarea value={messageContent} onChange={(e) => setMessageContent(e.target.value)} placeholder="Write your message..." className="w-full bg-muted/50 border rounded-lg p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition min-h-[90px] resize-none placeholder:text-muted-foreground/40" />
              <div className="flex justify-end gap-2 mt-3">
                <button onClick={() => setIsMessaging(false)} className="px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-muted transition">Cancel</button>
                <button onClick={handleSendMessage} disabled={sendingMessage || !messageContent.trim()} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-1">
                  {sendingMessage ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />} Send
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ProviderLayout>
  );
}
