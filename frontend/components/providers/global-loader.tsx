"use client";

import React, { useState, useEffect, createContext, useContext, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OrbitalLoader } from "@/components/ui/orbital-loader";
import { usePathname, useSearchParams } from "next/navigation";

const GlobalLoaderContext = createContext({
  setIsLoading: (loading: boolean) => {},
});

export const useGlobalLoader = () => useContext(GlobalLoaderContext);

function LoaderContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        setIsNavigating(true);
        const timer = setTimeout(() => {
            setIsNavigating(false);
        }, 600);
        return () => clearTimeout(timer);
    }, [pathname, searchParams]);

    return isNavigating ? (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black">
            <OrbitalLoader message="Loading Content" />
        </div>
    ) : null;
}

export function GlobalLoaderProvider({ children }: { children: React.ReactNode }) {
  const [isInitialMount, setIsInitialMount] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialMount(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <GlobalLoaderContext.Provider value={{ setIsLoading: () => {} }}>
      <AnimatePresence mode="wait">
        {isInitialMount && (
          <motion.div
            key="initial-mount-loader"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ 
                opacity: 0,
                transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
            }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
          >
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div className="h-full w-full grid grid-cols-12 divide-x divide-foreground" />
            </div>
            <OrbitalLoader message="Synchronizing Platform" />
            <div className="absolute bottom-12 left-12 opacity-20">
                <div className="text-[10px] font-mono tracking-[0.4em] uppercase">ScholarHub Interface v4.5</div>
            </div>
            <div className="absolute top-12 left-12 w-8 h-8 border-t border-l border-white/10" />
            <div className="absolute bottom-12 right-12 w-8 h-8 border-b border-r border-white/10" />
          </motion.div>
        )}
      </AnimatePresence>

      <Suspense fallback={null}>
        <LoaderContent />
      </Suspense>
      
      {children}
    </GlobalLoaderContext.Provider>
  );
}
