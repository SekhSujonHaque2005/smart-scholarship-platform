"use client"

import React from "react"
import { cva } from "class-variance-authority"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

const orbitalLoaderVariants = cva("flex gap-2 items-center justify-center", {
  variants: {
    messagePlacement: {
      bottom: "flex-col",
      top: "flex-col-reverse",
      right: "flex-row",
      left: "flex-row-reverse",
    },
  },
  defaultVariants: {
    messagePlacement: "bottom",
  },
})

export interface OrbitalLoaderProps {
  message?: string
  /**
   * Position of the message relative to the spinner.
   * @default bottom
   */
  messagePlacement?: "top" | "bottom" | "left" | "right"
}

export function OrbitalLoader({
  className,
  message,
  messagePlacement,
  ...props
}: React.ComponentProps<"div"> & OrbitalLoaderProps) {
  return (
    <div className={cn(orbitalLoaderVariants({ messagePlacement }))}>
      <div className={cn("relative w-20 h-20", className)} {...props}>
        {/* Outer Ring */}
        <motion.div
          className="absolute inset-0 border-[3px] border-transparent border-t-blue-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        {/* Middle Ring */}
        <motion.div
          className="absolute inset-2.5 border-[3px] border-transparent border-t-cyan-400 rounded-full"
          animate={{ rotate: -360 }}
          transition={{
            duration: 1.8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        {/* Inner Ring */}
        <motion.div
          className="absolute inset-5 border-[3px] border-transparent border-t-indigo-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 0.9,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        
        {/* Center Glow */}
        <div className="absolute inset-7 bg-blue-500/10 blur-xl rounded-full" />
      </div>
      
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-4"
        >
          {message}
        </motion.div>
      )}
    </div>
  )
}
