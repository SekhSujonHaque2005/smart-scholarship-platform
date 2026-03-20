'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import gsap from 'gsap';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { ScholarHubLogo } from '@/components/ui/logo';
import { useAuthStore } from '@/app/store/auth.store';
import api from '@/app/lib/api';
import { Spotlight } from '@/components/ui/spotlight';

const LOGIN_IMAGES = [
  "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1473&q=80",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
];

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state: any) => state.setAuth);
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated || !!state.accessToken);
  const { data: session } = useSession();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  // GSAP Animation on mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }
      );
      gsap.fromTo(
        '.form-field',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, delay: 0.3, ease: 'power2.out' }
      );

      // Infinite Image Scroll
      if (scrollRef.current) {
        gsap.to(scrollRef.current, {
          xPercent: -50,
          ease: "none",
          duration: 30,
          repeat: -1,
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Sync Google session with our auth store
  useEffect(() => {
    const authSession = session as any;
    if (authSession?.backendToken && !isAuthenticated) {
      setAuth(
        {
          id: authSession.backendId as string,
          email: authSession.user?.email as string,
          role: (authSession.role as 'STUDENT' | 'PROVIDER' | 'ADMIN') || 'STUDENT'
        },
        authSession.backendToken as string,
        authSession.refreshToken as string
      );
      router.push('/dashboard/student');
    }
  }, [session, isAuthenticated, setAuth, router]);

  const [showOTP, setShowOTP] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [emailFor2FA, setEmailFor2FA] = useState('');
  const [otpValue, setOtpValue] = useState('');

  const searchParams = useSearchParams();

  useEffect(() => {
    const is2FA = searchParams.get('2fa');
    const email = searchParams.get('email');
    const token = searchParams.get('tempToken');

    if (is2FA && email && token) {
      setEmailFor2FA(email);
      setTempToken(token);
      setShowOTP(true);
    }
  }, [searchParams]);

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await api.post('auth/login', data);
      
      if (response.data.requires2FA) {
        setTempToken(response.data.tempToken);
        setEmailFor2FA(response.data.email);
        setShowOTP(true);
        return;
      }

      const { user, accessToken, refreshToken } = response.data;
      setAuth(user, accessToken, refreshToken);

      // Redirect based on role
      if (user.role === 'STUDENT') router.push('/dashboard/student');
      else if (user.role === 'PROVIDER') router.push('/dashboard/provider');
      else if (user.role === 'ADMIN') router.push('/dashboard/admin');

    } catch (error: any) {
      setError('root', {
        message: error.response?.data?.message || 'Login failed. Please check your credentials.'
      });
    }
  };

  const onVerifyOTP = async () => {
    try {
      const response = await api.post('auth/verify-2fa', {
        email: emailFor2FA,
        otp: otpValue,
        tempToken
      });

      const { user, accessToken, refreshToken } = response.data;
      setAuth(user, accessToken, refreshToken);

      if (user.role === 'STUDENT') router.push('/dashboard/student');
      else if (user.role === 'PROVIDER') router.push('/dashboard/provider');
      else if (user.role === 'ADMIN') router.push('/dashboard/admin');
    } catch (error: any) {
      setError('root', {
        message: error.response?.data?.message || 'Invalid or expired code.'
      });
    }
  };

  return (
    <div ref={containerRef} className="w-full min-h-full bg-slate-50 dark:bg-black transition-colors duration-500 flex items-center justify-center p-4 relative isolate">
      {/* Spotlight Effect - Top Left Aligned */}
      <div className="absolute inset-0 z-10 w-full h-full pointer-events-none opacity-50 dark:opacity-100 mix-blend-multiply dark:mix-blend-normal">
        <Spotlight className="-top-40 -left-10 md:left-0 md:-top-20 h-[150%] w-[150%] md:w-[200%]" fill="rgba(62, 18, 112, 0.4)" />
      </div>

      {/* Premium Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:linear-gradient(to_bottom,white_40%,transparent_100%)] z-0" />

      <div ref={cardRef} className="relative z-20 flex flex-col md:flex-row w-full max-w-6xl min-h-[700px] bg-white/80 dark:bg-black/40 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_50px_-15px_rgba(59,130,246,0.1)] overflow-hidden">
        {/* Left Panel */}
        <div className="flex-1 relative overflow-hidden md:block hidden border-r border-slate-200 dark:border-white/10">
          <div className="absolute top-6 left-6 z-10">
            <button
              onClick={() => router.push('/')}
              className="w-10 h-10 bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/80 dark:hover:bg-black/60 transition-all cursor-pointer border border-slate-300/50 dark:border-white/10 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-slate-800 dark:text-white" />
            </button>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/50 dark:from-black/80 dark:via-blue-950/40 to-transparent z-[5]"></div>
          <div className="absolute inset-0 overflow-hidden">
            <div ref={scrollRef} className="flex flex-row h-full w-max">
              {[...LOGIN_IMAGES, ...LOGIN_IMAGES].map((src, idx) => (
                <div key={idx} className="h-full w-[40vw] flex-shrink-0">
                  <img
                    src={src}
                    alt={`Knowledge ${idx}`}
                    className="w-full h-full object-cover opacity-80"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-12 left-12 right-12 z-10 text-white">
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">Welcome Back</h2>
            <p className="text-lg text-slate-300/90 leading-relaxed text-balance">Your gateway to opportunities and educational growth. Log in to access your dashboard.</p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          {!showOTP ? (
            <>
              <div className="mb-10 form-field">
                <div className="flex items-center justify-between mb-8">
                  <ScholarHubLogo className="w-10 h-10 md:w-12 md:h-12" />
                  <button type="button" onClick={() => router.push('/')} className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-500 dark:text-slate-300" />
                  </button>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2">Sign In</h1>
                <p className="text-slate-500 dark:text-slate-400">
                  Don't have an account?{' '}
                  <Link href="/register" className="text-blue-600 dark:text-blue-500 hover:text-blue-500 font-medium transition-colors">
                    Create one
                  </Link>
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email Field */}
                <div className="form-field">
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...register('email')}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 md:py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm dark:shadow-none"
                  />
                  {errors.email && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.email.message}</p>}
                </div>

                {/* Password Field */}
                <div className="form-field">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <Link href="/forgot-password" className="text-sm font-medium text-blue-600 dark:text-blue-500 hover:text-blue-500 dark:hover:text-blue-400">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      {...register('password')}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 md:py-4 pr-12 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm dark:shadow-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5 text-slate-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.password.message}</p>}
                </div>

                {/* Root error */}
                {errors.root && (
                  <div className="form-field bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-400 text-sm font-medium">{errors.root.message}</p>
                  </div>
                )}

                {/* Divider */}
                <div className="form-field relative my-4 pt-2 pb-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200 dark:border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white/80 dark:bg-transparent backdrop-blur-3xl px-4 text-slate-500 dark:text-slate-400 tracking-wider">Or continue with</span>
                  </div>
                </div>

                {/* Google Button */}
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 py-3 md:py-4 px-4 rounded-xl font-medium transition-all shadow-sm dark:shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] form-field group"
                  onClick={() => signIn('google', { callbackUrl: '/dashboard/student' })}
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </button>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-3 md:py-4 px-4 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)] hover:shadow-[0_0_25px_-5px_rgba(37,99,235,0.7)] disabled:opacity-70 disabled:cursor-not-allowed form-field mt-6"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col h-full justify-center">
              <div className="mb-10 form-field">
                <button
                  onClick={() => setShowOTP(false)}
                  className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Back to login</span>
                </button>
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Verify it's you</h1>
                <p className="text-slate-500 dark:text-slate-400">
                  We've sent a 6-digit code to <span className="text-slate-900 dark:text-white font-medium">{emailFor2FA}</span>.
                </p>
              </div>

              <div className="space-y-6">
                <div className="form-field">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 transition-all">
                    Verification Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full text-center text-3xl tracking-[1rem] px-4 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {errors.root && (
                  <div className="form-field bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-400 text-sm font-medium">{errors.root.message}</p>
                  </div>
                )}

                <button
                  onClick={onVerifyOTP}
                  disabled={otpValue.length !== 6}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verify & Log In
                </button>

                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                  Didn't receive the code?{' '}
                  <button onClick={() => onSubmit({ email: emailFor2FA, password: '' } as any)} className="text-blue-600 hover:text-blue-500 font-medium">
                    Resend
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}