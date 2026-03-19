'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import gsap from 'gsap';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { ScholarHubLogo } from '@/components/ui/logo';
import api from '@/app/lib/api';
import { Spotlight } from '@/components/ui/spotlight';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' }
      );
      gsap.fromTo(
        '.form-field',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, delay: 0.2, ease: 'power2.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      await api.post('/auth/forgot-password', data);
      setIsSubmitted(true);
    } catch (error: any) {
      setError('root', {
        message: error.response?.data?.message || 'Something went wrong. Please try again later.'
      });
    }
  };

  return (
    <div ref={containerRef} className="w-full min-h-screen bg-slate-50 dark:bg-black transition-colors duration-500 flex items-center justify-center p-4 relative overflow-x-hidden isolate">
      {/* Spotlight Effect */}
      <div className="absolute inset-0 z-10 w-full h-full pointer-events-none opacity-50 dark:opacity-100 mix-blend-multiply dark:mix-blend-normal">
        <Spotlight className="-top-40 -left-10 md:left-0 md:-top-20 h-[150%] w-[150%] md:w-[200%]" fill="rgba(37, 99, 235, 0.2)" />
      </div>

      {/* Premium Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:linear-gradient(to_bottom,white_40%,transparent_100%)] z-0" />

      <div ref={cardRef} className="relative z-20 w-full max-w-md bg-white/80 dark:bg-black/40 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_50px_-15px_rgba(59,130,246,0.1)] p-8 md:p-10 overflow-hidden">
        
        <div className="flex flex-col items-center mb-8 form-field">
          <ScholarHubLogo className="w-12 h-12 mb-6" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Forgot Password?</h1>
          <p className="text-slate-500 dark:text-slate-400 text-center text-sm">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="form-field">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  id="email"
                  {...register('email')}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm dark:shadow-none"
                />
              </div>
              {errors.email && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.email.message}</p>}
            </div>

            {errors.root && (
              <div className="form-field bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-500 dark:text-red-400 text-sm font-medium">{errors.root.message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3.5 px-4 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-[0_4px_20px_-5px_rgba(37,99,235,0.4)] hover:shadow-[0_8px_25px_-5px_rgba(37,99,235,0.5)] disabled:opacity-70 disabled:cursor-not-allowed form-field"
            >
              {isSubmitting ? 'Sending link...' : 'Send Reset Link'}
            </button>

            <div className="form-field pt-2 text-center">
              <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          </form>
        ) : (
          <div className="text-center py-6 form-field animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Check your email</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              If an account exists for that email, we've sent instructions to reset your password.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-blue-600 dark:text-blue-500 font-medium hover:underline text-sm"
            >
              Didn't receive an email? Try again
            </button>
            <div className="mt-8">
              <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Return to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
