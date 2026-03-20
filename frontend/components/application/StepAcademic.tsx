'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormData } from './ApplicationForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const schema = z.object({
  institution: z.string().min(3, 'Institution name required'),
  course: z.string().min(2, 'Course name required'),
  yearOfStudy: z.string().min(1, 'Year of study required'),
  cgpa: z.string().min(1, 'CGPA required'),
  boardPercentage: z.string().min(1, 'Board percentage required'),
  admissionYear: z.string().min(4, 'Admission year required'),
});

interface Props {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepAcademic({ formData, updateFormData, onNext, onBack }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      institution: formData.institution,
      course: formData.course,
      yearOfStudy: formData.yearOfStudy,
      cgpa: formData.cgpa,
      boardPercentage: formData.boardPercentage,
      admissionYear: formData.admissionYear,
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
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] to-transparent -z-10" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Institution */}
          <div className="space-y-3 md:col-span-2">
            <label className={labelClass}>01. Educational Institution *</label>
            <Input {...register('institution')} className={inputClass} placeholder="UNIVERSITY / COLLEGE / SCHOOL NAME" />
            {errors.institution && <p className="text-rose-500 font-mono text-[9px] font-black uppercase tracking-widest ml-2 mt-2">Error: {errors.institution.message as string}</p>}
          </div>

          {/* Course */}
          <div className="space-y-3">
            <label className={labelClass}>02. Current Course *</label>
            <Input {...register('course')} className={inputClass} placeholder="e.g. B.TECH / M.SC / Ph.D" />
            {errors.course && <p className="text-rose-500 font-mono text-[9px] font-black uppercase tracking-widest ml-2 mt-2">Error: {errors.course.message as string}</p>}
          </div>

          {/* Year of Study */}
          <div className="space-y-3">
            <label className={labelClass}>03. Study Progression *</label>
            <select {...register('yearOfStudy')} className="w-full h-14 bg-white/[0.02] border border-dashed border-border/60 rounded-2xl px-6 text-foreground font-mono text-xs uppercase tracking-widest focus:outline-none focus:border-blue-500/40 transition-all cursor-pointer">
              <option value="" className="bg-background">SELECT_YEAR</option>
              {['1', '2', '3', '4', '5'].map(year => (
                <option key={year} value={year} className="bg-background">{year === '5' ? 'FINAL' : year + 'ST'} YEAR</option>
              ))}
            </select>
            {errors.yearOfStudy && <p className="text-rose-500 font-mono text-[9px] font-black uppercase tracking-widest ml-2 mt-2">Error: {errors.yearOfStudy.message as string}</p>}
          </div>

          {/* CGPA */}
          <div className="space-y-3">
            <label className={labelClass}>04. Academic Efficiency (CGPA) *</label>
            <Input
              {...register('cgpa')}
              type="number"
              step="0.01"
              min="0"
              max="10"
              className={inputClass}
              placeholder="X.XX"
            />
            {errors.cgpa && <p className="text-rose-500 font-mono text-[9px] font-black uppercase tracking-widest ml-2 mt-2">Error: {errors.cgpa.message as string}</p>}
          </div>

          {/* Board Percentage */}
          <div className="space-y-3">
            <label className={labelClass}>05. Last Cert. Yield (%) *</label>
            <Input
              {...register('boardPercentage')}
              type="number"
              step="0.01"
              min="0"
              max="100"
              className={inputClass}
              placeholder="XX.XX"
            />
            {errors.boardPercentage && <p className="text-rose-500 font-mono text-[9px] font-black uppercase tracking-widest ml-2 mt-2">Error: {errors.boardPercentage.message as string}</p>}
          </div>

          {/* Admission Year */}
          <div className="space-y-3">
            <label className={labelClass}>06. Admission Cycle *</label>
            <Input
              {...register('admissionYear')}
              type="number"
              min="2015"
              max="2025"
              className={inputClass}
              placeholder="YYYY"
            />
            {errors.admissionYear && <p className="text-rose-500 font-mono text-[9px] font-black uppercase tracking-widest ml-2 mt-2">Error: {errors.admissionYear.message as string}</p>}
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
          Next Component →
        </Button>
      </div>
    </form>
  );
}
