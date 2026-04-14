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
  Cpu, 
  Loader2, 
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Calendar,
  MapPin,
  BookOpen,
  X,
  Send
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

  // Modal States
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
        console.error('Failed to fetch application:', err);
        setError(err.response?.data?.message || 'Failed to initialize candidate data node.');
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
      toast.success(`Application marked as ${status}`);
    } catch (err) {
      console.error('Review failed:', err);
      toast.error('Failed to update scholarship protocol');
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
      toast.success('Encrypted message delivered to candidate wallet.');
      setIsMessaging(false);
      setMessageContent('');
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Network congestion: Failed to route message.');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <ProviderLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-indigo-500" size={40} />
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] font-black">Syncing Candidate Interface...</p>
        </div>
      </ProviderLayout>
    );
  }

  if (error || !application) {
    return (
      <ProviderLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center">
          <AlertCircle size={64} className="text-rose-500/20" />
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter">Connection Fault</h2>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{error || 'Candidate node not found in the decentralized ledger.'}</p>
          </div>
          <button 
            onClick={() => router.back()}
            className="px-6 py-3 rounded-2xl bg-accent border border-border text-[10px] font-mono font-black uppercase tracking-widest hover:text-foreground transition-all"
          >
            Return to Terminal
          </button>
        </div>
      </ProviderLayout>
    );
  }

  const score = application.fraudFlag ? Math.round(100 - (application.fraudFlag.fraudScore * 100)) : 100;

  return (
    <ProviderLayout>
      <div className="max-w-6xl mx-auto space-y-12 pb-32">
        {/* Navigation Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.back()}
              className="w-12 h-12 rounded-2xl bg-accent border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-indigo-500/30 transition-all group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase">{application.student?.name}</h1>
                <div className={cn(
                  "px-3 py-1 rounded-full border text-[9px] font-mono uppercase tracking-widest font-black",
                  application.status === 'APPROVED' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                  application.status === 'REJECTED' ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                  "bg-amber-500/10 border-amber-500/20 text-amber-400"
                )}>
                  {application.status}
                </div>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground flex items-center gap-2 uppercase font-black tracking-tight opacity-70">
                APPLICATION ID: <span className="text-foreground">{application.id.slice(0, 8)}...</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                PROGRAM: <span className="text-indigo-500">{application.scholarship?.title}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-accent/30 p-2 rounded-[24px] border border-border/50">
             <button 
                onClick={() => setIsMessaging(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-[16px] bg-indigo-500/10 text-indigo-500 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all font-mono border border-indigo-500/20"
             >
               <Send size={14} /> Direct Message
             </button>
             <div className="w-[1px] h-6 bg-border" />
             <div className="px-4 py-2 text-right pr-4">
                <p className="text-[9px] font-mono text-muted-foreground uppercase font-black tracking-widest">Submitted Date</p>
                <p className="text-xs font-bold text-foreground">{new Date(application.submittedAt).toLocaleDateString()}</p>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT COLUMN: Candidate Profile */}
          <div className="lg:col-span-2 space-y-10">
            {/* Profile Overview */}
            <section className="bg-card border border-border rounded-[48px] p-10 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                  <User size={120} />
                </div>
                <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-[0.3em] font-black mb-8 flex items-center gap-2">
                  <User size={14} className="text-indigo-500" /> Academic Profile Node
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-muted-foreground uppercase font-black tracking-widest">Field of Study</label>
                      <div className="text-lg font-bold text-foreground flex items-center gap-3">
                         <GraduationCap size={18} className="text-indigo-500" />
                         {application.student?.fieldOfStudy || 'GENERAL SCIENCES'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-muted-foreground uppercase font-black tracking-widest">Current Performance</label>
                      <div className="text-lg font-bold text-foreground flex items-center gap-3">
                         <BookOpen size={18} className="text-indigo-500" />
                         {application.student?.cgpa || '0.00'} CGPA / 4.0
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-muted-foreground uppercase font-black tracking-widest">Geographical Sector</label>
                      <div className="text-lg font-bold text-foreground flex items-center gap-3">
                         <MapPin size={18} className="text-indigo-500" />
                         {application.student?.location || 'MUMBAI, INDIA'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-muted-foreground uppercase font-black tracking-widest">Authentication Level</label>
                      <div className="flex items-center gap-2">
                         <div className="flex -space-x-1">
                           {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[10px] text-emerald-400 font-bold">✓</div>)}
                         </div>
                         <span className="text-[10px] font-mono text-emerald-500 uppercase font-black tracking-widest ml-2">High Integrity</span>
                      </div>
                    </div>
                  </div>
                </div>
            </section>

            {/* Document Protocol */}
            <section className="space-y-6">
               <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-[0.3em] font-black px-8 flex items-center gap-2">
                  <FileText size={14} className="text-indigo-500" /> Verification Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application.documents?.length > 0 ? (
                    application.documents.map((doc: any) => (
                      <div key={doc.id} className="bg-accent/30 border border-border rounded-3xl p-6 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-accent border border-border flex items-center justify-center text-muted-foreground group-hover:text-indigo-500 transition-colors">
                              <FileText size={20} />
                           </div>
                           <div>
                              <p className="text-xs font-bold text-foreground uppercase tracking-tight">{doc.name || 'DOCUMENT'}</p>
                              <p className="text-[9px] font-mono text-muted-foreground uppercase font-black opacity-60">PDF PROTOCOL • 2.4 MB</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => setViewingDoc(doc.url)}
                          className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all shadow-sm shrink-0"
                        >
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 py-12 bg-accent/20 border border-dashed border-border rounded-3xl text-center">
                       <p className="text-[10px] font-mono text-muted-foreground uppercase font-black tracking-widest italic opacity-40">No supporting documentation uploaded via student portal.</p>
                    </div>
                  )}
                </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Intelligence & Actions */}
          <div className="space-y-10">
             {/* AI RISK AUDIT CARD */}
             <div className="bg-gradient-to-br from-indigo-500/10 via-card to-transparent border border-border rounded-[48px] p-8 relative overflow-hidden group shadow-lg">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ShieldAlert size={100} className="text-foreground" />
                </div>
                
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Cpu size={20} className="animate-pulse" />
                  </div>
                  <h4 className="text-xs font-mono text-foreground uppercase tracking-widest font-black">AI Risk Engine</h4>
                </div>

                <div className="flex items-end gap-4 mb-8">
                   <div className="text-6xl font-black text-foreground tracking-tighter">{score}%</div>
                   <div className="text-[10px] font-mono text-muted-foreground uppercase font-black pb-2">Compatibility</div>
                </div>

                <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-[0.2em] leading-relaxed font-bold opacity-70 mb-8 border-l-2 border-indigo-500/30 pl-4">
                  Autonomous auditing complete. Academic credentials verified against university registrar API. No fraud patterns detected in current submission.
                </p>

                <div className="space-y-3">
                   <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest font-black p-3 rounded-2xl bg-emerald-500/5 text-emerald-400 border border-emerald-500/20">
                      <span>Identity Sync</span>
                      <span>Verified</span>
                   </div>
                   <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest font-black p-3 rounded-2xl bg-indigo-500/5 text-indigo-400 border border-indigo-500/20">
                      <span>GPA Authentication</span>
                      <span>Trusted</span>
                   </div>
                </div>
             </div>

             {/* Communication Protocol Terminal */}
             <div className="h-[500px]">
                <MessageHistory 
                  applicationId={id} 
                  receiverId={application.student.userId || application.student.id} 
                  currentUserId={user?.id} 
                />
             </div>

             {/* Review Action Terminal */}
             <section className="bg-card border border-border rounded-[48px] p-8 space-y-8 shadow-xl relative isolate">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-accent border border-border flex items-center justify-center text-muted-foreground">
                    <MessageSquare size={16} />
                  </div>
                  <h4 className="text-xs font-mono text-foreground uppercase tracking-widest font-black">Review Protocol</h4>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase font-black tracking-[0.2em]">Decision Remarks</label>
                  <textarea 
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter official remarks for the candidate..."
                    className="w-full bg-accent/50 border border-border rounded-3xl p-6 text-sm font-bold text-foreground focus:outline-none focus:border-indigo-500/50 transition-all min-h-[160px] resize-none placeholder:text-muted-foreground/40 placeholder:font-mono placeholder:text-[10px] placeholder:uppercase placeholder:tracking-widest"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3">
                   <button 
                     onClick={() => handleReview('APPROVED')}
                     disabled={reviewing || application.status === 'APPROVED'}
                     className={cn(
                       "w-full py-4 rounded-2xl font-mono text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3",
                       application.status === 'APPROVED' ? "bg-emerald-500 text-white cursor-default" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white shadow-lg hover:shadow-emerald-500/20"
                     )}
                   >
                     {reviewing ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={16} />}
                     Approve Protocol
                   </button>
                   
                   <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleReview('UNDER_REVIEW')}
                        disabled={reviewing || application.status === 'UNDER_REVIEW'}
                        className={cn(
                          "py-4 rounded-2xl font-mono text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2",
                          application.status === 'UNDER_REVIEW' ? "bg-amber-500 text-white cursor-default" : "bg-accent border border-border text-muted-foreground hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/30"
                        )}
                      >
                         {reviewing ? <Loader2 className="animate-spin" size={14} /> : <Clock size={14} />}
                         Defer
                      </button>
                      <button 
                        onClick={() => handleReview('REJECTED')}
                        disabled={reviewing || application.status === 'REJECTED'}
                        className={cn(
                          "py-4 rounded-2xl font-mono text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2",
                          application.status === 'REJECTED' ? "bg-rose-500 text-white cursor-default" : "bg-accent border border-border text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30"
                        )}
                      >
                         {reviewing ? <Loader2 className="animate-spin" size={14} /> : <XCircle size={14} />}
                         Archive
                      </button>
                   </div>
                </div>
                
                <p className="text-[9px] font-mono text-muted-foreground text-center uppercase tracking-widest font-black opacity-40">
                  Authorizing a candidate triggers an encrypted notification to their secure wallet.
                </p>
             </section>
          </div>
        </div>
      </div>

      {/* Document Viewer Side-Drawer */}
      <AnimatePresence>
        {viewingDoc && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setViewingDoc(null)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-[70] w-full max-w-4xl h-full bg-card border-l border-border shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-border bg-accent/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Protocol Intelligence View</h3>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase font-bold opacity-60">Verified Document Node</p>
                  </div>
                </div>
                <button 
                  onClick={() => setViewingDoc(null)}
                  className="p-2 hover:bg-accent rounded-xl text-muted-foreground hover:text-foreground transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 bg-zinc-900 relative">
                <iframe 
                  src={viewingDoc} 
                  className="w-full h-full border-none" 
                  title="Document Viewer" 
                />
                
                {/* Floating Action within Viewer */}
                <div className="absolute bottom-6 right-6">
                   <button 
                     onClick={() => window.open(viewingDoc, '_blank')}
                     className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-transform"
                   >
                     <ExternalLink size={14} /> Open Native
                   </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Messaging Modal */}
      <AnimatePresence>
        {isMessaging && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className="absolute inset-0" onClick={() => setIsMessaging(false)} />
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-[32px] p-8 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                    <Send size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Encrypted Channel</h3>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-bold">Direct message to {application?.student?.name}</p>
                  </div>
                </div>
                <button onClick={() => setIsMessaging(false)} className="p-2 hover:bg-accent rounded-xl text-muted-foreground hover:text-foreground transition-all">
                  <X size={20} />
                </button>
              </div>

              <textarea 
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="COMPOSE YOUR MEMO HERE..."
                className="w-full bg-accent/50 border border-border rounded-3xl p-6 text-sm font-bold text-foreground focus:outline-none focus:border-indigo-500/50 transition-all min-h-[160px] resize-none placeholder:text-muted-foreground/40 font-mono"
              />

              <div className="flex justify-end gap-3 mt-8">
                <button 
                  onClick={() => setIsMessaging(false)}
                  className="px-6 py-4 rounded-2xl border border-border text-foreground font-black text-[11px] uppercase tracking-widest hover:bg-accent transition-all font-mono"
                >
                  Cancel Protocol
                </button>
                <button 
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !messageContent.trim()}
                  className="px-8 py-4 rounded-2xl bg-indigo-600 text-white font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2 font-mono"
                >
                  {sendingMessage ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Transmit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ProviderLayout>
  );
}
