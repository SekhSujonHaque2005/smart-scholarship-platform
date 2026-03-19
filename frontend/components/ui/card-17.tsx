// components/ui/card-17.tsx
'use client';

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

// Define the props for the FeatureCard component
export interface FeatureCardProps {
  title: string;
  tagline: string;
  description: string;
  Icon: LucideIcon;
  accent: string;
  glowColor: string;
  iconColor: string;
  imageUrl: string;
  index: number;
  total: number;
  className?: string;
}

// The main FeatureCard component with 3D tilt effect
export const FeatureCard = ({
  title,
  tagline,
  description,
  Icon,
  accent,
  glowColor,
  iconColor,
  imageUrl,
  index,
  total,
  className,
}: FeatureCardProps) => {
  // Framer Motion hooks for creating the 3D tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  // Create transforms for rotation based on mouse position
  const rotateX = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    ["8deg", "-8deg"]
  );
  const rotateY = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    ["-8deg", "8deg"]
  );

  // Handle mouse movement over the card
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  // Reset the tilt effect when the mouse leaves
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className={cn(
        "relative w-full h-[420px] md:h-[380px] rounded-2xl",
        "shadow-lg transition-shadow duration-300 hover:shadow-2xl",
        "cursor-default",
        className
      )}
    >
      <div
        style={{
          transform: "translateZ(50px)",
          transformStyle: "preserve-3d",
          backgroundImage: `url(${imageUrl})`,
        }}
        className="absolute inset-0 grid place-content-end rounded-2xl bg-cover bg-center shadow-lg overflow-hidden"
      >
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
        
        {/* Accent glow */}
        <div
          className="absolute inset-0 rounded-2xl opacity-30 mix-blend-overlay"
          style={{
            background: `radial-gradient(ellipse at bottom left, ${glowColor}, transparent 70%)`,
          }}
        />

        {/* Content */}
        <div 
          style={{ transform: "translateZ(40px)" }}
          className="relative z-10 p-6 md:p-8 text-white flex flex-col justify-end h-full"
        >
          {/* Top: Tag + Counter */}
          <div className="flex items-center justify-between mb-auto pt-2">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl bg-gradient-to-br ${accent} shadow-lg`}>
                <Icon className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-[0.15em] text-white/70`}>
                {tagline}
              </span>
            </div>
            <span className="text-[11px] font-medium tracking-widest text-white/40">
              {String(index + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
            </span>
          </div>

          {/* Bottom: Title + Description */}
          <div>
            <h3 className="text-2xl md:text-3xl font-bold mb-2 leading-tight tracking-tight">
              {title}
            </h3>
            <p className="text-sm md:text-[15px] text-white/70 leading-relaxed line-clamp-3 max-w-md">
              {description}
            </p>
          </div>

          {/* Bottom accent line */}
          <div className={`mt-5 h-0.5 w-16 rounded-full bg-gradient-to-r ${accent} opacity-60`} />
        </div>
      </div>
    </motion.div>
  );
};
