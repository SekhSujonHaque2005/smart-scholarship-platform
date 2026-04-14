import { cn } from "@/lib/utils"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

export interface TestimonialAuthor {
  name: string
  handle: string
  avatar: string
  providerName?: string
}

export interface TestimonialCardProps {
  author: TestimonialAuthor
  text: string
  rating?: number
  href?: string
  className?: string
}

export function TestimonialCard({ 
  author,
  text,
  rating = 5,
  href,
  className
}: TestimonialCardProps) {
  const Card = href ? 'a' : 'div'
  
  return (
    <Card
      {...(href ? { href } : {})}
      className={cn(
        "flex flex-col rounded-[32px] border border-border/60",
        "bg-white/[0.01] backdrop-blur-xl",
        "p-6 text-start",
        "hover:border-blue-500/30 hover:bg-white/[0.03]",
        "w-[320px] shrink-0",
        "transition-all duration-500 group/card",
        "shadow-xl shadow-black/5",
        className
      )}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <Avatar className="h-12 w-12 rounded-2xl border border-border/40 overflow-hidden ring-2 ring-blue-500/10 transition-all group-hover/card:scale-110">
            <AvatarImage src={author.avatar} alt={author.name} className="object-cover" />
          </Avatar>
        </div>
        <div className="flex flex-col items-start min-w-0">
          <h3 className="text-sm font-black tracking-tight text-foreground truncate w-full">
            {author.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
             <div className="flex text-amber-500">
               {[...Array(5)].map((_, i) => (
                 <Star key={i} size={10} fill={i < rating ? "currentColor" : "none"} className={i < rating ? "drop-shadow-[0_0_4px_rgba(245,158,11,0.4)]" : "text-muted-foreground/20"} />
               ))}
             </div>
             <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest font-bold">
               {author.handle}
             </span>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <span className="absolute -top-4 -left-2 text-4xl text-blue-500/10 font-serif">"</span>
        <p className="text-[13px] leading-relaxed text-muted-foreground font-medium italic">
          {text}
        </p>
      </div>

      {author.providerName && (
        <div className="mt-6 pt-4 border-t border-dashed border-border/40 flex items-center justify-between">
           <span className="text-[9px] font-mono text-blue-500 uppercase tracking-widest font-black">
             {author.providerName}
           </span>
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      )}
    </Card>
  )
}
