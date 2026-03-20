'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import StepPersonal from './StepPersonal';
import StepAcademic from './StepAcademic';
import StepFinancial from './StepFinancial';
import StepDocuments from './StepDocuments';
import StepReview from './StepReview';

export interface FormData {
  // Personal
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;

  // Academic
  institution: string;
  course: string;
  yearOfStudy: string;
  cgpa: string;
  boardPercentage: string;
  admissionYear: string;

  // Financial
  annualIncome: string;
  bankAccountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  bankName: string;

  // Documents
  profilePhoto: File | null;
  marksheet: File | null;
  incomeCertificate: File | null;
  idProof: File | null;
  bankPassbook: File | null;

  // Uploaded URLs
  profilePhotoUrl: string;
  marksheetUrl: string;
  incomeCertificateUrl: string;
  idProofUrl: string;
  bankPassbookUrl: string;
}

const STEPS = [
  { id: 1, title: 'Personal Info', icon: '👤' },
  { id: 2, title: 'Academic Details', icon: '🎓' },
  { id: 3, title: 'Financial Info', icon: '💰' },
  { id: 4, title: 'Documents', icon: '📄' },
  { id: 5, title: 'Review & Submit', icon: '✅' },
];

interface Props {
  scholarshipId: string;
  scholarshipTitle: string;
  onSuccess: () => void;
}

export default function ApplicationForm({ scholarshipId, scholarshipTitle, onSuccess }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    fullName: '', dateOfBirth: '', gender: '', phone: '',
    address: '', city: '', state: '', pincode: '',
    institution: '', course: '', yearOfStudy: '', cgpa: '',
    boardPercentage: '', admissionYear: '',
    annualIncome: '', bankAccountNumber: '', ifscCode: '',
    accountHolderName: '', bankName: '',
    profilePhoto: null, marksheet: null, incomeCertificate: null,
    idProof: null, bankPassbook: null,
    profilePhotoUrl: '', marksheetUrl: '', incomeCertificateUrl: '',
    idProofUrl: '', bankPassbookUrl: ''
  });

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="max-w-4xl mx-auto">
      {/* Premium Stepper */}
      <div className="mb-20 px-4">
        <div className="flex items-center justify-between relative">
          {/* Background Track */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-border/40 -translate-y-1/2 -z-10 border-t border-dashed border-border/60" />
          
          {/* Active Progress Line */}
          <motion.div
            className="absolute top-1/2 left-0 h-px bg-blue-500 -translate-y-1/2 -z-10 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-700"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep - 1) / 4) * 100}%` }}
          />

          {STEPS.map((step) => (
            <div key={step.id} className="relative flex flex-col items-center">
              <motion.div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border border-dashed relative group",
                  currentStep > step.id
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-500"
                    : currentStep === step.id
                    ? "bg-blue-500 text-background border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)] scale-110"
                    : "bg-background border-border/60 text-muted-foreground"
                )}
              >
                {/* Pulsing indicator for active step */}
                {currentStep === step.id && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-background animate-pulse" />
                )}
                
                <span className="font-mono font-black text-xs uppercase tracking-tighter">
                  {currentStep > step.id ? 'OK' : `0${step.id}`}
                </span>
                
                {/* Hover Tooltip */}
                <div className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                   <p className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest">{step.title}</p>
                </div>
              </motion.div>
              
              <div className="mt-6 text-center">
                <p className={cn(
                  "text-[10px] font-mono font-black uppercase tracking-[0.2em] transition-colors duration-300",
                  currentStep === step.id ? "text-blue-500" : "text-muted-foreground opacity-40"
                )}>
                  {step.title}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Status Breakdown Section */}
        <div className="mt-16 flex items-center justify-between p-6 rounded-3xl border border-dashed border-border/40 bg-white/[0.01]">
          <div className="flex items-center gap-6">
            <div className="space-y-1">
              <p className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest">Active Step</p>
              <div className="flex items-center gap-3">
                <span className="text-xl font-sans font-black tracking-tight text-foreground">{STEPS[currentStep - 1].title}</span>
                <div className="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-sm font-mono text-[9px] font-black uppercase tracking-widest border border-blue-500/20">
                  {currentStep} / 5
                </div>
              </div>
            </div>
          </div>
          <div className="h-10 w-px bg-border/40 hidden md:block" />
          <div className="space-y-1 hidden md:block">
            <p className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest">Global Protocol</p>
            <p className="text-[10px] font-mono text-foreground uppercase tracking-widest">ID: SCH-{scholarshipId.slice(-6).toUpperCase()}</p>
          </div>
          <div className="h-10 w-px bg-border/40 hidden md:block" />
          <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest mb-1">Completion</p>
                <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden border border-dashed border-border/40">
                  <motion.div 
                    className="h-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / 5) * 100}%` }}
                  />
                </div>
             </div>
             <span className="text-xs font-mono font-black text-foreground">{Math.round((currentStep / 5) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {currentStep === 1 && (
            <StepPersonal
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextStep}
            />
          )}
          {currentStep === 2 && (
            <StepAcademic
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {currentStep === 3 && (
            <StepFinancial
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {currentStep === 4 && (
            <StepDocuments
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {currentStep === 5 && (
            <StepReview
              formData={formData}
              scholarshipId={scholarshipId}
              scholarshipTitle={scholarshipTitle}
              onBack={prevStep}
              onSuccess={onSuccess}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
