'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, GraduationCap, MapPin, Save, Camera, Wallet,
  Upload, Video, X, Check, Loader2, ChevronDown
} from 'lucide-react';
import { useAuthStore } from '@/app/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/app/lib/api';
import { toast } from 'sonner';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  cgpa: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  incomeLevel: z.string().optional(),
  location: z.string().optional(),
  gender: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [profileData, setProfileData] = useState<any>(null);

  // Profile picture states
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('auth/me');
        setProfileData(data.profile);
        setProfilePicture(data.profilePicture || null);
        reset({
          name: data.profile?.name || user?.name || '',
          cgpa: data.profile?.cgpa?.toString() || '',
          fieldOfStudy: data.profile?.fieldOfStudy || '',
          incomeLevel: data.profile?.incomeLevel || '',
          location: data.profile?.location || '',
          gender: data.profile?.gender || '',
        });
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [reset, user]);

  // ————— Upload avatar file to Cloudinary via `POST /api/documents/avatar` —————
  const uploadAvatarFile = useCallback(async (file: File) => {
    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File exceeds 5MB limit.');
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('documents/avatar', formData);
      setProfilePicture(data.avatarUrl);
      updateUser({ profilePicture: data.avatarUrl });
    } catch (err) {
      console.error('Avatar upload failed', err);
    } finally {
      setUploadingAvatar(false);
    }
  }, []);

  // ————— Camera logic —————
  const startCamera = useCallback(async () => {
    setShowCamera(true);
    setCameraReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access denied', err);
      setShowCamera(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setShowCamera(false);
    setCameraReady(false);
  }, []);

  const takePicture = useCallback(async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')!.drawImage(videoRef.current, 0, 0);
    stopCamera();

    // Convert canvas to a File blob and upload to Cloudinary
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `webcam-${Date.now()}.jpg`, { type: 'image/jpeg' });
      await uploadAvatarFile(file);
    }, 'image/jpeg', 0.9);
  }, [stopCamera, uploadAvatarFile]);

  // ————— Persistent avatar removal —————
  const handleRemoveAvatar = useCallback(async () => {
    try {
      setUploadingAvatar(true);
      await api.put('auth/me/profile', { profilePicture: null });
      setProfilePicture(null);
      updateUser({ profilePicture: undefined }); // undefined or null depending on your User type
      setShowAvatarMenu(false);
      toast.success('Identity entry removed from ledger.');
    } catch (err) {
      console.error('Failed to remove avatar', err);
      toast.error('Failed to purge entry from central node.');
    } finally {
      setUploadingAvatar(false);
    }
  }, [updateUser]);

  // ————— File input handler —————
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadAvatarFile(file);
    e.target.value = '';
  }, [uploadAvatarFile]);

  // ————— Profile save (no image data — Cloudinary URL already stored) —————
  const onSubmit = async (data: ProfileForm) => {
    try {
      setSaving(true);
      setSaveError('');
      await api.put('auth/me/profile', data);
      updateUser({ name: data.name });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      setSaveError(error?.response?.data?.message || 'Failed to update profile');
      console.error('Failed to update profile', error);
    } finally {
      setSaving(false);
    }
  };

  const displayInitial = (profileData?.name?.[0] || user?.email?.[0] || 'S').toUpperCase();

  return (
    <div className="space-y-16 py-8 text-foreground selection:bg-blue-500/30">
      {/* Camera Modal - Premium Design */}
      <AnimatePresence>
        {showCamera && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-md flex items-center justify-center p-6"
            onClick={(e) => e.target === e.currentTarget && stopCamera()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-card border border-dashed border-border/60 rounded-[48px] p-10 w-full max-w-lg shadow-2xl space-y-8"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-foreground font-black text-xl uppercase tracking-widest leading-none font-mono">Capture Node</h3>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Biometric entry initiation</p>
                </div>
                <button onClick={stopCamera} className="w-12 h-12 rounded-2xl bg-white/5 border border-dashed border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:scale-105">
                  <X size={20} />
                </button>
              </div>

              <div className="rounded-[32px] overflow-hidden bg-white/[0.02] border border-dashed border-border/40 aspect-video relative shadow-inner group/camera">
                <video
                  ref={videoRef} autoPlay muted playsInline
                  onCanPlay={() => setCameraReady(true)}
                  className="w-full h-full object-cover grayscale contrast-125 brightness-90 group-hover/camera:grayscale-0 transition-all duration-700"
                />
                {!cameraReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground text-[10px] font-mono font-black uppercase tracking-widest gap-4">
                    <Loader2 size={24} className="animate-spin text-blue-500" />
                    Initializing Lens...
                  </div>
                )}
                {cameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 rounded-full border border-dashed border-white/20" />
                  </div>
                )}
              </div>

              <div className="flex gap-6">
                <Button type="button" onClick={stopCamera}
                  className="flex-1 h-16 bg-white/5 border border-dashed border-border/40 hover:bg-white/10 text-muted-foreground font-mono font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all">
                  Abort
                </Button>
                <Button type="button" onClick={takePicture} disabled={!cameraReady}
                  className="flex-1 h-16 bg-foreground text-background font-mono font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl disabled:opacity-50 hover:scale-[1.02] transition-all">
                  Commit Capture
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header - Vercel Design */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-dashed border-border/60 py-8 -mt-8 -mx-10 px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-sans font-black tracking-tighter text-foreground leading-[0.9]"
            >
              Academic ID
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="flex items-center gap-4 text-muted-foreground font-mono text-[11px] uppercase tracking-widest"
            >
              <span>Identity Console</span>
              <div className="h-px w-8 bg-border/40" />
              <span className="text-blue-500 font-black">Public profile is active</span>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Profile Sidebar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-4 p-10 border border-dashed border-border/60 bg-white/[0.01] rounded-[48px] space-y-10 group"
        >
          <div className="relative flex flex-col items-center">
            {/* Avatar Frame - Vercel Style */}
            <div className="relative w-40 h-40">
              <div className="absolute inset-0 border border-dashed border-blue-500/30 rounded-[40px] animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-3 rounded-[32px] overflow-hidden bg-white/[0.03] border border-border/40 flex items-center justify-center text-5xl font-mono font-black text-foreground shadow-2xl transition-transform duration-500 group-hover:scale-105">
                {uploadingAvatar ? (
                  <Loader2 size={32} className="animate-spin text-blue-500" />
                ) : profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  displayInitial
                )}
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-110 transition-all shadow-xl z-20"
              >
                <Camera size={20} />
              </button>

              {/* Avatar Menu */}
              <AnimatePresence>
                {showAvatarMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute top-full right-0 mt-4 z-30 w-56 bg-card border border-dashed border-border/60 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl"
                  >
                    <button
                      type="button"
                      onClick={() => { fileInputRef.current?.click(); setShowAvatarMenu(false); }}
                      className="flex items-center gap-3 w-full px-6 py-4 text-[10px] font-mono font-black uppercase tracking-widest text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors border-b border-dashed border-border/40"
                    >
                      <Upload size={14} className="text-blue-500" /> Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowAvatarMenu(false); startCamera(); }}
                      className="flex items-center gap-3 w-full px-6 py-4 text-[10px] font-mono font-black uppercase tracking-widest text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors border-b border-dashed border-border/40"
                    >
                      <Video size={14} className="text-emerald-500" /> Open Camera
                    </button>
                    {profilePicture && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        disabled={uploadingAvatar}
                        className="flex items-center gap-3 w-full px-6 py-4 text-[10px] font-mono font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/5 transition-colors disabled:opacity-50"
                      >
                        <X size={14} /> Remove Entry
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            
            
            <div className="mt-8 text-center space-y-2">
              <h3 className="text-2xl font-black tracking-tighter leading-none">{profileData?.name || user?.name}</h3>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em] truncate max-w-full px-4">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-10 border-t border-dashed border-border/60">
            <div className="flex items-center justify-between font-mono">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Global Role</span>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-sm">{user?.role}</span>
            </div>
            <div className="flex items-center justify-between font-mono">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Entry ID</span>
              <span className="text-[9px] text-muted-foreground/60">{String(user?.id).slice(0, 12)}...</span>
            </div>
          </div>
        </motion.div>

        {/* Main Configuration Card */}
        <motion.div
           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
           className="lg:col-span-8 p-12 border border-dashed border-border/60 bg-white/[0.01] rounded-[48px]"
        >
          {loading ? (
             <div className="space-y-8 animate-pulse">
               <div className="h-4 w-48 bg-white/5 rounded-full" />
               <div className="grid grid-cols-2 gap-8">
                 {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-white/5 rounded-2xl" />)}
               </div>
             </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
                  <h4 className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-[0.4em]">Personal Details</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative group/field">
                      <Input {...register('name')}
                        className="h-14 pl-6 bg-white/[0.03] border-dashed border-border/60 rounded-xl text-foreground focus:border-blue-500/40 transition-all font-mono text-xs uppercase tracking-tight"
                        placeholder="ENTER FULL NAME" />
                      {errors.name && <p className="text-rose-500 text-[9px] font-mono mt-2 ml-1 uppercase tracking-widest">{errors.name.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest ml-1">Primary Email</label>
                    <div className="relative">
                      <Input disabled value={user?.email || ''}
                        className="h-14 pl-6 bg-transparent border-dashed border-border/30 rounded-xl text-muted-foreground/40 font-mono text-xs uppercase tracking-tight" />
                    </div>
                  </div>
                </div>
              </section>

              <div className="h-px bg-border/40 border-dashed border-b" />

              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
                  <h4 className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-[0.4em]">Academic Info</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest ml-1">Field of Study</label>
                    <Input {...register('fieldOfStudy')}
                      className="h-14 pl-6 bg-white/[0.03] border-dashed border-border/60 rounded-xl text-foreground focus:border-blue-500/40 font-mono text-xs uppercase"
                      placeholder="e.g. Computer Science" />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest ml-1">Current CGPA</label>
                    <Input {...register('cgpa')} type="number" step="0.01" min="0" max="10"
                      className="h-14 pl-6 bg-white/[0.03] border-dashed border-border/60 rounded-xl text-foreground focus:border-blue-500/40 font-mono text-xs"
                      placeholder="0.00" />
                  </div>
                </div>
              </section>

              <div className="h-px bg-border/40 border-dashed border-b" />

              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.6)]" />
                  <h4 className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-[0.4em]">Economic Details</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest ml-1">Location</label>
                    <Input {...register('location')}
                      className="h-14 pl-6 bg-white/[0.03] border-dashed border-border/60 rounded-xl text-foreground focus:border-blue-500/40 font-mono text-xs uppercase"
                      placeholder="City, Country" />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-mono font-black text-muted-foreground uppercase tracking-widest ml-1">Annual Family Income</label>
                    <div className="relative">
                      <select {...register('incomeLevel')}
                        className="w-full h-14 pl-6 pr-10 bg-white/[0.03] border border-dashed border-border/60 rounded-xl text-foreground focus:border-blue-500/40 outline-none transition-all font-mono text-[10px] uppercase tracking-widest appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-background">NOT SPECIFIED</option>
                        <option value="below_1L" className="bg-background">BELOW ₹1 LAKH</option>
                        <option value="1L_3L" className="bg-background">₹1L — ₹3L</option>
                        <option value="3L_6L" className="bg-background">₹3L — ₹6L</option>
                        <option value="6L_10L" className="bg-background">₹6L — ₹10L</option>
                        <option value="above_10L" className="bg-background">ABOVE ₹10L</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex items-center justify-between pt-8 border-t border-dashed border-border/60">
                <div className="flex items-center gap-4">
                   {saveError && <span className="text-[9px] font-mono font-black text-rose-500 uppercase tracking-widest">ERROR: {saveError}</span>}
                   {saved && <span className="text-[9px] font-mono font-black text-emerald-500 uppercase tracking-widest animate-pulse">PROFILE UPDATED</span>}
                </div>
                <Button
                  type="submit" disabled={saving}
                  className="h-14 px-12 bg-foreground text-background font-mono font-black uppercase tracking-[0.2em] text-[10px] rounded-full hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-50"
                >
                  {saving ? 'SAVING...' : 'SAVE CHANGES →'}
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};
