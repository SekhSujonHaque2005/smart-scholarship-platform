'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Target,
  FileText,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Zap,
  Cpu,
  Loader2,
  AlertCircle,
  CheckCircle2,
  IndianRupee,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/app/lib/api';
import { useRouter } from 'next/navigation';

const scholarshipSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be more detailed"),
  amount: z.string().min(1, "Amount is required"),
  deadline: z.string().min(1, "Deadline is required"),
  category: z.string().min(1, "Category is required"),
  eligibility: z.array(z.object({
    value: z.string().min(1, "Criteria cannot be empty")
  })).min(1, "At least one eligibility criteria is required"),
  requirements: z.array(z.object({
    value: z.string().min(1, "Requirement cannot be empty")
  })).min(1, "At least one submission requirement is required"),
});

type FormValues = z.infer<typeof scholarshipSchema>;

const InputField = ({ label, icon: Icon, placeholder, register, name, error, type = "text" }: any) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Icon size={14} className="text-muted-foreground" />
      <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-black opacity-100 dark:opacity-70">{label}</label>
    </div>
    <div className="relative group">
      <input
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className={cn(
          "w-full bg-accent/30 border border-border rounded-2xl py-3 px-4 text-sm font-bold text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-indigo-500/50 transition-all shadow-sm",
          error && "border-rose-500/50"
        )}
      />
      {error && <p className="text-[9px] font-mono text-rose-500 mt-1 uppercase tracking-tight">{error.message}</p>}
    </div>
  </div>
);

export const ScholarshipForm = ({ initialData, mode = 'create' }: { initialData?: any, mode?: 'create' | 'edit' }) => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, control, reset } = useForm<FormValues>({
    resolver: zodResolver(scholarshipSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      amount: initialData?.amount?.toString() || '',
      deadline: initialData?.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : '',
      category: initialData?.category || '',
      eligibility: Array.isArray(initialData?.criteriaJson)
        ? initialData.criteriaJson.map((v: string) => ({ value: v }))
        : [{ value: '' }],
      requirements: Array.isArray(initialData?.requirementsJson)
        ? initialData.requirementsJson.map((v: string) => ({ value: v }))
        : [{ value: 'Photocopy of Bank Passbook' }]
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        description: initialData.description,
        amount: initialData.amount?.toString(),
        deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : '',
        category: initialData.category,
        eligibility: Array.isArray(initialData.criteriaJson)
          ? initialData.criteriaJson.map((v: string) => ({ value: v }))
          : [{ value: '' }],
        requirements: Array.isArray(initialData.requirementsJson)
          ? initialData.requirementsJson.map((v: string) => ({ value: v }))
          : [{ value: 'Photocopy of Bank Passbook' }]
      });
    }
  }, [initialData, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "eligibility"
  });

  const { fields: reqFields, append: reqAppend, remove: reqRemove } = useFieldArray({
    control,
    name: "requirements"
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('providers/me/profile');
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to fetch provider profile:', err);
      }
    };
    fetchProfile();
  }, []);

  const onSubmit = async (data: FormValues) => {
    if (profile?.verificationStatus !== 'APPROVED') {
      setErrorStatus('YOUR_ACCOUNT_MUST_BE_VERIFIED_TO_DEPLOY_PROTOCOLS');
      return;
    }

    try {
      setLoading(true);
      setErrorStatus(null);

      const payload = {
        title: data.title,
        description: data.description,
        amount: parseFloat(data.amount),
        deadline: data.deadline,
        category: data.category,
        criteriaJson: data.eligibility.map((e) => e.value),
        requirementsJson: data.requirements.map((e) => e.value),
        status: mode === 'create' ? 'PENDING_REVIEW' : undefined
      };

      if (mode === 'edit' && initialData?.id) {
        await api.put(`scholarships/${initialData.id}`, payload);
      } else {
        await api.post('scholarships', payload);
      }
      setSuccess(true);

      setTimeout(() => {
        router.push('/dashboard/provider/scholarships');
      }, 2000);
    } catch (err) {
      console.error('Failed to deploy scholarship:', err);
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'DEPLOYMENT_FAILURE_DETECTED';
      setErrorStatus(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onError = (errors: any) => {
    const firstErrorKey = Object.keys(errors)[0];
    const firstError = errors[firstErrorKey];
    
    if (Array.isArray(firstError)) {
       const firstArrErr = firstError.find((e: any) => e);
       setErrorStatus(`VALIDATION FAILED ON ${firstErrorKey.toUpperCase()}: ${firstArrErr?.value?.message || 'Invalid entry'}`);
    } else {
       setErrorStatus(`VALIDATION FAILED ON ${firstErrorKey.toUpperCase()}: ${firstError?.message || 'Invalid entry'}`);
    }
  };

  const steps = [
    { id: 1, label: "Core Protocol", icon: FileText },
    { id: 2, label: "Eligibility Matrix", icon: Target },
    { id: 3, label: "Submission Schema", icon: ShieldCheck },
    { id: 4, label: "Resource Allocation", icon: IndianRupee },
  ];

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
        <div className="w-20 h-20 rounded-[32px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
          <CheckCircle2 size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">Protocol Submitted</h2>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] font-bold">Awaiting Admin Verification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-12 px-4">
        {steps.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-3 relative">
              <div className={cn(
                "w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-500",
                step >= s.id
                  ? "bg-indigo-500/10 border-indigo-500 text-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                  : "bg-accent border-border text-muted-foreground/40"
              )}>
                <s.icon size={18} />
              </div>
              <span className={cn(
                "text-[9px] font-mono uppercase tracking-widest absolute -bottom-6 whitespace-nowrap font-black",
                step === s.id ? "text-foreground" : "text-muted-foreground/40"
              )}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-[1px] bg-border mx-6 relative">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-indigo-500/50"
                  initial={{ width: 0 }}
                  animate={{ width: step > s.id ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {errorStatus && (
        <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-500 text-[10px] font-mono uppercase tracking-widest">
          <AlertCircle size={16} />
          {errorStatus}
        </div>
      )}

      {profile && profile.verificationStatus !== 'APPROVED' && (
        <div className="mb-8 p-6 rounded-[32px] bg-amber-500/10 border border-amber-500/20 space-y-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-amber-500" size={20} />
            <h4 className="text-[11px] font-black text-foreground uppercase tracking-widest">Unauthorized Deployment State</h4>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground uppercase leading-relaxed tracking-wider font-black opacity-80 dark:opacity-70">
            Your organization profile is currently in <span className="text-amber-500 font-black">PENDING_VERIFICATION</span> status. You can draft protocols, but official deployment is restricted until identity verification is complete.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card border border-border rounded-[48px] p-10 space-y-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Cpu size={16} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-foreground tracking-tight uppercase">System Core</h2>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-black opacity-100 dark:opacity-60">Initialization & Classification</p>
                </div>
              </div>

              <InputField
                label="Initiative Title"
                icon={FileText}
                placeholder="E.G. QUANTUM COMPUTING FELLOWSHIP"
                register={register}
                name="title"
                error={errors.title}
              />

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target size={14} className="text-muted-foreground" />
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-black opacity-100 dark:opacity-70">Protocol Description</label>
                </div>
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="PROVIDE COMPREHENSIVE DETAILS..."
                  className={cn(
                    "w-full bg-accent/30 border border-border rounded-2xl py-3 px-4 text-sm font-bold text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-indigo-500/50 transition-all resize-none shadow-sm",
                    errors.description && "border-rose-500/50"
                  )}
                />
                {errors.description && <p className="text-[9px] font-mono text-rose-500 uppercase tracking-tight">{errors.description.message}</p>}
              </div>

              <InputField
                label="Disbursement Category"
                icon={Zap}
                placeholder="E.G. STEM, ARTS, RESEARCH"
                register={register}
                name="category"
                error={errors.category}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card border border-border rounded-[48px] p-10 space-y-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-foreground tracking-tight uppercase">Eligibility Matrix</h2>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-black opacity-90 dark:opacity-60">Filter Conditions & Constraints</p>
                </div>
              </div>

              {fields.map((field, i) => (
                <div key={field.id} className="flex gap-3">
                  <div className="flex-1">
                    <input
                      {...register(`eligibility.${i}.value` as const)}
                      placeholder={`CONDITION_PARAM_${i + 1}`}
                      className="w-full bg-accent/30 border border-border rounded-2xl py-3 px-4 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-indigo-500/50 transition-all font-bold shadow-sm"
                    />
                    {errors.eligibility?.[i]?.value && <p className="text-[9px] font-mono text-rose-500 mt-1 uppercase tracking-tight">{errors.eligibility[i]?.value?.message}</p>}
                  </div>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="w-12 h-12 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center justify-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => append({ value: '' })}
                className="w-full py-4 border-2 border-dashed border-border rounded-2xl text-[10px] font-mono text-muted-foreground hover:text-foreground hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all uppercase tracking-widest font-black"
              >
                + APPEND NEW CRITERIA
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card border border-border rounded-[48px] p-10 space-y-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-foreground tracking-tight uppercase">Submission Requirements</h2>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-black opacity-90 dark:opacity-60">Defined Artifacts for Student Verification</p>
                </div>
              </div>

              <div className="space-y-4">
                {reqFields.map((field, i) => (
                  <div key={field.id} className="flex gap-3">
                    <div className="flex-1">
                      <input
                        {...register(`requirements.${i}.value` as const)}
                        placeholder={`REQUIREMENT_NAME_${i + 1} (E.G. Photocopy of Passbook)`}
                        className="w-full bg-accent/30 border border-border rounded-2xl py-3 px-4 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-indigo-500/50 transition-all font-bold shadow-sm"
                      />
                      {errors.requirements?.[i]?.value && <p className="text-[9px] font-mono text-rose-500 mt-1 uppercase tracking-tight">{errors.requirements[i]?.value?.message}</p>}
                    </div>
                    {reqFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => reqRemove(i)}
                        className="w-12 h-12 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center justify-center"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => reqAppend({ value: '' })}
                className="w-full py-4 border-2 border-dashed border-border rounded-2xl text-[10px] font-mono text-muted-foreground hover:text-foreground hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all uppercase tracking-widest font-black"
              >
                + ADD REQUIRED DOCUMENT
              </button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card border border-border rounded-[48px] p-10 space-y-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <IndianRupee size={16} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-foreground tracking-tight uppercase">Resource Allocation</h2>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-black opacity-100 dark:opacity-60">Financial & Temporal Parameters</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <InputField
                  label="Capital Disbursement (₹)"
                  icon={IndianRupee}
                  placeholder="50000"
                  register={register}
                  name="amount"
                  error={errors.amount}
                />
                <InputField
                  label="Temporal Deadline"
                  icon={Calendar}
                  type="date"
                  register={register}
                  name="deadline"
                  error={errors.deadline}
                />
              </div>

              <div className="mt-8 p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/20">
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-[12px] font-black text-foreground uppercase tracking-widest mb-1">Final Authorization</h4>
                    <p className="text-[10px] font-mono text-muted-foreground leading-relaxed uppercase font-black opacity-80 dark:opacity-70">
                      By deploying this initiative, you authorize the allocation of funds and agree to the smart verification standards of the ScholarHub protocol.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => setStep(s => Math.max(1, s - 1))}
            className={cn(
              "flex items-center gap-2 px-8 py-4 rounded-3xl font-mono text-[10px] uppercase tracking-[0.2em] transition-all font-black",
              step === 1 ? "opacity-0 pointer-events-none" : "bg-accent border border-border text-muted-foreground hover:text-foreground hover:bg-accent/80"
            )}
          >
            <ChevronLeft size={16} /> Previous
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-2 px-8 py-4 rounded-3xl bg-foreground text-background dark:bg-white dark:text-black font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-90 transition-all"
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || profile?.verificationStatus !== 'APPROVED'}
              className={cn(
                "flex items-center gap-2 px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-[0_10px_30px_rgba(79,70,229,0.3)]",
                loading || profile?.verificationStatus !== 'APPROVED'
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-500"
              )}
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : (mode === 'edit' ? "Update Protocol" : "Deploy Protocol")} <ShieldCheck size={16} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
