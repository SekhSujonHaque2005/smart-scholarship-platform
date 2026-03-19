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

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  cgpa: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  incomeLevel: z.string().optional(),
  location: z.string().optional(),
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
        const { data } = await api.get('/auth/me');
        setProfileData(data.profile);
        setProfilePicture(data.profilePicture || null);
        reset({
          name: data.profile?.name || user?.name || '',
          cgpa: data.profile?.cgpa?.toString() || '',
          fieldOfStudy: data.profile?.fieldOfStudy || '',
          incomeLevel: data.profile?.incomeLevel || '',
          location: data.profile?.location || '',
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
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/documents/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
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
      await api.put('/auth/me/profile', data);
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
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-20">
        <div className="space-y-1">
          <motion.h1
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-5xl font-serif font-black tracking-tighter text-foreground drop-shadow-sm"
          >
            My Profile
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="text-muted-foreground font-medium tracking-wide flex items-center gap-2"
          >
            Manage your academic identity <div className="w-1 h-1 rounded-full bg-border" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-blue-600 dark:text-blue-400/80">Public profile is active</span>
          </motion.div>
        </div>
      </div>

      {/* Camera Modal */}
      <AnimatePresence>
        {showCamera && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && stopCamera()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-[40px] p-8 w-full max-w-md shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-foreground font-black text-lg uppercase tracking-widest">Take a Photo</h3>
                <button onClick={stopCamera} className="w-10 h-10 rounded-2xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-sm">
                  <X size={18} />
                </button>
              </div>

              <div className="rounded-3xl overflow-hidden bg-muted aspect-video relative shadow-inner">
                <video
                  ref={videoRef} autoPlay muted playsInline
                  onCanPlay={() => setCameraReady(true)}
                  className="w-full h-full object-cover"
                />
                {!cameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-[10px] font-black uppercase tracking-widest gap-2">
                    <Loader2 size={18} className="animate-spin" /> Starting camera...
                  </div>
                )}
                {cameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-32 h-32 rounded-full border-2 border-white/30" />
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="button" onClick={stopCamera}
                  className="flex-1 h-12 bg-secondary border border-border hover:bg-muted text-muted-foreground font-black uppercase tracking-widest text-[10px] rounded-2xl">
                  Cancel
                </Button>
                <Button type="button" onClick={takePicture} disabled={!cameraReady}
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg shadow-blue-500/20 disabled:opacity-50">
                  Capture Photo
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Avatar Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-1 group relative rounded-[40px] border border-border bg-card backdrop-blur-3xl p-10 shadow-2xl dark:shadow-none flex flex-col items-center text-center overflow-visible h-fit"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[40px]" />

          {/* Hidden file input */}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

          <div className="relative mb-8">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-[40px] overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-5xl font-black text-white shadow-[0_0_30px_rgba(59,130,246,0.5)] group-hover:scale-105 transition-transform duration-500">
              {uploadingAvatar ? (
                <Loader2 size={32} className="animate-spin text-white" />
              ) : profilePicture ? (
                <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                displayInitial
              )}
            </div>

            {/* Camera toggle button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-blue-500/50 hover:bg-blue-500/10 transition-all shadow-xl z-10"
              >
                <Camera size={18} />
              </button>

              {/* Mini dropdown */}
              <AnimatePresence>
                {showAvatarMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    className="absolute top-10 right-0 z-20 w-48 bg-card border border-border rounded-[20px] shadow-2xl overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => { fileInputRef.current?.click(); setShowAvatarMenu(false); }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    >
                      <Upload size={16} className="text-blue-600 dark:text-blue-400" /> Upload Photo
                    </button>
                    <div className="h-px bg-border mx-3" />
                    <button
                      type="button"
                      onClick={() => { setShowAvatarMenu(false); startCamera(); }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    >
                      <Video size={16} className="text-emerald-600 dark:text-emerald-400" /> Take Photo
                    </button>
                    {profilePicture && (
                      <>
                        <div className="h-px bg-white/5 mx-3" />
                        <button
                          type="button"
                          onClick={() => { setProfilePicture(null); setShowAvatarMenu(false); }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors font-medium"
                        >
                          <X size={16} /> Remove Photo
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <h3 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tight">{profileData?.name || user?.name || 'Scholar'}</h3>
          <p className="text-muted-foreground text-xs font-bold mb-8 line-clamp-1">{user?.email}</p>

          {uploadingAvatar && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mb-4 text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest flex items-center gap-2">
              <Loader2 size={12} className="animate-spin" /> Uploading to cloud...
            </motion.div>
          )}

          <div className="grid grid-cols-2 gap-4 w-full border-t border-border/50 pt-8">
            <div className="space-y-1 text-left">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-black">Role</span>
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 capitalize">{user?.role?.toLowerCase() || 'Student'}</p>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-black">Account ID</span>
              <p className="text-[10px] font-mono font-bold text-muted-foreground truncate w-full">{user?.id || '---'}</p>
            </div>
          </div>
        </motion.div>

        {/* Edit Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 rounded-[40px] border border-border bg-card backdrop-blur-3xl p-10 shadow-2xl dark:shadow-none"
        >
          {loading ? (
            <div className="space-y-8 animate-pulse">
              <div className="h-10 w-40 bg-muted rounded-xl mb-8" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-muted rounded-2xl" />)}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-2">Full Name</label>
                  <div className="relative group/field">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/field:text-blue-600 dark:group-focus-within/field:text-blue-400 transition-colors" size={18} />
                    <Input {...register('name')}
                      className="h-14 pl-12 bg-secondary/50 border-input rounded-2xl text-foreground focus:ring-blue-500/20 transition-all font-bold tracking-tight"
                      placeholder="Your full name" />
                    {errors.name && <p className="text-rose-600 dark:text-rose-400 text-[10px] mt-1 ml-2 font-black uppercase tracking-widest">{errors.name.message}</p>}
                  </div>
                </div>

                {/* Email (read-only) */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
                    <Input disabled value={user?.email || ''}
                      className="h-14 pl-12 bg-muted/30 border-transparent rounded-2xl text-muted-foreground/60 font-bold tracking-tight" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Field of Study */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-2">Field of Study</label>
                  <div className="relative group/field">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/field:text-blue-600 dark:group-focus-within/field:text-blue-400 transition-colors" size={18} />
                    <Input {...register('fieldOfStudy')}
                      className="h-14 pl-12 bg-secondary/50 border-input rounded-2xl text-foreground focus:ring-blue-500/20 font-bold tracking-tight"
                      placeholder="e.g. Computer Science" />
                  </div>
                </div>

                {/* CGPA */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-2">CGPA</label>
                  <div className="relative group/field flex items-center">
                    <span className="absolute left-4 font-black text-muted-foreground group-focus-within/field:text-blue-600 dark:group-focus-within/field:text-blue-400 transition-colors">#</span>
                    <Input {...register('cgpa')} type="number" step="0.01" min="0" max="10"
                      className="h-14 pl-12 bg-secondary/50 border-input rounded-2xl text-foreground focus:ring-blue-500/20 font-bold tracking-tight"
                      placeholder="e.g. 8.5" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Location */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-2">Location (State)</label>
                  <div className="relative group/field">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/field:text-blue-600 dark:group-focus-within/field:text-blue-400 transition-colors" size={18} />
                    <Input {...register('location')}
                      className="h-14 pl-12 bg-secondary/50 border-input rounded-2xl text-foreground focus:ring-blue-500/20 font-bold tracking-tight"
                      placeholder="e.g. West Bengal" />
                  </div>
                </div>

                {/* Income Level */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-2">Annual Family Income</label>
                  <div className="relative group/field">
                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/field:text-blue-600 dark:group-focus-within/field:text-blue-400 transition-colors z-10" size={18} />
                    <select {...register('incomeLevel')}
                      className="w-full h-14 pl-12 pr-4 bg-secondary/50 hover:bg-secondary border border-input rounded-2xl text-foreground focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-black uppercase tracking-widest text-[10px] appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-background text-muted-foreground">Select income range</option>
                      <option value="below_1L" className="bg-background">Below ₹1 Lakh</option>
                      <option value="1L_3L" className="bg-background">₹1L - ₹3L</option>
                      <option value="3L_6L" className="bg-background">₹3L - ₹6L</option>
                      <option value="6L_10L" className="bg-background">₹6L - ₹10L</option>
                      <option value="above_10L" className="bg-background">Above ₹10L</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown size={18} className="text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-border/50">
                {saveError && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-[10px] font-black tracking-widest text-rose-600 dark:text-rose-400 uppercase flex items-center gap-2">
                    <X size={14} /> {saveError}
                  </motion.span>
                )}
                {saved && (
                  <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    className="text-[10px] font-black tracking-widest text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-2">
                    <Check size={14} /> Profile Updated
                  </motion.span>
                )}
                <Button
                  type="submit" disabled={saving}
                  className="h-14 px-10 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl gap-3 shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all border border-blue-500/20"
                >
                  <Save size={18} className={saving ? 'animate-bounce' : ''} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};
