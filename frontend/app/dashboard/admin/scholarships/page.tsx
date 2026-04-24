'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  Check, 
  X, 
  Eye, 
  AlertCircle, 
  Clock, 
  Globe, 
  Building2,
  Calendar,
  IndianRupee,
  ShieldCheck,
  Search,
  Filter,
  Edit2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/app/lib/api';

export default function ScholarshipModeration() {
  const [activeTab, setActiveTab] = useState('PENDING');
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingScholarship, setEditingScholarship] = useState<any | null>(null);
  const [selectedScholarship, setSelectedScholarship] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchScholarships = async () => {
    try {
      const { data } = await api.get('admin/scholarships');
      setScholarships(data);
    } catch (err) {
      console.error('Error fetching scholarships:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  const handleModerate = async (id: string, status: string) => {
    try {
      await api.patch(`admin/scholarships/${id}/moderate`, { status });
      // Refresh list to show in correct tab
      fetchScholarships();
    } catch (err) {
      console.error('Error moderating scholarship:', err);
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put(`admin/scholarships/${editingScholarship.id}`, editingScholarship);
      setEditingScholarship(null);
      fetchScholarships();
    } catch (err) {
      console.error('Error saving scholarship:', err);
      alert('Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredScholarships = scholarships.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.provider?.orgName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (activeTab === 'PENDING') return s.status === 'PENDING_REVIEW';
    if (activeTab === 'APPROVED') return s.status === 'ACTIVE';
    if (activeTab === 'REJECTED') return s.status === 'DRAFT'; // Rejected ones go back to draft
    return true;
  });

  const pendingCount = scholarships.filter(s => s.status === 'PENDING_REVIEW').length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tighter text-foreground">
              Scholarship <span className="text-blue-600 dark:text-blue-500">Moderation</span>
            </h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Review and approve scholarship programs for the ecosystem
            </p>
          </div>
          
          <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-2xl">
             {['PENDING', 'APPROVED', 'REJECTED'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === tab ? "bg-card text-foreground shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab} 
                  {tab === 'PENDING' && pendingCount > 0 && (
                    <span className="ml-2 w-4 h-4 rounded-full bg-blue-600 text-white inline-flex items-center justify-center text-[8px]">
                      {pendingCount}
                    </span>
                  )}
                </button>
             ))}
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col md:flex-row items-center gap-4">
           <div className="relative flex-1 w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-blue-500" size={18} />
              <input 
                placeholder="Search by title, provider, or keyword..." 
                className="w-full h-14 pl-12 pr-4 bg-card border border-border/50 rounded-[1.25rem] text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all text-sm font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <Button variant="outline" className="h-14 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2">
              <Filter size={16} /> Filters
           </Button>
        </div>

        {/* Moderation Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
           {filteredScholarships.map((s, idx) => (
             <motion.div
               key={s.id}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: idx * 0.05 }}
               className="group p-8 rounded-[2.5rem] bg-card border border-border/50 hover:border-blue-500/30 transition-all duration-500 shadow-sm relative overflow-hidden flex flex-col"
             >
                <div className="absolute top-0 right-0 p-6">
                   <div className={cn(
                     "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                     s.type === 'INTERNAL' ? "bg-blue-500/5 border-blue-500/20 text-blue-600" : "bg-purple-500/5 border-purple-500/20 text-purple-600"
                   )}>
                      {s.type}
                   </div>
                </div>

                <div className="flex-1 space-y-6">
                   <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                         <Building2 size={14} />
                         <span className="text-[10px] font-black uppercase tracking-widest">{s.provider?.orgName || 'External Provider'}</span>
                         <ShieldCheck size={12} className="text-emerald-500" />
                      </div>
                      <h3 className="text-xl font-black tracking-tight group-hover:text-blue-600 transition-colors">{s.title}</h3>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-muted/30 border border-border/20 space-y-1">
                         <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Amount</span>
                         <div className="flex items-center gap-1 text-foreground font-black">
                            <IndianRupee size={14} />
                            <span>{s.amount?.toLocaleString()}</span>
                         </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-muted/30 border border-border/20 space-y-1">
                         <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Deadline</span>
                         <div className="flex items-center gap-1 text-foreground font-black">
                            <Calendar size={14} />
                            <span>{s.deadline ? new Date(s.deadline).toLocaleDateString() : 'N/A'}</span>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground/60">
                      <div className="flex items-center gap-1.5">
                         <Clock size={14} />
                         <span>Submitted {new Date(s.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-border" />
                      <div className="flex items-center gap-1.5">
                         <Globe size={14} />
                         <span>{s.isExternal ? 'Scraped Content' : 'Internal Posting'}</span>
                      </div>
                   </div>
                </div>

                <div className="mt-8 pt-8 border-t border-border/50 flex items-center justify-between gap-4">
                   <div className="flex items-center gap-2">
                     <Button 
                       variant="ghost" 
                       onClick={() => setSelectedScholarship(s)}
                       className="rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 px-4 hover:bg-blue-50 hover:text-blue-600 transition-all"
                     >
                        <Eye size={16} /> Preview
                     </Button>
                     <Button 
                       variant="ghost" 
                       onClick={() => setEditingScholarship({ ...s, deadline: s.deadline ? new Date(s.deadline).toISOString().split('T')[0] : '' })}
                       className="rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 px-4 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                     >
                        <Edit2 size={16} /> Edit
                     </Button>
                   </div>
                   <div className="flex items-center gap-3">
                      <Button 
                        onClick={() => handleModerate(s.id, 'REJECTED')}
                        variant="outline" 
                        className="rounded-xl border-rose-500/20 text-rose-500 hover:bg-rose-50 font-black uppercase tracking-widest text-[10px] gap-2 px-4"
                      >
                         <X size={16} /> Reject
                      </Button>
                      <Button 
                        onClick={() => handleModerate(s.id, 'APPROVED')}
                        className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] gap-2 px-6 shadow-lg shadow-emerald-500/20"
                      >
                         <Check size={16} /> Approve
                      </Button>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>

        {filteredScholarships.length === 0 && (
           <div className="text-center py-24 bg-muted/20 rounded-[3rem] border border-dashed border-border/50">
              <ShieldCheck className="mx-auto text-muted-foreground/20 mb-4" size={64} strokeWidth={1} />
              <h3 className="text-xl font-black text-muted-foreground uppercase tracking-widest">Queue Clear</h3>
              <p className="text-xs font-bold text-muted-foreground/50 mt-2 italic">All scholarships have been moderated.</p>
           </div>
        )}

      </div>

      {/* Edit Scholarship Modal */}
      {editingScholarship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-card border border-border/50 rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
               <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                 <Edit2 size={20} className="text-blue-500" />
                 Edit Scholarship
               </h3>
               <button onClick={() => setEditingScholarship(null)} className="text-muted-foreground hover:text-foreground">
                 <X size={20} />
               </button>
            </div>
            <form onSubmit={handleEditSave} className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Title</label>
                <input required value={editingScholarship.title || ''} onChange={(e) => setEditingScholarship({...editingScholarship, title: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-border/50 bg-background text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Description</label>
                <textarea required rows={4} value={editingScholarship.description || ''} onChange={(e) => setEditingScholarship({...editingScholarship, description: e.target.value})} className="w-full p-4 rounded-xl border border-border/50 bg-background text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Amount (₹)</label>
                  <input type="number" required value={editingScholarship.amount || ''} onChange={(e) => setEditingScholarship({...editingScholarship, amount: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-border/50 bg-background text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Deadline</label>
                  <input type="date" required value={editingScholarship.deadline || ''} onChange={(e) => setEditingScholarship({...editingScholarship, deadline: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-border/50 bg-background text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none" />
                </div>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border/50 mt-6">
                 <Button type="button" variant="ghost" onClick={() => setEditingScholarship(null)} className="rounded-xl">Cancel</Button>
                 <Button type="submit" disabled={isSaving} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 shadow-md shadow-blue-500/20">
                   {isSaving ? 'Saving...' : 'Save Changes'}
                 </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Scholarship Preview Modal */}
      {selectedScholarship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl bg-card border border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col my-8"
          >
            <div className="p-8 border-b border-border/50 flex items-center justify-between bg-muted/20">
               <div className="flex items-center gap-3">
                 <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                   <Eye size={24} />
                 </div>
                 <div>
                   <h2 className="text-xl font-black tracking-tight uppercase">Scholarship Preview</h2>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Admin Document Review System</p>
                 </div>
               </div>
               <button onClick={() => setSelectedScholarship(null)} className="w-10 h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-sm">
                 <X size={20} />
               </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
               {/* Left Column: Core Info */}
               <div className="md:col-span-2 space-y-8">
                  <section className="space-y-3">
                     <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle size={14} /> Basic Information
                     </h3>
                     <div className="p-6 rounded-3xl bg-muted/20 border border-border/50 space-y-4">
                        <h1 className="text-2xl font-black tracking-tight">{selectedScholarship.title}</h1>
                        <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                           {selectedScholarship.description}
                        </p>
                     </div>
                  </section>

                  <section className="space-y-3">
                     <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck size={14} /> Eligibility Criteria
                     </h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-muted/20 border border-border/50">
                           <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Minimum CGPA</p>
                           <p className="text-sm font-black">{selectedScholarship.criteriaJson?.minCgpa || 'No Requirement'}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-muted/20 border border-border/50">
                           <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Target Category</p>
                           <p className="text-sm font-black">{selectedScholarship.category || 'General'}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-muted/20 border border-border/50 sm:col-span-2">
                           <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Allowed Fields</p>
                           <div className="flex flex-wrap gap-2 mt-2">
                              {selectedScholarship.criteriaJson?.allowedFields?.map((f: string) => (
                                 <span key={f} className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-tighter border border-blue-500/20">{f}</span>
                              )) || <span className="text-xs font-bold text-muted-foreground italic">No specific field requirements</span>}
                           </div>
                        </div>
                     </div>
                  </section>
               </div>

               {/* Right Column: Provider & Metadata */}
               <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-card border border-border/50 shadow-sm space-y-4">
                     <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Provider Trust Info</h3>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted border border-border/50 flex items-center justify-center text-muted-foreground">
                           <Building2 size={20} />
                        </div>
                        <div>
                           <p className="text-sm font-black truncate max-w-[150px]">{selectedScholarship.provider?.orgName || 'External Scraper'}</p>
                           <p className="text-[8px] font-bold text-muted-foreground uppercase">{selectedScholarship.provider?.orgType || 'Government Entity'}</p>
                        </div>
                     </div>
                     <div className="pt-4 border-t border-border/50">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-[10px] font-bold text-muted-foreground uppercase">Trust Score</span>
                           <span className="text-xs font-black text-emerald-600">{selectedScholarship.provider?.trustScore || 100}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                           <div 
                              className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                              style={{ width: `${selectedScholarship.provider?.trustScore || 100}%` }} 
                           />
                        </div>
                     </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-card border border-border/50 shadow-sm space-y-4">
                     <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Financial Details</h3>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <span className="text-xs font-bold">Total Grant</span>
                           <span className="text-lg font-black text-blue-600">₹{selectedScholarship.amount?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                           <span className="text-xs font-bold">Deadline</span>
                           <span className="text-xs font-bold">{selectedScholarship.deadline ? new Date(selectedScholarship.deadline).toLocaleDateString() : 'N/A'}</span>
                        </div>
                     </div>
                  </div>

                  <div className="pt-6 space-y-3">
                     <Button 
                        onClick={() => { handleModerate(selectedScholarship.id, 'APPROVED'); setSelectedScholarship(null); }}
                        className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20"
                     >
                        Approve Program
                     </Button>
                     <Button 
                        onClick={() => { handleModerate(selectedScholarship.id, 'REJECTED'); setSelectedScholarship(null); }}
                        variant="outline"
                        className="w-full h-12 rounded-xl border-rose-500/20 text-rose-500 hover:bg-rose-50 font-black uppercase tracking-widest text-[10px]"
                     >
                        Reject Program
                     </Button>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
