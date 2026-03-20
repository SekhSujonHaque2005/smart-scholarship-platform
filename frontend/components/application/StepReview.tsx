'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FormData } from './ApplicationForm';
import { Button } from '@/components/ui/button';
import api from '@/app/lib/api';
import { ShieldCheck, Info, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  formData: FormData;
  scholarshipId: string;
  scholarshipTitle: string;
  onBack: () => void;
  onSuccess: () => void;
}

export default function StepReview({ formData, scholarshipId, scholarshipTitle, onBack, onSuccess }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [fraudCheck, setFraudCheck] = useState<{
    checking: boolean;
    result: string | null;
    riskScore: number;
    message: string;
  }>({ checking: false, result: null, riskScore: 0, message: '' });
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setFraudCheck({ checking: true, result: null, riskScore: 0, message: 'Running AI Risk Analysis Engine...' });
      setError('');

      // Submit application with all form data
      const { data } = await api.post('applications', {
        scholarshipId,
        formData: {
          // Personal
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          // Academic
          institution: formData.institution,
          course: formData.course,
          yearOfStudy: formData.yearOfStudy,
          cgpa: parseFloat(formData.cgpa),
          boardPercentage: parseFloat(formData.boardPercentage),
          admissionYear: parseInt(formData.admissionYear),
          // Financial
          annualIncome: formData.annualIncome,
          bankAccountNumber: formData.bankAccountNumber,
          ifscCode: formData.ifscCode,
          accountHolderName: formData.accountHolderName,
          bankName: formData.bankName,
          // Documents
          profilePhotoUrl: formData.profilePhotoUrl,
          marksheetUrl: formData.marksheetUrl,
          incomeCertificateUrl: formData.incomeCertificateUrl,
          idProofUrl: formData.idProofUrl,
          bankPassbookUrl: formData.bankPassbookUrl,
        }
      });

      setFraudCheck({
        checking: false,
        result: data.aiCheck?.clean ? 'clean' : 'flagged',
        riskScore: data.aiCheck?.riskScore || 0,
        message: data.aiCheck?.clean ? 'Verification Successful. Application Approved for Submission.' : 'Critical Discrepancy Detected by AI.'
      });

      // Success!
      setTimeout(() => onSuccess(), 2000);

    } catch (error: any) {
      setFraudCheck({ checking: false, result: null, riskScore: 0, message: '' });
      if (error.response?.status === 403) {
        setError(`🚨 Application Blocked: ${error.response.data.reasons?.join(', ') || 'Suspicious activity detected.'}`);
      } else {
        setError(error.response?.data?.message || 'Network error during submission. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const Section = ({ title, items, icon, index }: { title: string; items: [string, string][]; icon: string; index: number }) => (
    <div className="bg-white/[0.01] border border-dashed border-border/60 rounded-[40px] p-10 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <span className="text-6xl">{icon}</span>
      </div>
      
      <div className="flex items-center gap-4 mb-10">
        <div className="w-10 h-10 rounded-2xl bg-foreground/5 flex items-center justify-center border border-dashed border-border/60">
           <span className="font-mono font-black text-[10px]">0{index}</span>
        </div>
        <h3 className="text-[10px] font-mono font-black text-foreground uppercase tracking-[0.4em]">{title}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {items.map(([label, value]) => (
          <div key={label} className="space-y-2">
            <p className="text-[9px] text-muted-foreground font-mono font-black uppercase tracking-widest opacity-40">{label.replace(' ', '_')}</p>
            <p className="text-foreground text-[11px] font-mono font-black uppercase tracking-tight break-all border-l-2 border-blue-500/20 pl-3">{value || 'NULL'}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Scholarship Summary */}
      <div className="bg-blue-500/[0.02] border border-dashed border-blue-500/30 rounded-[32px] p-8 flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-[9px] text-blue-500 font-mono font-black uppercase tracking-[0.4em] leading-none">Submitting to Repository</p>
          <p className="text-foreground font-sans font-black text-3xl tracking-tighter leading-tight italic">{scholarshipTitle}</p>
        </div>
        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 border border-dashed border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
           <ShieldCheck size={32} strokeWidth={1} />
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
         {[
           ['Data_Packet', '22/22', 'emerald'],
           ['Binary_Assets', '04/04', 'blue'],
           ['System_Grade', 'A_PROTOCOL', 'indigo'],
           ['Priority_lvl', 'HIGH_IO', 'rose']
         ].map(([label, value, color]) => (
           <div key={label} className="bg-white/[0.01] border border-dashed border-border/40 p-6 rounded-3xl group hover:border-blue-500/30 transition-all">
              <p className="text-[8px] text-muted-foreground font-mono font-black uppercase tracking-widest mb-3 opacity-40">{label}</p>
              <p className={cn("text-xl font-mono font-black tracking-tighter", `text-${color}-500`)}>{value}</p>
           </div>
         ))}
      </div>

      {/* Sections */}
      <Section
        index={1}
        title="Identity Manifest"
        icon="👤"
        items={[
          ['Full Name', formData.fullName],
          ['DOB', formData.dateOfBirth],
          ['Gender', formData.gender],
          ['Phone Node', formData.phone],
          ['City Node', formData.city],
          ['State Node', formData.state],
          ['Pincode', formData.pincode],
        ]}
      />

      <Section
        index={2}
        title="Scholastic Registry"
        icon="🎓"
        items={[
          ['Institution', formData.institution],
          ['Course_ID', formData.course],
          ['Study_Cycle', `${formData.yearOfStudy} Year`],
          ['Efficiency_Idx', formData.cgpa],
          ['Certification_Yield', `${formData.boardPercentage}%`],
          ['Admission_Cycle', formData.admissionYear],
        ]}
      />

      <Section
        index={3}
        title="Fiscal Allocation"
        icon="💰"
        items={[
          ['Annual_Yield', formData.annualIncome],
          ['Bank_Entity', formData.bankName],
          ['Account_Owner', formData.accountHolderName],
          ['Routing_Protocol', formData.ifscCode],
        ]}
      />

      {/* Resource Checksum Grid */}
      <div className="bg-white/[0.01] border border-dashed border-border/60 rounded-[40px] p-10">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-foreground/5 flex items-center justify-center border border-dashed border-border/60">
             <span className="font-mono font-black text-[10px]">04</span>
          </div>
          <h3 className="text-[10px] font-mono font-black text-foreground uppercase tracking-[0.4em]">Resource Checksum</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {[
            ['PHOTO_BYTE', formData.profilePhotoUrl],
            ['SCORE_MAP', formData.marksheetUrl],
            ['YIELD_CERT', formData.incomeCertificateUrl],
            ['ID_REF', formData.idProofUrl],
            ['NODE_PASS', formData.bankPassbookUrl],
          ].map(([label, url]) => (
            <div key={label} className={cn(
              "flex flex-col items-center justify-center p-6 border border-dashed rounded-3xl transition-all",
              url ? 'border-emerald-500/30 bg-emerald-500/[0.02]' : 'border-border/40 bg-white/[0.01] opacity-30 shadow-inner'
            )}>
              <div className="text-2xl mb-4">{url ? '📎' : '⚠️'}</div>
              <span className="text-[8px] font-mono font-black uppercase tracking-[0.3em] text-foreground text-center">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legal Hash */}
      <div className="bg-white/[0.01] border border-dashed border-border/60 rounded-[40px] p-10 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldCheck size={120} strokeWidth={0.5} />
         </div>
         <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
               <Info size={16} className="text-blue-500" />
               <p className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-foreground">Legal Commitment Protocol</p>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono leading-relaxed italic uppercase tracking-tight opacity-60">
              "Encryption hash generated. I hereby certify that the binary data submitted is authentic. Any violation of protocol 402 section 9 will result in immediate de-registration and recursive legal action under federal nodes."
            </p>
         </div>
      </div>

      {/* AI Diagnostic Terminal */}
      <AnimatePresence>
        {(fraudCheck.checking || fraudCheck.result) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              "rounded-[32px] p-8 border border-dashed shadow-2xl relative overflow-hidden",
              fraudCheck.checking && "bg-blue-600 border-blue-400 text-white",
              fraudCheck.result === 'clean' && "bg-emerald-600 border-emerald-400 text-white",
              fraudCheck.result === 'flagged' && "bg-rose-600 border-rose-400 text-white"
            )}
          >
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
                {fraudCheck.checking ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : fraudCheck.result === 'clean' ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <AlertTriangle size={24} />
                )}
              </div>
              <div className="space-y-1">
                <p className="font-mono font-black text-xs uppercase tracking-[0.4em]">System_Diagnostic: {fraudCheck.checking ? 'RUNNING' : 'COMPLETED'}</p>
                <p className="text-[10px] font-mono font-black uppercase tracking-widest opacity-80">{fraudCheck.message}</p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full translate-x-12 -translate-y-12" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-rose-500/10 border border-dashed border-rose-500/40 rounded-3xl p-8 flex items-start gap-6"
        >
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-500 border border-rose-500/30">
             <span className="font-mono font-black text-sm">!</span>
          </div>
          <div className="space-y-2">
            <p className="text-rose-500 text-[10px] font-mono font-black uppercase tracking-[0.4em]">Critical_Error_Log</p>
            <p className="text-rose-500/80 text-[10px] font-mono font-black uppercase tracking-tight leading-relaxed">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Primary Action Dock */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-white/[0.02] border border-dashed border-border/60 p-10 rounded-[48px] shadow-2xl mt-20">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="group flex items-center gap-4 text-muted-foreground hover:text-foreground transition-all duration-300 disabled:opacity-30"
        >
          <div className="w-12 h-12 rounded-2xl border border-dashed border-border/60 flex items-center justify-center group-hover:border-blue-500/40 group-hover:text-blue-500 transition-all">
            <span className="text-sm font-mono font-black">←</span>
          </div>
          <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em]">Modify_Dataset</span>
        </button>

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="h-20 bg-foreground text-background hover:scale-105 active:scale-95 px-16 rounded-[28px] font-mono font-black text-[12px] uppercase tracking-[0.4em] transition-all border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex items-center gap-4 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span>COMMITING_BYTES...</span>
            </>
          ) : (
            <>
              <span>SYNC_TO_CLOUD</span>
              <ShieldCheck size={18} />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
