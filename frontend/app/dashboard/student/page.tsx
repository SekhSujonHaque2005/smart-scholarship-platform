'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { useAuthStore } from '@/app/store/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StudentDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.dashboard-card',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out' }
      );
      gsap.fromTo(
        '.dashboard-header',
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 dashboard-header">
        <div>
          <h1 className="text-3xl font-bold text-white">🎓 ScholarHub</h1>
          <p className="text-slate-400 mt-1">Welcome back, {user?.email}!</p>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-800"
        >
          Logout
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-slate-800 border-slate-700 dashboard-card">
          <CardHeader>
            <CardTitle className="text-slate-400 text-sm font-medium">
              Total Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-white">0</p>
            <p className="text-slate-500 text-sm mt-1">Get started today</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700 dashboard-card">
          <CardHeader>
            <CardTitle className="text-slate-400 text-sm font-medium">
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-yellow-400">0</p>
            <p className="text-slate-500 text-sm mt-1">Awaiting response</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700 dashboard-card">
          <CardHeader>
            <CardTitle className="text-slate-400 text-sm font-medium">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-400">0</p>
            <p className="text-slate-500 text-sm mt-1">Scholarships won</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700 dashboard-card">
          <CardHeader>
            <CardTitle className="text-white">🔍 Find Scholarships</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 mb-4">
              Browse hundreds of verified scholarships matching your profile.
            </p>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => router.push('/scholarships')}
            >
              Browse Scholarships
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700 dashboard-card">
          <CardHeader>
            <CardTitle className="text-white">📋 My Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 mb-4">
              Track the status of all your scholarship applications.
            </p>
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={() => router.push('/applications')}
            >
              View Applications
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}