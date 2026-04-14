'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Loader2, 
  User, 
  ShieldCheck, 
  Lock,
  Clock,
  MessageSquare,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/app/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export const MessageHistory = ({ applicationId, receiverId, currentUserId }: any) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`messages/application/${applicationId}`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 10 seconds as a fallback for WebSockets
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [applicationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;

    try {
      setSending(true);
      const res = await api.post('messages', {
        applicationId,
        receiverId,
        content: content.trim()
      });
      
      setMessages([...messages, res.data.message]);
      setContent('');
      toast.success('Message routed through secure channel');
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Network interference: Failed to deliver memo.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-[32px] overflow-hidden shadow-2xl relative">
      {/* Encryption Header */}
      <div className="p-6 border-b border-border bg-accent/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
             <Lock size={18} />
          </div>
          <div>
            <h4 className="text-[11px] font-mono font-black uppercase tracking-widest text-foreground">Encrypted Channel</h4>
            <p className="text-[9px] font-mono text-emerald-500 uppercase font-bold flex items-center gap-1.5">
               <ShieldCheck size={10} /> end-to-end active
            </p>
          </div>
        </div>
        <div className="flex -space-x-2">
           <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-card flex items-center justify-center text-[10px] font-black text-white shadow-lg">P</div>
           <div className="w-8 h-8 rounded-full bg-accent border-2 border-card flex items-center justify-center text-[10px] font-black text-muted-foreground shadow-lg">C</div>
        </div>
      </div>

      {/* Message Feed */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.03),transparent)]"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full opacity-20">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
             <MessageSquare size={48} className="text-muted-foreground/30" />
             <p className="text-[10px] font-mono uppercase font-black tracking-[0.2em] max-w-[200px]">
                No communications found in decentralized ledger. Start the protocol.
             </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <motion.div 
                  key={msg.id || i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    "flex flex-col max-w-[80%] group",
                    isMe ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <p className="text-[8px] font-mono text-muted-foreground uppercase font-black tracking-widest mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isMe ? 'Internal Node' : 'Candidate Node'} • {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-[12px] font-bold leading-relaxed shadow-sm transition-all",
                    isMe ? "bg-indigo-600 text-white rounded-tr-none hover:bg-indigo-700" : "bg-accent border border-border text-foreground rounded-tl-none hover:border-indigo-500/30"
                  )}>
                    {msg.content}
                  </div>
                  {isMe && msg.isRead && (
                    <div className="mt-1 flex items-center gap-1 text-[8px] font-mono text-emerald-500 uppercase font-black tracking-widest">
                       READ <ShieldCheck size={8} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-6 bg-accent/20 border-t border-border mt-auto">
        <div className="relative group">
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="COMPOSE TRANSMISSION..."
            className="w-full bg-card border border-border rounded-2xl py-4 pl-6 pr-14 text-xs font-bold text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-indigo-500/50 transition-all font-mono resize-none min-h-[56px] max-h-32 shadow-inner"
          />
          <button 
            type="submit"
            disabled={!content.trim() || sending}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-600/30 disabled:opacity-50 disabled:grayscale"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between text-[8px] font-mono text-muted-foreground uppercase tracking-widest font-black opacity-40">
           <span>Shift + Enter for multiline</span>
           <span className="flex items-center gap-1">SECURE PROTOCOL v.4.0 <Lock size={8} /></span>
        </div>
      </form>
    </div>
  );
};
