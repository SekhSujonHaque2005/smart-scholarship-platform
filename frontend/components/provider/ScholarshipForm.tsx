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
  Loader2,
  AlertCircle,
  CheckCircle2,
  IndianRupee,
  Calendar,
  Sparkles
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
      <Icon size={16} className="text-muted-foreground" />
      <label className="text-sm font-medium text-foreground">{label}</label>
    </div>
    <div className="relative group">
      <input
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className={cn(
          "w-full bg-muted/50 border rounded-lg py-2.5 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all",
          error && "border-rose-500/50 focus:ring-rose-500"
        )}
      />
      {error && <p className="text-xs text-rose-500 mt-1">{error.message}</p>}
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
  const [aiGenerating, setAiGenerating] = useState(false);

  const { register, handleSubmit, formState: { errors }, control, reset, setValue, watch } = useForm<FormValues>({
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
      setErrorStatus('Your account must be verified before you can publish scholarships.');
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
      console.error('Failed to submit scholarship:', err);
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Something went wrong. Please try again.';
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
       setErrorStatus(`Please fix "${firstErrorKey}": ${firstArrErr?.value?.message || 'Invalid entry'}`);
    } else {
       setErrorStatus(`Please fix "${firstErrorKey}": ${firstError?.message || 'Invalid entry'}`);
    }
  };

  const steps = [
    { id: 1, label: "Basic Details", icon: FileText },
    { id: 2, label: "Eligibility", icon: Target },
    { id: 3, label: "Requirements", icon: ShieldCheck },
    { id: 4, label: "Funding", icon: IndianRupee },
  ];

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20">
          <CheckCircle2 size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Scholarship Submitted</h2>
          <p className="text-sm text-muted-foreground">Your program is now pending admin review. You'll be redirected shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-10 px-2">
        {steps.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-2 relative">
              <div className={cn(
                "w-10 h-10 rounded-lg border flex items-center justify-center transition-all",
                step >= s.id
                  ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/30"
                  : "bg-muted border-border text-muted-foreground/40"
              )}>
                <s.icon size={18} />
              </div>
              <span className={cn(
                "text-xs font-medium absolute -bottom-6 whitespace-nowrap",
                step === s.id ? "text-foreground" : "text-muted-foreground/50"
              )}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-[2px] bg-border mx-4 rounded-full relative overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: step > s.id ? '100%' : '0%' }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Error Banner */}
      {errorStatus && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-600 text-sm dark:bg-rose-500/10 dark:border-rose-500/20">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorStatus}</span>
        </div>
      )}

      {/* Verification Warning */}
      {profile && profile.verificationStatus !== 'APPROVED' && (
        <div className="mb-6 p-5 rounded-xl bg-amber-50 border border-amber-100 space-y-2 dark:bg-amber-500/10 dark:border-amber-500/20">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-amber-600 shrink-0" size={18} />
            <h4 className="text-sm font-semibold text-foreground">Verification Required</h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed ml-[30px]">
            Your organization is currently <span className="font-medium text-amber-600">pending verification</span>. You can draft scholarships, but publishing is restricted until your identity is verified.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Basic Details */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card border rounded-2xl p-8 space-y-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-blue-50 border flex items-center justify-center text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20">
                  <FileText size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Basic Details</h2>
                  <p className="text-sm text-muted-foreground">Name, description, and category</p>
                </div>
              </div>

              <InputField
                label="Scholarship Title"
                icon={FileText}
                placeholder="e.g. Quantum Computing Fellowship"
                register={register}
                name="title"
                error={errors.title}
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target size={16} className="text-muted-foreground" />
                    <label className="text-sm font-medium text-foreground">Description</label>
                  </div>
                  <button
                    type="button"
                    disabled={aiGenerating}
                    onClick={async () => {
                      const title = watch('title');
                      const category = watch('category');
                      if (!title || title.length < 3) {
                        setErrorStatus('Please enter a scholarship title first (at least 3 characters).');
                        return;
                      }
                      setAiGenerating(true);
                      setErrorStatus(null);
                      try {
                        const aiUrl = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8000';
                        const res = await fetch(`${aiUrl}/api/generate/description`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ title, category: category || 'General' }),
                        });

                        if (!res.ok) {
                          const err = await res.json();
                          throw new Error(err.detail || 'Generation failed');
                        }
                        const data = await res.json();
                        setValue('description', data.description, { shouldValidate: true });
                      } catch (err: any) {
                        setErrorStatus(err.message || 'Failed to generate description. Please try again.');
                      } finally {
                        setAiGenerating(false);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 text-white text-xs font-medium hover:from-violet-700 hover:to-blue-700 transition-all disabled:opacity-60 shadow-sm"
                  >
                    {aiGenerating ? (
                      <><Loader2 size={14} className="animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles size={14} /> Generate with AI</>
                    )}
                  </button>
                </div>
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Provide a detailed description of your scholarship program..."
                  className={cn(
                    "w-full bg-muted/50 border rounded-lg py-2.5 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none",
                    errors.description && "border-rose-500/50 focus:ring-rose-500"
                  )}
                />
                {errors.description && <p className="text-xs text-rose-500">{errors.description.message}</p>}
              </div>

              <InputField
                label="Category"
                icon={Target}
                placeholder="e.g. STEM, Arts, Research"
                register={register}
                name="category"
                error={errors.category}
              />
            </motion.div>
          )}

          {/* Step 2: Eligibility */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card border rounded-2xl p-8 space-y-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-amber-50 border flex items-center justify-center text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/20">
                  <Target size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Eligibility Criteria</h2>
                  <p className="text-sm text-muted-foreground">Define who can apply for this scholarship</p>
                </div>
              </div>

              <div className="space-y-3">
                {fields.map((field, i) => (
                  <div key={field.id} className="flex gap-3">
                    <div className="flex-1">
                      <input
                        {...register(`eligibility.${i}.value` as const)}
                        placeholder={`Eligibility criteria ${i + 1}`}
                        className="w-full bg-muted/50 border rounded-lg py-2.5 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      {errors.eligibility?.[i]?.value && <p className="text-xs text-rose-500 mt-1">{errors.eligibility[i]?.value?.message}</p>}
                    </div>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(i)}
                        className="w-10 h-10 rounded-lg border text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors flex items-center justify-center shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => append({ value: '' })}
                className="w-full py-3 border-2 border-dashed border-border rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add Criteria
              </button>
            </motion.div>
          )}

          {/* Step 3: Submission Requirements */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card border rounded-2xl p-8 space-y-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-blue-50 border flex items-center justify-center text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Submission Requirements</h2>
                  <p className="text-sm text-muted-foreground">Documents students must submit with their application</p>
                </div>
              </div>

              <div className="space-y-3">
                {reqFields.map((field, i) => (
                  <div key={field.id} className="flex gap-3">
                    <div className="flex-1">
                      <input
                        {...register(`requirements.${i}.value` as const)}
                        placeholder={`e.g. Photocopy of Bank Passbook`}
                        className="w-full bg-muted/50 border rounded-lg py-2.5 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      {errors.requirements?.[i]?.value && <p className="text-xs text-rose-500 mt-1">{errors.requirements[i]?.value?.message}</p>}
                    </div>
                    {reqFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => reqRemove(i)}
                        className="w-10 h-10 rounded-lg border text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors flex items-center justify-center shrink-0"
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
                className="w-full py-3 border-2 border-dashed border-border rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add Requirement
              </button>
            </motion.div>
          )}

          {/* Step 4: Funding */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card border rounded-2xl p-8 space-y-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 border flex items-center justify-center text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                  <IndianRupee size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Funding Details</h2>
                  <p className="text-sm text-muted-foreground">Scholarship amount and application deadline</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InputField
                  label="Amount (₹)"
                  icon={IndianRupee}
                  placeholder="50000"
                  register={register}
                  name="amount"
                  error={errors.amount}
                />
                <InputField
                  label="Application Deadline"
                  icon={Calendar}
                  type="date"
                  register={register}
                  name="deadline"
                  error={errors.deadline}
                />
              </div>

              <div className="mt-6 p-5 rounded-xl bg-blue-50 border border-blue-100 dark:bg-blue-500/5 dark:border-blue-500/20">
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 dark:bg-blue-500/10">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">Before You Submit</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      By submitting this scholarship, you authorize the allocation of the specified funds and agree to the verification standards of ScholarHub.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setStep(s => Math.max(1, s - 1))}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
              step === 1 ? "opacity-0 pointer-events-none" : "bg-muted border text-muted-foreground hover:text-foreground hover:bg-muted/80"
            )}
          >
            <ChevronLeft size={16} /> Previous
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all"
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || profile?.verificationStatus !== 'APPROVED'}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
                loading || profile?.verificationStatus !== 'APPROVED'
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : null}
              {loading ? 'Submitting...' : (mode === 'edit' ? 'Update Scholarship' : 'Submit Scholarship')}
              <ShieldCheck size={16} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
