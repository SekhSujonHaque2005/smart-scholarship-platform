'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import gsap from 'gsap';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
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
  const { setAuth } = useAuthStore();
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

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await api.post('/auth/login', data);
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

  return (
    <div ref={containerRef} className="w-full min-h-screen bg-black flex items-center justify-center p-4 relative overflow-x-hidden isolate">
      {/* Spotlight Effect - Top Left Aligned */}
      <div className="absolute inset-0 z-10 w-full h-full pointer-events-none">
        <Spotlight className="-top-40 -left-10 md:left-0 md:-top-20 h-[150%] w-[150%] md:w-[200%]" fill="rgba(62, 18, 112, 0.4)" />
      </div>

      {/* Premium Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:linear-gradient(to_bottom,white_40%,transparent_100%)] z-0" />

      <div ref={cardRef} className="relative z-20 flex flex-col md:flex-row w-full max-w-6xl min-h-[700px] bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_0_50px_-15px_rgba(59,130,246,0.1)] overflow-hidden">
        {/* Left Panel */}
        <div className="flex-1 relative overflow-hidden md:block hidden border-r border-white/10">
          <div className="absolute top-6 left-6 z-10">
            <button
              onClick={() => router.push('/')}
              className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/60 transition-all cursor-pointer border border-white/10"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-blue-950/40 to-transparent z-[5]"></div>
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
        <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center overflow-y-auto">
          <div className="mb-10 form-field">
            <div className="flex items-center gap-2 mb-6 md:hidden">
              <button type="button" onClick={() => router.push('/')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-300" />
              </button>
              <span className="font-semibold text-white">Back to home</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Sign In</h1>
            <p className="text-slate-400">
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-500 hover:text-blue-400 font-medium transition-colors">
                Create one
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="form-field">
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                {...register('email')}
                placeholder="you@example.com"
                className="w-full px-4 py-3 md:py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder:text-slate-500"
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div className="form-field">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <button type="button" className="text-sm font-medium text-blue-500 hover:text-blue-400">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  {...register('password')}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 md:py-4 pr-12 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-slate-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>}
            </div>

            {/* Root error */}
            {errors.root && (
              <div className="form-field bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400 text-sm font-medium">{errors.root.message}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 md:py-4 px-4 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)] hover:shadow-[0_0_25px_-5px_rgba(37,99,235,0.7)] disabled:opacity-70 disabled:cursor-not-allowed form-field mt-6"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}