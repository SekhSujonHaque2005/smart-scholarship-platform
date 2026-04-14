'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Type, 
  Hash, 
  Calendar, 
  Upload, 
  CheckCircle2, 
  Settings,
  GripVertical,
  Layers,
  Code
} from 'lucide-react';
import { cn } from '@/lib/utils';

type FieldType = 'TEXT' | 'NUMBER' | 'DATE' | 'FILE' | 'BOOLEAN';

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder: string;
  required: boolean;
}

export const FormBuilder = () => {
  const [fields, setFields] = useState<FormField[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      label: `Candidate ${type === 'TEXT' ? 'Input' : type === 'FILE' ? 'Upload' : 'Parameter'}`,
      placeholder: `ENTER_${type}_DATA...`,
      required: true
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-8 bg-[#0D0D0D]/50 border border-white/5 rounded-[48px] p-8 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Code size={120} />
      </div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2 uppercase">
            <Layers size={20} className="text-indigo-500" />
            Dynamic Form Architect
          </h2>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] mt-1">
            Build custom application input schemas
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
           Status: {fields.length > 0 ? 'ACTIVE_SCHEMA' : 'NULL_SCHEMA'}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {[
          { type: 'TEXT', icon: Type, label: 'Text Field' },
          { type: 'NUMBER', icon: Hash, label: 'Number' },
          { type: 'DATE', icon: Calendar, label: 'Date' },
          { type: 'FILE', icon: Upload, label: 'Attachment' },
          { type: 'BOOLEAN', icon: CheckCircle2, label: 'Toggle' }
        ].map((btn) => (
          <button
            key={btn.type}
            type="button"
            onClick={() => addField(btn.type as FieldType)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 text-zinc-500 hover:text-white transition-all group"
          >
            <btn.icon size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-mono uppercase tracking-widest">{btn.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="popLayout">
        <div className="space-y-4">
          {fields.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center p-12 border border-dashed border-white/5 rounded-[32px] text-zinc-700"
            >
              <Settings size={40} className="mb-4 opacity-50 stroke-[1.5]" />
              <p className="text-[10px] font-mono uppercase tracking-[0.2em]">System Awaiting Schema Configuration</p>
            </motion.div>
          ) : (
            fields.map((field, idx) => (
              <motion.div
                key={field.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-3xl group"
              >
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-zinc-700">
                    <GripVertical size={16} />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-indigo-400">
                    <span className="text-[10px] font-mono font-bold">{idx + 1}</span>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    value={field.label}
                    onChange={(e) => {
                      const newFields = [...fields];
                      newFields[idx].label = e.target.value;
                      setFields(newFields);
                    }}
                    className="bg-black/40 border border-white/5 rounded-xl py-2 px-3 text-[11px] font-mono text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 uppercase tracking-tight"
                    placeholder="FIELD_LABEL..."
                  />
                  <div className="flex items-center justify-between px-3 py-2 bg-black/20 rounded-xl border border-white/5">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{field.type} Protocol</span>
                    <Settings size={14} className="text-zinc-600 hover:text-white transition-colors cursor-pointer" />
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => removeField(field.id)}
                  className="w-10 h-10 rounded-xl bg-rose-500/5 text-rose-500 border border-rose-500/20 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </AnimatePresence>

      {fields.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-6 border-t border-white/5 flex justify-end"
        >
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.2)]">
            COMPILE_SCHEMA <CheckCircle2 size={16} />
          </button>
        </motion.div>
      )}
    </div>
  );
};
