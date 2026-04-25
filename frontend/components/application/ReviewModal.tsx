'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/app/lib/api';
import { Button } from '@/components/ui/button';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
  providerName: string;
  onSuccess?: () => void;
}

export const ReviewModal = ({ 
  isOpen, 
  onClose, 
  providerId, 
  providerName,
  onSuccess 
}: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.post('reviews', {
        providerId,
        rating,
        comment
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
        onClose();
        // Reset state
        setRating(0);
        setComment('');
      }, 2000);
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      setError(err.response?.data?.message || 'Failed to transmit review payload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-card border border-border rounded-[48px] overflow-hidden shadow-2xl"
          >
            {/* Header Decor */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-30" />
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors p-2"
            >
              <X size={20} />
            </button>

            <div className="p-10">
              {success ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-10 text-center space-y-6"
                >
                  <div className="w-20 h-20 rounded-[32px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 size={40} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-foreground tracking-tight leading-none">Review Submitted</h2>
                    <p className="text-xs text-muted-foreground font-medium">Thank you for your feedback.</p>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-4xl font-bold text-foreground tracking-tight">
                      Rate <span className="text-indigo-500">Provider</span>
                    </h2>
                    <p className="text-sm text-muted-foreground font-medium">
                      {providerName}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Star Rating Section */}
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-muted-foreground">Select Rating</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            key={star}
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            className={cn(
                              "transition-all duration-300",
                              (hover || rating) >= star ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "text-muted-foreground/30"
                            )}
                          >
                            <Star 
                              size={32} 
                              fill={(hover || rating) >= star ? "currentColor" : "none"} 
                              strokeWidth={1.5}
                            />
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Comment Section */}
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-muted-foreground">Feedback</label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write your feedback here..."
                        rows={4}
                        className="w-full bg-accent/30 border border-init border-border rounded-3xl py-4 px-6 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-indigo-500/50 transition-all resize-none shadow-sm"
                      />
                    </div>

                    {error && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs font-semibold text-rose-500"
                      >
                        {error}
                      </motion.p>
                    )}

                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={loading || rating === 0}
                        className={cn(
                          "w-full h-14 rounded-3xl font-bold text-sm uppercase tracking-wide transition-all shadow-md",
                          loading || rating === 0
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : "bg-indigo-600 text-white hover:bg-indigo-500"
                        )}
                      >
                        {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Send className="mr-2" size={16} />}
                        {loading ? 'Submitting...' : 'Submit Review'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
            
            {/* Bottom Accent */}
            <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-50" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
