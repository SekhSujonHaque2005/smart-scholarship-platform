"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface OrbitalLoaderProps {
  message?: string
  className?: string
}

export function OrbitalLoader({
  message,
  className,
}: OrbitalLoaderProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="relative w-32 h-32 flex items-center justify-center">
        
        {/* Outer Orbital Ring - Slow */}
        <motion.div
          className="absolute inset-0 border border-border/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary" />
        </motion.div>

        {/* Middle Orbital Ring - Reverse */}
        <motion.div
          className="absolute inset-4 border border-border/10 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        >
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1 h-1 bg-foreground" />
        </motion.div>

        {/* Inner Orbital Ring - Fast */}
        <motion.div
          className="absolute inset-8 border border-primary/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
            <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-primary/60" />
        </motion.div>

        {/* Central Core Pulse */}
        <motion.div 
            className="w-4 h-4 bg-primary relative z-10"
            animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8],
                rotate: [45, 225, 405]
            }}
            transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        />

        {/* Crosshair Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <div className="w-full h-px bg-foreground" />
            <div className="h-full w-px bg-foreground absolute" />
        </div>
      </div>
      
      {message && (
        <div className="mt-12 space-y-3 flex flex-col items-center">
            <motion.div 
                initial={{ opacity: 0, letterSpacing: "0.2em" }}
                animate={{ opacity: 1, letterSpacing: "0.4em" }}
                className="text-[10px] font-black uppercase text-primary italic"
            >
                {message}
            </motion.div>
            <div className="w-48 h-px bg-border relative overflow-hidden">
                <motion.div 
                    className="absolute inset-0 bg-primary w-1/3"
                    animate={{ x: ["-100%", "300%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>
        </div>
      )}
    </div>
  )
}
