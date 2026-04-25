'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import StepPersonal from './StepPersonal';
import StepAcademic from './StepAcademic';
import StepFinancial from './StepFinancial';
import StepDocuments from './StepDocuments';
import StepReview from './StepReview';

import React from 'react';
import { User, GraduationCap, IndianRupee, FileText, ShieldCheck } from 'lucide-react';

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
  { id: 1, title: 'Personal', icon: User },
  { id: 2, title: 'Academic', icon: GraduationCap },
  { id: 3, title: 'Financial', icon: IndianRupee },
  { id: 4, title: 'Documents', icon: FileText },
  { id: 5, title: 'Review', icon: ShieldCheck },
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
    <div className="max-w-4xl mx-auto pb-10">
      {/* Sleek Modern Stepper Indicator */}
      <div className="flex items-center justify-between mb-16 px-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-2 relative">
                <div className={cn(
                  "w-10 h-10 rounded-lg border flex items-center justify-center transition-all",
                  currentStep >= s.id
                    ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/30"
                    : "bg-muted border-border text-muted-foreground/40"
                )}>
                  <Icon size={18} />
                </div>
                <span className={cn(
                  "text-xs font-semibold absolute -bottom-6 whitespace-nowrap tracking-tight",
                  currentStep === s.id ? "text-foreground" : "text-muted-foreground/50"
                )}>
                  {s.title}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-[2px] bg-border mx-4 rounded-full relative overflow-hidden">
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: currentStep > s.id ? '100%' : '0%' }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
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
