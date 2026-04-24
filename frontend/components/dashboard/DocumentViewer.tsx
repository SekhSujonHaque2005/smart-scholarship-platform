'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Download, Maximize2, FileText, ImageIcon, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentViewerProps {
  document: {
    id: string;
    name: string;
    fileUrl: string;
    docType: string;
  } | null;
  onClose: () => void;
}

export const DocumentViewer = ({ document, onClose }: DocumentViewerProps) => {
  if (!document) return null;

  const fileUrl = document.fileUrl.replace('http://', 'https://');
  const isPDF = fileUrl.toLowerCase().endsWith('.pdf') || ['TRANSCRIPT', 'RESUME', 'INCOME_CERT'].includes(document.docType);
  const isImage = !isPDF && (fileUrl.match(/\.(jpg|jpeg|png|webp|gif|avif)$/i) || ['ID_PROOF', 'OTHER'].includes(document.docType));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 overflow-hidden"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-2xl" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-6xl h-full max-h-[90vh] bg-card border border-border rounded-[48px] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-accent/30 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
              {isPDF ? <FileText size={20} /> : <ImageIcon size={20} />}
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tighter uppercase leading-none">
                {document.name || 'Secure Document'}
              </h3>
              <p className="text-[10px] font-mono text-muted-foreground uppercase font-black tracking-widest mt-1 opacity-60">
                 Vault Node: {document.id.slice(-8).toUpperCase()} • {document.docType.replace('_', ' ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.open(fileUrl, '_blank')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-accent border border-border text-[10px] font-mono font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-indigo-500/30 transition-all"
              title="Open in new tab"
            >
              <ExternalLink size={14} />
              <span className="hidden md:inline">Redirect</span>
            </button>
            
            <a
              href={fileUrl}
              download={document.name}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-500 text-white text-[10px] font-mono font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20"
            >
              <Download size={14} />
              <span className="hidden md:inline">Download</span>
            </a>

            <div className="w-[1px] h-8 bg-border mx-2 hidden md:block" />

            <button
              onClick={onClose}
              className="w-12 h-12 rounded-2xl bg-accent border border-border flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:border-rose-500/30 transition-all active:scale-95"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-black/20 flex items-center justify-center overflow-auto p-4 md:p-12 selection:bg-indigo-500/30">
          <div className="w-full h-full flex items-center justify-center relative">
            {isPDF ? (
              <div className="w-full h-full rounded-2xl overflow-hidden bg-background border border-border shadow-inner">
                <embed
                  src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  type="application/pdf"
                  className="w-full h-full border-none"
                />
              </div>
            ) : isImage ? (
              <motion.div 
                 className="relative max-w-full max-h-full"
                 layoutId={`image-${document.id}`}
              >
                <img
                  src={fileUrl}
                  alt={document.name}
                  className="max-w-full max-h-[70vh] rounded-2xl shadow-2xl border border-white/10"
                />
                <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_100px_rgba(0,0,0,0.2)] pointer-events-none" />
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4 text-muted-foreground">
                 <div className="w-20 h-20 rounded-full bg-accent border border-border flex items-center justify-center">
                   <FileText size={40} className="opacity-20" />
                 </div>
                 <p className="text-[10px] font-mono uppercase font-black tracking-widest">Format not natively previewable</p>
                 <a 
                   href={fileUrl} 
                   className="text-[10px] font-mono uppercase font-black text-indigo-500 hover:underline tracking-widest"
                 >
                   Download to View Locally
                 </a>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="px-8 py-4 bg-accent/10 border-t border-border flex items-center justify-between">
           <div className="flex items-center gap-6 text-[9px] font-mono text-muted-foreground uppercase font-black tracking-widest">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                 Encrypted Connection
              </div>
              <div>Hash: {document.id.toUpperCase()}</div>
           </div>
           <div className="text-[9px] font-mono text-muted-foreground uppercase font-black opacity-30">
              ScholarHub Secure Ledger v1.0
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
