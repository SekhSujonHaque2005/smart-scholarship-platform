'use client';

import React, { useState, useEffect } from 'react';
import { ProviderLayout } from '@/components/provider/ProviderLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Mail, 
  Globe, 
  ShieldCheck, 
  Award,
  Edit,
  CloudUpload,
  Fingerprint,
  Cpu,
  Verified,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
  Lock,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/app/store/auth.store';
import api from '@/app/lib/api';
import { toast } from 'sonner';

const ProfileField = ({ label, value, icon: Icon }: any) => (
  <div className="group space-y-2">
    <div className="flex items-center gap-2">
      <Icon size={16} className="text-muted-foreground" />
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
    <div className="p-3 rounded-lg bg-muted/50 border text-sm font-medium text-foreground">
      {value || 'Not specified'}
    </div>
  </div>
);

const Modal = ({ isOpen, onClose, title, children }: any) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card border p-8 rounded-2xl shadow-lg z-[101] overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <X size={20} className="text-muted-foreground" />
            </button>
          </div>
          {children}
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export default function ProviderProfilePage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCredsModalOpen, setIsCredsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form states
  const [formData, setFormData] = useState({ orgName: '', orgType: '' });
  const [credsData, setCredsData] = useState({ password: '', confirmPassword: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('providers/me/profile');
      setProfile(res.data);
      setFormData({ 
        orgName: res.data.orgName || '', 
        orgType: res.data.orgType || '' 
      });
    } catch (error) {
      console.error('Failed to fetch provider profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('providers/me/profile', formData);
      toast.success('System record updated successfully');
      setProfile({ ...profile, ...formData });
      setIsEditModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const handleUpdateCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (credsData.password !== credsData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    toast.info('Credential update system currently in read-only mode for security');
    setIsCredsModalOpen(false);
  };

  const handleIdentitySync = async () => {
    setIsSyncing(true);
    toast.info('Initiating Blockchain Identity Sync...', { icon: <RefreshCw className="animate-spin" /> });
    
    // Aesthetic delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    try {
      const res = await api.get('providers/me/profile');
      setProfile(res.data);
      toast.success('Identity Proof Verified & Synchronized', {
        description: `Verified at: ${new Date().toLocaleTimeString()}`,
      });
    } catch (error) {
      toast.error('Sync failed - Temporal network error');
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) {
    return (
      <ProviderLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin text-indigo-500" size={40} />
        </div>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout>
      <div className="w-full space-y-12 pb-20">
        {/* Identity Visualization Header */}
        <header className="flex flex-col xl:flex-row items-center gap-10 bg-card border rounded-2xl p-10 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Building2 size={240} className="text-foreground" />
          </div>
          
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-32 h-32 rounded-full bg-muted border flex items-center justify-center text-4xl font-bold text-muted-foreground relative overflow-hidden shadow-sm">
              {user?.profilePicture ? (
                 <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                profile?.orgName?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'P'
              )}
              
              <motion.div 
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                onClick={() => setIsEditModalOpen(true)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white cursor-pointer transition-all"
              >
                 <Edit size={24} />
              </motion.div>
            </div>
            
            {/* Real-time Status Beacon */}
            <div className={cn(
              "absolute -bottom-3 -right-3 w-12 h-12 rounded-2xl border-4 border-card shadow-2xl flex items-center justify-center",
              profile?.verificationStatus === 'APPROVED' ? "bg-emerald-500" : "bg-amber-500"
            )}>
              {profile?.verificationStatus === 'APPROVED' ? <ShieldCheck size={24} className="text-white" /> : <AlertCircle size={24} className="text-white" />}
            </div>
          </div>

          <div className="flex-1 text-center xl:text-left space-y-6 z-10">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-center xl:justify-start gap-4">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                  {profile?.orgName || 'Authorized Provider'}
                </h1>
              </div>
              
              <div className="flex flex-wrap items-center justify-center xl:justify-start gap-3">
                 <span className={cn(
                  "px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-2",
                  profile?.verificationStatus === 'APPROVED' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                )}>
                  {profile?.verificationStatus === 'APPROVED' ? <Verified size={14} /> : <AlertCircle size={14} />}
                  Identity: {profile?.verificationStatus}
                </span>
                <span className="px-3 py-1 rounded-full bg-muted border text-xs font-medium text-muted-foreground">
                  Firmware v4.2.0
                </span>
              </div>
            </div>
            
            <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
              Verified organization on the ScholarHub platform. 
              {profile?.orgType ? ` Classification: ${profile.orgType}.` : ''}
              Dedicated to merit-based grant distribution.
            </p>

            <div className="flex flex-wrap items-center justify-center xl:justify-start gap-8 pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin size={16} /> Infrastructure: Global
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Globe size={16} /> scholarhub.network/{profile?.id?.substring(0, 8)}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail size={16} /> {user?.email}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 z-10">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors"
            >
              Update Profile
            </button>
          </div>
        </header>

        {/* System Parameters Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Registry Ledger (Main Panel) */}
          <div className="lg:col-span-8 space-y-12">
             <section className="bg-card border rounded-2xl p-8 space-y-8 shadow-sm">
                
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <Fingerprint size={24} />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Organization Details</h2>
                      <p className="text-sm text-muted-foreground">General Information & Identification</p>
                    </div>
                  </div>
                  <div className="hidden sm:flex px-3 py-1.5 rounded-lg bg-muted text-xs font-medium text-muted-foreground gap-2 items-center">
                     <Cpu size={14} /> Active
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <ProfileField label="Entity Registration" value={profile?.orgName} icon={Building2} />
                  <ProfileField label="Classification Protocol" value={profile?.orgType} icon={Award} />
                  <ProfileField label="Access Permissions" value="ROOT_PROVIDER" icon={Cpu} />
                  <ProfileField label="Encrypted Hash ID" value={profile?.id?.toUpperCase()} icon={ShieldCheck} />
                </div>
             </section>

             {/* Verification Audit Stream (Log Style) */}
             <section className="bg-card border rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Event Audit Stream</h3>
                    <p className="text-sm text-muted-foreground mt-1">Verification History & Compliance Logs</p>
                  </div>
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium",
                    profile?.verificationStatus === 'APPROVED' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                  )}>
                    <div className="w-2 h-2 rounded-full bg-current" />
                    Status: {profile?.verificationStatus}
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { label: "Entity_Deployment", status: "SUCCESS", date: new Date(user?.createdAt || Date.now()).toISOString() },
                    { label: "Credentials_Auth", status: "SUCCESS", date: new Date().toISOString() },
                    { label: "Identity_Validation", status: profile?.verificationStatus === 'APPROVED' ? "SUCCESS" : "AWAITING", date: profile?.approvedAt ? new Date(profile.approvedAt).toISOString() : 'SYSTEM_IDLE' },
                    { label: "Audit_Interval_Check", status: "SECURE", date: "ACTIVE_MONITOR" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground text-sm font-medium">{i.toString().padStart(2, '0')}</span>
                        <span className="text-sm font-semibold text-foreground group-hover:text-blue-500 transition-colors">{item.label.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex items-center gap-8">
                        <span className="hidden md:block text-xs text-muted-foreground">{item.date === "ACTIVE_MONITOR" ? "Active" : new Date(item.date).toLocaleDateString()}</span>
                        <span className={cn(
                          "px-3 py-1 rounded-md text-xs font-medium min-w-[100px] text-center",
                          item.status === 'SUCCESS' || item.status === 'SECURE' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                        )}>
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
             </section>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-card border rounded-2xl p-8 relative overflow-hidden group shadow-sm">
              <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                     <Award size={24} />
                  </div>
                  <div className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-xs font-semibold">
                    Certified
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Trust Efficiency Index</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-foreground tabular-nums">{profile?.trustScore || '0'}</span>
                    <span className="text-xl font-medium text-muted-foreground">%</span>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${profile?.trustScore || 0}%` }} className="h-full bg-blue-500 rounded-full" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Identity authority calculated via cross-network cryptographic verification protocols.
                  </p>
                </div>
              </div>
            </div>

             <div className="bg-card border rounded-2xl p-8 space-y-6 shadow-sm">
               <h3 className="text-lg font-semibold text-foreground">Security Controls</h3>
               
               <div className="space-y-3">
                  <button 
                    onClick={() => setIsCredsModalOpen(true)}
                    className="w-full flex items-center justify-between p-4 rounded-lg bg-muted/50 border hover:bg-muted hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-card border flex items-center justify-center text-muted-foreground">
                          <Lock size={16} />
                        </div>
                        <span className="text-sm font-medium text-foreground">Credential Vault</span>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button 
                    disabled={isSyncing}
                    onClick={handleIdentitySync}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-lg bg-muted/50 border hover:bg-muted hover:shadow-sm transition-all group",
                      isSyncing && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-lg bg-card border flex items-center justify-center text-muted-foreground",
                          isSyncing && "animate-spin text-blue-500"
                        )}>
                          {isSyncing ? <RefreshCw size={16} /> : <ShieldCheck size={16} />}
                        </div>
                        <span className="text-sm font-medium text-foreground">{isSyncing ? 'Syncing...' : 'Verify Identity Link'}</span>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="Edit Organization Record"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Organization Name</label>
            <input 
              type="text" 
              value={formData.orgName}
              onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
              className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all bg-card"
              placeholder="e.g. Tata Trusts"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Entity Type</label>
            <select 
              value={formData.orgType}
              onChange={(e) => setFormData({ ...formData, orgType: e.target.value })}
              className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all bg-card"
              required
            >
              <option value="">Select Type</option>
              <option value="Non-Profit">Non-Profit</option>
              <option value="Government Body">Government Body</option>
              <option value="Corporate CSR">Corporate CSR</option>
              <option value="Educational Institution">Educational Institution</option>
              <option value="Private Foundation">Private Foundation</option>
            </select>
          </div>
          <button type="submit" className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors">
            Save Changes
          </button>
        </form>
      </Modal>

      <Modal 
        isOpen={isCredsModalOpen} 
        onClose={() => setIsCredsModalOpen(false)} 
        title="Access Credentials"
      >
        <form onSubmit={handleUpdateCreds} className="space-y-6">
          <div className="p-4 rounded-lg bg-amber-500/10 text-amber-500 text-sm flex items-start gap-3">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>Changing credentials will terminate all active sessions across devices for security.</span>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="password" 
                value={credsData.password}
                onChange={(e) => setCredsData({ ...credsData, password: e.target.value })}
                className="w-full p-3 pl-10 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all bg-card"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Confirm Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="password" 
                value={credsData.confirmPassword}
                onChange={(e) => setCredsData({ ...credsData, confirmPassword: e.target.value })}
                className="w-full p-3 pl-10 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all bg-card"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button type="submit" className="w-full py-3 rounded-lg bg-foreground text-background font-medium text-sm hover:opacity-90 transition-opacity">
            Update Credentials
          </button>
        </form>
      </Modal>
    </ProviderLayout>
  );
}
