'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  HardDrive,
  Eye,
  MoreVertical,
  Plus,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/app/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { DocumentViewer } from './DocumentViewer';

const CATEGORIES = [
  { id: 'TRANSCRIPT', label: 'Academic Transcript', icon: FileText },
  { id: 'ID_PROOF', label: 'Identity Proof', icon: ShieldCheck },
  { id: 'INCOME_CERT', label: 'Financial Evidence', icon: HardDrive },
  { id: 'RESUME', label: 'Professional Resume', icon: GraduationCap },
  { id: 'OTHER', label: 'Other Credentials', icon: Upload }
];

export const DocumentVault = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState('TRANSCRIPT');
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get('documents/my');
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      toast.error('Failed to sync document vault');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File exceeds 5MB security limit.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('docType', category);
      formData.append('name', file.name);

      await api.post('documents/upload', formData);

      toast.success('Document encrypted and stored in vault.');
      fetchDocuments();
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Failed to secure document in vault.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently purge this document from the secure ledger?')) return;
    try {
      await api.delete(`documents/${id}`);
      setDocuments(documents.filter(d => d.id !== id));
      toast.success('Document purged successfully.');
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to delete document node.');
    }
  };

  return (
    <div className="space-y-10 selection:bg-indigo-500/30">
      {/* Header & Upload Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
             <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-mono uppercase tracking-[0.2em] font-black">
                Vault Status: Active Sec-Level 4
             </div>
          </div>
          <h2 className="text-5xl font-black text-foreground tracking-tighter uppercase">Document <span className="text-indigo-500">Vault</span></h2>
          <p className="text-[11px] font-mono text-muted-foreground uppercase font-black opacity-60 tracking-tight">Your centralized hub for academic and identity verification protocols.</p>
        </div>

        <div className="flex items-center gap-3 bg-accent/30 p-2 rounded-[32px] border border-border">
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-transparent border-none text-[10px] font-mono font-black uppercase tracking-widest px-4 focus:ring-0 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
          >
            {CATEGORIES.map(cat => <option key={cat.id} value={cat.id} className="bg-background">{cat.label}</option>)}
          </select>
          <div className="w-[1px] h-6 bg-border" />
          <label className="flex items-center gap-2 px-6 py-3 rounded-[24px] bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/20">
             {uploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
             <span>Upload Document</span>
             <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} accept=".pdf,.jpg,.jpeg,.png" />
          </label>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: 'Total Storage', value: `${(documents.reduce((acc, d) => acc + (d.fileSize || 0), 0) / (1024 * 1024)).toFixed(2)} MB`, sub: 'Encrypted Nodes' },
           { label: 'Vault Integrity', value: '100%', sub: 'No anomalous logs' },
           { label: 'Active Links', value: documents.filter(d => d.appId).length, sub: 'Connected to applications' }
         ].map((stat, i) => (
           <div key={i} className="bg-card border border-border rounded-[48px] p-8 space-y-2 shadow-sm border-dashed">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-black opacity-60">{stat.label}</p>
              <div className="text-3xl font-black text-foreground tracking-tighter">{stat.value}</div>
              <p className="text-[9px] font-mono text-indigo-500 uppercase font-black tracking-widest">{stat.sub}</p>
           </div>
         ))}
      </div>

      {/* Documents Grid */}
      <section className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-20">
             <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
             <p className="text-[10px] font-mono uppercase font-black tracking-[0.2em]">Syncing Vault Interface...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border border-dashed border-border rounded-[64px] bg-accent/10">
             <HardDrive size={64} className="text-muted-foreground/20 mb-6" />
             <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Vault is Vacuumed</h3>
             <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-1 opacity-60">Upload your first verification protocol to begin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
            {documents.map((doc) => {
              const CategoryIcon = CATEGORIES.find(c => c.id === doc.docType)?.icon || FileText;
              return (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={doc.id}
                  className="group bg-card border border-border rounded-[48px] p-8 flex items-center justify-between hover:border-indigo-500/30 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[24px] bg-accent border border-border flex items-center justify-center text-muted-foreground group-hover:text-indigo-500 transition-colors">
                      <CategoryIcon size={28} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-foreground tracking-tighter">{doc.name || 'UNNAMED PROTOCOL'}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase font-black opacity-60">
                          {doc.docType.replace('_', ' ')} • {(doc.fileSize / 1024).toFixed(1)} KB
                        </span>
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          doc.appId ? "bg-emerald-500" : "bg-zinc-500 opacity-40"
                        )} />
                        <span className="text-[9px] font-mono text-muted-foreground uppercase font-bold">
                          {doc.appId ? 'Linked to Application' : 'Unlinked Node'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setSelectedDoc(doc)}
                      className="w-12 h-12 rounded-2xl bg-accent border border-border flex items-center justify-center text-muted-foreground hover:text-indigo-500 hover:border-indigo-500/30 transition-all"
                    >
                       <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(doc.id)}
                      className="w-12 h-12 rounded-2xl bg-accent border border-border flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:border-rose-500/30 transition-all"
                    >
                       <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* In-App Document Viewer Modal (Orchestrated AnimatePresence) */}
      <AnimatePresence mode="wait">
        {selectedDoc && (
          <DocumentViewer 
            document={selectedDoc} 
            onClose={() => setSelectedDoc(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};
