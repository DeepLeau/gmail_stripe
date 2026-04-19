import Image from 'next/image'
import { cn } from '@/lib/utils'

interface TestimonialCardProps {
  quote: string
  name: string
  role: string
  company?: string
  rating?: number
  avatarSrc?: string
  avatarInitials?: string
  className?: string
}

export function TestimonialCard({
  quote,
  name,
  role,
  company,
  rating = 5,
  avatarSrc,
  avatarInitials,
  className,
}: TestimonialCardProps) {
  return (
    <div className={cn('testimonial-card', className)}>
      {/* Glow layer */}
      <div className="testimonial-card__glow" />

      {/* Stars */}
      <div className="testimonial-stars">
        {Array.from({ length: rating }).map((_, i) => (
          <span key={i} className="testimonial-star">★</span>
        ))}
      </div>

      {/* Quote mark */}
      <div className="testimonial-card__quote">&ldquo;</div>

      {/* Text */}
      <p className="testimonial-card__text">{quote}</p>

      {/* Author */}
      <div className="testimonial-card__author">
        {avatarSrc ? (
          <Image
            src={avatarSrc}
            alt={name}
            width={38}
            height={38}
            className="testimonial-card__avatar"
          />
        ) : avatarInitials ? (
          <div
            className="testimonial-card__avatar"
            style={{
              display: 'grid',
              placeItems: 'center',
              fontSize: 12,
              fontWeight: 600,
              background: 'var(--accent-light)',
              color: 'var(--accent-secondary)',
              border: '1px solid rgba(99,102,241,0.2)',
            }}
          >
            {avatarInitials}
          </div>
        ) : null}
        <div>
          <p className="testimonial-card__name">{name}</p>
          <p className="testimonial-card__role">
            {role}
            {company && ` · ${company}`}
          </p>
        </div>
      </div>
    </div>
  )
}
