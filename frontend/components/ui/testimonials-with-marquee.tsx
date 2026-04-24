'use client'

import { useEffect, useState } from 'react'
import { cn } from "@/lib/utils"
import { TestimonialCard } from "@/components/ui/testimonial-card"
import type { TestimonialAuthor } from "@/components/ui/testimonial-card"
import api from '@/app/lib/api'

// Random avatar pool for students
const AVATAR_POOL = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
]

interface BackendReview {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  student: { name: string }
  provider?: { orgName: string }
}

interface TestimonialsSectionProps {
  className?: string
}

export function TestimonialsSection({ className }: TestimonialsSectionProps) {
  const [testimonials, setTestimonials] = useState<Array<{
    author: TestimonialAuthor
    text: string
    rating: number
  }>>([])

  useEffect(() => {
    api.get('/reviews/public')
      .then((res) => {
        const reviews: BackendReview[] = res.data.reviews || []
        const mapped = reviews
          .filter((r) => r.comment && r.comment.trim().length > 0)
          .map((r, i) => ({
            author: {
              name: r.student.name,
              handle: `@verify_${r.id.slice(-4)}`,
              avatar: AVATAR_POOL[i % AVATAR_POOL.length],
              providerName: r.provider?.orgName
            },
            text: r.comment as string,
            rating: r.rating
          }))
        setTestimonials(mapped)
      })
      .catch((err) => {
        console.error('Failed to fetch reviews:', err)
      })
  }, [])

  if (testimonials.length === 0) return null

  return (
    <section className={cn(
      "bg-transparent text-foreground overflow-hidden",
      "py-24 sm:py-32",
      className
    )}>
      <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-12 sm:gap-20">
        <div className="flex flex-col items-center gap-4 px-4 text-center">
           <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-500 text-[10px] font-mono font-black uppercase tracking-[0.2em] mb-4">
             <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
             Consensus & Social Proof
           </div>
          <h2 className="text-5xl md:text-7xl font-sans font-black tracking-tighter text-foreground leading-[0.9] uppercase">
            Wall <span className="text-blue-500">of Love</span>
          </h2>
          <p className="text-sm max-w-[600px] font-mono font-bold text-muted-foreground uppercase tracking-widest leading-relaxed mt-4">
            Real-time feedback from the student node network regarding scholarship provider prestige.
          </p>
        </div>

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <div className="group flex overflow-hidden p-2 [--gap:1.5rem] [gap:var(--gap)] flex-row [--duration:60s]">
            <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row hover:[animation-play-state:paused]">
              {[...Array(3)].map((_, setIndex) => (
                testimonials.map((testimonial, i) => (
                  <TestimonialCard 
                    key={`${setIndex}-${i}`}
                    {...testimonial}
                  />
                ))
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background to-transparent z-10" />
        </div>
      </div>
    </section>
  )
}
