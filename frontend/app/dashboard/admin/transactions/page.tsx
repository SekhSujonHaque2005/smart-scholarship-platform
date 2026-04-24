'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  IndianRupee, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  Download,
  Building2,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import api from '@/app/lib/api';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data } = await api.get('admin/transactions');
        setTransactions(data);
      } catch (err) {
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const totalDisbursed = transactions
    .filter(tx => tx.type === 'DISBURSEMENT' && tx.status === 'COMPLETED')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalDeposits = transactions
    .filter(tx => tx.type === 'DEPOSIT' && tx.status === 'COMPLETED')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const systemBalance = totalDeposits - totalDisbursed;

  const filteredTransactions = transactions.filter(tx => 
    tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.provider?.orgName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.application?.student?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tighter text-foreground">
              Financial <span className="text-blue-600 dark:text-blue-500">Ledger</span>
            </h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Audit all money movements across the ecosystem
            </p>
          </div>
          <Button className="rounded-2xl bg-foreground text-background hover:bg-foreground/90 font-black uppercase tracking-widest text-[10px] h-12 px-8 gap-2 shadow-xl shadow-foreground/10">
            <Download size={16} /> Export CSV
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="p-8 rounded-[2.5rem] bg-card border border-border/50 shadow-sm space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Total Disbursed</span>
              <div className="flex items-center gap-2">
                 <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                    <IndianRupee size={20} />
                 </div>
                 <h2 className="text-3xl font-black">₹{totalDisbursed.toLocaleString()}</h2>
              </div>
           </div>
           <div className="p-8 rounded-[2.5rem] bg-card border border-border/50 shadow-sm space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Total Deposits</span>
              <div className="flex items-center gap-2">
                 <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                    <ArrowDownLeft size={20} />
                 </div>
                 <h2 className="text-3xl font-black">₹{totalDeposits.toLocaleString()}</h2>
              </div>
           </div>
           <div className="p-8 rounded-[2.5rem] bg-card border border-border/50 shadow-sm space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">System Balance</span>
              <div className="flex items-center gap-2">
                 <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                    <CheckCircle2 size={20} />
                 </div>
                 <h2 className="text-3xl font-black">₹{systemBalance.toLocaleString()}</h2>
              </div>
           </div>
        </div>

        {/* Search and Table */}
        <div className="space-y-6">
           <div className="flex flex-col md:flex-row items-center gap-4 bg-card border border-border/50 rounded-3xl p-3 shadow-sm">
              <div className="relative flex-1 w-full">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                 <Input 
                   placeholder="Search by Transaction ID or entity name..." 
                   className="h-12 pl-12 pr-4 bg-transparent border-none text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-medium"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
              <Button variant="outline" className="h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2 px-6">
                 <Filter size={16} /> Filter
              </Button>
           </div>

           <div className="rounded-[2.5rem] bg-card border border-border/50 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-muted/30 border-b border-border/50">
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reference</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entity</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                       {filteredTransactions.map((tx, idx) => (
                         <motion.tr 
                           key={tx.id}
                           initial={{ opacity: 0, x: -10 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: idx * 0.05 }}
                           className="hover:bg-muted/20 transition-colors"
                         >
                            <td className="px-8 py-6 font-mono text-[10px] font-black text-muted-foreground uppercase">
                               #{tx.id.slice(-8)}
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                                     {tx.type === 'DEPOSIT' ? <Building2 size={16} /> : <User size={16} />}
                                  </div>
                                  <div>
                                     <h4 className="text-sm font-black text-foreground">
                                       {tx.provider?.orgName || tx.application?.student?.name || 'System'}
                                     </h4>
                                     <span className="text-[10px] font-bold text-muted-foreground uppercase">{tx.type}</span>
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <div className={cn(
                                 "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                 tx.type === 'DEPOSIT' ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                               )}>
                                  {tx.type === 'DEPOSIT' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                                  {tx.type}
                               </div>
                            </td>
                            <td className="px-8 py-6 font-black text-sm">
                               ₹{tx.amount.toLocaleString()}
                            </td>
                            <td className="px-8 py-6">
                               <div className={cn(
                                 "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest",
                                 tx.status === 'COMPLETED' ? "text-emerald-500" : "text-amber-500"
                               )}>
                                  {tx.status === 'COMPLETED' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                  {tx.status}
                               </div>
                            </td>
                            <td className="px-8 py-6 text-xs font-bold text-muted-foreground">
                               {new Date(tx.createdAt).toLocaleDateString()}
                            </td>
                         </motion.tr>
                       ))}
                       {filteredTransactions.length === 0 && (
                         <tr>
                            <td colSpan={6} className="px-8 py-20 text-center">
                               <div className="flex flex-col items-center gap-2 opacity-30">
                                  <AlertCircle size={48} strokeWidth={1} />
                                  <span className="text-xs font-black uppercase tracking-widest">No transactions found</span>
                               </div>
                            </td>
                         </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
