'use client';

import React from 'react';

interface SpotlightBackgroundProps {
    children: React.ReactNode;
    gridSize?: number;
    spotlightSize?: number;
    spotlightColor?: string; // Color in "r, g, b" format
}

/**
 * Pure-CSS spotlight background.
 * - No GSAP, no mousemove listeners, no JS animation loops.
 * - Uses a CSS @keyframes animation on the glow blob and mask position.
 * - GPU-compositable: only transform and opacity are animated.
 */
export function SpotlightBackground({
    children,
    gridSize = 64,
    spotlightSize = 440,
    spotlightColor = "56, 189, 248",
}: SpotlightBackgroundProps) {
    return (
        <div
            className="relative min-h-screen"
            style={{
                backgroundColor: 'var(--spot-bg)',
                color: 'var(--spot-text)',
            }}
        >
            {/* ── Layer 1: Always-dim base grid ─────────────────────────── */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 z-0"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, var(--spot-dim-grid) 1px, transparent 1px),
                        linear-gradient(to bottom, var(--spot-dim-grid) 1px, transparent 1px)
                    `,
                    backgroundSize: `${gridSize}px ${gridSize}px`,
                }}
            />

            {/* ── Layer 2: Bright grid, revealed by CSS animated spotlight mask ── */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 z-0 animate-[spotlightDrift_25s_ease-in-out_infinite]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, var(--spot-bright-grid) 1px, transparent 1px),
                        linear-gradient(to bottom, var(--spot-bright-grid) 1px, transparent 1px)
                    `,
                    backgroundSize: `${gridSize}px ${gridSize}px`,
                    maskImage: `radial-gradient(circle ${spotlightSize}px at var(--spot-x, 15%) var(--spot-y, 85%), black 0%, transparent 100%)`,
                    WebkitMaskImage: `radial-gradient(circle ${spotlightSize}px at var(--spot-x, 15%) var(--spot-y, 85%), black 0%, transparent 100%)`,
                }}
            />

            {/* ── Layer 3: Soft ambient glow blob (CSS animated, no JS) ──── */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed z-0 animate-[spotlightDrift_25s_ease-in-out_infinite]"
                style={{
                    width: `${spotlightSize * 1.6}px`,
                    height: `${spotlightSize * 1.6}px`,
                    borderRadius: '50%',
                    left: 'var(--spot-x, 15%)',
                    top: 'var(--spot-y, 85%)',
                    transform: 'translate(-50%, -50%)',
                    background: `radial-gradient(circle at center, rgba(${spotlightColor}, 0.12) 0%, rgba(${spotlightColor}, 0.04) 45%, transparent 75%)`,
                    filter: 'blur(20px)',
                    willChange: 'left, top',
                }}
            />

            {/* ── Layer 4: Edge vignette for depth ──────────────────────── */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 z-0"
                style={{
                    background: `radial-gradient(ellipse 120% 100% at 50% 50%, transparent 40%, var(--spot-vignette) 100%)`,
                }}
            />

            {/* ── Content ───────────────────────────────────────────────── */}
            <div className="relative z-10">{children}</div>
        </div>
    );
}
