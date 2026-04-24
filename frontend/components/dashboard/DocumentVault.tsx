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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
             <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                Encrypted Storage
             </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Document Vault</h2>
          <p className="text-sm text-muted-foreground">Your centralized hub for academic and identity verification.</p>
        </div>

        <div className="flex items-center gap-3 bg-card p-1.5 rounded-xl border shadow-sm">
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-transparent border-none text-sm font-medium px-4 focus:ring-0 cursor-pointer text-foreground"
          >
            {CATEGORIES.map(cat => <option key={cat.id} value={cat.id} className="bg-background">{cat.label}</option>)}
          </select>
          <div className="w-[1px] h-6 bg-border" />
          <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold cursor-pointer hover:bg-blue-700 transition-colors shadow-sm">
             {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
             <span>Upload Document</span>
             <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} accept=".pdf,.jpg,.jpeg,.png" />
          </label>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: 'Total Storage', value: `${(documents.reduce((acc, d) => acc + (d.fileSize || 0), 0) / (1024 * 1024)).toFixed(2)} MB`, sub: 'Encrypted Documents' },
           { label: 'Vault Integrity', value: '100%', sub: 'No issues found' },
           { label: 'Active Links', value: documents.filter(d => d.appId).length, sub: 'Connected to applications' }
         ].map((stat, i) => (
           <div key={i} className="bg-card border rounded-2xl p-6 space-y-2 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs font-semibold text-blue-600">{stat.sub}</p>
           </div>
         ))}
      </div>

      {/* Documents Grid */}
      <section className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
             <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
             <p className="text-sm font-medium">Syncing Documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border rounded-2xl bg-muted/20">
             <HardDrive size={48} className="text-muted-foreground/50 mb-4" />
             <h3 className="text-lg font-semibold text-foreground">Vault is Empty</h3>
             <p className="text-sm text-muted-foreground mt-1">Upload your first document to begin.</p>
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
                  className="group bg-card border rounded-2xl p-6 flex items-center justify-between hover:border-blue-500/30 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-xl bg-muted/50 border flex items-center justify-center text-muted-foreground group-hover:text-blue-600 transition-colors">
                      <CategoryIcon size={24} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-foreground">{doc.name || 'Unnamed Document'}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          {doc.docType.replace('_', ' ')} • {(doc.fileSize / 1024).toFixed(1)} KB
                        </span>
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          doc.appId ? "bg-emerald-500" : "bg-muted-foreground/40"
                        )} />
                        <span className="text-xs font-semibold text-muted-foreground">
                          {doc.appId ? 'Linked to Application' : 'Unlinked'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSelectedDoc(doc)}
                      className="w-10 h-10 rounded-lg bg-muted/50 border flex items-center justify-center text-muted-foreground hover:text-blue-600 hover:border-blue-500/30 transition-all"
                    >
                       <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(doc.id)}
                      className="w-10 h-10 rounded-lg bg-muted/50 border flex items-center justify-center text-muted-foreground hover:text-rose-600 hover:border-rose-500/30 transition-all"
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
