'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormData } from './ApplicationForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const schema = z.object({
  annualIncome: z.string().min(1, 'Annual income required'),
  bankAccountNumber: z.string().min(9, 'Valid bank account number required'),
  ifscCode: z.string().min(11, 'Valid IFSC code required').max(11),
  accountHolderName: z.string().min(3, 'Account holder name required'),
  bankName: z.string().min(2, 'Bank name required'),
});

interface Props {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepFinancial({ formData, updateFormData, onNext, onBack }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      annualIncome: formData.annualIncome,
      bankAccountNumber: formData.bankAccountNumber,
      ifscCode: formData.ifscCode,
      accountHolderName: formData.accountHolderName,
      bankName: formData.bankName,
    }
  });

  const onSubmit = (data: any) => {
    updateFormData(data);
    onNext();
  };

  const inputClass = "h-14 bg-white/[0.02] border border-dashed border-border/60 text-foreground placeholder:text-muted-foreground/30 focus:border-blue-500/40 rounded-2xl font-mono text-xs transition-all shadow-sm px-6";

  const labelClass = "text-[9px] font-mono font-black text-muted-foreground uppercase tracking-[0.3em] ml-2 mb-2 block";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
      <div className="bg-white/[0.01] border border-dashed border-border/60 rounded-[48px] p-12 relative overflow-hidden">
        {/* Subtle glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.02] to-transparent -z-10" />
        
        {/* Technical Warning */}
        <div className="mb-10 p-6 rounded-3xl border border-dashed border-amber-500/20 bg-amber-500/[0.02] flex items-start gap-6">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shrink-0">
            <span className="font-mono font-black text-xs">!</span>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-mono font-black text-amber-500 uppercase tracking-[0.4em] leading-none">Security Declaration Required</p>
            <p className="text-muted-foreground text-[10px] font-mono leading-relaxed uppercase tracking-tight opacity-60">
              Accuracy of financial data is critical. AI-based verification agents will cross-reference these inputs with official registry documentation.
              Discrepancies may trigger permanent disqualification.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Annual Income */}
          <div className="space-y-3 md:col-span-2">
            <label className={labelClass}>01. Annual Family Yield Range (₹) *</label>
            <select {...register('annualIncome')} className="w-full h-14 bg-white/[0.02] border border-dashed border-border/60 rounded-2xl px-6 text-foreground font-mono text-xs uppercase tracking-widest focus:outline-none focus:border-blue-500/40 transition-all cursor-pointer">
              <option value="" className="bg-background">SELECT_INCOME_RANGE</option>
              <option value="BELOW_1L" className="bg-background">BELOW ₹1 LAKH</option>
              <option value="1L_3L" className="bg-background">₹1L — ₹3L</option>
              <option value="3L_6L" className="bg-background">₹3L — ₹6L</option>
              <option value="6L_10L" className="bg-background">₹6L — ₹10L</option>
              <option value="ABOVE_10L" className="bg-background">ABOVE ₹10 LAKH</option>
            </select>
            {errors.annualIncome && <p className="text-rose-500 font-mono text-[9px] font-black uppercase tracking-widest ml-2 mt-2">Error: {errors.annualIncome.message as string}</p>}
          </div>

          {/* Bank Name */}
          <div className="space-y-3 md:col-span-2">
            <label className={labelClass}>02. Financial Institution (Bank) *</label>
            <Input {...register('bankName')} className={inputClass} placeholder="e.g. STATE BANK OF INDIA" />
            {errors.bankName && <p className="text-rose-500 font-mono text-[9px] font-black uppercase tracking-widest ml-2 mt-2">Error: {errors.bankName.message as string}</p>}
          </div>

          {/* Account Holder Name */}
          <div className="space-y-3 md:col-span-2">
            <label className={labelClass}>03. Registry Account Holder Name *</label>
            <Input {...register('accountHolderName')} className={inputClass} placeholder="AS PER FINANCIAL RECORDS" />
            {errors.accountHolderName && <p className="text-rose-500 font-mono text-[9px] font-black uppercase tracking-widest ml-2 mt-2">Error: {errors.accountHolderName.message as string}</p>}
          </div>

          {/* Account Number */}
          <div className="space-y-3">
            <label className={labelClass}>04. Node Account Number *</label>
            <Input {...register('bankAccountNumber')} className={inputClass} placeholder="ENTER ACCOUNT DIGITS" />
            {errors.bankAccountNumber && <p className="text-rose-500 font-mono text-[9px] font-black uppercase tracking-widest ml-2 mt-2">Error: {errors.bankAccountNumber.message as string}</p>}
          </div>

          {/* IFSC Code */}
          <div className="space-y-3">
            <label className={labelClass}>05. IFSC Routing Protocol *</label>
            <Input
              {...register('ifscCode')}
              className={cn(inputClass, "uppercase")}
              placeholder="e.g. SBIN0001234"
              maxLength={11}
            />
            {errors.ifscCode && <p className="text-rose-500 font-mono text-[9px] font-black uppercase tracking-widest ml-2 mt-2">Error: {errors.ifscCode.message as string}</p>}
          </div>
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
          type="submit" 
          className="h-16 bg-foreground text-background hover:scale-105 active:scale-95 px-12 rounded-2xl font-mono font-black text-[10px] uppercase tracking-[0.3em] transition-all border border-white/10 shadow-2xl"
        >
          Generate Manifest →
        </Button>
      </div>
    </form>
  );
}
