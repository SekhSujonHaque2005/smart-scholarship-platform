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

  const inputClass = "w-full bg-muted/50 border rounded-lg py-2.5 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const labelClass = "text-sm font-medium text-foreground mb-1 ml-1 block";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
        {/* Technical Warning */}
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-100 flex items-start gap-3 text-amber-800 text-sm dark:bg-amber-500/10 dark:border-amber-500/20">
          <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 font-bold shrink-0 text-xs">
            !
          </div>
          <div className="space-y-1">
            <p className="font-semibold">Security Declaration Required</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Accuracy of financial data is critical. Please double-check your bank details. 
              Discrepancies may cause delays or scholarship disqualification.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Annual Income */}
          <div className="space-y-1 md:col-span-2">
            <label className={labelClass}>Annual Family Income Range (₹) *</label>
            <select {...register('annualIncome')} className="w-full h-10 bg-muted/50 border rounded-lg px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer">
              <option value="" className="bg-card">Select Income Range</option>
              <option value="BELOW_1L" className="bg-card">Below ₹1 Lakh</option>
              <option value="1L_3L" className="bg-card">₹1L — ₹3L</option>
              <option value="3L_6L" className="bg-card">₹3L — ₹6L</option>
              <option value="6L_10L" className="bg-card">₹6L — ₹10L</option>
              <option value="ABOVE_10L" className="bg-card">Above ₹10 Lakh</option>
            </select>
            {errors.annualIncome && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.annualIncome.message as string}</p>}
          </div>

          {/* Bank Name */}
          <div className="space-y-1 md:col-span-2">
            <label className={labelClass}>Bank Name *</label>
            <Input {...register('bankName')} className={inputClass} placeholder="e.g. State Bank of India" />
            {errors.bankName && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.bankName.message as string}</p>}
          </div>

          {/* Account Holder Name */}
          <div className="space-y-1 md:col-span-2">
            <label className={labelClass}>Account Holder Name *</label>
            <Input {...register('accountHolderName')} className={inputClass} placeholder="As per official bank records" />
            {errors.accountHolderName && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.accountHolderName.message as string}</p>}
          </div>

          {/* Account Number */}
          <div className="space-y-1">
            <label className={labelClass}>Bank Account Number *</label>
            <Input {...register('bankAccountNumber')} className={inputClass} placeholder="Enter your account number" />
            {errors.bankAccountNumber && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.bankAccountNumber.message as string}</p>}
          </div>

          {/* IFSC Code */}
          <div className="space-y-1">
            <label className={labelClass}>IFSC Code *</label>
            <Input
              {...register('ifscCode')}
              className={cn(inputClass, "uppercase")}
              placeholder="e.g. SBIN0001234"
              maxLength={11}
            />
            {errors.ifscCode && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.ifscCode.message as string}</p>}
          </div>
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
          type="submit" 
          className="bg-blue-600 text-white hover:bg-blue-700 h-11 px-8 text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          Next Step
        </Button>
      </div>
    </form>
  );
}
