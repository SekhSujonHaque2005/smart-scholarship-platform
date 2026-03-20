"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OrbitalLoader } from "@/components/ui/orbital-loader";
import { usePathname, useSearchParams } from "next/navigation";

const GlobalLoaderContext = createContext({
  setIsLoading: (loading: boolean) => {},
});

export const useGlobalLoader = () => useContext(GlobalLoaderContext);

export function GlobalLoaderProvider({ children }: { children: React.ReactNode }) {
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Handle Initial Mount (Reload)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialMount(false);
    }, 1200); // Premium delay to show loader
    return () => clearTimeout(timer);
  }, []);

  // Handle Navigation Loading
  // Note: App Router navigation is usually fast, but we can trigger a brief loader
  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  const showLoader = isInitialMount || isNavigating;

  return (
    <GlobalLoaderContext.Provider value={{ setIsLoading: setIsNavigating }}>
      <AnimatePresence mode="wait">
        {showLoader && (
          <motion.div
            key="global-loader"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
          >
            <div className="relative">
              <OrbitalLoader 
                message={isInitialMount ? "Synchronizing Hub" : "Navigating"} 
                className="scale-125"
              />
              {/* Optional background aura */}
              <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full -z-10" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Render children directly to prevent height trapping or scroll conflicts */}
      {children}
    </GlobalLoaderContext.Provider>
  );
}
