'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, GraduationCap, MapPin, Save, Camera, Wallet,
  Upload, Video, X, Check, Loader2, ChevronDown, Sparkles
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
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const [aiSuggestionsLoading, setAiSuggestionsLoading] = useState(false);

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
      toast.success('Profile picture removed.');
    } catch (err) {
      console.error('Failed to remove avatar', err);
      toast.error('Failed to remove profile picture.');
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
              className="bg-card border rounded-2xl p-8 w-full max-w-lg shadow-xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-tight text-foreground">Take Photo</h3>
                  <p className="text-sm text-muted-foreground">Capture a new profile picture</p>
                </div>
                <button onClick={stopCamera} className="w-10 h-10 rounded-lg bg-muted/50 border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="rounded-xl overflow-hidden bg-muted/20 border aspect-video relative shadow-inner group/camera">
                <video
                  ref={videoRef} autoPlay muted playsInline
                  onCanPlay={() => setCameraReady(true)}
                  className="w-full h-full object-cover"
                />
                {!cameraReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground text-sm font-medium gap-3">
                    <Loader2 size={24} className="animate-spin text-blue-500" />
                    Initializing Camera...
                  </div>
                )}
                {cameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 rounded-full border-2 border-white/40 shadow-[0_0_0_9999px_rgba(0,0,0,0.3)]" />
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="button" onClick={stopCamera} variant="outline"
                  className="flex-1">
                  Cancel
                </Button>
                <Button type="button" onClick={takePicture} disabled={!cameraReady}
                  className="flex-1">
                  Take Picture
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b py-6 -mt-8 -mx-10 px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <motion.h1
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold tracking-tight text-foreground"
            >
              Profile Settings
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="flex items-center gap-3 text-sm text-muted-foreground"
            >
              <span>Manage your personal and academic details</span>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* AI Profile Coach Card - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-12 p-6 border bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-500/5 dark:to-blue-500/5 rounded-2xl shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white shadow-sm">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">AI Profile Coach</h3>
                <p className="text-xs text-muted-foreground">Get personalized suggestions to improve your scholarship eligibility</p>
              </div>
            </div>

            {!aiSuggestions && (
              <button
                type="button"
                disabled={aiSuggestionsLoading}
                onClick={async () => {
                  setAiSuggestionsLoading(true);
                  try {
                    const fields = ['cgpa', 'fieldOfStudy', 'incomeLevel', 'location', 'gender'];
                    const filled = fields.filter(f => profileData?.[f]);
                    const strength = Math.round((filled.length / fields.length) * 100);
                    const aiUrl = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8000';
                    const res = await fetch(`${aiUrl}/api/generate/profile-suggestions`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },

                      body: JSON.stringify({
                        name: profileData?.name || user?.name || '',
                        cgpa: profileData?.cgpa?.toString() || '',
                        fieldOfStudy: profileData?.fieldOfStudy || '',
                        incomeLevel: profileData?.incomeLevel || '',
                        location: profileData?.location || '',
                        gender: profileData?.gender || '',
                        profileStrength: strength,
                      }),
                    });
                    if (!res.ok) throw new Error((await res.json()).detail || 'Failed');
                    const data = await res.json();
                    setAiSuggestions(data.suggestions);
                  } catch (err: any) {
                    setAiSuggestions(`Error: ${err.message}`);
                  } finally {
                    setAiSuggestionsLoading(false);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 text-white text-xs font-medium hover:from-violet-700 hover:to-blue-700 transition-all disabled:opacity-60 shadow-sm shrink-0"
              >
                {aiSuggestionsLoading ? (
                  <><Loader2 size={14} className="animate-spin" /> Analyzing...</>
                ) : (
                  <><Sparkles size={14} /> Get Suggestions</>
                )}
              </button>
            )}
          </div>

          {aiSuggestions && (
            <div className="mt-4 p-4 bg-card border rounded-lg text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
              {aiSuggestions}
            </div>
          )}
        </motion.div>
        
        {/* Profile Sidebar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-4 p-8 border bg-card rounded-2xl shadow-sm space-y-8 lg:sticky lg:top-32"
        >
          <div className="relative flex flex-col items-center">
            {/* Avatar Frame */}
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full overflow-hidden bg-muted border flex items-center justify-center text-4xl font-semibold text-foreground shadow-sm">
                {uploadingAvatar ? (
                  <Loader2 size={24} className="animate-spin text-blue-500" />
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
                className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-foreground text-background border-2 border-card flex items-center justify-center hover:scale-105 transition-all shadow-sm z-20"
              >
                <Camera size={16} />
              </button>

              {/* Avatar Menu */}
              <AnimatePresence>
                {showAvatarMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute top-full right-0 mt-2 z-30 w-48 bg-popover border rounded-xl shadow-lg overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => { fileInputRef.current?.click(); setShowAvatarMenu(false); }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors border-b"
                    >
                      <Upload size={16} className="text-blue-500" /> Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowAvatarMenu(false); startCamera(); }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors border-b"
                    >
                      <Video size={16} className="text-emerald-500" /> Open Camera
                    </button>
                    {profilePicture && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        disabled={uploadingAvatar}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                      >
                        <X size={16} /> Remove Photo
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
            
            <div className="mt-6 text-center space-y-1">
              <h3 className="text-xl font-bold tracking-tight">{profileData?.name || user?.name}</h3>
              <p className="text-sm text-muted-foreground truncate max-w-[200px] mx-auto">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-6 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Account Type</span>
              <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full capitalize">{user?.role?.toLowerCase() || 'Student'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">User ID</span>
              <span className="text-xs font-mono text-muted-foreground">{String(user?.id).slice(0, 12)}...</span>
            </div>
          </div>
        </motion.div>

        {/* Main Configuration Card */}
        <motion.div
           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
           className="lg:col-span-8 p-8 border bg-card rounded-2xl shadow-sm"
        >
          {loading ? (
             <div className="space-y-8 animate-pulse">
               <div className="h-4 w-48 bg-muted rounded-full" />
               <div className="grid grid-cols-2 gap-8">
                 {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-muted rounded-lg" />)}
               </div>
             </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <section className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <User size={18} className="text-muted-foreground" />
                  <h4 className="text-base font-semibold text-foreground">Personal Details</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Full Name</label>
                    <div className="relative group/field">
                      <Input {...register('name')} placeholder="John Doe" />
                      {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Primary Email</label>
                    <div className="relative">
                      <Input disabled value={user?.email || ''}
                        className="bg-muted text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </section>

              <div className="h-px bg-border" />

              <section className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap size={18} className="text-muted-foreground" />
                  <h4 className="text-base font-semibold text-foreground">Academic Info</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Field of Study</label>
                    <Input {...register('fieldOfStudy')} placeholder="e.g. Computer Science" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Current CGPA</label>
                    <Input {...register('cgpa')} type="number" step="0.01" min="0" max="10" placeholder="0.00" />
                  </div>
                </div>
              </section>

              <div className="h-px bg-border" />

              <section className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet size={18} className="text-muted-foreground" />
                  <h4 className="text-base font-semibold text-foreground">Economic Details</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Location</label>
                    <Input {...register('location')} placeholder="City, Country" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Annual Family Income</label>
                    <div className="relative">
                      <select {...register('incomeLevel')}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
                      >
                        <option value="">Not Specified</option>
                        <option value="below_1L">Below ₹1 Lakh</option>
                        <option value="1L_3L">₹1L — ₹3L</option>
                        <option value="3L_6L">₹3L — ₹6L</option>
                        <option value="6L_10L">₹6L — ₹10L</option>
                        <option value="above_10L">Above ₹10L</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex items-center justify-between pt-6 border-t">
                <div className="flex items-center gap-4">
                   {saveError && <span className="text-sm font-medium text-rose-500">{saveError}</span>}
                   {saved && <span className="text-sm font-medium text-emerald-600">Profile updated successfully!</span>}
                </div>
                <Button
                  type="submit" disabled={saving}
                  className="px-8"
                >
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
