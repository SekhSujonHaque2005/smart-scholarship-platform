"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Home, ArrowLeft, Search, Map, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScholarHubLogo } from "@/components/ui/logo";

export default function NotFound() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for parallax
  const springConfig = { damping: 25, stiffness: 150 };
  const astronautX = useSpring(useMotionValue(0), springConfig);
  const astronautY = useSpring(useMotionValue(0), springConfig);
  const starsX = useSpring(useMotionValue(0), springConfig);
  const starsY = useSpring(useMotionValue(0), springConfig);

  const [stars, setStars] = useState<{width: string, height: string, top: string, left: string, delay: string, duration: string}[]>([]);

  useEffect(() => {
    // Generate stars only on the client to avoid hydration mismatch
    const generatedStars = [...Array(50)].map(() => ({
      width: Math.random() * 2 + 1 + 'px',
      height: Math.random() * 2 + 1 + 'px',
      top: Math.random() * 100 + '%',
      left: Math.random() * 100 + '%',
      delay: Math.random() * 5 + 's',
      duration: Math.random() * 3 + 2 + 's'
    }));
    setStars(generatedStars);

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      // Calculate normalized positions (-0.5 to 0.5)
      const x = (clientX / innerWidth) - 0.5;
      const y = (clientY / innerHeight) - 0.5;
      
      astronautX.set(x * 40); // Move astronaut more
      astronautY.set(y * 40);
      starsX.set(x * -20);    // Move stars in opposite direction
      starsY.set(y * -20);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [astronautX, astronautY, starsX, starsY]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#020617] flex flex-col p-6 text-white font-serif">
      {/* Branded Header - GitHub Style */}
      <header className="z-20 w-full max-w-7xl mx-auto flex items-center justify-between py-4">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <ScholarHubLogo className="w-8 h-8 md:w-10 md:h-10" mode="dark" />
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-400 font-sans">
          <Link href="/scholarships" className="hover:text-white transition-colors">Scholarships</Link>
          <Link href="/providers" className="hover:text-white transition-colors">Providers</Link>
          <Link href="/blogs" className="hover:text-white transition-colors">Blogs</Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* Background stars / ambient light */}
        <motion.div 
          style={{ x: starsX, y: starsY }}
          className="absolute inset-0 pointer-events-none opacity-40"
        >
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[150px]" />
          
          {/* Synthetic Stars */}
          {stars.map((star, i) => (
            <div 
              key={i}
              className="absolute bg-white rounded-full opacity-60 animate-pulse"
              style={{
                width: star.width,
                height: star.height,
                top: star.top,
                left: star.left,
                animationDelay: star.delay,
                animationDuration: star.duration
              }}
            />
          ))}
        </motion.div>

        <div className="z-10 container max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Side: Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 text-center lg:text-left space-y-8"
          >
            <div className="space-y-2">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium tracking-wider uppercase backdrop-blur-sm"
              >
                Error 404
              </motion.span>
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                Lost in Space?
              </h1>
              <p className="text-lg md:text-xl text-gray-400 max-w-md mx-auto lg:mx-0 font-sans leading-relaxed">
                The scholarship you're looking for has drifted into another galaxy. Let's get you back to mission control.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
              <Button asChild size="lg" className="h-12 px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-sans transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]">
                <Link href="/" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Return to Hub
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="h-12 px-8 rounded-full border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 font-sans">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Your Dashboard
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Right Side: Avatar / Illustration */}
          <motion.div 
            style={{ x: astronautX, y: astronautY }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex-1 relative aspect-square w-full max-w-[500px] flex items-center justify-center"
          >
            {/* Subtle Glow Ring */}
            <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-[60px] animate-pulse" />
            
            <div className="relative w-full h-full p-8">
              <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20 border border-white/10 backdrop-blur-sm bg-white/5">
                <Image 
                  src="/images/404-illustration.png" 
                  alt="Lost in space" 
                  fill 
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  priority
                />
              </div>
              
              {/* Floating UI Elements Overlay */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 p-4 rounded-2xl bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 shadow-xl"
              >
                <Search className="w-5 h-5 text-blue-400" />
              </motion.div>
              
              <motion.div 
                 animate={{ y: [0, 10, 0] }}
                 transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                 className="absolute -bottom-6 -left-6 p-4 rounded-2xl bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 shadow-xl flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Map className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Current Status</p>
                  <p className="text-xs font-semibold">Coordinates Lost</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Branded Footer - GitHub Style */}
      <footer className="z-20 w-full max-w-7xl mx-auto py-12 border-t border-white/5 mt-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col items-center md:items-start gap-4">
          <ScholarHubLogo className="w-8 h-8" mode="dark" />
          <p className="text-sm text-gray-500 font-sans text-center md:text-left max-w-xs leading-relaxed">
            India's smartest scholarship marketplace. Connecting ambitious students with verified institutional funding.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-sm font-sans">
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Platform</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/scholarships" className="hover:text-white transition-colors">Scholarships</Link></li>
              <li><Link href="/providers" className="hover:text-white transition-colors">Providers</Link></li>
              <li><Link href="/blogs" className="hover:text-white transition-colors">Blogs</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Verification</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors text-blue-400 flex items-center gap-1">Status <ExternalLink className="w-3 h-3" /></Link></li>
            </ul>
          </div>
          <div className="space-y-4 hidden md:block">
            <h4 className="text-white font-semibold">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="#" className="hover:text-white transition-colors">Privacy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
