'use client';

import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Lock, 
  Bell, 
  Database, 
  Globe, 
  Monitor,
  Zap,
  Save,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/app/lib/api';

const Toggle = ({ active, onChange }: { active: boolean, onChange: () => void }) => (
  <button 
    onClick={onChange}
    className={cn("w-12 h-6 rounded-full relative transition-colors duration-300 shrink-0", active ? "bg-blue-600" : "bg-muted")}
  >
    <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300", active ? "right-1" : "left-1")} />
  </button>
);

const SettingGroup = ({ title, children }: any) => (
  <div className="p-8 rounded-[2.5rem] bg-card border border-border/50 shadow-sm space-y-6">
    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground/60">{title}</h3>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

const SettingItem = ({ title, description, control }: any) => (
  <div className="flex items-center justify-between gap-6 pb-6 border-b border-border/30 last:border-0 last:pb-0">
    <div className="space-y-1">
      <h4 className="text-sm font-black text-foreground">{title}</h4>
      <p className="text-xs font-medium text-muted-foreground/80">{description}</p>
    </div>
    {control}
  </div>
);

export default function AdminSettings() {
  const [settings, setSettings] = React.useState({
    strictModeration: true,
    tfaEnforcement: true,
    fraudAutoBlock: false,
    newRegistrationAlerts: true,
    automaticDisbursal: false,
    publicApiAccess: true
  });
  const [isSaving, setIsSaving] = React.useState(false);
  const [isScraping, setIsScraping] = React.useState(false);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('System settings updated successfully.');
    }, 800);
  };

  const handleRunScraper = async () => {
    setIsScraping(true);
    try {
      await api.post('admin/trigger-scraper');
      alert('Scraper triggered successfully. Check logs for output.');
    } catch (err) {
      alert('Failed to trigger scraper.');
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tighter text-foreground">
              System <span className="text-blue-600 dark:text-blue-500">Settings</span>
            </h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Global configuration and security protocols
            </p>
          </div>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 gap-2 shadow-xl shadow-blue-600/20"
          >
            {isSaving ? <CheckCircle2 size={16} className="animate-pulse" /> : <Save size={16} />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <SettingGroup title="Platform Security">
              <SettingItem 
                title="Strict Moderation" 
                description="Require admin approval for all new scholarship listings."
                control={<Toggle active={settings.strictModeration} onChange={() => handleToggle('strictModeration')} />}
              />
              <SettingItem 
                title="2FA Enforcement" 
                description="Force two-factor authentication for all Admin and Provider accounts."
                control={<Toggle active={settings.tfaEnforcement} onChange={() => handleToggle('tfaEnforcement')} />}
              />
              <SettingItem 
                title="Fraud Auto-Block" 
                description="Automatically block applications with an AI fraud score above 90%."
                control={<Toggle active={settings.fraudAutoBlock} onChange={() => handleToggle('fraudAutoBlock')} />}
              />
           </SettingGroup>

           <SettingGroup title="Ecosystem Preferences">
              <SettingItem 
                title="New Registration Alerts" 
                description="Receive notifications for every new provider registration."
                control={<Toggle active={settings.newRegistrationAlerts} onChange={() => handleToggle('newRegistrationAlerts')} />}
              />
              <SettingItem 
                title="Automatic Disbursal" 
                description="Process payments automatically once application is marked as disbursed."
                control={<Toggle active={settings.automaticDisbursal} onChange={() => handleToggle('automaticDisbursal')} />}
              />
              <SettingItem 
                title="Public API Access" 
                description="Enable third-party integrators to access public scholarship data."
                control={<Toggle active={settings.publicApiAccess} onChange={() => handleToggle('publicApiAccess')} />}
              />
           </SettingGroup>

           <SettingGroup title="AI & Intelligence">
              <SettingItem 
                title="Model Version" 
                description="Current active matching model."
                control={<span className="text-[10px] font-black uppercase tracking-widest text-blue-600 px-3 py-1 bg-blue-50 rounded-lg">Qwen2.5-72B</span>}
              />
              <SettingItem 
                title="Inference Priority" 
                description="Optimize for speed (Latency) or Accuracy (Heavy)."
                control={<span className="text-[10px] font-black uppercase tracking-widest text-purple-600 px-3 py-1 bg-purple-50 rounded-lg">Accuracy</span>}
              />
           </SettingGroup>

           <SettingGroup title="Maintenance">
              <SettingItem 
                title="Database Cleanup" 
                description="Last performed: 2 days ago."
                control={<Button onClick={() => alert('Database optimization queued.')} variant="outline" className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest shrink-0">Run Now</Button>}
              />
              <SettingItem 
                title="Clear System Cache" 
                description="Force rebuild of static assets and edge cache."
                control={<Button onClick={() => alert('Cache cleared successfully.')} variant="outline" className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest shrink-0">Clear</Button>}
              />
              <SettingItem 
                title="Run Scholarship Scraper" 
                description="Manually trigger the background Python scraper script."
                control={
                  <Button 
                    onClick={handleRunScraper} 
                    disabled={isScraping}
                    className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                  >
                    {isScraping ? 'Triggering...' : 'Run Scraper'}
                  </Button>
                }
              />
           </SettingGroup>
        </div>

      </div>
    </DashboardLayout>
  );
}
