'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  Zap, 
  ShieldAlert, 
  Activity, 
  Target, 
  Cpu, 
  BrainCircuit,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/app/lib/api';

const InsightCard = ({ title, value, icon: Icon, description, status }: any) => (
  <div className="p-8 rounded-[2.5rem] bg-card border border-border/50 shadow-sm space-y-6 relative overflow-hidden group">
    <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-blue-500 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity" />
    <div className="flex items-center justify-between relative z-10">
      <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600">
        <Icon size={24} />
      </div>
      <div className={cn(
        "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
        status === 'HEALTHY' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
      )}>
        {status}
      </div>
    </div>
    <div className="space-y-1 relative z-10">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{title}</h3>
      <div className="text-4xl font-black tracking-tighter">{value}</div>
    </div>
    <p className="text-xs font-bold text-muted-foreground/80 leading-relaxed relative z-10">
      {description}
    </p>
  </div>
);

export default function AIInsights() {
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alertsRes, statsRes] = await Promise.all([
          api.get('admin/fraud'),
          api.get('admin/stats')
        ]);
        setFraudAlerts(alertsRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error('Error fetching AI insights:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
               <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white text-[8px] font-black uppercase tracking-tighter">AI Pulse</span>
               <div className="w-1 h-1 rounded-full bg-border" />
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Model Oversight & Performance</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground leading-none">
              Intelligence <span className="text-purple-600 dark:text-purple-500">Insights</span>
            </h1>
          </div>
          <Button className="rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-widest text-[10px] h-12 px-6 gap-2 shadow-xl shadow-purple-600/20">
            <BrainCircuit size={16} /> Re-train Models
          </Button>
        </div>

        {/* Global Intelligence Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <InsightCard 
             title="Matching Engine" 
             value="94.2%" 
             icon={Target} 
             description="Confidence score for AI matching across 10k+ daily interactions." 
             status="HEALTHY"
           />
           <InsightCard 
             title="Fraud Prevention" 
             value="12" 
             icon={ShieldAlert} 
             description="Critical threats intercepted by the AI fraud detection service today." 
             status="WARNING"
           />
           <InsightCard 
             title="System Latency" 
             value="142ms" 
             icon={Activity} 
             description="Average inference time for real-time scholarship recommendations." 
             status="HEALTHY"
           />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Fraud Monitoring Table */}
           <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-card border border-border/50 shadow-sm flex flex-col gap-8">
              <div className="flex items-center justify-between">
                 <div className="space-y-1">
                    <h3 className="text-xl font-black tracking-tight">Fraud Monitoring</h3>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Real-time threat detection stream</p>
                 </div>
                 <Button variant="ghost" className="text-rose-500 font-black text-[10px] uppercase tracking-widest">View All Incidents</Button>
              </div>

              <div className="space-y-4">
                 {fraudAlerts.map((alert) => (
                   <motion.div 
                     key={alert.id}
                     whileHover={{ x: 5 }}
                     className="flex items-center gap-6 p-6 rounded-3xl bg-muted/20 border border-transparent hover:border-border/50 transition-all cursor-pointer"
                   >
                      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex flex-col items-center justify-center shrink-0 border border-rose-500/10">
                         <span className="text-sm font-black">{Math.round(alert.fraudScore)}%</span>
                         <span className="text-[6px] font-black uppercase opacity-60">Risk</span>
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black truncate">{alert.application?.student?.name || 'Unknown Student'}</h4>
                            <div className="w-1 h-1 rounded-full bg-border" />
                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Threat Detected</span>
                         </div>
                         <p className="text-xs font-bold text-muted-foreground/80 mt-1">
                           Applying for: {alert.application?.scholarship?.title || 'Unknown Scholarship'}
                         </p>
                      </div>
                      <div className="text-right shrink-0">
                         <p className="text-[10px] font-black uppercase text-muted-foreground">{new Date(alert.flaggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                         <Button variant="outline" className="mt-2 h-8 rounded-lg text-[8px] font-black uppercase tracking-widest border-rose-500/20 text-rose-500 hover:bg-rose-50">Investigate</Button>
                      </div>
                   </motion.div>
                 ))}
                 {fraudAlerts.length === 0 && (
                   <div className="text-center py-10 text-muted-foreground text-xs font-bold uppercase tracking-widest italic opacity-50">
                     No active threats detected.
                   </div>
                 )}
              </div>
           </div>

           {/* AI Performance Stats */}
           <div className="space-y-6">
              <div className="p-8 rounded-[2.5rem] bg-card border border-border/50 shadow-sm space-y-8">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Model Utilization</h3>
                 <div className="space-y-6">
                    {[
                      { label: 'Matching (Qwen2.5)', value: 85, color: 'bg-blue-500' },
                      { label: 'Fraud (XGBoost/CV)', value: 62, color: 'bg-rose-500' },
                      { label: 'Summarization (Llama)', value: 45, color: 'bg-purple-500' },
                      { label: 'Extraction (Tesseract)', value: 38, color: 'bg-amber-500' },
                    ].map(model => (
                      <div key={model.label} className="space-y-3">
                         <div className="flex items-center justify-between text-xs font-black">
                            <span className="flex items-center gap-2">
                               <Cpu size={14} className="text-muted-foreground" /> {model.label}
                            </span>
                            <span>{model.value}%</span>
                         </div>
                         <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${model.value}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                              className={cn("h-full rounded-full", model.color)} 
                            />
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="p-8 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-4">
                 <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle size={20} />
                    <span className="text-sm font-black uppercase tracking-widest">Model Status</span>
                 </div>
                 <p className="text-xs font-bold text-emerald-800/80 leading-relaxed">
                   All AI services are currently operational with nominal latency. Automated re-training scheduled in 4 days.
                 </p>
                 <div className="flex items-center gap-4 mt-2">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Uptime</span>
                       <span className="text-lg font-black text-emerald-700">99.98%</span>
                    </div>
                    <div className="flex flex-col border-l border-emerald-500/20 pl-4">
                       <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Incidents</span>
                       <span className="text-lg font-black text-emerald-700">0</span>
                    </div>
                 </div>
              </div>
           </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
