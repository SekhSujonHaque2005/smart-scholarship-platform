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

  const inputClass = "w-full bg-muted/50 border rounded-lg py-2.5 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const labelClass = "text-sm font-medium text-foreground mb-1 ml-1 block";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Institution */}
          <div className="space-y-1 md:col-span-2">
            <label className={labelClass}>Educational Institution *</label>
            <Input {...register('institution')} className={inputClass} placeholder="University / College / School Name" />
            {errors.institution && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.institution.message as string}</p>}
          </div>

          {/* Course */}
          <div className="space-y-1">
            <label className={labelClass}>Current Course *</label>
            <Input {...register('course')} className={inputClass} placeholder="e.g. B.Tech / M.Sc / Ph.D" />
            {errors.course && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.course.message as string}</p>}
          </div>

          {/* Year of Study */}
          <div className="space-y-1">
            <label className={labelClass}>Year of Study *</label>
            <select {...register('yearOfStudy')} className="w-full h-10 bg-muted/50 border rounded-lg px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer">
              <option value="" className="bg-card">Select Year</option>
              {['1', '2', '3', '4', '5'].map(year => (
                <option key={year} value={year} className="bg-card">{year === '5' ? 'Final' : year + 'st'} Year</option>
              ))}
            </select>
            {errors.yearOfStudy && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.yearOfStudy.message as string}</p>}
          </div>

          {/* CGPA */}
          <div className="space-y-1">
            <label className={labelClass}>Academic CGPA *</label>
            <Input
              {...register('cgpa')}
              type="number"
              step="0.01"
              min="0"
              max="10"
              className={inputClass}
              placeholder="X.XX"
            />
            {errors.cgpa && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.cgpa.message as string}</p>}
          </div>

          {/* Board Percentage */}
          <div className="space-y-1">
            <label className={labelClass}>Last Certificate Percentage (%) *</label>
            <Input
              {...register('boardPercentage')}
              type="number"
              step="0.01"
              min="0"
              max="100"
              className={inputClass}
              placeholder="XX.XX"
            />
            {errors.boardPercentage && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.boardPercentage.message as string}</p>}
          </div>

          {/* Admission Year */}
          <div className="space-y-1">
            <label className={labelClass}>Admission Year *</label>
            <Input
              {...register('admissionYear')}
              type="number"
              min="2015"
              max="2026"
              className={inputClass}
              placeholder="YYYY"
            />
            {errors.admissionYear && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.admissionYear.message as string}</p>}
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
