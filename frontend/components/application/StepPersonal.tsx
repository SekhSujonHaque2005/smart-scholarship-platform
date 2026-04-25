'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormData } from './ApplicationForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const schema = z.object({
  fullName: z.string().min(3, 'Full name required'),
  dateOfBirth: z.string().min(1, 'Date of birth required'),
  gender: z.string().min(1, 'Gender required'),
  phone: z.string().min(10, 'Valid phone number required'),
  address: z.string().min(5, 'Address required'),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  pincode: z.string().min(6, 'Valid pincode required'),
});

interface Props {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  onNext: () => void;
}

export default function StepPersonal({ formData, updateFormData, onNext }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: formData.fullName,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
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
          {/* Full Name */}
          <div className="space-y-1 md:col-span-2">
            <label className={labelClass}>Full Name *</label>
            <Input {...register('fullName')} className={inputClass} placeholder="As per official registry" />
            {errors.fullName && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.fullName.message as string}</p>}
          </div>

          {/* Date of Birth */}
          <div className="space-y-1">
            <label className={labelClass}>Date of Birth *</label>
            <Input {...register('dateOfBirth')} type="date" className={inputClass} />
            {errors.dateOfBirth && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.dateOfBirth.message as string}</p>}
          </div>

          {/* Gender */}
          <div className="space-y-1">
            <label className={labelClass}>Gender *</label>
            <select {...register('gender')} className="w-full h-10 bg-muted/50 border rounded-lg px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer">
              <option value="" className="bg-card">Select Gender</option>
              <option value="male" className="bg-card">Male</option>
              <option value="female" className="bg-card">Female</option>
              <option value="other" className="bg-card">Other</option>
              <option value="prefer_not_to_say" className="bg-card">Prefer not to say</option>
            </select>
            {errors.gender && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.gender.message as string}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-1 md:col-span-2">
            <label className={labelClass}>Phone Number *</label>
            <Input {...register('phone')} className={inputClass} placeholder="+91 XXXX XXXX" />
            {errors.phone && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.phone.message as string}</p>}
          </div>

          {/* Address */}
          <div className="space-y-1 md:col-span-2">
            <label className={labelClass}>Resident Address *</label>
            <Input {...register('address')} className={inputClass} placeholder="House/Flat No, Street, Region" />
            {errors.address && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.address.message as string}</p>}
          </div>

          {/* City */}
          <div className="space-y-1">
            <label className={labelClass}>City *</label>
            <Input {...register('city')} className={inputClass} placeholder="e.g. Mumbai" />
            {errors.city && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.city.message as string}</p>}
          </div>

          {/* State */}
          <div className="space-y-1">
            <label className={labelClass}>State *</label>
            <select {...register('state')} className="w-full h-10 bg-muted/50 border rounded-lg px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer">
              <option value="" className="bg-card">Select State</option>
              {['Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Gujarat', 'Karnataka',
                'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab',
                'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
              ].map(state => (
                <option key={state} value={state} className="bg-card">{state}</option>
              ))}
            </select>
            {errors.state && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.state.message as string}</p>}
          </div>

          {/* Pincode */}
          <div className="space-y-1 pb-2">
            <label className={labelClass}>Pincode *</label>
            <Input {...register('pincode')} className={inputClass} placeholder="6 digits" maxLength={6} />
            {errors.pincode && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.pincode.message as string}</p>}
          </div>
        </div>
      </div>

      {/* Action triggers */}
      <div className="flex justify-end pt-4">
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
