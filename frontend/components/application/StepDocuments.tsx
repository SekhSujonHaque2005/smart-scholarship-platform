'use client';

import { useState } from 'react';
import { FormData } from './ApplicationForm';
import { Button } from '@/components/ui/button';
import api from '@/app/lib/api';
import { motion } from 'framer-motion';
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface DocField {
  key: keyof FormData;
  urlKey: keyof FormData;
  label: string;
  icon: string;
  required: boolean;
  accept: string;
  description: string;
}

const DOC_FIELDS: DocField[] = [
  {
    key: 'profilePhoto',
    urlKey: 'profilePhotoUrl',
    label: 'Profile Photo',
    icon: '🤳',
    required: true,
    accept: 'image/jpeg,image/png',
    description: 'Recent passport size photo (JPG/PNG, max 2MB)'
  },
  {
    key: 'marksheet',
    urlKey: 'marksheetUrl',
    label: 'Latest Marksheet',
    icon: '📊',
    required: true,
    accept: 'image/jpeg,image/png,application/pdf',
    description: 'Latest semester/year marksheet (PDF/JPG, max 5MB)'
  },
  {
    key: 'incomeCertificate',
    urlKey: 'incomeCertificateUrl',
    label: 'Income Certificate',
    icon: '💰',
    required: true,
    accept: 'image/jpeg,image/png,application/pdf',
    description: 'Family income certificate from govt authority (PDF/JPG)'
  },
  {
    key: 'idProof',
    urlKey: 'idProofUrl',
    label: 'ID Proof',
    icon: '🪪',
    required: true,
    accept: 'image/jpeg,image/png,application/pdf',
    description: 'Aadhaar Card / PAN Card / Passport (PDF/JPG)'
  },
  {
    key: 'bankPassbook',
    urlKey: 'bankPassbookUrl',
    label: 'Bank Passbook',
    icon: '🏦',
    required: false,
    accept: 'image/jpeg,image/png,application/pdf',
    description: 'First page of bank passbook (PDF/JPG, optional)'
  },
];

export default function StepDocuments({ formData, updateFormData, onNext, onBack }: Props) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileUpload = async (field: DocField, file: File) => {
    try {
      setUploading(field.key);
      setErrors(prev => ({ ...prev, [field.key]: '' }));

      const formPayload = new globalThis.FormData();
      formPayload.append('file', file);
      formPayload.append('docType', field.label);

      const { data } = await api.post('documents/upload', formPayload);

      updateFormData({
        [field.key]: file,
        [field.urlKey]: data.document.fileUrl
      } as any);

    } catch (error: any) {
      setErrors(prev => ({
        ...prev,
        [field.key]: error.response?.data?.message || 'Upload failed. Check file size (max 5MB).'
      }));
    } finally {
      setUploading(null);
    }
  };

  const handleNext = () => {
    // Validate required docs
    const newErrors: Record<string, string> = {};
    DOC_FIELDS.filter(f => f.required).forEach(field => {
      if (!formData[field.urlKey]) {
        newErrors[field.key] = 'Document is required';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-8">
      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
        {/* Technical Storage Info */}
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 flex items-start gap-3 text-blue-800 text-sm dark:bg-blue-500/10 dark:border-blue-500/20">
          <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-600 shrink-0">
            <Upload size={14} />
          </div>
          <div className="space-y-1">
            <p className="font-semibold">Document Upload Guide</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Please upload clear, high-resolution copies (JPG, PNG, or PDF). Maximum file size allowed is 5MB per document.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {DOC_FIELDS.map((field, index) => {
            const isUploaded = !!formData[field.urlKey];
            const isUploading = uploading === field.key;

            return (
              <motion.div
                key={field.key}
                layout
                className={`border rounded-lg p-4 transition-all duration-300 relative overflow-hidden ${
                  isUploaded
                    ? 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-500/20 dark:bg-emerald-500/5'
                    : 'border-border bg-muted/20'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${isUploaded ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10' : 'bg-muted text-muted-foreground border border-border'}`}>
                      {index + 1}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="text-foreground text-sm font-medium">
                          {field.label}
                          {field.required && <span className="text-rose-500 ml-1">*</span>}
                        </p>
                        {isUploaded && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                            <CheckCircle2 size={10} className="text-emerald-600" />
                            <span className="text-[10px] font-semibold text-emerald-600">Uploaded</span>
                          </div>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs">{field.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-auto">
                    {isUploaded && (
                       <a 
                        href={formData[field.urlKey] as string} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="h-9 flex items-center px-4 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground border border-border hover:bg-muted transition-all"
                       >
                        Preview
                       </a>
                    )}
                    <label className={`cursor-pointer px-5 h-9 flex items-center justify-center rounded-lg text-xs font-semibold transition-all border shadow-sm ${
                      isUploading
                        ? 'bg-muted text-muted-foreground border-border cursor-wait'
                        : isUploaded
                        ? 'bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:bg-muted dark:text-foreground'
                        : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                    }`}>
                      {isUploading ? 'Uploading...' : isUploaded ? 'Replace' : 'Upload'}
                      <input
                        type="file"
                        accept={field.accept}
                        className="hidden"
                        disabled={isUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(field, file);
                        }}
                      />
                    </label>
                  </div>
                </div>

                {errors[field.key] && (
                  <div className="mt-3 p-3 rounded-lg border border-rose-200 bg-rose-50 flex items-center gap-2 text-rose-600 text-xs dark:bg-rose-500/10 dark:border-rose-500/20">
                    <AlertCircle size={14} />
                    <p>{errors[field.key]}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Action triggers */}
      <div className="flex items-center justify-between pt-4">
        <Button 
          type="button" 
          variant="outline"
          onClick={onBack}
          className="h-11 px-6 text-sm font-semibold rounded-lg transition-colors"
        >
          Back
        </Button>

        <Button 
          onClick={handleNext} 
          className="bg-blue-600 text-white hover:bg-blue-700 h-11 px-8 text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}
