'use client'

import { useEffect, useState } from 'react'
import { cn } from "@/lib/utils"
import { TestimonialCard } from "@/components/ui/testimonial-card"
import type { TestimonialAuthor } from "@/components/ui/testimonial-card"
import api from '@/app/lib/api'

// Random avatar pool for students who don't have profile pictures
const AVATAR_POOL = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
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

function getStars(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}

export function TestimonialsSection({ className }: TestimonialsSectionProps) {
  const [testimonials, setTestimonials] = useState<Array<{
    author: TestimonialAuthor
    text: string
  }>>([])

  useEffect(() => {
    // Fetch all reviews from the public endpoint
    // We'll use a general fetch since there's no single "all public reviews" endpoint
    // We'll add one below
    api.get('/reviews/public')
      .then((res) => {
        const reviews: BackendReview[] = res.data.reviews || []
        const mapped = reviews
          .filter((r) => r.comment && r.comment.trim().length > 0)
          .map((r, i) => ({
            author: {
              name: r.student.name,
              handle: `${getStars(r.rating)}`,
              avatar: AVATAR_POOL[i % AVATAR_POOL.length],
            },
            text: r.comment as string,
          }))
        setTestimonials(mapped)
      })
      .catch((err) => {
        console.error('Failed to fetch reviews:', err)
      })
  }, [])

  // Don't render the section if there are no reviews
  if (testimonials.length === 0) return null

  return (
    <section className={cn(
      "bg-transparent text-foreground",
      "py-12 sm:py-24 md:py-32 px-0",
      className
    )}>
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-4 text-center sm:gap-16">
        <div className="flex flex-col items-center gap-4 px-4 sm:gap-8">
          <h2 className="max-w-[720px] text-3xl font-semibold leading-tight sm:text-5xl sm:leading-tight text-slate-900 dark:text-white">
            What students are saying
          </h2>
          <p className="text-md max-w-[600px] font-medium text-muted-foreground sm:text-xl">
            Real reviews from students who found scholarships through ScholarHub
          </p>
        </div>

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <div className="group flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)] flex-row [--duration:40s]">
            <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused]">
              {[...Array(4)].map((_, setIndex) => (
                testimonials.map((testimonial, i) => (
                  <TestimonialCard 
                    key={`${setIndex}-${i}`}
                    {...testimonial}
                  />
                ))
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r from-background sm:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-background sm:block" />
        </div>
      </div>
    </section>
  )
}
