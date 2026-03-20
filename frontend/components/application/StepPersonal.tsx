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

  const inputClass = "h-14 bg-white/[0.02] border border-dashed border-border/60 text-foreground placeholder:text-muted-foreground/30 focus:border-blue-500/40 rounded-2xl font-mono text-xs transition-all shadow-sm px-6";

  const labelClass = "text-[9px] font-mono font-black text-muted-foreground uppercase tracking-[0.3em] ml-2 mb-2 block";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
      <div className="bg-white/[0.01] border border-dashed border-border/60 rounded-[48px] p-12 relative overflow-hidden">
        {/* Subtle glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent -z-10" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Full Name */}
          <div className="space-y-3 md:col-span-2">
            <label className={labelClass}>01. Full Name *</label>
            <Input {...register('fullName')} className={inputClass} placeholder="AS PER OFFICIAL REGISTRY" />
            {errors.fullName && <p className="text-rose-500 font-mono text-[9px] font-black uppercase tracking-widest ml-2 mt-2">Error: {errors.fullName.message as string}</p>}
          </div>

          {/* Date of Birth */}
          <div className="space-y-3">
            <label className={labelClass}>02. Date of Birth *</label>
            <Input {...register('dateOfBirth')} type="date" className={inputClass} />
            {errors.dateOfBirth && <p className="text-rose-500 font-mono text-[9px] font-black uppercase tracking-widest ml-2 mt-2">Error: {errors.dateOfBirth.message as string}</p>}
          </div>

          {/* Gender */}
          <div className="space-y-3">
            <label className={labelClass}>03. Gender *</label>
            <select {...register('gender')} className="w-full h-14 bg-white/[0.02] border border-dashed border-border/60 rounded-2xl px-6 text-foreground font-mono text-xs uppercase tracking-widest focus:outline-none focus:border-blue-500/40 transition-all cursor-pointer">
              <option value="" className="bg-background">SELECT_GENDER</option>
              <option value="male" className="bg-background">MALE</option>
              <option value="female" className="bg-background">FEMALE</option>
              <option value="other" className="bg-background">OTHER</option>
              <option value="prefer_not_to_say" className="bg-background">PRIVATE</option>
            </select>
            {errors.gender && <p className="text-rose-500 font-mono text-[9px] font-black uppercase tracking-widest ml-2 mt-2">Error: {errors.gender.message as string}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-3 md:col-span-2">
            <label className={labelClass}>04. Phone Number *</label>
            <Input {...register('phone')} className={inputClass} placeholder="+91 XXXX XXXX" />
            {errors.phone && <p className="text-rose-500 font-mono text-[9px] font-black uppercase tracking-widest ml-2 mt-2">Error: {errors.phone.message as string}</p>}
          </div>

          {/* Address */}
          <div className="space-y-3 md:col-span-2">
            <label className={labelClass}>05. Resident Address *</label>
            <Input {...register('address')} className={inputClass} placeholder="HOUSE/FLAT NO, STREET, REGION" />
            {errors.address && <p className="text-rose-500 font-mono text-[9px] font-black uppercase tracking-widest ml-2 mt-2">Error: {errors.address.message as string}</p>}
          </div>

          {/* City */}
          <div className="space-y-3">
            <label className={labelClass}>06. City *</label>
            <Input {...register('city')} className={inputClass} placeholder="CITY_NODE" />
            {errors.city && <p className="text-rose-500 font-mono text-[9px] font-black uppercase tracking-widest ml-2 mt-2">Error: {errors.city.message as string}</p>}
          </div>

          {/* State */}
          <div className="space-y-3">
            <label className={labelClass}>07. State *</label>
            <select {...register('state')} className="w-full h-14 bg-white/[0.02] border border-dashed border-border/60 rounded-2xl px-6 text-foreground font-mono text-xs uppercase tracking-widest focus:outline-none focus:border-blue-500/40 transition-all cursor-pointer">
              <option value="" className="bg-background">SELECT_STATE</option>
              {['Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Gujarat', 'Karnataka',
                'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab',
                'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
              ].map(state => (
                <option key={state} value={state} className="bg-background">{state.toUpperCase()}</option>
              ))}
            </select>
            {errors.state && <p className="text-rose-500 font-mono text-[9px] font-black uppercase tracking-widest ml-2 mt-2">Error: {errors.state.message as string}</p>}
          </div>

          {/* Pincode */}
          <div className="space-y-3 pb-4">
            <label className={labelClass}>08. Pincode *</label>
            <Input {...register('pincode')} className={inputClass} placeholder="6_DIGITS" maxLength={6} />
            {errors.pincode && <p className="text-rose-500 font-mono text-[9px] font-black uppercase tracking-widest ml-2 mt-2">Error: {errors.pincode.message as string}</p>}
          </div>
        </div>
      </div>

      {/* Action triggers */}
      <div className="flex justify-end pt-4">
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
