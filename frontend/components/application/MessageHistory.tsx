'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Loader2, 
  ShieldCheck, 
  MessageSquare,
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
      toast.success('Message sent');
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20">
             <MessageSquare size={14} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Messages</h4>
            <p className="text-[10px] text-emerald-600 flex items-center gap-1">
               <ShieldCheck size={9} /> Secure
            </p>
          </div>
        </div>
      </div>

      {/* Message Feed */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-blue-500" size={20} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2 py-8">
             <MessageSquare size={32} className="text-muted-foreground/20" />
             <p className="text-xs text-muted-foreground">
                No messages yet. Start the conversation.
             </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <motion.div 
                  key={msg.id || i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex flex-col max-w-[80%] group",
                    isMe ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                    isMe ? "bg-blue-600 text-white rounded-br-md" : "bg-muted border text-foreground rounded-bl-md"
                  )}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isMe && msg.isRead && <span className="ml-1.5 text-blue-500">✓✓</span>}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t bg-muted/10">
        <div className="flex items-center gap-2">
          <input 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Type a message..."
            className="flex-1 bg-muted/50 border rounded-lg py-2.5 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button 
            type="submit"
            disabled={!content.trim() || sending}
            className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all disabled:opacity-40 shrink-0"
          >
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </form>
    </div>
  );
};
