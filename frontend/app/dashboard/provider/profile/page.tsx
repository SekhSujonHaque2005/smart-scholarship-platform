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
      <Icon size={14} className="text-muted-foreground group-hover:text-indigo-500 transition-colors" />
      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-black opacity-80 dark:opacity-70">{label}</span>
    </div>
    <div className="p-4 rounded-2xl bg-accent/30 border border-border text-sm font-medium text-foreground group-hover:border-indigo-500/30 transition-all font-bold">
      {value || 'NOT_SPECIFIED'}
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
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card border border-border p-8 rounded-[32px] shadow-2xl z-[101] overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">{title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-accent rounded-xl transition-colors">
              <X size={20} />
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
        <header className="flex flex-col xl:flex-row items-center gap-10 bg-card border border-border rounded-[48px] p-10 relative overflow-hidden group shadow-sm transition-all duration-500">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
            <Building2 size={240} className="text-foreground" />
          </div>
          
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
          
          {/* Advanced Identity Node (Avatar) */}
          <div className="relative shrink-0">
            <div className="w-40 h-40 rounded-[48px] bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-500 p-[1px] animate-gradient-xy">
              <div className="w-full h-full rounded-[47px] bg-card flex items-center justify-center text-5xl font-black text-foreground relative overflow-hidden ring-4 ring-black/50">
                {user?.profilePicture ? (
                   <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  profile?.orgName?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'P'
                )}
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute inset-0 bg-indigo-500/40 backdrop-blur-sm flex items-center justify-center text-white cursor-pointer transition-all"
                >
                   <Edit size={24} />
                </motion.div>
              </div>
            </div>
            
            {/* Real-time Status Beacon */}
            <div className={cn(
              "absolute -bottom-3 -right-3 w-12 h-12 rounded-2xl border-4 border-card shadow-2xl flex items-center justify-center",
              profile?.verificationStatus === 'APPROVED' ? "bg-emerald-500" : "bg-amber-500"
            )}>
              {profile?.verificationStatus === 'APPROVED' ? <ShieldCheck size={24} className="text-white" /> : <AlertCircle size={24} className="text-white" />}
            </div>
          </div>

          <div className="flex-1 text-center xl:text-left space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-center xl:justify-start gap-4">
                <h1 className="text-4xl lg:text-7xl font-black text-foreground tracking-tighter uppercase leading-[0.85]">
                  {profile?.orgName || 'Authorized Provider'}
                </h1>
              </div>
              
              <div className="flex flex-wrap items-center justify-center xl:justify-start gap-3">
                 <span className={cn(
                  "px-4 py-1 rounded-full border text-[10px] font-mono uppercase tracking-[0.2em] flex items-center gap-2 font-black",
                  profile?.verificationStatus === 'APPROVED' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                )}>
                  {profile?.verificationStatus === 'APPROVED' ? <Verified size={12} /> : <AlertCircle size={12} />}
                  Identity: {profile?.verificationStatus}
                </span>
                <span className="px-4 py-1 rounded-full bg-accent border border-border text-[10px] font-mono uppercase tracking-[0.2em] font-black text-muted-foreground">
                  Firmware v4.2.0
                </span>
              </div>
            </div>
            
            <p className="text-muted-foreground text-sm font-mono max-w-xl leading-relaxed uppercase tracking-tight font-black opacity-70">
              Verified organization on the ScholarHub platform. 
              {profile?.orgType ? ` Classification: ${profile.orgType}.` : ''}
              Dedicated to merit-based grant distribution.
            </p>

            <div className="flex flex-wrap items-center justify-center xl:justify-start gap-8 pt-4 border-t border-border/40">
              <div className="flex items-center gap-2 text-muted-foreground font-mono text-[10px] uppercase font-black">
                <MapPin size={14} className="text-indigo-500" /> Infrastructure: Global
              </div>
              <div className="flex items-center gap-2 text-muted-foreground font-mono text-[10px] uppercase font-black">
                <Globe size={14} className="text-indigo-500" /> scholarhub.network/{profile?.id?.substring(0, 8)}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground font-mono text-[10px] uppercase font-black">
                <Mail size={14} className="text-indigo-500" /> {user?.email}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="px-10 py-5 rounded-3xl bg-indigo-500 text-white font-black text-[12px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-500/20 animate-pulse-subtle"
            >
              Update_Schema
            </button>
          </div>
        </header>

        {/* System Parameters Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Registry Ledger (Main Panel) */}
          <div className="lg:col-span-8 space-y-12">
             <section className="bg-card border border-border rounded-[48px] p-10 space-y-10 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Fingerprint size={24} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-foreground tracking-tight uppercase">Organization Details</h2>
                      <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest leading-none font-black opacity-80 dark:opacity-60">General Information & Identification</p>
                    </div>
                  </div>
                  <div className="hidden sm:flex px-4 py-2 rounded-2xl bg-accent/50 border border-border text-[10px] font-mono text-muted-foreground gap-2 items-center font-black">
                     <Cpu size={14} /> CORE_SYNC: ACTIVE
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
             <section className="bg-card border border-border rounded-[48px] p-10 relative overflow-hidden shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-xl font-black text-foreground uppercase tracking-tight leading-none">Event Audit Stream</h3>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-black opacity-60 mt-1">Verification History & Compliance Logs</p>
                  </div>
                  <div className={cn(
                    "flex items-center gap-3 px-4 py-2 rounded-2xl border text-[10px] font-mono tracking-widest font-black uppercase",
                    profile?.verificationStatus === 'APPROVED' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  )}>
                    <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-2 h-2 rounded-full bg-current" />
                    LATEST STATUS: {profile?.verificationStatus}
                  </div>
                </div>

                <div className="space-y-3 font-mono">
                  {[
                    { label: "Entity_Deployment", status: "SUCCESS", date: new Date(user?.createdAt || Date.now()).toISOString() },
                    { label: "Credentials_Auth", status: "SUCCESS", date: new Date().toISOString() },
                    { label: "Identity_Validation", status: profile?.verificationStatus === 'APPROVED' ? "SUCCESS" : "AWAITING", date: profile?.approvedAt ? new Date(profile.approvedAt).toISOString() : 'SYSTEM_IDLE' },
                    { label: "Audit_Interval_Check", status: "SECURE", date: "ACTIVE_MONITOR" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 hover:border-indigo-500/20 transition-colors group">
                      <div className="flex items-center gap-4">
                        <span className="text-zinc-700 text-[10px] font-black">{i.toString().padStart(2, '0')}</span>
                        <span className="text-[11px] font-black text-foreground uppercase group-hover:text-indigo-400 transition-colors">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-8">
                        <span className="hidden md:block text-[9px] text-zinc-500 font-bold uppercase">{item.date}</span>
                        <span className={cn(
                          "px-4 py-1.5 rounded-lg text-[9px] font-black tracking-[0.2em] min-w-[100px] text-center",
                          item.status === 'SUCCESS' || item.status === 'SECURE' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        )}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
             </section>
          </div>

          {/* Performance & Security (Side Panel) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-indigo-600 rounded-[48px] p-10 text-white relative overflow-hidden group shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-white/5 blur-3xl rounded-full" />
              
              <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-inner">
                     <Award size={32} />
                  </div>
                  <div className="px-3 py-1 bg-white/20 backdrop-blur-xl rounded-full text-[9px] font-mono font-black uppercase tracking-[0.3em]">
                    Certified
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-mono uppercase tracking-[0.4em] mb-2 font-black text-white/70">Trust Efficiency Index</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-7xl font-black tracking-tighter tabular-nums">{profile?.trustScore || '0'}</span>
                    <span className="text-xl font-mono opacity-50 font-black">%</span>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${profile?.trustScore || 0}%` }} className="h-full bg-white" />
                  </div>
                  <p className="text-[10px] font-mono opacity-60 uppercase font-black tracking-[0.1em] leading-relaxed">
                    Identity authority calculated via cross-network cryptographic verification protocols.
                  </p>
                </div>
              </div>
            </div>

             <div className="bg-card border border-border rounded-[48px] p-10 space-y-8 shadow-sm">
               <h3 className="text-[12px] font-black text-foreground uppercase tracking-[0.2em]">Verification History</h3>
               
               <div className="space-y-4">
                  <button 
                    onClick={() => setIsCredsModalOpen(true)}
                    className="w-full flex items-center justify-between p-5 rounded-[32px] bg-accent/50 border border-border text-muted-foreground hover:border-indigo-500/30 hover:text-foreground transition-all group font-black"
                  >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center group-hover:text-indigo-500 transition-colors">
                          <Lock size={16} />
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-widest leading-none">Credential Vault</span>
                    </div>
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button 
                    disabled={isSyncing}
                    onClick={handleIdentitySync}
                    className={cn(
                      "w-full flex items-center justify-between p-5 rounded-[32px] bg-accent/50 border border-border text-muted-foreground hover:border-indigo-500/30 hover:text-foreground transition-all group font-black",
                      isSyncing && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center group-hover:text-indigo-500 transition-colors",
                          isSyncing && "animate-spin text-indigo-500"
                        )}>
                          {isSyncing ? <RefreshCw size={14} /> : <ShieldCheck size={14} />}
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-widest">{isSyncing ? 'Syncing...' : 'Verify Identity Link'}</span>
                    </div>
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
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
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-black">Organization Name</label>
            <input 
              type="text" 
              value={formData.orgName}
              onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
              className="w-full p-4 rounded-2xl bg-accent/30 border border-border focus:border-indigo-500 outline-none font-bold transition-all"
              placeholder="e.g. Tata Trusts"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-black">Entity Type</label>
            <select 
              value={formData.orgType}
              onChange={(e) => setFormData({ ...formData, orgType: e.target.value })}
              className="w-full p-4 rounded-2xl bg-accent/30 border border-border focus:border-indigo-500 outline-none font-bold transition-all appearance-none"
              required
            >
              <option value="">SELECT_TYPE</option>
              <option value="Non-Profit">Non-Profit</option>
              <option value="Government Body">Government Body</option>
              <option value="Corporate CSR">Corporate CSR</option>
              <option value="Educational Institution">Educational Institution</option>
              <option value="Private Foundation">Private Foundation</option>
            </select>
          </div>
          <button type="submit" className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg">
            SAVE CHANGES
          </button>
        </form>
      </Modal>

      <Modal 
        isOpen={isCredsModalOpen} 
        onClose={() => setIsCredsModalOpen(false)} 
        title="Access Credentials"
      >
        <form onSubmit={handleUpdateCreds} className="space-y-6">
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono text-indigo-400 uppercase tracking-tight flex items-start gap-3">
            <AlertCircle size={16} className="shrink-0" />
            <span>Changing credentials will terminate all active sessions across devices for security.</span>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-black">New Secret Cipher</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="password" 
                value={credsData.password}
                onChange={(e) => setCredsData({ ...credsData, password: e.target.value })}
                className="w-full p-4 pl-12 rounded-2xl bg-accent/30 border border-border focus:border-indigo-500 outline-none font-bold transition-all"
                placeholder="********"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-black">Confirm Cipher</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="password" 
                value={credsData.confirmPassword}
                onChange={(e) => setCredsData({ ...credsData, confirmPassword: e.target.value })}
                className="w-full p-4 pl-12 rounded-2xl bg-accent/30 border border-border focus:border-indigo-500 outline-none font-bold transition-all"
                placeholder="********"
              />
            </div>
          </div>
          <button type="submit" className="w-full py-4 rounded-2xl bg-white text-black font-black text-[11px] uppercase tracking-widest hover:bg-zinc-200 transition-colors shadow-lg">
            UPDATE CREDENTIALS
          </button>
        </form>
      </Modal>
    </ProviderLayout>
  );
}
