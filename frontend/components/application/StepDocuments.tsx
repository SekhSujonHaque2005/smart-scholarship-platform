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
    <div className="space-y-12">
      <div className="bg-white/[0.01] border border-dashed border-border/60 rounded-[48px] p-12 relative overflow-hidden">
        {/* Subtle glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent -z-10" />

        {/* Technical Storage Info */}
        <div className="mb-10 p-6 rounded-3xl border border-dashed border-blue-500/20 bg-blue-500/[0.02] flex items-start gap-6">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shrink-0">
            <Upload size={18} />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-mono font-black text-blue-500 uppercase tracking-[0.4em] leading-none">Cloud Storage Protocol v4.0</p>
            <p className="text-muted-foreground text-[10px] font-mono leading-relaxed uppercase tracking-tight opacity-60">
              Uplaod high-fidelity scans (JPG/PNG/PDF). All binary data is committed to encrypted shards on our distributed ledger. Total node capacity: 5MB/file.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {DOC_FIELDS.map((field, index) => {
            const isUploaded = !!formData[field.urlKey];
            const isUploading = uploading === field.key;

            return (
              <motion.div
                key={field.key}
                layout
                className={`border border-dashed rounded-3xl p-6 transition-all duration-300 relative overflow-hidden ${
                  isUploaded
                    ? 'border-emerald-500/30 bg-emerald-500/[0.02]'
                    : 'border-border/60 bg-white/[0.01]'
                } group hover:border-blue-500/40`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all ${isUploaded ? 'bg-emerald-500/10 text-emerald-500 border border-dashed border-emerald-500/30' : 'bg-background border border-dashed border-border/60 text-muted-foreground'}`}>
                      <span className="font-mono font-black text-xs">{(index + 1).toString().padStart(2, '0')}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <p className="text-foreground font-mono font-black text-[11px] uppercase tracking-widest">
                          {field.label.replace(' ', '_')}
                          {field.required && <span className="text-rose-500 ml-1">*</span>}
                        </p>
                        {isUploaded && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <CheckCircle2 size={10} className="text-emerald-500" />
                            <span className="text-[8px] font-mono font-black text-emerald-500 uppercase tracking-widest">COMMITTED</span>
                          </div>
                        )}
                      </div>
                      <p className="text-muted-foreground text-[9px] font-mono uppercase tracking-tight opacity-50">{field.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {isUploaded && (
                       <a 
                        href={formData[field.urlKey] as string} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="h-12 flex items-center px-6 rounded-xl text-[9px] font-mono font-black uppercase tracking-widest text-muted-foreground hover:text-foreground border border-dashed border-border/60 hover:border-border transition-all"
                       >
                        Preview
                       </a>
                    )}
                    <label className={`cursor-pointer px-8 h-12 flex items-center justify-center rounded-xl text-[9px] font-mono font-black uppercase tracking-[0.2em] transition-all border ${
                      isUploading
                        ? 'bg-muted text-muted-foreground border-dashed border-border/60 cursor-wait'
                        : isUploaded
                        ? 'bg-emerald-500 text-background border-emerald-500/50'
                        : 'bg-foreground text-background border-white/10 hover:scale-105 active:scale-95'
                    }`}>
                      {isUploading ? 'SYNCHRONIZING...' : isUploaded ? 'REPLACE_NODE' : 'UPLOAD_DATA'}
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
                  <div className="mt-6 p-4 rounded-xl border border-dashed border-rose-500/20 bg-rose-500/[0.02] flex items-center gap-3 text-rose-500">
                    <AlertCircle size={14} />
                    <p className="text-[9px] font-mono font-black uppercase tracking-widest">ERROR_LOG: {errors[field.key]}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Action triggers */}
      <div className="flex items-center justify-between pt-4">
        <button 
          type="button" 
          onClick={onBack}
          className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-all duration-300"
        >
          <div className="w-12 h-12 rounded-2xl border border-dashed border-border/60 flex items-center justify-center group-hover:border-blue-500/40 group-hover:text-blue-500 transition-all">
            <span className="text-sm font-mono font-black">←</span>
          </div>
          <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em]">Previous</span>
        </button>

        <Button 
          onClick={handleNext} 
          className="h-16 bg-foreground text-background hover:scale-105 active:scale-95 px-12 rounded-2xl font-mono font-black text-[10px] uppercase tracking-[0.3em] transition-all border border-white/10 shadow-2xl"
        >
          Final Review →
        </Button>
      </div>
    </div>
  );
}
