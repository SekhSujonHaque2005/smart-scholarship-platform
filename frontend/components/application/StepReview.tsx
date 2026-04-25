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

  const Section = ({ title, items, icon }: { title: string; items: [string, string][]; icon: any }) => (
    <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b">
        <span className="text-muted-foreground text-lg">{icon}</span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map(([label, value]) => (
          <div key={label} className="space-y-0.5">
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
            <p className="text-foreground text-sm font-semibold break-all">{value || 'N/A'}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Scholarship Summary */}
      <div className="bg-blue-50/50 border border-blue-100 dark:bg-blue-500/5 dark:border-blue-500/20 rounded-xl p-6 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">Applying For</p>
          <p className="text-foreground font-bold text-xl tracking-tight">{scholarshipTitle}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 border border-blue-200 dark:border-blue-500/30">
           <ShieldCheck size={24} />
        </div>
      </div>

      {/* Sections */}
      <Section
        title="Personal Details"
        icon="👤"
        items={[
          ['Full Name', formData.fullName],
          ['Date of Birth', formData.dateOfBirth],
          ['Gender', formData.gender],
          ['Phone', formData.phone],
          ['City', formData.city],
          ['State', formData.state],
          ['Pincode', formData.pincode],
        ]}
      />

      <Section
        title="Academic Details"
        icon="🎓"
        items={[
          ['Institution', formData.institution],
          ['Course', formData.course],
          ['Year of Study', `${formData.yearOfStudy} Year`],
          ['CGPA', formData.cgpa],
          ['Board %', `${formData.boardPercentage}%`],
          ['Admission Year', formData.admissionYear],
        ]}
      />

      <Section
        title="Financial Allocation"
        icon="💰"
        items={[
          ['Annual Income', formData.annualIncome],
          ['Bank Name', formData.bankName],
          ['Account Holder', formData.accountHolderName],
          ['IFSC Code', formData.ifscCode],
        ]}
      />

      {/* Documents Checksum */}
      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <span className="text-muted-foreground text-lg">📄</span>
          <h3 className="text-sm font-semibold text-foreground">Uploaded Documents</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {[
            ['Profile Photo', formData.profilePhotoUrl],
            ['Marksheet', formData.marksheetUrl],
            ['Income Certificate', formData.incomeCertificateUrl],
            ['ID Proof', formData.idProofUrl],
            ['Bank Passbook', formData.bankPassbookUrl],
          ].map(([label, url]) => (
            <div key={label} className={cn(
              "flex flex-col items-center justify-center p-4 border rounded-lg transition-all",
              url 
                ? 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-500/20 dark:bg-emerald-500/5' 
                : 'border-border bg-muted/20 opacity-50'
            )}>
              <div className="text-xl mb-2">{url ? '📎' : '⚠️'}</div>
              <span className="text-xs font-semibold text-foreground text-center">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Diagnostic Terminal */}
      <AnimatePresence>
        {(fraudCheck.checking || fraudCheck.result) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              "rounded-xl p-4 border shadow-sm text-sm",
              fraudCheck.checking && "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200",
              fraudCheck.result === 'clean' && "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200",
              fraudCheck.result === 'flagged' && "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-200"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/80 dark:bg-black/20 flex items-center justify-center backdrop-blur-md border border-border">
                {fraudCheck.checking ? (
                  <Loader2 className="animate-spin text-blue-600" size={16} />
                ) : fraudCheck.result === 'clean' ? (
                  <CheckCircle2 size={16} className="text-emerald-600" />
                ) : (
                  <AlertTriangle size={16} className="text-rose-600" />
                )}
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold">{fraudCheck.checking ? 'Verifying Data...' : 'Verification Complete'}</p>
                <p className="text-xs opacity-90">{fraudCheck.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 flex items-start gap-3 text-sm"
        >
          <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold shrink-0 text-xs">
             !
          </div>
          <div className="space-y-1">
            <p className="font-semibold">Submission Error</p>
            <p className="text-xs text-rose-600/80 leading-relaxed">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Primary Action Dock */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={submitting}
          className="h-11 px-6 text-sm font-semibold rounded-lg transition-colors"
        >
          Back
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="h-11 bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <span>Submit Application</span>
              <ShieldCheck size={16} />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
